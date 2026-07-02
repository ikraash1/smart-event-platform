# User Manual
## EventSphere — Smart Event Management Platform

This guide explains how to use the platform from the perspective of each role: **Attendee**,
**Organizer**, and **Admin**.

---

## Getting Started

1. Open the application in your browser (default: `http://localhost:5173`).
2. Click **Get started** to create an account, or **Log in** if you already have one.
3. When registering, choose whether you're joining as an **Attendee** (discover & book events)
   or an **Organizer** (host & manage events). Admin accounts are created directly in the
   database/by another Admin and cannot be self-registered.

---

## For Attendees

### Discovering events
- Use **Explore Events** in the top navigation to browse all published events.
- Use the search bar to find events by keyword, the **category** dropdown to narrow by topic,
  and the **Upcoming only** / **Free only** checkboxes to refine further.
- Click any event card to see full details: description, date/time, venue or online link,
  remaining seats, and price.

### Booking a ticket
1. Open an event's details page.
2. Choose a quantity (limited to the number of seats still available).
3. Click **Book now**. If you're not logged in, you'll be asked to log in first, then returned
   to complete the booking.
4. On success, you'll immediately see your QR ticket(s) on screen, and they're also saved under
   **My Tickets** in the navigation bar.

### Managing your bookings
- **My Bookings** shows every booking you've made, with its reference code, quantity, amount, and
  status.
- You can **cancel** a confirmed booking at any time before the event — this releases your
  seat(s) back to the event and voids your QR ticket(s).

### Using your ticket at the venue
- Open **My Tickets**, find the relevant ticket, and show its QR code to the event staff member
  at the entrance. Each ticket can only be scanned once.

### Getting personalized recommendations
- The **For You** page (under your account menu) suggests events based on the interests you
  selected at signup/in your profile, your past bookings, and what's currently popular on the
  platform. Each suggestion shows a "match %" — click the card to see the full event.
- If you're new and haven't booked anything yet, this page shows platform-wide trending events
  instead, until it has enough signal to personalize.

### Updating your profile
- Go to **Profile** to update your name, phone, bio, interests, or password.

---

## For Organizers

Organizers have everything Attendees have, plus the ability to host events.

### Creating an event
1. Click **Create event** (from the navbar or your Organizer Dashboard).
2. Fill in the title, description, category, optional tags, schedule, venue (or mark it as an
   online event and provide a meeting link), price (set to 0 for a free event), and capacity.
3. Choose a status — **Published** makes it immediately visible and bookable; **Draft** keeps it
   hidden until you're ready.
4. Click **Create Event**.

### Editing or removing an event
- From your **Organizer Dashboard**, use the pencil icon to edit an event, or open the event and
  use **Edit event** / **Delete event**. Deleting an event also removes its bookings, tickets,
  and attendance history — this cannot be undone.

### Viewing and managing attendees
- Open any of your events and click **View attendees**, or use the people icon in your dashboard
  table. You'll see every attendee who booked, their booking reference, and a per-seat check-in
  badge (filled = checked in, outline = not yet checked in).

### Scanning tickets at the door
1. Go to **Scan** in the navigation bar.
2. Allow camera access when prompted.
3. Point the camera at an attendee's QR ticket (shown on their phone or printed).
4. The result appears instantly:
   - ✅ **Entry Granted** — the attendee is checked in and an attendance record is saved.
   - ❌ **Entry Denied** — shown for invalid, already-used, or cancelled tickets, with the
     specific reason.
5. If a ticket can't be scanned (e.g. a damaged screen), open the event's attendee list and use
   manual check-in instead.

### Tracking performance
Your **Organizer Dashboard** shows, scoped to your own events only:
- Total events, confirmed bookings, revenue, and check-ins (stat cards)
- A 14-day booking & revenue trend chart
- A bookings-by-category breakdown
- Your most popular events by seats booked
- A full table of your events with quick links to view, edit, or manage attendees

---

## For Admins

Admins have full visibility and control over the platform.

### Admin Dashboard
Navigate to **Admin** in the top bar to see:
- Platform-wide stat cards (total users, events, bookings, revenue, check-ins)
- A platform-wide attendance trend and category breakdown
- The most popular events across all organizers
- A **Top engaged users** table, ranked by an engagement score derived from each user's booking
  activity and spend
- A **Recent users** table with quick actions

### Managing users
From the Admin Dashboard's user table you can:
- **Activate/Deactivate** an account (the shield icon) — deactivated users cannot log in
- **Delete** an account permanently (you cannot delete your own account this way)

Admins can also act as an Organizer or Attendee anywhere in the app — for example, editing or
deleting any event regardless of who created it, or verifying tickets for any event at the door.

---

## Tips & Troubleshooting

- **"Invalid or tampered ticket code"** when scanning — the QR code wasn't generated by this
  platform, or has been altered. Ask the attendee to show their original ticket from **My
  Tickets**.
- **Camera doesn't start on the Scan page** — check that you've granted camera permission to the
  site in your browser settings, and that no other application/tab is currently using the camera.
- **Can't see an event you just created** — make sure its status is **Published**, not **Draft**.
- **Booking fails with "insufficient seats"** — someone else may have booked the remaining seats
  first; refresh the event page to see the current availability.
