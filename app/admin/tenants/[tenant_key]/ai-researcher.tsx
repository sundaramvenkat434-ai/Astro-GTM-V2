'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Globe, Upload, FileText, X, Check, Loader as Loader2, Target, Users, Package, Search, Lightbulb, Brain, Link2, Swords, Key, LayoutList, Pencil, Trash2, Plus, ArrowRight, ChartBar as BarChart3, Info, Download, RefreshCw, TrendingUp } from 'lucide-react';

type AIResearcherSubTab = 'brand' | 'competitors' | 'keywords' | 'page-ideas' | 'interlinking';

const SUB_TABS: { key: AIResearcherSubTab; label: string; icon: React.ReactNode }[] = [
  { key: 'brand', label: 'Brand', icon: <Brain className="w-4 h-4" /> },
  { key: 'competitors', label: 'Competitors', icon: <Swords className="w-4 h-4" /> },
  { key: 'keywords', label: 'Keywords', icon: <Key className="w-4 h-4" /> },
  { key: 'page-ideas', label: 'Page Ideas', icon: <LayoutList className="w-4 h-4" /> },
  { key: 'interlinking', label: 'Interlinking', icon: <Link2 className="w-4 h-4" /> },
];

interface BrandIntelligence {
  id: string;
  tenant_id: string;
  source_url: string | null;
  source_filename: string | null;
  brand_intelligence_score: number;
  brand: {
    name?: string;
    category?: string;
    description?: string;
    value_proposition?: string;
    location_focus?: string;
    business_model?: string;
  };
  audience: {
    segments?: string[];
    pain_points?: string[];
    search_intents?: string[];
  };
  offerings: {
    products?: string[];
    features?: string[];
    differentiators?: string[];
  };
  seo: {
    primary_keywords?: string[];
    secondary_keywords?: string[];
    long_tail_keywords?: string[];
  };
  market_discovery: {
    primary_search_keyword?: string;
    confidence_score?: number;
    alternative_keywords?: string[];
    selection_reason?: string;
    rejected_keywords?: { keyword: string; reason: string }[];
  };
  content_opportunities: { topic: string; reason: string }[];
  confidence_reason: string | null;
  created_at: string;
  updated_at: string;
}

export function AIResearcherModule({ tenantId, tenantKey }: { tenantId: string; tenantKey: string }) {
  const [activeTab, setActiveTab] = useState<AIResearcherSubTab>('brand');

  return (
    <div>
      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-0.5 p-1 bg-gray-100/80 rounded-lg w-fit mb-8">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-md transition-all ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'brand' && <BrandTab tenantId={tenantId} />}
      {activeTab === 'competitors' && <ComingSoonTab title="Competitors" description="Analyze competitor websites, content strategies, and identify gaps in your market positioning." />}
      {activeTab === 'keywords' && <KeywordsTab tenantId={tenantId} />}
      {activeTab === 'page-ideas' && <PageIdeasTab tenantId={tenantId} />}
      {activeTab === 'interlinking' && <ComingSoonTab title="Interlinking" description="Optimize your internal linking structure for better crawlability and topical authority." />}
    </div>
  );
}

/* ─── Coming Soon Tab ────────────────────────────────────── */

function ComingSoonTab({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Sparkles className="w-6 h-6 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md text-center mb-4">{description}</p>
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        Coming soon
      </span>
    </div>
  );
}

/* ─── Brand Tab ──────────────────────────────────────────── */

function BrandTab({ tenantId }: { tenantId: string }) {
  const [profile, setProfile] = useState<BrandIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Input state
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [sourceFilename, setSourceFilename] = useState('');

  const loadProfile = useCallback(async () => {
    const { data } = await supabase
      .from('gifaa_brand_intelligence')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setProfile(data);
    setLoading(false);
  }, [tenantId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function handleAnalyze() {
    if (!sourceUrl && !sourceText) {
      setError('Please provide a website URL or upload a document.');
      return;
    }
    setError(null);
    setAnalyzing(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/analyze-brand`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tenant_id: tenantId,
            source_url: sourceUrl.trim() || undefined,
            source_text: sourceText || undefined,
            source_filename: sourceFilename || undefined,
          }),
        }
      );

      if (res.status === 429) {
        const data = await res.json();
        setError(`Rate limited. Please try again in a moment.`);
        setAnalyzing(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error || `Error ${res.status}`);
        setAnalyzing(false);
        return;
      }

      const result = await res.json();
      setProfile(result.data);
      setSourceUrl('');
      setSourceText('');
      setSourceFilename('');
    } catch (err) {
      setError(String(err));
    }
    setAnalyzing(false);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSourceFilename(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === 'string') {
        setSourceText(text.slice(0, 15000));
      }
    };
    reader.readAsText(file);
  }

  if (loading) {
    return <p className="text-gray-400 text-sm py-10 text-center">Loading brand intelligence...</p>;
  }

  // Show existing profile if available
  if (profile && !analyzing) {
    return <BrandProfileView profile={profile} onReanalyze={() => setProfile(null)} onUpdate={loadProfile} tenantId={tenantId} />;
  }

  // Show input form
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center">
            <Brain className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Brand Intelligence</h2>
            <p className="text-sm text-gray-500">Analyze your brand to create an SEO growth strategy.</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Provide Brand Information</h3>

        <div className="space-y-5">
          {/* URL Input */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Website URL</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="pl-9 text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">We will fetch and analyze the homepage content.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Upload Document</label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-gray-300 transition-colors">
              {sourceFilename ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5 text-sky-600" />
                  <span className="text-sm text-gray-700 font-medium">{sourceFilename}</span>
                  <button onClick={() => { setSourceFilename(''); setSourceText(''); }} className="p-1 text-gray-400 hover:text-red-500 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
                    Choose File
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-400 mt-2">Supports PDF, DOC, DOCX, TXT</p>
                </>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-6">
          <Button
            onClick={handleAnalyze}
            disabled={analyzing || (!sourceUrl.trim() && !sourceText)}
            className="gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Brand...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze Brand
              </>
            )}
          </Button>
        </div>
      </div>

      {analyzing && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-700">Analyzing brand intelligence...</p>
          <p className="text-xs text-gray-400 mt-1">This may take 15-30 seconds.</p>
        </div>
      )}
    </div>
  );
}

/* ─── Brand Profile View ─────────────────────────────────── */

function BrandProfileView({
  profile,
  onReanalyze,
  onUpdate,
  tenantId,
}: {
  profile: BrandIntelligence;
  onReanalyze: () => void;
  onUpdate: () => void;
  tenantId: string;
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Editable state
  const [brand, setBrand] = useState(profile.brand);
  const [audience, setAudience] = useState(profile.audience);
  const [offerings, setOfferings] = useState(profile.offerings);
  const [seo, setSeo] = useState(profile.seo);
  const [marketDiscovery, setMarketDiscovery] = useState(profile.market_discovery || {});
  const [contentOpps, setContentOpps] = useState(profile.content_opportunities || []);

  async function handleSave() {
    setSaving(true);
    await supabase
      .from('gifaa_brand_intelligence')
      .update({
        brand,
        audience,
        offerings,
        seo,
        market_discovery: marketDiscovery,
        content_opportunities: contentOpps,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);
    setSaving(false);
    setSaved(true);
    onUpdate();
    setTimeout(() => setSaved(false), 2000);
  }

  const score = profile.brand_intelligence_score;
  const scoreColor = score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-500';
  const scoreBg = score >= 80 ? 'bg-emerald-50 border-emerald-200' : score >= 60 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <div className={`rounded-xl border p-6 ${scoreBg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-current flex items-center justify-center shadow-sm">
              <span className={`text-2xl font-bold ${scoreColor}`}>{score}</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Brand Intelligence Score</h2>
              <p className="text-sm text-gray-600 mt-0.5 max-w-md">
                {profile.confidence_reason || 'Analysis complete.'}
              </p>
            </div>
          </div>
          <Button onClick={onReanalyze} variant="outline" className="gap-2 text-sm">
            <Sparkles className="w-4 h-4" />
            Re-analyze
          </Button>
        </div>
        {profile.source_url && (
          <p className="text-xs text-gray-500 mt-3">
            Source: <span className="font-mono">{profile.source_url}</span>
          </p>
        )}
      </div>

      {/* Brand Overview */}
      <EditableSection
        title="Brand Overview"
        icon={<Target className="w-4 h-4 text-sky-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditableField label="Brand Name" value={brand.name || ''} onChange={(v) => setBrand({ ...brand, name: v })} />
          <EditableField label="Category" value={brand.category || ''} onChange={(v) => setBrand({ ...brand, category: v })} />
          <EditableField label="Description" value={brand.description || ''} onChange={(v) => setBrand({ ...brand, description: v })} multiline />
          <EditableField label="Value Proposition" value={brand.value_proposition || ''} onChange={(v) => setBrand({ ...brand, value_proposition: v })} multiline />
          <EditableField label="Geographic Focus" value={brand.location_focus || ''} onChange={(v) => setBrand({ ...brand, location_focus: v })} />
          <EditableField label="Business Model" value={brand.business_model || ''} onChange={(v) => setBrand({ ...brand, business_model: v })} />
        </div>
      </EditableSection>

      {/* Audience */}
      <EditableSection
        title="Audience"
        icon={<Users className="w-4 h-4 text-teal-600" />}
      >
        <div className="space-y-4">
          <EditableList label="Customer Segments" items={audience.segments || []} onChange={(v) => setAudience({ ...audience, segments: v })} />
          <EditableList label="Pain Points" items={audience.pain_points || []} onChange={(v) => setAudience({ ...audience, pain_points: v })} />
          <EditableList label="Search Intents" items={audience.search_intents || []} onChange={(v) => setAudience({ ...audience, search_intents: v })} />
        </div>
      </EditableSection>

      {/* Products & Features */}
      <EditableSection
        title="Products & Features"
        icon={<Package className="w-4 h-4 text-blue-600" />}
      >
        <div className="space-y-4">
          <EditableList label="Products / Services" items={offerings.products || []} onChange={(v) => setOfferings({ ...offerings, products: v })} />
          <EditableList label="Key Features" items={offerings.features || []} onChange={(v) => setOfferings({ ...offerings, features: v })} />
          <EditableList label="Differentiators" items={offerings.differentiators || []} onChange={(v) => setOfferings({ ...offerings, differentiators: v })} />
        </div>
      </EditableSection>

      {/* SEO Keywords */}
      <EditableSection
        title="SEO Keywords"
        icon={<Search className="w-4 h-4 text-orange-600" />}
      >
        <div className="space-y-4">
          <ChipList label="Primary Keywords" items={seo.primary_keywords || []} onChange={(v) => setSeo({ ...seo, primary_keywords: v })} color="sky" />
          <ChipList label="Secondary Keywords" items={seo.secondary_keywords || []} onChange={(v) => setSeo({ ...seo, secondary_keywords: v })} color="teal" />
          <ChipList label="Long-Tail Keywords" items={seo.long_tail_keywords || []} onChange={(v) => setSeo({ ...seo, long_tail_keywords: v })} color="gray" />
        </div>
      </EditableSection>

      {/* Market Discovery */}
      <MarketDiscoverySection
        marketDiscovery={marketDiscovery}
        onChange={setMarketDiscovery}
      />

      {/* Content Opportunities */}
      <EditableSection
        title="Content Opportunities"
        icon={<Lightbulb className="w-4 h-4 text-amber-600" />}
      >
        <div className="space-y-3">
          {contentOpps.map((opp, i) => (
            <div key={i} className="p-3 border border-gray-200 rounded-lg bg-gray-50/50 group">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <Input
                    value={opp.topic}
                    onChange={(e) => {
                      const updated = [...contentOpps];
                      updated[i] = { ...updated[i], topic: e.target.value };
                      setContentOpps(updated);
                    }}
                    placeholder="Topic"
                    className="text-sm font-medium"
                  />
                  <Input
                    value={opp.reason}
                    onChange={(e) => {
                      const updated = [...contentOpps];
                      updated[i] = { ...updated[i], reason: e.target.value };
                      setContentOpps(updated);
                    }}
                    placeholder="Reason / rationale"
                    className="text-sm"
                  />
                </div>
                <button
                  onClick={() => setContentOpps(contentOpps.filter((_, idx) => idx !== i))}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setContentOpps([...contentOpps, { topic: '', reason: '' }])}
            className="gap-1.5 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Opportunity
          </Button>
        </div>
      </EditableSection>

      {/* Save Bar */}
      <div className="sticky bottom-4 bg-white border border-gray-200 rounded-xl p-4 shadow-lg flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Last analyzed: {new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? 'Saving...' : saved ? <><Check className="w-4 h-4" /> Saved</> : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

/* ─── Reusable Section Wrapper ───────────────────────────── */

function EditableSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

/* ─── Editable Field ─────────────────────────────────────── */

function EditableField({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none h-20"
        />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="text-sm" />
      )}
    </div>
  );
}

/* ─── Editable List ──────────────────────────────────────── */

function EditableList({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) {
  const [newItem, setNewItem] = useState('');

  function addItem() {
    const trimmed = newItem.trim();
    if (!trimmed || items.includes(trimmed)) return;
    onChange([...items, trimmed]);
    setNewItem('');
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-2">{label}</label>
      <div className="space-y-1.5 mb-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2 border border-gray-100 rounded-lg bg-gray-50/50 group">
            <span className="flex-1 text-sm text-gray-700">{item}</span>
            <button
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="p-0.5 text-gray-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={`Add ${label.toLowerCase()}...`}
          className="text-sm max-w-xs"
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }}
        />
        <Button onClick={addItem} disabled={!newItem.trim()} variant="outline" size="sm" className="text-xs gap-1">
          <Plus className="w-3 h-3" /> Add
        </Button>
      </div>
    </div>
  );
}

/* ─── Keyword Chips ──────────────────────────────────────── */

function ChipList({ label, items, onChange, color }: { label: string; items: string[]; onChange: (v: string[]) => void; color: 'sky' | 'teal' | 'gray' }) {
  const [newItem, setNewItem] = useState('');

  const colorMap = {
    sky: 'bg-sky-50 text-sky-700 border-sky-200',
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  function addItem() {
    const trimmed = newItem.trim();
    if (!trimmed || items.includes(trimmed)) return;
    onChange([...items, trimmed]);
    setNewItem('');
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2 mb-3">
        {items.map((item, i) => (
          <span key={i} className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${colorMap[color]} group`}>
            {item}
            <button
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="text-current opacity-40 hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {items.length === 0 && (
          <span className="text-xs text-gray-400">No keywords added.</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add keyword..."
          className="text-sm max-w-xs"
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }}
        />
        <Button onClick={addItem} disabled={!newItem.trim()} variant="outline" size="sm" className="text-xs gap-1">
          <Plus className="w-3 h-3" /> Add
        </Button>
      </div>
    </div>
  );
}

/* ─── Keywords Tab ──────────────────────────────────────── */

const GENERIC_DOMAINS = [
  'reddit.com', 'quora.com', 'wikipedia.org', 'youtube.com',
  'facebook.com', 'twitter.com', 'x.com', 'instagram.com',
  'linkedin.com', 'pinterest.com', 'tiktok.com',
  'amazon.com', 'amazon.in', 'flipkart.com',
  'vogue.com', 'forbes.com', 'medium.com',
  'nytimes.com', 'bbc.com', 'cnn.com',
];

function isGenericDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return GENERIC_DOMAINS.some((d) => hostname === d || hostname.endsWith('.' + d));
  } catch {
    return false;
  }
}

interface VolumeEntry {
  primary_keyword: string;
  monthly_search_volume: number;
  confidence: number;
}

interface KeywordStrategy {
  id: string;
  tenant_id: string;
  search_term: string;
  country_code: string;
  serp_data: SerpResult[];
  scraped_urls: string[];
  themes: {
    name: string;
    opportunity_score: number;
    opportunity_reason: string;
    keywords: string[];
    suggested_pages: { title: string; keyword: string }[];
  }[];
  generation_params: {
    num_themes?: number;
    num_keywords?: number;
    num_pages?: number;
    additional_instructions?: string;
  };
  page_search_volumes: Record<string, VolumeEntry>;
  created_at: string;
}

interface SerpResult {
  rank: number;
  title: string;
  url: string;
  description: string;
}

function KeywordsTab({ tenantId }: { tenantId: string }) {
  const [strategy, setStrategy] = useState<KeywordStrategy | null>(null);
  const [brandProfile, setBrandProfile] = useState<BrandIntelligence | null>(null);
  const [loading, setLoading] = useState(true);

  // Wizard state
  const [step, setStep] = useState<'search' | 'review-serp' | 'generating' | 'results'>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [countryCode, setCountryCode] = useState('us');
  const [searching, setSearching] = useState(false);
  const [serpResults, setSerpResults] = useState<SerpResult[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [scraping, setScraping] = useState(false);
  const [scrapedContent, setScrapedContent] = useState<{ url: string; content: string }[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<unknown>(null);

  // Strategy generation params
  const [numThemes, setNumThemes] = useState(5);
  const [numKeywords, setNumKeywords] = useState(20);
  const [numPages, setNumPages] = useState(10);
  const [keywordFocus, setKeywordFocus] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  useEffect(() => {
    async function load() {
      const [strategyRes, brandRes] = await Promise.all([
        supabase
          .from('gifaa_keyword_strategies')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('gifaa_brand_intelligence')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (strategyRes.data) {
        setStrategy(strategyRes.data);
        setStep('results');
      }
      if (brandRes.data) {
        setBrandProfile(brandRes.data);
        if (brandRes.data.market_discovery?.primary_search_keyword) {
          setSearchTerm(brandRes.data.market_discovery.primary_search_keyword);
        }
      }
      setLoading(false);
    }
    load();
  }, [tenantId]);

  async function handleSearch() {
    if (!searchTerm.trim()) return;
    setError(null);
    setDebugInfo(null);
    setSearching(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/keyword-research`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'search',
            tenant_id: tenantId,
            primary_search_term: searchTerm.trim(),
            country_code: countryCode,
          }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error || `Error ${res.status}`);
        setSearching(false);
        return;
      }
      const data = await res.json();
      const results: SerpResult[] = data.results || [];

      if (results.length === 0 && data.debug) {
        setDebugInfo(data.debug);
        setError(`0 results found. The SERP API returned ${data.debug?.items_count || 0} items but none matched the expected format.`);
        setSearching(false);
        return;
      }

      setSerpResults(results);
      // Auto-select competitor sites (non-generic), preserving original position order
      const competitorUrls = results
        .filter((r) => !isGenericDomain(r.url))
        .slice(0, 5)
        .map((r) => r.url);
      setSelectedUrls(competitorUrls);
      setStep('review-serp');
    } catch (err) {
      setError(String(err));
    }
    setSearching(false);
  }

  async function handleScrapeAndGenerate() {
    setError(null);
    setScraping(true);

    let scraped: { url: string; content: string }[] = [];
    if (selectedUrls.length > 0) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/keyword-research`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'scrape',
              tenant_id: tenantId,
              urls: selectedUrls,
            }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          scraped = data.results || [];
          setScrapedContent(scraped);
        }
      } catch { /* continue without scraped content */ }
    }

    setScraping(false);
    setGenerating(true);
    setStep('generating');

    // Build combined instructions for AI
    let combinedInstructions = '';
    if (keywordFocus) {
      combinedInstructions += `Keyword Focus: ${keywordFocus}\n`;
    }
    if (additionalInstructions) {
      combinedInstructions += `${additionalInstructions}\n`;
    }
    combinedInstructions += `\nIMPORTANT: Rationalize the following parameters - if the numbers don't make sense together (e.g. too many pages for too few themes), adjust proportionally to produce a coherent strategy. Use your judgment on what is feasible.\n`;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/keyword-research`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'generate',
            tenant_id: tenantId,
            primary_search_term: searchTerm.trim(),
            country_code: countryCode,
            num_themes: numThemes,
            num_keywords: numKeywords,
            num_pages: numPages,
            brand_intelligence: brandProfile ? {
              brand: brandProfile.brand,
              audience: brandProfile.audience,
              offerings: brandProfile.offerings,
              seo: brandProfile.seo,
              market_discovery: brandProfile.market_discovery,
              content_opportunities: brandProfile.content_opportunities,
            } : null,
            serp_results: serpResults,
            scraped_content: scraped,
            additional_instructions: combinedInstructions.trim() || undefined,
          }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error || `Error ${res.status}`);
        setGenerating(false);
        setStep('review-serp');
        return;
      }
      const data = await res.json();
      setStrategy(data.data);
      setStep('results');
    } catch (err) {
      setError(String(err));
      setStep('review-serp');
    }
    setGenerating(false);
  }

  function handleNewStrategy() {
    setStrategy(null);
    setSerpResults([]);
    setSelectedUrls([]);
    setScrapedContent([]);
    setDebugInfo(null);
    setStep('search');
  }

  if (loading) {
    return <p className="text-gray-400 text-sm py-10 text-center">Loading keyword strategies...</p>;
  }

  if (step === 'results' && strategy) {
    const industryContext = brandProfile
      ? [brandProfile.brand?.category, brandProfile.brand?.description].filter(Boolean).join(' — ').slice(0, 200)
      : undefined;
    return <KeywordStrategyView strategy={strategy} onNewStrategy={handleNewStrategy} industry={industryContext} />;
  }

  if (step === 'generating') {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-700">
          {scraping ? 'Scraping competitor pages...' : 'Generating keyword strategy...'}
        </p>
        <p className="text-xs text-gray-400 mt-1">This may take 30-60 seconds.</p>
      </div>
    );
  }

  // SERP review + strategy config step
  if (step === 'review-serp') {
    const competitorResults = serpResults.filter((r) => !isGenericDomain(r.url));
    const genericResults = serpResults.filter((r) => isGenericDomain(r.url));
    const selectedCount = selectedUrls.length;

    return (
      <div className="space-y-6">
        {/* SERP Results */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">SERP Results for "{searchTerm}"</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {serpResults.length} results found: {competitorResults.length} competitor sites, {genericResults.length} generic/public sites.
                Select actual competitors to scrape.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setStep('search')} className="text-xs">
              Back
            </Button>
          </div>

          {/* Competitor results first */}
          {competitorResults.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                Competitor Sites ({competitorResults.length})
              </p>
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {competitorResults.map((result, i) => (
                  <label
                    key={`comp-${i}`}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedUrls.includes(result.url) ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUrls.includes(result.url)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUrls([...selectedUrls, result.url]);
                        } else {
                          setSelectedUrls(selectedUrls.filter((u) => u !== result.url));
                        }
                      }}
                      className="mt-0.5 rounded border-gray-300"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded bg-gray-100 text-gray-600 border border-gray-200 shrink-0">
                          {result.rank}
                        </span>
                        <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                      </div>
                      <p className="text-xs text-sky-600 truncate mt-0.5">{result.url}</p>
                      {result.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{result.description}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Generic sites shown separately */}
          {genericResults.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                Public / Generic Sites ({genericResults.length}) - usually not direct competitors
              </p>
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto opacity-70">
                {genericResults.map((result, i) => (
                  <label
                    key={`gen-${i}`}
                    className={`flex items-start gap-3 p-2.5 border rounded-lg cursor-pointer transition-colors ${
                      selectedUrls.includes(result.url) ? 'border-sky-300 bg-sky-50/50' : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUrls.includes(result.url)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUrls([...selectedUrls, result.url]);
                        } else {
                          setSelectedUrls(selectedUrls.filter((u) => u !== result.url));
                        }
                      }}
                      className="mt-0.5 rounded border-gray-300"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded bg-gray-50 text-gray-400 border border-gray-100 shrink-0">
                          {result.rank}
                        </span>
                        <p className="text-sm text-gray-600 truncate">{result.title}</p>
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{result.url}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Strategy Configuration */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Strategy Configuration</h3>
          <p className="text-xs text-gray-500 mb-4">
            Tell the AI what you need. It will rationalize your inputs -- if numbers don't add up (e.g. 1 page across 5 themes), it will adjust to produce something coherent.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Content Themes</label>
              <Input
                type="number"
                min={1}
                max={20}
                value={numThemes}
                onChange={(e) => setNumThemes(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                className="text-sm"
              />
              <p className="text-[10px] text-gray-400 mt-0.5">Topical clusters to group keywords into</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Total Keywords</label>
              <Input
                type="number"
                min={5}
                max={100}
                value={numKeywords}
                onChange={(e) => setNumKeywords(Math.max(5, Math.min(100, Number(e.target.value) || 5)))}
                className="text-sm"
              />
              <p className="text-[10px] text-gray-400 mt-0.5">Keywords distributed across all themes</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Page Ideas</label>
              <Input
                type="number"
                min={1}
                max={50}
                value={numPages}
                onChange={(e) => setNumPages(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                className="text-sm"
              />
              <p className="text-[10px] text-gray-400 mt-0.5">Suggested page titles to generate</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-1">Keyword Focus (what are you looking for?)</label>
            <Input
              value={keywordFocus}
              onChange={(e) => setKeywordFocus(e.target.value)}
              placeholder="e.g. Long-tail transactional keywords for product pages, informational how-to queries, local service keywords..."
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Additional Instructions (optional)</label>
            <Textarea
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              placeholder="e.g. Exclude brand terms, focus on queries with purchase intent, prioritize low-competition terms, avoid keywords we already rank for..."
              className="text-sm h-20 resize-none"
            />
          </div>

          {brandProfile && (
            <div className="mt-4 p-3 bg-sky-50 border border-sky-200 rounded-lg flex items-start gap-2">
              <Brain className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
              <p className="text-xs text-sky-700">
                Brand Intelligence will be included: <span className="font-medium">{brandProfile.brand?.name || 'Brand'}</span> ({brandProfile.brand?.category || 'uncategorized'}) with {brandProfile.seo?.primary_keywords?.length || 0} primary keywords, {brandProfile.audience?.segments?.length || 0} audience segments, and {brandProfile.content_opportunities?.length || 0} content opportunities.
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">{selectedCount} competitor page(s) selected for scraping</p>
          <Button onClick={handleScrapeAndGenerate} disabled={scraping || generating} className="gap-2">
            {scraping || generating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Scrape & Generate Strategy</>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Search step (default)
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
            <Key className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Keyword Research</h2>
            <p className="text-sm text-gray-500">Search Google, analyze competitors, and generate a keyword strategy.</p>
          </div>
        </div>

        {!brandProfile && (
          <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700">Run Brand Intelligence first for better keyword recommendations.</p>
          </div>
        )}

        {brandProfile && (
          <div className="mb-5 p-3 bg-sky-50 border border-sky-100 rounded-lg flex items-start gap-2">
            <Brain className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
            <p className="text-xs text-sky-700">
              Brand profile loaded: <span className="font-medium">{brandProfile.brand?.name || 'Unknown'}</span>. Keywords and audience data will be used to improve research quality.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Search Term</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="e.g. best gift registry india"
                  className="pl-9 text-sm"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
                />
              </div>
              <Input
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.toLowerCase())}
                placeholder="us"
                className="text-sm w-16 text-center"
                title="Country code (us, in, uk, etc.)"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              {brandProfile?.market_discovery?.primary_search_keyword
                ? `Suggested from brand analysis: "${brandProfile.market_discovery.primary_search_keyword}"`
                : 'Enter the primary keyword your competitors would rank for. This discovers who is ranking in your space.'
              }
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700">{error}</p>
            {debugInfo ? (
              <details className="mt-2">
                <summary className="text-xs text-red-500 cursor-pointer">Debug info</summary>
                <pre className="text-[10px] text-red-600 mt-1 whitespace-pre-wrap break-all">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            ) : null}
          </div>
        )}

        <div className="mt-6">
          <Button onClick={handleSearch} disabled={searching || !searchTerm.trim()} className="gap-2">
            {searching ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Searching Google...</>
            ) : (
              <><Search className="w-4 h-4" /> Search SERP</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Keyword Strategy Results View ─────────────────────── */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

function VolumeBadge({ volume, loading }: { volume?: VolumeEntry; loading: boolean }) {
  if (loading) {
    return <span className="inline-block w-16 h-4 bg-gray-200 rounded animate-pulse" />;
  }
  if (!volume) return <span className="text-xs text-gray-300">—</span>;

  const v = volume.monthly_search_volume;
  const colorClass = v >= 10000
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : v >= 1000
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-red-50 text-red-600 border-red-200';

  const label = v >= 10000
    ? `${Math.round(v / 1000)}K+`
    : v >= 1000
    ? `${(v / 1000).toFixed(1)}K`
    : String(v);

  const tier = v >= 10000 ? 'High' : v >= 1000 ? 'Medium' : 'Niche';

  return (
    <span
      title={`AI estimated monthly searches (${tier}) — confidence ${volume.confidence}%`}
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full border ${colorClass} cursor-default`}
    >
      <TrendingUp className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}

function KeywordStrategyView({ strategy, onNewStrategy, industry }: { strategy: KeywordStrategy; onNewStrategy: () => void; industry?: string }) {
  const [volumes, setVolumes] = useState<Record<string, VolumeEntry>>(strategy.page_search_volumes || {});
  const [enriching, setEnriching] = useState(false);

  const totalKeywords = strategy.themes.reduce((acc, t) => acc + (t.keywords?.length || 0), 0);
  const totalPages = strategy.themes.reduce((acc, t) => acc + (t.suggested_pages?.length || 0), 0);

  // Collect all pages — send existing_keyword as the primary signal for the AI
  const allPages = strategy.themes.flatMap((theme) =>
    (theme.suggested_pages || []).map((p) => ({
      title: p.title,
      slug: slugify(p.title),
      existing_keyword: p.keyword,
    }))
  );

  const hasVolumes = Object.keys(volumes).length > 0;

  const enrichVolumes = useCallback(async () => {
    if (allPages.length === 0) return;
    setEnriching(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/keyword-research`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'enrich-volume',
            tenant_id: strategy.tenant_id,
            strategy_id: strategy.id,
            pages: allPages,
            country: strategy.country_code || 'us',
            industry: industry || undefined,
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.data) setVolumes(data.data);
      }
    } catch { /* silently fail — volumes are non-critical */ }
    setEnriching(false);
  }, [strategy.id, strategy.tenant_id, strategy.country_code]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-enrich only if no volumes have been saved yet
  useEffect(() => {
    if (!hasVolumes && allPages.length > 0) {
      enrichVolumes();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function downloadPDF() {
    const lines: string[] = [];
    lines.push(`KEYWORD STRATEGY REPORT`);
    lines.push(`${'='.repeat(60)}`);
    lines.push(`Search Term: ${strategy.search_term}`);
    lines.push(`Country: ${strategy.country_code?.toUpperCase() || 'US'}`);
    lines.push(`Generated: ${new Date(strategy.created_at).toLocaleDateString()}`);
    lines.push(`Themes: ${strategy.themes.length} | Keywords: ${totalKeywords} | Page Ideas: ${totalPages}`);
    lines.push('');

    strategy.themes.forEach((theme, i) => {
      lines.push(`${'─'.repeat(60)}`);
      lines.push(`THEME ${i + 1}: ${theme.name}`);
      lines.push(`Opportunity Score: ${theme.opportunity_score}/100`);
      if (theme.opportunity_reason) lines.push(`Reason: ${theme.opportunity_reason}`);
      lines.push('');
      lines.push(`  Keywords:`);
      (theme.keywords || []).forEach((kw) => lines.push(`    - ${kw}`));
      lines.push('');
      if (theme.suggested_pages && theme.suggested_pages.length > 0) {
        lines.push(`  Suggested Pages:`);
        theme.suggested_pages.forEach((p, pi) => {
          const slug = slugify(p.title);
          const vol = volumes[slug];
          lines.push(`    ${pi + 1}. ${p.title}`);
          lines.push(`       Target keyword: ${p.keyword}`);
          if (vol) lines.push(`       Primary keyword: ${vol.primary_keyword} | Est. volume: ${vol.monthly_search_volume}/mo`);
        });
      }
      lines.push('');
    });

    lines.push(`${'='.repeat(60)}`);
    lines.push(`End of Report`);

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keyword-strategy-${strategy.search_term.replace(/\s+/g, '-').toLowerCase()}-${new Date(strategy.created_at).toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function downloadCSV() {
    const rows: string[][] = [['Theme', 'Opportunity Score', 'Page Title', 'URL Slug', 'Target Keyword', 'Primary Keyword', 'Est. Monthly Volume', 'Confidence']];
    strategy.themes.forEach((theme) => {
      if (theme.suggested_pages && theme.suggested_pages.length > 0) {
        theme.suggested_pages.forEach((p) => {
          const slug = slugify(p.title);
          const vol = volumes[slug];
          rows.push([
            theme.name,
            String(theme.opportunity_score),
            p.title,
            slug,
            p.keyword,
            vol?.primary_keyword || '',
            vol ? String(vol.monthly_search_volume) : '',
            vol ? String(vol.confidence) : '',
          ]);
        });
      }
      (theme.keywords || []).forEach((kw) => {
        if (!theme.suggested_pages?.some((p) => p.keyword === kw)) {
          rows.push([theme.name, String(theme.opportunity_score), '', '', kw, '', '', '']);
        }
      });
    });

    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keyword-strategy-${strategy.search_term.replace(/\s+/g, '-').toLowerCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Keyword Strategy</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Generated for "{strategy.search_term}" on {new Date(strategy.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={enrichVolumes}
              disabled={enriching}
              className="gap-1.5 text-xs"
              title="Re-run AI volume estimation for all pages"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${enriching ? 'animate-spin' : ''}`} />
              {enriching ? 'Estimating...' : 'Refresh Volumes'}
            </Button>
            <Button variant="outline" size="sm" onClick={downloadCSV} className="gap-1.5 text-xs">
              <FileText className="w-3.5 h-3.5" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={downloadPDF} className="gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" /> Report
            </Button>
            <Button variant="outline" size="sm" onClick={onNewStrategy} className="gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5" /> New Research
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-center">
            <p className="text-2xl font-bold text-sky-700">{strategy.themes.length}</p>
            <p className="text-xs text-sky-600 mt-0.5">Themes</p>
          </div>
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-center">
            <p className="text-2xl font-bold text-teal-700">{totalKeywords}</p>
            <p className="text-xs text-teal-600 mt-0.5">Keywords</p>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
            <p className="text-2xl font-bold text-amber-700">{totalPages}</p>
            <p className="text-xs text-amber-600 mt-0.5">Page Ideas</p>
          </div>
        </div>

        {strategy.generation_params && (
          <p className="text-xs text-gray-400 mt-3">
            Config: {strategy.generation_params.num_themes || '?'} themes, {strategy.generation_params.num_keywords || '?'} keywords, {strategy.generation_params.num_pages || '?'} pages requested
          </p>
        )}
      </div>

      {/* Themes */}
      {strategy.themes.map((theme, i) => {
        const scoreColor = theme.opportunity_score >= 80 ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
          : theme.opportunity_score >= 60 ? 'text-amber-600 bg-amber-50 border-amber-200'
          : 'text-red-500 bg-red-50 border-red-200';

        return (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">{theme.name}</h4>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${scoreColor}`}>
                {theme.opportunity_score}/100
              </span>
            </div>
            {theme.opportunity_reason && (
              <p className="text-xs text-gray-600 mb-4">{theme.opportunity_reason}</p>
            )}

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-2">Keywords ({(theme.keywords || []).length})</label>
              <div className="flex flex-wrap gap-1.5">
                {(theme.keywords || []).map((kw, ki) => (
                  <span key={ki} className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {theme.suggested_pages && theme.suggested_pages.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Suggested Pages ({theme.suggested_pages.length})</label>
                <div className="space-y-1.5">
                  {theme.suggested_pages.map((page, pi) => {
                    const slug = slugify(page.title);
                    const vol = volumes[slug];
                    return (
                      <div key={pi} className="flex items-center gap-3 px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg">
                        <span className="text-[10px] font-bold text-gray-400 w-5 text-center shrink-0">{pi + 1}</span>
                        <span className="text-sm text-gray-700 flex-1 min-w-0">{page.title}</span>
                        <span className="text-xs text-gray-400 font-mono shrink-0 hidden sm:block">{slug}</span>
                        {(vol || enriching) && (
                          <span className="inline-flex px-2 py-0.5 text-[11px] font-medium rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0 truncate max-w-[140px]" title={vol?.primary_keyword}>
                            {enriching && !vol ? (
                              <span className="inline-block w-20 h-3 bg-gray-200 rounded animate-pulse" />
                            ) : vol?.primary_keyword}
                          </span>
                        )}
                        <VolumeBadge volume={vol} loading={enriching && !vol} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Market Discovery Section ───────────────────────────── */

interface MarketDiscoveryData {
  primary_search_keyword?: string;
  confidence_score?: number;
  alternative_keywords?: string[];
  selection_reason?: string;
  rejected_keywords?: { keyword: string; reason: string }[];
}

function MarketDiscoverySection({
  marketDiscovery,
  onChange,
}: {
  marketDiscovery: MarketDiscoveryData;
  onChange: (v: MarketDiscoveryData) => void;
}) {
  const [newAltKeyword, setNewAltKeyword] = useState('');

  const confidenceScore = marketDiscovery.confidence_score || 0;
  const confColor = confidenceScore >= 80 ? 'text-emerald-600' : confidenceScore >= 60 ? 'text-amber-600' : 'text-red-500';
  const confBg = confidenceScore >= 80 ? 'bg-emerald-50 border-emerald-200' : confidenceScore >= 60 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';

  function addAltKeyword() {
    const trimmed = newAltKeyword.trim();
    if (!trimmed) return;
    const current = marketDiscovery.alternative_keywords || [];
    if (current.includes(trimmed)) return;
    onChange({ ...marketDiscovery, alternative_keywords: [...current, trimmed] });
    setNewAltKeyword('');
  }

  return (
    <EditableSection
      title="Market Discovery"
      icon={<Globe className="w-4 h-4 text-indigo-600" />}
    >
      <div className="space-y-5">
        {/* Primary keyword highlight */}
        <div className={`rounded-lg border p-4 ${confBg}`}>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-600">Selected Search Keyword</label>
            <span className={`text-xs font-semibold ${confColor}`}>
              Confidence: {confidenceScore}/100
            </span>
          </div>
          <Input
            value={marketDiscovery.primary_search_keyword || ''}
            onChange={(e) => onChange({ ...marketDiscovery, primary_search_keyword: e.target.value })}
            placeholder="e.g. gift registry india"
            className="text-sm font-medium bg-white"
          />
          <p className="text-xs text-gray-500 mt-2">
            This keyword will be used for competitor SERP discovery.
          </p>
        </div>

        {/* Confidence score editable */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Confidence Score (0-100)</label>
            <Input
              type="number"
              min={0}
              max={100}
              value={confidenceScore}
              onChange={(e) => onChange({ ...marketDiscovery, confidence_score: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })}
              className="text-sm"
            />
          </div>
        </div>

        {/* Selection reason */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Why This Keyword Was Selected</label>
          <textarea
            value={marketDiscovery.selection_reason || ''}
            onChange={(e) => onChange({ ...marketDiscovery, selection_reason: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none h-16"
            placeholder="AI reasoning for why this keyword best discovers competitors..."
          />
        </div>

        {/* Alternative keywords */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Alternative Keywords</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {(marketDiscovery.alternative_keywords || []).map((kw, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                {kw}
                <button
                  onClick={() => {
                    const updated = (marketDiscovery.alternative_keywords || []).filter((_, idx) => idx !== i);
                    onChange({ ...marketDiscovery, alternative_keywords: updated });
                  }}
                  className="text-current opacity-40 hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {(marketDiscovery.alternative_keywords || []).length === 0 && (
              <span className="text-xs text-gray-400">No alternative keywords.</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={newAltKeyword}
              onChange={(e) => setNewAltKeyword(e.target.value)}
              placeholder="Add alternative keyword..."
              className="text-sm max-w-xs"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAltKeyword(); } }}
            />
            <Button onClick={addAltKeyword} disabled={!newAltKeyword.trim()} variant="outline" size="sm" className="text-xs gap-1">
              <Plus className="w-3 h-3" /> Add
            </Button>
          </div>
        </div>

        {/* Rejected keywords */}
        {(marketDiscovery.rejected_keywords || []).length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Rejected Keywords</label>
            <div className="space-y-2">
              {(marketDiscovery.rejected_keywords || []).map((rk, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 border border-gray-100 rounded-lg bg-gray-50/50 group">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      value={rk.keyword}
                      onChange={(e) => {
                        const updated = [...(marketDiscovery.rejected_keywords || [])];
                        updated[i] = { ...updated[i], keyword: e.target.value };
                        onChange({ ...marketDiscovery, rejected_keywords: updated });
                      }}
                      placeholder="Keyword"
                      className="text-sm"
                    />
                    <Input
                      value={rk.reason}
                      onChange={(e) => {
                        const updated = [...(marketDiscovery.rejected_keywords || [])];
                        updated[i] = { ...updated[i], reason: e.target.value };
                        onChange({ ...marketDiscovery, rejected_keywords: updated });
                      }}
                      placeholder="Reason for rejection"
                      className="text-sm"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const updated = (marketDiscovery.rejected_keywords || []).filter((_, idx) => idx !== i);
                      onChange({ ...marketDiscovery, rejected_keywords: updated });
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </EditableSection>
  );
}

/* ─── Page Ideas Tab (Keyword Opportunity Research) ─────── */

interface KeywordOpportunity {
  keyword: string;
  search_volume: number;
  difficulty: number;
  intent: string;
  funnel: string;
  relevance: number;
  keyword_type: string;
  reasoning: string;
  opportunity_score: number;
  generated_pages?: { title: string; slug: string }[];
}

interface KeywordOpportunityRecord {
  id: string;
  tenant_id: string;
  brand_intelligence_id: string | null;
  keywords: KeywordOpportunity[];
  generation_params: Record<string, unknown>;
  country_code: string;
  created_at: string;
}

function PageIdeasTab({ tenantId }: { tenantId: string }) {
  const [record, setRecord] = useState<KeywordOpportunityRecord | null>(null);
  const [brandProfile, setBrandProfile] = useState<BrandIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [generatingPages, setGeneratingPages] = useState<Set<number>>(new Set());
  const [sortField, setSortField] = useState<'opportunity_score' | 'search_volume' | 'difficulty' | 'relevance'>('opportunity_score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    async function load() {
      const [oppRes, brandRes] = await Promise.all([
        supabase
          .from('gifaa_keyword_opportunities')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('gifaa_brand_intelligence')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (oppRes.data) setRecord(oppRes.data);
      if (brandRes.data) setBrandProfile(brandRes.data);
      setLoading(false);
    }
    load();
  }, [tenantId]);

  async function handleGenerate() {
    if (!brandProfile) {
      setError('Brand Intelligence is required. Run Brand analysis first.');
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/keyword-research`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'generate-opportunities',
            tenant_id: tenantId,
            country_code: brandProfile.brand?.location_focus?.toLowerCase().slice(0, 2) || 'us',
            brand_intelligence: {
              id: brandProfile.id,
              brand: brandProfile.brand,
              audience: brandProfile.audience,
              offerings: brandProfile.offerings,
              seo: brandProfile.seo,
              market_discovery: brandProfile.market_discovery,
              content_opportunities: brandProfile.content_opportunities,
            },
          }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error || `Error ${res.status}`);
      } else {
        const data = await res.json();
        setRecord(data.data);
      }
    } catch (err) {
      setError(String(err));
    }
    setGenerating(false);
  }

  async function handleGeneratePages(index: number) {
    if (!record) return;
    const kw = record.keywords[index];
    if (!kw) return;

    setGeneratingPages((prev) => new Set(prev).add(index));
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/keyword-research`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'generate-pages-for-keyword',
            tenant_id: tenantId,
            opportunity_id: record.id,
            keyword_index: index,
            keyword_data: {
              keyword: kw.keyword,
              search_volume: kw.search_volume,
              difficulty: kw.difficulty,
              intent: kw.intent,
              funnel: kw.funnel,
              opportunity_score: kw.opportunity_score,
            },
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.pages) {
          const updated = { ...record };
          const keywords = [...updated.keywords];
          keywords[index] = { ...keywords[index], generated_pages: data.pages };
          updated.keywords = keywords;
          setRecord(updated);
          setExpandedRows((prev) => new Set(prev).add(index));
        }
      }
    } catch { /* non-critical */ }
    setGeneratingPages((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  }

  function toggleSort(field: typeof sortField) {
    if (sortField === field) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  if (loading) {
    return <p className="text-gray-400 text-sm py-10 text-center">Loading keyword opportunities...</p>;
  }

  if (!record) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center mx-auto mb-4">
            <LayoutList className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Page Ideas from Keyword Opportunities</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Discover high-opportunity keywords and generate page ideas. The AI generates ~100 candidates internally and returns the top opportunities ranked by score.
          </p>

          {!brandProfile && (
            <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 max-w-md mx-auto text-left">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">Run Brand Intelligence first. This requires brand context to generate relevant opportunities.</p>
            </div>
          )}

          {brandProfile && (
            <div className="mb-5 p-3 bg-sky-50 border border-sky-100 rounded-lg flex items-start gap-2 max-w-md mx-auto text-left">
              <Brain className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
              <p className="text-xs text-sky-700">
                Brand loaded: <span className="font-medium">{brandProfile.brand?.name || 'Unknown'}</span> ({brandProfile.brand?.category || 'uncategorized'}). Ready to research.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto text-left">
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <Button onClick={handleGenerate} disabled={generating || !brandProfile} className="gap-2">
            {generating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Researching Keywords...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Research Keyword Opportunities</>
            )}
          </Button>
          {generating && <p className="text-xs text-gray-400 mt-2">Generating ~100 candidates and filtering top opportunities. 30-60 seconds.</p>}
        </div>
      </div>
    );
  }

  const sortedKeywords = [...record.keywords].map((kw, origIdx) => ({ ...kw, _idx: origIdx }));
  sortedKeywords.sort((a, b) => {
    const aVal = a[sortField] ?? 0;
    const bVal = b[sortField] ?? 0;
    return sortDir === 'desc' ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
  });

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Keyword Opportunities</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {record.keywords.length} opportunities | Generated {new Date(record.created_at).toLocaleDateString()} | Country: {record.country_code?.toUpperCase()}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating} className="gap-1.5 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Researching...' : 'Re-run Research'}
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
            <p className="text-xl font-bold text-emerald-700">{record.keywords.filter(k => k.search_volume >= 10000).length}</p>
            <p className="text-[10px] text-emerald-600 mt-0.5">High Volume</p>
          </div>
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-center">
            <p className="text-xl font-bold text-sky-700">{record.keywords.filter(k => k.difficulty <= 30).length}</p>
            <p className="text-[10px] text-sky-600 mt-0.5">Low Difficulty</p>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
            <p className="text-xl font-bold text-amber-700">{record.keywords.filter(k => k.intent === 'commercial' || k.intent === 'transactional').length}</p>
            <p className="text-[10px] text-amber-600 mt-0.5">Commercial+</p>
          </div>
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-center">
            <p className="text-xl font-bold text-teal-700">{record.keywords.filter(k => k.opportunity_score >= 70).length}</p>
            <p className="text-[10px] text-teal-600 mt-0.5">Score 70+</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Keyword</th>
                <th className="px-3 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => toggleSort('search_volume')}>
                  Volume {sortField === 'search_volume' && (sortDir === 'desc' ? '\u2193' : '\u2191')}
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => toggleSort('difficulty')}>
                  Difficulty {sortField === 'difficulty' && (sortDir === 'desc' ? '\u2193' : '\u2191')}
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Intent</th>
                <th className="px-3 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Funnel</th>
                <th className="px-3 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => toggleSort('relevance')}>
                  Relevance {sortField === 'relevance' && (sortDir === 'desc' ? '\u2193' : '\u2191')}
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => toggleSort('opportunity_score')}>
                  Score {sortField === 'opportunity_score' && (sortDir === 'desc' ? '\u2193' : '\u2191')}
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedKeywords.map((kw) => {
                const idx = kw._idx;
                const isExpanded = expandedRows.has(idx);
                const isGen = generatingPages.has(idx);
                const hasPages = kw.generated_pages && kw.generated_pages.length > 0;

                const volLabel = kw.search_volume >= 10000 ? `${Math.round(kw.search_volume / 1000)}K` : kw.search_volume >= 1000 ? `${(kw.search_volume / 1000).toFixed(1)}K` : String(kw.search_volume);
                const volColor = kw.search_volume >= 10000 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : kw.search_volume >= 1000 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-600 border-gray-200';
                const kdColor = kw.difficulty <= 30 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : kw.difficulty <= 60 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-600 border-red-200';
                const intentColor = kw.intent === 'transactional' ? 'bg-teal-50 text-teal-700 border-teal-200' : kw.intent === 'commercial' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-gray-50 text-gray-600 border-gray-200';
                const funnelColor = kw.funnel === 'decision' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : kw.funnel === 'consideration' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-600 border-gray-200';
                const scoreColor = kw.opportunity_score >= 70 ? 'bg-emerald-500' : kw.opportunity_score >= 50 ? 'bg-amber-500' : 'bg-gray-400';

                return (
                  <React.Fragment key={idx}>
                    <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{kw.keyword}</span>
                          <span className="text-[10px] text-gray-400 capitalize mt-0.5">{kw.keyword_type}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full border ${volColor}`}>
                          {volLabel}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full border ${kdColor}`}>
                          KD {kw.difficulty}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border capitalize ${intentColor}`}>
                          {kw.intent}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border capitalize ${funnelColor}`}>
                          {kw.funnel}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs font-medium text-gray-700">{kw.relevance}%</span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${scoreColor}`} style={{ width: `${kw.opportunity_score}%` }} />
                          </div>
                          <span className="text-xs font-bold text-gray-800">{kw.opportunity_score}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {hasPages ? (
                          <Button variant="ghost" size="sm" onClick={() => {
                            setExpandedRows((prev) => { const next = new Set(prev); next.has(idx) ? next.delete(idx) : next.add(idx); return next; });
                          }} className="text-[11px] h-7 px-2 gap-1">
                            <LayoutList className="w-3 h-3" />
                            {isExpanded ? 'Hide' : 'Pages'}
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => handleGeneratePages(idx)} disabled={isGen} className="text-[11px] h-7 px-2 gap-1">
                            {isGen ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            {isGen ? '...' : 'Pages'}
                          </Button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && kw.generated_pages && kw.generated_pages.length > 0 && (
                      <tr className="bg-slate-50/70">
                        <td colSpan={8} className="px-6 py-3">
                          <div className="flex items-start gap-2 mb-2">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-[10px] text-gray-500">
                              Pages for "<span className="font-medium">{kw.keyword}</span>" — inherit: vol {kw.search_volume}, KD {kw.difficulty}, {kw.intent}, {kw.funnel}, score {kw.opportunity_score}
                            </p>
                          </div>
                          <div className="space-y-1.5 pl-5">
                            {kw.generated_pages.map((page, pi) => (
                              <div key={pi} className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-100 rounded-lg">
                                <span className="text-[10px] font-bold text-gray-400 w-4 text-center shrink-0">{pi + 1}</span>
                                <span className="text-sm text-gray-800 font-medium flex-1">{page.title}</span>
                                <span className="text-xs text-gray-400 font-mono shrink-0">/{page.slug}</span>
                              </div>
                            ))}
                          </div>
                          {kw.reasoning && (
                            <p className="text-[11px] text-gray-500 pl-5 mt-2 italic">{kw.reasoning}</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}