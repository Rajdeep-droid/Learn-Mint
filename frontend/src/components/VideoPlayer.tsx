"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { useWallet } from "@/context/WalletProvider";
import { useToast } from "@/components/Toast";
import ReactPlayer from "react-player";

interface VideoPlayerProps {
  courseId: number;
  videoUrl: string;
  isLocked: boolean;
  onUnlock: () => void;
  isUnlocking?: boolean;
}

const CHAPTERS = [
  { num: "01", title: "INTRO TO STELLAR", desc: "Overview of the Stellar ecosystem", done: true },
  { num: "02", title: "ACCOUNTS & KEYS", desc: "Public keys, secret keys & keypairs", done: true },
  { num: "03", title: "TRANSACTIONS", desc: "Building & submitting transactions", done: false, active: true },
  { num: "04", title: "CONSENSUS", desc: "How SCP achieves agreement", done: false },
  { num: "05", title: "SMART CONTRACTS", desc: "Introduction to on-chain logic", done: false },
  { num: "06", title: "SOROBAN SDK", desc: "Write your first Soroban contract", done: false },
];

const CH_COLORS = [
  { bg: "rgba(0,255,159,0.05)", border: "rgba(0,255,159,0.15)", accent: "var(--neon)" },
  { bg: "rgba(0,229,255,0.05)", border: "rgba(0,229,255,0.15)", accent: "var(--cyan)" },
  { bg: "rgba(179,136,255,0.05)", border: "rgba(179,136,255,0.15)", accent: "var(--purple)" },
  { bg: "rgba(255,196,0,0.05)", border: "rgba(255,196,0,0.15)", accent: "var(--amber)" },
  { bg: "rgba(59,130,246,0.05)", border: "rgba(59,130,246,0.15)", accent: "var(--blue)" },
  { bg: "rgba(255,71,87,0.05)", border: "rgba(255,71,87,0.15)", accent: "var(--red)" },
];

const Player: any = ReactPlayer;

export default function VideoPlayer({
  courseId, videoUrl, isLocked, onUnlock, isUnlocking = false,
}: VideoPlayerProps) {
  const { progress, attachVideo, onTimeUpdate, onEnded } = useVideoProgress(courseId);
  const { isConnected } = useWallet();
  const { showToast } = useToast();
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [activeChapter, setActiveChapter] = useState(2);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset state when the course changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setShowControls(false);
    setActiveChapter(0);
  }, [courseId]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const v = playerRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = (e.clientX - rect.left) / rect.width;
    v.seekTo(fraction, "fraction");
  }, []);

  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${Math.floor(s % 60).toString().padStart(2, "0")}`;

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!mounted) {
    return (
      <div className="video-section" style={{
        padding: "32px 36px", background: "linear-gradient(180deg, var(--deep) 0%, var(--dim) 100%)",
        display: "flex", gap: 20, alignItems: "stretch", minHeight: 520, borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        {/* Placeholder while mounting */}
        <div style={{ width: "100%", maxWidth: 640, aspectRatio: "16/9", borderRadius: 16, background: "#0a0a1a" }} />
      </div>
    );
  }

  return (
    <div className="video-section" style={{
      padding: "32px 36px",
      background: "linear-gradient(180deg, var(--deep) 0%, var(--dim) 100%)",
      display: "flex", gap: 20, alignItems: "stretch",
      minHeight: 520, position: "relative",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}>
      {/* Glow orb behind video */}
      <div className="mobile-hide" style={{
        position: "absolute", top: "50%", left: 100, transform: "translateY(-50%)",
        width: 640, height: 360,
        background: "radial-gradient(ellipse, rgba(0,255,159,0.05) 0%, rgba(0,229,255,0.02) 40%, transparent 70%)",
        pointerEvents: "none", borderRadius: "50%",
      }} />

      {/* 16:9 Video Player */}
      <div
        ref={containerRef}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        style={{
          position: "relative", width: "100%", maxWidth: 640, aspectRatio: "16/9",
          borderRadius: 16, background: "#0a0a1a", overflow: "hidden", flexShrink: 0,
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 0 60px rgba(0,255,159,0.08), 0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ width: "100%", height: "100%", opacity: isLocked ? 0 : 1, transition: "opacity 0.3s" }}>
          <Player
            ref={playerRef}
            src={videoUrl}
            playing={!isLocked && isPlaying}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            width="100%"
            height="100%"
            style={{ objectFit: "cover" }}
            onProgress={(state: any) => { setCurrentTime(state.playedSeconds); onTimeUpdate(); }}
            onDuration={(d: number) => setDuration(d)}
            onEnded={() => { setIsPlaying(false); onEnded(); }}
            controls={true}
            config={{ youtube: { playerVars: { modestbranding: 1, rel: 0 } } } as any}
          />
        </div>

        {/* Lock overlay */}
        {isLocked && (
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(160deg, rgba(13,13,32,0.95) 0%, rgba(5,5,16,0.95) 50%, rgba(10,26,21,0.95) 100%)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 16, zIndex: 20,
          }}>
            <div className="animate-float" style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "rgba(0,255,159,0.08)", border: "1px solid rgba(0,255,159,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.8rem", color: "var(--neon)",
            }}>⬡</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", letterSpacing: "0.12em", textAlign: "center", lineHeight: 1.1 }}>
              UNLOCK<br />COURSE
            </div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: "0.75rem", letterSpacing: "0.15em",
              color: "var(--neon)", padding: "4px 12px", borderRadius: 4,
              background: "rgba(0,255,159,0.08)", border: "1px solid rgba(0,255,159,0.2)",
            }}>1 XLM</div>
            <button
              onClick={() => { if (!isConnected) { showToast("CONNECT WALLET FIRST"); return; } onUnlock(); }}
              disabled={isUnlocking}
              style={{
                fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase",
                background: "var(--gradient-main)", backgroundSize: "200% 200%",
                color: "var(--black)", border: "none", padding: "12px 28px",
                borderRadius: 8, cursor: "pointer", marginTop: 8,
                boxShadow: "0 4px 20px rgba(0,255,159,0.2)",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
            >{isUnlocking ? "PROCESSING..." : "→ UNLOCK NOW"}</button>
          </div>
        )}
      </div>

      {/* Right side — Chapter Cards Grid */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, minHeight: 0 }}>
        {/* Progress + Chapter + Time row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          <div style={{
            padding: "12px 14px", borderRadius: 8,
            background: "rgba(0,255,159,0.04)", border: "1px solid rgba(0,255,159,0.12)",
          }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#666", marginBottom: 4 }}>
              PROGRESS
            </div>
            <div className="text-gradient" style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", lineHeight: 1 }}>
              {Math.round(pct)}%
            </div>
          </div>
          <div style={{
            padding: "12px 14px", borderRadius: 8,
            background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.12)",
          }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#666", marginBottom: 4 }}>
              CHAPTER
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", lineHeight: 1, color: "var(--cyan)" }}>
              {CHAPTERS[activeChapter]?.num}
            </div>
          </div>
          <div style={{
            padding: "12px 14px", borderRadius: 8,
            background: "rgba(179,136,255,0.04)", border: "1px solid rgba(179,136,255,0.12)",
          }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#666", marginBottom: 4 }}>
              DURATION
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", lineHeight: 1, color: "var(--purple)" }}>
              4:30
            </div>
          </div>
        </div>

        {/* Chapter label */}
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.2em",
          textTransform: "uppercase", color: "#555", display: "flex", alignItems: "center", gap: 6,
          padding: "2px 0",
        }}>
          <span style={{ width: 12, height: 2, background: "var(--gradient-main)", display: "inline-block", borderRadius: 1 }} />
          CHAPTERS
        </div>

        {/* Chapter Cards Grid — 2x3, fills remaining height */}
        <div style={{ display: "grid", gridAutoFlow: "column", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr 1fr", gap: 6, flex: 1 }}>
          {CHAPTERS.map((ch, i) => {
            const c = CH_COLORS[i];
            const isActive = i === activeChapter;
            const isDone = ch.done;
            return (
              <div key={ch.num}
                onClick={() => { setActiveChapter(i); showToast(`CHAPTER ${ch.num}: ${ch.title}`); }}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: isActive ? c.bg : "rgba(255,255,255,0.015)",
                  border: `1px solid ${isActive ? c.border : "rgba(255,255,255,0.05)"}`,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = c.bg;
                    e.currentTarget.style.borderColor = c.border;
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.015)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.transform = "";
                  }
                }}
              >
                {/* Top row: number + status */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.08em",
                    color: isActive ? c.accent : "#777",
                    fontWeight: 800,
                  }}>
                    CH.{ch.num}
                  </span>
                  {isDone && (
                    <span style={{
                      fontSize: "0.45rem", padding: "2px 6px", borderRadius: 8,
                      background: "rgba(0,255,159,0.1)", color: "var(--neon)",
                      fontFamily: "var(--font-mono)", letterSpacing: "0.1em", fontWeight: 600,
                    }}>DONE</span>
                  )}
                  {isActive && !isDone && (
                    <span style={{
                      fontSize: "0.45rem", padding: "2px 6px", borderRadius: 8,
                      background: "rgba(0,229,255,0.1)", color: "var(--cyan)",
                      fontFamily: "var(--font-mono)", letterSpacing: "0.1em", fontWeight: 600,
                    }}>ACTIVE</span>
                  )}
                </div>

                {/* Title */}
                <div style={{
                  fontFamily: "var(--font-display)", fontSize: "0.85rem",
                  letterSpacing: "0.04em", lineHeight: 1.1,
                  color: isActive || isDone ? "var(--white)" : "rgba(255,255,255,0.4)",
                  marginBottom: 2,
                }}>
                  {ch.title}
                </div>

                {/* Description */}
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.48rem",
                  letterSpacing: "0.02em", lineHeight: 1.3,
                  color: isActive ? "rgba(255,255,255,0.5)" : "#444",
                }}>
                  {ch.desc}
                </div>

                {/* Active indicator bar */}
                {isActive && (
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
                    background: "var(--gradient-main)",
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
