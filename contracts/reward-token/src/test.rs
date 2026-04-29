// ============================================================================
// TESTS — Reward Token Contract Tests
// ============================================================================
// These tests verify the core token functionality:
//   1. Minting tokens (admin-only)
//   2. Transferring tokens between users
//   3. Approvals and transfer_from (delegated spending)
//   4. Burning tokens
//   5. Edge cases: insufficient balance, insufficient allowance, bad decimals
//
// The `#![cfg(test)]` attribute ensures this entire module is only compiled
// during `cargo test`, keeping it out of the deployed WASM binary.
// ============================================================================

#![cfg(test)]
extern crate std;

use crate::{contract::Token, TokenClient};
use soroban_sdk::{
    symbol_short,
    testutils::{Address as _, AuthorizedFunction, AuthorizedInvocation},
    Address, Env, FromVal, IntoVal, String, Symbol,
};

// ── Test Helper ──────────────────────────────────────────────────────────────

/// Creates a new LEARN token contract instance in the test environment.
///
/// Parameters:
///   - 7 decimals (matching XLM's precision)
///   - Name: "name" (simplified for tests)
///   - Symbol: "symbol" (simplified for tests)
fn create_token<'a>(e: &Env, admin: &Address) -> TokenClient<'a> {
    let token_contract = e.register(
        Token,
        (
            admin,
            7_u32,
            String::from_val(e, &"name"),
            String::from_val(e, &"symbol"),
        ),
    );
    TokenClient::new(e, &token_contract)
}

// ── Core Flow Test ───────────────────────────────────────────────────────────

#[test]
fn test_mint_transfer_approve_flow() {
    let e = Env::default();
    e.mock_all_auths();

    let admin1 = Address::generate(&e);
    let admin2 = Address::generate(&e);
    let user1 = Address::generate(&e);
    let user2 = Address::generate(&e);
    let user3 = Address::generate(&e);
    let token = create_token(&e, &admin1);

    // ── Mint 1000 tokens to user1 ────────────────────────────────────────
    token.mint(&user1, &1000);
    assert_eq!(
        e.auths(),
        std::vec![(
            admin1.clone(),
            AuthorizedInvocation {
                function: AuthorizedFunction::Contract((
                    token.address.clone(),
                    symbol_short!("mint"),
                    (&user1, 1000_i128).into_val(&e),
                )),
                sub_invocations: std::vec![]
            }
        )]
    );
    assert_eq!(token.balance(&user1), 1000);

    // ── Approve user3 to spend 500 of user2's tokens ─────────────────────
    token.approve(&user2, &user3, &500, &200);
    assert_eq!(
        e.auths(),
        std::vec![(
            user2.clone(),
            AuthorizedInvocation {
                function: AuthorizedFunction::Contract((
                    token.address.clone(),
                    symbol_short!("approve"),
                    (&user2, &user3, 500_i128, 200_u32).into_val(&e),
                )),
                sub_invocations: std::vec![]
            }
        )]
    );
    assert_eq!(token.allowance(&user2, &user3), 500);

    // ── Transfer 600 from user1 to user2 ─────────────────────────────────
    token.transfer(&user1, &user2, &600);
    assert_eq!(
        e.auths(),
        std::vec![(
            user1.clone(),
            AuthorizedInvocation {
                function: AuthorizedFunction::Contract((
                    token.address.clone(),
                    symbol_short!("transfer"),
                    (&user1, &user2, 600_i128).into_val(&e),
                )),
                sub_invocations: std::vec![]
            }
        )]
    );
    assert_eq!(token.balance(&user1), 400);
    assert_eq!(token.balance(&user2), 600);

    // ── Transfer_from: user3 moves 400 from user2 to user1 ──────────────
    token.transfer_from(&user3, &user2, &user1, &400);
    assert_eq!(
        e.auths(),
        std::vec![(
            user3.clone(),
            AuthorizedInvocation {
                function: AuthorizedFunction::Contract((
                    token.address.clone(),
                    Symbol::new(&e, "transfer_from"),
                    (&user3, &user2, &user1, 400_i128).into_val(&e),
                )),
                sub_invocations: std::vec![]
            }
        )]
    );
    assert_eq!(token.balance(&user1), 800);
    assert_eq!(token.balance(&user2), 200);

    // ── Another transfer ─────────────────────────────────────────────────
    token.transfer(&user1, &user3, &300);
    assert_eq!(token.balance(&user1), 500);
    assert_eq!(token.balance(&user3), 300);

    // ── Change admin ─────────────────────────────────────────────────────
    token.set_admin(&admin2);
    assert_eq!(
        e.auths(),
        std::vec![(
            admin1.clone(),
            AuthorizedInvocation {
                function: AuthorizedFunction::Contract((
                    token.address.clone(),
                    symbol_short!("set_admin"),
                    (&admin2,).into_val(&e),
                )),
                sub_invocations: std::vec![]
            }
        )]
    );

    // ── Revoke allowance (set to 0) ──────────────────────────────────────
    token.approve(&user2, &user3, &500, &200);
    assert_eq!(token.allowance(&user2, &user3), 500);
    token.approve(&user2, &user3, &0, &200);
    assert_eq!(token.allowance(&user2, &user3), 0);
}

// ── Burn Tests ───────────────────────────────────────────────────────────────

#[test]
fn test_burn() {
    let e = Env::default();
    e.mock_all_auths();

    let admin = Address::generate(&e);
    let user1 = Address::generate(&e);
    let user2 = Address::generate(&e);
    let token = create_token(&e, &admin);

    token.mint(&user1, &1000);
    assert_eq!(token.balance(&user1), 1000);

    // Approve user2 to burn 500 of user1's tokens
    token.approve(&user1, &user2, &500, &200);
    assert_eq!(token.allowance(&user1, &user2), 500);

    // burn_from: user2 burns 500 of user1's tokens using allowance
    token.burn_from(&user2, &user1, &500);
    assert_eq!(
        e.auths(),
        std::vec![(
            user2.clone(),
            AuthorizedInvocation {
                function: AuthorizedFunction::Contract((
                    token.address.clone(),
                    symbol_short!("burn_from"),
                    (&user2, &user1, 500_i128).into_val(&e),
                )),
                sub_invocations: std::vec![]
            }
        )]
    );
    assert_eq!(token.allowance(&user1, &user2), 0);
    assert_eq!(token.balance(&user1), 500);
    assert_eq!(token.balance(&user2), 0);

    // Self-burn: user1 burns their remaining 500 tokens
    token.burn(&user1, &500);
    assert_eq!(
        e.auths(),
        std::vec![(
            user1.clone(),
            AuthorizedInvocation {
                function: AuthorizedFunction::Contract((
                    token.address.clone(),
                    symbol_short!("burn"),
                    (&user1, 500_i128).into_val(&e),
                )),
                sub_invocations: std::vec![]
            }
        )]
    );
    assert_eq!(token.balance(&user1), 0);
    assert_eq!(token.balance(&user2), 0);
}

// ── Edge Case Tests ──────────────────────────────────────────────────────────

#[test]
#[should_panic(expected = "insufficient balance")]
fn transfer_insufficient_balance() {
    let e = Env::default();
    e.mock_all_auths();

    let admin = Address::generate(&e);
    let user1 = Address::generate(&e);
    let user2 = Address::generate(&e);
    let token = create_token(&e, &admin);

    token.mint(&user1, &1000);
    assert_eq!(token.balance(&user1), 1000);

    // This should panic — user1 only has 1000 tokens
    token.transfer(&user1, &user2, &1001);
}

#[test]
#[should_panic(expected = "insufficient allowance")]
fn transfer_from_insufficient_allowance() {
    let e = Env::default();
    e.mock_all_auths();

    let admin = Address::generate(&e);
    let user1 = Address::generate(&e);
    let user2 = Address::generate(&e);
    let user3 = Address::generate(&e);
    let token = create_token(&e, &admin);

    token.mint(&user1, &1000);
    assert_eq!(token.balance(&user1), 1000);

    token.approve(&user1, &user3, &100, &200);
    assert_eq!(token.allowance(&user1, &user3), 100);

    // This should panic — allowance is only 100
    token.transfer_from(&user3, &user1, &user2, &101);
}

#[test]
#[should_panic(expected = "Decimal must not be greater than 18")]
fn decimal_is_over_eighteen() {
    let e = Env::default();
    let admin = Address::generate(&e);
    let _ = TokenClient::new(
        &e,
        &e.register(
            Token,
            (
                admin,
                19_u32,
                String::from_val(&e, &"name"),
                String::from_val(&e, &"symbol"),
            ),
        ),
    );
}

#[test]
fn test_zero_allowance() {
    // Verify that transfer_from with 0 amount does not create an empty allowance
    let e = Env::default();
    e.mock_all_auths();

    let admin = Address::generate(&e);
    let spender = Address::generate(&e);
    let from = Address::generate(&e);
    let token = create_token(&e, &admin);

    token.transfer_from(&spender, &from, &spender, &0);
    assert!(token.get_allowance(&from, &spender).is_none());
}
