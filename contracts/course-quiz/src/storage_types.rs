// ============================================================================
// STORAGE TYPES — Data Keys for Course & Quiz Contract
// ============================================================================
// This defines all the "keys" we use to store data on the Stellar ledger.
//
// Conceptual database schema:
// ┌────────────────────────────────────────────────────────────────┐
// │ Key                              │ Value    │ Storage Type    │
// ├────────────────────────────────────────────────────────────────┤
// │ Admin                            │ Address  │ Instance        │
// │ TokenContract                    │ Address  │ Instance        │
// │ RewardAmount                     │ i128     │ Instance        │
// │ CourseAnswers(course_id)         │ Vec<u32> │ Persistent      │
// │ CourseUnlockPrice(course_id)     │ i128     │ Persistent      │
// │ UserUnlocked(addr, course_id)   │ bool     │ Persistent      │
// │ UserPassed(addr, course_id)     │ bool     │ Persistent      │
// └────────────────────────────────────────────────────────────────┘
// ============================================================================

use soroban_sdk::{contracttype, Address};

// ── TTL Constants ─────────────────────────────────────────────────────────

pub(crate) const DAY_IN_LEDGERS: u32 = 17_280;
pub(crate) const INSTANCE_BUMP_AMOUNT: u32 = 7 * DAY_IN_LEDGERS;
pub(crate) const INSTANCE_LIFETIME_THRESHOLD: u32 = INSTANCE_BUMP_AMOUNT - DAY_IN_LEDGERS;
pub(crate) const PERSISTENT_BUMP_AMOUNT: u32 = 30 * DAY_IN_LEDGERS;
pub(crate) const PERSISTENT_LIFETIME_THRESHOLD: u32 = PERSISTENT_BUMP_AMOUNT - DAY_IN_LEDGERS;

// ── Composite Key: User + Course ──────────────────────────────────────────

/// A compound key pairing a user address with a course ID.
/// Used for per-user, per-course state lookups.
///
/// Data structure: Simple tuple struct, serialized by Soroban's codec.
/// Think of it like a composite primary key in a relational database:
///   PRIMARY KEY (user_address, course_id)
#[derive(Clone)]
#[contracttype]
pub struct UserCourseKey {
    pub user: Address,
    pub course_id: u32,
}

// ── Main Data Key Enum ────────────────────────────────────────────────────

/// All possible storage keys for the Course & Quiz contract.
///
/// This is a tagged union (sum type). Each variant represents a
/// different "table" in our on-chain database:
///
///   - Admin:              Platform owner who can create courses
///   - TokenContract:      Address of the LEARN token contract
///   - RewardAmount:       How many LEARN tokens to mint per quiz pass
///   - CourseAnswers(id):  Array of correct answer indices for a course
///   - CoursePrice(id):    XLM cost (in stroops) to unlock a course
///   - UserUnlocked(key): Whether a user has paid to unlock a course
///   - UserPassed(key):   Whether a user has passed a course's quiz
#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    TokenContract,
    RewardAmount,
    CourseAnswers(u32),
    CoursePrice(u32),
    UserUnlocked(UserCourseKey),
    UserPassed(UserCourseKey),
}
