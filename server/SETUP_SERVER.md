Server — Local Setup

Prerequisites
- Node.js 18+ and npm
- MongoDB running locally or Atlas

Env variables
- Copy `server/.env.example` to `server/.env` and update values.

Key variables in `server/.env`:
- `MONGO_URI` — MongoDB connection string
- `PORT` — port to run server (default 5000)
- `JWT_SECRET` — secret used to sign JWT tokens
- `CLIENT_URL` — frontend origin for CORS

Run server
```bash
cd server
npm install
npm run dev
```

APIs of interest
- Appointments: `POST /api/appointments` (create), `GET /api/appointments` (list)
- Provider endpoints (protected): `GET /api/provider/appointments`, `PUT /api/provider/appointments/:id`, `GET /api/provider/stats`
- Products: `GET /api/products`, `POST /api/products` (provider), `PUT /api/products/:id` (provider), `DELETE /api/products/:id` (provider)
- Adoptions: `GET /api/adoptions`, `PUT /api/adoptions/:id` (provider)

Socket.IO
- Server exposes Socket.IO on the same port as the API. Events emitted:
  - `appointment-created` (payload: appointment)
  - `appointment-updated` (payload: appointment)
  - `adoption-created`, `adoption-updated`
  - `inventory-created`, `inventory-updated`, `inventory-deleted`

Testing
- Use tools like Postman or curl to call API endpoints. For protected provider routes, include header `Authorization: Bearer <token>` where the token payload contains `role: 'provider'` or `role: 'admin'`.
