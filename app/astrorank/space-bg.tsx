"use client";

/* Purely decorative full-page space background.
   Uses CSS animations only — zero JS per-frame work.
   All elements are pointer-events-none and aria-hidden. */

export default function SpaceBg() {
  return (
    <div
      aria-hidden
      className="pointer-events-none select-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <style>{`
        @keyframes twinkle {
          0%,100% { opacity: var(--base-op); }
          50%      { opacity: calc(var(--base-op) * 0.3); }
        }
        @keyframes float-slow {
          0%,100% { transform: translateY(0px) translateX(0px); }
          33%      { transform: translateY(-18px) translateX(8px); }
          66%      { transform: translateY(10px) translateX(-6px); }
        }
        @keyframes float-med {
          0%,100% { transform: translateY(0px) translateX(0px) scale(1); }
          40%      { transform: translateY(-12px) translateX(-10px) scale(1.03); }
          70%      { transform: translateY(8px) translateX(6px) scale(0.98); }
        }
        @keyframes comet {
          0%   { transform: translateX(0) translateY(0); opacity: 0; }
          5%   { opacity: 1; }
          100% { transform: translateX(600px) translateY(600px); opacity: 0; }
        }
        @keyframes comet2 {
          0%   { transform: translateX(0) translateY(0); opacity: 0; }
          4%   { opacity: 0.7; }
          100% { transform: translateX(480px) translateY(480px); opacity: 0; }
        }
        @keyframes comet3 {
          0%   { transform: translateX(0) translateY(0); opacity: 0; }
          6%   { opacity: 0.5; }
          100% { transform: translateX(360px) translateY(360px); opacity: 0; }
        }
        @keyframes orbit-ring {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%,100% { opacity: 0.06; transform: scale(1); }
          50%      { opacity: 0.12; transform: scale(1.06); }
        }
      `}</style>

      {/* ── Starfield ─────────────────────────────────────────── */}
      {STARS.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-slate-400"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            "--base-op": s.op,
            opacity: s.op,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          } as React.CSSProperties}
        />
      ))}

      {/* ── Planet 1 — large soft orb, top-right ──────────────── */}
      <div
        className="absolute rounded-full"
        style={{
          right: "-6%",
          top: "4%",
          width: 340,
          height: 340,
          background: "radial-gradient(circle at 38% 38%, rgba(191,219,254,0.28) 0%, rgba(147,197,253,0.12) 45%, transparent 72%)",
          animation: "float-slow 18s ease-in-out infinite",
          animationDelay: "0s",
        }}
      />
      {/* Ring around planet 1 */}
      <div
        className="absolute rounded-full"
        style={{
          right: "-8%",
          top: "2%",
          width: 380,
          height: 380,
          border: "1px solid rgba(147,197,253,0.12)",
          animation: "float-slow 18s ease-in-out infinite",
        }}
      />

      {/* ── Planet 2 — medium orb, mid-left ───────────────────── */}
      <div
        className="absolute rounded-full"
        style={{
          left: "-4%",
          top: "38%",
          width: 200,
          height: 200,
          background: "radial-gradient(circle at 42% 42%, rgba(186,230,253,0.22) 0%, rgba(125,211,252,0.08) 50%, transparent 70%)",
          animation: "float-med 14s ease-in-out 2s infinite",
        }}
      />

      {/* ── Planet 3 — small orb, bottom-right ────────────────── */}
      <div
        className="absolute rounded-full"
        style={{
          right: "8%",
          bottom: "12%",
          width: 140,
          height: 140,
          background: "radial-gradient(circle at 40% 40%, rgba(199,210,254,0.2) 0%, rgba(165,180,252,0.07) 55%, transparent 72%)",
          animation: "float-slow 20s ease-in-out 5s infinite",
        }}
      />

      {/* ── Planet 4 — tiny accent, upper-left ────────────────── */}
      <div
        className="absolute rounded-full"
        style={{
          left: "18%",
          top: "8%",
          width: 80,
          height: 80,
          background: "radial-gradient(circle at 38% 38%, rgba(186,230,253,0.18) 0%, rgba(125,211,252,0.06) 60%, transparent 72%)",
          animation: "float-med 11s ease-in-out 1s infinite",
        }}
      />

      {/* ── Nebula blob 1 — centre spread ─────────────────────── */}
      <div
        className="absolute rounded-full"
        style={{
          left: "30%",
          top: "20%",
          width: 600,
          height: 400,
          background: "radial-gradient(ellipse at center, rgba(219,234,254,0.13) 0%, transparent 65%)",
          animation: "pulse-glow 12s ease-in-out infinite",
        }}
      />

      {/* ── Nebula blob 2 — lower area ────────────────────────── */}
      <div
        className="absolute rounded-full"
        style={{
          right: "20%",
          bottom: "15%",
          width: 500,
          height: 300,
          background: "radial-gradient(ellipse at center, rgba(224,242,254,0.11) 0%, transparent 65%)",
          animation: "pulse-glow 16s ease-in-out 4s infinite",
        }}
      />

      {/* ── Comet 1 ───────────────────────────────────────────── */}
      <div
        className="absolute"
        style={{
          left: "5%",
          top: "12%",
          width: 120,
          height: 1.5,
          background: "linear-gradient(90deg, transparent, rgba(147,197,253,0.55), rgba(147,197,253,0.2), transparent)",
          borderRadius: 2,
          transform: "rotate(45deg)",
          transformOrigin: "left center",
          animation: "comet 9s ease-in 2s infinite",
        }}
      />

      {/* ── Comet 2 ───────────────────────────────────────────── */}
      <div
        className="absolute"
        style={{
          right: "25%",
          top: "5%",
          width: 90,
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(165,243,252,0.5), rgba(165,243,252,0.15), transparent)",
          borderRadius: 2,
          transform: "rotate(45deg)",
          transformOrigin: "left center",
          animation: "comet2 13s ease-in 6s infinite",
        }}
      />

      {/* ── Comet 3 ───────────────────────────────────────────── */}
      <div
        className="absolute"
        style={{
          left: "55%",
          top: "30%",
          width: 70,
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(196,181,253,0.4), rgba(196,181,253,0.1), transparent)",
          borderRadius: 2,
          transform: "rotate(45deg)",
          transformOrigin: "left center",
          animation: "comet3 17s ease-in 10s infinite",
        }}
      />

      {/* ── Grid overlay — very faint ──────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(100,116,139,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(100,116,139,0.025) 1px,transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
    </div>
  );
}

/* Pre-computed star positions for SSR determinism */
const STARS: { x: number; y: number; size: number; op: number; dur: number; delay: number }[] = [
  { x:  4, y:  7, size: 2,   op: 0.18, dur: 4.2, delay: 0   },
  { x: 11, y: 23, size: 1.5, op: 0.14, dur: 6.1, delay: 1.2 },
  { x: 18, y: 55, size: 2.5, op: 0.20, dur: 5.3, delay: 0.7 },
  { x: 25, y: 14, size: 1,   op: 0.12, dur: 7.0, delay: 2.1 },
  { x: 32, y: 80, size: 2,   op: 0.16, dur: 4.8, delay: 0.4 },
  { x: 38, y: 42, size: 1.5, op: 0.13, dur: 6.5, delay: 1.8 },
  { x: 45, y:  9, size: 2,   op: 0.17, dur: 5.0, delay: 3.0 },
  { x: 52, y: 68, size: 1,   op: 0.11, dur: 7.4, delay: 0.9 },
  { x: 59, y: 31, size: 2.5, op: 0.19, dur: 4.4, delay: 2.5 },
  { x: 66, y: 88, size: 1.5, op: 0.14, dur: 6.2, delay: 1.0 },
  { x: 73, y: 19, size: 2,   op: 0.16, dur: 5.6, delay: 0.3 },
  { x: 80, y: 62, size: 1,   op: 0.12, dur: 7.1, delay: 2.7 },
  { x: 87, y: 44, size: 2.5, op: 0.20, dur: 4.9, delay: 1.5 },
  { x: 93, y: 76, size: 1.5, op: 0.15, dur: 5.7, delay: 0.6 },
  { x:  8, y: 90, size: 2,   op: 0.17, dur: 6.3, delay: 3.3 },
  { x: 15, y: 36, size: 1,   op: 0.13, dur: 4.6, delay: 1.9 },
  { x: 22, y: 71, size: 2,   op: 0.18, dur: 5.2, delay: 0.8 },
  { x: 29, y: 48, size: 1.5, op: 0.14, dur: 6.8, delay: 2.3 },
  { x: 36, y: 25, size: 2.5, op: 0.21, dur: 4.1, delay: 1.1 },
  { x: 43, y: 94, size: 1,   op: 0.11, dur: 7.3, delay: 0.2 },
  { x: 50, y: 58, size: 2,   op: 0.16, dur: 5.5, delay: 2.8 },
  { x: 57, y: 15, size: 1.5, op: 0.13, dur: 6.0, delay: 1.6 },
  { x: 64, y: 82, size: 2,   op: 0.19, dur: 4.7, delay: 0.5 },
  { x: 71, y: 37, size: 1,   op: 0.12, dur: 7.2, delay: 3.1 },
  { x: 78, y: 53, size: 2.5, op: 0.20, dur: 5.4, delay: 1.4 },
  { x: 85, y:  6, size: 1.5, op: 0.15, dur: 6.4, delay: 2.0 },
  { x: 91, y: 29, size: 2,   op: 0.17, dur: 4.3, delay: 0.1 },
  { x:  2, y: 50, size: 1,   op: 0.11, dur: 7.5, delay: 2.6 },
  { x: 96, y: 66, size: 2,   op: 0.18, dur: 5.1, delay: 1.7 },
  { x: 48, y: 77, size: 1.5, op: 0.14, dur: 6.6, delay: 0.8 },
  { x: 34, y:  3, size: 2,   op: 0.16, dur: 4.5, delay: 2.9 },
  { x: 69, y: 97, size: 1,   op: 0.12, dur: 7.0, delay: 1.3 },
  { x: 83, y: 73, size: 2.5, op: 0.21, dur: 4.9, delay: 0.4 },
  { x: 10, y: 60, size: 1.5, op: 0.13, dur: 6.7, delay: 3.2 },
  { x: 55, y: 45, size: 2,   op: 0.17, dur: 5.3, delay: 1.0 },
];
