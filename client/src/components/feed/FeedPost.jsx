import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";

/* ── Icon helpers ──────────────────────────────────────── */
const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "red" : "none"} stroke={filled ? "red" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);
const CommentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);
const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const BookmarkIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </svg>
);
const EmojiIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20, color: "var(--tcl-muted)" }}>
    <circle cx="12" cy="12" r="10" /><path d="M8 13s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);
const DotsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18, color: "var(--tcl-muted)" }}>
    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
  </svg>
);

const FeedPost = ({ post }) => {
  const [open, setOpen]           = useState(false);
  const [liked, setLiked]         = useState(false);
  const [saved, setSaved]         = useState(false);
  const [comment, setComment]     = useState("");
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [expandedCaption, setExpandedCaption] = useState(false);
  const [comments, setComments]   = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const mockComments = useMemo(() => [
    { id: 1, user: "organic_algorithm", avatar: null, text: "Love this shot. Clean framing.", time: "1d" },
    { id: 2, user: "im_grohit",         avatar: null, text: "This looks amazing.",            time: "8h" },
    { id: 3, user: "saurabh952",        avatar: null, text: "Can you share settings for this?", time: "4h" },
  ], []);

  useEffect(() => {
    if (!open) return;
    const fetchComments = async () => {
      setLoadingComments(true);
      try {
        const { data } = await api.get(`/comments/post/${post._id}`);
        setComments(data);
      } catch (err) {
        console.warn("Could not fetch real comments, falling back to mock", err.message);
        setComments(mockComments.map(c => ({
          _id: `mock-${c.id}`,
          text: c.text,
          createdAt: new Date(Date.now() - (c.time.includes("d") ? 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000)),
          author: {
            username: c.user,
            fullName: c.user,
            avatar: `https://placehold.co/64x64?text=${c.user[0].toUpperCase()}`
          }
        })));
      } finally {
        setLoadingComments(false);
      }
    };
    fetchComments();
  }, [open, post._id, mockComments]);

  const submitComment = async (textToSubmit) => {
    if (!textToSubmit?.trim()) return;
    try {
      const { data } = await api.post(`/comments/post/${post._id}`, { text: textToSubmit.trim() });
      setComments((prev) => [data, ...prev]);
      setComment("");
    } catch (err) {
      alert("Failed to submit comment: " + (err.response?.data?.message || err.message));
    }
  };

  const media = post.media?.[0];

  const handleLike = async () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => liked ? prev - 1 : prev + 1);
    try {
      await api.post(`/posts/${post._id}/like`);
    } catch {
      // Revert on failure
      setLiked((prev) => !prev);
      setLikeCount((prev) => !liked ? prev - 1 : prev + 1);
    }
  };

  const handleSave = async () => {
    setSaved((prev) => !prev);
    try {
      await api.post(`/posts/${post._id}/save`);
    } catch {
      setSaved((prev) => !prev);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(url);
    alert("Post link copied to clipboard!");
  };

  const timeAgo = new Date(post.createdAt || Date.now()).toLocaleDateString("en-US", {
    month: "short", day: "numeric"
  });

  return (
    <>
      <article className="ig-feed-card">
        {/* Header */}
        <div className="ig-feed-header">
          <div className="ig-feed-user">
            <img
              className="ig-feed-avatar"
              src={post.author?.avatar || "https://placehold.co/64x64?text=U"}
              alt={post.author?.username}
            />
              <div>
                <Link to={`/profile/${post.author?.username}`} className="ig-feed-username">
                  {post.author?.username}
                </Link>
              <div className="ig-feed-sub">{post.location?.name || "3 mins ago"}</div>
            </div>
          </div>
          <button type="button" style={{ color: "var(--tcl-muted)", background: "none", border: "none" }}>
            <DotsIcon />
          </button>
        </div>

        {/* Media */}
        {media?.url && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            style={{ border: 0, padding: 0, width: "100%", background: "transparent", display: "block" }}
          >
            {media.type === "video" ? (
              <video className="ig-feed-media" src={media.url} controls />
            ) : (
              <img className="ig-feed-media" src={media.url} alt={post.caption || "post"} />
            )}
          </button>
        )}

        {/* Actions */}
        <div className="ig-feed-actions">
          <div className="ig-feed-actions-left">
            <button className="ig-feed-actions-btn" type="button" onClick={handleLike} title="Like">
              <HeartIcon filled={liked} />
            </button>
            <button className="ig-feed-actions-btn" type="button" title="Comment" onClick={() => setOpen(true)}>
              <CommentIcon />
            </button>
            <button className="ig-feed-actions-btn" type="button" title="Share" onClick={handleShare}>
              <ShareIcon />
            </button>
          </div>
          <button className="ig-feed-actions-btn" type="button" onClick={handleSave} title="Save">
            <BookmarkIcon filled={saved} />
          </button>
        </div>

        {/* Meta */}
        <div className="ig-feed-meta">
          <div className="ig-feed-likes">{likeCount.toLocaleString()} likes</div>
          <div className="ig-feed-caption">
            <Link to={`/profile/${post.author?.username}`} style={{ marginRight: 6, fontWeight: 700 }}>
              {post.author?.username}
            </Link>
            {post.caption?.length > 100 && !expandedCaption ? (
              <>
                {post.caption.slice(0, 100)}...{" "}
                <span className="ig-link ig-muted" onClick={() => setExpandedCaption(true)}>more</span>
              </>
            ) : (
              post.caption
            )}
          </div>
          {(post.comments?.length > 0 || mockComments.length > 0) && (
            <div className="ig-feed-comments-link" onClick={() => setOpen(true)}>
              View all {post.comments?.length || mockComments.length} comments
            </div>
          )}
          <div className="ig-feed-date">{timeAgo}</div>
        </div>

        {/* Comment box */}
        <div className="ig-feed-comment-box">
          <EmojiIcon />
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitComment(comment);
            }}
            placeholder="Add a comment…"
          />
          {comment && (
            <span className="ig-link" style={{ fontWeight: 600, fontSize: 13 }} onClick={() => submitComment(comment)}>Post</span>
          )}
        </div>
      </article>

      {/* ── Post detail modal ── */}
      {open && (
        <div
          className="ig-overlay"
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <button
            style={{ position: "absolute", top: 20, right: 24, color: "#fff", fontSize: 26, background: "transparent", border: "none", cursor: "pointer", zIndex: 101 }}
            type="button"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>

          <div className="ig-post-modal" onClick={(e) => e.stopPropagation()}>
            {/* Media side */}
            <div className="ig-post-modal-media">
              <button className="ig-post-modal-nav left" type="button">‹</button>
              {media?.type === "video" ? (
                <video src={media.url} controls autoPlay style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <img src={media?.url} alt={post.caption || "post"} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              )}
              <button className="ig-post-modal-nav right" type="button">›</button>
            </div>

            {/* Side panel */}
            <div className="ig-post-modal-side">
              {/* Author */}
              <div className="ig-feed-header" style={{ padding: "14px 16px" }}>
                <div className="ig-feed-user">
                  <img
                    className="ig-feed-avatar"
                    src={post.author?.avatar || "https://placehold.co/64x64?text=U"}
                    alt={post.author?.username}
                  />
                  <div>
                    <div className="ig-feed-username">{post.author?.username}</div>
                    <div className="ig-feed-sub">{post.location?.name || "PeekPost"}</div>
                  </div>
                </div>
                <button type="button" style={{ color: "var(--tcl-muted)", background: "none", border: "none" }}>
                  <DotsIcon />
                </button>
              </div>

              {/* Comments */}
              <div className="ig-post-modal-comments">
                {/* Caption as comment */}
                {post.caption && (
                  <div className="ig-comment">
                    <img className="ig-comment-avatar" src={post.author?.avatar || "https://placehold.co/64x64?text=U"} alt={post.author?.username} />
                    <div className="ig-comment-text">
                      <strong style={{ marginRight: 6 }}>{post.author?.username}</strong>
                      {post.caption}
                      <div className="ig-comment-time">{timeAgo}</div>
                    </div>
                  </div>
                )}
                {loadingComments ? (
                  <div style={{ padding: 10, textAlign: "center", color: "var(--tcl-muted)", fontSize: 13 }}>Loading comments...</div>
                ) : comments.length === 0 ? (
                  <div style={{ padding: 10, textAlign: "center", color: "var(--tcl-muted)", fontSize: 13 }}>No comments yet.</div>
                ) : (
                  comments.map((c) => (
                    <div key={c._id} className="ig-comment">
                      <img className="ig-comment-avatar" src={c.author?.avatar || `https://placehold.co/64x64?text=${c.author?.username?.[0]?.toUpperCase()}`} alt={c.author?.username} />
                      <div className="ig-comment-text">
                        <strong style={{ marginRight: 6 }}>{c.author?.username}</strong>{c.text}
                        <div className="ig-comment-time">
                          {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} ·{" "}
                          <span style={{ fontWeight: 600, cursor: "pointer" }}>Reply</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bottom */}
              <div>
                {/* Actions */}
                <div className="ig-feed-actions" style={{ padding: "10px 16px 6px" }}>
                  <div className="ig-feed-actions-left">
                    <button className="ig-feed-actions-btn" type="button" onClick={handleLike}>
                      <HeartIcon filled={liked} />
                    </button>
                    <button className="ig-feed-actions-btn" type="button" onClick={() => {}}>
                      <CommentIcon />
                    </button>
                    <button className="ig-feed-actions-btn" type="button" onClick={handleShare}>
                      <ShareIcon />
                    </button>
                  </div>
                  <button className="ig-feed-actions-btn" type="button" onClick={handleSave}>
                    <BookmarkIcon filled={saved} />
                  </button>
                </div>

                {/* Like count */}
                <div className="ig-feed-meta" style={{ paddingBottom: 4 }}>
                  <div className="ig-feed-likes">Liked by <strong>{post.author?.username}</strong> and <strong>{likeCount.toLocaleString()} others</strong></div>
                  <div className="ig-feed-date" style={{ textTransform: "uppercase", fontSize: 10 }}>{timeAgo}</div>
                </div>

                {/* Add comment */}
                <div className="ig-feed-comment-box">
                  <EmojiIcon />
                  <input
                    type="text"
                    placeholder="Add a comment…"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitComment(comment);
                    }}
                    style={{ flex: 1, border: "none", outline: "none", fontSize: 14, background: "transparent", color: "var(--tcl-text)" }}
                  />
                  {comment && (
                    <span className="ig-link" style={{ fontWeight: 600, fontSize: 13 }} onClick={() => submitComment(comment)}>Post</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedPost;