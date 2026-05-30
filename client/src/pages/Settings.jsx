import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { api } from "../services/api";
import { logoutLocal, updateUserLocal } from "../redux/slices/authSlice";

const menuItems = [
  "Edit profile",
  "Professional account",
  "Change password",
  "Apps and websites",
  "Email notifications",
  "Push notifications",
  "Privacy and security",
  "Login activity",
  "Help",
];

const Settings = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    username: user?.username || "",
    website: user?.website || "",
    bio: user?.bio || "",
    email: user?.email || "",
    phone: "+91 971",
    gender: "Prefer not to say",
    suggestions: true,
    avatar: user?.avatar || "",
  });

  const save = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.put("/users/me", {
        fullName: form.fullName,
        bio: form.bio,
        website: form.website,
        avatar: form.avatar,
      });
      dispatch(updateUserLocal(data));
      setMessage("Profile updated successfully.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update profile.");
    }
  };

  const deactivate = async () => {
    await api.delete("/users/me");
    dispatch(logoutLocal());
  };

  return (
    <div className="ig-settings-wrap">
      <aside className="ig-settings-menu">
        <div className="ig-settings-pane">
          <h3 style={{ margin: 0, fontSize: 24 }}>Some account settings are moving</h3>
          <p className="ig-muted" style={{ lineHeight: 1.5 }}>
            Soon, Accounts Center will be the primary place to manage your account info and settings.
          </p>
          <a className="ig-link" href="https://about.meta.com" target="_blank" rel="noreferrer">
            Learn more
          </a>
        </div>

        {menuItems.map((item, index) => (
          <div key={item} className={`ig-settings-menu-item${index === 0 ? " active" : ""}`}>
            {item}
          </div>
        ))}

        <div className="ig-settings-pane" style={{ borderTop: "1px solid #dbdbdb" }}>
          <a className="ig-link" href="#switch">
            Switch to personal account
          </a>
        </div>

        <div className="ig-settings-pane" style={{ borderTop: "1px solid #dbdbdb" }}>
           <h3 style={{ margin: 0, fontSize: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
             <span style={{ fontSize: 20, color: 'var(--ig-blue)' }}>∞ Meta</span>
           </h3>
           <p className="ig-link" style={{ fontSize: 16, marginTop: 8, marginBottom: 8, fontWeight: '700' }}>Accounts Center</p>
           <p className="ig-muted" style={{ lineHeight: 1.3, fontSize: 12 }}>
             Control settings for connected experiences across Instagram, the Facebook app and Messenger, including story and post sharing and logging in.
           </p>
        </div>
      </aside>

      <section className="ig-settings-pane">
        <form className="ig-settings-form" onSubmit={save}>
          <div className="ig-settings-profile">
            <img className="ig-settings-avatar" src={form.avatar || "https://placehold.co/120x120?text=U"} alt="me" />
            <div>
              <div style={{ fontWeight: 700 }}>{form.username}</div>
              <div className="ig-link">Change profile photo</div>
            </div>
          </div>

          <div className="ig-settings-row">
            <label className="ig-settings-label" htmlFor="fullName">
              Name
            </label>
            <div>
              <input
                id="fullName"
                className="ig-input"
                value={form.fullName}
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              />
              <p className="ig-settings-help">
                Help people discover your account by using the name you're known by.
              </p>
            </div>
          </div>

          <div className="ig-settings-row">
            <label className="ig-settings-label" htmlFor="username">
              Username
            </label>
            <div>
              <input
                id="username"
                className="ig-input"
                value={form.username}
                onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              />
              <p className="ig-settings-help">In most cases, you'll be able to change your username back for 14 days.</p>
            </div>
          </div>

          <div className="ig-settings-row">
            <label className="ig-settings-label" htmlFor="website">
              Website
            </label>
            <div>
              <input
                id="website"
                className="ig-input"
                value={form.website}
                onChange={(event) => setForm((prev) => ({ ...prev, website: event.target.value }))}
                placeholder="Website"
              />
            </div>
          </div>

          <div className="ig-settings-row">
            <label className="ig-settings-label" htmlFor="bio">
              Bio
            </label>
            <div>
              <textarea
                id="bio"
                className="ig-textarea"
                value={form.bio}
                onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
              />
              <p className="ig-settings-help" style={{ textAlign: 'right' }}>0 / 150</p>
              
              <div style={{ marginTop: '30px' }}>
                <strong style={{ color: 'var(--ig-muted)' }}>Personal information</strong>
                <p className="ig-settings-help" style={{ marginTop: 4 }}>
                  Provide your personal information, even if the account is used for a business, a pet or something else. This won't be a part of your public profile.
                </p>
              </div>
            </div>
          </div>

          <div className="ig-settings-row">
            <label className="ig-settings-label" htmlFor="email">
              Email
            </label>
            <div>
              <input
                id="email"
                className="ig-input"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </div>
          </div>

          <div className="ig-settings-row">
            <label className="ig-settings-label" htmlFor="phone">
              Phone number
            </label>
            <div>
              <input
                id="phone"
                className="ig-input"
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              />
            </div>
          </div>

          <div className="ig-settings-row">
            <label className="ig-settings-label" htmlFor="gender">
              Gender
            </label>
            <div>
              <select
                id="gender"
                className="ig-select"
                value={form.gender}
                onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}
              >
                <option>Prefer not to say</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="ig-settings-row">
            <label className="ig-settings-label" htmlFor="suggestions">
              Show account suggestions on profiles
            </label>
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", paddingTop: "8px" }}>
              <input
                id="suggestions"
                type="checkbox"
                checked={form.suggestions}
                onChange={(event) => setForm((prev) => ({ ...prev, suggestions: event.target.checked }))}
                style={{ marginTop: "4px" }}
              />
              <p className="ig-settings-help" style={{ margin: 0 }}>
                <strong style={{ display: 'block', color: 'var(--ig-text)', fontSize: 13, lineHeight: 1.4 }}>
                  Choose whether people can see similar account suggestions on your profile, and whether your account can be suggested on other profiles. <a href="#" style={{ color: 'var(--ig-blue)', textDecoration: 'none' }}>[?]</a>
                </strong>
              </p>
            </div>
          </div>

          <div className="ig-settings-row">
            <span className="ig-settings-label" />
            <div className="ig-settings-footer" style={{ marginTop: '20px', justifyContent: 'space-between' }}>
              <button className="ig-btn-primary" type="submit" style={{ padding: '6px 18px' }}>
                Submit
              </button>
              <button 
                type="button" 
                onClick={deactivate}
                style={{ border: 0, background: 'transparent', color: 'var(--ig-blue)', fontWeight: 700, padding: 0 }}
              >
                Temporarily deactivate my account
              </button>
            </div>
          </div>

          {message && (
            <div className="ig-settings-row">
              <span className="ig-settings-label" />
              <div style={{ color: "#2a7c2a", fontWeight: 700 }}>{message}</div>
            </div>
          )}
        </form>
      </section>
    </div>
  );
};

export default Settings;