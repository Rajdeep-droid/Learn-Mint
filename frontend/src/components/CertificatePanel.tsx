"use client";

// ============================================================================
// CERTIFICATE PANEL — NFT certificate card
// ============================================================================

export default function CertificatePanel() {
  return (
    <div style={{
      background: "var(--gradient-card)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 14,
      padding: 24,
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}>
      {/* Watermark */}
      <div style={{
        position: "absolute", top: -20, right: -20,
        fontFamily: "var(--font-display)", fontSize: "7rem",
        background: "var(--gradient-main)", WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent", backgroundClip: "text",
        opacity: 0.03, lineHeight: 1, pointerEvents: "none",
      }}>NFT</div>

      {/* Header */}
      <div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.25em",
          textTransform: "uppercase", color: "#555", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ width: 16, height: 2, background: "var(--gradient-main)", display: "inline-block", borderRadius: 1 }} />
          COMPLETION CERTIFICATE
        </div>

        {/* Gradient line */}
        <div style={{
          width: "100%", height: 2, borderRadius: 1, marginBottom: 20,
          background: "var(--gradient-main)", opacity: 0.2,
        }} />

        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.2em",
          textTransform: "uppercase", color: "#555", marginBottom: 10,
        }}>
          #NFT-2024-SCF-001
        </div>

        <div style={{
          fontFamily: "var(--font-display)", fontSize: "1.5rem",
          letterSpacing: "0.06em", lineHeight: 1.15, marginBottom: 12,
        }}>
          SMART CONTRACTS<br />FUNDAMENTALS
        </div>

        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "0.5rem",
          color: "#444", wordBreak: "break-all",
        }}>
          0x3a4f...8d2c1e9b7f0a3c55d1a293fb8e6d0c4e2a1b9d7
        </div>
      </div>

      {/* Status */}
      <div style={{
        marginTop: 24,
        padding: "12px 16px",
        borderRadius: 8,
        background: "rgba(255,196,0,0.06)",
        border: "1px solid rgba(255,196,0,0.12)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
          background: "var(--amber)",
          boxShadow: "0 0 8px rgba(255,196,0,0.4)",
          animation: "pulse-dot 2s ease-in-out infinite",
        }} />
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: "0.6rem",
          letterSpacing: "0.12em", textTransform: "uppercase",
          color: "var(--amber)", fontWeight: 600,
        }}>
          PENDING MINT
        </span>
      </div>
    </div>
  );
}
