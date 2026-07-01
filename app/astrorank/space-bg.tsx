"use client";

import { useEffect, useRef } from "react";

export default function SpaceBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let t = 0;

    // Subtle dots — dark on light, low opacity
    const DOTS = Array.from({ length: 220 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.5 + Math.random() * 1.4,
      twinkleSpeed: 0.008 + Math.random() * 0.04,
      twinkleOffset: Math.random() * Math.PI * 2,
      baseOpacity: 0.06 + Math.random() * 0.18,
      // Mostly slate/blue-grey, occasional blue tint
      hue: Math.random() < 0.3 ? "59,130,246" : "100,116,139",
    }));

    // Slow-moving radial gradient orbs (very subtle on light bg)
    const ORBS = [
      { x: 0.78, y: 0.18, r: 0.38, color: "96,165,250",  vx:  0.00008, vy:  0.00005 },
      { x: 0.12, y: 0.65, r: 0.30, color: "148,163,184", vx: -0.00007, vy: -0.00004 },
      { x: 0.55, y: 0.85, r: 0.26, color: "125,211,252", vx:  0.00005, vy:  0.00008 },
    ];

    // Floating dust particles drifting upward
    const DUST = Array.from({ length: 35 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00015,
      vy: -0.00014 - Math.random() * 0.00020,
      r: 1.0 + Math.random() * 1.8,
      opacity: 0.04 + Math.random() * 0.08,
    }));

    // Orbit rings
    const RINGS = [
      { cx: 0.88, cy: 0.12, rx: 0.08, ry: 0.03, angle: 0,   speed:  0.002, opacity: 0.08 },
      { cx: 0.08, cy: 0.25, rx: 0.06, ry: 0.022, angle: 1.0, speed: -0.0015, opacity: 0.06 },
    ];

    // Shooting stars
    type Shooter = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; active: boolean };
    const SHOOTERS: Shooter[] = Array.from({ length: 4 }, () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, active: false }));
    function spawnShooter(s: Shooter) {
      s.x = 0.05 + Math.random() * 0.55;
      s.y = 0.02 + Math.random() * 0.35;
      const angle = Math.PI / 6 + (Math.random() - 0.5) * 0.35;
      const speed = 0.003 + Math.random() * 0.003;
      s.vx = Math.cos(angle) * speed;
      s.vy = Math.sin(angle) * speed;
      s.maxLife = 60 + Math.random() * 50;
      s.life = 0;
      s.active = true;
    }
    spawnShooter(SHOOTERS[0]);
    const t1 = setTimeout(() => spawnShooter(SHOOTERS[1]), 2200);

    function draw() {
      if (!ctx || !canvas) return;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      t++;

      // Orbs
      for (const o of ORBS) {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -0.15) o.x = 1.15; if (o.x > 1.15) o.x = -0.15;
        if (o.y < -0.15) o.y = 1.15; if (o.y > 1.15) o.y = -0.15;
        const g = ctx.createRadialGradient(o.x * W, o.y * H, 0, o.x * W, o.y * H, o.r * W);
        g.addColorStop(0, `rgba(${o.color},0.10)`);
        g.addColorStop(0.5, `rgba(${o.color},0.04)`);
        g.addColorStop(1, `rgba(${o.color},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      // Dots / stars
      for (const d of DOTS) {
        const flicker = Math.sin(t * d.twinkleSpeed + d.twinkleOffset) * 0.4 + 0.6;
        ctx.globalAlpha = d.baseOpacity * flicker;
        ctx.beginPath();
        ctx.arc(d.x * W, d.y * H, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${d.hue})`;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Dust
      for (const d of DUST) {
        d.x += d.vx; d.y += d.vy;
        if (d.y < -0.02) { d.y = 1.02; d.x = Math.random(); }
        if (d.x < 0) d.x = 1; if (d.x > 1) d.x = 0;
        ctx.globalAlpha = d.opacity;
        const dg = ctx.createRadialGradient(d.x * W, d.y * H, 0, d.x * W, d.y * H, d.r);
        dg.addColorStop(0, "rgba(59,130,246,0.8)");
        dg.addColorStop(1, "rgba(59,130,246,0)");
        ctx.fillStyle = dg;
        ctx.beginPath();
        ctx.arc(d.x * W, d.y * H, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Orbit rings
      for (const ring of RINGS) {
        ring.angle += ring.speed;
        ctx.save();
        ctx.translate(ring.cx * W, ring.cy * H);
        ctx.rotate(ring.angle);
        ctx.scale(1, ring.ry / ring.rx);
        ctx.beginPath();
        ctx.arc(0, 0, ring.rx * W, 0, Math.PI * 2);
        ctx.restore();
        ctx.strokeStyle = `rgba(96,165,250,${ring.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Shooting stars
      if (t % 100 === 0) {
        const idle = SHOOTERS.find(s => !s.active);
        if (idle) spawnShooter(idle);
      }
      for (const s of SHOOTERS) {
        if (!s.active) continue;
        s.x += s.vx; s.y += s.vy; s.life++;
        if (s.life > s.maxLife || s.x > 1.2 || s.y > 1.2) { s.active = false; continue; }
        const prog = s.life / s.maxLife;
        const alpha = prog < 0.15 ? prog / 0.15 : prog > 0.75 ? (1 - prog) / 0.25 : 1;
        const tailLen = 80 + prog * 50;
        const len = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
        const nx = s.vx / len, ny = s.vy / len;
        const grd = ctx.createLinearGradient(
          s.x * W - nx * tailLen, s.y * H - ny * tailLen,
          s.x * W, s.y * H
        );
        grd.addColorStop(0, "rgba(96,165,250,0)");
        grd.addColorStop(0.7, `rgba(59,130,246,${alpha * 0.35})`);
        grd.addColorStop(1, `rgba(148,210,252,${alpha * 0.7})`);
        ctx.strokeStyle = grd;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s.x * W - nx * tailLen, s.y * H - ny * tailLen);
        ctx.lineTo(s.x * W, s.y * H);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96,165,250,${alpha * 0.8})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
      clearTimeout(t1);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none select-none absolute inset-0 w-full h-full"
      style={{ zIndex: 0, opacity: 0.65 }}
    />
  );
}
