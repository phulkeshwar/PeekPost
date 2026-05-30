import { useRef, useState } from "react";

const ReelPlayer = ({ src, onDoubleClick }) => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", cursor: "pointer" }} onClick={togglePlay} onDoubleClick={onDoubleClick}>
      <video
        ref={videoRef}
        className="ig-reel-video"
        src={src}
        autoPlay
        loop
        muted={false}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      {!playing && (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(0,0,0,0.35)", pointerEvents: "none", zIndex: 5 }}>
          <span style={{ fontSize: 44, color: "#fff", opacity: 0.85 }}>▶</span>
        </div>
      )}
    </div>
  );
};

export default ReelPlayer;