"use client";

// ============================================================================
// COURSE VIEW — Main Page Component
// ============================================================================
// Combines VideoPlayer + QuizModule into a single course experience.
// State machine: locked → watching → quiz → completed
// ============================================================================

import { useState, useCallback } from "react";
import VideoPlayer from "./VideoPlayer";
import QuizModule, { QuizQuestion } from "./QuizModule";
import { useWallet } from "@/context/WalletProvider";

// ── Demo Course Data ─────────────────────────────────────────────────────
// Replace with dynamic data from the blockchain or an API

const DEMO_VIDEO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

const DEMO_QUESTIONS: QuizQuestion[] = [
  {
    question: "What is the Stellar network primarily designed for?",
    options: [
      "Mining cryptocurrency",
      "Cross-border payments and asset transfers",
      "Smart contract gaming",
      "Social media rewards",
    ],
  },
  {
    question: "What language are Soroban smart contracts written in?",
    options: ["Solidity", "JavaScript", "Rust", "Python"],
  },
  {
    question: "What does SEP-41 define in the Stellar ecosystem?",
    options: [
      "A consensus algorithm",
      "A standard fungible token interface",
      "A wallet specification",
      "A bridge protocol",
    ],
  },
  {
    question: "How many decimals does the LEARN token use?",
    options: ["18", "8", "7", "6"],
  },
];

// Correct answers: [1, 2, 1, 2] (0-indexed)

type CourseStage = "locked" | "watching" | "quiz" | "completed";

interface CourseViewProps {
  courseId?: number;
}

export default function CourseView({ courseId = 0 }: CourseViewProps) {
  const { isConnected } = useWallet();
  const [stage, setStage] = useState<CourseStage>("locked");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUnlock = useCallback(async () => {
    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }

    setIsUnlocking(true);
    try {
      // In production, this calls the contract:
      // const tx = await buildContractTransaction(
      //   address, COURSE_QUIZ_CONTRACT_ID, "unlock_course",
      //   [addressToScVal(address), u32ToScVal(courseId), addressToScVal(XLM_SAC_CONTRACT_ID)]
      // );
      // const signedXdr = await signTransaction(tx.toXDR());
      // await submitTransaction(signedXdr);

      // Simulate unlock for demo
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStage("watching");
    } catch (error) {
      console.error("Unlock failed:", error);
      alert("Failed to unlock course. Please try again.");
    } finally {
      setIsUnlocking(false);
    }
  }, [isConnected]);

  const handleQuizSubmit = useCallback(
    async (answers: number[]): Promise<boolean> => {
      setIsSubmitting(true);
      try {
        // In production, this calls the contract:
        // const tx = await buildContractTransaction(
        //   address, COURSE_QUIZ_CONTRACT_ID, "submit_quiz",
        //   [addressToScVal(address), u32ToScVal(courseId), u32ArrayToScVal(answers)]
        // );
        // const signedXdr = await signTransaction(tx.toXDR());
        // const result = await submitTransaction(signedXdr);
        // return result === true;

        // Simulate quiz validation
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const correctAnswers = [1, 2, 1, 2];
        const passed = answers.every(
          (a, i) => a === correctAnswers[i]
        );

        if (passed) {
          setStage("completed");
        }

        return passed;
      } catch (error) {
        console.error("Quiz submission failed:", error);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const showQuiz = stage === "watching" || stage === "quiz";

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* ── Video Column ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center">
        {/* Course title */}
        <div className="w-full mb-4">
          <div className="flex items-center gap-3 mb-2">
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{
                background: "rgba(0, 229, 255, 0.1)",
                color: "var(--accent-cyan)",
              }}
            >
              Course #{courseId}
            </span>
            {stage === "completed" && (
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{
                  background: "rgba(0, 230, 118, 0.1)",
                  color: "var(--accent-green)",
                }}
              >
                ✓ Completed
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gradient mb-1">
            Introduction to Stellar & Soroban
          </h2>
          <p style={{ color: "var(--foreground-muted)" }}>
            Learn the fundamentals of the Stellar network and Soroban smart
            contracts. Pass the quiz to earn 10 LEARN tokens!
          </p>
        </div>

        <VideoPlayer
          courseId={courseId}
          videoUrl={DEMO_VIDEO_URL}
          isLocked={stage === "locked"}
          onUnlock={handleUnlock}
          isUnlocking={isUnlocking}
        />

        {/* Show quiz tab after unlocking */}
        {stage === "watching" && (
          <button
            id="start-quiz-btn"
            onClick={() => setStage("quiz")}
            className="btn-primary mt-6 flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            Take the Quiz
          </button>
        )}
      </div>

      {/* ── Quiz Column ───────────────────────────────────────────── */}
      {showQuiz && stage === "quiz" && (
        <div className="lg:w-[420px] animate-fade-in-up">
          <QuizModule
            courseId={courseId}
            questions={DEMO_QUESTIONS}
            onSubmit={handleQuizSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      )}
    </div>
  );
}
