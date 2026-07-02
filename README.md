<div align="center">

# 🎫 EventSphere
### Smart Event Management Platform

**Discover · Host · Verify · Analyse**

![React](https://img.shields.io/badge/React-18.3-6366f1?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-47A248?style=for-the-badge&logo=mongodb)
![Express](https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express)
![JWT](https://img.shields.io/badge/JWT-Auth-F97316?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

*A full-stack MERN application for creating, discovering, booking, and managing events — with QR-code ticketing, role-based dashboards, and AI-powered recommendations.*

</div>

---

## 📌 Project Description

EventSphere is a Smart Event Management Platform built as a university Software Engineering project. It solves the fragmented, error-prone workflow that event organizers face when using spreadsheets for registrations, generic form builders for sign-ups, manually distributed PDF tickets, and physical guest lists for entry verification.

The platform provides a single, integrated system that:
- Lets **Organizers** publish events, manage capacity, and scan attendees at the door
- Lets **Attendees** discover events, book seats instantly, and show a QR code at the entrance
- Gives **Admins** complete platform oversight with live analytics and user management
- Uses a **locally-computed AI engine** to recommend events based on interests, history, and platform popularity — no paid external API needed

---

## ✨ Features

### 🔐 Authentication & Security
- User registration and login with **JWT authentication**
- **bcrypt password hashing** (cost factor 10) — plaintext passwords never stored
- **Role-based access control** (Admin, Organizer, Attendee) enforced at both UI and API layers
- **HMAC-SHA256 signed QR tickets** — forgery-resistant without a database lookup
- Helmet security headers, CORS, rate limiting, NoSQL injection sanitization, input validation

### 📅 Event Management
- Create, edit, delete, and publish events with full metadata
- 10 event categories (Technology, Business, Music, Sports, Education, Health, Art & Culture, Networking, Food & Drink, Other)
- Full-text search across title, description, and tags
- Filter by category, price range, upcoming-only; sort by date, popularity, or views
- Online or in-person events with venue/meeting-link support
- Paginated event listings (12 per page)

### 🎫 Ticket Booking
- Book one or more seats with real-time capacity enforcement
- Automatic QR ticket generation per seat (signed PNG, stored as base64)
- View booking history and cancel bookings (releases seats, voids tickets)

### 📷 QR Verification & Check-in
- Camera-based QR scanning page using `html5-qrcode`
- Instant verification: valid → entry granted, invalid/used/cancelled → entry denied with reason
- HMAC signature verified in memory before any database lookup
- Manual check-in fallback for damaged tickets
- Full attendance audit log per event

### 📊 Analytics Dashboards
- **Organizer Dashboard**: booking trend, revenue trend, category breakdown, popular events (scoped to own events)
- **Admin Dashboard**: platform-wide versions of all above, plus top-engaged-users table
- All charts powered by **Recharts** (line, bar, donut)
- Analytics computed via **MongoDB aggregation pipelines** — no in-memory reduction

### 🤖 AI Recommendations
- Personalized event suggestions for each Attendee
- **4-signal scoring**: Interest match (35%) + History match (30%) + Popularity (25%) + Recency (10%)
- Each recommendation shows a "match %" badge and explains the sub-scores
- Graceful fallback to trending events for new users with no history
- No paid external AI API required — fully local and explainable

---

## 🧱 Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React.js | 18.3 |
| Styling | Tailwind CSS | 3.4 |
| Build tool | Vite | 5.4 |
| Routing | React Router DOM | 6.26 |
| Charts | Recharts | 2.12 |
| QR Scanning | html5-qrcode | 2.3 |
| Backend | Node.js + Express.js | 18 / 4.19 |
| Database | MongoDB + Mongoose | 6 / 8.6 |
| Authentication | JWT (jsonwebtoken) | 9.0 |
| Password hashing | bcryptjs | 2.4 |
| QR Generation | qrcode | 1.5 |
| Security | Helmet, CORS, express-rate-limit, express-mongo-sanitize | latest |
| Validation | express-validator | 7.2 |

---

## 📁 Repository Structure

```
smart-event-platform/
│
├── 📄 README.md                     ← This file
│
├── 📁 src/                          ← Full application source code
│   ├── 📁 frontend/                 ← React SPA (Vite + Tailwind)
│   │   ├── src/
│   │   │   ├── api/                 Axios client with JWT interceptor
│   │   │   ├── context/             AuthContext (global auth state)
│   │   │   ├── components/
│   │   │   │   ├── layout/          Navbar, Footer, ProtectedRoute
│   │   │   │   ├── events/          EventCard, EventFilters, EventForm
│   │   │   │   ├── tickets/         TicketCard, QRScanner
│   │   │   │   ├── dashboard/       StatCard, TrendLineChart, CategoryPieChart
│   │   │   │   └── common/          Loader, Modal, EmptyState
│   │   │   ├── pages/               10 route-level pages
│   │   │   └── App.jsx              Router + layout wrapper
│   │   ├── package.json
│   │   └── .env.example
│   │
│   └── 📁 backend/                  ← Express REST API (MVC)
│       ├── config/                  DB connection + constants
│       ├── models/                  6 Mongoose schemas
│       ├── controllers/             Business logic (8 controllers)
│       ├── routes/                  8 RESTful route files
│       ├── middleware/              auth, role, validate, rate-limit, errors
│       ├── utils/                   JWT, QR, recommendation engine, analytics engine
│       ├── seed/                    Demo data seed script
│       ├── server.js                Express entry point
│       ├── package.json
│       └── .env.example
│
├── 📁 backend/                      ← Backend reference copy (same as src/backend)
├── 📁 database/                     ← Schema docs + seed instructions
│   ├── README.md
│   └── schema.json
│
├── 📁 docs/                         ← Full software engineering documentation
│   ├── SRS.md                       Software Requirements Specification
│   ├── DESIGN_DOCUMENT.md           Architecture & design decisions
│   ├── DATABASE_SCHEMA.md           All 6 collections documented
│   ├── UML_DIAGRAMS.md              Use Case, Activity, Sequence, Class, ER, DFD
│   ├── API_DOCUMENTATION.md         All REST endpoints
│   ├── TEST_CASES.md                59 manual test cases
│   ├── USER_MANUAL.md               End-user guide (all 3 roles)
│   ├── INSTALLATION_GUIDE.md        Step-by-step setup guide
│   └── GITHUB_SETUP.md              How to publish to GitHub
│
├── 📁 screenshots/                  ← Application screenshots (add yours here)
│   └── README.md
│
├── 📁 report/                       ← Final project report
│   └── README.md
│
└── 📁 testing/                      ← Testing documentation and logs
    └── README.md
```

---

## 🚀 Installation Steps

### Prerequisites
- **Node.js 18+** — download from [nodejs.org](https://nodejs.org) (LTS version)
- **MongoDB 6+** — download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- **Git** — download from [git-scm.com](https://git-scm.com)

### Step 1 — Clone the repository
```bash
git clone https://github.com/<your-username>/smart-event-platform.git
cd smart-event-platform
```

### Step 2 — Backend setup
```bash
cd src/backend
npm install
cp .env.example .env
```
Open `.env` and update `JWT_SECRET` with any long random string. The other defaults work for local development.

```bash
npm run seed      # Optional: populate demo users and events
npm run dev       # Start API server on http://localhost:5000
```

### Step 3 — Frontend setup (new terminal)
```bash
cd src/frontend
npm install
cp .env.example .env
npm run dev       # Start Vite dev server on http://localhost:5173
```

### Step 4 — Open the app
Navigate to **http://localhost:5173** in your browser.

### Demo accounts (after seed script)

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | password123 |
| Organizer | organizer@example.com | password123 |
| Attendee | attendee@example.com | password123 |

> **Full detailed instructions** (with screenshots and troubleshooting) are in [`docs/INSTALLATION_GUIDE.md`](docs/INSTALLATION_GUIDE.md)

---

## 📸 Screenshots

*Screenshots are in the [`screenshots/`](screenshots/) folder. Add your own after running the application locally — see [`screenshots/README.md`](screenshots/README.md) for the recommended file names and tips.*

---

## 🤖 AI Tools Used

| Tool | How It Was Used |
|---|---|
| **Claude (Anthropic)** | Primary development assistant — used to generate code scaffolding, debug logic, review architecture decisions, write documentation, and produce all project deliverables. The recommendation engine algorithm and analytics formulas were designed collaboratively and implemented with Claude's assistance. |
| **GitHub Copilot** | Inline code suggestions and autocomplete during active coding sessions in VS Code. |

> All AI-generated code was reviewed, understood, and validated by the development team before inclusion. AI tools were used as productivity multipliers — not as a replacement for understanding the codebase.

---

## 📚 Documentation

| Document | Description |
|---|---|
| [SRS.md](docs/SRS.md) | Problem statement, objectives, scope, stakeholders, functional & non-functional requirements |
| [DESIGN_DOCUMENT.md](docs/DESIGN_DOCUMENT.md) | Architecture, security design, AI engine details, frontend structure |
| [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | All 6 MongoDB collections with field types, constraints, and indexes |
| [UML_DIAGRAMS.md](docs/UML_DIAGRAMS.md) | Use Case, Activity (×2), Sequence (×2), Class, ER, DFD, Component diagrams in Mermaid |
| [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) | Every REST endpoint with request/response examples |
| [TEST_CASES.md](docs/TEST_CASES.md) | 59 manual test cases across 8 modules |
| [USER_MANUAL.md](docs/USER_MANUAL.md) | End-user guide for Attendees, Organizers, and Admins |
| [INSTALLATION_GUIDE.md](docs/INSTALLATION_GUIDE.md) | Full step-by-step setup with troubleshooting |
| [GITHUB_SETUP.md](docs/GITHUB_SETUP.md) | How to push this project to GitHub |

---

## 🔐 Security Highlights

- Passwords hashed with **bcrypt** — never stored or logged in plaintext
- **JWT** stateless auth with role claims re-verified from the database on every request
- **HMAC-SHA256 signed QR ticket codes** — forgery is detected in memory before any DB query
- `helmet` sets HTTP security headers; `cors` restricts to configured frontend origin
- `express-rate-limit` applies stricter limits on auth endpoints (20 req/15 min)
- `express-mongo-sanitize` strips `$`-prefixed NoSQL injection operators from all input
- `express-validator` validates all mutating endpoints server-side

---

## 📄 License

MIT License — free to use for academic or portfolio purposes. See [LICENSE](LICENSE).

---

<div align="center">
Built with ❤️ using the MERN Stack · University Software Engineering Project · 2026
</div>
