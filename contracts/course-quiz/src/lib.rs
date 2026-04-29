// ============================================================================
// COURSE & QUIZ CONTRACT — Module Root
// ============================================================================
// This contract is the "brain" of Learn Mint. It manages:
//
//   1. Courses    — Admin creates courses with correct answer keys
//   2. Unlocking  — Users pay 1 XLM to unlock access to a course
//   3. Quizzes    — Users submit answers; the contract validates them on-chain
//   4. Rewards    — If answers are correct, it cross-contract calls the
//                   Reward Token contract to mint LEARN tokens to the user
//
// Architecture:
// ┌──────────────┐     cross-contract call     ┌──────────────────┐
// │ Course/Quiz  │ ──── mint(user, amount) ───→ │  Reward Token    │
// │ Contract     │                              │  Contract        │
// └──────────────┘                              └──────────────────┘
//       ↑                                              ↑
//       │ unlock_course(1 XLM)                         │ SEP-41 token
//       │ submit_quiz(answers)                         │ (LEARN)
//       │                                              │
//    [User's Wallet]                            [User's Balance]
// ============================================================================

#![no_std]

mod contract;
mod storage_types;
mod test;

pub use crate::contract::CourseQuizClient;
