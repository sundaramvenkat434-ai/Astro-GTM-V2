'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Globe, Upload, FileText, X, Check, Loader as Loader2, Target, Users, Package, Search, Lightbulb, Brain, Link2, Swords, Key, LayoutList, Pencil, Trash2, Plus, ArrowRight, ChartBar as BarChart3, Info } from 'lucide-react';

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
      <div className="flex items-center gap-1 mb-6">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.key
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
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
      {activeTab === 'page-ideas' && <ComingSoonTab title="Page Ideas" description="Generate content ideas and page concepts driven by keyword opportunities and audience intent." />}
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
