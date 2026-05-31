import { useState } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Home from "./pages/Home.jsx";
import Explore from "./pages/Explore.jsx";
import Reels from "./pages/Reels.jsx";
import Profile from "./pages/Profile.jsx";
import Messages from "./pages/Messages.jsx";
import Notifications from "./pages/Notifications.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Settings from "./pages/Settings.jsx";
import Premium from "./pages/Premium.jsx";
import { prependPost } from "./redux/slices/feedSlice.js";
import { api } from "./services/api.js";
import ThemeToggle from "./components/common/ThemeToggle.jsx";
import AnimatedPage from "./components/common/AnimatedPage.jsx";

const ProtectedRoute = ({ children }) => {
  const token = useSelector((state) => state.auth.accessToken);
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

/* ── SVG Icon components ────────────────────────────────── */
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
    <path d="M9 21V12h6v9"/>
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const ExploreIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
  </svg>
);
const ReelsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
    <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/>
    <line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/>
    <line x1="17" y1="7" x2="22" y2="7"/>
  </svg>
);
const MsgIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);
const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);
const MoreIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const navItems = [
  { to: "/",             label: "Home",          Icon: HomeIcon },
  { to: "/explore",      label: "Search",        Icon: SearchIcon },
  { to: "/explore",      label: "Explore",       Icon: ExploreIcon },
  { to: "/reels",        label: "Reels",         Icon: ReelsIcon },
  { to: "/messages",     label: "Messages",      Icon: MsgIcon },
  { to: "/notifications",label: "Notifications", Icon: BellIcon },
];

const Sidebar = ({ onOpenCreate }) => {
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.accessToken);
  if (!token) return null;

  return (
    <aside className="ig-sidebar">
      <div className="ig-logo">
        The Curated<br />Lens
      </div>

      <nav className="ig-nav-list">
        {navItems.map((item, index) => (
          <NavLink
            key={`${item.label}-${index}`}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => `ig-nav-item${isActive ? " active" : ""}`}
          >
            <div className="ig-nav-icon-wrap">
              <item.Icon />
            </div>
            <span className="ig-nav-label">{item.label}</span>
          </NavLink>
        ))}

        <button type="button" className="ig-nav-item" onClick={onOpenCreate}>
          <div className="ig-nav-icon-wrap"><PlusIcon /></div>
          <span className="ig-nav-label">Create</span>
        </button>

        <NavLink to="/profile" className={({ isActive }) => `ig-nav-item${isActive ? " active" : ""}`}>
          <img
            className="ig-profile-icon"
            src={user?.avatar || "https://placehold.co/64x64?text=U"}
            alt="profile"
          />
          <span className="ig-nav-label">Profile</span>
        </NavLink>

        <ThemeToggle />
      </nav>

      <div className="ig-nav-bottom">
        <NavLink to="/settings" className={({ isActive }) => `ig-nav-item${isActive ? " active" : ""}`}>
          <div className="ig-nav-icon-wrap"><MoreIcon /></div>
          <span className="ig-nav-label">More</span>
        </NavLink>
      </div>
    </aside>
  );
};

/* ── Create Post Modal ─────────────────────────────────── */
const VIDEO_PRESETS = [
  { name: "🎬 Nebula Space", url: "https://assets.mixkit.co/videos/preview/mixkit-nebula-in-outer-space-40016-large.mp4" },
  { name: "🌊 Ocean Waves", url: "https://assets.mixkit.co/videos/preview/mixkit-sea-waves-crashing-on-rocks-40026-large.mp4" },
  { name: "🌿 Forest Stream", url: "https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4" },
  { name: "🌃 City Night", url: "https://assets.mixkit.co/videos/preview/mixkit-city-traffic-at-night-502-large.mp4" },
  { name: "🌧️ Raindrops", url: "https://assets.mixkit.co/videos/preview/mixkit-rain-drops-falling-on-leaves-40027-large.mp4" }
];

const CreatePostModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const [uploadType, setUploadType] = useState("post"); // "post" or "reel"
  const [showInputs, setShowInputs] = useState(false);
  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState("https://picsum.photos/seed/modal-post/1080/1080");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    // Reset defaults when switching uploadType
    if (uploadType === "post") {
      setMediaUrl("https://picsum.photos/seed/modal-post/1080/1080");
    } else {
      setMediaUrl(VIDEO_PRESETS[0].url);
    }
  }, [uploadType]);

  if (!open) return null;

  const submit = async (event) => {
    event.preventDefault();
    setPosting(true);
    try {
      if (uploadType === "post") {
        const { data } = await api.post("/posts", {
          caption,
          media: [{ url: mediaUrl, type: "image", publicId: "" }],
        });
        dispatch(prependPost(data));
        setCaption("");
        setMediaUrl(`https://picsum.photos/seed/${Date.now()}/1080/1080`);
        setShowInputs(false);
        onClose();
      } else {
        // Create new Reel
        await api.post("/reels", {
          videoUrl: mediaUrl,
          caption,
          coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
          audio: { title: "Original Audio", artist: "you" }
        });
        setCaption("");
        setMediaUrl(VIDEO_PRESETS[0].url);
        setShowInputs(false);
        onClose();
        // Force refresh page to sync feed instantly
        window.location.reload();
      }
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="ig-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
      <button
        style={{ position: 'absolute', top: 20, right: 24, color: '#fff', fontSize: 28, background: 'transparent', border: 'none', cursor: 'pointer', lineHeight: 1 }}
        type="button"
        onClick={onClose}
      >
        ✕
      </button>

      <section className="ig-create-modal" onClick={(event) => event.stopPropagation()}>
        <div className="ig-create-head">Create New Upload</div>
        
        {/* Tab Selectors */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--tcl-border)", background: "var(--tcl-bg)" }}>
          <button
            type="button"
            onClick={() => { setUploadType("post"); setShowInputs(false); }}
            style={{ flex: 1, padding: "12px", fontWeight: 600, fontSize: 13, cursor: "pointer", color: uploadType === "post" ? "var(--tcl-blue)" : "var(--tcl-muted)", borderBottom: uploadType === "post" ? "2px solid var(--tcl-blue)" : "2px solid transparent", background: "transparent", transition: "var(--tcl-transition)" }}
          >
            Post
          </button>
          <button
            type="button"
            onClick={() => { setUploadType("reel"); setShowInputs(false); }}
            style={{ flex: 1, padding: "12px", fontWeight: 600, fontSize: 13, cursor: "pointer", color: uploadType === "reel" ? "var(--tcl-blue)" : "var(--tcl-muted)", borderBottom: uploadType === "reel" ? "2px solid var(--tcl-blue)" : "2px solid transparent", background: "transparent", transition: "var(--tcl-transition)" }}
          >
            Reel
          </button>
        </div>

        <div className="ig-create-body">
          {!showInputs && (
            <div className="ig-drop-zone">
              <div className="ig-drop-icon">{uploadType === "post" ? "🖼" : "📹"}</div>
              <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
                {uploadType === "post" ? "Drag photos and videos here" : "Select or link your vertical Reel"}
              </h3>
              <button className="ig-btn-primary" type="button" onClick={() => setShowInputs(true)}>
                Configure Upload
              </button>
            </div>
          )}

          {showInputs && (
            <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
              {uploadType === "post" ? (
                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--tcl-muted)" }}>Image URL:</label>
                  <input
                    className="ig-input"
                    value={mediaUrl}
                    onChange={(event) => setMediaUrl(event.target.value)}
                    placeholder="Enter image URL"
                  />
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--tcl-muted)" }}>Choose a premium video preset:</label>
                    <select
                      className="ig-select"
                      value={mediaUrl}
                      onChange={(event) => setMediaUrl(event.target.value)}
                    >
                      {VIDEO_PRESETS.map((p) => (
                        <option key={p.url} value={p.url}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "grid", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--tcl-muted)" }}>Or enter custom video URL (.mp4):</label>
                    <input
                      className="ig-input"
                      value={mediaUrl}
                      onChange={(event) => setMediaUrl(event.target.value)}
                      placeholder="Video URL (.mp4)"
                    />
                  </div>
                </>
              )}

              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--tcl-muted)" }}>Caption:</label>
                <textarea
                  className="ig-textarea"
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  placeholder={uploadType === "post" ? "Write a caption..." : "Write a caption for your Reel..."}
                />
              </div>

              <button className="ig-btn-primary" type="submit" disabled={posting}>
                {posting ? "Sharing…" : "Share Now"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

/* ── App ───────────────────────────────────────────────── */
function App() {
  const token = useSelector((state) => state.auth.accessToken);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  if (!token) {
    return (
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*"         element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="ig-shell">
      <Sidebar onOpenCreate={() => setIsCreateOpen(true)} />

      <main className="ig-main">
        <div className="ig-page">
          <Routes>
            <Route path="/"             element={<ProtectedRoute><AnimatedPage><Home /></AnimatedPage></ProtectedRoute>} />
            <Route path="/explore"      element={<ProtectedRoute><AnimatedPage><Explore /></AnimatedPage></ProtectedRoute>} />
            <Route path="/reels"        element={<ProtectedRoute><AnimatedPage><Reels /></AnimatedPage></ProtectedRoute>} />
            <Route path="/profile/:username?" element={<ProtectedRoute><AnimatedPage><Profile /></AnimatedPage></ProtectedRoute>} />
            <Route path="/messages"     element={<ProtectedRoute><AnimatedPage><Messages /></AnimatedPage></ProtectedRoute>} />
            <Route path="/notifications"element={<ProtectedRoute><AnimatedPage><Notifications /></AnimatedPage></ProtectedRoute>} />
            <Route path="/settings"     element={<ProtectedRoute><AnimatedPage><Settings /></AnimatedPage></ProtectedRoute>} />
            <Route path="/premium"      element={<ProtectedRoute><AnimatedPage><Premium /></AnimatedPage></ProtectedRoute>} />
            <Route path="*"             element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      <CreatePostModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}

export default App;