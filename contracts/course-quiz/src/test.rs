// ============================================================================
// TESTS — Course & Quiz Contract Unit Tests
// ============================================================================
// These tests verify the complete user journey:
//   1. Admin creates a course with an answer key
//   2. User unlocks the course by paying XLM
//   3. User submits correct answers → receives LEARN tokens
//   4. Wrong answers → no reward
//   5. Double-pass prevention
//
// We use Soroban's test environment which simulates the entire blockchain
// in-memory. The `mock_all_auths()` call skips real cryptographic signature
// verification, letting us focus on business logic.
// ============================================================================

#![cfg(test)]

use soroban_sdk::{
    testutils::Address as _,
    token::{StellarAssetClient, TokenClient},
    Address, Env, String, Vec,
};

use crate::contract::{CourseQuiz, CourseQuizClient};

/// Sets up the complete test environment with all contracts deployed.
///
/// Returns:
///   - `env`:          The simulated Soroban environment
///   - `quiz_client`:  Client for the Course & Quiz contract
///   - `token_client`: Client for the LEARN reward token (to check balances)
///   - `admin`:        The platform admin address
///   - `xlm_token`:    Address of the native XLM SAC (for unlock payments)
///
/// Setup flow:
///   1. Deploy the LEARN token with `admin` as the initial admin
///   2. Deploy the Course & Quiz contract
///   3. Transfer LEARN token admin to the Quiz contract (so it can mint)
fn setup_test() -> (
    Env,
    CourseQuizClient<'static>,
    TokenClient<'static>,
    Address,
    Address,
) {
    let e = Env::default();
    e.mock_all_auths();

    let admin = Address::generate(&e);

    // ── Deploy the LEARN reward token ─────────────────────────────────────
    // We register the token contract with its constructor arguments:
    //   (admin, decimals=7, name="Learn Mint Token", symbol="LEARN")
    let token_id = e.register(
        reward_token::Token,
        (
            &admin,
            7_u32,
            String::from_str(&e, "Learn Mint Token"),
            String::from_str(&e, "LEARN"),
        ),
    );
    let token_client = TokenClient::new(&e, &token_id);

    // ── Deploy the native XLM SAC (Stellar Asset Contract) ────────────────
    // In tests, we register a "stellar asset" which simulates the native XLM.
    let xlm_token = e.register_stellar_asset_contract_v2(admin.clone());
    let xlm_id = xlm_token.address();

    // ── Deploy the Course & Quiz contract ─────────────────────────────────
    // reward_amount = 10 LEARN tokens = 10 * 10^7 = 100_000_000 smallest units
    let reward_amount: i128 = 100_000_000;
    let quiz_id = e.register(
        CourseQuiz,
        (&admin, &token_id, reward_amount),
    );
    let quiz_client = CourseQuizClient::new(&e, &quiz_id);

    // ── Transfer token admin to the Quiz contract ─────────────────────────
    // The Quiz contract needs to be the admin of the LEARN token so it can
    // call mint() during submit_quiz(). We use StellarAssetClient since
    // set_admin is an admin-level function.
    let token_admin_client = StellarAssetClient::new(&e, &token_id);
    token_admin_client.set_admin(&quiz_id);

    // ── Fund the test user with XLM for unlock payments ───────────────────
    // Give the admin some XLM so we can test the payment flow
    let xlm_admin_client = StellarAssetClient::new(&e, &xlm_id);
    // We mint XLM to the admin first (they're the SAC admin in tests)
    xlm_admin_client.mint(&admin, &100_000_000_000); // 10,000 XLM

    (e, quiz_client, token_client, admin, xlm_id)
}

// ── Test: Complete happy path ─────────────────────────────────────────────

#[test]
fn test_full_flow_create_unlock_pass() {
    let (e, quiz_client, token_client, admin, xlm_id) = setup_test();

    // Create a course with 4 questions: correct answers are [2, 0, 1, 3]
    let mut correct_answers = Vec::new(&e);
    correct_answers.push_back(2);
    correct_answers.push_back(0);
    correct_answers.push_back(1);
    correct_answers.push_back(3);

    // Price: 1 XLM = 10_000_000 stroops
    let unlock_price: i128 = 10_000_000;

    quiz_client.create_course(&0_u32, &correct_answers, &unlock_price);

    // ── User unlocks the course ───────────────────────────────────────────
    let user = Address::generate(&e);

    // Fund the user with XLM for the unlock payment
    let xlm_admin = StellarAssetClient::new(&e, &xlm_id);
    xlm_admin.mint(&user, &100_000_000); // 10 XLM

    // Check user's XLM before unlock
    let xlm_balance_client = TokenClient::new(&e, &xlm_id);
    let xlm_before = xlm_balance_client.balance(&user);

    quiz_client.unlock_course(&user, &0_u32, &xlm_id);

    // Verify: course is now unlocked
    assert!(quiz_client.is_course_unlocked(&user, &0_u32));

    // Verify: user paid 1 XLM
    let xlm_after = xlm_balance_client.balance(&user);
    assert_eq!(xlm_before - xlm_after, unlock_price);

    // ── User submits correct answers ──────────────────────────────────────
    let mut user_answers = Vec::new(&e);
    user_answers.push_back(2);
    user_answers.push_back(0);
    user_answers.push_back(1);
    user_answers.push_back(3);

    let passed = quiz_client.submit_quiz(&user, &0_u32, &user_answers);
    assert!(passed);

    // Verify: user received 10 LEARN tokens
    assert_eq!(token_client.balance(&user), 100_000_000);

    // Verify: user is marked as having passed
    assert!(quiz_client.has_user_passed(&user, &0_u32));
}

// ── Test: Wrong answers return false, no tokens minted ────────────────────

#[test]
fn test_wrong_answers_fail() {
    let (e, quiz_client, token_client, _admin, xlm_id) = setup_test();

    // Create course with answers [1, 1, 1]
    let mut correct = Vec::new(&e);
    correct.push_back(1);
    correct.push_back(1);
    correct.push_back(1);

    quiz_client.create_course(&0_u32, &correct, &10_000_000);

    let user = Address::generate(&e);
    let xlm_admin = StellarAssetClient::new(&e, &xlm_id);
    xlm_admin.mint(&user, &100_000_000);

    quiz_client.unlock_course(&user, &0_u32, &xlm_id);

    // Submit wrong answers
    let mut wrong = Vec::new(&e);
    wrong.push_back(0); // Wrong!
    wrong.push_back(1);
    wrong.push_back(1);

    let passed = quiz_client.submit_quiz(&user, &0_u32, &wrong);
    assert!(!passed); // Should fail

    // No tokens should have been minted
    assert_eq!(token_client.balance(&user), 0);

    // User should NOT be marked as passed
    assert!(!quiz_client.has_user_passed(&user, &0_u32));
}

// ── Test: Can't submit quiz without unlocking first ───────────────────────

#[test]
#[should_panic(expected = "not unlocked")]
fn test_submit_without_unlock_panics() {
    let (e, quiz_client, _token_client, _admin, _xlm_id) = setup_test();

    let mut answers = Vec::new(&e);
    answers.push_back(0);

    quiz_client.create_course(&0_u32, &answers, &10_000_000);

    let user = Address::generate(&e);
    // Try to submit without unlocking — should panic
    quiz_client.submit_quiz(&user, &0_u32, &answers);
}

// ── Test: Can't pass the same course twice ────────────────────────────────

#[test]
#[should_panic(expected = "already passed")]
fn test_double_pass_panics() {
    let (e, quiz_client, _token_client, _admin, xlm_id) = setup_test();

    let mut answers = Vec::new(&e);
    answers.push_back(2);

    quiz_client.create_course(&0_u32, &answers, &10_000_000);

    let user = Address::generate(&e);
    let xlm_admin = StellarAssetClient::new(&e, &xlm_id);
    xlm_admin.mint(&user, &100_000_000);

    quiz_client.unlock_course(&user, &0_u32, &xlm_id);

    // First pass — should work
    quiz_client.submit_quiz(&user, &0_u32, &answers);

    // Second pass — should panic
    quiz_client.submit_quiz(&user, &0_u32, &answers);
}

// ── Test: Can't unlock the same course twice ──────────────────────────────

#[test]
#[should_panic(expected = "already unlocked")]
fn test_double_unlock_panics() {
    let (e, quiz_client, _token_client, _admin, xlm_id) = setup_test();

    let mut answers = Vec::new(&e);
    answers.push_back(0);

    quiz_client.create_course(&0_u32, &answers, &10_000_000);

    let user = Address::generate(&e);
    let xlm_admin = StellarAssetClient::new(&e, &xlm_id);
    xlm_admin.mint(&user, &100_000_000);

    quiz_client.unlock_course(&user, &0_u32, &xlm_id);
    quiz_client.unlock_course(&user, &0_u32, &xlm_id); // Should panic
}

// ── Test: Course price view function ──────────────────────────────────────

#[test]
fn test_get_course_price() {
    let (e, quiz_client, _token_client, _admin, _xlm_id) = setup_test();

    let mut answers = Vec::new(&e);
    answers.push_back(0);

    let price: i128 = 10_000_000; // 1 XLM
    quiz_client.create_course(&0_u32, &answers, &price);

    assert_eq!(quiz_client.get_course_price(&0_u32), price);
}
