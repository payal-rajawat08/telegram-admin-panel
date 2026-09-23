# Telegram Admin Panel — Frontend (React)

Vite + React client for the Express backend in `../server`.

## Run

1. Start the backend first:
   ```
   cd ../server
   npm install
   ```
   Create `server/.env` with:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`

   Then `npm run dev`.

2. Start the client:
   ```
   cd client
   npm install
   npm run dev
   ```
   Opens at `http://localhost:5173`.

3. Register an admin account on the login screen, then log in.

The client talks to the backend at `http://localhost:5001/api` (see `src/api.js`, `API_BASE`).

## Structure

- `src/context/AuthContext.jsx` — login/register/logout, JWT stored in `localStorage`.
- `src/context/MessagesContext.jsx` — polls `/api/telegram/messages` every 5s, exposes `sendReply`.
- `src/context/ToastContext.jsx` — global toast notifications.
- `src/pages/Login.jsx` — login/register.
- `src/pages/Dashboard.jsx` — message KPIs, recent messages feed, quick reply box.
- `src/pages/Messages.jsx` — full searchable table of synced messages.
- `src/pages/Settings.jsx` — logged-in account info and API connection details.
- `src/components/AppLayout.jsx` — sidebar + topbar shell.
