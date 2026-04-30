"use client";

import { COURSES } from "@/data/courses";

interface CourseCatalogProps {
  activeCourseId: number;
  onSelect: (id: number) => void;
}

export default function CourseCatalog({ activeCourseId, onSelect }: CourseCatalogProps) {
  return (
    <div style={{ padding: "0 24px 24px" }}>
      {/* Catalog Header */}
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.25em",
        textTransform: "uppercase", color: "#555", marginBottom: 20,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ width: 16, height: 2, background: "var(--gradient-main)", display: "inline-block", borderRadius: 1 }} />
        EXPLORE COURSES
      </div>

      <style>{`
        .course-scroll-vert::-webkit-scrollbar { width: 4px; }
        .course-scroll-vert::-webkit-scrollbar-track { background: transparent; }
        .course-scroll-vert::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>

      {/* Vertical List */}
      <div className="course-scroll-vert" style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        overflowY: "auto",
        maxHeight: "calc(100vh - 120px)",
        paddingRight: 8,
      }}>
        {COURSES.map((course) => {
          const isActive = course.id === activeCourseId;
          const thumbUrl = `https://img.youtube.com/vi/${course.videoId}/hqdefault.jpg`;

          return (
            <div
              key={course.id}
              onClick={() => onSelect(course.id)}
              style={{
                width: "100%",
                background: isActive ? "rgba(255,255,255,0.06)" : "var(--dim)",
                border: isActive ? "1px solid var(--cyan)" : "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                boxShadow: isActive ? "0 4px 24px rgba(0,229,255,0.15)" : "none",
                display: "flex",
                flexDirection: "column",
                transform: isActive ? "scale(1.02)" : "scale(1)",
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.border = "1px solid rgba(255,255,255,0.15)";
                  e.currentTarget.style.transform = "scale(1.02) translateY(-2px)";
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.border = "1px solid rgba(255,255,255,0.06)";
                  e.currentTarget.style.transform = "scale(1)";
                }
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
                  background: isActive ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.4)",
                  transition: "background 0.2s",
                }} />
                
                {/* Level Tag */}
                <div style={{
                  position: "absolute", top: 12, right: 12,
                  fontFamily: "var(--font-mono)", fontSize: "0.55rem",
                  letterSpacing: "0.1em", padding: "4px 8px", borderRadius: 4,
                  background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
                  color: course.level === "BEGINNER" ? "var(--neon)" : course.level === "ADVANCED" ? "var(--purple)" : "var(--cyan)",
                  border: "1px solid rgba(255,255,255,0.1)"
                }}>
                  {course.level}
                </div>
              </div>

              {/* Course Info */}
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                <h3 style={{
                  fontFamily: "var(--font-display)", fontSize: "1.1rem", lineHeight: 1.1,
                  margin: 0, color: isActive ? "var(--white)" : "rgba(255,255,255,0.8)",
                }}>
                  {course.title} <br />
                  <span style={{ color: "var(--cyan)" }}>{course.subtitle}</span>
                </h3>

                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginTop: "auto", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)",
                  fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.1em", color: "#666"
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
