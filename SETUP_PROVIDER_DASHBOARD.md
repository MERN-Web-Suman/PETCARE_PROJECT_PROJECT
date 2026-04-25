Provider Dashboard — Local Setup

Overview
- Provider Dashboard is a separate frontend app located at `provider-dashboard/`.
- It connects to the API server (default http://localhost:5000) and listens to Socket.IO events for real-time updates.

Prerequisites
- Node.js 18+ and npm
- MongoDB running (server connects via MONGO_URI)

Env variables (provider-dashboard)
- Create a file `provider-dashboard/.env` with the following values:

VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_URL=http://localhost:5000

If you prefer different ports (example: provider-dashboard on 5174), set:

VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_URL=http://localhost:5000

Run locally (provider-dashboard)
```bash
cd provider-dashboard
npm install
npm run dev
```

- By default Vite will serve on http://localhost:5173. The app stores a demo token in `localStorage` for quick login.

Server (API) — Local Setup
- Server is in the `server/` folder and serves the REST API and Socket.IO.

Env variables (server)
- Create `server/.env` with at minimum:

PORT=5000
MONGO_URI=mongodb://localhost:27017/petcare
JWT_SECRET=your_jwt_secret
CLOUDINARY_URL=... (if using uploads)

Run server
```bash
cd server
npm install
npm run dev
```

Notes
- Socket.IO: server binds socket.io on the same port as the API (default 5000). Provider Dashboard connects to `VITE_API_URL`.
- Provider API routes are under `/api/provider` and require an Authorization header `Bearer <token>`; the token payload must include a `role` value of `provider` or `admin` for protected routes.
- If you change ports, update `VITE_API_BASE_URL` and `VITE_API_URL` accordingly.

Quick test
1. Start MongoDB, start server, and start provider-dashboard.
2. Open the main frontend (root app) and book an appointment; the server will create the appointment and emit `appointment-created`.
3. Open Provider Dashboard, log in with provider demo credentials, and you should see the appointment appear in the `Vet Clinic` management list.

Troubleshooting
- CORS errors: ensure server CORS allows the front-end origin or set `origin: "*"` in server socket config for local dev.
- JWT issues: use a JWT signed with `JWT_SECRET` and with a payload containing `id` and `role`.

Contact
- For further changes, update API base URL in `provider-dashboard/.env` and server `.env`.
