const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, color: "var(--tcl-muted)" }}>
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
);

const getConversationName = (conversation, currentUserId) => {
  if (conversation.name) return conversation.name;
  const partner = conversation.participants?.find((participant) => participant._id !== currentUserId);
  return partner?.fullName || partner?.username || "Conversation";
};

const getConversationPreview = (conversation) => {
  if (!conversation?.lastMessage) {
    return "Start chatting";
  }

  if (typeof conversation.lastMessage === "string") {
    return conversation.lastMessage;
  }

  return conversation.lastMessage.text || "Sent an attachment";
};

const ChatList = ({ conversations = [], activeConversationId, onSelect, currentUserId }) => {
  return (
    <aside className="ig-chat-list">
      <div className="ig-chat-list-head">
        <span>Messages</span>
        <button type="button" style={{ color: "var(--tcl-text)" }}><EditIcon /></button>
      </div>

      <div className="ig-chat-search">
        <div className="ig-chat-search-bar">
          <SearchIcon />
          <input type="text" placeholder="Search conversations" />
        </div>
      </div>

      <div className="ig-chat-items">
        {conversations.map((conversation, idx) => {
          const partner = conversation.participants?.find((participant) => participant._id !== currentUserId);

          return (
            <button
              key={conversation._id}
              type="button"
              className={`ig-chat-item${conversation._id === activeConversationId ? " active" : ""}`}
              onClick={() => onSelect(conversation._id)}
            >
              <div className="ig-chat-avatar">
                <img
                  style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                  src={partner?.avatar || "https://placehold.co/80x80?text=U"}
                  alt={partner?.username || "user"}
                />
                {/* Randomly assign online status to mock data */}
                {idx === 0 && <div className="ig-online-dot" />}
              </div>
              
              <div className="ig-chat-item-info">
                <div className="ig-chat-item-name">{getConversationName(conversation, currentUserId)}</div>
                <div className="ig-chat-item-preview">{getConversationPreview(conversation)}</div>
              </div>
              
              <div className="ig-chat-item-time">{conversation.time || ""}</div>
            </button>
          );
        })}
        {!conversations.length && (
          <div className="ig-muted" style={{ padding: 16 }}>
            No conversations yet.
          </div>
        )}
      </div>
    </aside>
  );
};

export default ChatList;
