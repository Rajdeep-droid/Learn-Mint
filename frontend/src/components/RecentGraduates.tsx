"use client";

// ============================================================================
// RECENT GRADUATES — Live Event Feed
// ============================================================================
// Real-time feed showing users who recently passed courses.
// Uses Soroban RPC getEvents() to poll for course_passed events.
// ============================================================================

import { useState, useEffect, useCallback, useRef } from "react";
import { truncateAddress } from "@/lib/stellar";

interface GraduateEntry {
  id: string;
  address: string;
  courseId: number;
  timestamp: Date;
}

// Demo entries for when contracts aren't deployed yet
const DEMO_ENTRIES: GraduateEntry[] = [
  {
    id: "demo-1",
    address: "GAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    courseId: 0,
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: "demo-2",
    address: "GBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    courseId: 1,
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: "demo-3",
    address: "GCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    courseId: 0,
    timestamp: new Date(Date.now() - 600000),
  },
];

export default function RecentGraduates() {
  const [entries, setEntries] = useState<GraduateEntry[]>(DEMO_ENTRIES);
  const [isLive, setIsLive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new entries arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [entries.length]);

  // Poll for new events
  const pollEvents = useCallback(async () => {
    // When contracts are deployed, this would call Soroban RPC:
    // const server = getServer();
    // const events = await server.getEvents({
    //   startLedger: lastLedger,
    //   filters: [{
    //     type: "contract",
    //     contractIds: [COURSE_QUIZ_CONTRACT_ID],
    //     topics: [["AAAADwAAAAZjb3Vyc2U=", "AAAADwAAAAZwYXNzZWQ="]]
    //   }]
    // });
    // For now, we simulate with demo entries
  }, []);

  useEffect(() => {
    pollEvents();
    const interval = setInterval(pollEvents, 5000);
    return () => clearInterval(interval);
  }, [pollEvents]);

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="p-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(0, 229, 255, 0.1)" }}>
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: isLive ? "var(--accent-green)" : "var(--accent-amber)",
              animation: isLive ? "pulse-glow 2s ease-in-out infinite" : "none",
            }}
          />
          <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            Recent Graduates
          </h3>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            background: "rgba(0, 229, 255, 0.1)",
            color: "var(--accent-cyan)",
          }}
        >
          {entries.length} total
        </span>
      </div>

      {/* ── Entries ───────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="max-h-80 overflow-y-auto p-2"
      >
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
              No graduates yet. Be the first! 🎓
            </p>
          </div>
        ) : (
          entries.map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/[0.03] animate-slide-in"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  background: `hsl(${(entry.address.charCodeAt(1) * 47) % 360}, 70%, 50%)`,
                  color: "#fff",
                }}
              >
                {entry.address.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-mono truncate"
                    style={{ color: "var(--foreground)" }}
                  >
                    {truncateAddress(entry.address)}
                  </span>
                  <span className="text-xs" style={{ color: "var(--accent-green)" }}>
                    ✓
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                    Course #{entry.courseId}
                  </span>
                  <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                    •
                  </span>
                  <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                    {formatTimeAgo(entry.timestamp)}
                  </span>
                </div>
              </div>

              {/* Reward badge */}
              <span
                className="text-xs font-semibold px-2 py-1 rounded-full shrink-0"
                style={{
                  background: "rgba(179, 136, 255, 0.1)",
                  color: "var(--accent-purple)",
                }}
              >
                +10 LEARN
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
