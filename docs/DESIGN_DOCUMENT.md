# Design Document
## EventSphere — Smart Event Management Platform

## 1. Architectural Overview

EventSphere follows a classic three-tier architecture with an MVC-inspired backend:

```
React SPA (View)  ⇄  Express REST API (Controller)  ⇄  MongoDB (Model)
```

The frontend is a single-page React application that communicates with the backend exclusively
through a versionless JSON REST API under `/api`. The backend follows an **MVC-style layout**
adapted for Express:

- **Models** (`backend/models/`) — Mongoose schemas; the only layer that talks to MongoDB.
- **Controllers** (`backend/controllers/`) — business logic; receive a validated `req`, talk to
  models and utilities, and shape the JSON response. No controller talks to `req`/`res` from
  another controller, and no model is queried directly from a route file.
- **Routes** (`backend/routes/`) — thin mapping of HTTP verb + path → middleware chain →
  controller function. No business logic lives here.
- **Middleware** (`backend/middleware/`) — cross-cutting concerns: JWT verification, role
  authorization, request validation, rate limiting, centralized error handling.
- **Utilities** (`backend/utils/`) — pure, reusable logic with no Express dependency: JWT
  signing, QR code generation/verification, the recommendation engine, and the analytics engine.
  Keeping these framework-agnostic makes them independently unit-testable.

This separation means, for example, that the recommendation algorithm in
`utils/recommendationEngine.js` could be extracted into its own microservice later without
touching a single controller — it only depends on Mongoose models, not on Express.

## 2. Key Design Decisions

### 2.1 Why a locally-computed "AI" layer instead of an external API?
The project requirements explicitly allow "free AI APIs... otherwise implement the logic
locally." Free-tier external AI APIs introduce network latency, rate limits, and an external
dependency that can break a local demo/grading environment. Implementing the recommendation and
analytics logic as transparent, deterministic algorithms over the platform's own data:

- keeps the entire system runnable fully offline once MongoDB is seeded,
- produces explainable scores (each recommendation ships with its sub-scores — see below),
  which is valuable for a software-engineering deliverable where "how does it work" matters as
  much as "does it work,"
- avoids API keys, billing, and external rate limits entirely.

### 2.2 QR Ticket Security Model
Rather than storing a database ID directly inside the QR code (which would let anyone forge a
ticket by guessing/incrementing IDs), each ticket code is:

```
ticketCode = <uuid_v4> + "." + HMAC_SHA256(uuid_v4, JWT_SECRET).slice(0, 16)
```

On scan, the server **first** recomputes the HMAC from the UUID portion and compares it to the
signature portion — entirely in memory, with no database round-trip — before ever querying the
`tickets` collection. A code that fails this check is rejected immediately as "invalid or
tampered," which also cheaply filters out garbage/non-ticket QR codes scanned by mistake. Only a
code that passes the signature check proceeds to a database lookup, status check
(`valid`/`used`/`cancelled`), and ownership check (does the scanning organizer own this event?).

### 2.3 Seat-capacity consistency
`Event.seatsBooked` is a denormalized counter updated transactionally alongside booking
creation/cancellation within the same controller function (`bookingController.js`). This avoids
an aggregation query (`SUM(quantity) over bookings where event = X`) on every single booking
attempt, which matters because seat-availability checks happen on the hot path of the booking
flow. The trade-off — keeping a counter in sync — is mitigated by funnelling all booking
creation/cancellation through exactly two controller functions, so there is only one place in the
codebase that mutates this field.

### 2.4 Role enforcement in two layers
Roles are enforced both in the React router (`ProtectedRoute` with `allowedRoles`) and, more
importantly, server-side in Express middleware (`authorize(...)`). The frontend check exists
purely for UX (don't show an Admin link to an Attendee); it is never trusted as the actual
security boundary. Every state-changing or sensitive-read endpoint re-derives the user's role
from the database on each request via `protect` + `authorize`, so a forged or stale client-side
role claim cannot grant unauthorized access.

## 3. AI Recommendation Engine

Implemented in `backend/utils/recommendationEngine.js`. For each candidate event (published,
not yet started, not already booked by this user), four signals are computed and combined:

| Signal | Weight | What it measures |
|---|---|---|
| Interest match | 0.35 | Overlap between the user's stated `interests` and the event's category + tags |
| History match | 0.30 | How often the user has booked this event's category before (a simple collaborative-style signal derived from their own booking history) |
| Popularity | 0.25 | Normalized seats-booked and view-count, so trending events surface even with no personalization data |
| Recency/fit | 0.10 | Slight boost for events starting soon (≤7 days), so the list doesn't only surface distant events |

```
score = 0.35·interest + 0.30·history + 0.25·popularity + 0.10·recency
```

Each component is normalized to `[0, 1]` before weighting, so the final score is also bounded to
`[0, 1]` and can be shown to the user as a percentage match (see the "For You" page). If a brand
new user has no interests and no booking history, all personalized scores collapse toward the
popularity/recency terms — and if the resulting list is still empty (e.g. zero published events
match), the API transparently falls back to `getTrendingEvents()`, flagged via
`fallback: "trending"` in the response so the frontend can label it honestly rather than implying
false personalization.

## 4. AI-Driven Analytics Engine

Implemented in `backend/utils/analyticsEngine.js` using MongoDB aggregation pipelines exclusively
— no data is pulled into Node.js and reduced in application code, which keeps the dashboards fast
even as collections grow:

- **Platform/organizer overview** — parallelized `countDocuments` + `$group/$sum` aggregations
  for totals (users, events, bookings, revenue, attendance).
- **Popular events** — simple sort on the denormalized `seatsBooked`/`viewCount` fields (no
  aggregation needed, by design — see §2.3).
- **Bookings by category** — `$lookup` from `events` to `bookings`, filtered to `confirmed`
  status, then `$group` by category.
- **Attendance / booking trend** — `$match` on a rolling date window, `$group` by
  `$dateToString`-truncated day, producing a time series consumed directly by Recharts.
- **User engagement score** — bookings count and total spend per user, each normalized against
  the maximum observed value, combined as `0.6·bookingsNorm + 0.4·spendNorm`, scaled to 0–100.
  This is presented to Admins as an "AI engagement score" — a transparent, explainable heuristic
  rather than a black-box model, which is appropriate for the scale and grading context of this
  project.

## 5. Frontend Design

- **State management**: React Context (`AuthContext`) for session state; component-local state
  + direct API calls elsewhere. No global state library is introduced — the app's data needs
  don't justify the added complexity for this scope.
- **Routing**: `react-router-dom` v6 with a single `ProtectedRoute` wrapper handling both
  "must be logged in" and "must have role X" cases.
- **Styling**: Tailwind CSS with a small custom design-token extension (`brand` indigo,
  `accent` orange, `ink` near-black) rather than default Tailwind grays/blues, so the UI reads as
  a deliberate SaaS product rather than an unstyled scaffold.
- **Charts**: Recharts, chosen over Chart.js for its idiomatic React component API (no manual
  canvas lifecycle management).
- **QR scanning**: `html5-qrcode`, which wraps the browser's `getUserMedia` camera API and handles
  decode-loop management; the app debounces repeated reads of the same code within a 3-second
  window so a held-up ticket doesn't fire dozens of duplicate verify requests.

## 6. Security Design Summary

| Concern | Mechanism |
|---|---|
| Password storage | bcrypt hash, `select:false` field, never serialized |
| Authentication | Stateless JWT, `Bearer` header, 7-day expiry (configurable) |
| Authorization | Server-side role re-check on every protected route |
| Ticket forgery | HMAC-signed ticket codes, verified before any DB lookup |
| Brute force | Stricter rate limit on `/auth/*` (20 req / 15 min) vs general API (300 req / 15 min) |
| NoSQL injection | `express-mongo-sanitize` strips `$`/`.` operators from user input |
| XSS / header hardening | `helmet` default policy set |
| CORS | Restricted to the configured `CLIENT_URL` origin only |
| Input validation | `express-validator` chains on every mutating endpoint |
| Error leakage | Centralized handler hides stack traces when `NODE_ENV=production` |

## 7. Trade-offs & Future Work

- Analytics are computed live via aggregation rather than served from the pre-aggregated
  `analytics` collection; this is appropriate at classroom/demo data volumes but a production
  deployment would want a scheduled job populating daily `Analytics` snapshots for O(1) dashboard
  reads at scale.
- No payment gateway is integrated; `Booking.paymentMethod` and `Event.price` model the data shape
  a real integration (e.g. Stripe) would slot into.
- The recommendation engine is content/popularity-based rather than a trained ML model — a
  deliberate choice for transparency, zero infra cost, and explainability (see §3), but a natural
  extension point if the project were to grow into a thesis-level system.
