import { useRef, useState, useEffect } from "react";

const ReelPlayer = ({ src, onDoubleClick, playing }) => {
  const videoRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // When active visible state changes, synchronize playback
  useEffect(() => {
    if (!videoRef.current) return;
    if (playing) {
      setIsPaused(false); // Reset manual pause on scroll-in
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [playing]);

  // Handle local play/pause sync
  useEffect(() => {
    if (!videoRef.current) return;
    if (playing && !isPaused) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [playing, isPaused]);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (!isPaused) {
      videoRef.current.pause();
      setIsPaused(true);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPaused(false);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", cursor: "pointer" }} onClick={togglePlay} onDoubleClick={onDoubleClick}>
      <video
        ref={videoRef}
        className="ig-reel-video"
        src={src}
        loop
        muted={false}
        playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      {isPaused && (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(0,0,0,0.35)", pointerEvents: "none", zIndex: 5 }}>
          <span style={{ fontSize: 44, color: "#fff", opacity: 0.85 }}>▶</span>
        </div>
      )}
    </div>
  );
};

export default ReelPlayer;