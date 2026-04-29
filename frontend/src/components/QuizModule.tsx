"use client";

// ============================================================================
// QUIZ MODULE — Multiple Choice Quiz with Animations
// ============================================================================
// Features:
//   - Clean A/B/C/D cards with selection animations
//   - Progress indicator (Question X of Y)
//   - Submit button calls submit_quiz() on contract
//   - Success: confetti animation + token reward display
//   - Error: shake animation + retry prompt
// ============================================================================

import { useState, useCallback, useMemo } from "react";
import { useQuizState } from "@/hooks/useQuizState";

// ── Types ────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  question: string;
  options: string[];
}

interface QuizModuleProps {
  courseId: number;
  questions: QuizQuestion[];
  onSubmit: (answers: number[]) => Promise<boolean>;
  isSubmitting?: boolean;
  disabled?: boolean;
}

const OPTION_LABELS = ["A", "B", "C", "D"];

// ── Confetti Component ───────────────────────────────────────────────────

function Confetti() {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        color: [
          "var(--accent-cyan)",
          "var(--accent-purple)",
          "var(--accent-green)",
          "var(--accent-amber)",
        ][i % 4],
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 2}s`,
        duration: `${2 + Math.random() * 3}s`,
        size: `${4 + Math.random() * 6}px`,
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            background: p.color,
            left: p.left,
            top: "-10px",
            width: p.size,
            height: p.size,
            animation: `confetti-fall ${p.duration} ease-in ${p.delay} forwards`,
          }}
        />
      ))}
    </div>
  );
}

// ── Quiz Module ──────────────────────────────────────────────────────────

export default function QuizModule({
  courseId,
  questions,
  onSubmit,
  isSubmitting = false,
  disabled = false,
}: QuizModuleProps) {
  const {
    quizState,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    markSubmitted,
    resetQuiz,
  } = useQuizState(courseId);

  const [showConfetti, setShowConfetti] = useState(false);
  const [shaking, setShaking] = useState(false);

  const currentQ = questions[quizState.currentQuestion];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(quizState.selectedAnswers).length;
  const allAnswered = answeredCount === totalQuestions;
  const isLastQuestion = quizState.currentQuestion === totalQuestions - 1;

  const handleSubmit = useCallback(async () => {
    // Build answers array in order
    const answers = Array.from(
      { length: totalQuestions },
      (_, i) => quizState.selectedAnswers[i] ?? -1
    );

    try {
      const passed = await onSubmit(answers);
      markSubmitted(passed);
      if (passed) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      } else {
        setShaking(true);
        setTimeout(() => setShaking(false), 600);
      }
    } catch (error) {
      console.error("Quiz submission failed:", error);
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
    }
  }, [totalQuestions, quizState.selectedAnswers, onSubmit, markSubmitted]);

  // ── Success State ────────────────────────────────────────────────────
  if (quizState.isSubmitted && quizState.isPassed) {
    return (
      <>
        {showConfetti && <Confetti />}
        <div
          id="quiz-success"
          className="glass-strong rounded-2xl p-8 text-center animate-fade-in-up"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              background: "rgba(0, 230, 118, 0.15)",
              border: "2px solid var(--accent-green)",
            }}
          >
            <svg
              className="w-10 h-10"
              style={{ color: "var(--accent-green)" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3
            className="text-2xl font-bold mb-2"
            style={{ color: "var(--accent-green)" }}
          >
            Congratulations! 🎉
          </h3>
          <p className="mb-4" style={{ color: "var(--foreground-muted)" }}>
            You passed the quiz and earned
          </p>
          <div className="text-4xl font-bold text-gradient mb-6">
            +10 LEARN
          </div>
          <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
            Tokens have been minted to your wallet
          </p>
        </div>
      </>
    );
  }

  // ── Failure State ────────────────────────────────────────────────────
  if (quizState.isSubmitted && quizState.isPassed === false) {
    return (
      <div
        id="quiz-failure"
        className="glass-strong rounded-2xl p-8 text-center animate-fade-in-up"
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{
            background: "rgba(255, 82, 82, 0.15)",
            border: "2px solid var(--accent-red)",
          }}
        >
          <svg
            className="w-10 h-10"
            style={{ color: "var(--accent-red)" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h3
          className="text-2xl font-bold mb-2"
          style={{ color: "var(--accent-red)" }}
        >
          Not Quite Right
        </h3>
        <p className="mb-6" style={{ color: "var(--foreground-muted)" }}>
          Some answers were incorrect. Review the video and try again!
        </p>
        <button
          id="retry-quiz-btn"
          onClick={resetQuiz}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ── Active Quiz State ────────────────────────────────────────────────
  return (
    <div
      id="quiz-module"
      className={`glass-strong rounded-2xl p-6 ${shaking ? "animate-shake" : ""}`}
    >
      {/* ── Progress Bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium" style={{ color: "var(--foreground-muted)" }}>
          Question {quizState.currentQuestion + 1} of {totalQuestions}
        </span>
        <span className="text-sm" style={{ color: "var(--accent-cyan)" }}>
          {answeredCount}/{totalQuestions} answered
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 mb-8">
        {Array.from({ length: totalQuestions }, (_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              background:
                i === quizState.currentQuestion
                  ? "var(--accent-cyan)"
                  : quizState.selectedAnswers[i] !== undefined
                  ? "var(--accent-purple)"
                  : "rgba(255, 255, 255, 0.1)",
            }}
          />
        ))}
      </div>

      {/* ── Question ──────────────────────────────────────────────── */}
      <h3 className="text-lg font-semibold mb-6" style={{ color: "var(--foreground)" }}>
        {currentQ?.question}
      </h3>

      {/* ── Options ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 mb-8">
        {currentQ?.options.map((option, idx) => {
          const isSelected =
            quizState.selectedAnswers[quizState.currentQuestion] === idx;
          return (
            <button
              key={idx}
              id={`quiz-option-${idx}`}
              onClick={() => {
                if (!disabled && !isSubmitting) {
                  selectAnswer(quizState.currentQuestion, idx);
                }
              }}
              className={`quiz-option flex items-center gap-4 text-left w-full ${
                isSelected ? "selected" : ""
              }`}
              disabled={disabled || isSubmitting}
            >
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-300"
                style={{
                  background: isSelected
                    ? "var(--accent-cyan)"
                    : "rgba(0, 229, 255, 0.1)",
                  color: isSelected ? "#060918" : "var(--accent-cyan)",
                }}
              >
                {OPTION_LABELS[idx]}
              </span>
              <span style={{ color: isSelected ? "var(--foreground)" : "var(--foreground-muted)" }}>
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Navigation ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevQuestion}
          disabled={quizState.currentQuestion === 0}
          className="btn-secondary !py-2 !px-4 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        {isLastQuestion && allAnswered ? (
          <button
            id="submit-quiz-btn"
            onClick={handleSubmit}
            disabled={isSubmitting || disabled}
            className="btn-primary !py-2 !px-6 text-sm flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                Submitting...
              </>
            ) : (
              "Submit Quiz"
            )}
          </button>
        ) : (
          <button
            onClick={() => nextQuestion(totalQuestions)}
            disabled={isLastQuestion}
            className="btn-secondary !py-2 !px-4 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
