"use client";

import { useState, useEffect } from "react";

interface FeedEntry {
  id: string; addr: string; course: string; action: string; time: string;
}

const ADDRS = ["GAXF...C209","GBKL...1EFF","GC2D...9A3B","GDMN...A0C4","GEQR...2B5E","GFST...D9A7","GGVW...E312","GHXY...6C08","GIZZ...3D14"];
const COURSES = ["COURSE_01","COURSE_02","COURSE_03"];
const ACTIONS = ["passed","completed","graduated from","earned NFT for"];
const COLORS: Record<string, string> = { "passed": "var(--neon)", "completed": "var(--cyan)", "graduated from": "var(--purple)", "earned NFT for": "var(--amber)" };

function ts() {
  const n = new Date();
  return `${n.getHours().toString().padStart(2,"0")}:${n.getMinutes().toString().padStart(2,"0")}:${n.getSeconds().toString().padStart(2,"0")}`;
}
function rand(): FeedEntry {
  const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  return { id: Math.random().toString(36).slice(2), addr: ADDRS[Math.floor(Math.random() * ADDRS.length)], course: COURSES[Math.floor(Math.random() * COURSES.length)], action, time: ts() };
}

export default function RecentGraduates() {
  const [entries, setEntries] = useState<FeedEntry[]>([]);

  useEffect(() => {
    setEntries([
      { id: "i1", addr: "GAXF...C209", course: "COURSE_01", action: "passed", time: ts() },
      { id: "i2", addr: "GBKL...1EFF", course: "COURSE_02", action: "completed", time: ts() },
      { id: "i3", addr: "GC2D...9A3B", course: "COURSE_01", action: "graduated from", time: ts() },
    ]);
    let t: NodeJS.Timeout;
    function spawn() {
      setEntries(p => [rand(), ...p].slice(0, 10));
      t = setTimeout(spawn, 3000 + Math.random() * 6000);
    }
    t = setTimeout(spawn, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      background: "var(--gradient-card)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 14,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      maxHeight: 420,
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
            background: "var(--red)", boxShadow: "0 0 10px rgba(255,71,87,0.5)",
            animation: "pulse-dot 1.5s ease-in-out infinite",
          }} />
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.2em",
            textTransform: "uppercase", color: "#777",
          }}>
            LIVE — RECENT GRADUATES
          </span>
        </div>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: "0.55rem",
          padding: "3px 10px", borderRadius: 20,
          background: "rgba(0,255,159,0.08)", color: "var(--neon)",
          border: "1px solid rgba(0,255,159,0.15)",
        }}>
          {entries.length} ACTIVE
        </span>
      </div>

      {/* Feed */}
      <div style={{ flex: 1, overflow: "auto", padding: "4px 0" }}>
        {entries.map((e) => (
          <div key={e.id} className="animate-feedIn" style={{
            padding: "10px 20px", fontFamily: "var(--font-mono)", fontSize: "0.62rem",
            letterSpacing: "0.03em", lineHeight: 1.6,
            color: "rgba(255,255,255,0.5)",
            borderBottom: "1px solid rgba(255,255,255,0.02)",
            transition: "background 0.15s",
          }}
          onMouseEnter={ev => { ev.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
          onMouseLeave={ev => { ev.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ color: "var(--cyan)", fontWeight: 600 }}>{e.addr}</span>{" "}
            <span style={{ color: "#555" }}>{e.action}</span>{" "}
            <span style={{ color: COLORS[e.action] || "var(--neon)", fontWeight: 600 }}>{e.course}</span>
            <span style={{ display: "block", fontSize: "0.5rem", color: "#444", marginTop: 2 }}>
              {e.time} UTC
            </span>
          </div>
        ))}
      </div>

      {/* Cursor */}
      <div style={{
        padding: "8px 20px", borderTop: "1px solid rgba(255,255,255,0.04)",
        fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "#333",
      }}>
        <span style={{ animation: "blink 0.8s step-end infinite", color: "var(--neon)" }}>_</span>
        <span style={{ color: "#444", marginLeft: 6 }}>watching for events...</span>
      </div>
    </div>
  );
}
