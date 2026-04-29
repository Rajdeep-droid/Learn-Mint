"use client";

// ============================================================================
// DASHBOARD — Course content, stats, graduates, certificate
// ============================================================================

import { useState } from "react";
import dynamic from "next/dynamic";
import CourseView from "@/components/CourseView";
import CourseInfoPanel from "@/components/CourseInfoPanel";
import CertificatePanel from "@/components/CertificatePanel";
import CourseCatalog from "@/components/CourseCatalog";

const RecentGraduates = dynamic(() => import("@/components/RecentGraduates"), {
  ssr: false,
});

export default function Dashboard() {
  const [activeCourseId, setActiveCourseId] = useState(0);

  return (
    <div style={{ paddingBottom: 48, display: "flex", flexDirection: "column" }}>
      {/* Course Catalog (Grid of courses) */}
      <CourseCatalog activeCourseId={activeCourseId} onSelect={setActiveCourseId} />

      {/* Course content (header + video + quiz) */}
      <CourseView courseId={activeCourseId} />

      {/* Stats boxes row */}
      <CourseInfoPanel />

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
  );
}
