// ============================================================================
// ALLOWANCE — Delegated Spending (Approve / TransferFrom)
// ============================================================================
// Allowances let a token owner say "Address X can spend up to Y of my tokens."
// This is the same pattern as ERC-20's `approve` + `transferFrom` on Ethereum.
//
// Use case: A user approves a DEX contract to move their tokens during a trade.
//
// Storage: Temporary — allowances are short-lived and auto-expire.
//   Key:   DataKey::Allowance(AllowanceDataKey { from, spender })
//   Value: AllowanceValue { amount, expiration_ledger }
//
// The `expiration_ledger` adds a time limit — after that ledger number,
// the allowance becomes invalid even if `amount > 0`.
// ============================================================================

use crate::storage_types::{AllowanceDataKey, AllowanceValue, DataKey};
use soroban_sdk::{Address, Env};

/// Reads the current allowance for a (from, spender) pair.
///
/// Time complexity: O(1) — single temporary storage lookup.
/// Returns a zeroed AllowanceValue if no allowance exists or if it has expired.
pub fn read_allowance(e: &Env, from: Address, spender: Address) -> AllowanceValue {
    let key = DataKey::Allowance(AllowanceDataKey { from, spender });
    if let Some(allowance) = e.storage().temporary().get::<_, AllowanceValue>(&key) {
        // Check if the allowance has expired by comparing against current ledger
        if allowance.expiration_ledger < e.ledger().sequence() {
            AllowanceValue {
                amount: 0,
                expiration_ledger: allowance.expiration_ledger,
            }
        } else {
            allowance
        }
    } else {
        // No allowance ever set for this pair
        AllowanceValue {
            amount: 0,
            expiration_ledger: 0,
        }
    }
}

/// Sets or updates the allowance for a (from, spender) pair.
///
/// Time complexity: O(1) — single temporary storage write + TTL adjustment.
///
/// Panics if `amount > 0` but `expiration_ledger` is already in the past.
/// (No point setting an allowance that's already expired.)
pub fn write_allowance(
    e: &Env,
    from: Address,
    spender: Address,
    amount: i128,
    expiration_ledger: u32,
) {
    let allowance = AllowanceValue {
        amount,
        expiration_ledger,
    };

    // Sanity check: can't approve a positive amount with a past expiration
    if amount > 0 && expiration_ledger < e.ledger().sequence() {
        panic!("expiration_ledger is less than ledger seq when amount > 0");
    }

    let key = DataKey::Allowance(AllowanceDataKey { from, spender });
    e.storage().temporary().set(&key.clone(), &allowance);

    // Extend the TTL of the temporary entry to match the expiration ledger.
    // This ensures the data lives on-chain at least until it expires.
    if amount > 0 {
        let live_for = expiration_ledger
            .checked_sub(e.ledger().sequence())
            .unwrap();
        e.storage()
            .temporary()
            .extend_ttl(&key, live_for, live_for);
    }
}

/// Deducts `amount` from the allowance of (from, spender).
///
/// Time complexity: O(1) — one read + one conditional write.
///
/// Panics if the remaining allowance is insufficient.
/// This is called during `transfer_from` operations.
pub fn spend_allowance(e: &Env, from: Address, spender: Address, amount: i128) {
    let allowance = read_allowance(e, from.clone(), spender.clone());
    if allowance.amount < amount {
        panic!("insufficient allowance");
    }
    if amount > 0 {
        write_allowance(
            e,
            from,
            spender,
            allowance.amount - amount,
            allowance.expiration_ledger,
        );
    }
}
