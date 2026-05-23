import { useState } from "react";

const MessageInput = ({ onSend, disabled }) => {
  const [text, setText] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (disabled) {
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    onSend(trimmed);
    setText("");
  };

  return (
    <div className="message-input">
      <form className="message-form" onSubmit={handleSubmit}>
        <div className="message-field">
          <input
            type="text"
            value={text}
            placeholder="Message #channel"
            onChange={(event) => setText(event.target.value)}
            disabled={disabled}
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={disabled}>
          Send
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
