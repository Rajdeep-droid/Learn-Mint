// ============================================================================
// ADMIN — Administrator Management
// ============================================================================
// The admin is the single address authorized to mint new tokens.
// In our architecture, the Course & Quiz contract will be set as the admin
// so it can mint LEARN tokens when users pass quizzes.
//
// Storage: Instance (lives as long as the contract itself).
// ============================================================================

use soroban_sdk::{Address, Env};

use crate::storage_types::DataKey;

/// Reads the current administrator address from instance storage.
///
/// Time complexity: O(1) — single key lookup.
/// Panics if no admin has been set (contract not initialized).
pub fn read_administrator(e: &Env) -> Address {
    let key = DataKey::Admin;
    e.storage().instance().get(&key).unwrap()
}

/// Writes a new administrator address to instance storage.
///
/// Time complexity: O(1) — single key write.
/// This overwrites the previous admin — there is only ever one.
pub fn write_administrator(e: &Env, id: &Address) {
    let key = DataKey::Admin;
    e.storage().instance().set(&key, id);
}
