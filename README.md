# Simplified Discord Clone

A real-time messaging web app with React, Express, Socket.io, and MongoDB. It supports JWT auth, channel-based chat, and live message updates.

Built as the Summer Internship Assessment for **OppoTrain**.

## Live Demo

🔗 **[https://discord-clone-oppotrain.netlify.app/](https://discord-clone-oppotrain.netlify.app/)**

> **Heads up:** the backend runs on a free-tier host (Render) that spins down when idle. The first request after a quiet period can take up to **~50 seconds** to cold-start — please be patient on the first login or message send.

## Tech Stack

- Frontend: React, Axios, Socket.io Client, Pure CSS
- Backend: Express, Socket.io, MongoDB, Mongoose
- Auth: JWT + bcrypt

## Folder Structure

```
.
├── client/            # Vite React app
│   ├── src/
│   ├── index.html
│   └── vite.config.js
├── server/            # Express API + Socket.io
└── docker-compose.yml
```

## Environment Variables

Frontend (client/.env)

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Backend (server/.env)

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
```

## MongoDB Setup

1. Create a MongoDB Atlas cluster or run MongoDB locally.
2. Copy the connection string into `server/.env` as `MONGO_URI`.
3. Start the backend to auto-create collections and default channels.

## Install & Run (local)

From the repo root:

```
npm install --workspaces
```

Backend:

```
npm run dev:server
```

Frontend (in another terminal):

```
npm run dev:client
```

Open the app at `http://localhost:5173`.

## Docker (local)

1. Create `server/.env` with the values shown above.
2. Build and run:

```
docker compose up --build
```

The client will be on `http://localhost:5173` and the API on `http://localhost:5000`.

## API Endpoints

Auth

- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`
- GET `/api/auth/session`
- POST `/api/auth/logout`

Channels (JWT required)

- GET `/api/channels`
- POST `/api/channels`

Messages (JWT required)

- GET `/api/messages/:channelId`
- POST `/api/messages`

## Socket.io Flow

- Client connects with JWT in `auth.token`.
- Client emits `join_channel` with a channel ID.
- Server joins the Socket.io room for that channel.
- Client emits `send_message`.
- Server saves the message to MongoDB, then emits `receive_message` to the room.
- Client emits `leave_channel` when switching channels.

## Default Channels

On server start, a seed routine ensures the following channels exist:

- general
- gaming
- study
- music
- random

## Notes

- Passwords are hashed with bcrypt.
- Protected routes use JWT middleware.
- Only one active session is allowed per user. Logging in elsewhere revokes the previous session.
- UI uses a Discord-inspired dark theme with pure CSS.

## Production Deployment

The live demo is split across three services:

- **Client → Netlify** — Vite static build, base directory `client/`, publish `dist/`
- **Server → Render** — Node web service, root directory `server/`, `npm start`
- **Database → MongoDB Atlas** — free M0 cluster with `0.0.0.0/0` network access

Required production environment variables:

- **Render (server):** `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (the Netlify origin), `NODE_ENV=production`
- **Netlify (client):** `VITE_API_URL` (Render URL + `/api`), `VITE_SOCKET_URL` (Render URL)

After both are deployed, set `CLIENT_URL` on Render to the Netlify origin (no trailing slash) so CORS and Socket.io accept browser connections.

## AI Usage Disclosure

AI tools were used during the development process for guidance, debugging support, code improvement, and documentation assistance.

All implementation decisions, integration, testing, and final project delivery were completed by **Saif Khalifa**.

## License

This project is open source and released under the [MIT License](LICENSE). You are free to use, modify, and redistribute it with attribution.

## Author

**Saif Khalifa**

- GitHub: [@saifkhalifa](https://github.com/saifkhalifa)
- Portfolio: [saifkhalifa.github.io](https://saifkhalifa.github.io)

Built for the **OppoTrain Summer Internship Assessment**.