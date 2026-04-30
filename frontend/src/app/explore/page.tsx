"use client";

import { COURSES } from "@/data/courses";
import { useRouter } from "next/navigation";

export default function ExplorePage() {
  const router = useRouter();

  return (
    <div className="mobile-p" style={{ padding: "60px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.25em",
          textTransform: "uppercase", color: "#555", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ width: 16, height: 2, background: "var(--gradient-main)", display: "inline-block", borderRadius: 1 }} />
          EXPLORE CATALOG
        </div>
        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 4vw, 4rem)",
          letterSpacing: "0.06em", lineHeight: 1, textTransform: "uppercase",
        }}>
          AVAILABLE <span className="text-gradient">COURSES</span>
        </h1>
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 32,
      }}>
        {COURSES.map((course) => {
          const thumbUrl = `https://img.youtube.com/vi/${course.videoId}/hqdefault.jpg`;

          return (
            <div
              key={course.id}
              onClick={() => router.push(`/dashboard?courseId=${course.id}`)}
              style={{
                width: "100%",
                background: "var(--dim)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                display: "flex",
                flexDirection: "column",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.15)";
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.5), 0 0 40px rgba(0,255,159,0.05)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.06)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Thumbnail Container */}
              <div style={{
                width: "100%",
                aspectRatio: "16/9",
                background: `url(${thumbUrl}) center/cover no-repeat`,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                position: "relative",
              }}>
                {/* Play Overlay */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "rgba(0,0,0,0.4)",
                  transition: "background 0.2s",
                }} />
                
                {/* Level Tag */}
                <div style={{
                  position: "absolute", top: 16, right: 16,
                  fontFamily: "var(--font-mono)", fontSize: "0.6rem",
                  letterSpacing: "0.1em", padding: "6px 10px", borderRadius: 4,
                  background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
                  color: course.level === "BEGINNER" ? "var(--neon)" : course.level === "ADVANCED" ? "var(--purple)" : "var(--cyan)",
                  border: "1px solid rgba(255,255,255,0.1)"
                }}>
                  {course.level}
                </div>
              </div>

              {/* Course Info */}
              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                <h3 style={{
                  fontFamily: "var(--font-display)", fontSize: "1.4rem", lineHeight: 1.1,
                  margin: 0, color: "var(--white)",
                }}>
                  {course.title} <br />
                  <span style={{ color: "var(--cyan)" }}>{course.subtitle}</span>
                </h3>

                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginTop: "auto", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.04)",
                  fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", color: "#666"
                }}>
                  <span>⏱ {course.duration}</span>
                  <span style={{ color: "var(--neon)" }}>{course.reward}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
