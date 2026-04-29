"use client";

import { useState, useCallback, useEffect } from "react";
import VideoPlayer from "./VideoPlayer";
import QuizModule from "./QuizModule";
import { useWallet } from "@/context/WalletProvider";
import { useToast } from "@/components/Toast";
import { COURSES } from "@/data/courses";

type CourseStage = "locked" | "watching" | "quiz" | "completed";

export default function CourseView({ courseId = 0 }: { courseId?: number }) {
  const course = COURSES.find(c => c.id === courseId) || COURSES[0];
  const { isConnected } = useWallet();
  const { showToast } = useToast();
  const [stage, setStage] = useState<CourseStage>("locked");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUnlock = useCallback(async () => {
    if (!isConnected) { showToast("CONNECT WALLET FIRST"); return; }
    setIsUnlocking(true);
    try {
      await new Promise((r) => setTimeout(r, 1800));
      setStage("watching");
      showToast("COURSE UNLOCKED — TX CONFIRMED");
    } catch { showToast("UNLOCK FAILED"); }
    finally { setIsUnlocking(false); }
  }, [isConnected, showToast]);

  // Reset stage when course changes
  useEffect(() => {
    setStage("locked");
  }, [courseId]);

  const handleQuizSubmit = useCallback(async (answers: number[]): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const passed = answers.every((a, i) => a === course.questions[i].correctIndex);
      if (passed) setStage("completed");
      return passed;
    } finally { setIsSubmitting(false); }
  }, [course]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Course Header */}
      <div
        className="course-header"
        style={{
          padding: "48px 44px 32px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "var(--gradient-glow), var(--dim)",
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Decorative gradient orbs */}
        <div style={{ position: "absolute", top: -80, right: -60, width: 300, height: 300, background: "radial-gradient(circle, rgba(0,255,159,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -40, left: -60, width: 300, height: 300, background: "radial-gradient(circle, rgba(0,229,255,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 500, height: 500, background: "radial-gradient(circle, rgba(179,136,255,0.03) 0%, transparent 50%)", pointerEvents: "none" }} />

        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.3em",
          textTransform: "uppercase", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ width: 28, height: 2, background: "var(--gradient-main)", display: "inline-block", borderRadius: 1 }} />
          <span className="text-gradient">COURSE_{String(course.id + 1).padStart(2, "0")}</span>
          <span style={{ color: "#555" }}>— STELLAR ECOSYSTEM</span>
          <span style={{ width: 28, height: 2, background: "var(--gradient-main)", display: "inline-block", borderRadius: 1 }} />
        </div>

        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 4vw, 4rem)",
          letterSpacing: "0.06em",
          lineHeight: 1,
          textTransform: "uppercase",
          marginBottom: 20,
          whiteSpace: "nowrap",
        }}>
          {course.title} <span className="text-gradient">{course.subtitle}</span>
        </h1>

        <div style={{
          display: "flex", gap: 14, fontFamily: "var(--font-mono)", fontSize: "0.68rem",
          letterSpacing: "0.08em", textTransform: "uppercase", color: "#555",
          flexWrap: "wrap", justifyContent: "center",
        }}>
          {[
            { label: "DURATION", val: course.duration, color: "rgba(255,255,255,0.8)" },
            { label: "LEVEL", val: course.level, color: course.level === "BEGINNER" ? "var(--neon)" : course.level === "ADVANCED" ? "var(--purple)" : "var(--cyan)" },
            { label: "REWARD", val: course.reward, color: "var(--neon)" },
            { label: "ENROLLED", val: course.enrolled, color: "var(--purple)" },
          ].map(m => (
            <div key={m.label} style={{
              padding: "6px 14px", borderRadius: 6,
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
            }}>
              {m.label} <span style={{ color: m.color, fontWeight: 600 }}>{m.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Video */}
      <VideoPlayer courseId={course.id} videoUrl={`https://www.youtube.com/watch?v=${course.videoId}`}
        isLocked={stage === "locked"} onUnlock={handleUnlock} isUnlocking={isUnlocking} />

      {/* Start quiz button */}
      {stage === "watching" && (
        <div style={{ padding: "24px 44px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "var(--dim)" }}>
          <button
            onClick={() => setStage("quiz")}
            style={{
              fontFamily: "var(--font-mono)", fontSize: "0.78rem", fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
              background: "var(--gradient-main)", backgroundSize: "200% 200%",
              color: "var(--black)", border: "none", padding: "16px 36px",
              borderRadius: 8, cursor: "pointer", width: "100%",
              boxShadow: "0 4px 24px rgba(0,255,159,0.2)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,255,159,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,255,159,0.2)"; }}
          >
            → START KNOWLEDGE CHECK
          </button>
        </div>
      )}

      {/* Quiz */}
      {(stage === "quiz" || stage === "completed") && (
        <QuizModule courseId={course.id} questions={course.questions}
          onSubmit={handleQuizSubmit} isSubmitting={isSubmitting} />
      )}
    </div>
  );
}
