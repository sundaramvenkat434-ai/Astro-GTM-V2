'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CircleCheck as CheckCircle } from 'lucide-react';
import { CTAButton } from './cta-button';
import { AIWorkflowDemo } from './ai-workflow-demo';

const bulletPoints = ['Get 10 FREE Pages', 'No Card Needed', '1-on-1 Setup Call'];

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf: number;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    let t = 0;

    const STARS = Array.from({ length: 180 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.3 + Math.random() * 1.2,
      twinkleSpeed: 0.015 + Math.random() * 0.04,
      twinkleOffset: Math.random() * Math.PI * 2,
      baseOpacity: 0.12 + Math.random() * 0.3,
      hue: Math.random() < 0.5 ? '52,211,153' : Math.random() < 0.5 ? '16,185,129' : '110,231,183',
    }));

    const ORBS = [
      { x: 0.7, y: 0.2, r: 0.3, color: '16,185,129', vx: 0.00007, vy: 0.00004 },
      { x: 0.2, y: 0.6, r: 0.24, color: '52,211,153', vx: -0.00005, vy: -0.00003 },
      { x: 0.5, y: 0.85, r: 0.2, color: '5,150,105', vx: 0.00004, vy: 0.00006 },
    ];

    const DUST = Array.from({ length: 30 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00018,
      vy: -0.00012 - Math.random() * 0.0002,
      r: 1 + Math.random() * 1.8,
      opacity: 0.04 + Math.random() * 0.08,
    }));

    type Shooter = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; active: boolean };
    const SHOOTERS: Shooter[] = Array.from({ length: 3 }, () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, active: false }));
    function spawnShooter(s: Shooter) {
      s.x = 0.05 + Math.random() * 0.5; s.y = 0.02 + Math.random() * 0.3;
      const angle = Math.PI / 6 + (Math.random() - 0.5) * 0.4;
      const speed = 0.004 + Math.random() * 0.003;
      s.vx = Math.cos(angle) * speed; s.vy = Math.sin(angle) * speed;
      s.maxLife = 40 + Math.random() * 40; s.life = 0; s.active = true;
    }
    spawnShooter(SHOOTERS[0]);

    function draw() {
      if (!ctx || !canvas) return;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      t++;

      for (const o of ORBS) {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -0.1) o.x = 1.1; if (o.x > 1.1) o.x = -0.1;
        if (o.y < -0.1) o.y = 1.1; if (o.y > 1.1) o.y = -0.1;
        const g = ctx.createRadialGradient(o.x * W, o.y * H, 0, o.x * W, o.y * H, o.r * W);
        g.addColorStop(0, `rgba(${o.color},0.08)`);
        g.addColorStop(0.5, `rgba(${o.color},0.03)`);
        g.addColorStop(1, `rgba(${o.color},0)`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }

      for (const s of STARS) {
        const flicker = Math.sin(t * s.twinkleSpeed + s.twinkleOffset) * 0.45 + 0.55;
        ctx.globalAlpha = s.baseOpacity * flicker;
        ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${s.hue})`; ctx.fill();
      }
      ctx.globalAlpha = 1;

      for (const d of DUST) {
        d.x += d.vx; d.y += d.vy;
        if (d.y < -0.02) { d.y = 1.02; d.x = Math.random(); }
        if (d.x < 0) d.x = 1; if (d.x > 1) d.x = 0;
        ctx.globalAlpha = d.opacity;
        const dg = ctx.createRadialGradient(d.x * W, d.y * H, 0, d.x * W, d.y * H, d.r);
        dg.addColorStop(0, 'rgba(52,211,153,0.8)'); dg.addColorStop(1, 'rgba(16,185,129,0)');
        ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(d.x * W, d.y * H, d.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (t % 120 === 0) {
        const idle = SHOOTERS.find(s => !s.active);
        if (idle) spawnShooter(idle);
      }
      for (const s of SHOOTERS) {
        if (!s.active) continue;
        s.x += s.vx; s.y += s.vy; s.life++;
        if (s.life > s.maxLife || s.x > 1.2 || s.y > 1.2) { s.active = false; continue; }
        const prog = s.life / s.maxLife;
        const alpha = prog < 0.15 ? prog / 0.15 : prog > 0.75 ? (1 - prog) / 0.25 : 1;
        const tailLen = 70 + prog * 40;
        const nx = s.vx / Math.sqrt(s.vx * s.vx + s.vy * s.vy);
        const ny = s.vy / Math.sqrt(s.vx * s.vx + s.vy * s.vy);
        const grd = ctx.createLinearGradient(s.x * W - nx * tailLen, s.y * H - ny * tailLen, s.x * W, s.y * H);
        grd.addColorStop(0, 'rgba(16,185,129,0)');
        grd.addColorStop(0.7, `rgba(52,211,153,${alpha * 0.4})`);
        grd.addColorStop(1, `rgba(255,255,255,${alpha * 0.8})`);
        ctx.strokeStyle = grd; ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(s.x * W - nx * tailLen, s.y * H - ny * tailLen);
        ctx.lineTo(s.x * W, s.y * H); ctx.stroke();
        ctx.beginPath(); ctx.arc(s.x * W, s.y * H, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.8})`; ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center">
      {/* Darker green gradient bg */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #052e1c 0%, #064e30 25%, #0a5c38 50%, #063d25 75%, #042a18 100%)' }} />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" aria-hidden="true" />

      {/* Glow accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(52,211,153,0.08) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(4,42,24,0.9) 0%, transparent 100%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24 w-full">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-center">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 16 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-emerald-400/20 bg-emerald-950/40 backdrop-blur-sm">
              {/* Animated AI icon */}
              <span className="relative flex items-center justify-center w-5 h-5">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border border-emerald-400/40 border-t-emerald-400"
                />
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-sm font-semibold text-emerald-300">AI SEO Auto-Pilot</span>
            </span>

            {/* Heading */}
            <div className="space-y-2">
              <h1 className="text-[1.75rem] sm:text-[2.6rem] lg:text-[3.2rem] font-extrabold leading-[1.1] tracking-[-0.03em] text-white">
                <span className="block whitespace-nowrap">Your Next 6 Months of SEO,</span>
                <span className="block bg-clip-text text-transparent mt-1" style={{ backgroundImage: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 40%, #10b981 80%)' }}>
                  Done This Week!
                </span>
              </h1>
              <p className="text-[15px] sm:text-base text-emerald-100/60 leading-relaxed max-w-md pt-2">
                AstroRank connects to your site, learns your brand, discovers untapped keywords, and publishes hundreds of optimized SEO pages automatically.
              </p>
            </div>

            {/* CTA */}
            <div className="pt-1">
              <CTAButton />
            </div>

            {/* Bullet points */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {bulletPoints.map((point) => (
                <span key={point} className="flex items-center gap-1.5 text-sm text-emerald-200/80">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  {point}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 16 }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <AIWorkflowDemo />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
