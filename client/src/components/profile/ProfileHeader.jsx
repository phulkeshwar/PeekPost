import { Link } from "react-router-dom";

const GearIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 00-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);
const VerifiedIcon = () => (
  <svg aria-label="Verified" fill="#0066ff" height="14" viewBox="0 0 40 40" width="14" style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 4 }}>
    <path d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" fillRule="evenodd" />
  </svg>
);

const ProfileHeader = ({ profile, postsCount, isOwnProfile, onMessage }) => (
  <section className="ig-profile-header">
    {/* Avatar */}
    <div>
      <img
        className="ig-profile-avatar"
        src={profile.avatar || "https://placehold.co/220x220?text=Avatar"}
        alt={profile.username}
      />
    </div>

    {/* Meta */}
    <div className="ig-profile-meta">
      {/* Row 1: username + buttons */}
      <div className="ig-profile-row">
        <h1 className="ig-profile-username" style={{ fontWeight: 400, fontSize: 22 }}>
          {profile.username}
        </h1>

        {isOwnProfile ? (
          <>
            <Link to="/settings">
              <button className="ig-profile-btn" type="button">Edit Profile</button>
            </Link>
            <button className="ig-profile-btn" type="button">
              <GearIcon />
            </button>
          </>
        ) : (
          <>
            <button className="ig-profile-btn ig-profile-btn-primary" type="button">
              Follow
            </button>
            <button className="ig-profile-btn" type="button" onClick={onMessage}>
              Message
            </button>
            <button className="ig-profile-icon-btn" type="button">+ Person</button>
            <button type="button" className="ig-profile-more-btn">
              •••
            </button>
          </>
        )}
      </div>

      {/* Row 2: stats */}
      <div className="ig-profile-stats">
        <span><strong>{postsCount}</strong> posts</span>
        <span><strong>{(profile.followersCount || 0).toLocaleString()}</strong> followers</span>
        <span><strong>{profile.followingCount || 0}</strong> following</span>
      </div>

      {/* Row 3: bio */}
      <div className="ig-profile-bio">
        <strong>{profile.fullName || profile.username}</strong>
        {!isOwnProfile && <VerifiedIcon />}
        {profile.category && <div style={{ color: "var(--tcl-muted)", fontSize: 13 }}>{profile.category}</div>}
        <div style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>
          {profile.bio || "Visual Storyteller & Creative Director.\nCapturing the quiet moments between the noise."}
        </div>
        {profile.website && (
          <a href={profile.website} target="_blank" rel="noreferrer" className="ig-link" style={{ marginTop: 4, display: "inline-block" }}>
            {profile.website.replace(/^https?:\/\//, "")}
          </a>
        )}
      </div>
    </div>
  </section>
);

export default ProfileHeader;
