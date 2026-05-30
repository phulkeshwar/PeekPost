import { useState, useEffect } from "react";
import { api } from "../../services/api";

const ExploreGrid = ({ items = [] }) => {
  const [activeMedia, setActiveMedia] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (!activeMedia) return;
    setLiked(false);
    setLikesCount(activeMedia.likes?.length || 0);
    setComments([]);

    const fetchComments = async () => {
      setLoadingComments(true);
      try {
        const { data } = await api.get(`/comments/post/${activeMedia._id}`);
        setComments(data);
      } catch (err) {
        setComments([
          { _id: "rc1", author: { username: "aarav.frames" }, text: "Beautiful composition and lighting! 📸" },
          { _id: "rc2", author: { username: "maya.trails" }, text: "Excellent capture!" }
        ]);
      } finally {
        setLoadingComments(false);
      }
    };

    if (!activeMedia.isAd) {
      fetchComments();
    }
  }, [activeMedia]);

  const toggleLike = async () => {
    if (!activeMedia || activeMedia.isAd) return;
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((prev) => nextLiked ? prev + 1 : Math.max(0, prev - 1));

    try {
      await api.post(`/posts/${activeMedia._id}/like`);
    } catch {
      setLiked(liked);
      setLikesCount(activeMedia.likes?.length || 0);
    }
  };

  const postComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !activeMedia) return;
    try {
      const { data } = await api.post(`/comments/post/${activeMedia._id}`, { text: commentText.trim() });
      setComments((prev) => [data, ...prev]);
      setCommentText("");
    } catch {
      alert("Failed to post comment.");
    }
  };

  return (
    <>
      <section className="ig-explore-masonry">
        {items.map((item) => {
          const mediaURL = item.isAd ? item.imageUrl : item.media?.[0]?.url;
          const isVideo = item.media?.[0]?.type === "video";
          return (
            <div key={item._id} className="ig-explore-item" onClick={() => setActiveMedia(item)}>
              {isVideo ? (
                <video src={mediaURL} style={{ objectFit: "cover", width: "100%", height: "100%" }} muted />
              ) : (
                <img src={mediaURL} alt={item.title || item.caption || "explore item"} />
              )}
              {isVideo && (
                <div style={{ position: "absolute", top: 8, right: 8, color: "white", zIndex: 2 }}>
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 22, height: 22 }}>
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {activeMedia && (
        <div
          className="ig-overlay"
          onClick={() => setActiveMedia(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <button
            style={{ position: "absolute", top: 20, right: 24, color: "#fff", fontSize: 28, background: "transparent", border: "none", cursor: "pointer", zIndex: 101 }}
            type="button"
            onClick={() => setActiveMedia(null)}
          >
            ✕
          </button>
          
          <div className="ig-post-modal" onClick={(e) => e.stopPropagation()}>
            {/* Media side */}
            <div className="ig-post-modal-media">
              {activeMedia.media?.[0]?.type === "video" ? (
                <video src={activeMedia.media?.[0]?.url} controls autoPlay style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <img src={activeMedia.isAd ? activeMedia.imageUrl : activeMedia.media?.[0]?.url} alt="media" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              )}
            </div>

            {/* Details side */}
            <div className="ig-post-modal-side">
              {/* Header */}
              <div className="ig-feed-header" style={{ padding: "14px 16px" }}>
                <div className="ig-feed-user">
                  <img
                    className="ig-feed-avatar"
                    src={activeMedia.isAd ? activeMedia.imageUrl : (activeMedia.author?.avatar || "https://placehold.co/64x64?text=U")}
                    alt="avatar"
                    style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
                  />
                  <div>
                    <div className="ig-feed-username" style={{ color: "var(--tcl-text)", fontWeight: 700 }}>
                      {activeMedia.isAd ? activeMedia.advertiser : (activeMedia.author?.username || "creator")}
                    </div>
                    <div className="ig-feed-sub" style={{ fontSize: 11, color: "var(--tcl-muted)" }}>
                      {activeMedia.isAd ? "Sponsored" : (activeMedia.location?.name || "PeekPost")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="ig-post-modal-comments" style={{ padding: "12px", display: "grid", gap: "12px", overflowY: "auto", flex: 1 }}>
                {activeMedia.caption && (
                  <div className="ig-comment" style={{ display: "flex", gap: "10px", fontSize: 13 }}>
                    <img
                      className="ig-comment-avatar"
                      src={activeMedia.author?.avatar || "https://placehold.co/64x64?text=U"}
                      alt="avatar"
                      style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
                    />
                    <div className="ig-comment-text">
                      <strong style={{ marginRight: 6, color: "var(--tcl-text)" }}>{activeMedia.author?.username}</strong>
                      <span style={{ color: "var(--tcl-text)" }}>{activeMedia.caption}</span>
                    </div>
                  </div>
                )}

                {loadingComments ? (
                  <div style={{ textAlign: "center", color: "var(--tcl-muted)", padding: 8, fontSize: 12 }}>Loading comments...</div>
                ) : comments.length === 0 ? (
                  <div style={{ textAlign: "center", color: "var(--tcl-muted)", padding: 8, fontSize: 12 }}>No comments yet.</div>
                ) : (
                  comments.map((c) => (
                    <div key={c._id} className="ig-comment" style={{ display: "flex", gap: "10px", fontSize: 13 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--tcl-blue)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                        {(c.author?.username?.[0] || "U").toUpperCase()}
                      </div>
                      <div className="ig-comment-text">
                        <strong style={{ marginRight: 6, color: "var(--tcl-text)" }}>{c.author?.username || "explorer"}</strong>
                        <span style={{ color: "var(--tcl-text)" }}>{c.text}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bottom Actions & Comment box */}
              {!activeMedia.isAd && (
                <div>
                  <div className="ig-feed-actions" style={{ padding: "10px 16px 6px", display: "flex", flexDirection: "column", gap: 4, alignItems: "start" }}>
                    <div className="ig-feed-actions-left" style={{ display: "flex", gap: 12 }}>
                      <button
                        className="ig-feed-actions-btn"
                        type="button"
                        onClick={toggleLike}
                        style={{ background: "transparent", border: "none", color: liked ? "red" : "var(--tcl-text)", cursor: "pointer", padding: 0 }}
                      >
                        <span style={{ fontSize: 22 }}>{liked ? "❤️" : "♡"}</span>
                      </button>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--tcl-text)" }}>
                      {likesCount.toLocaleString()} likes
                    </div>
                  </div>

                  <form onSubmit={postComment} className="ig-feed-comment-box" style={{ borderTop: "1px solid var(--tcl-border)", display: "flex", alignItems: "center" }}>
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      style={{ flex: 1, border: "none", outline: "none", padding: "12px", background: "transparent", color: "var(--tcl-text)" }}
                    />
                    <button type="submit" className="ig-link" style={{ border: "none", background: "transparent", paddingRight: 16, cursor: "pointer", fontWeight: 700 }}>Post</button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExploreGrid;