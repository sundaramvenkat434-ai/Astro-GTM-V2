'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AdminShell } from '@/components/admin-shell';
import { Button } from '@/components/ui/button';
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
  FileText,
  ExternalLink,
  CircleCheck as CheckCircle2,
} from 'lucide-react';

export default function LlmsTxtAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');

  const fetchContent = useCallback(async () => {
    const { data } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'llms_txt_content')
      .maybeSingle();

    if (data) {
      setContent(data.value);
      setOriginalContent(data.value);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/admin/login'); return; }
      fetchContent();
    });
  }, [router, fetchContent]);

  const hasChanges = content !== originalContent;

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await supabase
      .from('admin_settings')
      .upsert({ key: 'llms_txt_content', value: content, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    setOriginalContent(content);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return <AdminShell><div className="flex-1 flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div></AdminShell>;

  return (
    <AdminShell>
      <div className="p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-slate-900">LLMS.txt</h1>
            <p className="text-sm text-slate-500 mt-1">
              Configure the llms.txt file that helps AI models understand your site content.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {saved && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"><CheckCircle2 className="w-3 h-3 mr-1" />Saved</Badge>}
            {hasChanges && <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">Unsaved changes</Badge>}
            <a
              href="/llms.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-700 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View Live
            </a>
          </div>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-base">File Content</CardTitle>
                <CardDescription className="mt-1 text-xs leading-relaxed">
                  This content is served at <code className="text-[11px] bg-slate-100 px-1 py-0.5 rounded">/llms.txt</code> and provides context to AI language models about your website. Use markdown-style formatting.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className="text-xs leading-relaxed font-mono border-slate-200 focus-visible:ring-sky-500/20 focus-visible:border-sky-400 resize-y"
              placeholder="# Your Site Name&#10;&#10;## About&#10;Description of your site..."
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 tabular-nums">{content.length.toLocaleString()} characters</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setContent(originalContent)} disabled={!hasChanges || saving} className="h-8 text-xs">
                  <RotateCcw className="w-3 h-3 mr-1.5" />Discard
                </Button>
                <Button size="sm" onClick={handleSave} disabled={!content.trim() || saving} className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white">
                  {saving ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Save className="w-3 h-3 mr-1.5" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
