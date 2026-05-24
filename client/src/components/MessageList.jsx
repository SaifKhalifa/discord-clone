const formatTime = (value) => {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
};

const getInitial = (name) => {
  if (!name) {
    return "?";
  }

  return name.trim().charAt(0).toUpperCase();
};

const MessageList = ({ messages }) => (
  <div className="message-list">
    {messages.length === 0 ? (
      <div className="empty-state">No messages yet. Say hello.</div>
    ) : (
      messages.map((message) => (
        <div key={message._id || message.tempId} className="message-item">
          <div className="message-avatar">
            {getInitial(message.sender?.username || "U")}
          </div>
          <div className="message-body">
            <div className="message-header">
              <span className="message-sender">
                {message.sender?.username || "Unknown"}
              </span>
              <span className="message-time">
                {formatTime(message.createdAt)}
              </span>
            </div>
            <div className="message-content">{message.content}</div>
          </div>
        </div>
      ))
    )}
  </div>
);

export default MessageList;
