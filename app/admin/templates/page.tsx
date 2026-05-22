'use client';

import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin-shell';
import { Sparkles, Trophy, GitCompare, Zap, ArrowRight, Image as ImageIcon } from 'lucide-react';

const TEMPLATES = [
  {
    id: 'tool-listing',
    title: 'Tool Listing',
    description: 'A comprehensive single-tool review page with features, pricing, FAQs, and SEO metadata. AI-generated from a URL.',
    icon: Zap,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    borderColor: 'border-sky-200',
    href: '/admin/ai-create',
    preview: {
      title: 'Jasper AI',
      tagline: 'AI writing assistant for marketing teams',
      category: 'Content & SEO',
      badge: 'Top Choice',
    },
  },
  {
    id: 'tool-listing-v2',
    title: 'Tool Listing V2',
    description: 'Same as Tool Listing but uses an alternate AI prompt for A/B testing different content generation styles.',
    icon: Sparkles,
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    borderColor: 'border-cyan-200',
    href: '/admin/ai-create',
    preview: {
      title: 'Copy.ai',
      tagline: 'Automate your GTM workflows with AI',
      category: 'Content & SEO',
      badge: 'New',
    },
  },
  {
    id: 'top-x',
    title: 'Top X Comparison',
    description: 'A ranked list of tools in a category with scores, pros/cons, pricing summaries, and expert verdicts.',
    icon: Trophy,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    href: '/admin/top-x-create',
    preview: {
      title: 'Best 7 AI Writing Tools in 2026',
      tagline: 'Expert-tested picks for content teams',
      category: 'Content & SEO',
      badge: 'Trending',
    },
  },
  {
    id: 'top-x-v2',
    title: 'Top X V2',
    description: 'Enhanced Top X format with richer content generation and alternate prompt for testing different styles.',
    icon: Trophy,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    href: '/admin/top-x-create-v2',
    preview: {
      title: 'Top 5 Lead Gen Tools for SaaS',
      tagline: 'Comprehensive comparison with scoring',
      category: 'Lead Generation',
      badge: 'New',
    },
  },
  {
    id: 'comparison',
    title: 'Tool Comparison',
    description: 'A head-to-head comparison of 2-4 tools with detailed analysis, verdict, and recommendation.',
    icon: GitCompare,
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    borderColor: 'border-teal-200',
    href: '/admin/comparison-create',
    preview: {
      title: 'Jasper vs Copy.ai vs Writesonic',
      tagline: 'Which AI writer is best for your team?',
      category: 'Content & SEO',
      badge: null,
    },
  },
  {
    id: 'media-extract',
    title: 'Media Extractor',
    description: 'Extract logos, screenshots, and media assets from any URL. Used to enrich tool listings with visual content.',
    icon: ImageIcon,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    borderColor: 'border-slate-200',
    href: '/admin/media-extract',
    preview: {
      title: 'Extract from URL',
      tagline: 'Pull logos and screenshots automatically',
      category: 'Utility',
      badge: null,
    },
  },
];

const BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  'Top Choice': { bg: 'bg-sky-100', text: 'text-sky-700' },
  'Trending': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'New': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
};

export default function PageTemplatesPage() {
  const router = useRouter();

  return (
    <AdminShell>
      <div className="p-6 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-lg font-bold text-slate-900">Page Templates</h1>
          <p className="text-sm text-slate-500 mt-1">Choose a template to create a new page. Each template generates different content structures optimized for SEO.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {TEMPLATES.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                onClick={() => router.push(template.href)}
                className={`group text-left bg-white rounded-xl border ${template.borderColor} hover:shadow-md hover:border-sky-300 transition-all p-0 overflow-hidden`}
              >
                {/* Preview snippet */}
                <div className="px-4 pt-4 pb-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-start gap-2.5">
                    <div className={`w-8 h-8 rounded-lg ${template.iconBg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${template.iconColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-slate-800 truncate">{template.preview.title}</p>
                        {template.preview.badge && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${BADGE_STYLES[template.preview.badge]?.bg || 'bg-slate-100'} ${BADGE_STYLES[template.preview.badge]?.text || 'text-slate-600'}`}>
                            {template.preview.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">{template.preview.tagline}</p>
                      <span className="inline-block text-[9px] font-medium text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded-full mt-1.5">{template.preview.category}</span>
                    </div>
                  </div>
                </div>

                {/* Template info */}
                <div className="px-4 py-3.5">
                  <h3 className="text-sm font-semibold text-slate-900 mb-1 group-hover:text-sky-700 transition-colors">{template.title}</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{template.description}</p>
                  <div className="flex items-center gap-1 mt-3 text-[11px] font-medium text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Use template <ArrowRight className="w-3 h-3" />
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
