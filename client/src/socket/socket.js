import { io } from "socket.io-client";

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const createSocket = (token) =>
  io(socketUrl, {
    auth: {
      token
    }
  });
