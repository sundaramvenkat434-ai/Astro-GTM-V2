'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Search, Cpu, Zap } from 'lucide-react';
import { CTAButton } from './cta-button';
import { AIWorkflowDemo } from './ai-workflow-demo';

const trustPoints = [
  { icon: Search, label: 'AI Keyword Research' },
  { icon: Cpu, label: 'Automated Publishing' },
  { icon: Zap, label: 'Brand Consistent Content' },
];

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
      twinkleSpeed: 0.012 + Math.random() * 0.04,
      twinkleOffset: Math.random() * Math.PI * 2,
      baseOpacity: 0.15 + Math.random() * 0.4,
      hue: Math.random() < 0.4 ? '52,211,153' : Math.random() < 0.5 ? '16,185,129' : '100,116,139',
    }));

    const ORBS = [
      { x: 0.72, y: 0.18, r: 0.32, color: '16,185,129',  vx:  0.00008, vy:  0.00005 },
      { x: 0.18, y: 0.55, r: 0.26, color: '52,211,153',  vx: -0.00006, vy: -0.00004 },
      { x: 0.50, y: 0.85, r: 0.22, color: '110,231,183', vx:  0.00005, vy:  0.00007 },
      { x: 0.88, y: 0.65, r: 0.18, color: '5,150,105',   vx: -0.00009, vy:  0.00003 },
    ];

    const DUST = Array.from({ length: 40 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0002,
      vy: -0.00015 - Math.random() * 0.00025,
      r: 1 + Math.random() * 2,
      opacity: 0.05 + Math.random() * 0.1,
    }));

    type Shooter = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; active: boolean };
    const SHOOTERS: Shooter[] = Array.from({ length: 4 }, () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, active: false }));
    function spawnShooter(s: Shooter) {
      s.x = 0.05 + Math.random() * 0.5; s.y = 0.02 + Math.random() * 0.35;
      const angle = Math.PI / 6 + (Math.random() - 0.5) * 0.4;
      const speed = 0.004 + Math.random() * 0.003;
      s.vx = Math.cos(angle) * speed; s.vy = Math.sin(angle) * speed;
      s.maxLife = 45 + Math.random() * 45; s.life = 0; s.active = true;
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
        const g = ctx.createRadialGradient(o.x*W, o.y*H, 0, o.x*W, o.y*H, o.r*W);
        g.addColorStop(0, `rgba(${o.color},0.15)`);
        g.addColorStop(0.5, `rgba(${o.color},0.05)`);
        g.addColorStop(1, `rgba(${o.color},0)`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }

      for (const s of STARS) {
        const flicker = Math.sin(t * s.twinkleSpeed + s.twinkleOffset) * 0.45 + 0.55;
        ctx.globalAlpha = s.baseOpacity * flicker;
        ctx.beginPath(); ctx.arc(s.x*W, s.y*H, s.r, 0, Math.PI*2);
        ctx.fillStyle = `rgb(${s.hue})`; ctx.fill();
      }
      ctx.globalAlpha = 1;

      for (const d of DUST) {
        d.x += d.vx; d.y += d.vy;
        if (d.y < -0.02) { d.y = 1.02; d.x = Math.random(); }
        if (d.x < 0) d.x = 1; if (d.x > 1) d.x = 0;
        ctx.globalAlpha = d.opacity;
        const dg = ctx.createRadialGradient(d.x*W, d.y*H, 0, d.x*W, d.y*H, d.r);
        dg.addColorStop(0, 'rgba(52,211,153,0.9)'); dg.addColorStop(1, 'rgba(16,185,129,0)');
        ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(d.x*W, d.y*H, d.r, 0, Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha = 1;

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
        const nx = s.vx / Math.sqrt(s.vx*s.vx + s.vy*s.vy);
        const ny = s.vy / Math.sqrt(s.vx*s.vx + s.vy*s.vy);
        const grd = ctx.createLinearGradient(s.x*W - nx*tailLen, s.y*H - ny*tailLen, s.x*W, s.y*H);
        grd.addColorStop(0, 'rgba(16,185,129,0)');
        grd.addColorStop(0.7, `rgba(52,211,153,${alpha*0.5})`);
        grd.addColorStop(1, `rgba(255,255,255,${alpha*0.9})`);
        ctx.strokeStyle = grd; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s.x*W - nx*tailLen, s.y*H - ny*tailLen);
        ctx.lineTo(s.x*W, s.y*H); ctx.stroke();
        ctx.beginPath(); ctx.arc(s.x*W, s.y*H, 1.8, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,255,${alpha*0.85})`; ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #021a0f 0%, #03261a 30%, #042f1e 60%, #021a0f 100%)' }} />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-80" aria-hidden="true" />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(16,185,129,0.1) 0%, transparent 70%)' }} />
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at 0% 50%, rgba(52,211,153,0.05) 0%, transparent 60%)' }} />
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at 100% 80%, rgba(5,150,105,0.07) 0%, transparent 60%)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(2,26,15,0.95) 0%, transparent 100%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 w-full">
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-7"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-300/90">AI SEO Agent for Programmatic Growth</span>
            </span>

            <div className="space-y-4">
              <h1 className="text-[2rem] sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.08] tracking-[-0.025em] text-white">
                Your Next 6 Months of SEO,{' '}
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(95deg, #6ee7b7 0%, #34d399 35%, #10b981 70%, #059669 100%)' }}>
                  Done This Week!
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-lg">
                AstroRank AI integrates with your site, understands your business, finds untapped keywords, and publishes 100s of on-brand SEO pages optimized to rank.
              </p>
            </div>

            <div className="space-y-3">
              <CTAButton />
              <p className="text-sm text-slate-500 flex items-center gap-1.5">
                <span className="text-emerald-400">&#10024;</span>
                Get 10 FREE SEO Pages &bull; No Card Needed &bull; 1-on-1 Setup Call
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              {trustPoints.map((point) => (
                <div
                  key={point.label}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-500/10 bg-emerald-500/5 backdrop-blur-sm"
                >
                  <point.icon className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-slate-300">{point.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <AIWorkflowDemo />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
