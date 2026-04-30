"use client";

// ============================================================================
// DASHBOARD — Course content, stats, graduates, certificate
// ============================================================================

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import CourseView from "@/components/CourseView";
import CourseInfoPanel from "@/components/CourseInfoPanel";
import CertificatePanel from "@/components/CertificatePanel";
import { COURSES } from "@/data/courses";

import { useWallet } from "@/context/WalletProvider";

const RecentGraduates = dynamic(() => import("@/components/RecentGraduates"), {
  ssr: false,
});

function DashboardContent() {
  const { isConnected } = useWallet();
  const searchParams = useSearchParams();
  const initialCourseId = parseInt(searchParams.get("courseId") || "0");
  const [activeCourseId, setActiveCourseId] = useState(isNaN(initialCourseId) ? 0 : initialCourseId);

  useEffect(() => {
    const cid = parseInt(searchParams.get("courseId") || "0");
    if (!isNaN(cid)) setActiveCourseId(cid);
  }, [searchParams]);

  return (
    <div style={{ position: "relative", minHeight: "calc(100vh - 60px)" }}>
      {/* Access Denied Overlay */}
      {!isConnected && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 50,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "rgba(5,5,16,0.4)",
        }}>
          <div style={{
            background: "var(--gradient-card)", border: "1px solid var(--red)",
            padding: "40px 60px", borderRadius: 16, textAlign: "center",
            boxShadow: "0 20px 60px rgba(255,71,87,0.15)",
            backdropFilter: "blur(20px)",
          }}>
            <div className="animate-float" style={{ fontSize: "3rem", marginBottom: 16 }}>🔒</div>
            <h2 style={{
              fontFamily: "var(--font-display)", fontSize: "2.5rem",
              letterSpacing: "0.06em", color: "var(--red)", lineHeight: 1.1,
              marginBottom: 12,
            }}>ACCESS DENIED</h2>
            <p style={{
              fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "rgba(255,255,255,0.7)",
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              Please connect your wallet to access the dashboard.
            </p>
          </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      <div style={{
        paddingBottom: 48, display: "flex", flexDirection: "column",
        filter: !isConnected ? "blur(12px) grayscale(50%)" : "none",
        opacity: !isConnected ? 0.6 : 1,
        pointerEvents: !isConnected ? "none" : "auto",
        transition: "all 0.4s ease",
      }}>
        {/* Top Section: Main Content */}
        <div style={{ display: "flex", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          
          {/* Content: Player & Stats (Now Full Width) */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
            {/* Course content (header + video + quiz) */}
            <CourseView courseId={activeCourseId} />

            {/* Next Course Button */}
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 44px 0" }}>
              <button 
                onClick={() => setActiveCourseId((prev) => (prev + 1) % COURSES.length)}
                style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: 700,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  background: "rgba(0,255,159,0.1)", color: "var(--neon)",
                  border: "1px solid rgba(0,255,159,0.3)", padding: "12px 24px",
                  borderRadius: 8, cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex", alignItems: "center", gap: 8,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,255,159,0.2)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,255,159,0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                NEXT COURSE →
              </button>
            </div>

            {/* Stats boxes row */}
            <CourseInfoPanel />
          </div>
        </div>

        {/* Bottom section label */}
        <div style={{ padding: "20px 44px 8px" }}>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.25em",
            textTransform: "uppercase", color: "#555", marginBottom: 16,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ width: 16, height: 2, background: "var(--gradient-main)", display: "inline-block", borderRadius: 1 }} />
            NETWORK ACTIVITY
          </div>
        </div>

        {/* Graduates + Certificate */}
        <div className="bottom-grid" style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: 20,
          padding: "0 44px 44px",
        }}>
          <RecentGraduates />
          <CertificatePanel />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div style={{ padding: 48, textAlign: "center", color: "var(--neon)", fontFamily: "var(--font-mono)" }}>LOADING...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
