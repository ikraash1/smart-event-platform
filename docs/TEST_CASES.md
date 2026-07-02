# Test Cases
## EventSphere — Smart Event Management Platform

Manual functional test case matrix. Each test case lists preconditions, steps, and expected
result. IDs are grouped by module for traceability back to the Functional Requirements in
`SRS.md`.

---

## Module: Authentication

| ID | Title | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| TC-AUTH-01 | Register as Attendee | No account with this email exists | Submit register form with valid name/email/password, role = attendee | Account created, JWT returned, redirected to home, logged in as Attendee |
| TC-AUTH-02 | Register as Organizer | Same as above | Submit with role = organizer | Account created with role `organizer` |
| TC-AUTH-03 | Register with duplicate email | An account with this email exists | Submit register form with the same email | 400 error: "An account with this email already exists" |
| TC-AUTH-04 | Register with short password | — | Submit password "abc" (5 chars) | 400 validation error: password must be ≥ 6 characters |
| TC-AUTH-05 | Attempt to register as Admin | — | Submit register form with `role: "admin"` directly via API | Backend forces role to `attendee` regardless of payload |
| TC-AUTH-06 | Login with correct credentials | Registered account exists | Submit correct email/password | 200, JWT returned, `lastLogin` updated |
| TC-AUTH-07 | Login with wrong password | Registered account exists | Submit wrong password | 401 "Invalid email or password" |
| TC-AUTH-08 | Login to deactivated account | Admin has deactivated this user | Submit correct credentials | 403 "This account has been deactivated..." |
| TC-AUTH-09 | Access protected route without token | Logged out | Navigate to `/profile` | Redirected to `/login` |
| TC-AUTH-10 | Expired/invalid JWT | Token manually corrupted in localStorage | Make any authenticated request | 401, frontend auto-clears token and redirects to login |

## Module: Profile

| ID | Title | Steps | Expected Result |
|---|---|---|---|
| TC-PROF-01 | Update name & bio | Edit profile fields, submit | 200, updated values persisted and reflected in UI |
| TC-PROF-02 | Update interests (Attendee) | Toggle interest chips, save | Interests array updated; affects future recommendations |
| TC-PROF-03 | Change password | Enter new password, save | New password works on next login; old password rejected |

## Module: Event Management

| ID | Title | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| TC-EVT-01 | Create event (Organizer) | Logged in as Organizer | Fill event form with valid data, submit | Event created with `status: published`, visible in listings |
| TC-EVT-02 | Create event with missing required field | Logged in as Organizer | Omit `title`, submit | 400 validation error listing the missing field |
| TC-EVT-03 | Attendee cannot create event | Logged in as Attendee | Navigate to `/events/create` | Redirected to `/unauthorized`; API also returns 403 if called directly |
| TC-EVT-04 | Edit own event | Organizer owns event X | Change price/capacity, save | Event updated; `seatsBooked`/`organizer` fields cannot be altered via this endpoint |
| TC-EVT-05 | Edit another organizer's event | Logged in as Organizer B, event owned by Organizer A | Attempt PUT on event A's ID | 403 "Not authorized to update this event" |
| TC-EVT-06 | Admin can edit any event | Logged in as Admin | Edit an event owned by another organizer | Update succeeds |
| TC-EVT-07 | Delete event cascades | Event has bookings/tickets | Delete the event | Event, its bookings, tickets, and attendance records are all removed |
| TC-EVT-08 | Search events by keyword | Several events exist | Type a keyword matching one event's title | Only matching event(s) returned |
| TC-EVT-09 | Filter by category | — | Select "Music" category filter | Only Music-category events shown |
| TC-EVT-10 | Filter upcoming only | Mix of past/future events seeded | Enable "Upcoming events only" | Only events with `startDate >= now` shown |
| TC-EVT-11 | Pagination | More than 12 published events exist | Navigate to page 2 | Correct next page of results returned |
| TC-EVT-12 | View increments view count | — | Open an event details page twice | `viewCount` increases by 1 each view |

## Module: Booking & Ticketing

| ID | Title | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| TC-BK-01 | Book available event | Event has seats available, user logged in as Attendee | Select quantity 1, click Book | Booking confirmed, 1 QR ticket generated and displayed |
| TC-BK-02 | Book multiple seats | Event has ≥3 seats available | Select quantity 3, book | 1 booking record, 3 distinct Ticket documents with seat numbers 1-3 |
| TC-BK-03 | Book when seats insufficient | Event has 2 seats left | Request quantity 5 | 400 "Only 2 seat(s) remaining for this event" |
| TC-BK-04 | Book a sold-out event | `seatsBooked == capacity` | Attempt booking | UI shows "Sold out" button disabled; API rejects if forced |
| TC-BK-05 | Book a past event | `startDate` is in the past | Attempt booking | 400 "Cannot book an event that has already started" |
| TC-BK-06 | Book unpublished event | Event status = draft | Attempt booking via API directly | 400 "This event is not open for booking" |
| TC-BK-07 | View my bookings | User has ≥1 booking | Navigate to "My Bookings" | All bookings listed with correct status/reference/amount |
| TC-BK-08 | Cancel a booking | Booking status = confirmed | Click Cancel, confirm | Booking → `cancelled`, tickets → `cancelled`, event `seatsBooked` decremented |
| TC-BK-09 | Cancel another user's booking | Logged in as different Attendee | Attempt cancel via API with another user's booking ID | 403 "Not authorized to cancel this booking" |
| TC-BK-10 | View my tickets | User has confirmed booking(s) | Navigate to "My Tickets" | QR codes rendered for each valid ticket |

## Module: QR Verification / Entry

| ID | Title | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| TC-QR-01 | Scan a valid, unused ticket | Ticket status = valid, scanning organizer owns the event | Scan QR at `/scan` | "Entry Granted", ticket → `used`, Attendance record created |
| TC-QR-02 | Re-scan an already-used ticket | Ticket status = used | Scan the same QR again | "Entry Denied — already used at [timestamp]" |
| TC-QR-03 | Scan a cancelled ticket | Booking was cancelled | Scan QR | "Entry Denied — this ticket has been cancelled" |
| TC-QR-04 | Scan a tampered/forged code | Manually edit the signature portion of a code | Submit to `/tickets/verify` | "Invalid or tampered ticket code" without a DB lookup |
| TC-QR-05 | Organizer scans a ticket for an event they don't own | Organizer B scans Organizer A's event ticket | Submit to verify endpoint | 403 "Not authorized to verify tickets for this event" |
| TC-QR-06 | Manual check-in fallback | Ticket status = valid | POST `/tickets/:id/manual-checkin` | Ticket → `used`, Attendance record with `method: manual` |
| TC-QR-07 | View event attendee list | Organizer owns the event | Navigate to event's Attendees page | Each booking shown with per-seat check-in status |

## Module: Dashboards & Analytics

| ID | Title | Steps | Expected Result |
|---|---|---|---|
| TC-DASH-01 | Organizer overview totals | Load Organizer Dashboard | Stat cards show correct event/booking/revenue/attendance totals scoped only to that organizer |
| TC-DASH-02 | Admin overview totals | Load Admin Dashboard | Stat cards show platform-wide totals across all organizers |
| TC-DASH-03 | Booking trend chart | Bookings exist across several days | Open trend chart | Line chart renders one point per day with correct counts |
| TC-DASH-04 | Category breakdown chart | Multiple categories have bookings | Open pie chart | Slice sizes proportional to confirmed bookings per category |
| TC-DASH-05 | Popular events chart | — | Open bar chart | Events ordered by `seatsBooked` descending |
| TC-DASH-06 | User engagement table (Admin) | Several users have bookings | Open Admin Dashboard | Users ranked by computed engagement score 0-100 |
| TC-DASH-07 | Admin deactivates a user | — | Click deactivate toggle on a user row | User's `isActive` → false; that user can no longer log in |
| TC-DASH-08 | Admin deletes a user | — | Click delete, confirm | User removed; attempting to delete own account is blocked with 400 |

## Module: Recommendations

| ID | Title | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| TC-REC-01 | New user with no history | Newly registered, no bookings | Open "For You" page | Falls back to trending events; `fallback: "trending"` |
| TC-REC-02 | User with matching interests | User interests include "Music"; a Music event exists, unbooked | Open "For You" page | Music event ranks highly with a visible match percentage |
| TC-REC-03 | Already-booked events excluded | User has booked Event X | Open "For You" page | Event X does not appear in the recommendation list |
| TC-REC-04 | Trending endpoint is public | Logged out | `GET /recommendations/trending` | 200 response without requiring authentication |

## Module: Security & Validation

| ID | Title | Steps | Expected Result |
|---|---|---|---|
| TC-SEC-01 | SQL/NoSQL injection attempt | Submit `{"email": {"$gt": ""}, "password": "x"}` to login | Sanitized before reaching Mongoose; login fails normally, no injection |
| TC-SEC-02 | Rate limit on login | Submit 21+ rapid login attempts | 21st+ request returns 429 "Too many auth attempts" |
| TC-SEC-03 | Missing auth header | Call a protected endpoint with no `Authorization` header | 401 "Not authorized, no token provided" |
| TC-SEC-04 | Wrong role on protected endpoint | Attendee calls `POST /events` | 403 "Role 'attendee' is not permitted to perform this action" |
| TC-SEC-05 | XSS payload in event description | Submit `<script>alert(1)</script>` as description | Stored as plain text; React escapes it on render (no execution) |

## Module: Responsiveness / UI

| ID | Title | Steps | Expected Result |
|---|---|---|---|
| TC-UI-01 | Mobile navigation | Resize to ≤375px width | Hamburger menu opens/closes correctly, all role-aware links present |
| TC-UI-02 | Event grid responsiveness | Resize from desktop to mobile | Grid reflows from 3 → 2 → 1 columns |
| TC-UI-03 | QR scanner camera permission denied | Deny camera permission in browser | Scanner page shows a clear error instead of a blank/broken state |
