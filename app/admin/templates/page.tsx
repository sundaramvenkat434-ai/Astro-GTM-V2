'use client';

import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin-shell';
import { Sparkles, Trophy, GitCompare, Zap, ArrowRight } from 'lucide-react';

/* ── Mini page preview components ─────────────────────────────────── */

function ToolListingPreview() {
  return (
    <div className="w-full aspect-[4/3] bg-white rounded-t-lg border border-slate-200 overflow-hidden text-[5px] leading-[1.4] pointer-events-none select-none">
      {/* Header */}
      <div className="h-[14px] bg-white border-b border-slate-100 flex items-center px-2">
        <div className="flex items-center gap-0.5">
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-sky-300 to-sky-600" />
          <span className="font-bold text-slate-800 text-[4px]">AstroGTM</span>
        </div>
      </div>
      {/* Breadcrumb */}
      <div className="px-2 py-0.5 border-b border-slate-50">
        <div className="flex items-center gap-0.5 text-[3.5px] text-slate-400">
          <span>Home</span><span>/</span><span>Content & SEO</span><span>/</span><span className="text-slate-700 font-medium">Jasper AI</span>
        </div>
      </div>
      {/* Hero */}
      <div className="px-2 pt-2 flex gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="font-extrabold text-[7px] text-slate-900">Jasper AI</span>
            <span className="px-0.5 py-[0.5px] bg-sky-100 text-sky-700 text-[3px] font-bold rounded">Top Choice</span>
          </div>
          <p className="text-slate-500 text-[4px] mb-1">AI writing assistant for marketing teams</p>
          <div className="flex gap-1 mb-1">
            <div className="flex items-center gap-0.5">
              <div className="flex">{[1,2,3,4,5].map(i => <div key={i} className="w-1 h-1 text-amber-400">&#9733;</div>)}</div>
              <span className="text-[3px] text-slate-500">4.8 (2.4K)</span>
            </div>
          </div>
          <div className="flex gap-1">
            <div className="px-1 py-0.5 bg-slate-900 text-white rounded-sm text-[3.5px] font-semibold">Visit Website</div>
            <div className="px-1 py-0.5 border border-slate-200 rounded-sm text-[3.5px] text-slate-600">Upvote</div>
          </div>
        </div>
        <div className="w-12 shrink-0">
          <div className="w-full aspect-square rounded bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center">
            <div className="w-4 h-4 rounded bg-sky-100 flex items-center justify-center"><Zap className="w-2 h-2 text-sky-500" /></div>
          </div>
        </div>
      </div>
      {/* Stats row */}
      <div className="px-2 pt-1.5 flex gap-1">
        {['50K+ Users', '4.8 Rating', '24/7 Support'].map(s => (
          <div key={s} className="flex-1 bg-slate-50 rounded px-1 py-0.5 text-center">
            <span className="text-[3.5px] font-bold text-slate-700">{s.split(' ')[0]}</span>
            <span className="text-[3px] text-slate-400 block">{s.split(' ').slice(1).join(' ')}</span>
          </div>
        ))}
      </div>
      {/* Features section */}
      <div className="px-2 pt-2">
        <div className="text-[4.5px] font-bold text-slate-800 mb-1">Key Features</div>
        <div className="grid grid-cols-2 gap-0.5">
          {['AI Content Generation', 'Brand Voice', 'Templates Library', 'SEO Mode'].map(f => (
            <div key={f} className="flex items-center gap-0.5 bg-slate-50 rounded px-1 py-0.5">
              <div className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-[3.5px] text-slate-600 truncate">{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TopXPreview() {
  return (
    <div className="w-full aspect-[4/3] bg-white rounded-t-lg border border-slate-200 overflow-hidden text-[5px] leading-[1.4] pointer-events-none select-none">
      {/* Header */}
      <div className="h-[14px] bg-white border-b border-slate-100 flex items-center px-2">
        <div className="flex items-center gap-0.5">
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-sky-300 to-sky-600" />
          <span className="font-bold text-slate-800 text-[4px]">AstroGTM</span>
        </div>
      </div>
      {/* Hero */}
      <div className="px-2 pt-2 pb-1.5 bg-gradient-to-b from-slate-50 to-white">
        <div className="flex items-center gap-0.5 mb-0.5">
          <Trophy className="w-1.5 h-1.5 text-amber-500" />
          <span className="font-extrabold text-[6px] text-slate-900">Best 7 AI Writing Tools 2026</span>
        </div>
        <p className="text-slate-500 text-[3.5px]">Expert-tested picks for content teams and marketers</p>
      </div>
      {/* Ranked list */}
      <div className="px-2 space-y-1">
        {[
          { rank: 1, name: 'Jasper AI', score: 9.6, badge: 'Top Pick' },
          { rank: 2, name: 'Copy.ai', score: 9.2, badge: null },
          { rank: 3, name: 'Writesonic', score: 8.8, badge: null },
        ].map(item => (
          <div key={item.rank} className="flex items-center gap-1 bg-slate-50 rounded px-1 py-[3px] border border-slate-100">
            <div className={`w-2.5 h-2.5 rounded-full flex items-center justify-center shrink-0 text-[3.5px] font-bold text-white ${item.rank === 1 ? 'bg-amber-500' : 'bg-slate-400'}`}>{item.rank}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-0.5">
                <span className="text-[4px] font-bold text-slate-800">{item.name}</span>
                {item.badge && <span className="text-[2.5px] px-0.5 bg-amber-100 text-amber-700 rounded font-bold">{item.badge}</span>}
              </div>
              <div className="flex items-center gap-0.5 mt-[1px]">
                <div className="flex">{[1,2,3].map(i => <div key={i} className="w-0.5 h-0.5 bg-emerald-400 rounded-full" />)}</div>
                <span className="text-[3px] text-slate-400">Pros listed</span>
              </div>
            </div>
            <div className="w-3.5 h-3.5 rounded-full border border-emerald-200 bg-emerald-50 flex items-center justify-center">
              <span className="text-[3.5px] font-bold text-emerald-600">{item.score}</span>
            </div>
          </div>
        ))}
        <div className="text-center text-[3px] text-slate-400 pt-0.5">+ 4 more tools ranked below...</div>
      </div>
    </div>
  );
}

function ComparisonPreview() {
  return (
    <div className="w-full aspect-[4/3] bg-white rounded-t-lg border border-slate-200 overflow-hidden text-[5px] leading-[1.4] pointer-events-none select-none">
      {/* Header */}
      <div className="h-[14px] bg-white border-b border-slate-100 flex items-center px-2">
        <div className="flex items-center gap-0.5">
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-sky-300 to-sky-600" />
          <span className="font-bold text-slate-800 text-[4px]">AstroGTM</span>
        </div>
      </div>
      {/* Hero */}
      <div className="px-2 pt-2 pb-1.5">
        <div className="flex items-center gap-0.5 mb-0.5">
          <GitCompare className="w-1.5 h-1.5 text-sky-500" />
          <span className="font-extrabold text-[6px] text-slate-900">Jasper vs Copy.ai vs Writesonic</span>
        </div>
        <p className="text-slate-500 text-[3.5px]">Which AI writer is best for your team?</p>
      </div>
      {/* Comparison table */}
      <div className="px-2">
        <div className="border border-slate-200 rounded overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-200">
            <div className="px-1 py-[2px] text-[3px] font-bold text-slate-500">Feature</div>
            <div className="px-1 py-[2px] text-[3px] font-bold text-slate-700 text-center">Jasper</div>
            <div className="px-1 py-[2px] text-[3px] font-bold text-slate-700 text-center">Copy.ai</div>
            <div className="px-1 py-[2px] text-[3px] font-bold text-slate-700 text-center">Writesonic</div>
          </div>
          {['Pricing', 'Templates', 'Brand Voice', 'SEO Tools', 'Team Collab'].map((feature, idx) => (
            <div key={feature} className={`grid grid-cols-4 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} border-b border-slate-100 last:border-0`}>
              <div className="px-1 py-[2px] text-[3px] text-slate-600">{feature}</div>
              {[0,1,2].map(c => (
                <div key={c} className="px-1 py-[2px] flex items-center justify-center">
                  <div className={`w-1.5 h-1.5 rounded-full ${Math.random() > 0.3 ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      {/* Verdict */}
      <div className="px-2 pt-1.5">
        <div className="bg-sky-50 border border-sky-100 rounded px-1.5 py-1">
          <span className="text-[3.5px] font-bold text-sky-800">Verdict: </span>
          <span className="text-[3.5px] text-sky-700">Jasper wins for enterprise teams...</span>
        </div>
      </div>
    </div>
  );
}

/* ── Template data ────────────────────────────────────────────────── */

const TEMPLATES = [
  {
    id: 'tool-listing',
    title: 'Tool Listing',
    description: 'Comprehensive single-tool review page with features, pricing, FAQs, stats, and full SEO metadata.',
    icon: Zap,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    href: '/admin/ai-create',
    preview: ToolListingPreview,
  },
  {
    id: 'top-x',
    title: 'Top X Comparison',
    description: 'Ranked list of tools in a category with scores, pros/cons, pricing summaries, and expert verdicts.',
    icon: Trophy,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    href: '/admin/top-x-create',
    preview: TopXPreview,
  },
  {
    id: 'top-x-v2',
    title: 'Top X V2',
    description: 'Enhanced format with richer AI-generated content and alternate prompt for A/B testing styles.',
    icon: Trophy,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    href: '/admin/top-x-create-v2',
    preview: TopXPreview,
  },
  {
    id: 'comparison',
    title: 'Tool Comparison',
    description: 'Head-to-head comparison of 2-4 tools with feature table, detailed analysis, and recommendation.',
    icon: GitCompare,
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    href: '/admin/comparison-create',
    preview: ComparisonPreview,
  },
];

export default function PageTemplatesPage() {
  const router = useRouter();

  return (
    <AdminShell>
      <div className="p-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-lg font-bold text-slate-900">Page Templates</h1>
          <p className="text-sm text-slate-500 mt-1">Choose a template to create a new page. Each template generates different content structures optimized for SEO.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
          {TEMPLATES.map((template) => {
            const Icon = template.icon;
            const Preview = template.preview;
            return (
              <button
                key={template.id}
                onClick={() => router.push(template.href)}
                className="group text-left bg-white rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-lg transition-all overflow-hidden"
              >
                {/* Design preview */}
                <div className="relative overflow-hidden bg-slate-50/50">
                  <div className="p-3 pb-0">
                    <Preview />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity" />
                </div>

                {/* Template info */}
                <div className="px-4 py-3.5 border-t border-slate-100">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className={`w-7 h-7 rounded-lg ${template.iconBg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-3.5 h-3.5 ${template.iconColor}`} />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-sky-700 transition-colors">{template.title}</h3>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed ml-[38px]">{template.description}</p>
                  <div className="flex items-center gap-1 mt-2.5 ml-[38px] text-[11px] font-medium text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Use this template <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}
