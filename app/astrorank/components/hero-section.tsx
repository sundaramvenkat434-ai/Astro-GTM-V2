'use client';

import { useEffect, useState } from 'react';
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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center">
      {/* Light gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f0fdf4] via-[#ecfdf5] to-[#d1fae5]" />

      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.4]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(16,185,129,0.15) 1px, transparent 0)',
        backgroundSize: '32px 32px',
      }} />

      {/* Decorative blobs */}
      <div className="absolute top-20 right-[15%] w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />
      <div className="absolute bottom-20 left-[10%] w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(5,150,105,0.06) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 w-full">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-14 items-center">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 16 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-200 bg-white/80 backdrop-blur-sm shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">AI SEO Agent for Programmatic Growth</span>
            </span>

            <div className="space-y-4">
              <h1 className="text-[2rem] sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.08] tracking-[-0.025em] text-gray-900">
                Your Next 6 Months of SEO,{' '}
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)' }}>
                  Done This Week!
                </span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-lg">
                AstroRank AI integrates with your site, understands your business, finds untapped keywords, and publishes 100s of on-brand SEO pages optimized to rank.
              </p>
            </div>

            <div className="space-y-3">
              <CTAButton />
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <span className="text-emerald-500">&#10024;</span>
                Get 10 FREE SEO Pages &bull; No Card Needed &bull; 1-on-1 Setup Call
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              {trustPoints.map((point) => (
                <div
                  key={point.label}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-100 bg-white/70 backdrop-blur-sm shadow-sm"
                >
                  <point.icon className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-gray-700">{point.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 16 }}
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
