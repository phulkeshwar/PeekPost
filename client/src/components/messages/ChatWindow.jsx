import MessageBubble from "./MessageBubble";

const CallIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const VidIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);
const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);
const SmileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);
const ImgIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
  </svg>
);
const MicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const getConversationName = (conversation, currentUserId) => {
  if (!conversation) return "";
  if (conversation.name) return conversation.name;
  const partner = conversation.participants?.find((participant) => participant._id !== currentUserId);
  return partner?.fullName || partner?.username || "Conversation";
};

const getAvatar = (conversation, currentUserId) => {
  if (!conversation) return "";
  const partner = conversation.participants?.find((participant) => participant._id !== currentUserId);
  return partner?.avatar || "https://placehold.co/80x80?text=U";
};

const ChatWindow = ({ messages = [], draft, onDraftChange, onSend, currentUserId, activeConversation }) => {
  if (!activeConversation) {
    return (
      <section className="ig-chat-window">
        <div className="ig-notification-canvas">
          <h2 style={{ margin: 0 }}>Your message box is empty</h2>
          <p className="ig-muted">Start a new chat and messages will appear here.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="ig-chat-window">
      {/* Header */}
      <div className="ig-chat-head">
        <div className="ig-chat-head-user">
          <img
            src={getAvatar(activeConversation, currentUserId)}
            alt="avatar"
            style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{getConversationName(activeConversation, currentUserId)}</div>
            <div style={{ fontSize: 13, color: "#22c55e", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} /> Active Now
            </div>
          </div>
        </div>
        <div className="ig-chat-head-actions">
          <CallIcon />
          <VidIcon />
          <InfoIcon />
        </div>
      </div>

      {/* Body */}
      <div className="ig-chat-body">
        <div className="ig-chat-date-label">YESTERDAY</div>
        
        {!messages.length && <div className="ig-muted">No messages yet. Say hello.</div>}
        {messages.map((message) => (
          <MessageBubble key={message._id} message={message} own={message.sender?._id === currentUserId} />
        ))}
      </div>

      {/* Compose */}
      <div className="ig-chat-compose">
        <div className="ig-chat-compose-shell">
          <button type="button" className="ig-compose-icon" style={{ marginLeft: 6 }}>
            <SmileIcon />
          </button>
          
          <input 
            value={draft || ""} 
            placeholder="Message..." 
            onChange={(event) => onDraftChange && onDraftChange(event.target.value)} 
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onSend();
              }
            }}
          />
          
          <button type="button" className="ig-compose-icon">
            <ImgIcon />
          </button>
          <button type="button" className="ig-compose-icon" style={{ marginRight: 6 }}>
            <MicIcon />
          </button>
          <button type="button" className="ig-compose-send" onClick={onSend}>
            <SendIcon />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ChatWindow;