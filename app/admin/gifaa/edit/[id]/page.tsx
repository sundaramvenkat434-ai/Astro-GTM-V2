'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AdminShell } from '@/components/admin-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, Save, Eye, Plus, Trash2, GripVertical,
  ChevronDown, ChevronUp, Type, Image as ImageIcon,
  List, Table, MessageSquare, FileText, Loader as Loader2, Globe,
} from 'lucide-react';

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
  reviewer_name?: string;
  reviewer_location?: string;
  review_text?: string;
  rating?: number;
}

interface FAQ {
  q: string;
  a: string;
}

interface ArticleData {
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
}

const EMPTY_ARTICLE: ArticleData = {
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
};

const SECTION_TYPES = [
  { type: 'heading', label: 'Heading (H2)', icon: <Type className="w-4 h-4" /> },
  { type: 'text', label: 'Text Block', icon: <FileText className="w-4 h-4" /> },
  { type: 'image', label: 'Image', icon: <ImageIcon className="w-4 h-4" /> },
  { type: 'list', label: 'Bullet List', icon: <List className="w-4 h-4" /> },
  { type: 'table', label: 'Table', icon: <Table className="w-4 h-4" /> },
  { type: 'review', label: 'Review/Quote', icon: <MessageSquare className="w-4 h-4" /> },
] as const;

/* ─── Page Wrapper ───────────────────────────────────────── */
export default function AdminGifaaEditPage() {
  return (
    <AdminShell>
      <GifaaEditor />
    </AdminShell>
  );
}

/* ─── Editor Component ───────────────────────────────────── */
function GifaaEditor() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === 'new';

  const [article, setArticle] = useState<ArticleData>(EMPTY_ARTICLE);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'meta' | 'related'>('content');
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
            });
          }
          setLoading(false);
        });
    }
    supabase
      .from('gifaa_articles')
      .select('slug, title')
      .neq('id', isNew ? '00000000-0000-0000-0000-000000000000' : id)
      .then(({ data }) => setAllArticles(data || []));
  }, [id, isNew]);

  const update = useCallback((patch: Partial<ArticleData>) => {
    setArticle((prev) => ({ ...prev, ...patch }));
    setSaved(false);
  }, []);

  async function handleSave() {
    setSaving(true);
    const payload = {
      ...article,
      updated_at: new Date().toISOString(),
      published_at: article.status === 'published' && !article.published_at ? new Date().toISOString() : article.published_at,
    };

    if (isNew) {
      const { data, error } = await supabase.from('gifaa_articles').insert(payload).select('id').maybeSingle();
      if (data && !error) {
        router.replace(`/admin/gifaa/edit/${data.id}`);
      }
    } else {
      await supabase.from('gifaa_articles').update(payload).eq('id', id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  /* Section helpers */
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

  /* FAQ helpers */
  function addFaq() {
    update({ faqs: [...article.faqs, { q: '', a: '' }] });
  }

  function updateFaq(index: number, patch: Partial<FAQ>) {
    const faqs = [...article.faqs];
    faqs[index] = { ...faqs[index], ...patch };
    update({ faqs });
  }

  function removeFaq(index: number) {
    update({ faqs: article.faqs.filter((_, i) => i !== index) });
  }

  if (loading) {
    return <div className="p-6 text-gray-400 text-sm">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/gifaa')} className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <h1 className="text-lg font-bold text-gray-900">{isNew ? 'New Article' : 'Edit Article'}</h1>
        </div>
        <div className="flex items-center gap-2">
          {article.slug && (
            <Button variant="outline" size="sm" onClick={() => window.open(`/articles/${article.slug}`, '_blank')} className="gap-1.5">
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
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {(['content', 'meta', 'related'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'content' ? 'Content' : tab === 'meta' ? 'SEO & Meta' : 'Related'}
          </button>
        ))}
      </div>

      {/* ─── Content Tab ─── */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Basic Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Title</label>
              <Input value={article.title} onChange={(e) => update({ title: e.target.value })} placeholder="Article title" className="text-base" />
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
                <option value="published">Published</option>
              </select>
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
                <SectionEditor
                  key={i}
                  section={section}
                  index={i}
                  total={article.sections.length}
                  onUpdate={(patch) => updateSection(i, patch)}
                  onRemove={() => removeSection(i)}
                  onMove={(dir) => moveSection(i, dir)}
                />
              ))}
            </div>

            {/* Add Section Buttons */}
            <div className="flex flex-wrap gap-2">
              {SECTION_TYPES.map((st) => (
                <Button
                  key={st.type}
                  variant="outline"
                  size="sm"
                  onClick={() => addSection(st.type)}
                  className="gap-1.5 text-xs"
                >
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
                  <textarea
                    value={faq.a}
                    onChange={(e) => updateFaq(i, { a: e.target.value })}
                    placeholder="Answer"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none h-16"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
            <textarea
              value={article.meta_description}
              onChange={(e) => update({ meta_description: e.target.value })}
              placeholder="SEO description (defaults to excerpt)"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none h-20"
            />
            <p className="text-xs text-gray-400 mt-1">{(article.meta_description || article.excerpt).length}/155</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Published Date</label>
            <Input
              type="datetime-local"
              value={article.published_at ? article.published_at.slice(0, 16) : ''}
              onChange={(e) => update({ published_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
            />
          </div>
        </div>
      )}

      {/* ─── Related Tab ─── */}
      {activeTab === 'related' && (
        <div className="space-y-4 max-w-xl">
          <p className="text-sm text-gray-500">
            Link related articles that will appear in the &quot;Continue reading&quot; section. Select from published articles below.
          </p>
          {allArticles.length === 0 ? (
            <p className="text-sm text-gray-400 py-4">No other articles available yet.</p>
          ) : (
            <div className="space-y-2">
              {allArticles.map((a) => {
                const selected = article.related_slugs.includes(a.slug);
                return (
                  <label key={a.slug} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => {
                        const slugs = selected
                          ? article.related_slugs.filter((s) => s !== a.slug)
                          : [...article.related_slugs, a.slug];
                        update({ related_slugs: slugs });
                      }}
                      className="rounded border-gray-300"
                    />
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
    </div>
  );
}

/* ─── Section Editor Component ───────────────────────────── */
function SectionEditor({
  section,
  index,
  total,
  onUpdate,
  onRemove,
  onMove,
}: {
  section: Section;
  index: number;
  total: number;
  onUpdate: (patch: Partial<Section>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const typeLabel = SECTION_TYPES.find((t) => t.type === section.type)?.label || section.type;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
        <GripVertical className="w-4 h-4 text-gray-300" />
        <span className="text-xs font-medium text-gray-600 flex-1">{typeLabel}</span>
        <button onClick={() => onMove(-1)} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onMove(1)} disabled={index === total - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button onClick={onRemove} className="p-1 text-red-400 hover:text-red-600">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Section Body */}
      <div className="p-3 space-y-2">
        {section.type === 'heading' && (
          <Input value={section.heading || ''} onChange={(e) => onUpdate({ heading: e.target.value })} placeholder="Section heading" />
        )}

        {section.type === 'text' && (
          <>
            <Input value={section.heading || ''} onChange={(e) => onUpdate({ heading: e.target.value })} placeholder="Subheading (optional)" />
            <textarea
              value={section.content || ''}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="Paragraph content..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-y min-h-[80px]"
            />
          </>
        )}

        {section.type === 'image' && (
          <>
            <Input value={section.image_url || ''} onChange={(e) => onUpdate({ image_url: e.target.value })} placeholder="Image URL" />
            <Input value={section.image_caption || ''} onChange={(e) => onUpdate({ image_caption: e.target.value })} placeholder="Caption (optional)" />
            {section.image_url && (
              <img src={section.image_url} alt="Preview" className="h-24 w-full object-cover rounded-lg border" />
            )}
          </>
        )}

        {section.type === 'list' && (
          <>
            <Input value={section.heading || ''} onChange={(e) => onUpdate({ heading: e.target.value })} placeholder="List heading (optional)" />
            <div className="space-y-1.5">
              {(section.items || []).map((item, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => {
                      const items = [...(section.items || [])];
                      items[i] = e.target.value;
                      onUpdate({ items });
                    }}
                    placeholder={`Item ${i + 1}`}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const items = (section.items || []).filter((_, idx) => idx !== i);
                      onUpdate({ items });
                    }}
                    className="h-9 w-9 p-0 text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdate({ items: [...(section.items || []), ''] })}
                className="gap-1 text-xs text-gray-500"
              >
                <Plus className="w-3.5 h-3.5" /> Add item
              </Button>
            </div>
          </>
        )}

        {section.type === 'table' && (
          <TableEditor section={section} onUpdate={onUpdate} />
        )}

        {section.type === 'review' && (
          <>
            <textarea
              value={section.review_text || ''}
              onChange={(e) => onUpdate({ review_text: e.target.value })}
              placeholder="Review or quote text..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none h-16"
            />
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

  function updateHeader(i: number, val: string) {
    const h = [...headers];
    h[i] = val;
    onUpdate({ table_headers: h });
  }

  function updateCell(ri: number, ci: number, val: string) {
    const r = rows.map((row) => [...row]);
    r[ri][ci] = val;
    onUpdate({ table_rows: r });
  }

  function addColumn() {
    const h = [...headers, `Col ${headers.length + 1}`];
    const r = rows.map((row) => [...row, '']);
    onUpdate({ table_headers: h, table_rows: r });
  }

  function addRow() {
    const r = [...rows, headers.map(() => '')];
    onUpdate({ table_rows: r });
  }

  function removeRow(ri: number) {
    onUpdate({ table_rows: rows.filter((_, i) => i !== ri) });
  }

  function removeColumn(ci: number) {
    const h = headers.filter((_, i) => i !== ci);
    const r = rows.map((row) => row.filter((_, i) => i !== ci));
    onUpdate({ table_headers: h, table_rows: r });
  }

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
                    <input
                      value={h}
                      onChange={(e) => updateHeader(i, e.target.value)}
                      className="flex-1 px-1.5 py-1 text-xs font-medium border border-transparent focus:border-gray-300 rounded focus:outline-none"
                    />
                    {headers.length > 1 && (
                      <button onClick={() => removeColumn(i)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
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
                    <input
                      value={cell}
                      onChange={(e) => updateCell(ri, ci, e.target.value)}
                      className="w-full px-1.5 py-1 text-xs border border-transparent focus:border-gray-300 rounded focus:outline-none"
                      placeholder="..."
                    />
                  </td>
                ))}
                <td className="p-1 w-8">
                  {rows.length > 1 && (
                    <button onClick={() => removeRow(ri)} className="text-red-400 hover:text-red-600 p-0.5">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={addRow} className="text-xs gap-1">
          <Plus className="w-3 h-3" /> Row
        </Button>
        <Button variant="ghost" size="sm" onClick={addColumn} className="text-xs gap-1">
          <Plus className="w-3 h-3" /> Column
        </Button>
      </div>
    </div>
  );
}
