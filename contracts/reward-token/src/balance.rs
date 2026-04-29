// ============================================================================
// BALANCE — Token Balance Management
// ============================================================================
// Each user's token balance is stored in persistent storage, keyed by their
// Stellar address. Persistent storage requires periodic TTL bumps to prevent
// the data from expiring.
//
// Data structure: Simple key-value mapping.
//   Key:   DataKey::Balance(Address)  →  Value: i128 (signed 128-bit integer)
//
// Why i128? The Soroban token standard uses i128 to match Stellar's native
// asset precision. It's signed so the contract can detect underflows cleanly.
// ============================================================================

use crate::storage_types::{DataKey, BALANCE_BUMP_AMOUNT, BALANCE_LIFETIME_THRESHOLD};
use soroban_sdk::{Address, Env};

/// Returns the token balance for a given address.
///
/// Time complexity: O(1) — single persistent storage lookup.
/// Returns 0 if the address has never received tokens.
pub fn read_balance(e: &Env, addr: Address) -> i128 {
    let key = DataKey::Balance(addr);
    if let Some(balance) = e.storage().persistent().get::<DataKey, i128>(&key) {
        // Bump the TTL every time we read, keeping the balance alive.
        e.storage()
            .persistent()
            .extend_ttl(&key, BALANCE_LIFETIME_THRESHOLD, BALANCE_BUMP_AMOUNT);
        balance
    } else {
        0 // No entry means zero balance — not an error
    }
}

/// Internal helper: writes a balance value to persistent storage.
///
/// Time complexity: O(1) — single key write + TTL bump.
fn write_balance(e: &Env, addr: Address, amount: i128) {
    let key = DataKey::Balance(addr);
    e.storage().persistent().set(&key, &amount);
    e.storage()
        .persistent()
        .extend_ttl(&key, BALANCE_LIFETIME_THRESHOLD, BALANCE_BUMP_AMOUNT);
}

/// Increases a user's balance by `amount` (used for minting and receiving transfers).
///
/// Time complexity: O(1) — one read + one write.
pub fn receive_balance(e: &Env, addr: Address, amount: i128) {
    let balance = read_balance(e, addr.clone());
    write_balance(e, addr, balance + amount);
}

/// Decreases a user's balance by `amount` (used for transfers and burns).
///
/// Time complexity: O(1) — one read + one write.
/// Panics if the user doesn't have enough tokens (prevents negative balances).
pub fn spend_balance(e: &Env, addr: Address, amount: i128) {
    let balance = read_balance(e, addr.clone());
    if balance < amount {
        panic!("insufficient balance");
    }
    write_balance(e, addr, balance - amount);
}
