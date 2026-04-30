"use client";

import { useState, useCallback, useEffect } from "react";
import VideoPlayer from "./VideoPlayer";
import QuizModule from "./QuizModule";
import { useWallet } from "@/context/WalletProvider";
import { useToast } from "@/components/Toast";
import { COURSES } from "@/data/courses";
import { generateCertificatePDF } from "@/lib/pdfGenerator";

type CourseStage = "locked" | "watching" | "quiz" | "completed";

export default function CourseView({ courseId = 0 }: { courseId?: number }) {
  const course = COURSES.find(c => c.id === courseId) || COURSES[0];
  const { isConnected, address, signTransaction, refreshBalance } = useWallet();
  const { showToast } = useToast();
  const [stage, setStage] = useState<CourseStage>("locked");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [mintName, setMintName] = useState("");
  const [isMinting, setIsMinting] = useState(false);

  const handleUnlock = useCallback(async () => {
    if (!isConnected || !address) { showToast("CONNECT WALLET FIRST"); return; }
    setIsUnlocking(true);
    try {
      // Import Stellar SDK modules
      const { TransactionBuilder, Operation, Asset, Networks } = await import("@stellar/stellar-sdk");
      const { HORIZON_URL } = await import("@/lib/stellar");

      // A burn address to send the 1 XLM unlock fee to
      const PLATFORM_ADDRESS = "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7";

      // 1. Load the user's account from Horizon
      const accountRes = await fetch(`${HORIZON_URL}/accounts/${address}`);
      if (!accountRes.ok) throw new Error("Account not found on testnet. Fund it first.");
      const accountData = await accountRes.json();

      // 2. Build a 1 XLM payment transaction
      const tx = new TransactionBuilder(
        { accountId: () => address, sequenceNumber: () => accountData.sequence, incrementSequenceNumber: () => {} } as any,
        {
          fee: "100",
          networkPassphrase: Networks.TESTNET,
        }
      )
        .addOperation(
          Operation.payment({
            destination: PLATFORM_ADDRESS,
            asset: Asset.native(),
            amount: "1",
          })
        )
        .setTimeout(60)
        .build();

      // 3. Send to Freighter for signing (this triggers the wallet popup!)
      showToast("APPROVE IN WALLET...");
      const signedXdr = await signTransaction(tx.toXDR());

      // 4. Submit the signed transaction to Horizon
      showToast("SUBMITTING TX...");
      const submitRes = await fetch(`${HORIZON_URL}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `tx=${encodeURIComponent(signedXdr)}`,
      });

      const submitData = await submitRes.json();
      if (!submitRes.ok) {
        throw new Error(submitData?.extras?.result_codes?.transaction || "Transaction rejected");
      }

      // 5. Success!
      setStage("watching");
      showToast("COURSE UNLOCKED — TX CONFIRMED ✓");
      refreshBalance();
    } catch (err: any) {
      const msg = err?.message || "UNLOCK FAILED";
      if (msg.includes("User declined") || msg.includes("rejected") || msg.includes("cancel")) {
        showToast("TRANSACTION CANCELLED");
      } else {
        showToast(msg.length > 40 ? "UNLOCK FAILED — CHECK CONSOLE" : msg.toUpperCase());
        console.error("Unlock error:", err);
      }
    } finally {
      setIsUnlocking(false);
    }
  }, [isConnected, address, signTransaction, showToast, refreshBalance]);

  // Reset stage when course changes
  useEffect(() => {
    setStage("locked");
  }, [courseId]);

  const handleQuizSubmit = useCallback(async (answers: number[]): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      let correctCount = 0;
      answers.forEach((a, i) => {
        if (a === course.questions[i].correctIndex) correctCount++;
      });
      const passed = correctCount >= Math.ceil(course.questions.length * 0.6);
      if (passed) setStage("completed");
      return passed;
    } finally { setIsSubmitting(false); }
  }, [course]);

  const handleQuizRetake = useCallback(() => {
    setStage("watching");
  }, []);

  const handleMintCertificate = useCallback(async () => {
    if (!mintName.trim()) {
      showToast("PLEASE ENTER YOUR NAME");
      return;
    }
    if (!isConnected || !address) { showToast("CONNECT WALLET FIRST"); return; }
    
    setIsMinting(true);
    try {
      const { TransactionBuilder, Operation, Asset, Networks } = await import("@stellar/stellar-sdk");
      const { HORIZON_URL } = await import("@/lib/stellar");

      const PLATFORM_ADDRESS = "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7";

      // 1. Get account seq
      const accountRes = await fetch(`${HORIZON_URL}/accounts/${address}`);
      if (!accountRes.ok) throw new Error("Account not found. Fund it first.");
      const accountData = await accountRes.json();

      // 2. Build 200 XLM payment tx
      const tx = new TransactionBuilder(
        { accountId: () => address, sequenceNumber: () => accountData.sequence, incrementSequenceNumber: () => {} } as any,
        { fee: "100", networkPassphrase: Networks.TESTNET }
      )
        .addOperation(
          Operation.payment({
            destination: PLATFORM_ADDRESS,
            asset: Asset.native(),
            amount: "200",
          })
        )
        .setTimeout(60)
        .build();

      showToast("APPROVE 200 XLM MINT FEE...");
      const signedXdr = await signTransaction(tx.toXDR());

      showToast("SUBMITTING MINT TX...");
      const submitRes = await fetch(`${HORIZON_URL}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `tx=${encodeURIComponent(signedXdr)}`,
      });

      const submitData = await submitRes.json();
      if (!submitRes.ok) throw new Error(submitData?.extras?.result_codes?.transaction || "Transaction rejected");

      // Success
      showToast("CERTIFICATE MINTED! DOWNLOADING PDF...");
      generateCertificatePDF(mintName, `${course.title} ${course.subtitle}`);
      refreshBalance();
      setIsMintModalOpen(false);
      setMintName("");
    } catch (err: any) {
      const msg = err?.message || "MINTING FAILED";
      if (msg.includes("User declined") || msg.includes("rejected") || msg.includes("cancel")) {
        showToast("TRANSACTION CANCELLED");
      } else {
        showToast(msg.length > 40 ? "MINTING FAILED — CHECK CONSOLE" : msg.toUpperCase());
        console.error("Mint error:", err);
      }
    } finally {
      setIsMinting(false);
    }
  }, [mintName, isConnected, address, signTransaction, showToast, refreshBalance, course]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Course Header */}
      <div
        className="course-header"
        style={{
          padding: "48px 44px 32px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "var(--gradient-glow), var(--dim)",
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Decorative gradient orbs */}
        <div style={{ position: "absolute", top: -80, right: -60, width: 300, height: 300, background: "radial-gradient(circle, rgba(0,255,159,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -40, left: -60, width: 300, height: 300, background: "radial-gradient(circle, rgba(0,229,255,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 500, height: 500, background: "radial-gradient(circle, rgba(179,136,255,0.03) 0%, transparent 50%)", pointerEvents: "none" }} />

        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.3em",
          textTransform: "uppercase", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ width: 28, height: 2, background: "var(--gradient-main)", display: "inline-block", borderRadius: 1 }} />
          <span className="text-gradient">COURSE_{String(course.id + 1).padStart(2, "0")}</span>
          <span style={{ color: "#555" }}>— STELLAR ECOSYSTEM</span>
          <span style={{ width: 28, height: 2, background: "var(--gradient-main)", display: "inline-block", borderRadius: 1 }} />
        </div>

        <h1 className="mobile-text-xl" style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 4vw, 4rem)",
          letterSpacing: "0.06em",
          lineHeight: 1,
          textTransform: "uppercase",
          marginBottom: 20,
        }}>
          {course.title} <span className="text-gradient">{course.subtitle}</span>
        </h1>

        <div style={{
          display: "flex", gap: 14, fontFamily: "var(--font-mono)", fontSize: "0.68rem",
          letterSpacing: "0.08em", textTransform: "uppercase", color: "#555",
          flexWrap: "wrap", justifyContent: "center",
        }}>
          {[
            { label: "DURATION", val: course.duration, color: "rgba(255,255,255,0.8)" },
            { label: "LEVEL", val: course.level, color: course.level === "BEGINNER" ? "var(--neon)" : course.level === "ADVANCED" ? "var(--purple)" : "var(--cyan)" },
            { label: "REWARD", val: course.reward, color: "var(--neon)" },
            { label: "ENROLLED", val: course.enrolled, color: "var(--purple)" },
          ].map(m => (
            <div key={m.label} style={{
              padding: "6px 14px", borderRadius: 6,
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
            }}>
              {m.label} <span style={{ color: m.color, fontWeight: 600 }}>{m.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Video */}
      <VideoPlayer courseId={course.id} videoUrl={`https://www.youtube.com/watch?v=${course.videoId}`}
        isLocked={stage === "locked"} onUnlock={handleUnlock} isUnlocking={isUnlocking} />

      {/* Start quiz button */}
      {stage === "watching" && (
        <div style={{ padding: "24px 44px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "var(--dim)" }}>
          <button
            onClick={() => setStage("quiz")}
            style={{
              fontFamily: "var(--font-mono)", fontSize: "0.78rem", fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
              background: "var(--gradient-main)", backgroundSize: "200% 200%",
              color: "var(--black)", border: "none", padding: "16px 36px",
              borderRadius: 8, cursor: "pointer", width: "100%",
              boxShadow: "0 4px 24px rgba(0,255,159,0.2)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,255,159,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,255,159,0.2)"; }}
          >
            → START KNOWLEDGE CHECK
          </button>
        </div>
      )}

      {/* Quiz */}
      {(stage === "quiz" || stage === "completed") && (
        <QuizModule courseId={course.id} questions={course.questions}
          onSubmit={handleQuizSubmit} isSubmitting={isSubmitting} onRetake={handleQuizRetake} onMintClick={() => setIsMintModalOpen(true)} />
      )}

      {/* Mint Certificate Modal */}
      {isMintModalOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "rgba(5,5,16,0.8)", backdropFilter: "blur(8px)",
        }}>
          <div className="animate-slideIn mobile-p" style={{
            background: "var(--gradient-card)", border: "1px solid rgba(0,255,159,0.3)",
            padding: "48px 64px", borderRadius: 16, width: "90%", maxWidth: 500,
            boxShadow: "0 20px 60px rgba(0,255,159,0.15)",
          }}>
            <h2 style={{
              fontFamily: "var(--font-display)", fontSize: "2rem",
              letterSpacing: "0.06em", color: "var(--neon)", lineHeight: 1.1,
              marginBottom: 12, textAlign: "center",
            }}>MINT CERTIFICATE</h2>
            <p style={{
              fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "rgba(255,255,255,0.7)",
              letterSpacing: "0.05em", textAlign: "center", marginBottom: 32, lineHeight: 1.5,
            }}>
              Enter your name below to generate your PDF certificate. Minting to the Stellar network requires a fee of <span style={{ color: "var(--neon)", fontWeight: 700 }}>200 XLM</span>.
            </p>

            <input 
              type="text" 
              placeholder="YOUR FULL NAME" 
              value={mintName}
              onChange={(e) => setMintName(e.target.value)}
              disabled={isMinting}
              style={{
                width: "100%", padding: "16px 20px",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, color: "white", fontFamily: "var(--font-mono)",
                fontSize: "0.9rem", outline: "none", marginBottom: 24,
                textTransform: "uppercase",
              }}
            />

            <div className="mobile-col" style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setIsMintModalOpen(false)}
                disabled={isMinting}
                style={{
                  flex: 1, fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: 600,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  background: "transparent", color: "#888", border: "1px solid rgba(255,255,255,0.1)",
                  padding: "14px 0", borderRadius: 8, cursor: "pointer",
                }}
              >
                CANCEL
              </button>
              <button
                onClick={handleMintCertificate}
                disabled={isMinting || !mintName.trim()}
                style={{
                  flex: 2, fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: 700,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  background: "var(--gradient-main)", color: "var(--black)", border: "none",
                  padding: "14px 0", borderRadius: 8, cursor: "pointer",
                  opacity: isMinting || !mintName.trim() ? 0.5 : 1,
                  boxShadow: "0 4px 16px rgba(0,255,159,0.2)",
                }}
              >
                {isMinting ? "MINTING..." : "MINT & DOWNLOAD (200 XLM)"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
