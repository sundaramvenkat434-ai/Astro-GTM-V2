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

    const STARS = Array.from({ length: 200 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.3 + Math.random() * 1.4,
      twinkleSpeed: 0.012 + Math.random() * 0.035,
      twinkleOffset: Math.random() * Math.PI * 2,
      baseOpacity: 0.1 + Math.random() * 0.35,
      hue: Math.random() < 0.4 ? '134,239,172' : Math.random() < 0.5 ? '52,211,153' : '16,185,129',
    }));

    const ORBS = [
      { x: 0.75, y: 0.15, r: 0.35, color: '5,150,105', vx: 0.00006, vy: 0.00004 },
      { x: 0.15, y: 0.5, r: 0.28, color: '16,185,129', vx: -0.00005, vy: -0.00003 },
      { x: 0.55, y: 0.8, r: 0.22, color: '52,211,153', vx: 0.00004, vy: 0.00005 },
      { x: 0.9, y: 0.6, r: 0.18, color: '4,120,87', vx: -0.00007, vy: 0.00003 },
    ];

    const DUST = Array.from({ length: 35 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00015,
      vy: -0.0001 - Math.random() * 0.0002,
      r: 1 + Math.random() * 2,
      opacity: 0.04 + Math.random() * 0.08,
    }));

    type Shooter = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; active: boolean };
    const SHOOTERS: Shooter[] = Array.from({ length: 3 }, () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, active: false }));
    function spawnShooter(s: Shooter) {
      s.x = 0.05 + Math.random() * 0.45; s.y = 0.02 + Math.random() * 0.25;
      const angle = Math.PI / 5 + (Math.random() - 0.5) * 0.5;
      const speed = 0.004 + Math.random() * 0.003;
      s.vx = Math.cos(angle) * speed; s.vy = Math.sin(angle) * speed;
      s.maxLife = 40 + Math.random() * 35; s.life = 0; s.active = true;
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
        g.addColorStop(0, `rgba(${o.color},0.12)`);
        g.addColorStop(0.5, `rgba(${o.color},0.04)`);
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
        dg.addColorStop(0, 'rgba(134,239,172,0.8)'); dg.addColorStop(1, 'rgba(52,211,153,0)');
        ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(d.x * W, d.y * H, d.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (t % 110 === 0) {
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
        grd.addColorStop(0.6, `rgba(52,211,153,${alpha * 0.4})`);
        grd.addColorStop(1, `rgba(255,255,255,${alpha * 0.85})`);
        ctx.strokeStyle = grd; ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(s.x * W - nx * tailLen, s.y * H - ny * tailLen);
        ctx.lineTo(s.x * W, s.y * H); ctx.stroke();
        ctx.beginPath(); ctx.arc(s.x * W, s.y * H, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.85})`; ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center">
      {/* Rich dark green gradient */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(155deg, #011f12 0%, #03311d 20%, #064e30 45%, #053d26 65%, #022b18 85%, #011a0e 100%)' }} />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-75" aria-hidden="true" />

      {/* Ambient glow elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(ellipse 55% 45% at 50% 0%, rgba(16,185,129,0.1) 0%, transparent 70%)' }} />
      <div className="absolute top-1/4 left-0 w-[350px] h-[350px] pointer-events-none" style={{ background: 'radial-gradient(circle at 0% 50%, rgba(52,211,153,0.06) 0%, transparent 60%)' }} />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(circle at 100% 60%, rgba(5,150,105,0.08) 0%, transparent 60%)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none" style={{ background: 'linear-gradient(to top, #011a0e 0%, transparent 100%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24 w-full">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-center">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 16 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-emerald-400/25 bg-emerald-900/30 backdrop-blur-sm">
              <span className="relative flex items-center justify-center w-5 h-5">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border border-emerald-400/50 border-t-emerald-300"
                />
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-sm font-semibold text-emerald-200">AstroRank AI SEO</span>
            </span>

            {/* Heading */}
            <div className="space-y-5">
              <h1 className="text-[1.75rem] sm:text-[2.6rem] lg:text-[3.2rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-white">
                <span className="block">6 Months Of SEO</span>
                <span className="block mt-1 bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(100deg, #86efac 0%, #6ee7b7 25%, #34d399 50%, #6ee7b7 75%, #86efac 100%)' }}>
                  Delivered This Week
                </span>
              </h1>
              <p className="text-[15px] sm:text-base text-emerald-100/75 leading-relaxed max-w-md">
                AstroRank connects to your site, learns your brand, researches untapped keywords, and publishes hundreds of optimized SEO pages automatically.
              </p>
            </div>

            {/* CTA */}
            <div>
              <CTAButton />
            </div>

            {/* Bullet points - stacked */}
            <div className="flex flex-col gap-2.5">
              {bulletPoints.map((point) => (
                <span key={point} className="flex items-center gap-2 text-sm text-emerald-100/80">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
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
