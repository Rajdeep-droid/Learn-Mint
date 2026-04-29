"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletProvider";
import { useToast } from "@/components/Toast";

export default function NavBar() {
  const { address, isConnected, isLoading, xlmBalance, connect, disconnect } =
    useWallet();
  const { showToast } = useToast();
  const [flickering, setFlickering] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const truncated = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  const handleToggle = async () => {
    if (isConnected) {
      disconnect();
      showToast("WALLET DISCONNECTED");
      router.push("/");
    } else {
      try {
        await connect();
        showToast("WALLET CONNECTED");
        setFlickering(true);
        setTimeout(() => setFlickering(false), 600);
      } catch { /* handled in provider */ }
    }
  };

  const NAV_LINKS = [
    { label: "HOME", path: "/", hoverBg: "rgba(0,255,159,0.12)", hoverBorder: "rgba(0,255,159,0.3)", hoverColor: "var(--neon)" },
    { label: "DASHBOARD", path: "/dashboard", hoverBg: "rgba(0,229,255,0.12)", hoverBorder: "rgba(0,229,255,0.3)", hoverColor: "var(--cyan)" },
  ];

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        background: "rgba(5,5,16,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        padding: "0 28px",
        height: 60,
      }}
    >
      {/* Left — Logo */}
      <a href="/" onClick={e => { e.preventDefault(); router.push("/"); }}
        style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, justifySelf: "start" }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "var(--gradient-main)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-display)", fontSize: "1.1rem",
          color: "var(--black)", fontWeight: 700,
        }}>LM</div>
        <span style={{
          fontFamily: "var(--font-display)", fontSize: "1.8rem",
          letterSpacing: "0.1em", lineHeight: 1,
        }}>
          <span className="text-gradient">LEARN</span>{" "}
          <span style={{ color: "var(--white)" }}>MINT</span>
        </span>
      </a>

      {/* Center — Nav links */}
      <div style={{ display: "flex", gap: 6, justifySelf: "center" }}>
        {NAV_LINKS.map(link => {
          const active = pathname === link.path;
          return (
            <button key={link.path}
              onClick={() => router.push(link.path)}
              style={{
                fontFamily: "var(--font-mono)", fontSize: "0.82rem", fontWeight: 700,
                letterSpacing: "0.14em", textTransform: "uppercase",
                background: active ? link.hoverBg : "transparent",
                color: active ? link.hoverColor : "#666",
                border: active ? `1px solid ${link.hoverBorder}` : "1px solid transparent",
                padding: "8px 22px", borderRadius: 8, cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = link.hoverBg;
                  e.currentTarget.style.color = link.hoverColor;
                  e.currentTarget.style.borderColor = link.hoverBorder;
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#666";
                  e.currentTarget.style.borderColor = "transparent";
                }
              }}
            >{link.label}</button>
          );
        })}
      </div>

      {/* Right — Network + Wallet */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, justifySelf: "end" }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: "0.6rem",
          letterSpacing: "0.15em", color: "#555", textTransform: "uppercase",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--neon)", display: "inline-block" }} />
          STELLAR TESTNET
        </span>

        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={flickering ? "animate-flicker" : ""}
          style={{
            fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 700,
            letterSpacing: "0.08em", textTransform: "uppercase",
            background: isConnected ? "rgba(0,255,159,0.08)" : "var(--gradient-main)",
            backgroundSize: isConnected ? "auto" : "200% 200%",
            color: isConnected ? "var(--neon)" : "var(--black)",
            border: isConnected ? "1px solid rgba(0,255,159,0.3)" : "none",
            padding: "8px 20px", borderRadius: 8, cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {isLoading
            ? "CONNECTING..."
            : isConnected
            ? `${truncated} · ${parseFloat(xlmBalance).toFixed(2)} XLM`
            : "CONNECT WALLET"}
        </button>
      </div>
    </nav>
  );
}
