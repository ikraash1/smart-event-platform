# Database Schema
## EventSphere — Smart Event Management Platform

**Database:** MongoDB (document store) accessed via Mongoose ODM
**Default database name:** `smart_event_platform`

This document describes the six core collections, their fields, validation rules, indexes, and
relationships. Schema source of truth lives in `backend/models/*.js`.

---

## 1. `users`

| Field | Type | Constraints |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `name` | String | required, max 100 chars |
| `email` | String | required, unique, lowercase |
| `password` | String | required, min 6 chars, bcrypt-hashed, `select: false` (never returned by default) |
| `role` | String enum | `admin` \| `organizer` \| `attendee` (default: `attendee`) |
| `avatar` | String | optional URL |
| `phone` | String | optional |
| `bio` | String | optional, max 500 chars |
| `interests` | String[] | used by the recommendation engine |
| `isActive` | Boolean | default `true`; deactivated users cannot log in |
| `lastLogin` | Date | updated on each successful login |
| `createdAt` / `updatedAt` | Date | automatic timestamps |

**Indexes:** `email` (unique, implicit from schema), `role`

**Notable behavior:** a `pre('save')` hook hashes `password` with bcrypt whenever it is set or
changed. `toJSON` strips `password` and `__v` from any serialized response.

---

## 2. `events`

| Field | Type | Constraints |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `title` | String | required, max 150 chars |
| `description` | String | required, max 5000 chars |
| `category` | String enum | Technology, Business, Music, Sports, Education, Health, Art & Culture, Networking, Food & Drink, Other |
| `tags` | String[] | free-form tags used for search & recommendations |
| `organizer` | ObjectId → `users` | required |
| `venue` | String | required (ignored for online events) |
| `address` | String | optional |
| `isOnline` | Boolean | default `false` |
| `onlineLink` | String | required only when `isOnline` is true (enforced at the application layer) |
| `startDate` / `endDate` | Date | required |
| `coverImage` | String | optional URL |
| `price` | Number | ≥ 0, default 0 (0 = free event) |
| `capacity` | Number | required, ≥ 1 |
| `seatsBooked` | Number | default 0, incremented/decremented by booking/cancel flows |
| `status` | String enum | `draft` \| `published` \| `cancelled` \| `completed` |
| `viewCount` | Number | incremented on every `GET /events/:id` |
| `createdAt` / `updatedAt` | Date | automatic timestamps |

**Virtual field:** `seatsAvailable` = `capacity - seatsBooked` (computed, not stored)

**Indexes:** text index on `title`, `description`, `tags` (full-text search); `category`;
`startDate`; `organizer`; `status`

---

## 3. `bookings`

| Field | Type | Constraints |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `user` | ObjectId → `users` | required |
| `event` | ObjectId → `events` | required |
| `quantity` | Number | required, ≥ 1 |
| `totalAmount` | Number | required, ≥ 0 (= `event.price * quantity` at booking time) |
| `status` | String enum | `confirmed` \| `cancelled` \| `pending` |
| `paymentMethod` | String enum | `free` \| `card` \| `bank_transfer` \| `cash` |
| `bookingReference` | String | required, unique, format `BK-XXXXXXXX` |
| `createdAt` / `updatedAt` | Date | automatic timestamps |

**Indexes:** `user`, `event`, `status`

---

## 4. `tickets`

| Field | Type | Constraints |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `booking` | ObjectId → `bookings` | required |
| `event` | ObjectId → `events` | required |
| `user` | ObjectId → `users` | required |
| `ticketCode` | String | required, unique — format `{uuid}.{hmac-signature}` |
| `qrCodeImage` | String | required — base64 data URL of the QR image encoding `ticketCode` |
| `seatNumber` | Number | sequential per booking |
| `status` | String enum | `valid` \| `used` \| `cancelled` |
| `usedAt` | Date | set when the ticket is scanned/checked in |
| `createdAt` / `updatedAt` | Date | automatic timestamps |

**Indexes:** `ticketCode` (unique, implicit), `event`, `user`

**Security note:** `ticketCode` is generated as `uuidv4() + '.' + HMAC-SHA256(uuid, JWT_SECRET).slice(0,16)`.
Verification re-derives the HMAC and rejects any code whose signature doesn't match — this
prevents attendees from fabricating valid-looking ticket codes.

---

## 5. `attendances`

| Field | Type | Constraints |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `event` | ObjectId → `events` | required |
| `ticket` | ObjectId → `tickets` | required, unique (one attendance record per ticket) |
| `user` | ObjectId → `users` | required (the attendee) |
| `verifiedBy` | ObjectId → `users` | required (the organizer/admin who scanned) |
| `checkedInAt` | Date | default `now` |
| `method` | String enum | `qr_scan` \| `manual` |
| `createdAt` / `updatedAt` | Date | automatic timestamps |

**Indexes:** `event`, unique index on `ticket`

---

## 6. `analyticses` (collection name `analytics`)

Pre-aggregated daily snapshots per event — designed to support fast historical trend charts
without re-scanning the full bookings/attendance history on every dashboard load. (The current
dashboard implementation computes trends live via aggregation pipelines for accuracy in a
classroom-scale dataset; this collection is provided as the schema-level hook for future
scheduled snapshotting at production scale.)

| Field | Type | Constraints |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `event` | ObjectId → `events` | required |
| `date` | Date | required |
| `bookingsCount` | Number | default 0 |
| `ticketsSold` | Number | default 0 |
| `revenue` | Number | default 0 |
| `attendanceCount` | Number | default 0 |
| `views` | Number | default 0 |

**Indexes:** compound unique index on `(event, date)` — one snapshot per event per day

---

## 7. Relationship Summary

```
User (1) ───organizes──→ (N) Event
User (1) ───makes──────→ (N) Booking
User (1) ───owns───────→ (N) Ticket
User (1) ───verifies───→ (N) Attendance   (as staff)
Event (1) ──receives───→ (N) Booking
Event (1) ──issues─────→ (N) Ticket
Event (1) ──logs───────→ (N) Attendance
Event (1) ──snapshots──→ (N) Analytics
Booking (1) ─generates─→ (N) Ticket
Ticket (1) ──results in→ (0..1) Attendance
```

## 8. Design Notes

- **Denormalized counters** (`Event.seatsBooked`, `Event.viewCount`) trade a small amount of
  write complexity for fast reads on the highest-traffic pages (event listings, booking
  validation) — avoiding a `COUNT()`-style aggregation on every page view.
- **Referential integrity** is enforced at the application layer (Mongoose + controller logic)
  rather than database-level foreign keys, which is the standard MongoDB pattern. Deleting an
  event cascades to delete its bookings, tickets, and attendance records (see
  `eventController.deleteEvent`).
- **Soft deletion** is used for bookings/tickets (`status: 'cancelled'`) instead of hard deletes,
  preserving an audit trail.
