'use client';

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
  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#02140F] via-[#041F15] to-[#052E1A]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] rounded-full bg-emerald-600/3 blur-[100px]" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-300/90">AI SEO Agent for Programmatic Growth</span>
              </span>
            </motion.div>

            {/* Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight text-white">
                Your Next 6 Months of SEO,{' '}
                <span className="bg-gradient-to-r from-emerald-300 via-green-300 to-emerald-400 bg-clip-text text-transparent">
                  Done This Week!
                </span>
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed max-w-lg">
                AstroRank AI integrates with your site, understands your business, finds untapped keywords, and publishes 100s of on-brand SEO pages optimized to rank.
              </p>
            </div>

            {/* CTA */}
            <div className="space-y-4">
              <CTAButton />
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <span className="text-emerald-400">&#10024;</span>
                Get 10 FREE SEO Pages &bull; No Card Needed &bull; 1-on-1 Setup Call
              </p>
            </div>

            {/* Trust Points */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              {trustPoints.map((point) => (
                <div
                  key={point.label}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-emerald-500/10 bg-emerald-500/5 backdrop-blur-sm"
                >
                  <point.icon className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-gray-300">{point.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column - Animated Demo */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          >
            <AIWorkflowDemo />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
