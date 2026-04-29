"use client";

// ============================================================================
// VIDEO PLAYER — 9:16 Aspect Ratio Media Player
// ============================================================================
// Features:
//   - Strict 9:16 mobile-portrait aspect ratio
//   - Glassmorphism lock overlay when course is locked
//   - Custom controls: play/pause, progress bar, fullscreen
//   - Depth-of-field ambient glow effect
//   - Resumes playback from saved position
// ============================================================================

import { useState, useRef, useCallback, useEffect } from "react";
import { useVideoProgress } from "@/hooks/useVideoProgress";

interface VideoPlayerProps {
  courseId: number;
  videoUrl: string;
  isLocked: boolean;
  onUnlock: () => void;
  isUnlocking?: boolean;
}

export default function VideoPlayer({
  courseId,
  videoUrl,
  isLocked,
  onUnlock,
  isUnlocking = false,
}: VideoPlayerProps) {
  const { progress, attachVideo, onTimeUpdate, onEnded } =
    useVideoProgress(courseId);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef<NodeJS.Timeout | null>(null);

  const handleVideoRef = useCallback(
    (el: HTMLVideoElement | null) => {
      videoElementRef.current = el;
      attachVideo(el);
    },
    [attachVideo]
  );

  const togglePlay = useCallback(() => {
    const video = videoElementRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const video = videoElementRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    setDuration(video.duration || 0);
    onTimeUpdate();
  }, [onTimeUpdate]);

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const video = videoElementRef.current;
      if (!video) return;
      const time = parseFloat(e.target.value);
      video.currentTime = time;
      setCurrentTime(time);
    },
    []
  );

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }, []);

  // Auto-hide controls after 3s of inactivity
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="video-container relative mx-auto"
      style={{
        aspectRatio: "9/16",
        maxHeight: "70vh",
        width: "auto",
      }}
      onMouseMove={resetControlsTimer}
      onTouchStart={resetControlsTimer}
    >
      {/* ── Ambient Glow Background ──────────────────────────────────── */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(
            ellipse 80% 60% at 50% 40%,
            rgba(0, 229, 255, 0.08) 0%,
            rgba(179, 136, 255, 0.04) 40%,
            transparent 70%
          )`,
          filter: "blur(40px)",
          transform: "scale(1.3)",
        }}
      />

      {/* ── Video Element ────────────────────────────────────────────── */}
      <video
        ref={handleVideoRef}
        src={isLocked ? undefined : videoUrl}
        className="w-full h-full object-cover rounded-2xl"
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          onEnded();
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        playsInline
        preload="metadata"
      />

      {/* ── Lock Overlay ─────────────────────────────────────────────── */}
      {isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center glass-strong rounded-2xl z-10">
          {/* Lock icon */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-float"
            style={{
              background: "rgba(0, 229, 255, 0.1)",
              border: "2px solid rgba(0, 229, 255, 0.3)",
            }}
          >
            <svg
              className="w-10 h-10"
              style={{ color: "var(--accent-cyan)" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3
            className="text-lg font-bold mb-2"
            style={{ color: "var(--foreground)" }}
          >
            Course Locked
          </h3>
          <p
            className="text-sm mb-6 text-center max-w-[200px]"
            style={{ color: "var(--foreground-muted)" }}
          >
            Unlock this course to start learning and earning tokens
          </p>
          <button
            id="unlock-course-btn"
            onClick={onUnlock}
            disabled={isUnlocking}
            className="btn-primary !rounded-full flex items-center gap-2"
          >
            {isUnlocking ? (
              <>
                <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                Unlocking...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                  />
                </svg>
                Unlock Course (1 XLM)
              </>
            )}
          </button>
        </div>
      )}

      {/* ── Custom Controls ──────────────────────────────────────────── */}
      {!isLocked && (
        <div
          className="absolute inset-0 flex flex-col justify-end z-10 rounded-2xl overflow-hidden transition-opacity duration-300"
          style={{ opacity: showControls ? 1 : 0 }}
        >
          {/* Click to play/pause */}
          <button
            className="absolute inset-0 cursor-pointer"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
          />

          {/* Play indicator */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(0, 229, 255, 0.2)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <svg
                  className="w-8 h-8 ml-1"
                  style={{ color: "var(--accent-cyan)" }}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}

          {/* Progress bar area */}
          <div
            className="relative px-4 pb-4 pt-12"
            style={{
              background:
                "linear-gradient(transparent, rgba(6, 9, 24, 0.9))",
            }}
          >
            {/* Progress bar */}
            <div className="relative h-1 rounded-full mb-3 overflow-hidden"
              style={{ background: "rgba(255, 255, 255, 0.1)" }}>
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${progressPercent}%`,
                  background: "var(--gradient-primary)",
                }}
              />
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span
                className="text-xs font-mono"
                style={{ color: "var(--foreground-muted)" }}
              >
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <div className="flex items-center gap-2">
                {/* Completion badge */}
                {progress.hasCompleted && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(0, 230, 118, 0.15)",
                      color: "var(--accent-green)",
                    }}
                  >
                    ✓ Completed
                  </span>
                )}
                {/* Fullscreen button */}
                <button
                  onClick={toggleFullscreen}
                  className="p-1 rounded-md transition-colors hover:bg-white/10"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
