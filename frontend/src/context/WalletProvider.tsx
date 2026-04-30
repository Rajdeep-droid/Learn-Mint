"use client";

// ============================================================================
// WALLET PROVIDER — React Context for Stellar Multi-Wallet Support
// ============================================================================
// Uses @creit-tech/stellar-wallets-kit to support multiple Stellar wallets:
// Freighter, xBull, Albedo, Rabet, Lobstr, Hana, Hot Wallet, Klever, WalletConnect
// ============================================================================

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
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

// ── Provider Component ───────────────────────────────────────────────────

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [xlmBalance, setXlmBalance] = useState("0");
  const kitReadyRef = useRef(false);
  const kitRef = useRef<any>(null);

  // Initialize the Stellar Wallets Kit on mount (browser-only)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initKit = async () => {
      try {
        const { StellarWalletsKit } = await import("@creit-tech/stellar-wallets-kit/sdk");
        const { defaultModules } = await import("@creit-tech/stellar-wallets-kit/modules/utils");
        const { KitEventType } = await import("@creit-tech/stellar-wallets-kit/types");

        StellarWalletsKit.init({
          modules: defaultModules(),
        });

        kitRef.current = StellarWalletsKit;
        kitReadyRef.current = true;

        // Listen for wallet state updates
        StellarWalletsKit.on(KitEventType.STATE_UPDATED, (event: any) => {
          const addr = event?.payload?.address;
          if (addr) {
            setAddress(addr);
            setIsConnected(true);
            setIsLoading(false);
          }
        });

        // Listen for disconnect
        StellarWalletsKit.on(KitEventType.DISCONNECT, () => {
          setAddress("");
          setIsConnected(false);
          setXlmBalance("0");
        });
      } catch (err) {
        console.error("Failed to init Stellar Wallets Kit:", err);
        // Fallback: kit not available, user can still use the app
      }
    };

    initKit();
  }, []);

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
      const kit = kitRef.current;
      if (!kit || !kitReadyRef.current) {
        // Fallback to direct Freighter if kit failed to load
        const { isConnected: checkConnected, requestAccess } = await import("@stellar/freighter-api");
        const connResult = await checkConnected();
        const installed = typeof connResult === "boolean" ? connResult : !!connResult?.isConnected;
        if (!installed) {
          alert("No Stellar wallet detected. Please install Freighter or another Stellar wallet.");
          window.open("https://www.freighter.app/", "_blank");
          throw new Error("No wallet installed");
        }
        const result = await requestAccess();
        if ("error" in result) throw new Error(result.error);
        setAddress(result.address);
        setIsConnected(true);
        return;
      }

      // Open the kit's built-in wallet selection modal
      const { address: walletAddress } = await kit.authModal();
      if (walletAddress) {
        setAddress(walletAddress);
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    const kit = kitRef.current;
    if (kit && kitReadyRef.current) {
      try { kit.disconnect(); } catch { /* ignore */ }
    }
    setAddress("");
    setIsConnected(false);
    setXlmBalance("0");
  }, []);

  const signTransaction = useCallback(async (xdr: string): Promise<string> => {
    if (!isConnected) throw new Error("Wallet not connected");

    const kit = kitRef.current;
    if (kit && kitReadyRef.current) {
      try {
        const { address: currentAddr } = await kit.getAddress();
        const result = await kit.signTransaction(xdr, {
          networkPassphrase: "Test SDF Network ; September 2015",
          address: currentAddr,
        });
        return result.signedTxXdr;
      } catch (err: any) {
        const msg = err?.message || "";
        if (msg.includes("User declined") || msg.includes("rejected") || msg.includes("cancel")) {
          throw new Error("User declined the transaction");
        }
        throw err;
      }
    }

    // Fallback to direct Freighter signing
    const { signTransaction: freighterSign } = await import("@stellar/freighter-api");
    const result = await freighterSign(xdr, {
      networkPassphrase: "Test SDF Network ; September 2015",
    });
    if ("error" in result) {
      const errMsg = typeof result.error === "string"
        ? result.error
        : (result.error as any)?.message || JSON.stringify(result.error);
      throw new Error(errMsg || "User declined the transaction");
    }
    const signed = (result as any).signedTxXdr || (result as any).xdr || (typeof result === "string" ? result : "");
    if (!signed) throw new Error("No signed transaction returned from wallet");
    return signed;
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
