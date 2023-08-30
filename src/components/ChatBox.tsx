const ChatBox = () => {
  return (
    <div className="chatbox">
      <div className="chatbox-header">Chat</div>
      <div className="chatbox-messages">MESSAGES</div>
      <div className="chatbox-input">
        <input type="text" placeholder="Type your message..." />
        <button>Send</button>
      </div>
    </div>
  );
};
export default ChatBox;
