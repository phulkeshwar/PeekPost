import { useEffect, useState, useMemo } from "react";
import ReelPlayer from "../components/reels/ReelPlayer";
import { api } from "../services/api";
import { MOCK_REELS } from "../utils/mockData";

/* ── SVG Icons ────────────────────────────────────────── */
const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "red" : "none"} stroke={filled ? "red" : "white"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);

const BubbleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const MusicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, marginRight: 4 }}>
    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
  </svg>
);

const Reels = () => {
  const [items, setItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchY, setTouchY] = useState(null);

  // Dynamic state arrays mapping to loaded Reels
  const [likedMap, setLikedMap] = useState({});
  const [likesCountMap, setLikesCountMap] = useState({});
  
  // Comments overlay state
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [commentsMap, setCommentsMap] = useState({});
  
  // Share copy notice
  const [shareNotice, setShareNotice] = useState("");

  const mockReelsComments = useMemo(() => [
    { id: "rc1", author: "aarav.frames", text: "Amazing cinematography, loving the audio track!", time: "2h" },
    { id: "rc2", author: "maya.trails", text: "Stunning colors! What camera did you use?", time: "5h" },
    { id: "rc3", author: "dev.codes", text: "Clean and inspiring work 👏👏", time: "1d" }
  ], []);

  const load = async () => {
    try {
      const { data } = await api.get("/reels/feed");
      setItems(data.length ? data : MOCK_REELS);
      
      // Initialize likes mapping from loaded records
      const initialLikes = {};
      const initialCounts = {};
      data.forEach((r) => {
        initialLikes[r._id] = false;
        initialCounts[r._id] = r.likes?.length || 0;
      });
      setLikedMap(initialLikes);
      setLikesCountMap(initialCounts);
    } catch {
      setItems(MOCK_REELS);
      
      const fallbackLikes = {};
      const fallbackCounts = {};
      MOCK_REELS.forEach((r) => {
        fallbackLikes[r._id] = false;
        fallbackCounts[r._id] = 124;
      });
      setLikedMap(fallbackLikes);
      setLikesCountMap(fallbackCounts);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activeReel = items[activeIndex];

  const goNext = () => {
    if (!items.length) return;
    setShowComments(false);
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  const goPrev = () => {
    if (!items.length) return;
    setShowComments(false);
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleLikeReel = async (reelId) => {
    const isLiked = likedMap[reelId];
    setLikedMap((prev) => ({ ...prev, [reelId]: !isLiked }));
    setLikesCountMap((prev) => ({ ...prev, [reelId]: isLiked ? prev[reelId] - 1 : prev[reelId] + 1 }));

    try {
      await api.post(`/reels/${reelId}/like`);
    } catch {
      // Revert local state on network error
      setLikedMap((prev) => ({ ...prev, [reelId]: isLiked }));
      setLikesCountMap((prev) => ({ ...prev, [reelId]: isLiked ? prev[reelId] + 1 : prev[reelId] - 1 }));
    }
  };

  const handleShareReel = (reelId) => {
    const shareUrl = `${window.location.origin}/reels/${reelId}`;
    navigator.clipboard.writeText(shareUrl);
    setShareNotice("Copied Reel link to clipboard!");
    setTimeout(() => setShareNotice(""), 2000);
  };

  const getCommentsList = (reelId) => {
    return commentsMap[reelId] || mockReelsComments;
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeReel) return;
    const newComment = {
      id: `rc-local-${Date.now()}`,
      author: "you",
      text: newCommentText.trim(),
      time: "Just now"
    };

    setCommentsMap((prev) => {
      const current = prev[activeReel._id] || mockReelsComments;
      return {
        ...prev,
        [activeReel._id]: [newComment, ...current]
      };
    });
    setNewCommentText("");
  };

  // Keyboard events
  useEffect(() => {
    const onKey = (event) => {
      if (!items.length) return;
      if (event.key === "ArrowUp") goPrev();
      if (event.key === "ArrowDown") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items.length, activeIndex]);

  return (
    <div
      className="ig-reels-wrap"
      onWheel={(event) => {
        if (!items.length) return;
        if (event.deltaY > 12) goNext();
        if (event.deltaY < -12) goPrev();
      }}
      onTouchStart={(event) => setTouchY(event.changedTouches[0].clientY)}
      onTouchEnd={(event) => {
        if (touchY === null) return;
        const delta = event.changedTouches[0].clientY - touchY;
        if (delta < -25) goNext();
        if (delta > 25) goPrev();
        setTouchY(null);
      }}
    >
      {activeReel && (
        <article className="ig-reel-active">
          {/* Vertical Video Frame */}
          <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <ReelPlayer
              src={activeReel.videoUrl}
              onDoubleClick={() => handleLikeReel(activeReel._id)}
            />
          </div>

          {/* Bottom Caption Overlay */}
          <div className="ig-reel-overlay">
            <div className="ig-reel-author">
              <img
                src={activeReel.author?.avatar || "https://placehold.co/60x60?text=U"}
                alt={activeReel.author?.username}
                style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid white", objectFit: "cover" }}
              />
              <span>@{activeReel.author?.username || "creator"}</span>
              <button 
                type="button" 
                style={{ background: "transparent", border: "1.5px solid white", borderRadius: 4, padding: "2px 8px", fontSize: 10, color: "white", fontWeight: 700, cursor: "pointer" }}
              >
                Follow
              </button>
            </div>
            <div className="ig-reel-caption">{activeReel.caption || "No caption provided."}</div>
            
            {/* Audio Indicator */}
            <div style={{ display: "flex", alignItems: "center", fontSize: 12, opacity: 0.85, marginTop: 4 }}>
              <MusicIcon />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {activeReel.audio?.title || "Original Audio"} · {activeReel.audio?.artist || activeReel.author?.username || "PeekPost"}
              </span>
            </div>

            {/* Navigation buttons pre-installed */}
            <div className="ig-reel-controls" style={{ pointerEvents: "auto" }}>
              <button type="button" className="ig-profile-btn" onClick={goPrev} style={{ color: "white", borderColor: "rgba(255,255,255,0.45)", background: "rgba(0,0,0,0.25)" }}>Previous</button>
              <button type="button" className="ig-profile-btn" onClick={goNext} style={{ color: "white", borderColor: "rgba(255,255,255,0.45)", background: "rgba(0,0,0,0.25)" }}>Next</button>
            </div>
          </div>

          {/* Absolute Right-Hand Controls Grid */}
          <div className="ig-reel-actions-column">
            <button className="ig-reel-action-btn" type="button" onClick={() => handleLikeReel(activeReel._id)}>
              <HeartIcon filled={likedMap[activeReel._id]} />
              <span>{(likesCountMap[activeReel._id] || 0).toLocaleString()}</span>
            </button>

            <button className="ig-reel-action-btn" type="button" onClick={() => setShowComments(!showComments)}>
              <BubbleIcon />
              <span>{getCommentsList(activeReel._id).length}</span>
            </button>

            <button className="ig-reel-action-btn" type="button" onClick={() => handleShareReel(activeReel._id)}>
              <ShareIcon />
              <span>{activeReel.shares || 0}</span>
            </button>
          </div>

          {/* Share Flash Banner */}
          {shareNotice && (
            <div style={{ position: "absolute", top: 20, left: 20, right: 20, background: "rgba(0,102,255,0.9)", color: "white", padding: "8px 12px", borderRadius: 8, fontSize: 12, zIndex: 12, textAlign: "center", fontWeight: 600, boxShadow: "0 4px 12px rgba(0,0,0,0.25)" }}>
              {shareNotice}
            </div>
          )}

          {/* Sliding Bottom Comments Drawer */}
          {showComments && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "380px",
                background: "var(--tcl-surface)",
                borderTopLeftRadius: "18px",
                borderTopRightRadius: "18px",
                boxShadow: "0 -8px 24px rgba(0,0,0,0.25)",
                zIndex: 20,
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                transition: "transform 0.3s ease"
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--tcl-border)", paddingBottom: "0.5rem" }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Comments ({getCommentsList(activeReel._id).length})</span>
                <button
                  type="button"
                  onClick={() => setShowComments(false)}
                  style={{ background: "transparent", border: "none", fontSize: "1.25rem", color: "var(--tcl-muted)", cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>

              {/* List */}
              <div style={{ flex: 1, overflowY: "auto", display: "grid", gap: "0.75rem", paddingRight: 4 }}>
                {getCommentsList(activeReel._id).map((c) => (
                  <div key={c.id} style={{ display: "flex", gap: "8px", fontSize: 13, alignItems: "start" }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "var(--tcl-blue)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifycontent: "center",
                        fontSize: 10,
                        fontWeight: 700,
                        flexShrink: 0
                      }}
                    >
                      {c.author[0].toUpperCase()}
                    </div>
                    <div>
                      <strong style={{ marginRight: 6 }}>{c.author}</strong>
                      <span style={{ color: "var(--tcl-text)" }}>{c.text}</span>
                      <div style={{ fontSize: 10, color: "var(--tcl-muted)", marginTop: 2 }}>{c.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <form onSubmit={handleAddComment} style={{ display: "flex", gap: "8px", borderTop: "1px solid var(--tcl-border)", paddingTop: "0.5rem" }}>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  style={{
                    flex: 1,
                    background: "var(--tcl-bg)",
                    border: "1px solid var(--tcl-border)",
                    borderRadius: "18px",
                    padding: "6px 12px",
                    fontSize: 13,
                    color: "var(--tcl-text)",
                    outline: "none"
                  }}
                />
                <button
                  className="ig-btn-primary"
                  type="submit"
                  style={{ padding: "4px 12px", borderRadius: "18px", fontSize: 12 }}
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </article>
      )}
    </div>
  );
};

export default Reels;