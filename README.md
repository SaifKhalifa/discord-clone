# Simplified Discord Clone

A real-time messaging web app with React, Express, Socket.io, and MongoDB. It supports JWT auth, channel-based chat, and live message updates.

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