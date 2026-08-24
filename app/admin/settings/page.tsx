'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AdminShell } from '@/components/admin-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Loader as Loader2,
  Save,
  RotateCcw,
  Globe,
  CircleCheck as CheckCircle2,
  Shield,
  MessageSquare,
} from 'lucide-react';

const SETTING_KEYS = [
  'site_meta_title',
  'site_meta_description',
  'free_audit_create_limit',
  'free_audit_analyze_limit',
  'free_audit_serp_limit',
  'free_audit_scrape_limit',
  'free_audit_ip_whitelist',
  'free_audit_search_queries_prompt',
] as const;

type SettingKey = typeof SETTING_KEYS[number];

export default function SiteSettingsAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [values, setValues] = useState<Record<SettingKey, string>>({
    site_meta_title: '',
    site_meta_description: '',
    free_audit_create_limit: '',
    free_audit_analyze_limit: '',
    free_audit_serp_limit: '',
    free_audit_scrape_limit: '',
    free_audit_ip_whitelist: '',
    free_audit_search_queries_prompt: '',
  });
  const [originals, setOriginals] = useState<Record<SettingKey, string>>({ ...values });

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase
      .from('admin_settings')
      .select('key, value')
      .in('key', [...SETTING_KEYS]);

    const next = { ...values };
    if (data) {
      for (const row of data) {
        if (SETTING_KEYS.includes(row.key as SettingKey)) {
          next[row.key as SettingKey] = row.value || '';
        }
      }
    }
    setValues(next);
    setOriginals(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/admin/login'); return; }
      fetchSettings();
    });
  }, [router, fetchSettings]);

  const hasChanges = SETTING_KEYS.some((k) => values[k] !== originals[k]);

  function update(key: SettingKey, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const now = new Date().toISOString();
    await Promise.all(
      SETTING_KEYS.map((key) =>
        supabase.from('admin_settings').upsert({ key, value: values[key], updated_at: now }, { onConflict: 'key' })
      )
    );
    setOriginals({ ...values });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return <AdminShell><div className="flex-1 flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div></AdminShell>;

  return (
    <AdminShell>
      <div className="p-6 max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Site Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Configure site-wide meta tags and free audit rate limits.</p>
          </div>
          <div className="flex items-center gap-2">
            {saved && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"><CheckCircle2 className="w-3 h-3 mr-1" />Saved</Badge>}
            {hasChanges && <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">Unsaved changes</Badge>}
          </div>
        </div>

        {/* SEO Meta Tags */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-sky-600" />
              </div>
              <div>
                <CardTitle className="text-base">SEO Meta Tags</CardTitle>
                <CardDescription className="mt-1 text-xs leading-relaxed">
                  Displayed in search engine results and social media previews for the homepage.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Meta Title</label>
              <Input value={values.site_meta_title} onChange={(e) => update('site_meta_title', e.target.value)} placeholder="Your site title..." className="text-sm border-slate-200 focus-visible:ring-sky-500/20 focus-visible:border-sky-400" />
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-400">Recommended: 50-60 characters</p>
                <span className={`text-[11px] tabular-nums ${values.site_meta_title.length > 60 ? 'text-amber-600' : 'text-slate-400'}`}>{values.site_meta_title.length}/60</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Meta Description</label>
              <Textarea value={values.site_meta_description} onChange={(e) => update('site_meta_description', e.target.value)} placeholder="A brief description of your site..." rows={3} className="text-sm border-slate-200 focus-visible:ring-sky-500/20 focus-visible:border-sky-400 resize-y" />
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-400">Recommended: 120-160 characters</p>
                <span className={`text-[11px] tabular-nums ${values.site_meta_description.length > 160 ? 'text-amber-600' : 'text-slate-400'}`}>{values.site_meta_description.length}/160</span>
              </div>
            </div>

            {/* SERP Preview */}
            <div className="space-y-2 pt-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Search Preview</p>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-sm text-sky-700 font-medium leading-snug truncate">{values.site_meta_title || 'Your site title'}</p>
                <p className="text-xs text-emerald-700 mt-1 truncate">{process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'}</p>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{values.site_meta_description || 'Your site description will appear here...'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Free Audit Rate Limits */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-base">Free Audit Rate Limits</CardTitle>
                <CardDescription className="mt-1 text-xs leading-relaxed">
                  Control how many free audit actions a visitor can perform per hour. Set to 0 to use the default. Whitelisted IPs bypass all limits.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Create Audit Limit / hour</label>
                <Input type="number" min={0} value={values.free_audit_create_limit} onChange={(e) => update('free_audit_create_limit', e.target.value)} className="text-sm border-slate-200 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-400" />
                <p className="text-[11px] text-slate-400">Default: 5</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Brand Analysis Limit / hour</label>
                <Input type="number" min={0} value={values.free_audit_analyze_limit} onChange={(e) => update('free_audit_analyze_limit', e.target.value)} className="text-sm border-slate-200 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-400" />
                <p className="text-[11px] text-slate-400">Default: 10</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">SERP Search Limit / hour</label>
                <Input type="number" min={0} value={values.free_audit_serp_limit} onChange={(e) => update('free_audit_serp_limit', e.target.value)} className="text-sm border-slate-200 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-400" />
                <p className="text-[11px] text-slate-400">Default: 10</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Competitor Scraping Limit / hour</label>
                <Input type="number" min={0} value={values.free_audit_scrape_limit} onChange={(e) => update('free_audit_scrape_limit', e.target.value)} className="text-sm border-slate-200 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-400" />
                <p className="text-[11px] text-slate-400">Default: 10</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">IP Whitelist</label>
              <Textarea value={values.free_audit_ip_whitelist} onChange={(e) => update('free_audit_ip_whitelist', e.target.value)} placeholder="e.g. 192.168.1.1, 10.0.0.5" rows={3} className="text-sm border-slate-200 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-400 resize-y font-mono" />
              <p className="text-[11px] text-slate-400">Comma-separated or one per line. These IPs skip all rate limits.</p>
            </div>
          </CardContent>
        </Card>

        {/* Free Audit AI Prompts */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <CardTitle className="text-base">Free Audit AI Prompts</CardTitle>
                <CardDescription className="mt-1 text-xs leading-relaxed">
                  System prompts used by the AI when generating content for the free audit flow.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Search Queries Prompt</label>
              <Textarea value={values.free_audit_search_queries_prompt} onChange={(e) => update('free_audit_search_queries_prompt', e.target.value)} placeholder="System prompt for generating 10 realistic search queries..." rows={10} className="text-xs border-slate-200 focus-visible:ring-violet-500/20 focus-visible:border-violet-400 resize-y font-mono" />
              <p className="text-[11px] text-slate-400">Used when generating search queries from the website content. Falls back to a built-in default if left empty.</p>
            </div>
          </CardContent>
        </Card>

        {/* Save / Discard */}
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => { setValues({ ...originals }); }} disabled={!hasChanges || saving} className="h-8 text-xs">
            <RotateCcw className="w-3 h-3 mr-1.5" />Discard
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!hasChanges || saving} className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white">
            {saving ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Save className="w-3 h-3 mr-1.5" />}Save Changes
          </Button>
        </div>
      </div>
    </AdminShell>
  );
}
