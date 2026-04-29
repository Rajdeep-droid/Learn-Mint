// ============================================================================
// METADATA — Token Name, Symbol, and Decimals
// ============================================================================
// Metadata lets wallets and block explorers display your token nicely.
// For example:
//   Name:     "Learn Mint Token"
//   Symbol:   "LEARN"
//   Decimals: 7  (matches Stellar's native asset precision)
//
// We use the `soroban_token_sdk::TokenUtils` helper which provides a
// standardized way to store and retrieve metadata. This ensures compatibility
// with any wallet that reads SEP-41 metadata.
// ============================================================================

use soroban_sdk::{Env, String};
use soroban_token_sdk::{metadata::TokenMetadata, TokenUtils};

/// Returns the number of decimal places the token uses.
///
/// For LEARN tokens with 7 decimals:
///   1 LEARN = 10,000,000 smallest units (like stroops for XLM).
pub fn read_decimal(e: &Env) -> u32 {
    let util = TokenUtils::new(e);
    util.metadata().get_metadata().decimal
}

/// Returns the human-readable token name (e.g., "Learn Mint Token").
pub fn read_name(e: &Env) -> String {
    let util = TokenUtils::new(e);
    util.metadata().get_metadata().name
}

/// Returns the short ticker symbol (e.g., "LEARN").
pub fn read_symbol(e: &Env) -> String {
    let util = TokenUtils::new(e);
    util.metadata().get_metadata().symbol
}

/// Writes all metadata fields at once. Called during contract initialization.
///
/// Time complexity: O(1) — single storage write.
pub fn write_metadata(e: &Env, metadata: TokenMetadata) {
    let util = TokenUtils::new(e);
    util.metadata().set_metadata(&metadata);
}
