"use client";

// ============================================================================
// useQuizState — Track quiz answers and submission per course
// ============================================================================

import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

interface QuizState {
  selectedAnswers: Record<number, number>; // questionIndex → answerIndex
  currentQuestion: number;
  isSubmitted: boolean;
  isPassed: boolean | null;
}

const defaultQuizState: QuizState = {
  selectedAnswers: {},
  currentQuestion: 0,
  isSubmitted: false,
  isPassed: null,
};

export function useQuizState(courseId: number) {
  const [quizState, setQuizState, clearQuizState] = useLocalStorage<QuizState>(
    `quiz-state-${courseId}`,
    defaultQuizState
  );

  const selectAnswer = useCallback(
    (questionIndex: number, answerIndex: number) => {
      setQuizState((prev) => ({
        ...prev,
        selectedAnswers: {
          ...prev.selectedAnswers,
          [questionIndex]: answerIndex,
        },
      }));
    },
    [setQuizState]
  );

  const goToQuestion = useCallback(
    (index: number) => {
      setQuizState((prev) => ({
        ...prev,
        currentQuestion: index,
      }));
    },
    [setQuizState]
  );

  const nextQuestion = useCallback(
    (totalQuestions: number) => {
      setQuizState((prev) => ({
        ...prev,
        currentQuestion: Math.min(prev.currentQuestion + 1, totalQuestions - 1),
      }));
    },
    [setQuizState]
  );

  const prevQuestion = useCallback(() => {
    setQuizState((prev) => ({
      ...prev,
      currentQuestion: Math.max(prev.currentQuestion - 1, 0),
    }));
  }, [setQuizState]);

  const markSubmitted = useCallback(
    (passed: boolean) => {
      setQuizState((prev) => ({
        ...prev,
        isSubmitted: true,
        isPassed: passed,
      }));
      // We no longer auto-clear state, so the user has time to mint their certificate
    },
    [setQuizState]
  );

  const resetQuiz = useCallback(() => {
    clearQuizState();
  }, [clearQuizState]);

  return {
    quizState,
    selectAnswer,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    markSubmitted,
    resetQuiz,
  };
}
