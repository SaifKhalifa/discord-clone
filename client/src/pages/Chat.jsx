import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { createSocket } from "../socket/socket";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ChatWindow from "../components/ChatWindow";

const Chat = ({ auth, onLogout }) => {
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);
  const activeChannelRef = useRef(null);

  useEffect(() => {
    const fetchChannels = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/channels");
        setChannels(data);
        if (data.length > 0) {
          setActiveChannel(data[0]);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load channels.");
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  useEffect(() => {
    if (!auth.token) {
      return;
    }

    const socket = createSocket(auth.token);
    socketRef.current = socket;

    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("connect", () => {
      if (activeChannelRef.current) {
        socket.emit("join_channel", { channelId: activeChannelRef.current });
      }
    });

    socket.on("error_message", (payload) => {
      if (
        payload?.code === "SESSION_REVOKED" ||
        payload?.code === "SESSION_LOGOUT"
      ) {
        setError(payload?.message || "Session expired. Please login again.");
        onLogout();
        return;
      }

      setError(payload?.message || "Socket error.");
    });

    socket.on("connect_error", (err) => {
      if (err?.message === "auth_invalid_session") {
        setError("Session expired. Please login again.");
        onLogout();
        return;
      }

      setError(err?.message || "Unable to connect to chat.");
    });

    return () => {
      socket.disconnect();
    };
  }, [auth.token]);

  useEffect(() => {
    if (!activeChannel) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setError("");
      setMessages([]);
      try {
        const { data } = await api.get(`/messages/${activeChannel._id}`);
        setMessages(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load messages.");
      }
    };

    fetchMessages();

    const previousChannelId = activeChannelRef.current;
    activeChannelRef.current = activeChannel._id;

    const socket = socketRef.current;
    if (socket) {
      if (previousChannelId) {
        socket.emit("leave_channel", { channelId: previousChannelId });
      }
      socket.emit("join_channel", { channelId: activeChannel._id });
    }
  }, [activeChannel]);

  const handleSendMessage = (content) => {
    if (!activeChannel) {
      return;
    }

    const socket = socketRef.current;
    if (!socket) {
      setError("Socket is not ready yet.");
      return;
    }

    socket.emit("send_message", {
      channelId: activeChannel._id,
      content
    });
  };

  return (
    <div className="app-shell">
      <Sidebar
        channels={channels}
        activeChannelId={activeChannel?._id}
        onSelectChannel={setActiveChannel}
        user={auth.user}
      />
      <div className="chat-area">
        <Navbar activeChannel={activeChannel} onLogout={onLogout} />
        {error ? <div className="error-banner">{error}</div> : null}
        {loading && channels.length === 0 ? (
          <div className="empty-state">Loading channels...</div>
        ) : channels.length === 0 ? (
          <div className="empty-state">
            No channels available yet. Create one from the API.
          </div>
        ) : (
          <ChatWindow
            messages={messages}
            onSendMessage={handleSendMessage}
            disabled={!activeChannel}
          />
        )}
      </div>
    </div>
  );
};

export default Chat;
