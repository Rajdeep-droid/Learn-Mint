"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuizState } from "@/hooks/useQuizState";
import { useToast } from "@/components/Toast";

export interface QuizQuestion { question: string; options: string[]; }

interface QuizModuleProps {
  courseId: number;
  questions: QuizQuestion[];
  onSubmit: (answers: number[]) => Promise<boolean>;
  isSubmitting?: boolean;
  onRetake?: () => void;
}

const L = ["A", "B", "C", "D"];
const COLORS = ["var(--neon)", "var(--cyan)", "var(--purple)", "var(--amber)"];

export default function QuizModule({ courseId, questions, onSubmit, isSubmitting = false, onRetake }: QuizModuleProps) {
  const { quizState, selectAnswer, nextQuestion, prevQuestion, markSubmitted, resetQuiz } = useQuizState(courseId);
  const { showToast } = useToast();
  const [shaking, setSh] = useState(false);
  const total = questions.length;
  const currentQ = questions[quizState.currentQuestion];
  const answered = Object.keys(quizState.selectedAnswers).length;
  const allDone = answered === total;
  const isLast = quizState.currentQuestion === total - 1;

  // Clear any stale submitted state when the quiz mounts fresh
  useEffect(() => {
    if (quizState.isSubmitted) {
      resetQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handleSubmit = useCallback(async () => {
    const ans = Array.from({ length: total }, (_, i) => quizState.selectedAnswers[i] ?? -1);
    try {
      const p = await onSubmit(ans);
      markSubmitted(p);
      showToast(p ? "QUIZ PASSED ✓" : "INCORRECT ✗");
      if (!p) { setSh(true); setTimeout(() => setSh(false), 600); }
    } catch { setSh(true); setTimeout(() => setSh(false), 600); }
  }, [total, quizState.selectedAnswers, onSubmit, markSubmitted, showToast]);

  // ── Complete state ──
  if (quizState.isSubmitted) {
    const passed = quizState.isPassed;
    return (
      <div style={{ padding: "48px 44px", background: "var(--gradient-glow), var(--dim)" }} className="animate-slideIn">
        <div style={{
          fontFamily: "var(--font-display)", fontSize: "clamp(3.5rem, 7vw, 7rem)",
          letterSpacing: "0.04em", lineHeight: 0.85,
        }}>
          <span className={passed ? "text-gradient" : ""} style={passed ? {} : { color: "var(--red)" }}>
            {passed ? "PASSED" : "FAILED"}
          </span>
        </div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "0.75rem", letterSpacing: "0.12em",
          textTransform: "uppercase", color: "#777",
          borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16, marginTop: 20,
        }}>
          {passed ? "ALL CHECKS CLEARED — MINT YOUR CERTIFICATE" : "REVIEW AND TRY AGAIN"}
        </div>
        <button onClick={passed ? () => showToast("MINTING ON-CHAIN...") : () => { resetQuiz(); onRetake?.(); }}
          style={{
            marginTop: 20, fontFamily: "var(--font-mono)", fontSize: "0.8rem", fontWeight: 700,
            letterSpacing: "0.12em", textTransform: "uppercase",
            background: passed ? "var(--gradient-main)" : "transparent",
            backgroundSize: "200% 200%",
            color: passed ? "var(--black)" : "var(--white)",
            border: passed ? "none" : "1px solid rgba(255,255,255,0.15)",
            padding: "16px 36px", borderRadius: 8, cursor: "pointer",
            boxShadow: passed ? "0 4px 24px rgba(0,255,159,0.2)" : "none",
          }}>
          {passed ? "⬡ MINT NFT CERTIFICATE" : "↺ RETAKE QUIZ"}
        </button>
      </div>
    );
  }

  // ── Active quiz ──
  return (
    <div className={shaking ? "animate-shake" : ""}>
      {/* Header */}
      <div style={{
        padding: "24px 44px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "var(--gradient-glow), var(--dim)",
        display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16,
      }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3vw, 2.8rem)", letterSpacing: "0.06em", lineHeight: 1 }}>
          KNOWLEDGE CHECK
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
          {Array.from({ length: total }, (_, i) => (
            <div key={i} style={{
              width: 24, height: 8, borderRadius: 3,
              border: `1px solid ${quizState.selectedAnswers[i] !== undefined ? "transparent" : i === quizState.currentQuestion ? "var(--cyan)" : "rgba(255,255,255,0.1)"}`,
              background: quizState.selectedAnswers[i] !== undefined
                ? `linear-gradient(90deg, var(--neon), var(--cyan))`
                : i === quizState.currentQuestion ? "rgba(0,229,255,0.15)" : "transparent",
              transition: "all 0.2s",
            }} />
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "36px 44px 44px", minHeight: 300 }} className="animate-slideIn" key={quizState.currentQuestion}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.25em",
          textTransform: "uppercase", marginBottom: 14,
        }}>
          <span className="text-gradient">QUESTION {String(quizState.currentQuestion + 1).padStart(2, "0")}</span>
          <span style={{ color: "#555" }}> OF {total}</span>
        </div>
        <div style={{
          fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 2.5vw, 2.3rem)",
          letterSpacing: "0.04em", lineHeight: 1.1, marginBottom: 32, maxWidth: 640,
        }}>
          {currentQ?.question}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {currentQ?.options.map((opt, idx) => {
            const sel = quizState.selectedAnswers[quizState.currentQuestion] === idx;
            return (
              <button key={idx}
                onClick={() => { if (!isSubmitting) { selectAnswer(quizState.currentQuestion, idx); } }}
                disabled={isSubmitting}
                style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.78rem", fontWeight: 600,
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  background: sel ? "rgba(0,255,159,0.1)" : "rgba(255,255,255,0.02)",
                  color: sel ? "var(--neon)" : "rgba(255,255,255,0.7)",
                  border: sel ? "1px solid rgba(0,255,159,0.3)" : "1px solid rgba(255,255,255,0.06)",
                  padding: "16px 20px", textAlign: "left", cursor: "pointer",
                  borderRadius: 10, display: "flex", alignItems: "center", gap: 14,
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={e => { if (!sel) { e.currentTarget.style.borderColor = "rgba(0,229,255,0.3)"; e.currentTarget.style.background = "rgba(0,229,255,0.05)"; } }}
                onMouseLeave={e => { if (!sel) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; } }}
              >
                <span style={{
                  width: 30, height: 30, borderRadius: 8, display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0,
                  fontSize: "0.65rem", fontWeight: 700,
                  background: sel ? "var(--neon)" : "rgba(255,255,255,0.05)",
                  color: sel ? "var(--black)" : COLORS[idx],
                  border: sel ? "none" : `1px solid ${COLORS[idx]}33`,
                  transition: "all 0.15s",
                }}>
                  {L[idx]}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: "16px 44px", borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#555" }}>
          <span className="text-gradient">{answered}</span>/{total} ANSWERED
        </div>
        {isLast && allDone ? (
          <button onClick={handleSubmit} disabled={isSubmitting}
            style={{
              fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
              background: "var(--gradient-main)", backgroundSize: "200% 200%",
              color: "var(--black)", border: "none", padding: "10px 28px",
              borderRadius: 8, cursor: "pointer",
              boxShadow: "0 4px 16px rgba(0,255,159,0.2)",
            }}>
            {isSubmitting ? "SUBMITTING..." : "SUBMIT →"}
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            {quizState.currentQuestion > 0 && (
              <button onClick={prevQuestion} style={{
                fontFamily: "var(--font-mono)", fontSize: "0.68rem", fontWeight: 600,
                background: "transparent", color: "#777", border: "1px solid rgba(255,255,255,0.1)",
                padding: "8px 20px", borderRadius: 6, cursor: "pointer",
              }}>← PREV</button>
            )}
            <button onClick={() => nextQuestion(total)} disabled={isLast}
              style={{
                fontFamily: "var(--font-mono)", fontSize: "0.68rem", fontWeight: 600,
                background: quizState.selectedAnswers[quizState.currentQuestion] !== undefined ? "rgba(0,229,255,0.08)" : "transparent",
                color: quizState.selectedAnswers[quizState.currentQuestion] !== undefined ? "var(--cyan)" : "#555",
                border: `1px solid ${quizState.selectedAnswers[quizState.currentQuestion] !== undefined ? "rgba(0,229,255,0.2)" : "rgba(255,255,255,0.06)"}`,
                padding: "8px 20px", borderRadius: 6, cursor: "pointer",
                opacity: quizState.selectedAnswers[quizState.currentQuestion] !== undefined ? 1 : 0.4,
                pointerEvents: quizState.selectedAnswers[quizState.currentQuestion] !== undefined ? "auto" : "none",
              }}>NEXT →</button>
          </div>
        )}
      </div>
    </div>
  );
}
