// ============================================================================
// REWARD TOKEN — Module Root
// ============================================================================
// This file is the "entry point" of the Rust crate. It declares all the
// sub-modules that make up the token contract. Think of it like a table of
// contents — each `mod` statement pulls in a file from the `src/` directory.
//
// Architecture Overview:
// ┌─────────────┐
// │   lib.rs     │  ← You are here (module declarations)
// ├─────────────┤
// │  contract   │  ← Main contract logic (constructor, mint, TokenInterface)
// │  admin      │  ← Read/write the admin address
// │  balance    │  ← Read/write/spend user balances
// │  allowance  │  ← ERC-20 style approve/transferFrom logic
// │  metadata   │  ← Token name, symbol, decimals
// │  storage    │  ← Data key enums and TTL constants
// │  test       │  ← Unit tests (only compiled during `cargo test`)
// └─────────────┘
// ============================================================================

#![no_std]
// `no_std` means we don't use Rust's standard library (std).
// Soroban contracts run in a constrained WASM environment that doesn't
// have access to things like file I/O, networking, or heap allocation
// from std. The `soroban-sdk` provides all the primitives we need.

mod admin;
mod allowance;
mod balance;
mod contract;
mod metadata;
mod storage_types;
mod test;

// Re-export the auto-generated client so other contracts can import it.
// When the Course & Quiz contract does `contractimport!`, it gets this client.
pub use crate::contract::TokenClient;
