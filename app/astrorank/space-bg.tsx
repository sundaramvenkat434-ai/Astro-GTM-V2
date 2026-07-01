"use client";

export default function SpaceBg() {
  return (
    <div
      aria-hidden
      className="pointer-events-none select-none absolute inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <style>{`
        @keyframes twinkle {
          0%,100% { opacity: var(--base-op); transform: scale(1); }
          50%      { opacity: calc(var(--base-op) * 0.2); transform: scale(0.7); }
        }
        @keyframes float-slow {
          0%,100% { transform: translateY(0px) translateX(0px); }
          33%      { transform: translateY(-24px) translateX(10px); }
          66%      { transform: translateY(14px) translateX(-8px); }
        }
        @keyframes float-med {
          0%,100% { transform: translateY(0px) translateX(0px) scale(1); }
          40%      { transform: translateY(-16px) translateX(-12px) scale(1.04); }
          70%      { transform: translateY(10px) translateX(8px) scale(0.97); }
        }
        @keyframes comet {
          0%   { transform: translateX(-80px) translateY(-80px); opacity: 0; }
          5%   { opacity: 1; }
          80%  { opacity: 0.7; }
          100% { transform: translateX(700px) translateY(700px); opacity: 0; }
        }
        @keyframes comet2 {
          0%   { transform: translateX(-60px) translateY(-60px); opacity: 0; }
          6%   { opacity: 0.8; }
          100% { transform: translateX(550px) translateY(550px); opacity: 0; }
        }
        @keyframes comet3 {
          0%   { transform: translateX(-50px) translateY(-50px); opacity: 0; }
          7%   { opacity: 0.6; }
          100% { transform: translateX(420px) translateY(420px); opacity: 0; }
        }
        @keyframes pulse-glow {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.55; transform: scale(1.08); }
        }
        @keyframes orbit-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      {/* ── Stars ──────────────────────────────────────────────── */}
      {STARS.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            backgroundColor: s.blue ? "rgb(96,165,250)" : "rgb(100,116,139)",
            "--base-op": s.op,
            opacity: s.op,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
            boxShadow: s.blue ? `0 0 ${s.size * 2}px rgba(96,165,250,${s.op * 0.8})` : "none",
          } as React.CSSProperties}
        />
      ))}

      {/* ── Planet 1 — large, top-right ───────────────────────── */}
      <div
        className="absolute rounded-full"
        style={{
          right: "-3%",
          top: "3%",
          width: 420,
          height: 420,
          background: "radial-gradient(circle at 35% 35%, rgba(147,197,253,0.45) 0%, rgba(96,165,250,0.2) 40%, rgba(59,130,246,0.06) 65%, transparent 80%)",
          animation: "float-slow 18s ease-in-out infinite",
          filter: "blur(1px)",
        }}
      />
      {/* Orbit ring */}
      <div
        className="absolute"
        style={{
          right: "-9%",
          top: "-3%",
          width: 540,
          height: 540,
          borderRadius: "50%",
          border: "1px solid rgba(147,197,253,0.25)",
          animation: "float-slow 18s ease-in-out infinite, orbit-spin 40s linear infinite",
        }}
      />
      {/* Orbit dot */}
      <div
        className="absolute"
        style={{
          right: "-9%",
          top: "-3%",
          width: 540,
          height: 540,
          animation: "float-slow 18s ease-in-out infinite, orbit-spin 40s linear infinite",
        }}
      >
        <div style={{
          position: "absolute",
          top: "50%",
          left: "0%",
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "rgba(96,165,250,0.6)",
          transform: "translateY(-50%)",
          boxShadow: "0 0 8px rgba(96,165,250,0.6)",
        }} />
      </div>

      {/* ── Planet 2 — medium, left-middle ────────────────────── */}
      <div
        className="absolute rounded-full"
        style={{
          left: "-5%",
          top: "35%",
          width: 260,
          height: 260,
          background: "radial-gradient(circle at 40% 40%, rgba(125,211,252,0.38) 0%, rgba(56,189,248,0.14) 50%, transparent 72%)",
          animation: "float-med 14s ease-in-out 2s infinite",
          filter: "blur(0.5px)",
        }}
      />
      {/* Ring */}
      <div
        className="absolute rounded-full"
        style={{
          left: "-8%",
          top: "33%",
          width: 310,
          height: 310,
          border: "1px solid rgba(125,211,252,0.22)",
          animation: "float-med 14s ease-in-out 2s infinite",
        }}
      />

      {/* ── Planet 3 — small, bottom-right ────────────────────── */}
      <div
        className="absolute rounded-full"
        style={{
          right: "10%",
          bottom: "8%",
          width: 180,
          height: 180,
          background: "radial-gradient(circle at 38% 38%, rgba(165,180,252,0.35) 0%, rgba(129,140,248,0.12) 55%, transparent 75%)",
          animation: "float-slow 22s ease-in-out 5s infinite",
          filter: "blur(0.5px)",
        }}
      />

      {/* ── Planet 4 — tiny, upper-center-left ────────────────── */}
      <div
        className="absolute rounded-full"
        style={{
          left: "20%",
          top: "6%",
          width: 100,
          height: 100,
          background: "radial-gradient(circle at 38% 38%, rgba(186,230,253,0.4) 0%, rgba(125,211,252,0.14) 60%, transparent 78%)",
          animation: "float-med 11s ease-in-out 1s infinite",
        }}
      />

      {/* ── Nebula glow 1 ─────────────────────────────────────── */}
      <div
        className="absolute"
        style={{
          left: "25%",
          top: "15%",
          width: 700,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(191,219,254,0.22) 0%, rgba(147,197,253,0.08) 45%, transparent 70%)",
          animation: "pulse-glow 14s ease-in-out infinite",
          filter: "blur(2px)",
        }}
      />

      {/* ── Nebula glow 2 ─────────────────────────────────────── */}
      <div
        className="absolute"
        style={{
          right: "15%",
          bottom: "10%",
          width: 600,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(199,210,254,0.2) 0%, rgba(165,180,252,0.07) 50%, transparent 70%)",
          animation: "pulse-glow 18s ease-in-out 5s infinite",
          filter: "blur(2px)",
        }}
      />

      {/* ── Comet 1 ───────────────────────────────────────────── */}
      <div
        className="absolute"
        style={{
          left: "8%",
          top: "10%",
          width: 160,
          height: 2,
          background: "linear-gradient(90deg, rgba(96,165,250,0.9), rgba(147,197,253,0.5), transparent)",
          borderRadius: 4,
          transform: "rotate(45deg)",
          transformOrigin: "left center",
          animation: "comet 8s ease-in 1.5s infinite",
          boxShadow: "0 0 6px rgba(96,165,250,0.4)",
        }}
      />
      {/* Comet head dot */}
      <div
        className="absolute"
        style={{
          left: "8%",
          top: "10%",
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: "rgba(147,197,253,0.9)",
          transform: "rotate(45deg)",
          transformOrigin: "left center",
          animation: "comet 8s ease-in 1.5s infinite",
          boxShadow: "0 0 6px rgba(147,197,253,0.8)",
        }}
      />

      {/* ── Comet 2 ───────────────────────────────────────────── */}
      <div
        className="absolute"
        style={{
          right: "28%",
          top: "4%",
          width: 120,
          height: 1.5,
          background: "linear-gradient(90deg, rgba(125,211,252,0.85), rgba(186,230,253,0.4), transparent)",
          borderRadius: 4,
          transform: "rotate(45deg)",
          transformOrigin: "left center",
          animation: "comet2 12s ease-in 5s infinite",
        }}
      />

      {/* ── Comet 3 ───────────────────────────────────────────── */}
      <div
        className="absolute"
        style={{
          left: "52%",
          top: "28%",
          width: 90,
          height: 1.5,
          background: "linear-gradient(90deg, rgba(196,181,253,0.75), rgba(221,214,254,0.3), transparent)",
          borderRadius: 4,
          transform: "rotate(45deg)",
          transformOrigin: "left center",
          animation: "comet3 16s ease-in 9s infinite",
        }}
      />

      {/* ── Dot grid overlay ──────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(100,116,139,0.12) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}

const STARS: { x: number; y: number; size: number; op: number; dur: number; delay: number; blue?: boolean }[] = [
  { x:  4, y:  7, size: 3,   op: 0.45, dur: 4.2, delay: 0,   blue: true  },
  { x: 11, y: 23, size: 2,   op: 0.35, dur: 6.1, delay: 1.2             },
  { x: 18, y: 55, size: 3.5, op: 0.50, dur: 5.3, delay: 0.7, blue: true  },
  { x: 25, y: 14, size: 1.5, op: 0.30, dur: 7.0, delay: 2.1             },
  { x: 32, y: 80, size: 2.5, op: 0.40, dur: 4.8, delay: 0.4             },
  { x: 38, y: 42, size: 2,   op: 0.32, dur: 6.5, delay: 1.8             },
  { x: 45, y:  9, size: 3,   op: 0.48, dur: 5.0, delay: 3.0, blue: true  },
  { x: 52, y: 68, size: 1.5, op: 0.28, dur: 7.4, delay: 0.9             },
  { x: 59, y: 31, size: 3.5, op: 0.52, dur: 4.4, delay: 2.5, blue: true  },
  { x: 66, y: 88, size: 2,   op: 0.38, dur: 6.2, delay: 1.0             },
  { x: 73, y: 19, size: 2.5, op: 0.42, dur: 5.6, delay: 0.3             },
  { x: 80, y: 62, size: 1.5, op: 0.30, dur: 7.1, delay: 2.7             },
  { x: 87, y: 44, size: 3.5, op: 0.50, dur: 4.9, delay: 1.5, blue: true  },
  { x: 93, y: 76, size: 2,   op: 0.38, dur: 5.7, delay: 0.6             },
  { x:  8, y: 90, size: 2.5, op: 0.43, dur: 6.3, delay: 3.3             },
  { x: 15, y: 36, size: 1.5, op: 0.31, dur: 4.6, delay: 1.9             },
  { x: 22, y: 71, size: 2.5, op: 0.46, dur: 5.2, delay: 0.8             },
  { x: 29, y: 48, size: 2,   op: 0.35, dur: 6.8, delay: 2.3             },
  { x: 36, y: 25, size: 3.5, op: 0.55, dur: 4.1, delay: 1.1, blue: true  },
  { x: 43, y: 94, size: 1.5, op: 0.28, dur: 7.3, delay: 0.2             },
  { x: 50, y: 58, size: 2.5, op: 0.42, dur: 5.5, delay: 2.8             },
  { x: 57, y: 15, size: 2,   op: 0.34, dur: 6.0, delay: 1.6             },
  { x: 64, y: 82, size: 2.5, op: 0.47, dur: 4.7, delay: 0.5, blue: true  },
  { x: 71, y: 37, size: 1.5, op: 0.30, dur: 7.2, delay: 3.1             },
  { x: 78, y: 53, size: 3.5, op: 0.52, dur: 5.4, delay: 1.4, blue: true  },
  { x: 85, y:  6, size: 2,   op: 0.38, dur: 6.4, delay: 2.0             },
  { x: 91, y: 29, size: 2.5, op: 0.44, dur: 4.3, delay: 0.1             },
  { x:  2, y: 50, size: 1.5, op: 0.28, dur: 7.5, delay: 2.6             },
  { x: 96, y: 66, size: 2.5, op: 0.46, dur: 5.1, delay: 1.7             },
  { x: 48, y: 77, size: 2,   op: 0.36, dur: 6.6, delay: 0.8             },
  { x: 34, y:  3, size: 2.5, op: 0.41, dur: 4.5, delay: 2.9, blue: true  },
  { x: 69, y: 97, size: 1.5, op: 0.29, dur: 7.0, delay: 1.3             },
  { x: 83, y: 73, size: 3.5, op: 0.53, dur: 4.9, delay: 0.4, blue: true  },
  { x: 10, y: 60, size: 2,   op: 0.33, dur: 6.7, delay: 3.2             },
  { x: 55, y: 45, size: 2.5, op: 0.44, dur: 5.3, delay: 1.0             },
];
