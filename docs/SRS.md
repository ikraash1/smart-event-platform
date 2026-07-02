# Software Requirements Specification (SRS)
## EventSphere — Smart Event Management Platform

**Version:** 1.0
**Course context:** University Software Engineering Project

---

## 1. Problem Statement

Event organizers — from university societies to professional conference hosts — typically rely
on a patchwork of disconnected tools to run an event: spreadsheets for registrations, generic
form builders for sign-ups, manually printed or emailed tickets, and physical guest lists for
entry verification. This fragmented approach causes duplicate bookings, ticket fraud (tickets
forwarded or reused), slow and error-prone manual check-in queues, and no centralized way to
understand how an event (or a series of events) is performing.

There is a need for a single, integrated platform that lets organizers publish events, lets
attendees discover and book them, issues tamper-resistant digital tickets, verifies entry
in real time via QR scanning, and gives organizers and platform administrators meaningful,
data-driven insight into bookings, attendance, and engagement — without requiring any paid
third-party ticketing or analytics service.

## 2. Objectives

1. Provide secure, role-based account management for Admins, Organizers, and Attendees.
2. Allow Organizers to create, edit, publish, and delete events with rich metadata (category,
   pricing, capacity, venue/online link, schedule).
3. Allow Attendees to search and filter events, and book tickets with automatic seat-capacity
   enforcement.
4. Generate a unique, cryptographically signed QR code for every ticket, and provide a scanning
   workflow that verifies and checks in attendees at the venue in real time.
5. Maintain an auditable attendance record for every event.
6. Provide Organizer and Admin dashboards with live charts: booking trends, attendance trends,
   category breakdowns, and most-popular events.
7. Provide a locally-computed recommendation engine that personalizes event suggestions for each
   attendee based on interests, booking history, and platform-wide popularity.
8. Apply industry-standard security practices throughout (password hashing, JWT auth, rate
   limiting, input validation, security headers).
9. Document the system to the standard expected of a university software engineering deliverable
   (SRS, UML, ER diagrams, API docs, test cases, user manual).

## 3. Scope

### In Scope
- Web application (responsive — desktop and mobile browsers)
- Three user roles: Admin, Organizer, Attendee
- Full event lifecycle: create → publish → book → check-in → complete
- QR ticket generation and camera-based QR scanning for entry verification
- Booking management (create, view, cancel)
- Organizer-scoped and platform-wide (Admin) analytics dashboards
- A rule-based recommendation engine (no external paid AI service)
- RESTful JSON API consumed by a single-page React frontend

### Out of Scope (possible future work)
- Online payment gateway integration (the system models pricing and "payment method" but does
  not process real transactions)
- Native mobile apps (the responsive web app covers mobile browsers)
- Email/SMS notifications or email-based verification (explicitly excluded per project requirements)
- Multi-language / i18n support
- Seat-map / assigned-seating visualizations (the system tracks seat **counts**, not seat maps)

## 4. Functional Requirements

| ID | Requirement |
|----|--------------|
| FR-1 | The system shall allow a user to register with name, email, password, and a role (Attendee or Organizer). Admin accounts cannot be self-registered. |
| FR-2 | The system shall allow a registered user to log in and receive a JWT session token. |
| FR-3 | The system shall allow a user to view and update their own profile (name, phone, bio, interests, password). |
| FR-4 | The system shall allow an Organizer or Admin to create an event with title, description, category, tags, venue/online link, schedule, price, and capacity. |
| FR-5 | The system shall allow the event's owning Organizer (or an Admin) to edit or delete that event. |
| FR-6 | The system shall allow any visitor to search, filter (by category, price, upcoming-only), and paginate through published events. |
| FR-7 | The system shall allow an authenticated Attendee to book one or more seats for a published, not-yet-started event, rejecting the booking if requested seats exceed remaining capacity. |
| FR-8 | The system shall generate one cryptographically signed QR ticket per booked seat immediately upon successful booking. |
| FR-9 | The system shall allow an Attendee to view all of their bookings and cancel a confirmed booking, releasing the seats and voiding the associated tickets. |
| FR-10 | The system shall allow an Organizer/Admin to scan a ticket's QR code and verify it: reject codes with invalid signatures, already-used tickets, or cancelled tickets; otherwise mark the ticket "used" and record an Attendance entry. |
| FR-11 | The system shall allow an Organizer/Admin to manually check in an attendee as a fallback to scanning. |
| FR-12 | The system shall allow an Organizer/Admin to view the attendee list and check-in status for any event they own (or, for Admins, any event). |
| FR-13 | The system shall provide an Organizer dashboard showing: total events, confirmed bookings, revenue, attendance count, a booking/revenue trend chart, a category breakdown chart, and a most-popular-events chart — scoped to that organizer's own events. |
| FR-14 | The system shall provide an Admin dashboard showing the same analytics platform-wide, plus a list of top-engaged users and basic user account management (activate/deactivate/delete, role changes). |
| FR-15 | The system shall provide each Attendee a personalized list of recommended events, generated from their interests, prior bookings, and platform-wide popularity signals, falling back to trending events for new users. |
| FR-16 | The system shall restrict access to organizer/admin-only and admin-only functionality via both UI route guards and server-side role checks. |

## 5. Non-Functional Requirements

| ID | Category | Requirement |
|----|-----------|--------------|
| NFR-1 | Security | Passwords shall be hashed with bcrypt (cost factor ≥ 10) before storage; plaintext passwords are never logged or persisted. |
| NFR-2 | Security | All state-changing API endpoints shall require a valid JWT; role-restricted endpoints shall re-verify the user's role from the database on every request. |
| NFR-3 | Security | All API responses shall set standard security headers (via Helmet) and enforce CORS restricted to the configured frontend origin. |
| NFR-4 | Security | The API shall apply rate limiting (stricter on auth endpoints) to mitigate brute-force and abuse. |
| NFR-5 | Security | All user-supplied input shall be server-side validated and sanitized against NoSQL-injection operators before reaching the database layer. |
| NFR-6 | Usability | The UI shall be responsive and usable on screens from ~375px (mobile) to desktop widths. |
| NFR-7 | Performance | Event listing and analytics endpoints shall use database indexes and aggregation pipelines rather than client-side filtering of full collections. |
| NFR-8 | Reliability | All errors shall be caught centrally and returned as consistent, descriptive JSON error responses rather than raw stack traces (in production mode). |
| NFR-9 | Maintainability | The backend shall follow an MVC-inspired separation: models, controllers, routes, middleware, and utilities are kept in distinct, single-responsibility modules. |
| NFR-10 | Portability | The system shall run with only Node.js and a MongoDB connection string as external dependencies — no paid third-party services are required for core functionality. |
| NFR-11 | Auditability | Every successful ticket check-in shall be permanently recorded in an Attendance collection, including which staff account performed the verification. |

## 6. Use Cases (Summary)

A full Use Case diagram is provided in `UML_DIAGRAMS.md`. Key use cases:

| Use Case | Primary Actor | Goal |
|---|---|---|
| Register / Log in | Visitor | Obtain authenticated access |
| Manage Profile | Any authenticated user | Keep personal info & interests current |
| Create / Edit / Delete Event | Organizer, Admin | Publish and maintain event listings |
| Search & Filter Events | Visitor, Attendee | Discover relevant events |
| Book Event | Attendee | Reserve seat(s) and receive QR ticket(s) |
| Cancel Booking | Attendee | Release seats / void tickets |
| Scan & Verify Ticket | Organizer, Admin | Grant or deny entry at the venue |
| Manual Check-in | Organizer, Admin | Check in an attendee without scanning |
| View Attendee List | Organizer, Admin | Audit who has registered / checked in |
| View Organizer Dashboard | Organizer | Track own events' performance |
| View Admin Dashboard | Admin | Track platform-wide performance & manage users |
| View Recommendations | Attendee | Discover personalized events |
| Manage Users | Admin | Activate/deactivate, change roles, delete accounts |

## 7. Assumptions and Constraints

- A single MongoDB database instance is used; no sharding/replication is assumed for this
  academic deployment.
- No real payment processor is integrated; `paymentMethod` and `price` model a checkout flow
  without moving real money.
- The system assumes attendees scanning happens in person, with the verifying device's camera
  reading the attendee's displayed QR ticket.
- Email verification/notification is explicitly out of scope per project requirements.
