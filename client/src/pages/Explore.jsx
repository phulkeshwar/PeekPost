import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import ExploreGrid from "../components/explore/ExploreGrid";
import { api } from "../services/api";
import { getStoredUsers } from "../utils/mockData";

const ExploreSearch = ({ query, setQuery }) => {
  const [results, setResults] = useState([]);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const fetchUsers = async () => {
      try {
        const { data } = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
        setResults(data);
      } catch {
        const localMatches = getStoredUsers().filter((user) =>
          [user.username, user.fullName, user.email]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(query.toLowerCase())),
        );
        setResults(localMatches);
      }
    };
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="ig-explore-search-bar" ref={containerRef} style={{ position: "relative" }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, color: "var(--tcl-muted)" }}>
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        placeholder="Search curated collections, creators, or styles..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
      />
      {focused && query.trim() && (
        <div className="ig-search-results">
          {results.length > 0 ? (
            results.map((user) => (
              <Link key={user._id || user.id} to={`/profile/${user.username}`} className="ig-search-result-item" onClick={() => setFocused(false)}>
                <img src={user.avatar || "https://placehold.co/40x40?text=U"} alt={user.username} className="ig-search-result-avatar" />
                <div>
                  <div className="ig-search-result-username">{user.username}</div>
                  <div className="ig-search-result-name">{user.fullName}</div>
                </div>
              </Link>
            ))
          ) : (
            <div style={{ padding: "14px", textAlign: "center", color: "var(--tcl-muted)", fontSize: 14 }}>No results found.</div>
          )}
        </div>
      )}
    </div>
  );
};

const MOCK_EXPLORE_DATA = [
  { url: "https://picsum.photos/seed/curated-1/400/800", type: "image" },
  { url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", type: "video" },
  { url: "https://picsum.photos/seed/curated-3/600/400", type: "image" },
  { url: "https://picsum.photos/seed/curated-4/400/600", type: "image" },
  { url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", type: "video" },
  { url: "https://picsum.photos/seed/curated-6/500/1000", type: "image" },
  { url: "https://picsum.photos/seed/curated-7/700/500", type: "image" },
  { url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", type: "video" },
  { url: "https://picsum.photos/seed/curated-9/400/400", type: "image" },
  { url: "https://picsum.photos/seed/curated-10/400/800", type: "image" },
].map((item, i) => ({
  _id: `mock-exp-${i}`,
  media: [item],
}));

const Explore = () => {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/explore");
        setItems(data.length ? data : MOCK_EXPLORE_DATA);
      } catch {
        setItems(MOCK_EXPLORE_DATA);
      }
    };
    load();
  }, []);

  return (
    <div className="ig-explore-wrap">
      <ExploreSearch query={query} setQuery={setQuery} />
      <ExploreGrid items={items} />
    </div>
  );
};

export default Explore;
