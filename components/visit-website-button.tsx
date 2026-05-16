'use client';

import { ArrowUpRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Props {
  toolId: string;
  websiteUrl: string;
}

function buildUtmUrl(base: string): string {
  try {
    const url = new URL(base.startsWith('http') ? base : `https://${base}`);
    url.searchParams.set('utm_source', 'astrogtm');
    url.searchParams.set('utm_medium', 'tools');
    url.searchParams.set('utm_campaign', 'claim');
    return url.toString();
  } catch {
    return base;
  }
}

export function VisitWebsiteButton({ toolId, websiteUrl }: Props) {
  const utmUrl = buildUtmUrl(websiteUrl);

  async function handleClick() {
    await supabase.rpc('increment_website_clicks', { tool_id: toolId });
    window.open(utmUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <button
      onClick={handleClick}
      className="group inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 active:scale-[0.97] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
    >
      Visit Website
      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </button>
  );
}
