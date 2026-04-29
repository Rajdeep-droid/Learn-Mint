"use client";

// ============================================================================
// useVideoProgress — Track video playback and completion per course
// ============================================================================

import { useCallback, useRef, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

interface VideoProgress {
  currentTime: number;
  duration: number;
  hasCompleted: boolean;
}

const defaultProgress: VideoProgress = {
  currentTime: 0,
  duration: 0,
  hasCompleted: false,
};

export function useVideoProgress(courseId: number) {
  const [progress, setProgress, clearProgress] = useLocalStorage<VideoProgress>(
    `video-progress-${courseId}`,
    defaultProgress
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Restore playback position when video element is set
  const attachVideo = useCallback(
    (video: HTMLVideoElement | null) => {
      videoRef.current = video;
      if (video && progress.currentTime > 0) {
        video.currentTime = progress.currentTime;
      }
    },
    [progress.currentTime]
  );

  // Update progress as video plays
  const onTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setProgress((prev) => ({
      ...prev,
      currentTime: video.currentTime,
      duration: video.duration || prev.duration,
    }));
  }, [setProgress]);

  // Mark completion when video ends
  const onEnded = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      hasCompleted: true,
    }));
  }, [setProgress]);

  // Auto-save periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (video && !video.paused) {
        setProgress((prev) => ({
          ...prev,
          currentTime: video.currentTime,
          duration: video.duration || prev.duration,
        }));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [setProgress]);

  return {
    progress,
    attachVideo,
    onTimeUpdate,
    onEnded,
    clearProgress,
    videoRef,
  };
}
