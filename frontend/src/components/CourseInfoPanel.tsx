"use client";

// ============================================================================
// COURSE INFO PANEL — Horizontal stat boxes with SVG icons
// ============================================================================

import { useWallet } from "@/context/WalletProvider";

// ── SVG Icon Components ─────────────────────────────────────────────────
const IconGlobe = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
  </svg>
);

const IconDiamond = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z" />
  </svg>
);

const IconGrad = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" />
  </svg>
);

const IconTrophy = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 22V18a2 2 0 0 1-2-2V4h8v12a2 2 0 0 1-2 2v4" />
  </svg>
);

const IconChart = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 20V10" />
    <path d="M12 20V4" />
    <path d="M6 20v-6" />
  </svg>
);

const IconWallet = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
  </svg>
);

const ACCENT_COLORS = [
  { bg: "rgba(0,255,159,0.06)", border: "rgba(0,255,159,0.15)", text: "var(--neon)", stroke: "#00FF9F" },
  { bg: "rgba(0,229,255,0.06)", border: "rgba(0,229,255,0.15)", text: "var(--cyan)", stroke: "#00E5FF" },
  { bg: "rgba(179,136,255,0.06)", border: "rgba(179,136,255,0.15)", text: "var(--purple)", stroke: "#B388FF" },
  { bg: "rgba(255,196,0,0.06)", border: "rgba(255,196,0,0.15)", text: "var(--amber)", stroke: "#FFC400" },
  { bg: "rgba(59,130,246,0.06)", border: "rgba(59,130,246,0.15)", text: "var(--blue)", stroke: "#3B82F6" },
  { bg: "rgba(255,71,87,0.06)", border: "rgba(255,71,87,0.15)", text: "var(--red)", stroke: "#FF4757" },
];

const ICONS = [IconGlobe, IconDiamond, IconGrad, IconTrophy, IconChart, IconWallet];

export default function CourseInfoPanel() {
  const { xlmBalance, isConnected } = useWallet();

  const stats = [
    { label: "NETWORK", value: "STELLAR" },
    { label: "PRICE", value: "1.0 XLM" },
    { label: "GRADUATES", value: "1,204" },
    { label: "REWARD", value: "10 LEARN" },
    { label: "PASS RATE", value: "78.3%" },
    { label: "BALANCE", value: isConnected ? `${parseFloat(xlmBalance).toFixed(1)} XLM` : "— XLM" },
  ];

  return (
    <div style={{ padding: "28px 44px 8px" }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.25em",
        textTransform: "uppercase", color: "#555", marginBottom: 16,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ width: 16, height: 2, background: "var(--gradient-main)", display: "inline-block", borderRadius: 1 }} />
        COURSE STATS
      </div>

      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
        {stats.map((s, i) => {
          const c = ACCENT_COLORS[i];
          const Icon = ICONS[i];
          return (
            <div key={s.label} style={{
              background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12,
              padding: "16px 14px", display: "flex", flexDirection: "column", gap: 8,
              transition: "transform 0.2s, box-shadow 0.2s", cursor: "default",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 8px 24px ${c.border}`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = "none";
            }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Icon color={c.stroke} />
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.5rem",
                  letterSpacing: "0.15em", textTransform: "uppercase", color: "#666",
                }}>
                  {s.label}
                </span>
              </div>
              <div style={{
                fontFamily: "var(--font-display)", fontSize: "1.3rem",
                letterSpacing: "0.04em", lineHeight: 1, color: c.text,
              }}>
                {s.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
