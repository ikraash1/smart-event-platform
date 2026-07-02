# EventSphere Database

## Database: MongoDB
**Connection:** `mongodb://127.0.0.1:27017/smart_event_platform`

---

## Collections

| Collection | Purpose |
|---|---|
| `users` | All user accounts (Admin, Organizer, Attendee) |
| `events` | Published and draft event listings |
| `bookings` | Seat reservations per user per event |
| `tickets` | One QR ticket per booked seat |
| `attendances` | Check-in audit log (one record per scanned ticket) |
| `analytics` | Pre-aggregated daily snapshots (for future scheduled jobs) |

---

## Running the Seed Script

The seed script lives at `src/backend/seed/seedData.js` and is invoked via npm scripts
defined in `src/backend/package.json`.

```bash
cd src/backend
npm install
npm run seed            # Populate 4 demo users + 4 sample events
npm run seed:destroy    # Wipe all collections (destructive!)
```

**Seeded demo accounts (password: password123):**

| Role | Email |
|---|---|
| Admin | admin@example.com |
| Organizer | organizer@example.com |
| Attendee | attendee@example.com |
| Attendee | fatima@example.com |

---

## Key Design Decisions

**Denormalized counters:** `Event.seatsBooked` and `Event.viewCount` are maintained
alongside writes rather than recomputed from aggregation on every request. This gives
O(1) seat-availability checks on the booking hot path.

**HMAC-signed tickets:** Each ticket code is `uuid_v4 + '.' + HMAC_SHA256(uuid_v4, JWT_SECRET).slice(0,16)`.
The signature is verified in memory before any database lookup, preventing ticket forgery
and filtering invalid QR codes cheaply.

**Soft deletion:** Bookings and tickets use a `status` field (`confirmed`/`cancelled`,
`valid`/`used`/`cancelled`) instead of hard deletes, preserving an audit trail.

**Cascading deletes:** Deleting an event triggers controller-level deletion of all its
bookings, tickets, and attendance records (application-layer referential integrity).

---

## Indexes

| Collection | Index |
|---|---|
| `events` | Text index on `(title, description, tags)` for full-text search |
| `events` | `category`, `startDate`, `organizer`, `status` — for filter queries |
| `users` | `email` (unique), `role` |
| `tickets` | `ticketCode` (unique), `event`, `user` |
| `attendances` | `event`, unique on `ticket` |
| `analytics` | Compound unique on `(event, date)` |

---

## Schema Reference

See [`../docs/DATABASE_SCHEMA.md`](../docs/DATABASE_SCHEMA.md) for the complete field-by-field
schema documentation for all six collections.
