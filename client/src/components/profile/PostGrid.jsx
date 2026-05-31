import { useState, useEffect } from "react";
import { api } from "../../services/api";

const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);
const ReelIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 3a3 3 0 00-3 3v12a3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3H6a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3V6a3 3 0 00-3-3 3 3 0 00-3 3 3 3 0 003 3h12a3 3 0 003-3 3 3 0 00-3-3z" />
  </svg>
);
const TagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

/* Placeholder landscape images for demo posts when API returns none */
const DEMO_IMGS = [
  "https://picsum.photos/seed/lake-sunset/600/600",
  "https://picsum.photos/seed/forest-sun/600/600",
  "https://picsum.photos/seed/red-house/600/600",
  "https://picsum.photos/seed/mountains-snow/600/600",
  "https://picsum.photos/seed/green-hills/600/600",
  "https://picsum.photos/seed/beach-aerial/600/600",
  "https://picsum.photos/seed/grass-drops/600/600",
  "https://picsum.photos/seed/pillars-sky/600/600",
  "https://picsum.photos/seed/portrait-dark/600/600",
];

const PostGrid = ({ posts = [], userId }) => {
  const [activeTab, setActiveTab] = useState("posts");
  const [reels, setReels] = useState([]);
  const [loadingReels, setLoadingReels] = useState(false);

  // Fetch user specific reels when switching to the Reels tab
  useEffect(() => {
    if (activeTab !== "reels" || !userId) return;

    const fetchReels = async () => {
      setLoadingReels(true);
      try {
        const { data } = await api.get(`/reels/user/${userId}`);
        setReels(data);
      } catch (err) {
        console.error("Failed to load user reels:", err);
      } finally {
        setLoadingReels(false);
      }
    };

    fetchReels();
  }, [activeTab, userId]);

  /* Merge real posts + padded demo tiles */
  const allPosts = posts.length > 0 ? posts : DEMO_IMGS.map((url, i) => ({
    _id: `demo-${i}`, media: [{ url, type: "image" }], caption: ""
  }));

  const tabs = [
    { key: "posts",  label: "POSTS",  Icon: GridIcon },
    { key: "reels",  label: "REELS",  Icon: ReelIcon },
    { key: "tagged", label: "TAGGED", Icon: TagIcon },
  ];

  return (
    <>
      {/* Tabs */}
      <div className="ig-profile-tabs">
        {tabs.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            className={`ig-profile-tab${activeTab === key ? " active" : ""}`}
            onClick={() => setActiveTab(key)}
          >
            <Icon /> {label}
          </button>
        ))}
      </div>

      {/* Grid Display based on Tab */}
      {activeTab === "posts" && (
        <section className="ig-post-grid">
          {allPosts.map((post) => (
            <div key={post._id} className="ig-post-tile">
              {post.media?.[0]?.url ? (
                <img src={post.media[0].url} alt={post.caption || "post"} />
              ) : null}
            </div>
          ))}
        </section>
      )}

      {activeTab === "reels" && (
        <>
          {loadingReels ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--tcl-muted)" }}>
              Loading Reels…
            </div>
          ) : reels.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--tcl-muted)", display: "grid", gap: "10px" }}>
              <span style={{ fontSize: "40px" }}>📹</span>
              <h3 style={{ fontWeight: 600, color: "var(--tcl-text)" }}>No Reels Yet</h3>
              <p style={{ fontSize: "13px" }}>Share short video moments with your followers.</p>
            </div>
          ) : (
            <section className="ig-post-grid">
              {reels.map((reel) => (
                <div key={reel._id} className="ig-post-tile" style={{ position: "relative" }}>
                  {reel.coverUrl ? (
                    <img src={reel.coverUrl} alt={reel.caption} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "#161b26", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "32px" }}>🎬</span>
                    </div>
                  )}
                  {/* Premium overlay with play count indicator */}
                  <div style={{ position: "absolute", bottom: "10px", left: "10px", display: "flex", alignItems: "center", gap: "6px", color: "white", fontSize: "11px", fontWeight: 700, textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
                    <span style={{ fontSize: "9px" }}>▶</span> <span>{(reel.shares || 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </section>
          )}
        </>
      )}

      {activeTab === "tagged" && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--tcl-muted)", display: "grid", gap: "10px" }}>
          <span style={{ fontSize: "40px" }}>🏷️</span>
          <h3 style={{ fontWeight: 600, color: "var(--tcl-text)" }}>Photos of you</h3>
          <p style={{ fontSize: "13px" }}>When people tag you in photos or videos, they'll appear here.</p>
        </div>
      )}
    </>
  );
};

export default PostGrid;