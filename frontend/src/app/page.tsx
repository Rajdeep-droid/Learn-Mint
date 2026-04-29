"use client";

// ============================================================================
// HOME PAGE — Learn Mint Main View
// ============================================================================
// The primary landing/course page showing the video + quiz experience
// alongside the Recent Graduates live feed.
// ============================================================================

import CourseView from "@/components/CourseView";
import RecentGraduates from "@/components/RecentGraduates";
import { useWallet } from "@/context/WalletProvider";

export default function Home() {
  const { isConnected } = useWallet();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Hero Section ──────────────────────────────────────────── */}
      {!isConnected && (
        <section className="text-center mb-12 animate-fade-in-up">
          <div className="mb-6">
            <span
              className="inline-block text-xs font-semibold tracking-wider uppercase px-4 py-1.5 rounded-full mb-4"
              style={{
                background: "rgba(0, 229, 255, 0.08)",
                color: "var(--accent-cyan)",
                border: "1px solid rgba(0, 229, 255, 0.15)",
              }}
            >
              Powered by Stellar & Soroban
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              <span className="text-gradient">Learn.</span>{" "}
              <span style={{ color: "var(--foreground)" }}>Earn.</span>{" "}
              <span className="text-gradient">Grow.</span>
            </h1>
            <p
              className="text-lg max-w-xl mx-auto"
              style={{ color: "var(--foreground-muted)" }}
            >
              Watch educational content, pass quizzes, and earn{" "}
              <strong style={{ color: "var(--accent-cyan)" }}>LEARN tokens</strong>{" "}
              directly to your Stellar wallet.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              { icon: "🎬", label: "Watch Videos" },
              { icon: "📝", label: "Take Quizzes" },
              { icon: "💰", label: "Earn Tokens" },
              { icon: "🔗", label: "On-Chain Rewards" },
            ].map((feature) => (
              <div
                key={feature.label}
                className="glass-subtle rounded-full px-4 py-2 flex items-center gap-2 text-sm"
                style={{ color: "var(--foreground-muted)" }}
              >
                <span>{feature.icon}</span>
                <span>{feature.label}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8">
            {[
              { value: "10", label: "LEARN per quiz" },
              { value: "1", label: "XLM to unlock" },
              { value: "∞", label: "Courses coming" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-gradient">{stat.value}</div>
                <div className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Main Content ──────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Course Area */}
        <div className="flex-1">
          <CourseView courseId={0} />
        </div>

        {/* Sidebar: Recent Graduates */}
        <aside className="lg:w-80 shrink-0">
          <div className="sticky top-24">
            <RecentGraduates />

            {/* How It Works */}
            <div className="glass rounded-2xl p-5 mt-6">
              <h3
                className="text-sm font-semibold mb-4"
                style={{ color: "var(--foreground)" }}
              >
                How It Works
              </h3>
              <div className="flex flex-col gap-4">
                {[
                  {
                    step: "1",
                    title: "Connect Wallet",
                    desc: "Link your Freighter wallet on Stellar Testnet",
                  },
                  {
                    step: "2",
                    title: "Unlock Course",
                    desc: "Pay 1 XLM to access the educational content",
                  },
                  {
                    step: "3",
                    title: "Watch & Learn",
                    desc: "Watch the educational video at your own pace",
                  },
                  {
                    step: "4",
                    title: "Pass the Quiz",
                    desc: "Answer all questions correctly to earn 10 LEARN tokens",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-3">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        background: "rgba(179, 136, 255, 0.15)",
                        color: "var(--accent-purple)",
                      }}
                    >
                      {item.step}
                    </div>
                    <div>
                      <div
                        className="text-sm font-medium"
                        style={{ color: "var(--foreground)" }}
                      >
                        {item.title}
                      </div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: "var(--foreground-muted)" }}
                      >
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
