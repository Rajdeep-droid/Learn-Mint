// ============================================================================
// CONTRACT — Main Token Logic (SEP-41 Implementation)
// ============================================================================
// This is the heart of the Reward Token contract. It implements:
//
//   1. Constructor     — One-time initialization (admin, name, symbol, decimals)
//   2. Admin functions — mint(), set_admin()
//   3. TokenInterface  — The full SEP-41 standard (transfer, approve, burn, etc.)
//
// The SEP-41 standard is Stellar's equivalent of Ethereum's ERC-20.
// Any wallet or contract that speaks SEP-41 can interact with our LEARN token.
//
// Authorization model:
//   - `mint()`      requires the admin's signature
//   - `transfer()`  requires the sender's signature
//   - `approve()`   requires the owner's signature
//   - `burn()`      requires the token holder's signature
// ============================================================================

use crate::admin::{read_administrator, write_administrator};
use crate::allowance::{read_allowance, spend_allowance, write_allowance};
use crate::balance::{read_balance, receive_balance, spend_balance};
use crate::metadata::{read_decimal, read_name, read_symbol, write_metadata};
#[cfg(test)]
use crate::storage_types::{AllowanceDataKey, AllowanceValue, DataKey};
use crate::storage_types::{INSTANCE_BUMP_AMOUNT, INSTANCE_LIFETIME_THRESHOLD};
use soroban_sdk::{
    contract, contractevent, contractimpl, token::TokenInterface, Address, Env, MuxedAddress,
    String,
};
use soroban_token_sdk::events;
use soroban_token_sdk::metadata::TokenMetadata;

// ── Helper ────────────────────────────────────────────────────────────────

/// Guard function: rejects negative amounts early.
///
/// All token operations (mint, transfer, burn) must use non-negative amounts.
/// Calling this at the top of each function provides a clean, consistent error.
fn check_nonnegative_amount(amount: i128) {
    if amount < 0 {
        panic!("negative amount is not allowed: {}", amount)
    }
}

// ── Contract Struct ───────────────────────────────────────────────────────

/// The `#[contract]` attribute marks this struct as a Soroban smart contract.
/// The struct itself is empty — all state lives in Soroban's storage, not
/// in Rust struct fields. Think of it as a "namespace" for the functions.
#[contract]
pub struct Token;

// ── Admin Functions (not part of SEP-41 standard) ─────────────────────────

#[contractimpl]
impl Token {
    /// Constructor — called exactly once when the contract is deployed.
    ///
    /// Parameters:
    ///   - `admin`:   The address that can mint tokens (will be the Quiz contract)
    ///   - `decimal`: Number of decimal places (we use 7 to match XLM)
    ///   - `name`:    Human-readable token name ("Learn Mint Token")
    ///   - `symbol`:  Short ticker symbol ("LEARN")
    ///
    /// Time complexity: O(1) — writes admin + metadata to storage.
    pub fn __constructor(e: Env, admin: Address, decimal: u32, name: String, symbol: String) {
        if decimal > 18 {
            panic!("Decimal must not be greater than 18");
        }
        write_administrator(&e, &admin);
        write_metadata(
            &e,
            TokenMetadata {
                decimal,
                name,
                symbol,
            },
        )
    }

    /// Mints new tokens and credits them to the `to` address.
    ///
    /// Only the admin (Quiz Contract) can call this. The `require_auth()`
    /// check ensures the admin has cryptographically signed this invocation.
    ///
    /// When the Quiz Contract makes a cross-contract call to this function,
    /// Soroban automatically provides the Quiz Contract's authorization.
    ///
    /// Parameters:
    ///   - `to`:     Recipient of the newly minted tokens
    ///   - `amount`: Number of tokens to mint (in smallest units)
    ///
    /// Time complexity: O(1) — auth check + balance update.
    pub fn mint(e: Env, to: Address, amount: i128) {
        check_nonnegative_amount(amount);
        let admin = read_administrator(&e);
        admin.require_auth();

        // Keep the contract instance alive by bumping its TTL
        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        // Credit the recipient's balance
        receive_balance(&e, to.clone(), amount);

        // Emit a standardized mint event for indexers and block explorers
        events::MintWithAmountOnly { to, amount }.publish(&e);
    }

    /// Transfers the admin role to a new address.
    ///
    /// Only the current admin can call this. Useful for:
    ///   - Upgrading the Quiz Contract to a new version
    ///   - Transferring control to a DAO or multisig
    ///
    /// Time complexity: O(1) — auth check + storage write.
    pub fn set_admin(e: Env, new_admin: Address) {
        let admin = read_administrator(&e);
        admin.require_auth();

        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        write_administrator(&e, &new_admin);
        SetAdmin {
            admin,
            new_admin,
        }
        .publish(&e);
    }

    /// Test-only helper: reads the raw allowance value for inspection.
    /// The `#[cfg(test)]` attribute means this function only exists during testing.
    #[cfg(test)]
    pub fn get_allowance(e: Env, from: Address, spender: Address) -> Option<AllowanceValue> {
        let key = DataKey::Allowance(AllowanceDataKey { from, spender });
        e.storage().temporary().get::<_, AllowanceValue>(&key)
    }
}

// Custom event emitted when the admin role is transferred.
// Not part of SEP-41, but useful for off-chain monitoring.
#[contractevent(data_format = "single-value")]
pub struct SetAdmin {
    #[topic]
    admin: Address,
    new_admin: Address,
}

// ── SEP-41 Token Interface Implementation ─────────────────────────────────
// These are the standard functions that any SEP-41 compatible wallet or
// contract expects. Implementing `TokenInterface` is like implementing an
// interface/trait in Java or Go.

impl TokenInterface for Token {
    /// Returns how many tokens `spender` is allowed to spend on behalf of `from`.
    ///
    /// Time complexity: O(1).
    fn allowance(e: Env, from: Address, spender: Address) -> i128 {
        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
        read_allowance(&e, from, spender).amount
    }

    /// Grants `spender` permission to spend up to `amount` tokens from `from`'s balance.
    ///
    /// The approval expires at `expiration_ledger`. After that ledger number,
    /// the spender can no longer use this allowance.
    ///
    /// Time complexity: O(1).
    fn approve(e: Env, from: Address, spender: Address, amount: i128, expiration_ledger: u32) {
        from.require_auth();
        check_nonnegative_amount(amount);

        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        write_allowance(&e, from.clone(), spender.clone(), amount, expiration_ledger);
        events::Approve {
            from,
            spender,
            amount,
            expiration_ledger,
        }
        .publish(&e);
    }

    /// Returns the token balance of the given address.
    ///
    /// Time complexity: O(1).
    fn balance(e: Env, id: Address) -> i128 {
        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
        read_balance(&e, id)
    }

    /// Transfers `amount` tokens from `from` to `to_muxed`.
    ///
    /// The sender (`from`) must authorize this call.
    /// MuxedAddress supports both regular and muxed (multiplexed) addresses,
    /// which allow multiple logical accounts to share one Stellar keypair.
    ///
    /// Time complexity: O(1) — one spend + one receive.
    fn transfer(e: Env, from: Address, to_muxed: MuxedAddress, amount: i128) {
        from.require_auth();
        check_nonnegative_amount(amount);

        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        // Deduct from sender, credit to receiver
        spend_balance(&e, from.clone(), amount);
        let to: Address = to_muxed.address();
        receive_balance(&e, to.clone(), amount);

        events::Transfer {
            from,
            to,
            to_muxed_id: to_muxed.id(),
            amount,
        }
        .publish(&e);
    }

    /// Transfers tokens on behalf of `from`, using the spender's allowance.
    ///
    /// This is the "transferFrom" pattern from ERC-20:
    ///   1. Owner approves spender for X tokens
    ///   2. Spender calls transfer_from to move up to X tokens
    ///
    /// Time complexity: O(1) — allowance check + balance updates.
    fn transfer_from(e: Env, spender: Address, from: Address, to: Address, amount: i128) {
        spender.require_auth();
        check_nonnegative_amount(amount);

        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        // Deduct from the spender's allowance first
        spend_allowance(&e, from.clone(), spender, amount);
        // Then move the actual tokens
        spend_balance(&e, from.clone(), amount);
        receive_balance(&e, to.clone(), amount);

        events::Transfer {
            from,
            to,
            // `transfer_from` does not support muxed destination.
            to_muxed_id: None,
            amount,
        }
        .publish(&e);
    }

    /// Destroys `amount` tokens from `from`'s balance (permanently).
    ///
    /// The token holder must authorize this. Burned tokens cannot be recovered.
    ///
    /// Time complexity: O(1).
    fn burn(e: Env, from: Address, amount: i128) {
        from.require_auth();
        check_nonnegative_amount(amount);

        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        spend_balance(&e, from.clone(), amount);
        events::Burn { from, amount }.publish(&e);
    }

    /// Burns tokens on behalf of `from`, consuming the spender's allowance.
    ///
    /// Time complexity: O(1).
    fn burn_from(e: Env, spender: Address, from: Address, amount: i128) {
        spender.require_auth();
        check_nonnegative_amount(amount);

        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        spend_allowance(&e, from.clone(), spender, amount);
        spend_balance(&e, from.clone(), amount);
        events::Burn { from, amount }.publish(&e);
    }

    /// Returns the number of decimal places (e.g., 7 for LEARN).
    fn decimals(e: Env) -> u32 {
        read_decimal(&e)
    }

    /// Returns the token name (e.g., "Learn Mint Token").
    fn name(e: Env) -> String {
        read_name(&e)
    }

    /// Returns the token symbol (e.g., "LEARN").
    fn symbol(e: Env) -> String {
        read_symbol(&e)
    }
}
