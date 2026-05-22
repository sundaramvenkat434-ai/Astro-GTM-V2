'use client';

import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin-shell';
import { ArrowRight } from 'lucide-react';

/* ══════════════════════════════════════════════════════════════════════════════
   Tool Listing Preview – scaled HTML replica of the actual tool review page
   ══════════════════════════════════════════════════════════════════════════════ */

function ToolListingPreview() {
  return (
    <div className="font-sans text-[11px] leading-[1.5] text-slate-700 bg-[#f8f9fb] min-h-0">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100 px-4 py-2">
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <span className="text-sky-600 font-medium">Home</span>
          <span>/</span>
          <span className="text-sky-600 font-medium">Content & SEO</span>
          <span>/</span>
          <span className="text-slate-600 font-medium">Jasper AI</span>
        </div>
      </div>

      {/* Hero Card */}
      <div className="p-4">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-5" style={{ background: 'linear-gradient(160deg, #f0f7ff 0%, #ffffff 55%)' }}>
            <div className="flex gap-4">
              {/* Logo */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-100 to-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[15px] font-bold text-slate-900">Jasper AI</span>
                  <span className="px-1.5 py-0.5 bg-sky-100 text-sky-700 text-[9px] font-bold rounded border border-sky-200">TOP CHOICE</span>
                  <span className="px-1.5 py-0.5 bg-sky-50 text-sky-700 text-[9px] font-semibold rounded border border-sky-200 flex items-center gap-0.5">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">AI writing assistant for marketing teams</p>
                {/* Stars */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <svg key={i} className="w-3 h-3 fill-amber-400 text-amber-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800">4.8</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 rounded-full text-slate-500 border border-slate-200">7 Editor Reviews</span>
                </div>
                {/* Category + Upvote */}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">Content & SEO</span>
                  <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200 flex items-center gap-1">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                    142
                  </span>
                  <span className="text-[9px] text-slate-400 flex items-center gap-1">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    2.4k views
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 mt-2 flex items-center gap-1">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                  Added January 2026
                </p>
              </div>
              {/* CTA buttons */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="px-3 py-1.5 bg-slate-900 text-white text-[10px] font-semibold rounded-lg flex items-center gap-1">
                  Visit Website
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </span>
                <span className="px-3 py-1.5 bg-white text-slate-600 text-[10px] font-medium rounded-lg border border-slate-200">Claim Listing</span>
              </div>
            </div>
            {/* Use cases */}
            <div className="mt-4 pt-4 border-t border-slate-200/60">
              <p className="text-[8px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Common Use Cases</p>
              <div className="flex flex-wrap gap-1.5">
                {['Blog Writing', 'Ad Copy', 'Email Marketing', 'Social Media'].map(uc => (
                  <span key={uc} className="inline-flex items-center gap-1 text-[9px] font-medium text-slate-600 bg-white/80 border border-slate-200 px-2 py-0.5 rounded-md">
                    <span className="w-1 h-1 rounded-full bg-sky-600" />
                    {uc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[{ v: '50K+', l: 'Active Users' }, { v: '4.8/5', l: 'Avg Rating' }, { v: '24/7', l: 'Support' }].map(s => (
            <div key={s.l} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-center">
              <div className="text-[12px] font-bold text-slate-800">{s.v}</div>
              <div className="text-[9px] text-slate-400">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Features section */}
        <div className="mt-4">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-0.5 h-3.5 rounded-full bg-sky-500" />
            <span className="text-[12px] font-bold text-slate-900">Key Features</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['AI Content Generation', 'Brand Voice Customization', '50+ Templates', 'SEO Mode'].map(f => (
              <div key={f} className="bg-white border border-slate-200 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-4 h-4 rounded bg-sky-50 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-800">{f}</span>
                </div>
                <p className="text-[9px] text-slate-400 pl-[22px]">AI-powered tools for efficient content creation</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing section */}
        <div className="mt-4">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-0.5 h-3.5 rounded-full bg-emerald-500" />
            <span className="text-[12px] font-bold text-slate-900">Pricing Plans</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[{ plan: 'Starter', price: '$49/mo', hl: false }, { plan: 'Pro', price: '$99/mo', hl: true }, { plan: 'Business', price: '$299/mo', hl: false }].map(p => (
              <div key={p.plan} className={`rounded-lg border p-2.5 ${p.hl ? 'border-sky-300 bg-sky-50/50' : 'border-slate-200 bg-white'}`}>
                <div className="text-[10px] font-semibold text-slate-800">{p.plan}</div>
                <div className="text-[12px] font-bold text-slate-900 mt-0.5">{p.price}</div>
                <div className="mt-1.5 space-y-0.5">
                  {['Feature A', 'Feature B'].map(f => (
                    <div key={f} className="flex items-center gap-1 text-[9px] text-slate-500">
                      <svg className="w-2 h-2 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ section */}
        <div className="mt-4">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-0.5 h-3.5 rounded-full bg-amber-400" />
            <span className="text-[12px] font-bold text-slate-900">Frequently Asked Questions</span>
          </div>
          <div className="space-y-1.5">
            {['What is Jasper AI?', 'How much does it cost?', 'Is there a free trial?'].map(q => (
              <div key={q} className="bg-white border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-between">
                <span className="text-[10px] font-medium text-slate-700">{q}</span>
                <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Top X Preview – scaled HTML replica of the ranked comparison page
   ══════════════════════════════════════════════════════════════════════════════ */

function TopXPreview() {
  const tools = [
    { rank: 1, name: 'Jasper AI', score: 9.6, best: 'Enterprise teams', badge: 'top-choice' },
    { rank: 2, name: 'Copy.ai', score: 9.2, best: 'Startups', badge: 'new' },
    { rank: 3, name: 'Writesonic', score: 8.8, best: 'Bloggers', badge: null },
  ];

  return (
    <div className="font-sans text-[11px] leading-[1.5] text-slate-700 bg-[#f8f9fb] min-h-0">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100 px-4 py-2">
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <span className="text-sky-600 font-medium">Home</span>
          <span>/</span>
          <span className="text-sky-600 font-medium">Content & SEO</span>
          <span>/</span>
          <span className="text-slate-600 font-medium">Best 7 AI Writing Tools</span>
        </div>
      </div>

      <div className="p-4">
        {/* Hero */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span className="text-[15px] font-bold text-slate-900">Best 7 AI Writing Tools in 2026</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">Expert-tested picks for content teams and marketing professionals</p>
          <p className="text-[10px] text-slate-600 leading-relaxed">We evaluated dozens of AI writing tools across content quality, ease of use, pricing value, and team collaboration features to bring you this definitive ranked list.</p>
        </div>

        {/* Quick comparison table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-3">
          <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50">
            <span className="text-[10px] font-bold text-slate-700">Quick Comparison</span>
          </div>
          <table className="w-full text-[9px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-3 py-1.5 text-left font-semibold text-slate-500">#</th>
                <th className="px-3 py-1.5 text-left font-semibold text-slate-500">Tool</th>
                <th className="px-3 py-1.5 text-left font-semibold text-slate-500">Best For</th>
                <th className="px-3 py-1.5 text-left font-semibold text-slate-500">Price</th>
                <th className="px-3 py-1.5 text-center font-semibold text-slate-500">Rating</th>
              </tr>
            </thead>
            <tbody>
              {[
                { n: 'Jasper AI', b: 'Enterprise', p: '$49/mo', r: '4.8' },
                { n: 'Copy.ai', b: 'Startups', p: '$36/mo', r: '4.6' },
                { n: 'Writesonic', b: 'Bloggers', p: '$19/mo', r: '4.5' },
              ].map((t, i) => (
                <tr key={t.n} className="border-b border-slate-50">
                  <td className="px-3 py-1.5 font-bold text-slate-400">{i+1}</td>
                  <td className="px-3 py-1.5 font-semibold text-slate-800">{t.n}</td>
                  <td className="px-3 py-1.5 text-slate-500">{t.b}</td>
                  <td className="px-3 py-1.5 text-slate-600">{t.p}</td>
                  <td className="px-3 py-1.5 text-center font-semibold text-slate-700">{t.r}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Ranked entries */}
        {tools.map(tool => (
          <div key={tool.rank} className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 mb-2.5">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold text-white ${tool.rank === 1 ? 'bg-amber-500' : tool.rank === 2 ? 'bg-slate-400' : 'bg-orange-300'}`}>
                {tool.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[12px] font-bold text-slate-900">{tool.name}</span>
                  {tool.badge && (
                    <span className={`text-[8px] px-1 py-0.5 rounded font-bold ${tool.badge === 'top-choice' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {tool.badge === 'top-choice' ? 'TOP CHOICE' : 'NEW'}
                    </span>
                  )}
                </div>
                <p className="text-[9px] text-slate-500 mb-1.5">Best for: {tool.best}</p>
                <div className="flex gap-3">
                  <div>
                    <span className="text-[8px] font-semibold text-emerald-600 block mb-0.5">PROS</span>
                    <div className="space-y-0.5">
                      {['Fast content generation', 'Great templates'].map(p => (
                        <div key={p} className="flex items-center gap-1 text-[9px] text-slate-600">
                          <svg className="w-2 h-2 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[8px] font-semibold text-red-500 block mb-0.5">CONS</span>
                    <div className="space-y-0.5">
                      {['Pricey for solo users'].map(c => (
                        <div key={c} className="flex items-center gap-1 text-[9px] text-slate-600">
                          <svg className="w-2 h-2 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          {c}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-emerald-200 bg-emerald-50 flex items-center justify-center shrink-0">
                <span className="text-[12px] font-bold text-emerald-700">{tool.score}</span>
              </div>
            </div>
          </div>
        ))}

        {/* FAQ section teaser */}
        <div className="mt-3">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-0.5 h-3.5 rounded-full bg-amber-400" />
            <span className="text-[12px] font-bold text-slate-900">Frequently Asked Questions</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-between">
            <span className="text-[10px] font-medium text-slate-700">Which AI writing tool is best for beginners?</span>
            <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Comparison Preview – scaled HTML replica of the head-to-head comparison page
   ══════════════════════════════════════════════════════════════════════════════ */

function ComparisonPreview() {
  return (
    <div className="font-sans text-[11px] leading-[1.5] text-slate-700 bg-[#f8f9fb] min-h-0">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100 px-4 py-2">
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <span className="text-sky-600 font-medium">Home</span>
          <span>/</span>
          <span className="text-sky-600 font-medium">Comparisons</span>
          <span>/</span>
          <span className="text-slate-600 font-medium">Jasper vs Copy.ai vs Writesonic</span>
        </div>
      </div>

      <div className="p-4">
        {/* Hero */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            <span className="text-[15px] font-bold text-slate-900">Jasper vs Copy.ai vs Writesonic</span>
          </div>
          <p className="text-[11px] text-slate-500">Which AI writer is best for your team? A detailed head-to-head comparison.</p>
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { name: 'Jasper AI', score: 92, winner: true },
            { name: 'Copy.ai', score: 86, winner: false },
            { name: 'Writesonic', score: 81, winner: false },
          ].map(t => (
            <div key={t.name} className={`rounded-xl border bg-white p-3 text-center ${t.winner ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200'}`}>
              {t.winner && (
                <div className="flex items-center justify-center gap-0.5 mb-1">
                  <svg className="w-2.5 h-2.5 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z"/></svg>
                  <span className="text-[8px] font-bold text-amber-600">WINNER</span>
                </div>
              )}
              <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center mx-auto mb-1 ${t.score >= 85 ? 'border-emerald-300 bg-emerald-50' : t.score >= 70 ? 'border-amber-300 bg-amber-50' : 'border-red-300 bg-red-50'}`}>
                <span className={`text-[12px] font-bold ${t.score >= 85 ? 'text-emerald-700' : t.score >= 70 ? 'text-amber-700' : 'text-red-600'}`}>{t.score}</span>
              </div>
              <div className="text-[10px] font-semibold text-slate-800">{t.name}</div>
            </div>
          ))}
        </div>

        {/* Feature comparison table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-3">
          <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50">
            <span className="text-[10px] font-bold text-slate-700">Feature Comparison</span>
          </div>
          <table className="w-full text-[9px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-3 py-1.5 text-left font-semibold text-slate-500">Feature</th>
                <th className="px-2 py-1.5 text-center font-semibold text-slate-700">Jasper</th>
                <th className="px-2 py-1.5 text-center font-semibold text-slate-700">Copy.ai</th>
                <th className="px-2 py-1.5 text-center font-semibold text-slate-700">Writesonic</th>
              </tr>
            </thead>
            <tbody>
              {[
                { f: 'AI Quality', s: [true, true, true] },
                { f: 'Brand Voice', s: [true, true, false] },
                { f: 'Templates', s: [true, true, true] },
                { f: 'Team Seats', s: [true, false, true] },
                { f: 'SEO Tools', s: [true, false, false] },
                { f: 'API Access', s: [true, true, false] },
              ].map((row, i) => (
                <tr key={row.f} className={`border-b border-slate-50 ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                  <td className="px-3 py-1.5 font-medium text-slate-600">{row.f}</td>
                  {row.s.map((v, ci) => (
                    <td key={ci} className="px-2 py-1.5 text-center">
                      {v ? (
                        <svg className="w-3 h-3 text-emerald-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-3 h-3 text-slate-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Verdict */}
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <svg className="w-3.5 h-3.5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-[11px] font-bold text-sky-800">Our Verdict</span>
          </div>
          <p className="text-[10px] text-sky-700 leading-relaxed">Jasper AI takes the crown for enterprise teams needing brand-consistent content at scale. Copy.ai is the best value for startups, while Writesonic excels for budget-conscious bloggers.</p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Template Data & Page
   ══════════════════════════════════════════════════════════════════════════════ */

const TEMPLATES = [
  {
    id: 'tool-listing',
    title: 'Tool Listing',
    description: 'Comprehensive single-tool review page with hero card, features grid, pricing plans, FAQs, and full SEO metadata.',
    href: '/admin/ai-create',
    preview: ToolListingPreview,
    color: 'sky',
  },
  {
    id: 'top-x',
    title: 'Top X Comparison',
    description: 'A ranked list of tools with scores, pros/cons, quick comparison table, and expert verdicts per entry.',
    href: '/admin/top-x-create',
    preview: TopXPreview,
    color: 'amber',
  },
  {
    id: 'top-x-v2',
    title: 'Top X V2',
    description: 'Enhanced ranked list format with richer AI-generated content and alternate prompt for A/B testing different styles.',
    href: '/admin/top-x-create-v2',
    preview: TopXPreview,
    color: 'orange',
  },
  {
    id: 'comparison',
    title: 'Tool Comparison',
    description: 'Head-to-head comparison of 2-4 tools with score cards, feature comparison table, and final verdict.',
    href: '/admin/comparison-create',
    preview: ComparisonPreview,
    color: 'teal',
  },
];

export default function PageTemplatesPage() {
  const router = useRouter();

  return (
    <AdminShell>
      <div className="p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-lg font-bold text-slate-900">Page Templates</h1>
          <p className="text-sm text-slate-500 mt-1">Choose a template to create a new page. Scroll each preview to see the full page design.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {TEMPLATES.map((template) => {
            const Preview = template.preview;
            return (
              <div
                key={template.id}
                className="group bg-white rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-lg transition-all overflow-hidden flex flex-col"
              >
                {/* Scrollable preview */}
                <div className="relative h-[300px] overflow-y-auto border-b border-slate-100 bg-[#f8f9fb] scrollbar-thin">
                  <Preview />
                </div>

                {/* Template info */}
                <div className="px-4 py-3.5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{template.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm">{template.description}</p>
                  </div>
                  <button
                    onClick={() => router.push(template.href)}
                    className="shrink-0 ml-4 flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-semibold rounded-lg transition-colors"
                  >
                    Use template <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}
