"use client";

// ============================================================================
// HOME PAGE — Landing page with wallet connection & how it works
// ============================================================================

import { useWallet } from "@/context/WalletProvider";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AnimatedStat from "@/components/AnimatedStat";
import HeroIcons from "@/components/HeroIcons";

// ── SVG Icons ──────────────────────────────────────────────────
const IconPlay = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
const IconCheck = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconCoin = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8" />
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);
const IconWallet = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
  </svg>
);
const IconShield = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const STATS = [
  { value: "14,892", label: "LEARNERS", color: "var(--neon)" },
  { value: "3,401", label: "CERTS MINTED", color: "var(--cyan)" },
  { value: "78.3%", label: "PASS RATE", color: "var(--purple)" },
  { value: "45K+", label: "TOKENS EARNED", color: "var(--amber)" },
];

const STEPS = [
  { icon: <IconWallet />, num: "01", title: "CONNECT WALLET", desc: "Link your Freighter wallet to authenticate on the Stellar network.", color: "var(--neon)", bg: "rgba(0,255,159,0.05)", border: "rgba(0,255,159,0.15)" },
  { icon: <IconPlay />, num: "02", title: "WATCH & LEARN", desc: "Stream short educational reels on blockchain, DeFi, and Web3 fundamentals.", color: "var(--cyan)", bg: "rgba(0,229,255,0.05)", border: "rgba(0,229,255,0.15)" },
  { icon: <IconCheck />, num: "03", title: "PASS THE QUIZ", desc: "Smart-contract verified quizzes validate your knowledge on-chain.", color: "var(--purple)", bg: "rgba(179,136,255,0.05)", border: "rgba(179,136,255,0.15)" },
  { icon: <IconCoin />, num: "04", title: "EARN REWARDS", desc: "Receive LEARN tokens and an NFT certificate minted directly to your wallet.", color: "var(--amber)", bg: "rgba(255,196,0,0.05)", border: "rgba(255,196,0,0.15)" },
];

const FEATURES = [
  { icon: <IconShield />, title: "ON-CHAIN VERIFIED", desc: "Every quiz and certificate is verified by Soroban smart contracts.", color: "var(--neon)" },
  { icon: <IconCoin />, title: "REAL REWARDS", desc: "Earn fungible LEARN tokens with real utility in the ecosystem.", color: "var(--cyan)" },
  { icon: <IconPlay />, title: "BITE-SIZED CONTENT", desc: "Short-form 9:16 vertical reels optimized for mobile learning.", color: "var(--purple)" },
];

export default function Home() {
  const { isConnected, connect, isLoading } = useWallet();
  const { showToast } = useToast();
  const router = useRouter();
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    if (isConnected) {
      router.push("/dashboard");
      return;
    }
    setConnecting(true);
    try {
      await connect();
      showToast("WALLET CONNECTED");
      setTimeout(() => router.push("/dashboard"), 800);
    } catch {
      /* handled in provider */
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div style={{ overflow: "hidden" }}>
      {/* ── HERO ───────────────────────────────────────────── */}
      <section style={{
        minHeight: "calc(100vh - 92px)",
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        padding: "80px 60px", position: "relative", textAlign: "center",
      }}>
        {/* Floating 3D Icons Overlay */}
        <HeroIcons />

        {/* Background orbs */}
        <div style={{ position: "absolute", top: -100, right: -100, width: 500, height: 500, background: "radial-gradient(circle, rgba(0,255,159,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -100, left: -50, width: 400, height: 400, background: "radial-gradient(circle, rgba(0,229,255,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", left: "50%", width: 600, height: 600, background: "radial-gradient(circle, rgba(179,136,255,0.03) 0%, transparent 50%)", pointerEvents: "none", transform: "translateX(-50%)" }} />

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.35em",
            textTransform: "uppercase", marginBottom: 24,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ width: 32, height: 2, background: "var(--gradient-main)", display: "inline-block", borderRadius: 1 }} />
            <span className="text-gradient">LEARN-TO-EARN ON STELLAR</span>
            <span style={{ width: 32, height: 2, background: "var(--gradient-main)", display: "inline-block", borderRadius: 1 }} />
          </div>

          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(4rem, 9vw, 8.5rem)",
            letterSpacing: "0.06em", lineHeight: 1, textTransform: "uppercase", marginBottom: 28,
            whiteSpace: "nowrap",
          }}>
            LEARN. <span className="text-gradient">VERIFY.</span> EARN.
          </h1>

          <p style={{
            fontFamily: "var(--font-body)", fontSize: "1.1rem", lineHeight: 1.7,
            color: "rgba(255,255,255,0.5)", maxWidth: 600, marginBottom: 44,
          }}>
            Watch educational content, pass smart-contract verified quizzes, and earn real tokens 
            and NFT certificates — all on the Stellar blockchain.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={handleConnect}
              style={{
                fontFamily: "var(--font-mono)", fontSize: "0.82rem", fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase",
                background: "var(--gradient-main)", backgroundSize: "200% 200%",
                color: "var(--black)", border: "none", padding: "18px 40px",
                borderRadius: 10, cursor: "pointer",
                boxShadow: "0 4px 24px rgba(0,255,159,0.2)",
                display: "flex", alignItems: "center", gap: 10,
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,255,159,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,255,159,0.2)"; }}
            >
              {isLoading || connecting ? "CONNECTING..." : isConnected ? "GO TO DASHBOARD" : "CONNECT WALLET"}
              <IconArrow />
            </button>

            {!isConnected && (
              <button onClick={() => router.push("/dashboard")}
                style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.82rem", fontWeight: 600,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  background: "transparent", color: "rgba(255,255,255,0.6)",
                  border: "1px solid rgba(255,255,255,0.1)", padding: "18px 40px",
                  borderRadius: 10, cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,229,255,0.3)"; e.currentTarget.style.color = "var(--cyan)"; e.currentTarget.style.background = "rgba(0,229,255,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.background = "transparent"; }}
              >
                EXPLORE COURSES
              </button>
            )}
          </div>
        </div>

        {/* Stats strip — animated counters */}
        <div style={{
          display: "flex", gap: 48, marginTop: 80, flexWrap: "wrap", justifyContent: "center",
        }}>
          {STATS.map((s, i) => (
            <AnimatedStat key={s.label} value={s.value} label={s.label} color={s.color} delay={i * 200} />
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section style={{
        padding: "80px 60px", borderTop: "1px solid rgba(255,255,255,0.06)",
        background: "var(--gradient-glow), var(--dim)",
      }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.3em",
          textTransform: "uppercase", color: "#555", marginBottom: 12,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ width: 24, height: 2, background: "var(--gradient-main)", display: "inline-block", borderRadius: 1 }} />
          PROTOCOL
        </div>
        <h2 style={{
          fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 4vw, 4rem)",
          letterSpacing: "0.04em", lineHeight: 0.92, textTransform: "uppercase", marginBottom: 48,
        }}>
          HOW IT <span className="text-gradient">WORKS</span>
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {STEPS.map(s => (
            <div key={s.num} style={{
              padding: "28px 24px", borderRadius: 14,
              background: s.bg, border: `1px solid ${s.border}`,
              position: "relative", overflow: "hidden",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${s.border}`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ color: s.color }}>{s.icon}</div>
                <span style={{
                  fontFamily: "var(--font-display)", fontSize: "2.5rem", lineHeight: 1,
                  color: s.color, opacity: 0.15,
                }}>{s.num}</span>
              </div>
              <div style={{
                fontFamily: "var(--font-display)", fontSize: "1.1rem",
                letterSpacing: "0.06em", lineHeight: 1.15, marginBottom: 10,
              }}>{s.title}</div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: "0.58rem",
                letterSpacing: "0.02em", lineHeight: 1.5, color: "rgba(255,255,255,0.45)",
              }}>{s.desc}</div>
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, ${s.color}, transparent)`, opacity: 0.4,
              }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────── */}
      <section style={{ padding: "80px 60px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.3em",
          textTransform: "uppercase", color: "#555", marginBottom: 12,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ width: 24, height: 2, background: "var(--gradient-main)", display: "inline-block", borderRadius: 1 }} />
          WHY LEARN MINT
        </div>
        <h2 style={{
          fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 4vw, 4rem)",
          letterSpacing: "0.04em", lineHeight: 0.92, textTransform: "uppercase", marginBottom: 48,
        }}>
          BUILT FOR <span className="text-gradient">WEB3</span>
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              padding: "32px 28px", borderRadius: 14,
              background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.06)",
              transition: "border-color 0.2s, transform 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,255,159,0.2)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = ""; }}
            >
              <div style={{ color: f.color, marginBottom: 16 }}>{f.icon}</div>
              <div style={{
                fontFamily: "var(--font-display)", fontSize: "1.1rem",
                letterSpacing: "0.06em", lineHeight: 1.2, marginBottom: 10,
              }}>{f.title}</div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: "0.6rem",
                letterSpacing: "0.02em", lineHeight: 1.6, color: "rgba(255,255,255,0.4)",
              }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section style={{
        padding: "80px 60px", borderTop: "1px solid rgba(255,255,255,0.06)",
        background: "var(--gradient-glow), var(--deep)",
        textAlign: "center", position: "relative",
      }}>
        <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 500, height: 500, background: "radial-gradient(circle, rgba(0,255,159,0.04) 0%, transparent 50%)", pointerEvents: "none" }} />
        <h2 style={{
          fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
          letterSpacing: "0.04em", lineHeight: 0.92, textTransform: "uppercase", marginBottom: 20,
          position: "relative",
        }}>
          START <span className="text-gradient">LEARNING</span> TODAY
        </h2>
        <p style={{
          fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.06em",
          color: "rgba(255,255,255,0.4)", marginBottom: 36, maxWidth: 500, margin: "0 auto 36px",
        }}>
          Connect your wallet and begin earning on-chain credentials in minutes.
        </p>
        <button onClick={handleConnect}
          style={{
            fontFamily: "var(--font-mono)", fontSize: "0.82rem", fontWeight: 700,
            letterSpacing: "0.12em", textTransform: "uppercase",
            background: "var(--gradient-main)", backgroundSize: "200% 200%",
            color: "var(--black)", border: "none", padding: "18px 44px",
            borderRadius: 10, cursor: "pointer",
            boxShadow: "0 4px 32px rgba(0,255,159,0.25)",
            display: "inline-flex", alignItems: "center", gap: 10,
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
        >
          {isConnected ? "OPEN DASHBOARD" : "GET STARTED"}
          <IconArrow />
        </button>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer style={{
        padding: "24px 60px", borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.15em", color: "#444" }}>
          © 2024 LEARN MINT — POWERED BY STELLAR
        </span>
        <div style={{ display: "flex", gap: 20 }}>
          {["DOCS", "GITHUB", "DISCORD"].map(l => (
            <a key={l} href="#" style={{
              fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.15em",
              color: "#555", textDecoration: "none", transition: "color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--neon)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#555"; }}
            >{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
