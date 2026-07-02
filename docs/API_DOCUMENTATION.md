# API Documentation
## EventSphere — Smart Event Management Platform

**Base URL:** `http://localhost:5000/api`
**Auth scheme:** `Authorization: Bearer <jwt>` header, required on all endpoints marked 🔒
**Response envelope:** every response is JSON with a top-level `success: boolean` field. Errors
follow `{ success: false, message: string, errors?: [...] }`.

---

## Auth

### `POST /auth/register`
Register a new Attendee or Organizer account. (Admin role cannot be self-registered.)

```json
// Request
{
  "name": "Ali Raza",
  "email": "ali@example.com",
  "password": "password123",
  "role": "attendee",
  "interests": ["Technology", "Music"]
}

// 201 Response
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": { "_id": "...", "name": "Ali Raza", "email": "ali@example.com", "role": "attendee", ... }
}
```

### `POST /auth/login`
```json
// Request
{ "email": "ali@example.com", "password": "password123" }

// 200 Response
{ "success": true, "token": "eyJhbGciOi...", "user": { ... } }
```

### `GET /auth/me` 🔒
Returns the currently authenticated user.

---

## Users

### `PUT /users/profile` 🔒
Update your own profile. Body may include any of: `name`, `phone`, `bio`, `avatar`, `interests`,
`password`.

### `GET /users` 🔒 _(Admin only)_
Query params: `role`, `search`, `page`, `limit`. Returns `{ users: [...], pagination: {...} }`.

### `GET /users/:id` 🔒 _(Admin only)_
### `PUT /users/:id` 🔒 _(Admin only)_
Body: `{ role?, isActive?, name? }` — used to promote/demote, activate/deactivate, or rename a user.

### `DELETE /users/:id` 🔒 _(Admin only)_
Cannot delete your own account.

---

## Events

### `GET /events`
Public. Query params:

| Param | Description |
|---|---|
| `search` | full-text search across title/description/tags |
| `category` | exact category match |
| `status` | defaults to `published` for general browsing |
| `organizer` | filter by organizer ID (used by organizer dashboards) |
| `upcoming` | `true` → only events starting in the future |
| `minPrice` / `maxPrice` | price range filter |
| `sortBy` / `order` | e.g. `sortBy=startDate&order=asc` |
| `page` / `limit` | pagination (default `limit=12`) |

```json
// 200 Response
{
  "success": true,
  "events": [ { "_id": "...", "title": "...", "organizer": { "name": "..." }, ... } ],
  "pagination": { "total": 42, "page": 1, "pages": 4 }
}
```

### `GET /events/categories`
Returns category names with published-event counts, for filter UIs.

### `GET /events/:id`
Public. Increments `viewCount`. Returns the event populated with organizer info.

### `POST /events` 🔒 _(Organizer, Admin)_
```json
{
  "title": "Karachi Tech Summit",
  "description": "...",
  "category": "Technology",
  "tags": ["AI", "Startups"],
  "venue": "Expo Centre Karachi",
  "startDate": "2026-08-10T09:00:00.000Z",
  "endDate": "2026-08-10T17:00:00.000Z",
  "price": 1500,
  "capacity": 200
}
```

### `PUT /events/:id` 🔒 _(owning Organizer or Admin)_
Same body shape as create; partial updates allowed. `seatsBooked`, `organizer`, and `viewCount`
cannot be set via this endpoint.

### `DELETE /events/:id` 🔒 _(owning Organizer or Admin)_
Cascades: deletes related Tickets, Attendance records, and Bookings.

### `GET /events/:id/attendees` 🔒 _(owning Organizer or Admin)_
Returns each confirmed booking with attendee info and per-seat check-in status.

---

## Bookings

### `POST /bookings` 🔒
```json
// Request
{ "eventId": "64f...", "quantity": 2, "paymentMethod": "card" }

// 201 Response
{
  "success": true,
  "booking": { "_id": "...", "bookingReference": "BK-AB12CD34", "totalAmount": 3000, ... },
  "tickets": [
    { "_id": "...", "ticketCode": "uuid.signature", "qrCodeImage": "data:image/png;base64,...", "seatNumber": 1 },
    { "_id": "...", "ticketCode": "uuid.signature", "qrCodeImage": "data:image/png;base64,...", "seatNumber": 2 }
  ]
}
```
Fails with 400 if the event isn't published, has already started, or has insufficient seats.

### `GET /bookings/my` 🔒
Returns the logged-in user's bookings, newest first.

### `GET /bookings/organizer` 🔒 _(Organizer, Admin)_
Returns all bookings across the logged-in organizer's events.

### `GET /bookings/:id` 🔒 _(owner or Admin)_
Returns a single booking plus its tickets.

### `PUT /bookings/:id/cancel` 🔒 _(owner or Admin)_
Cancels the booking, voids its tickets, and releases the seats back to the event.

---

## Tickets

### `GET /tickets/my` 🔒
All tickets owned by the logged-in user.

### `GET /tickets/:id` 🔒 _(ticket owner, event's organizer, or Admin)_

### `POST /tickets/verify` 🔒 _(Organizer, Admin)_
The core entry-scanning endpoint.
```json
// Request
{ "ticketCode": "3fae2e1c-....-9c21.a93f7c12ab44e0d1" }

// 200 Response (granted)
{ "success": true, "valid": true, "message": "Ticket verified - entry granted", "ticket": { ... } }

// 400 Response (denied)
{ "success": false, "valid": false, "message": "Ticket already used at 2026-06-20T18:32:00.000Z", "ticket": { ... } }
```

### `POST /tickets/:id/manual-checkin` 🔒 _(Organizer, Admin)_
Fallback check-in without scanning (e.g. damaged phone screen, offline ticket).

---

## Attendance

### `GET /attendance/event/:eventId` 🔒 _(owning Organizer or Admin)_
```json
{
  "success": true,
  "total": 87,
  "capacity": 200,
  "attendanceRate": 62.6,
  "records": [ { "user": {...}, "checkedInAt": "...", "verifiedBy": {...}, "method": "qr_scan" } ]
}
```

---

## Analytics

All endpoints below are 🔒. Organizer-scoped endpoints automatically restrict to the logged-in
organizer's own events; Admins may optionally pass `?organizerId=` to view a specific organizer's
data, or omit it for platform-wide figures.

| Endpoint | Access | Description |
|---|---|---|
| `GET /analytics/admin/overview` | Admin | Platform-wide totals: users, events, bookings, revenue, attendance |
| `GET /analytics/organizer/overview` | Organizer, Admin | Same totals scoped to one organizer |
| `GET /analytics/popular-events?limit=5` | Organizer, Admin | Top events by seats booked |
| `GET /analytics/bookings-by-category` | Organizer, Admin | Booking counts grouped by category |
| `GET /analytics/attendance-trend?days=14` | Organizer, Admin | Daily check-in counts |
| `GET /analytics/booking-trend?days=14` | Organizer, Admin | Daily booking counts + revenue |
| `GET /analytics/user-engagement?limit=10` | Admin | Top users ranked by an engagement score (0-100) |

---

## Recommendations

### `GET /recommendations/trending`
Public. Top events ranked by bookings + views — used as the homepage "Trending" rail and as the
fallback for brand-new accounts.

### `GET /recommendations` 🔒
```json
{
  "success": true,
  "fallback": null,
  "recommendations": [
    {
      "event": { "_id": "...", "title": "...", ... },
      "score": 0.7821,
      "reasons": { "interestScore": 1, "historyScore": 0.5, "popularityScore": 0.6, "recencyScore": 1 }
    }
  ]
}
```
See `DESIGN_DOCUMENT.md` for the scoring formula.

---

## Error Responses

| Status | Meaning |
|---|---|
| 400 | Validation error, business-rule violation (e.g. insufficient seats), or malformed request |
| 401 | Missing/invalid/expired JWT |
| 403 | Authenticated but not authorized for this role/resource |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |

```json
{
  "success": false,
  "message": "Only 3 seat(s) remaining for this event"
}
```
