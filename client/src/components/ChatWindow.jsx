import MessageInput from "./MessageInput";
import MessageList from "./MessageList";

const ChatWindow = ({ messages, onSendMessage, disabled }) => (
  <section className="chat-window">
    <MessageList messages={messages} />
    <MessageInput onSend={onSendMessage} disabled={disabled} />
  </section>
);

export default ChatWindow;
