// ============================================================================
// STORAGE TYPES — Data Keys and TTL Constants
// ============================================================================
// Soroban has three types of storage, each with different cost/lifetime:
//
//   1. Instance  — Lives as long as the contract instance. Good for config.
//   2. Persistent — Survives across invocations, but needs TTL bumps.
//                   Good for user balances.
//   3. Temporary — Cheapest, auto-deleted after TTL expires.
//                  Good for allowances (they're short-lived approvals).
//
// TTL (Time-To-Live) is measured in "ledgers". One ledger ≈ 5 seconds.
// So 17,280 ledgers ≈ 1 day.
// ============================================================================

use soroban_sdk::{contracttype, Address};

// ── TTL Constants ─────────────────────────────────────────────────────────
// These define how long data stays on the ledger before it's garbage collected.

/// Number of ledgers in approximately one day (24h ÷ 5s per ledger).
pub(crate) const DAY_IN_LEDGERS: u32 = 17_280;

/// Instance storage: bump to 7 days whenever we touch the contract.
/// This keeps the contract "alive" as long as someone uses it weekly.
pub(crate) const INSTANCE_BUMP_AMOUNT: u32 = 7 * DAY_IN_LEDGERS;

/// When TTL drops below this threshold, we bump it back up.
/// Set to (7 days - 1 day) = 6 days, so we refresh with 1 day of margin.
pub(crate) const INSTANCE_LIFETIME_THRESHOLD: u32 = INSTANCE_BUMP_AMOUNT - DAY_IN_LEDGERS;

/// Balance storage: keep user balances alive for 30 days.
pub(crate) const BALANCE_BUMP_AMOUNT: u32 = 30 * DAY_IN_LEDGERS;

/// Refresh balances when they have less than 29 days remaining.
pub(crate) const BALANCE_LIFETIME_THRESHOLD: u32 = BALANCE_BUMP_AMOUNT - DAY_IN_LEDGERS;

// ── Data Key Enum ─────────────────────────────────────────────────────────
// This enum acts as a "key" for the contract's key-value storage.
// Think of it like column names in a database — each variant is a
// different "table" of data the contract manages.

/// Composite key for allowance lookups: (owner, spender) → amount.
#[derive(Clone)]
#[contracttype]
pub struct AllowanceDataKey {
    pub from: Address,     // The token owner who granted the allowance
    pub spender: Address,  // The address allowed to spend on behalf of `from`
}

/// Value stored for each allowance entry.
#[contracttype]
pub struct AllowanceValue {
    pub amount: i128,            // How many tokens the spender can still use
    pub expiration_ledger: u32,  // After this ledger, the allowance is void
}

/// All possible storage keys for the token contract.
///
/// Data structure: This is an algebraic data type (tagged union / sum type).
/// Each variant maps to a different piece of on-chain state:
///
///   Admin          → The contract administrator's Address (instance storage)
///   Balance(addr)  → A user's token balance (persistent storage)
///   Allowance(key) → An approval record (temporary storage)
#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Allowance(AllowanceDataKey),
    Balance(Address),
    Admin,
}
