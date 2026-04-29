"use client";

import { useEffect, useState } from "react";

// ── Floating 3D Icon Component ─────────────────────────────────────
interface FloatingIconProps {
  children: React.ReactNode;
  dir: "left" | "right";
  y: string;
  size: number;
  color: string;
  glow: string;
  delay: number;
  duration: number;
  rotate?: number;
}

function FloatingIcon({ children, dir, y, size, color, glow, delay, duration, rotate = 0 }: FloatingIconProps) {
  const driftAnim = dir === "left" ? "heroDriftLeft" : "heroDriftRight";
  return (
    <div style={{
      position: "absolute", top: y,
      width: size, height: size,
      animation: `${driftAnim} ${duration}s ease-in-out -${delay}s infinite both`,
      pointerEvents: "none", zIndex: 2,
    }}>
      <div style={{
        width: "100%", height: "100%",
        background: `linear-gradient(135deg, ${color}18, ${color}08)`,
        border: `1px solid ${color}25`,
        borderRadius: size > 60 ? 18 : 14,
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 8px 32px ${glow}, inset 0 1px 0 ${color}15`,
        transform: `rotate(${rotate}deg) perspective(600px) rotateY(12deg)`,
        animation: `heroSpin ${duration * 2}s linear -${delay}s infinite both`,
      }}>
        <div style={{ color, fontSize: size * 0.45, lineHeight: 1, filter: `drop-shadow(0 0 8px ${glow})` }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── SVG Icons (inline, themed) ─────────────────────────────────────
const SvgStar = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.8 5.6 21.2 8 14 2 9.2h7.6z" />
  </svg>
);

const SvgHex = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2l8.66 5v10L12 22 3.34 17V7z" />
    <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3" />
  </svg>
);

const SvgCube = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const SvgToken = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v12M8 10l4-4 4 4M8 14l4 4 4-4" />
  </svg>
);

const SvgShield = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const SvgGrad = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" />
  </svg>
);

const SvgLink = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const SvgLightning = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const ICONS: (Omit<FloatingIconProps, "children"> & { icon: React.ReactNode })[] = [
  { icon: <SvgHex />,       dir: "left",  y: "10%", size: 95,  color: "#00E5FF", glow: "rgba(0,229,255,0.2)",  delay: 0,  duration: 26, rotate: 15 },
  { icon: <SvgCube />,      dir: "right", y: "25%", size: 55,  color: "#B388FF", glow: "rgba(179,136,255,0.1)", delay: 2,  duration: 30, rotate: -12 },
  { icon: <SvgToken />,     dir: "left",  y: "45%", size: 105, color: "#FFC400", glow: "rgba(255,196,0,0.2)",   delay: 4,  duration: 28, rotate: 22 },
  { icon: <SvgStar />,      dir: "right", y: "65%", size: 45,  color: "#00FF9F", glow: "rgba(0,255,159,0.1)",  delay: 6,  duration: 32, rotate: -15 },
  { icon: <SvgShield />,    dir: "left",  y: "85%", size: 85,  color: "#00FF9F", glow: "rgba(0,255,159,0.15)", delay: 8,  duration: 27, rotate: 18 },
  { icon: <SvgGrad />,      dir: "right", y: "15%", size: 60,  color: "#00E5FF", glow: "rgba(0,229,255,0.1)",  delay: 10, duration: 29, rotate: -10 },
  { icon: <SvgLink />,      dir: "left",  y: "35%", size: 45,  color: "#B388FF", glow: "rgba(179,136,255,0.1)", delay: 12, duration: 31, rotate: 15 },
  { icon: <SvgLightning />, dir: "right", y: "55%", size: 90,  color: "#FFC400", glow: "rgba(255,196,0,0.2)",   delay: 14, duration: 26, rotate: 28 },
  { icon: <SvgHex />,       dir: "left",  y: "75%", size: 50,  color: "#00E5FF", glow: "rgba(0,229,255,0.1)",  delay: 16, duration: 30, rotate: -20 },
  { icon: <SvgCube />,      dir: "right", y: "90%", size: 100, color: "#B388FF", glow: "rgba(179,136,255,0.2)", delay: 18, duration: 28, rotate: 10 },
  { icon: <SvgToken />,     dir: "left",  y: "20%", size: 65,  color: "#FFC400", glow: "rgba(255,196,0,0.15)",  delay: 20, duration: 32, rotate: -22 },
  { icon: <SvgStar />,      dir: "right", y: "40%", size: 110, color: "#00FF9F", glow: "rgba(0,255,159,0.2)",   delay: 22, duration: 27, rotate: 12 },
  { icon: <SvgShield />,    dir: "left",  y: "60%", size: 55,  color: "#00FF9F", glow: "rgba(0,255,159,0.1)",  delay: 24, duration: 29, rotate: -18 },
  { icon: <SvgGrad />,      dir: "right", y: "80%", size: 80,  color: "#00E5FF", glow: "rgba(0,229,255,0.15)", delay: 26, duration: 31, rotate: 8  },
];

export default function HeroIcons() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <>
      {ICONS.map((ic, i) => (
        <FloatingIcon key={i} dir={ic.dir} y={ic.y} size={ic.size} color={ic.color}
          glow={ic.glow} delay={ic.delay} duration={ic.duration} rotate={ic.rotate}>
          {ic.icon}
        </FloatingIcon>
      ))}
    </>
  );
}
