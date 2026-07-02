# Installation Guide
## EventSphere — Smart Event Management Platform

This guide walks through setting up the project from a fresh clone to a fully running local
environment.

## 1. Prerequisites

| Tool | Minimum version | Check with |
|---|---|---|
| Node.js | 18.x | `node -v` |
| npm | 9.x (ships with Node 18) | `npm -v` |
| MongoDB | 6.x (local) or a MongoDB Atlas cluster | `mongod --version` |
| Git | any recent version | `git --version` |

If you don't want to install MongoDB locally, create a free cluster at
[MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and grab its connection string —
everything below works identically with `MONGO_URI` pointed at Atlas instead of `localhost`.

## 2. Get the code

```bash
git clone https://github.com/<your-username>/smart-event-platform.git
cd smart-event-platform
```
(If you received this project as a zip instead of cloning, just extract it and `cd` into the
folder.)

## 3. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and review the values:

```ini
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart_event_platform
JWT_SECRET=replace_this_with_a_long_random_secret_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
```

- If using MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string (it will look
  like `mongodb+srv://user:pass@cluster0.mongodb.net/smart_event_platform`).
- **Change `JWT_SECRET`** to a long, random string — never reuse the placeholder in a real
  deployment. You can generate one quickly with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```

Make sure MongoDB is running locally (skip if using Atlas):
```bash
# Linux/macOS, if installed via package manager:
sudo systemctl start mongod
# or, if you have mongod on your PATH:
mongod --dbpath /path/to/your/data/dir
```

Seed the database with demo accounts and sample events (optional but recommended for first run):
```bash
npm run seed
```
This prints the demo account emails and shared password (`password123`) to the console.

Start the backend:
```bash
npm run dev      # auto-restarts on file changes (uses nodemon)
# or
npm start         # plain node, for production-style runs
```
You should see:
```
MongoDB connected: 127.0.0.1/smart_event_platform
Server running in development mode on port 5000
```
Verify it's alive: open `http://localhost:5000/api/health` — you should get a JSON success
response.

## 4. Frontend setup

Open a **second terminal** (leave the backend running):

```bash
cd frontend
npm install
cp .env.example .env
```

Open `.env` and confirm it points at your backend:
```ini
VITE_API_URL=http://localhost:5000/api
```

Start the frontend dev server:
```bash
npm run dev
```
Vite will print a local URL, typically `http://localhost:5173`. Open it in your browser.

## 5. Log in

Use one of the seeded demo accounts (password for all: `password123`):

| Role | Email |
|---|---|
| Admin | admin@example.com |
| Organizer | organizer@example.com |
| Attendee | attendee@example.com |

Or register your own account from the **Get started** button.

## 6. Building for production

```bash
cd frontend
npm run build       # outputs static files to frontend/dist
```
Serve `frontend/dist` with any static file host (Nginx, Vercel, Netlify, or even
`express.static` from the backend itself). Point its API calls at your deployed backend URL via
`VITE_API_URL` before building.

The backend can be run with `npm start` behind any Node-compatible host (Render, Railway, a VPS,
etc.) — just set the same environment variables from `.env.example` in your hosting provider's
config and make sure `CLIENT_URL` matches your deployed frontend's origin (for CORS).

## 7. Common Issues

| Symptom | Likely Cause | Fix |
|---|---|---|
| `MongoDB connection error: connect ECONNREFUSED` | MongoDB isn't running, or wrong URI | Start `mongod`, or double-check `MONGO_URI` |
| Frontend shows network errors on every request | Backend isn't running, or `VITE_API_URL` is wrong | Confirm backend is up at the URL in frontend `.env` |
| Login works but every other request returns 401 | `JWT_SECRET` was changed after tokens were issued | Log out and log back in to get a fresh token |
| CORS error in browser console | `CLIENT_URL` in backend `.env` doesn't match the frontend's actual origin | Update `CLIENT_URL` and restart the backend |
| Camera doesn't open on the Scan page | Browser permissions, or running over plain HTTP on a non-localhost domain | Most browsers require HTTPS (or `localhost`) for camera access — this is fine for local dev but matters for deployment |
