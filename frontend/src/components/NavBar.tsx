"use client";

// ============================================================================
// NAVBAR — Glassmorphism Navigation Bar
// ============================================================================
// Top navigation with:
//   - App logo/brand
//   - Wallet connect/disconnect button
//   - Truncated address + XLM balance display
//   - Mobile-responsive hamburger menu
// ============================================================================

import { useState } from "react";
import { useWallet } from "@/context/WalletProvider";
import { truncateAddress } from "@/lib/stellar";

export default function NavBar() {
  const { address, isConnected, isLoading, xlmBalance, connect, disconnect } =
    useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav
      id="navbar"
      className="fixed top-0 left-0 right-0 z-50 glass"
      style={{ borderTop: "none", borderLeft: "none", borderRight: "none" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ── Logo ──────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold"
              style={{ background: "var(--gradient-primary)", color: "#060918" }}
            >
              L
            </div>
            <span className="text-xl font-bold text-gradient">Learn Mint</span>
          </div>

          {/* ── Desktop Wallet Button ─────────────────────────────────── */}
          <div className="hidden sm:flex items-center gap-4">
            {isConnected ? (
              <div className="flex items-center gap-3">
                {/* XLM Balance */}
                <div className="glass-subtle rounded-full px-4 py-2 flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: "var(--accent-green)" }}
                  />
                  <span className="text-sm font-medium" style={{ color: "var(--foreground-muted)" }}>
                    {parseFloat(xlmBalance).toFixed(2)} XLM
                  </span>
                </div>

                {/* Address */}
                <div className="glass-subtle rounded-full px-4 py-2">
                  <span className="text-sm font-mono" style={{ color: "var(--accent-cyan)" }}>
                    {truncateAddress(address)}
                  </span>
                </div>

                {/* Disconnect */}
                <button
                  id="disconnect-wallet-btn"
                  onClick={disconnect}
                  className="btn-secondary text-sm !py-2 !px-4 !rounded-full"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                id="connect-wallet-btn"
                onClick={connect}
                disabled={isLoading}
                className="btn-primary text-sm !py-2 !px-5 !rounded-full flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <path d="M22 10H18a2 2 0 0 0 0 4h4" />
                    </svg>
                    Connect Wallet
                  </>
                )}
              </button>
            )}
          </div>

          {/* ── Mobile Hamburger ───────────────────────────────────────── */}
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-lg"
            style={{ color: "var(--foreground-muted)" }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ─────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="sm:hidden glass-strong animate-fade-in-up p-4 mx-4 mb-4 rounded-xl">
          {isConnected ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: "var(--accent-green)" }}
                  />
                  <span className="text-sm font-mono" style={{ color: "var(--accent-cyan)" }}>
                    {truncateAddress(address)}
                  </span>
                </div>
                <span className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                  {parseFloat(xlmBalance).toFixed(2)} XLM
                </span>
              </div>
              <button
                onClick={() => {
                  disconnect();
                  setMobileMenuOpen(false);
                }}
                className="btn-secondary text-sm w-full"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={async () => {
                await connect();
                setMobileMenuOpen(false);
              }}
              disabled={isLoading}
              className="btn-primary text-sm w-full"
            >
              {isLoading ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
