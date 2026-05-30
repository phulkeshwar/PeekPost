import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchFeed } from "../redux/slices/feedSlice";
import FeedPost from "../components/feed/FeedPost";
import FeedAd from "../components/feed/FeedAd";
import { MOCK_POSTS } from "../utils/mockData";
import { api } from "../services/api";

/* ── SVG icons ─────────────────────────────────────────── */
const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);
const CommentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);
const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const BookmarkIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
  </svg>
);
const EmojiIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);

const Home = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { items, page, hasMore, loading } = useSelector((state) => state.feed);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [storyReply, setStoryReply] = useState("");
  const [followedSuggestIds, setFollowedSuggestIds] = useState(new Set());

  const handleFollowSuggested = async (suggestedId) => {
    try {
      const { data } = await api.post(`/users/${suggestedId}/follow`);
      setFollowedSuggestIds((prev) => {
        const next = new Set(prev);
        if (data.following) {
          next.add(suggestedId);
        } else {
          next.delete(suggestedId);
        }
        return next;
      });
    } catch {
      alert("Failed to toggle follow status.");
    }
  };

  useEffect(() => {
    dispatch(fetchFeed(1))
      .unwrap()
      .catch(() => {
        // Feed slice remains empty on API failure, fallback keeps homepage usable.
      });
  }, [dispatch]);

  const displayItems = items.length ? items : MOCK_POSTS;
  const posts = useMemo(() => displayItems.filter((item) => !item.isAd), [displayItems]);

  const stories = useMemo(() => {
    const unique = new Map();
    for (const post of posts) {
      if (!post.author?._id || unique.has(post.author._id)) continue;
      unique.set(post.author._id, {
        username: post.author.username,
        avatar: post.author.avatar,
        media: post.media?.[0]?.url || `https://picsum.photos/seed/story-${post.author._id}/720/1280`,
      });
      if (unique.size >= 9) break;
    }
    if (!unique.size && user) {
      unique.set(user.id || "me", {
        username: user.username,
        avatar: user.avatar,
        media: "https://picsum.photos/seed/my-story/720/1280",
      });
    }
    return [...unique.values()];
  }, [posts, user]);

  const suggestions = useMemo(() => {
    const unique = new Map();
    for (const post of posts) {
      if (!post.author?._id || post.author.username === user?.username || unique.has(post.author._id)) continue;
      unique.set(post.author._id, post.author);
      if (unique.size >= 5) break;
    }
    return [...unique.values()];
  }, [posts, user?.username]);

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  return (
    <div className="ig-home-wrap">
      {/* ── Feed column ── */}
      <section>
        {/* Stories */}
        <div className="ig-stories">
          {stories.map((story, index) => (
            <div className="ig-story" key={story.username}>
              <button
                type="button"
                onClick={() => setActiveStoryIndex(index)}
                style={{ border: 0, background: "transparent", padding: 0, width: "100%" }}
              >
                <div className="ig-story-ring">
                  <img src={story.avatar || "https://placehold.co/80x80?text=U"} alt={story.username} />
                </div>
              </button>
              <div className="ig-story-name">{story.username}</div>
            </div>
          ))}
        </div>

        {/* Feed posts */}
        <div className="ig-feed-list">
          {displayItems.map((item) =>
            item.isAd
              ? <FeedAd key={item._id} ad={item} />
              : <FeedPost key={item._id} post={item} />
          )}

          {hasMore && (
            <button
              className="ig-btn-ghost"
              type="button"
              disabled={loading}
              onClick={() => dispatch(fetchFeed(page + 1))}
              style={{ width: "100%" }}
            >
              {loading ? "Loading…" : "Load more posts"}
            </button>
          )}
        </div>
      </section>

      {/* ── Right sidebar ── */}
      <aside className="ig-suggest-panel">
        {/* Me */}
        <div className="ig-suggest-me">
          <div className="ig-suggest-user">
            <img
              className="ig-suggest-me-avatar"
              src={user?.avatar || "https://placehold.co/80x80?text=U"}
              alt="me"
            />
            <div>
              <div className="ig-suggest-me-name">{user?.username}</div>
              <div className="ig-suggest-me-handle">{user?.fullName || "Your account"}</div>
            </div>
          </div>
          <span className="ig-link">Switch</span>
        </div>

        {/* Suggestions */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--tcl-muted)" }}>Suggested for you</span>
          <span className="ig-link">See All</span>
        </div>

        <div className="ig-suggest-list">
          {suggestions.map((s) => (
            <div className="ig-suggest-item" key={s._id}>
              <div className="ig-suggest-user" style={{ gap: 10 }}>
                <img
                  className="ig-suggest-item-avatar"
                  src={s.avatar || "https://placehold.co/50x50?text=U"}
                  alt={s.username}
                />
                <div>
                  <div className="ig-suggest-item-name">{s.username}</div>
                  <div className="ig-suggest-item-detail">Suggested for you</div>
                </div>
              </div>
              <span className="ig-link">Follow</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="ig-footer-links">
          <span>About</span><span>Help</span><span>Press</span><span>API</span>
          <span>Privacy</span><span>Terms</span><span>Locations</span>
          <br />
          <span>© 2024 THE CURATED LENS FROM META</span>
        </div>
      </aside>

      {/* ── Story overlay ── */}
      {activeStory && (
        <div className="ig-overlay" onClick={() => setActiveStoryIndex(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 100 }}>
          <button
            style={{ position: "absolute", top: 20, right: 24, color: "#fff", fontSize: 26, background: "transparent", border: "none", cursor: "pointer", zIndex: 101 }}
            type="button"
            onClick={() => setActiveStoryIndex(null)}
          >
            ✕
          </button>

          <div className="ig-story-viewer" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="ig-story-nav"
              onClick={() => setActiveStoryIndex((p) => (p - 1 + stories.length) % stories.length)}
            >
              ‹
            </button>

            <div className="ig-story-card">
              {/* Progress bars */}
              <div className="ig-story-progress">
                {stories.map((_, i) => (
                  <span key={i} className={i < activeStoryIndex ? "done" : ""} />
                ))}
              </div>

              {/* Header */}
              <div className="ig-story-header">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <img
                    src={activeStory.avatar || "https://placehold.co/60x60?text=U"}
                    alt={activeStory.username}
                    style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }}
                  />
                  <strong style={{ fontSize: 13 }}>{activeStory.username}</strong>
                  <span style={{ fontSize: 12, opacity: 0.7 }}>3h</span>
                </div>
                <div style={{ display: "flex", gap: 14, opacity: 0.85, fontSize: 16 }}>
                  <span>▶</span>
                  <span>🔊</span>
                  <span>•••</span>
                </div>
              </div>

              {/* Media */}
              <img className="ig-story-media" src={activeStory.media} alt="story" />

              {/* Reply */}
              <div className="ig-story-reply">
                <input
                  type="text"
                  value={storyReply}
                  onChange={(e) => setStoryReply(e.target.value)}
                  placeholder={`Reply to ${activeStory.username}…`}
                />
                <span style={{ fontSize: 22, color: "#fff", cursor: "pointer" }}>♡</span>
                <span style={{ fontSize: 22, color: "#fff", cursor: "pointer" }}>➤</span>
              </div>
            </div>

            <button
              type="button"
              className="ig-story-nav"
              onClick={() => setActiveStoryIndex((p) => (p + 1) % stories.length)}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;