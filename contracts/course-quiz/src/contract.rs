// ============================================================================
// CONTRACT — Course & Quiz Business Logic
// ============================================================================
// This is the core contract of Learn Mint. Here's the user flow:
//
//   1. Admin creates a course:  create_course(id, answers, price)
//   2. User unlocks a course:   unlock_course(user, id)  → pays 1 XLM
//   3. User submits quiz:       submit_quiz(user, id, answers)
//   4. If correct:              Cross-contract call → mint LEARN tokens
//                               Emit "course_passed" event
//
// Cross-Contract Calls:
//   This contract uses `soroban_sdk::token::TokenClient` to interact with
//   the native Stellar Asset Contract (SAC) for XLM payments, and
//   `soroban_sdk::token::StellarAssetClient` for the token mint operation.
//   For the LEARN token, we use the standard TokenClient since we set
//   this contract as the admin of the LEARN token.
//
// Security:
//   - Only the admin can create courses
//   - Users must pay to unlock before they can submit quizzes
//   - Users can only pass a course once (prevents reward farming)
//   - Answers are validated element-by-element on-chain
// ============================================================================

use crate::storage_types::{
    DataKey, UserCourseKey,
    INSTANCE_BUMP_AMOUNT, INSTANCE_LIFETIME_THRESHOLD,
    PERSISTENT_BUMP_AMOUNT, PERSISTENT_LIFETIME_THRESHOLD,
};
use soroban_sdk::{
    contract, contractimpl, symbol_short, token, Address, Env, Vec,
};

// ── Contract Struct ───────────────────────────────────────────────────────

/// The Course & Quiz contract.
///
/// This struct is the entry point. Like the token contract, all state is
/// stored in Soroban's ledger storage — the struct itself holds no fields.
#[contract]
pub struct CourseQuiz;

// ── Helper Functions ──────────────────────────────────────────────────────

/// Reads the admin address from instance storage.
/// Panics if the contract hasn't been initialized.
fn get_admin(e: &Env) -> Address {
    e.storage().instance().get(&DataKey::Admin).unwrap()
}

/// Reads the reward token contract address from instance storage.
fn get_token_contract(e: &Env) -> Address {
    e.storage().instance().get(&DataKey::TokenContract).unwrap()
}

/// Reads the reward amount (LEARN tokens per quiz pass) from instance storage.
fn get_reward_amount(e: &Env) -> i128 {
    e.storage().instance().get(&DataKey::RewardAmount).unwrap()
}

/// Bumps the instance TTL to keep the contract alive.
/// Called at the start of every public function.
fn bump_instance(e: &Env) {
    e.storage()
        .instance()
        .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
}

/// Bumps the TTL for a persistent storage key.
fn bump_persistent(e: &Env, key: &DataKey) {
    e.storage()
        .persistent()
        .extend_ttl(key, PERSISTENT_LIFETIME_THRESHOLD, PERSISTENT_BUMP_AMOUNT);
}

// ── Contract Implementation ───────────────────────────────────────────────

#[contractimpl]
impl CourseQuiz {
    // ── Constructor ───────────────────────────────────────────────────────

    /// Initializes the contract. Called once at deployment time.
    ///
    /// Parameters:
    ///   - `admin`:          Platform owner who can create courses
    ///   - `token_contract`: Address of the deployed LEARN token contract
    ///   - `reward_amount`:  LEARN tokens (in smallest units) minted per quiz pass
    ///
    /// Example: For 10 LEARN tokens with 7 decimals:
    ///   reward_amount = 10 * 10^7 = 100_000_000
    ///
    /// Time complexity: O(1) — three storage writes.
    pub fn __constructor(e: Env, admin: Address, token_contract: Address, reward_amount: i128) {
        e.storage().instance().set(&DataKey::Admin, &admin);
        e.storage().instance().set(&DataKey::TokenContract, &token_contract);
        e.storage().instance().set(&DataKey::RewardAmount, &reward_amount);
    }

    // ── Admin Functions ───────────────────────────────────────────────────

    /// Creates a new course with its quiz answer key.
    ///
    /// Parameters:
    ///   - `course_id`:    Unique numeric identifier for the course
    ///   - `answers`:      Ordered array of correct answer indices (0-based).
    ///                     For example: [2, 0, 1, 3] means:
    ///                       Q1 → option C, Q2 → option A, Q3 → option B, Q4 → option D
    ///   - `unlock_price`: Cost in stroops (1 XLM = 10_000_000 stroops)
    ///
    /// Data structure: `answers` is a `Vec<u32>` — a dynamic array stored
    ///   as a single persistent entry on the ledger. Reading it back is O(1)
    ///   since Soroban deserializes the entire Vec at once.
    ///
    /// Time complexity: O(1) — two persistent storage writes.
    ///
    /// Authorization: Only the admin can call this.
    pub fn create_course(e: Env, course_id: u32, answers: Vec<u32>, unlock_price: i128) {
        let admin = get_admin(&e);
        admin.require_auth();
        bump_instance(&e);

        // Store the answer key
        let answers_key = DataKey::CourseAnswers(course_id);
        e.storage().persistent().set(&answers_key, &answers);
        bump_persistent(&e, &answers_key);

        // Store the unlock price
        let price_key = DataKey::CoursePrice(course_id);
        e.storage().persistent().set(&price_key, &unlock_price);
        bump_persistent(&e, &price_key);
    }

    // ── User Functions ────────────────────────────────────────────────────

    /// Unlocks a course for the user by collecting a micro-payment in XLM.
    ///
    /// Flow:
    ///   1. Verify the user hasn't already unlocked this course
    ///   2. Look up the course's unlock price (in stroops)
    ///   3. Transfer XLM from the user to the admin (platform revenue)
    ///   4. Mark the course as unlocked for this user
    ///
    /// The XLM transfer uses `soroban_sdk::token::TokenClient` with the
    /// native XLM Stellar Asset Contract (SAC). On testnet, XLM's contract
    /// address is derived from the native asset.
    ///
    /// Parameters:
    ///   - `user`:       The user's wallet address (must sign the transaction)
    ///   - `course_id`:  Which course to unlock
    ///   - `xlm_token`:  Address of the native XLM SAC (Stellar Asset Contract)
    ///
    /// Time complexity: O(1) — storage reads + one token transfer + one storage write.
    pub fn unlock_course(e: Env, user: Address, course_id: u32, xlm_token: Address) {
        user.require_auth();
        bump_instance(&e);

        // ── Guard: Check the course exists ────────────────────────────────
        let price_key = DataKey::CoursePrice(course_id);
        let unlock_price: i128 = e.storage()
            .persistent()
            .get(&price_key)
            .unwrap_or_else(|| panic!("course {} does not exist", course_id));
        bump_persistent(&e, &price_key);

        // ── Guard: Check user hasn't already unlocked ─────────────────────
        let unlock_key = DataKey::UserUnlocked(UserCourseKey {
            user: user.clone(),
            course_id,
        });
        let already_unlocked: bool = e.storage()
            .persistent()
            .get(&unlock_key)
            .unwrap_or(false);

        if already_unlocked {
            panic!("course {} is already unlocked for this user", course_id);
        }

        // ── Transfer XLM from user to admin ───────────────────────────────
        // We use the standard SEP-41 token client to transfer native XLM.
        // The `xlm_token` address points to the Stellar Asset Contract (SAC)
        // for XLM on the network.
        let admin = get_admin(&e);
        let xlm_client = token::TokenClient::new(&e, &xlm_token);
        xlm_client.transfer(&user, &admin, &unlock_price);

        // ── Mark course as unlocked ───────────────────────────────────────
        e.storage().persistent().set(&unlock_key, &true);
        bump_persistent(&e, &unlock_key);
    }

    /// Submits quiz answers for validation and, if correct, mints reward tokens.
    ///
    /// Algorithm:
    ///   1. Verify user has unlocked the course
    ///   2. Verify user hasn't already passed (no double rewards)
    ///   3. Load the correct answers from storage
    ///   4. Compare submitted answers element-by-element — O(n) where n = question count
    ///   5. If all correct: mint LEARN tokens via cross-contract call
    ///   6. Emit a "course_passed" event for the frontend event listener
    ///
    /// Parameters:
    ///   - `user`:       The user's wallet address (must sign)
    ///   - `course_id`:  Which course's quiz to submit
    ///   - `answers`:    User's answer indices (same format as create_course)
    ///
    /// Time complexity: O(n) where n = number of quiz questions.
    ///   - Storage reads are O(1) each (3 reads)
    ///   - Answer comparison is O(n) — we iterate through each answer
    ///   - Cross-contract mint call is O(1)
    ///
    /// Returns: `true` if the quiz was passed, `false` if answers were wrong.
    pub fn submit_quiz(e: Env, user: Address, course_id: u32, answers: Vec<u32>) -> bool {
        user.require_auth();
        bump_instance(&e);

        // ── Guard: User must have unlocked the course ─────────────────────
        let unlock_key = DataKey::UserUnlocked(UserCourseKey {
            user: user.clone(),
            course_id,
        });
        let is_unlocked: bool = e.storage()
            .persistent()
            .get(&unlock_key)
            .unwrap_or(false);

        if !is_unlocked {
            panic!("course {} is not unlocked — pay to unlock first", course_id);
        }

        // ── Guard: User must not have already passed ──────────────────────
        let passed_key = DataKey::UserPassed(UserCourseKey {
            user: user.clone(),
            course_id,
        });
        let already_passed: bool = e.storage()
            .persistent()
            .get(&passed_key)
            .unwrap_or(false);

        if already_passed {
            panic!("user has already passed course {}", course_id);
        }

        // ── Load correct answers ──────────────────────────────────────────
        let answers_key = DataKey::CourseAnswers(course_id);
        let correct_answers: Vec<u32> = e.storage()
            .persistent()
            .get(&answers_key)
            .unwrap_or_else(|| panic!("course {} does not exist", course_id));
        bump_persistent(&e, &answers_key);

        // ── Validate answer count matches ─────────────────────────────────
        // The user must answer exactly as many questions as the quiz has.
        if answers.len() != correct_answers.len() {
            return false; // Wrong number of answers → fail (don't panic, just return false)
        }

        // ── Compare answers element-by-element ────────────────────────────
        // This is a simple linear scan: O(n) time, O(1) extra space.
        //
        //   correct_answers: [2, 0, 1, 3]
        //   user answers:    [2, 0, 1, 3]  →  all match → pass!
        //   user answers:    [2, 1, 1, 3]  →  index 1 differs → fail
        //
        // We use early-return on first mismatch for efficiency.
        for i in 0..correct_answers.len() {
            if answers.get(i) != correct_answers.get(i) {
                return false; // At least one wrong answer → fail
            }
        }

        // ── All answers correct! ──────────────────────────────────────────

        // Mark the user as having passed this course
        e.storage().persistent().set(&passed_key, &true);
        bump_persistent(&e, &passed_key);

        // ── Cross-contract call: Mint reward tokens ───────────────────────
        // We create a TokenClient for our LEARN token and call `mint()`.
        // Since this contract (CourseQuiz) is set as the admin of the
        // LEARN token, the mint call is automatically authorized.
        //
        // The call graph looks like:
        //   User → CourseQuiz.submit_quiz() → RewardToken.mint(user, amount)
        let token_addr = get_token_contract(&e);
        let reward = get_reward_amount(&e);
        let token_client = token::StellarAssetClient::new(&e, &token_addr);
        token_client.mint(&user, &reward);

        // ── Emit event: "course_passed" ───────────────────────────────────
        // The frontend listens for this event to show real-time notifications
        // in the "Recent Graduates" feed.
        //
        // Event structure:
        //   Topics: ["course", "passed"]
        //   Data:   (user_address, course_id)
        //
        // Anyone monitoring the contract's events on the Stellar network
        // can see when a user graduates.
        e.events().publish(
            (symbol_short!("course"), symbol_short!("passed")),
            (user, course_id),
        );

        true // Quiz passed!
    }

    // ── View Functions (read-only, no auth required) ──────────────────────

    /// Checks if a user has unlocked a specific course.
    ///
    /// Time complexity: O(1) — single storage read.
    pub fn is_course_unlocked(e: Env, user: Address, course_id: u32) -> bool {
        bump_instance(&e);
        let key = DataKey::UserUnlocked(UserCourseKey { user, course_id });
        e.storage().persistent().get(&key).unwrap_or(false)
    }

    /// Checks if a user has already passed a specific course's quiz.
    ///
    /// Time complexity: O(1) — single storage read.
    pub fn has_user_passed(e: Env, user: Address, course_id: u32) -> bool {
        bump_instance(&e);
        let key = DataKey::UserPassed(UserCourseKey { user, course_id });
        e.storage().persistent().get(&key).unwrap_or(false)
    }

    /// Returns the unlock price for a course (in stroops).
    ///
    /// Time complexity: O(1) — single storage read.
    pub fn get_course_price(e: Env, course_id: u32) -> i128 {
        bump_instance(&e);
        let key = DataKey::CoursePrice(course_id);
        e.storage().persistent().get(&key).unwrap_or(0)
    }
}
