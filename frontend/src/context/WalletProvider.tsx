"use client";

// ============================================================================
// WALLET PROVIDER — React Context for Stellar Wallet
// ============================================================================
// Wraps the app with wallet state management. Uses the Freighter browser
// extension API for wallet connection and transaction signing.
// ============================================================================

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { fetchXlmBalance } from "@/lib/stellar";

// ── Types ────────────────────────────────────────────────────────────────

interface WalletState {
  address: string;
  isConnected: boolean;
  isLoading: boolean;
  xlmBalance: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransaction: (xdr: string) => Promise<string>;
  refreshBalance: () => Promise<void>;
}

const defaultState: WalletState = {
  address: "",
  isConnected: false,
  isLoading: false,
  xlmBalance: "0",
  connect: async () => {},
  disconnect: () => {},
  signTransaction: async () => "",
  refreshBalance: async () => {},
};

const WalletContext = createContext<WalletState>(defaultState);

export function useWallet() {
  return useContext(WalletContext);
}

// ── Freighter API helpers ────────────────────────────────────────────────

async function isFreighterInstalled(): Promise<boolean> {
  try {
    const { isConnected } = await import("@stellar/freighter-api");
    const connected = await isConnected();
    return connected;
  } catch (e) {
    console.error("Error checking Freighter installation:", e);
    return false;
  }
}

async function getFreighterPublicKey(): Promise<string> {
  const { requestAccess } = await import("@stellar/freighter-api");
  const result = await requestAccess();
  if ("error" in result) {
    throw new Error(result.error);
  }
  return result.address;
}

async function signWithFreighter(xdr: string): Promise<string> {
  const { signTransaction } = await import("@stellar/freighter-api");
  const result = await signTransaction(xdr, {
    networkPassphrase: "Test SDF Network ; September 2015",
  });
  if ("error" in result) {
    throw new Error(result.error);
  }
  return result.signedTxXdr;
}

// ── Provider Component ───────────────────────────────────────────────────

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [xlmBalance, setXlmBalance] = useState("0");

  const refreshBalance = useCallback(async () => {
    if (!address) return;
    const balance = await fetchXlmBalance(address);
    setXlmBalance(balance);
  }, [address]);

  // Auto-refresh balance when address changes
  useEffect(() => {
    if (address) {
      refreshBalance();
    }
  }, [address, refreshBalance]);

  const connect = useCallback(async () => {
    setIsLoading(true);
    try {
      const installed = await isFreighterInstalled();
      if (!installed) {
        alert("Freighter wallet not detected. Opening download page...");
        window.open("https://www.freighter.app/", "_blank");
        throw new Error("Freighter wallet not installed. Please install it and try again.");
      }
      
      const publicKey = await getFreighterPublicKey();
      setAddress(publicKey);
      setIsConnected(true);
    } catch (error) {
      console.error("Wallet connection failed:", error);
      if (error instanceof Error && !error.message.includes("not installed")) {
        alert(`Connection failed: ${error.message}`);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress("");
    setIsConnected(false);
    setXlmBalance("0");
  }, []);

  const signTransaction = useCallback(async (xdr: string): Promise<string> => {
    if (!isConnected) throw new Error("Wallet not connected");
    return signWithFreighter(xdr);
  }, [isConnected]);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        isLoading,
        xlmBalance,
        connect,
        disconnect,
        signTransaction,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
