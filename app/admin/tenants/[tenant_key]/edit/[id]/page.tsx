'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AdminShell } from '@/components/admin-shell';
import { TenantProvider, useTenant } from '@/components/tenant-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Eye, Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Type, Image as ImageIcon, List, Table, MessageSquare, FileText, Loader as Loader2, Globe, Sparkles, Activity, Shield, ChevronRight, Check, Lock } from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────── */

interface Section {
  type: 'text' | 'heading' | 'image' | 'table' | 'review' | 'list';
  heading?: string;
  content?: string;
  image_url?: string;
  image_caption?: string;
  items?: string[];
  table_headers?: string[];
  table_rows?: string[][];
  review_text?: string;
  reviewer_name?: string;
  reviewer_location?: string;
}

interface FAQ {
  q: string;
  a: string;
}

interface ArticleData {
  tenant: string;
  slug: string;
  title: string;
  excerpt: string;
  hero_image: string;
  category: string;
  author_name: string;
  author_role: string;
  author_avatar: string;
  read_time: string;
  sections: Section[];
  faqs: FAQ[];
  related_slugs: string[];
  meta_title: string;
  meta_description: string;
  status: string;
  published_at: string | null;
  show_toc: boolean;
  cta_heading: string;
  cta_description: string;
  cta_button_text: string;
  cta_success_message: string;
  cta_button_color: string;
  cta_redirect_url: string;
  cta_show_sidebar: boolean;
  cta_show_end: boolean;
  cta_inline_after_section: number;
}

const SECTION_TYPES = [
  { type: 'heading', label: 'Heading (H2)', icon: <Type className="w-4 h-4" /> },
  { type: 'text', label: 'Text Block', icon: <FileText className="w-4 h-4" /> },
  { type: 'image', label: 'Image', icon: <ImageIcon className="w-4 h-4" /> },
  { type: 'list', label: 'Bullet List', icon: <List className="w-4 h-4" /> },
  { type: 'table', label: 'Table', icon: <Table className="w-4 h-4" /> },
  { type: 'review', label: 'Review/Quote', icon: <MessageSquare className="w-4 h-4" /> },
] as const;

/* ─── Page Wrapper ───────────────────────────────────────── */
export default function TenantEditPage() {
  const params = useParams();
  const tenantKey = params.tenant_key as string;

  return (
    <AdminShell>
      <TenantProvider tenantKey={tenantKey}>
        <TenantArticleEditor />
      </TenantProvider>
    </AdminShell>
  );
}

/* ─── Editor Component ───────────────────────────────────── */
function TenantArticleEditor() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === 'new';
  const { tenantKey, tenant, loading: tenantLoading } = useTenant();

  const EMPTY_ARTICLE: ArticleData = {
    tenant: tenantKey,
    slug: '',
    title: '',
    excerpt: '',
    hero_image: '',
    category: '',
    author_name: '',
    author_role: '',
    author_avatar: '',
    read_time: '',
    sections: [],
    faqs: [],
    related_slugs: [],
    meta_title: '',
    meta_description: '',
    status: 'draft',
    published_at: null,
    show_toc: true,
    cta_heading: '',
    cta_description: '',
    cta_button_text: 'Subscribe',
    cta_success_message: 'Subscribed!',
    cta_button_color: '#1a2a4a',
    cta_redirect_url: '',
    cta_show_sidebar: true,
    cta_show_end: false,
    cta_inline_after_section: -1,
  };

  const [article, setArticle] = useState<ArticleData>(EMPTY_ARTICLE);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'sidebar' | 'cta' | 'meta' | 'related' | 'ai-writer' | 'benchmark'>('content');
  const [allArticles, setAllArticles] = useState<{ slug: string; title: string }[]>([]);

  useEffect(() => {
    if (!isNew) {
      supabase
        .from('gifaa_articles')
        .select('*')
        .eq('id', id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setArticle({
              tenant: data.tenant || tenantKey,
              slug: data.slug,
              title: data.title,
              excerpt: data.excerpt,
              hero_image: data.hero_image,
              category: data.category,
              author_name: data.author_name,
              author_role: data.author_role,
              author_avatar: data.author_avatar,
              read_time: data.read_time,
              sections: data.sections || [],
              faqs: data.faqs || [],
              related_slugs: data.related_slugs || [],
              meta_title: data.meta_title,
              meta_description: data.meta_description,
              status: data.status,
              published_at: data.published_at,
              show_toc: data.show_toc ?? true,
              cta_heading: data.cta_heading || '',
              cta_description: data.cta_description || '',
              cta_button_text: data.cta_button_text || 'Subscribe',
              cta_success_message: data.cta_success_message || 'Subscribed!',
              cta_button_color: data.cta_button_color || '#1a2a4a',
              cta_redirect_url: data.cta_redirect_url || '',
              cta_show_sidebar: data.cta_show_sidebar ?? true,
              cta_show_end: data.cta_show_end ?? false,
              cta_inline_after_section: data.cta_inline_after_section ?? -1,
            });
          }
          setLoading(false);
        });
    }
    supabase
      .from('gifaa_articles')
      .select('slug, title')
      .eq('tenant', tenantKey)
      .neq('id', isNew ? '00000000-0000-0000-0000-000000000000' : id)
      .then(({ data }) => setAllArticles(data || []));
  }, [id, isNew, tenantKey]);

  const update = useCallback((patch: Partial<ArticleData>) => {
    setArticle((prev) => ({ ...prev, ...patch }));
    setSaved(false);
  }, []);

  async function handleSave() {
    setSaving(true);
    const payload = {
      ...article,
      updated_at: new Date().toISOString(),
      published_at: (article.status === 'published' || article.status === 'approved') && !article.published_at ? new Date().toISOString() : article.published_at,
    };

    if (isNew) {
      const { data, error } = await supabase.from('gifaa_articles').insert(payload).select('id').maybeSingle();
      if (data && !error) {
        router.replace(`/admin/tenants/${tenantKey}/edit/${data.id}`);
      }
    } else {
      await supabase.from('gifaa_articles').update(payload).eq('id', id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function addSection(type: Section['type']) {
    const newSection: Section = { type };
    if (type === 'list') newSection.items = [''];
    if (type === 'table') { newSection.table_headers = ['Column 1', 'Column 2']; newSection.table_rows = [['', '']]; }
    update({ sections: [...article.sections, newSection] });
  }

  function updateSection(index: number, patch: Partial<Section>) {
    const sections = [...article.sections];
    sections[index] = { ...sections[index], ...patch };
    update({ sections });
  }

  function removeSection(index: number) {
    update({ sections: article.sections.filter((_, i) => i !== index) });
  }

  function moveSection(index: number, dir: -1 | 1) {
    const sections = [...article.sections];
    const target = index + dir;
    if (target < 0 || target >= sections.length) return;
    [sections[index], sections[target]] = [sections[target], sections[index]];
    update({ sections });
  }

  function addFaq() { update({ faqs: [...article.faqs, { q: '', a: '' }] }); }
  function updateFaq(index: number, patch: Partial<FAQ>) {
    const faqs = [...article.faqs]; faqs[index] = { ...faqs[index], ...patch }; update({ faqs });
  }
  function removeFaq(index: number) { update({ faqs: article.faqs.filter((_, i) => i !== index) }); }

  if (loading || tenantLoading) {
    return <div className="p-6 text-gray-400 text-sm">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/tenants/${tenantKey}`)} className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <h1 className="text-lg font-bold text-gray-900">{isNew ? 'New Article' : 'Edit Article'}</h1>
        </div>
        <div className="flex items-center gap-2">
          {article.slug && tenant && (
            <Button variant="outline" size="sm" onClick={() => window.open(`https://${tenant.public_domain}/articles/${article.slug}?preview=true`, '_blank')} className="gap-1.5">
              <Eye className="w-4 h-4" /> Preview
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
        {([
          { id: 'content', label: 'Content' },
          { id: 'sidebar', label: 'Sidebar' },
          { id: 'cta', label: 'CTA' },
          { id: 'meta', label: 'SEO & Meta' },
          { id: 'related', label: 'Related' },
          { id: 'ai-writer', label: 'AI Writer' },
          { id: 'benchmark', label: 'Benchmark' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Content Tab ─── */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Title</label>
              <Input value={article.title} onChange={(e) => update({ title: e.target.value })} placeholder="Article title" className="text-base" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Tenant</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <Lock className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm text-gray-700">{tenant?.site_name || tenantKey}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Slug</label>
              <Input value={article.slug} onChange={(e) => update({ slug: e.target.value })} placeholder="url-friendly-slug" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Category</label>
              <Input value={article.category} onChange={(e) => update({ category: e.target.value })} placeholder="e.g. Wedding, Baby Shower" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Excerpt</label>
              <textarea
                value={article.excerpt}
                onChange={(e) => update({ excerpt: e.target.value })}
                placeholder="Brief description shown on cards..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none h-20"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Hero Image URL</label>
              <Input value={article.hero_image} onChange={(e) => update({ hero_image: e.target.value })} placeholder="https://..." />
              {article.hero_image && (
                <img src={article.hero_image} alt="Preview" className="mt-2 h-32 w-full object-cover rounded-lg border border-gray-200" />
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Read Time</label>
              <Input value={article.read_time} onChange={(e) => update({ read_time: e.target.value })} placeholder="12 min read" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
              <select
                value={article.status}
                onChange={(e) => update({ status: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
              >
                <option value="draft">Draft</option>
                <option value="preview">Preview</option>
                <option value="published">Published (noindex)</option>
                <option value="approved">Approved (indexed)</option>
              </select>
              <p className="text-xs mt-1.5" style={{ color: article.status === 'draft' ? '#6b7280' : article.status === 'preview' ? '#d97706' : article.status === 'published' ? '#2563eb' : '#059669' }}>
                {article.status === 'draft' && 'Not visible to anyone. Save your work in progress.'}
                {article.status === 'preview' && 'Visible via preview link only. Not indexed.'}
                {article.status === 'published' && 'Live on tenant domain. Search engines blocked (noindex).'}
                {article.status === 'approved' && 'Live and indexed by search engines.'}
              </p>
            </div>
          </div>

          {/* Author */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Author</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input value={article.author_name} onChange={(e) => update({ author_name: e.target.value })} placeholder="Author name" />
              <Input value={article.author_role} onChange={(e) => update({ author_role: e.target.value })} placeholder="Role" />
              <Input value={article.author_avatar} onChange={(e) => update({ author_avatar: e.target.value })} placeholder="Avatar URL" />
            </div>
          </div>

          {/* Sections */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Sections</h3>
              <p className="text-xs text-gray-400">{article.sections.length} section{article.sections.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="space-y-3 mb-4">
              {article.sections.map((section, i) => (
                <SectionEditor key={i} section={section} index={i} total={article.sections.length} onUpdate={(patch) => updateSection(i, patch)} onRemove={() => removeSection(i)} onMove={(dir) => moveSection(i, dir)} />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {SECTION_TYPES.map((st) => (
                <Button key={st.type} variant="outline" size="sm" onClick={() => addSection(st.type)} className="gap-1.5 text-xs">
                  {st.icon} {st.label}
                </Button>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">FAQs</h3>
              <Button variant="outline" size="sm" onClick={addFaq} className="gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" /> Add FAQ
              </Button>
            </div>
            <div className="space-y-3">
              {article.faqs.map((faq, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input value={faq.q} onChange={(e) => updateFaq(i, { q: e.target.value })} placeholder="Question" className="text-sm flex-1" />
                    <Button variant="ghost" size="sm" onClick={() => removeFaq(i)} className="h-8 w-8 p-0 text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <textarea value={faq.a} onChange={(e) => updateFaq(i, { a: e.target.value })} placeholder="Answer" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none h-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Sidebar Tab ─── */}
      {activeTab === 'sidebar' && (
        <div className="space-y-6 max-w-xl">
          <p className="text-sm text-gray-500">Configure the sticky sidebar that appears alongside article content. The TOC is auto-generated from heading sections.</p>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={article.show_toc} onChange={(e) => update({ show_toc: e.target.checked })} className="rounded border-gray-300" />
              <span className="text-sm font-medium text-gray-900">Show Table of Contents sidebar</span>
            </label>
          </div>
          <p className="text-xs text-gray-400 -mt-4">TOC items are automatically generated from &quot;Heading (H2)&quot; sections in your content. Add heading sections to populate the nav.</p>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <p className="text-xs font-medium text-gray-600 mb-1">Sidebar preview</p>
            <p className="text-xs text-gray-400">
              The sidebar will show a &quot;On this page&quot; nav with {article.sections.filter(s => s.type === 'heading').length} heading item(s) plus FAQs link
              {article.cta_show_sidebar && article.cta_heading ? `, followed by a CTA titled "${article.cta_heading}"` : ' (sidebar CTA disabled or not configured)'}.
            </p>
          </div>
        </div>
      )}

      {/* ─── CTA Tab ─── */}
      {activeTab === 'cta' && <CtaTab article={article} update={update} />}

      {/* ─── Meta Tab ─── */}
      {activeTab === 'meta' && (
        <div className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Meta Title</label>
            <Input value={article.meta_title} onChange={(e) => update({ meta_title: e.target.value })} placeholder="SEO title (defaults to article title)" />
            <p className="text-xs text-gray-400 mt-1">{(article.meta_title || article.title).length}/60</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Meta Description</label>
            <textarea value={article.meta_description} onChange={(e) => update({ meta_description: e.target.value })} placeholder="SEO description (defaults to excerpt)" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none h-20" />
            <p className="text-xs text-gray-400 mt-1">{(article.meta_description || article.excerpt).length}/155</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Published Date</label>
            <Input type="datetime-local" value={article.published_at ? article.published_at.slice(0, 16) : ''} onChange={(e) => update({ published_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
          </div>
        </div>
      )}

      {/* ─── Related Tab ─── */}
      {activeTab === 'related' && (
        <div className="space-y-4 max-w-xl">
          <p className="text-sm text-gray-500">Link related articles that will appear in the &quot;Continue reading&quot; section. Select from published articles below.</p>
          {allArticles.length === 0 ? (
            <p className="text-sm text-gray-400 py-4">No other articles available yet.</p>
          ) : (
            <div className="space-y-2">
              {allArticles.map((a) => {
                const selected = article.related_slugs.includes(a.slug);
                return (
                  <label key={a.slug} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={selected} onChange={() => {
                      const slugs = selected ? article.related_slugs.filter((s) => s !== a.slug) : [...article.related_slugs, a.slug];
                      update({ related_slugs: slugs });
                    }} className="rounded border-gray-300" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{a.title || 'Untitled'}</p>
                      <p className="text-xs text-gray-400">/articles/{a.slug}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── AI Writer Tab ─── */}
      {activeTab === 'ai-writer' && (
        <AiWriterTab article={article} onApply={(generated) => {
          update({
            sections: generated.sections || article.sections,
            faqs: generated.faqs || article.faqs,
            excerpt: generated.excerpt || article.excerpt,
            read_time: generated.read_time || article.read_time,
            meta_title: generated.meta_title || article.meta_title,
            meta_description: generated.meta_description || article.meta_description,
          });
          setActiveTab('content');
        }} />
      )}

      {/* ─── Benchmark Tab ─── */}
      {activeTab === 'benchmark' && (
        <BenchmarkTab articleId={isNew ? null : id} article={article} />
      )}
    </div>
  );
}

/* ─── CTA Tab ──────────────────────────────────────────── */
function CtaTab({ article, update }: { article: ArticleData; update: (patch: Partial<ArticleData>) => void }) {
  const inlineEnabled = article.cta_inline_after_section >= 0;

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-base font-semibold text-gray-900">CTA Content</h3>
          <p className="text-sm text-gray-500 mt-0.5">Configure the call-to-action block shown to readers.</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Heading</label>
            <Input value={article.cta_heading} onChange={(e) => update({ cta_heading: e.target.value })} placeholder="e.g. Get our weekly gift guide" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
            <textarea value={article.cta_description} onChange={(e) => update({ cta_description: e.target.value })} placeholder="Short description to entice readers..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none h-20" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Button Text</label>
              <Input value={article.cta_button_text} onChange={(e) => update({ cta_button_text: e.target.value })} placeholder="Subscribe" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Success Message</label>
              <Input value={article.cta_success_message} onChange={(e) => update({ cta_success_message: e.target.value })} placeholder="Subscribed!" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Redirect URL (optional)</label>
            <Input value={article.cta_redirect_url} onChange={(e) => update({ cta_redirect_url: e.target.value })} placeholder="https://example.com/signup" />
            <p className="text-xs text-gray-400 mt-1">If set, the button links to this URL instead of showing an email form.</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-base font-semibold text-gray-900">Appearance</h3>
          <p className="text-sm text-gray-500 mt-0.5">Style the CTA button across all placements.</p>
        </div>
        <div className="p-6">
          <div className="flex items-end gap-6">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Button Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={article.cta_button_color} onChange={(e) => update({ cta_button_color: e.target.value })} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                <Input value={article.cta_button_color} onChange={(e) => update({ cta_button_color: e.target.value })} placeholder="#1a2a4a" className="max-w-[140px] font-mono text-sm" />
              </div>
            </div>
            <div className="pb-1">
              <p className="text-xs text-gray-500 mb-2">Preview</p>
              <button className="px-5 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm transition-transform hover:scale-105" style={{ backgroundColor: article.cta_button_color || '#1a2a4a' }}>
                {article.cta_button_text || 'Subscribe'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-base font-semibold text-gray-900">Placement</h3>
          <p className="text-sm text-gray-500 mt-0.5">Choose where the CTA appears on the article page.</p>
        </div>
        <div className="p-6 space-y-4">
          <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
            <input type="checkbox" checked={article.cta_show_sidebar} onChange={(e) => update({ cta_show_sidebar: e.target.checked })} className="mt-0.5 rounded border-gray-300" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">Left Sidebar</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-medium">Recommended</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Sticky CTA below the table of contents. Always visible as users scroll.</p>
            </div>
          </label>

          <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
            <input type="checkbox" checked={article.cta_show_end} onChange={(e) => update({ cta_show_end: e.target.checked })} className="mt-0.5 rounded border-gray-300" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">End of Article</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-sky-50 text-sky-700 rounded font-medium">High visibility</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Full-width CTA banner after the article content, before FAQs and related articles.</p>
            </div>
          </label>

          <div className={`p-4 border rounded-xl transition-colors ${inlineEnabled ? 'border-gray-300 bg-gray-50/50' : 'border-gray-200'}`}>
            <div className="flex items-start gap-4">
              <input type="checkbox" checked={inlineEnabled} onChange={(e) => update({ cta_inline_after_section: e.target.checked ? 0 : -1 })} className="mt-0.5 rounded border-gray-300 cursor-pointer" />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">Inline (between sections)</span>
                <p className="text-xs text-gray-500 mt-0.5">Insert a CTA block between article sections.</p>
              </div>
            </div>
            {inlineEnabled && (
              <div className="mt-4 ml-8">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Insert after section index</label>
                <select value={article.cta_inline_after_section} onChange={(e) => update({ cta_inline_after_section: Number(e.target.value) })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400">
                  {article.sections.map((s, i) => (
                    <option key={i} value={i}>After #{i + 1}: {s.type === 'heading' ? s.heading || 'Heading' : s.type === 'text' ? (s.content?.slice(0, 40) || 'Text block') : s.type}</option>
                  ))}
                  {article.sections.length === 0 && <option value={0}>No sections yet</option>}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {article.cta_heading && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-base font-semibold text-gray-900">Live Preview</h3>
          </div>
          <div className="p-6">
            <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: `${article.cta_button_color || '#1a2a4a'}08`, border: `1px solid ${article.cta_button_color || '#1a2a4a'}20` }}>
              <h4 className="text-xl font-bold text-gray-900 mb-2">{article.cta_heading}</h4>
              {article.cta_description && <p className="text-sm text-gray-600 mb-5 max-w-md mx-auto">{article.cta_description}</p>}
              {article.cta_redirect_url ? (
                <span className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white shadow-sm" style={{ backgroundColor: article.cta_button_color || '#1a2a4a' }}>
                  {article.cta_button_text || 'Subscribe'}
                </span>
              ) : (
                <div className="flex items-center gap-2 max-w-sm mx-auto">
                  <div className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-400 text-left bg-white">you@email.com</div>
                  <span className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: article.cta_button_color || '#1a2a4a' }}>{article.cta_button_text || 'Subscribe'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── AI Writer Tab ────────────────────────────────────── */
interface ScrapeResult {
  url: string;
  status: 'pending' | 'scraping' | 'cleaning' | 'done' | 'error';
  error?: string;
  textContent?: string;
  title?: string;
  wordCount?: number;
}

function AiWriterTab({ article, onApply }: { article: ArticleData; onApply: (generated: { sections?: Section[]; faqs?: FAQ[]; excerpt?: string; read_time?: string; meta_title?: string; meta_description?: string }) => void }) {
  const [urlInput, setUrlInput] = useState('');
  const [results, setResults] = useState<ScrapeResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<any>(null);

  const stats = {
    total: results.length,
    processed: results.filter(r => r.status === 'done' || r.status === 'error').length,
    success: results.filter(r => r.status === 'done').length,
    failed: results.filter(r => r.status === 'error').length,
    words: results.reduce((sum, r) => sum + (r.wordCount || 0), 0),
  };

  const combinedText = results.filter(r => r.status === 'done' && r.textContent).map(r => r.textContent!).join('\n\n---\n\n');
  const cleanReady = combinedText.trim().length > 0;
  const canGenerate = !generating && Boolean(article.title.trim()) && cleanReady;

  function parseUrls(): string[] {
    return urlInput.split(/[\n,]+/).map(u => u.trim()).filter(u => u.length > 0 && (u.startsWith('http://') || u.startsWith('https://'))).slice(0, 10);
  }

  async function scrapeAndCleanUrl(targetUrl: string, index: number) {
    setResults(prev => { const copy = [...prev]; copy[index] = { ...copy[index], status: 'scraping' }; return copy; });
    let html = '';
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/scrape-raw-html`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Scrape failed (${res.status})`);
      html = data.html || '';
      if (!html) throw new Error('Empty response');
    } catch (err: any) {
      setResults(prev => { const copy = [...prev]; copy[index] = { ...copy[index], status: 'error', error: `Scrape: ${err.message}` }; return copy; });
      return;
    }

    setResults(prev => { const copy = [...prev]; copy[index] = { ...copy[index], status: 'cleaning' }; return copy; });
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/clean-html`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, url: targetUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Clean failed (${res.status})`);
      const text = data.textContent || '';
      const words = text.split(/\s+/).filter(Boolean).length;
      setResults(prev => { const copy = [...prev]; copy[index] = { ...copy[index], status: 'done', textContent: text, title: data.title || '', wordCount: words }; return copy; });
    } catch (err: any) {
      setResults(prev => { const copy = [...prev]; copy[index] = { ...copy[index], status: 'error', error: `Clean: ${err.message}` }; return copy; });
    }
  }

  async function handleProcessAll() {
    const urls = parseUrls();
    if (urls.length === 0) { setError('Enter at least one valid URL (starting with http:// or https://).'); return; }
    setError(''); setPreview(null); setProcessing(true);
    const initial: ScrapeResult[] = urls.map(u => ({ url: u, status: 'pending' }));
    setResults(initial);
    const BATCH_SIZE = 3;
    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      const batch = urls.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map((u, bi) => scrapeAndCleanUrl(u, i + bi)));
    }
    setProcessing(false);
  }

  async function handleGenerate() {
    if (!article.title.trim()) { setError('Please set an article title in the Content tab first.'); return; }
    if (!cleanReady) { setError('Process URLs first to get content for generation.'); return; }
    setGenerating(true); setError(''); setPreview(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-gifaa-article`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: article.title, context_dump: combinedText.slice(0, 60000) }),
      });
      const data = await res.json();
      if (!res.ok) { if (res.status === 429) { setError(`Rate limited. Please wait ${data.retry_after || 60}s and try again.`); } else { setError(data.error || `Failed (${res.status})`); } return; }
      setPreview(data);
    } catch (err: any) { setError(err.message || 'Network error'); } finally { setGenerating(false); }
  }

  const urlCount = parseUrls().length;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">AI Content Writer</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">Scrape up to 10 source URLs, extract clean text via Mozilla Readability, then generate an original article from the combined context.</p>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Article Title (from Content tab)</label>
            <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
              {article.title || <span className="text-gray-400 italic">No title set</span>}
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/40">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-bold">1</span>
              <span className="text-sm font-semibold text-gray-900">Source URLs</span>
              {stats.success > 0 && <Check className="w-4 h-4 text-green-600" />}
            </div>
            <textarea value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder={"Paste URLs (one per line or comma-separated, up to 10):\nhttps://example.com/article-1\nhttps://example.com/article-2"} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none h-28 font-mono placeholder-gray-400" disabled={processing} />
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-gray-400">{urlCount === 0 ? 'No valid URLs detected' : `${urlCount} valid URL${urlCount !== 1 ? 's' : ''} detected (max 10)`}</p>
              <Button onClick={handleProcessAll} disabled={processing || urlCount === 0} className="gap-2">
                {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Globe className="w-4 h-4" /> Scrape & Clean All</>}
              </Button>
            </div>
          </div>

          {results.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-4 divide-x divide-gray-200 bg-gray-50 border-b border-gray-200">
                <div className="px-4 py-3 text-center"><p className="text-lg font-bold text-gray-900">{stats.processed}/{stats.total}</p><p className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">Processed</p></div>
                <div className="px-4 py-3 text-center"><p className="text-lg font-bold text-green-600">{stats.success}</p><p className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">Success</p></div>
                <div className="px-4 py-3 text-center"><p className="text-lg font-bold text-red-600">{stats.failed}</p><p className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">Failed</p></div>
                <div className="px-4 py-3 text-center"><p className="text-lg font-bold text-sky-600">{stats.words.toLocaleString()}</p><p className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">Words</p></div>
              </div>
              <div className="divide-y divide-gray-100 max-h-[280px] overflow-y-auto">
                {results.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="shrink-0">
                      {r.status === 'done' && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                      {r.status === 'error' && <div className="w-2.5 h-2.5 rounded-full bg-red-500" />}
                      {r.status === 'pending' && <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />}
                      {(r.status === 'scraping' || r.status === 'cleaning') && <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-800 font-mono truncate">{r.url}</p>
                      {r.status === 'done' && r.title && <p className="text-[11px] text-gray-500 truncate mt-0.5">{r.title} — {r.wordCount?.toLocaleString()} words</p>}
                      {r.status === 'error' && <p className="text-[11px] text-red-600 mt-0.5">{r.error}</p>}
                      {r.status === 'scraping' && <p className="text-[11px] text-sky-600 mt-0.5">Scraping page...</p>}
                      {r.status === 'cleaning' && <p className="text-[11px] text-sky-600 mt-0.5">Cleaning with Readability...</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/40">
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${cleanReady ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'}`}>2</span>
              <span className="text-sm font-semibold text-gray-900">Generate Article</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">{cleanReady ? `Ready to generate from ${stats.success} source${stats.success !== 1 ? 's' : ''} (${stats.words.toLocaleString()} words of context).` : 'Process URLs above to collect source content for generation.'}</p>
            <Button onClick={handleGenerate} disabled={!canGenerate} className="gap-2">
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Article Content</>}
            </Button>
          </div>

          {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
        </div>
      </div>

      {preview && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Generated Content Preview</h3>
            <Button onClick={() => onApply(preview)} className="gap-2"><Save className="w-4 h-4" /> Apply to Article</Button>
          </div>
          {preview.excerpt && <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs font-medium text-gray-500 mb-1">Excerpt</p><p className="text-sm text-gray-700">{preview.excerpt}</p></div>}
          {preview.meta_title && <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs font-medium text-gray-500 mb-1">Meta Title</p><p className="text-sm text-gray-700">{preview.meta_title}</p></div>}
          {preview.sections && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Sections ({preview.sections.length})</p>
              <div className="space-y-2 max-h-[400px] overflow-y-auto border border-gray-100 rounded-lg p-3">
                {preview.sections.map((s: Section, i: number) => (
                  <div key={i} className="flex items-start gap-2 py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-mono shrink-0">{s.type}</span>
                    <span className="text-sm text-gray-700 truncate">{s.heading || s.content?.slice(0, 80) || s.review_text?.slice(0, 80) || s.image_caption || (s.items ? `${s.items.length} items` : '...')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {preview.faqs && preview.faqs.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">FAQs ({preview.faqs.length})</p>
              <div className="space-y-1">{preview.faqs.map((f: FAQ, i: number) => <p key={i} className="text-sm text-gray-600 truncate">Q: {f.q}</p>)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Benchmark Tab ─────────────────────────────────────── */
function BenchmarkTab({ articleId, article }: { articleId: string | null; article: ArticleData }) {
  const { tenant } = useTenant();
  const [lighthouseLoading, setLighthouseLoading] = useState(false);
  const [lighthouseResult, setLighthouseResult] = useState<any>(null);
  const [lighthouseExpanded, setLighthouseExpanded] = useState(false);
  const [eeatLoading, setEeatLoading] = useState(false);
  const [eeatResult, setEeatResult] = useState<any>(null);
  const [eeatExpanded, setEeatExpanded] = useState(false);
  const [error, setError] = useState('');

  const canBenchmark = articleId && ['preview', 'published', 'approved'].includes(article.status);
  const pageUrl = tenant ? `https://${tenant.public_domain}/articles/${article.slug}` : '';

  useEffect(() => {
    if (!articleId) return;
    supabase.from('lighthouse_scores').select('*').eq('page_id', articleId).eq('strategy', 'mobile').maybeSingle().then(({ data }) => { if (data) setLighthouseResult(data); });
    supabase.from('eeat_scores').select('*').eq('page_id', articleId).maybeSingle().then(({ data }) => { if (data) setEeatResult(data); });
  }, [articleId]);

  async function runLighthouse() {
    if (!articleId || !tenant) return;
    setLighthouseLoading(true); setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/run-lighthouse`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_id: articleId, slug: `articles/${article.slug}`, base_url: `https://${tenant.public_domain}`, strategy: 'mobile' }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || `Lighthouse failed (${res.status})`); } else { setLighthouseResult(data); }
    } catch (err: any) { setError(err.message); } finally { setLighthouseLoading(false); }
  }

  async function runEeat() {
    if (!articleId) return;
    setEeatLoading(true); setError('');
    try {
      const contentParts: string[] = [];
      for (const s of article.sections) {
        if (s.heading) contentParts.push(`## ${s.heading}`);
        if (s.content) contentParts.push(s.content);
        if (s.items) contentParts.push(s.items.map((i) => `- ${i}`).join('\n'));
        if (s.review_text) contentParts.push(`"${s.review_text}" — ${s.reviewer_name || ''}`);
      }
      for (const f of article.faqs) { contentParts.push(`Q: ${f.q}\nA: ${f.a}`); }
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/run-eeat`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_id: articleId, title: article.title, content: contentParts.join('\n\n'), meta_description: article.meta_description || article.excerpt, focus_keyword: article.category }),
      });
      const data = await res.json();
      if (!res.ok) { if (res.status === 429) { setError(`Rate limited. Wait ${data.retry_after || 60}s.`); } else { setError(data.error || `EEAT failed (${res.status})`); } } else { setEeatResult(data); }
    } catch (err: any) { setError(err.message); } finally { setEeatLoading(false); }
  }

  function scoreColor(score: number, max: number) {
    const pct = score / max;
    if (pct >= 0.9) return 'text-green-600 bg-green-50 border-green-200';
    if (pct >= 0.5) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  }

  if (!canBenchmark) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
        <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500 mb-1">Benchmark unavailable</p>
        <p className="text-xs text-gray-400">Save the article and set status to Preview, Published, or Approved to run benchmarks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
      {pageUrl && (
        <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-xs text-gray-500 truncate">{pageUrl}</span>
        </div>
      )}

      {/* Lighthouse */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Lighthouse (Mobile)</h3>
              {lighthouseResult?.fetched_at && <p className="text-[11px] text-gray-400 mt-0.5">Last scan: {new Date(lighthouseResult.fetched_at).toLocaleString()}</p>}
            </div>
          </div>
          <Button onClick={runLighthouse} disabled={lighthouseLoading} size="sm" variant="outline" className="gap-1.5">
            {lighthouseLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
            {lighthouseResult ? 'Rescan' : 'Run Scan'}
          </Button>
        </div>
        {lighthouseResult && (
          <>
            <div className="px-5 pb-4 grid grid-cols-4 gap-3">
              {[{ key: 'performance', label: 'Performance' }, { key: 'accessibility', label: 'Accessibility' }, { key: 'best_practices', label: 'Best Practices' }, { key: 'seo', label: 'SEO' }].map(({ key, label }) => {
                const score = lighthouseResult[key];
                return (
                  <div key={key} className={`text-center p-3 rounded-lg border ${score != null ? scoreColor(score, 100) : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    <p className="text-2xl font-bold">{score ?? '—'}</p>
                    <p className="text-[10px] mt-0.5 opacity-75">{label}</p>
                  </div>
                );
              })}
            </div>
            {lighthouseResult.raw_report?.key_audits && (
              <div className="border-t border-gray-100">
                <button onClick={() => setLighthouseExpanded(!lighthouseExpanded)} className="w-full px-5 py-3 flex items-center justify-between text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <span>Detailed Audits ({Object.keys(lighthouseResult.raw_report.key_audits).length})</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${lighthouseExpanded ? 'rotate-180' : ''}`} />
                </button>
                {lighthouseExpanded && (
                  <div className="px-5 pb-4 space-y-1.5">
                    {Object.entries(lighthouseResult.raw_report.key_audits).map(([auditId, audit]: [string, any]) => (
                      <div key={auditId} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${audit.score === null ? 'bg-gray-300' : audit.score >= 0.9 ? 'bg-green-500' : audit.score >= 0.5 ? 'bg-amber-500' : 'bg-red-500'}`} />
                          <span className="text-xs text-gray-700 truncate">{audit.title}</span>
                        </div>
                        {audit.displayValue && <span className="text-xs text-gray-500 shrink-0 ml-2">{audit.displayValue}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* E-E-A-T */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">E-E-A-T Score</h3>
              {eeatResult?.analyzed_at && <p className="text-[11px] text-gray-400 mt-0.5">Last analysis: {new Date(eeatResult.analyzed_at).toLocaleString()}</p>}
            </div>
          </div>
          <Button onClick={runEeat} disabled={eeatLoading} size="sm" variant="outline" className="gap-1.5">
            {eeatLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
            {eeatResult ? 'Re-analyze' : 'Analyze'}
          </Button>
        </div>
        {eeatResult && (
          <>
            <div className="px-5 pb-4">
              <div className="flex items-center gap-5 mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${scoreColor(eeatResult.overall_score, 100)}`}>
                  <span className="text-xl font-bold">{eeatResult.overall_score}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                  {[{ key: 'experience_score', label: 'Experience' }, { key: 'expertise_score', label: 'Expertise' }, { key: 'authoritativeness_score', label: 'Authority' }, { key: 'trustworthiness_score', label: 'Trust' }].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-16">{label}</span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full w-20">
                        <div className={`h-full rounded-full ${eeatResult[key] >= 20 ? 'bg-green-500' : eeatResult[key] >= 13 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${(eeatResult[key] / 25) * 100}%` }} />
                      </div>
                      <span className="text-xs font-medium text-gray-700 w-7 text-right">{eeatResult[key]}/25</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100">
              <button onClick={() => setEeatExpanded(!eeatExpanded)} className="w-full px-5 py-3 flex items-center justify-between text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <span>Detailed Report</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${eeatExpanded ? 'rotate-180' : ''}`} />
              </button>
              {eeatExpanded && (
                <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {eeatResult.strengths?.length > 0 && (
                    <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                      <p className="text-xs font-semibold text-green-800 mb-2">Strengths</p>
                      <ul className="space-y-1">{eeatResult.strengths.map((s: string, i: number) => <li key={i} className="text-xs text-green-700 flex items-start gap-1.5"><ChevronRight className="w-3 h-3 shrink-0 mt-0.5" /><span>{s}</span></li>)}</ul>
                    </div>
                  )}
                  {eeatResult.weaknesses?.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                      <p className="text-xs font-semibold text-red-800 mb-2">Weaknesses</p>
                      <ul className="space-y-1">{eeatResult.weaknesses.map((s: string, i: number) => <li key={i} className="text-xs text-red-700 flex items-start gap-1.5"><ChevronRight className="w-3 h-3 shrink-0 mt-0.5" /><span>{s}</span></li>)}</ul>
                    </div>
                  )}
                  {eeatResult.missing_signals?.length > 0 && (
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                      <p className="text-xs font-semibold text-amber-800 mb-2">Missing Signals</p>
                      <ul className="space-y-1">{eeatResult.missing_signals.map((s: string, i: number) => <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5"><ChevronRight className="w-3 h-3 shrink-0 mt-0.5" /><span>{s}</span></li>)}</ul>
                    </div>
                  )}
                  {eeatResult.improvements?.length > 0 && (
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <p className="text-xs font-semibold text-blue-800 mb-2">Improvements</p>
                      <ul className="space-y-1">{eeatResult.improvements.map((s: string, i: number) => <li key={i} className="text-xs text-blue-700 flex items-start gap-1.5"><ChevronRight className="w-3 h-3 shrink-0 mt-0.5" /><span>{s}</span></li>)}</ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Section Editor Component ───────────────────────────── */
function SectionEditor({ section, index, total, onUpdate, onRemove, onMove }: { section: Section; index: number; total: number; onUpdate: (patch: Partial<Section>) => void; onRemove: () => void; onMove: (dir: -1 | 1) => void }) {
  const typeLabel = SECTION_TYPES.find((t) => t.type === section.type)?.label || section.type;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
        <GripVertical className="w-4 h-4 text-gray-300" />
        <span className="text-xs font-medium text-gray-600 flex-1">{typeLabel}</span>
        <button onClick={() => onMove(-1)} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronUp className="w-3.5 h-3.5" /></button>
        <button onClick={() => onMove(1)} disabled={index === total - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronDown className="w-3.5 h-3.5" /></button>
        <button onClick={onRemove} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
      <div className="p-3 space-y-2">
        {section.type === 'heading' && <Input value={section.heading || ''} onChange={(e) => onUpdate({ heading: e.target.value })} placeholder="Section heading" />}
        {section.type === 'text' && (
          <>
            <Input value={section.heading || ''} onChange={(e) => onUpdate({ heading: e.target.value })} placeholder="Subheading (optional)" />
            <textarea value={section.content || ''} onChange={(e) => onUpdate({ content: e.target.value })} placeholder="Paragraph content..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-y min-h-[80px]" />
          </>
        )}
        {section.type === 'image' && (
          <>
            <Input value={section.image_url || ''} onChange={(e) => onUpdate({ image_url: e.target.value })} placeholder="Image URL" />
            <Input value={section.image_caption || ''} onChange={(e) => onUpdate({ image_caption: e.target.value })} placeholder="Caption (optional)" />
            {section.image_url && <img src={section.image_url} alt="Preview" className="h-24 w-full object-cover rounded-lg border" />}
          </>
        )}
        {section.type === 'list' && (
          <>
            <Input value={section.heading || ''} onChange={(e) => onUpdate({ heading: e.target.value })} placeholder="List heading (optional)" />
            <div className="space-y-1.5">
              {(section.items || []).map((item, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={item} onChange={(e) => { const items = [...(section.items || [])]; items[i] = e.target.value; onUpdate({ items }); }} placeholder={`Item ${i + 1}`} className="flex-1" />
                  <Button variant="ghost" size="sm" onClick={() => { const items = (section.items || []).filter((_, idx) => idx !== i); onUpdate({ items }); }} className="h-9 w-9 p-0 text-red-400"><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => onUpdate({ items: [...(section.items || []), ''] })} className="gap-1 text-xs text-gray-500"><Plus className="w-3.5 h-3.5" /> Add item</Button>
            </div>
          </>
        )}
        {section.type === 'table' && <TableEditor section={section} onUpdate={onUpdate} />}
        {section.type === 'review' && (
          <>
            <textarea value={section.review_text || ''} onChange={(e) => onUpdate({ review_text: e.target.value })} placeholder="Review or quote text..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none h-16" />
            <div className="grid grid-cols-2 gap-2">
              <Input value={section.reviewer_name || ''} onChange={(e) => onUpdate({ reviewer_name: e.target.value })} placeholder="Reviewer name" />
              <Input value={section.reviewer_location || ''} onChange={(e) => onUpdate({ reviewer_location: e.target.value })} placeholder="Location" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Table Editor ───────────────────────────────────────── */
function TableEditor({ section, onUpdate }: { section: Section; onUpdate: (patch: Partial<Section>) => void }) {
  const headers = section.table_headers || ['Col 1', 'Col 2'];
  const rows = section.table_rows || [['', '']];

  function updateHeader(i: number, val: string) { const h = [...headers]; h[i] = val; onUpdate({ table_headers: h }); }
  function updateCell(ri: number, ci: number, val: string) { const r = rows.map((row) => [...row]); r[ri][ci] = val; onUpdate({ table_rows: r }); }
  function addColumn() { onUpdate({ table_headers: [...headers, `Col ${headers.length + 1}`], table_rows: rows.map((row) => [...row, '']) }); }
  function addRow() { onUpdate({ table_rows: [...rows, headers.map(() => '')] }); }
  function removeRow(ri: number) { onUpdate({ table_rows: rows.filter((_, i) => i !== ri) }); }
  function removeColumn(ci: number) { onUpdate({ table_headers: headers.filter((_, i) => i !== ci), table_rows: rows.map((row) => row.filter((_, i) => i !== ci)) }); }

  return (
    <div className="space-y-2">
      <Input value={section.heading || ''} onChange={(e) => onUpdate({ heading: e.target.value })} placeholder="Table heading (optional)" />
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50">
              {headers.map((h, i) => (
                <th key={i} className="p-1.5 border-b border-r border-gray-200 last:border-r-0">
                  <div className="flex items-center gap-1">
                    <input value={h} onChange={(e) => updateHeader(i, e.target.value)} className="flex-1 px-1.5 py-1 text-xs font-medium border border-transparent focus:border-gray-300 rounded focus:outline-none" />
                    {headers.length > 1 && <button onClick={() => removeColumn(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>}
                  </div>
                </th>
              ))}
              <th className="p-1 w-8" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-b border-gray-100 last:border-0">
                {row.map((cell, ci) => (
                  <td key={ci} className="p-1 border-r border-gray-100 last:border-r-0">
                    <input value={cell} onChange={(e) => updateCell(ri, ci, e.target.value)} className="w-full px-1.5 py-1 text-xs border border-transparent focus:border-gray-300 rounded focus:outline-none" placeholder="..." />
                  </td>
                ))}
                <td className="p-1 w-8">{rows.length > 1 && <button onClick={() => removeRow(ri)} className="text-red-400 hover:text-red-600 p-0.5"><Trash2 className="w-3 h-3" /></button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={addRow} className="text-xs gap-1"><Plus className="w-3 h-3" /> Row</Button>
        <Button variant="ghost" size="sm" onClick={addColumn} className="text-xs gap-1"><Plus className="w-3 h-3" /> Column</Button>
      </div>
    </div>
  );
}
