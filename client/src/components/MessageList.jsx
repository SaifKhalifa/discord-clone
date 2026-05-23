const formatTime = (value) => {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
};

const MessageList = ({ messages }) => (
  <div className="message-list">
    {messages.length === 0 ? (
      <div className="empty-state">No messages yet. Say hello.</div>
    ) : (
      messages.map((message) => (
        <div key={message._id || message.tempId} className="message-item">
          <div className="message-header">
            <span className="message-sender">
              {message.sender?.username || "Unknown"}
            </span>
            <span>{formatTime(message.createdAt)}</span>
          </div>
          <div className="message-content">{message.content}</div>
        </div>
      ))
    )}
  </div>
);

export default MessageList;
