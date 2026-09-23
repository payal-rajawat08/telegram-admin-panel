# Telegram Admin Panel — Frontend

Plain HTML/CSS/JS client for the Express backend in `../server`. No build step required.

## Run

1. Start the backend first (`cd ../server && npm install && npm run dev`), make sure `server/.env` has:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
2. Serve this folder as static files, e.g. `npx serve .` or open `index.html` directly in a browser.
3. Register an admin account on the Login screen, then log in.

The client talks to the backend at `http://localhost:5001/api` (see `js/api.js`, `API_BASE`).

## Pages

- **Login / Register** (`index.html`) — admin auth, JWT stored in `localStorage`.
- **Dashboard** — message KPIs, recent messages feed, quick reply box.
- **Messages** — full searchable table of messages synced from the Telegram group.
- **Settings** — logged-in account info and API connection details.
