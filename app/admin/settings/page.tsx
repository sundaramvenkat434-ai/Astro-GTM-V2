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
} from 'lucide-react';

export default function SiteSettingsAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [originalDescription, setOriginalDescription] = useState('');

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase
      .from('admin_settings')
      .select('key, value')
      .in('key', ['site_meta_title', 'site_meta_description']);

    if (data) {
      for (const row of data) {
        if (row.key === 'site_meta_title') { setMetaTitle(row.value); setOriginalTitle(row.value); }
        if (row.key === 'site_meta_description') { setMetaDescription(row.value); setOriginalDescription(row.value); }
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/admin/login'); return; }
      fetchSettings();
    });
  }, [router, fetchSettings]);

  const hasChanges = metaTitle !== originalTitle || metaDescription !== originalDescription;

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const now = new Date().toISOString();
    await Promise.all([
      supabase.from('admin_settings').upsert({ key: 'site_meta_title', value: metaTitle, updated_at: now }, { onConflict: 'key' }),
      supabase.from('admin_settings').upsert({ key: 'site_meta_description', value: metaDescription, updated_at: now }, { onConflict: 'key' }),
    ]);
    setOriginalTitle(metaTitle);
    setOriginalDescription(metaDescription);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return <AdminShell><div className="flex-1 flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div></AdminShell>;

  return (
    <AdminShell>
      <div className="p-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Site Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Configure your site-wide meta title and description for search engines.</p>
          </div>
          <div className="flex items-center gap-2">
            {saved && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"><CheckCircle2 className="w-3 h-3 mr-1" />Saved</Badge>}
            {hasChanges && <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">Unsaved changes</Badge>}
          </div>
        </div>

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
              <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Your site title..." className="text-sm border-slate-200 focus-visible:ring-sky-500/20 focus-visible:border-sky-400" />
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-400">Recommended: 50-60 characters</p>
                <span className={`text-[11px] tabular-nums ${metaTitle.length > 60 ? 'text-amber-600' : 'text-slate-400'}`}>{metaTitle.length}/60</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Meta Description</label>
              <Textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="A brief description of your site..." rows={3} className="text-sm border-slate-200 focus-visible:ring-sky-500/20 focus-visible:border-sky-400 resize-y" />
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-400">Recommended: 120-160 characters</p>
                <span className={`text-[11px] tabular-nums ${metaDescription.length > 160 ? 'text-amber-600' : 'text-slate-400'}`}>{metaDescription.length}/160</span>
              </div>
            </div>

            {/* SERP Preview */}
            <div className="space-y-2 pt-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Search Preview</p>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-sm text-sky-700 font-medium leading-snug truncate">{metaTitle || 'Your site title'}</p>
                <p className="text-xs text-emerald-700 mt-1 truncate">{process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'}</p>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{metaDescription || 'Your site description will appear here...'}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => { setMetaTitle(originalTitle); setMetaDescription(originalDescription); }} disabled={!hasChanges || saving} className="h-8 text-xs">
                <RotateCcw className="w-3 h-3 mr-1.5" />Discard
              </Button>
              <Button size="sm" onClick={handleSave} disabled={!metaTitle.trim() || saving} className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white">
                {saving ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Save className="w-3 h-3 mr-1.5" />}Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
