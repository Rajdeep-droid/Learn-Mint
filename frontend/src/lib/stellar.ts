// ============================================================================
// STELLAR — Constants & Helpers
// ============================================================================
// Central configuration for all Stellar/Soroban interactions.
// ============================================================================

import { Networks, TransactionBuilder, xdr, Contract, Address, nativeToScVal } from "@stellar/stellar-sdk";
import { Server } from "@stellar/stellar-sdk/rpc";

// ── Network Configuration ────────────────────────────────────────────────

/** Soroban RPC endpoint for Stellar Testnet */
export const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org:443";

/** Stellar Testnet network passphrase */
export const NETWORK_PASSPHRASE = Networks.TESTNET;

/** Horizon (classic network) URL for balance queries */
export const HORIZON_URL = "https://horizon-testnet.stellar.org";

// ── Contract IDs ─────────────────────────────────────────────────────────
// These will be populated after deploying contracts to testnet.
// For now, use placeholder values.

export const REWARD_TOKEN_CONTRACT_ID =
  process.env.NEXT_PUBLIC_REWARD_TOKEN_CONTRACT_ID || "";

export const COURSE_QUIZ_CONTRACT_ID =
  process.env.NEXT_PUBLIC_COURSE_QUIZ_CONTRACT_ID || "";

export const XLM_SAC_CONTRACT_ID =
  process.env.NEXT_PUBLIC_XLM_SAC_CONTRACT_ID || "";

// ── Token Constants ──────────────────────────────────────────────────────

/** LEARN token has 7 decimal places (matching XLM's precision) */
export const LEARN_TOKEN_DECIMALS = 7;

/** 10 LEARN tokens in smallest units: 10 * 10^7 = 100,000,000 */
export const REWARD_AMOUNT = 100_000_000;

/** 1 XLM in stroops: 10,000,000 */
export const ONE_XLM_STROOPS = 10_000_000;

// ── RPC Client ───────────────────────────────────────────────────────────

let _server: Server | null = null;

/** Lazy singleton RPC server instance */
export function getServer(): Server {
  if (!_server) {
    _server = new Server(SOROBAN_RPC_URL);
  }
  return _server;
}

// ── Helper Functions ─────────────────────────────────────────────────────

/**
 * Fetches the XLM balance for a Stellar account from Horizon.
 * Returns the balance as a human-readable string (e.g., "100.0000000").
 */
export async function fetchXlmBalance(publicKey: string): Promise<string> {
  try {
    const response = await fetch(`${HORIZON_URL}/accounts/${publicKey}`);
    if (!response.ok) return "0";
    const data = await response.json();
    const nativeBalance = data.balances?.find(
      (b: { asset_type: string }) => b.asset_type === "native"
    );
    return nativeBalance?.balance || "0";
  } catch {
    return "0";
  }
}

/**
 * Truncates a Stellar address for display purposes.
 * e.g., "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" → "GXXX...XXXX"
 */
export function truncateAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

/**
 * Formats a token amount from smallest units to human-readable form.
 * e.g., 100000000 with decimals=7 → "10.0"
 */
export function formatTokenAmount(
  amount: bigint | number,
  decimals: number = LEARN_TOKEN_DECIMALS
): string {
  const divisor = BigInt(10 ** decimals);
  const bigAmount = BigInt(amount);
  const whole = bigAmount / divisor;
  const fractional = bigAmount % divisor;
  if (fractional === 0n) return whole.toString();
  const fracStr = fractional.toString().padStart(decimals, "0").replace(/0+$/, "");
  return `${whole}.${fracStr}`;
}

/**
 * Builds a Soroban transaction for contract invocation.
 */
export async function buildContractTransaction(
  sourcePublicKey: string,
  contractId: string,
  method: string,
  args: xdr.ScVal[]
) {
  const server = getServer();
  const account = await server.getAccount(sourcePublicKey);
  const contract = new Contract(contractId);

  const tx = new TransactionBuilder(account, {
    fee: "100000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  // Simulate to get the prepared transaction
  const prepared = await server.prepareTransaction(tx);
  return prepared;
}

/**
 * Submits a signed transaction and waits for the result.
 */
export async function submitTransaction(signedXdr: string) {
  const server = getServer();
  const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const response = await server.sendTransaction(tx);

  if (response.status === "ERROR") {
    throw new Error(`Transaction failed: ${JSON.stringify(response)}`);
  }

  // Poll for completion
  let getResponse = await server.getTransaction(response.hash);
  while (getResponse.status === "NOT_FOUND") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    getResponse = await server.getTransaction(response.hash);
  }

  if (getResponse.status === "SUCCESS") {
    return getResponse;
  }

  throw new Error(`Transaction failed: ${getResponse.status}`);
}

/**
 * Converts an address string to an ScVal for contract calls.
 */
export function addressToScVal(address: string): xdr.ScVal {
  return nativeToScVal(Address.fromString(address), { type: "address" });
}

/**
 * Converts a u32 number to an ScVal for contract calls.
 */
export function u32ToScVal(value: number): xdr.ScVal {
  return nativeToScVal(value, { type: "u32" });
}

/**
 * Converts a Vec<u32> (array of numbers) to an ScVal for contract calls.
 */
export function u32ArrayToScVal(values: number[]): xdr.ScVal {
  return xdr.ScVal.scvVec(values.map((v) => nativeToScVal(v, { type: "u32" })));
}
