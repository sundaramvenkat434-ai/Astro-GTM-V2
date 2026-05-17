import type { Metadata } from 'next';
import { BookOpen, Users, Award } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000';

export const metadata: Metadata = {
  title: 'About AstroGTM — Independent AI & SaaS Tool Reviews',
  description: 'AstroGTM publishes independent, hands-on reviews of AI and SaaS tools for GTM, SEO, and growth teams.',
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: 'About AstroGTM',
    description: 'Independent, hands-on reviews of AI and SaaS tools for GTM, SEO, and growth teams.',
    url: `${SITE_URL}/about`,
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <span className="type-eyebrow">About</span>
          <h1 className="type-h1 mt-2 mb-4">
            Honest reviews. No affiliate spin.
          </h1>
          <p className="type-body-lg">
            AstroGTM is an independent publication covering AI tools, SaaS products, and developer software for GTM, SEO, and growth teams. Every review is based on hands-on testing — not vendor pitches.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
          {[
            { icon: <BookOpen className="w-5 h-5" />, label: 'Reviews published', value: '200+' },
            { icon: <Users className="w-5 h-5" />, label: 'Monthly readers', value: '40k+' },
            { icon: <Award className="w-5 h-5" />, label: 'Tools tested', value: '500+' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-5 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-sky-50 text-sky-600 mb-3">
                {s.icon}
              </div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-8">
          <h2 className="type-h2 mb-4">Meet the Editor</h2>
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0 text-white text-xl font-bold">
              V
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">Venkat Sundaram</p>
              <p className="text-sm text-slate-500 mb-3">Editor-in-Chief · AI &amp; GTM Specialist</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Venkat has 10+ years of experience across AI product development, growth, and SaaS strategy. He has built and shipped AI-powered products at multiple startups and consults for enterprise teams adopting LLM tooling. His testing methodology focuses on real-world GTM use cases, not benchmark theatre.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8">
          <h2 className="type-h2 mb-4">Our Review Standards</h2>
          <ul className="space-y-3">
            {[
              'Every tool is tested by our team before publishing — no copy-paste spec sheets.',
              'We disclose affiliate relationships clearly when they exist.',
              'Ratings reflect actual performance across multiple use cases, not just first impressions.',
              'We update reviews when tools ship major changes.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
