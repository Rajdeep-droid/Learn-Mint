"use client";

import { useState, useEffect, useRef } from "react";

// Characters to shuffle through
const CHARS = "0123456789,.%+KABCDEFGHIJKLMNOPQRSTUVWXYZ";

function scramble(target: string): string {
  return target
    .split("")
    .map(() => CHARS[Math.floor(Math.random() * CHARS.length)])
    .join("");
}

interface AnimatedStatProps {
  value: string;
  label: string;
  color: string;
  delay?: number;
}

export default function AnimatedStat({ value, label, color, delay = 0 }: AnimatedStatProps) {
  const [display, setDisplay] = useState(value.replace(/[^ ]/g, "—"));
  const [settled, setSettled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  const TOTAL_MS = 1800;
  const CHAR_STAGGER = 120;

  // Mount — start scramble
  useEffect(() => {
    setMounted(true);
    setDisplay(scramble(value));
  }, [value]);

  useEffect(() => {
    if (!mounted) return;
    const timeout = setTimeout(() => {
      startRef.current = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startRef.current;
        const chars = value.split("");

        const next = chars.map((ch, i) => {
          const charSettleTime = TOTAL_MS + i * CHAR_STAGGER;
          if (elapsed >= charSettleTime) return ch;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join("");

        setDisplay(next);

        const allSettled = chars.every((_, i) => elapsed >= TOTAL_MS + i * CHAR_STAGGER);
        if (allSettled) {
          setDisplay(value);
          setSettled(true);
        } else {
          frameRef.current = requestAnimationFrame(animate);
        }
      };

      frameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frameRef.current);
    };
  }, [value, delay, mounted]);

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontFamily: "var(--font-display)",
        fontSize: "2.4rem",
        lineHeight: 1,
        color: color,
        letterSpacing: "0.04em",
        transition: settled ? "text-shadow 0.4s" : "none",
        textShadow: settled ? `0 0 20px ${color}40` : "none",
        minWidth: `${value.length * 0.9}em`,
        display: "inline-block",
      }}>
        {display.split("").map((ch, i) => {
          const isSettled = ch === value[i];
          return (
            <span key={i} style={{
              display: "inline-block",
              opacity: isSettled ? 1 : 0.4,
              transition: isSettled ? "opacity 0.2s" : "none",
            }}>
              {ch}
            </span>
          );
        })}
      </div>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.52rem",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "#555",
        marginTop: 6,
        opacity: settled ? 1 : 0.3,
        transition: "opacity 0.4s",
      }}>
        {label}
      </div>
    </div>
  );
}
