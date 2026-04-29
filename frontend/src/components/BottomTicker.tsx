"use client";

// ============================================================================
// BOTTOM TICKER — Scrolling info tape
// ============================================================================
// Fixed at the bottom of the viewport, seamlessly looping ticker tape
// showing XLM price, student stats, and network info.
// ============================================================================

const TICKER_DATA = [
  { label: "XLM/USD", val: "$0.1247", change: "+2.3%", pos: true },
  { label: "STUDENTS", val: "14,892", change: "+120 TODAY", pos: true },
  { label: "CERTS MINTED", val: "3,401", change: "+8 TODAY", pos: true },
  { label: "NETWORK FEE", val: "0.00001 XLM", change: "STELLAR", pos: true },
  { label: "SOROBAN", val: "ACTIVE", change: "MAINNET", pos: true },
  { label: "COURSE_01", val: "FULL", change: "2,847 ENROLLED", pos: false },
  { label: "PASS RATE", val: "78.3%", change: "30 DAY AVG", pos: true },
  { label: "TOP EARNER", val: "0xA23F...4B8C", change: "12 CERTS", pos: true },
];

function TickerItems() {
  return (
    <>
      {TICKER_DATA.map((d, i) => (
        <span key={i}>
          <span className="tick-item">
            {d.label} <span style={{ color: "#222" }}>//</span>{" "}
            <span className="tick-val">{d.val}</span>{" "}
            <span className={d.pos ? "tick-pos" : "tick-neg"}>{d.change}</span>
          </span>
          <span className="tick-item" style={{ color: "#222" }}>——</span>
        </span>
      ))}
    </>
  );
}

export default function BottomTicker() {
  return (
    <div className="ticker">
      <div className="ticker-inner">
        {/* Duplicated for seamless loop */}
        <TickerItems />
        <TickerItems />
      </div>
    </div>
  );
}
