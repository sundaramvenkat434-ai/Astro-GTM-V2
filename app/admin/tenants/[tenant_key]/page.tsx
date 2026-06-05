'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AdminShell } from '@/components/admin-shell';
import { TenantProvider, useTenant, type TenantData } from '@/components/tenant-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Eye, FileText, Copy, Check, RefreshCw, Lock, Globe, Shield, Server, TriangleAlert as AlertTriangle, Star, X, Image as ImageIcon, Upload, ChartBar as BarChart3, Menu, GripVertical, ExternalLink, ChevronUp, ChevronDown, Palette, Tag, BookOpen, Settings, Brush, LayoutGrid as Layout, Sparkles } from 'lucide-react';
import { AIResearcherModule } from './ai-researcher';

/* ─── Types ──────────────────────────────────────────────── */

interface Domain {
  id: string;
  tenant_id: string;
  domain: string;
  is_primary: boolean;
  created_at: string;
}

interface Article {
  id: string;
  slug: string;
  title: string;
  tenant: string;
  category: string;
  status: string;
  published_at: string | null;
  updated_at: string;
}

type MainTab = 'integration' | 'design' | 'content' | 'pages' | 'ai-researcher';
type IntegrationSubTab = 'client-settings' | 'cdn-settings' | 'analytics';
type DesignSubTab = 'logo' | 'typography' | 'colors';
type ContentSubTab = 'articles-page' | 'navigation' | 'categories';

const MAIN_TABS: { key: MainTab; label: string; icon: React.ReactNode }[] = [
  { key: 'integration', label: 'Integration', icon: <Settings className="w-4 h-4" /> },
  { key: 'design', label: 'Design', icon: <Brush className="w-4 h-4" /> },
  { key: 'content', label: 'Content', icon: <Layout className="w-4 h-4" /> },
  { key: 'pages', label: 'Pages', icon: <FileText className="w-4 h-4" /> },
  { key: 'ai-researcher', label: 'AI Researcher', icon: <Sparkles className="w-4 h-4" /> },
];

const INTEGRATION_SUB_TABS: { key: IntegrationSubTab; label: string }[] = [
  { key: 'client-settings', label: 'Client Settings' },
  { key: 'cdn-settings', label: 'CDN Settings' },
  { key: 'analytics', label: 'Analytics' },
];

const DESIGN_SUB_TABS: { key: DesignSubTab; label: string }[] = [
  { key: 'logo', label: 'Logo' },
  { key: 'typography', label: 'Typography' },
  { key: 'colors', label: 'Colors' },
];

const CONTENT_SUB_TABS: { key: ContentSubTab; label: string }[] = [
  { key: 'articles-page', label: 'Articles Page' },
  { key: 'navigation', label: 'Navigation' },
  { key: 'categories', label: 'Categories' },
];

export default function TenantDashboardPage() {
  const params = useParams();
  const tenantKey = params.tenant_key as string;

  return (
    <AdminShell>
      <TenantProvider tenantKey={tenantKey}>
        <TenantDashboard />
      </TenantProvider>
    </AdminShell>
  );
}

/* ─── Sub-Tab Bar ────────────────────────────────────────── */

function SubTabBar<T extends string>({ tabs, active, onChange }: { tabs: { key: T; label: string }[]; active: T; onChange: (key: T) => void }) {
  return (
    <div className="flex items-center gap-0.5 p-1 bg-gray-100/80 rounded-lg w-fit mb-8">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-all ${
            active === tab.key
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────── */

function TenantDashboard() {
  const { tenant, loading, reload } = useTenant();
  const [mainTab, setMainTab] = useState<MainTab>('integration');
  const [integrationSubTab, setIntegrationSubTab] = useState<IntegrationSubTab>('client-settings');
  const [designSubTab, setDesignSubTab] = useState<DesignSubTab>('logo');
  const [contentSubTab, setContentSubTab] = useState<ContentSubTab>('articles-page');

  if (loading) {
    return <p className="p-6 text-gray-400 text-sm">Loading...</p>;
  }

  if (!tenant) {
    return (
      <div className="p-6">
        <p className="text-red-500 text-sm mb-4">Tenant not found in database.</p>
        <Button variant="outline" onClick={() => window.location.href = '/admin/dashboard'}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{tenant.site_name || tenant.tenant_key}</h1>
        <p className="text-sm text-gray-500 mt-1">Manage settings, design, content, and AI research for this tenant.</p>
      </div>

      {/* Main Tab Bar */}
      <div className="flex items-center gap-1 border-b border-gray-200 mb-8">
        {MAIN_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMainTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
              mainTab === tab.key
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Integration Tab */}
      {mainTab === 'integration' && (
        <div>
          <SubTabBar tabs={INTEGRATION_SUB_TABS} active={integrationSubTab} onChange={setIntegrationSubTab} />
          {integrationSubTab === 'client-settings' && <ClientSettingsSubTab tenant={tenant} onUpdate={reload} />}
          {integrationSubTab === 'cdn-settings' && <CDNSettingsSubTab tenant={tenant} onUpdate={reload} />}
          {integrationSubTab === 'analytics' && <AnalyticsSubTab tenant={tenant} onUpdate={reload} />}
        </div>
      )}

      {/* Design Tab */}
      {mainTab === 'design' && (
        <div>
          <SubTabBar tabs={DESIGN_SUB_TABS} active={designSubTab} onChange={setDesignSubTab} />
          {designSubTab === 'logo' && <LogoSubTab tenant={tenant} onUpdate={reload} />}
          {designSubTab === 'typography' && <TypographySubTab tenant={tenant} onUpdate={reload} />}
          {designSubTab === 'colors' && <ColorsSubTab tenant={tenant} onUpdate={reload} />}
        </div>
      )}

      {/* Content Tab */}
      {mainTab === 'content' && (
        <div>
          <SubTabBar tabs={CONTENT_SUB_TABS} active={contentSubTab} onChange={setContentSubTab} />
          {contentSubTab === 'articles-page' && <ArticlesPageSubTab tenant={tenant} onUpdate={reload} />}
          {contentSubTab === 'navigation' && <NavigationSubTab tenant={tenant} onUpdate={reload} />}
          {contentSubTab === 'categories' && <CategoriesSubTab tenant={tenant} onUpdate={reload} />}
        </div>
      )}

      {/* Pages Tab */}
      {mainTab === 'pages' && <PagesTab />}

      {/* AI Researcher Tab */}
      {mainTab === 'ai-researcher' && <AIResearcherTab tenant={tenant} />}
    </div>
  );
}

/* ─── Integration > Client Settings ─────────────────────── */

function ClientSettingsSubTab({ tenant, onUpdate }: { tenant: TenantData; onUpdate: () => void }) {
  const [siteName, setSiteName] = useState(tenant.site_name);
  const [publicDomain, setPublicDomain] = useState(tenant.public_domain);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [domains, setDomains] = useState<Domain[]>([]);
  const [domainsLoading, setDomainsLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');
  const [adding, setAdding] = useState(false);

  const loadDomains = useCallback(async () => {
    const { data } = await supabase
      .from('gifaa_tenant_domains')
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('is_primary', { ascending: false });
    setDomains(data || []);
    setDomainsLoading(false);
  }, [tenant.id]);

  useEffect(() => {
    loadDomains();
  }, [loadDomains]);

  async function handleSave() {
    setSaving(true);
    await supabase
      .from('gifaa_tenants')
      .update({
        site_name: siteName,
        public_domain: publicDomain,
      })
      .eq('id', tenant.id);
    setSaving(false);
    setSaved(true);
    onUpdate();
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleAddDomain() {
    const trimmed = newDomain.trim().toLowerCase();
    if (!trimmed) return;
    setAdding(true);
    await supabase.from('gifaa_tenant_domains').insert({
      tenant_id: tenant.id,
      domain: trimmed,
      is_primary: false,
    });
    setNewDomain('');
    setAdding(false);
    loadDomains();
  }

  async function handleSetPrimary(domainId: string) {
    await supabase
      .from('gifaa_tenant_domains')
      .update({ is_primary: false })
      .eq('tenant_id', tenant.id);
    await supabase
      .from('gifaa_tenant_domains')
      .update({ is_primary: true })
      .eq('id', domainId);
    const domain = domains.find((d) => d.id === domainId);
    if (domain) {
      await supabase
        .from('gifaa_tenants')
        .update({ public_domain: domain.domain })
        .eq('id', tenant.id);
    }
    loadDomains();
    onUpdate();
  }

  async function handleRemoveDomain(domainId: string) {
    const domain = domains.find((d) => d.id === domainId);
    if (domain?.is_primary) {
      alert('Cannot remove the primary domain. Set another domain as primary first.');
      return;
    }
    if (!confirm(`Remove "${domain?.domain}"?`)) return;
    await supabase.from('gifaa_tenant_domains').delete().eq('id', domainId);
    loadDomains();
  }

  return (
    <div className="space-y-6">
      {/* Tenant Configuration */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tenant Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Tenant Key</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-sm font-mono text-gray-700">{tenant.tenant_key}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">ID</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-sm font-mono text-gray-600 truncate">{tenant.id}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Site Name</label>
            <Input
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Public Domain</label>
            <Input
              value={publicDomain}
              onChange={(e) => setPublicDomain(e.target.value)}
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Created At</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="text-sm text-gray-700">
                {new Date(tenant.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                tenant.status === 'active' ? 'text-green-700' : 'text-gray-500'
              }`}>
                <span className={`w-2 h-2 rounded-full ${tenant.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                {tenant.status === 'active' ? 'Active' : tenant.status}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? 'Saving...' : saved ? <><Check className="w-4 h-4" /> Saved</> : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Domain Configuration */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Domain Configuration</h2>

        {domainsLoading ? (
          <p className="text-gray-400 text-sm">Loading domains...</p>
        ) : (
          <>
            <div className="space-y-2 mb-6">
              {domains.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-lg bg-gray-50/50"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-800">{d.domain}</span>
                    {d.is_primary && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-50 text-sky-700 text-xs font-medium rounded-full">
                        <Star className="w-3 h-3" /> Primary
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {!d.is_primary && (
                      <Button variant="ghost" size="sm" onClick={() => handleSetPrimary(d.id)} className="text-xs h-7">
                        Set Primary
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDomain(d.id)}
                      className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                      disabled={d.is_primary}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {domains.length === 0 && (
                <p className="text-sm text-gray-400 py-4 text-center">No domains configured.</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Input
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="e.g. blog.example.com"
                className="text-sm max-w-xs"
                onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
              />
              <Button onClick={handleAddDomain} disabled={adding || !newDomain.trim()} variant="outline" className="gap-2 text-sm">
                <Plus className="w-4 h-4" />
                Add Domain
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Integration > CDN Settings ─────────────────────────── */

function CDNSettingsSubTab({ tenant, onUpdate }: { tenant: TenantData; onUpdate: () => void }) {
  const [copied, setCopied] = useState(false);
  const [workerCopied, setWorkerCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [revealed, setRevealed] = useState(false);

  function handleCopySecret() {
    navigator.clipboard.writeText(tenant.proxy_secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRegenerate() {
    if (!confirm('Regenerate proxy secret? This will break existing CDN worker configs until updated.')) return;
    setRegenerating(true);
    const newSecret = `gs_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`;
    await supabase
      .from('gifaa_tenants')
      .update({ proxy_secret: newSecret })
      .eq('id', tenant.id);
    setRegenerating(false);
    onUpdate();
  }

  const workerCode = generateWorkerCode(tenant.tenant_key, tenant.proxy_secret, tenant.public_domain);

  function handleCopyWorker() {
    navigator.clipboard.writeText(workerCode);
    setWorkerCopied(true);
    setTimeout(() => setWorkerCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Cloudflare Worker Setup */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">CDN (Cloudflare) Setup</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Deploy this worker to Cloudflare and route it to your domain(s).
            </p>
          </div>
          <Button onClick={handleCopyWorker} className="gap-2">
            {workerCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {workerCopied ? 'Copied' : 'Copy Worker Code'}
          </Button>
        </div>

        <div className="relative rounded-lg overflow-hidden border border-gray-200">
          <pre className="bg-gray-900 text-gray-100 text-xs leading-relaxed p-5 overflow-x-auto max-h-[480px]">
            <code>{workerCode}</code>
          </pre>
        </div>

        <div className="mt-4 p-3 bg-sky-50 border border-sky-200 rounded-lg">
          <p className="text-xs text-sky-800 font-medium mb-1">Route this worker to:</p>
          <p className="text-xs text-sky-700 font-mono">{tenant.public_domain}/*</p>
        </div>
      </div>

      {/* Proxy Secret */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Proxy Secret</h2>
        <p className="text-sm text-gray-500 mb-4">Used by Cloudflare Workers to authenticate requests to the origin.</p>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm text-gray-700 truncate">
            {revealed ? tenant.proxy_secret : '\u2022'.repeat(20)}
          </div>
          <Button variant="outline" size="sm" onClick={() => setRevealed(!revealed)} className="text-xs shrink-0">
            {revealed ? 'Hide' : 'Reveal'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopySecret} className="gap-1.5 shrink-0">
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={regenerating} className="gap-1.5 shrink-0">
            <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        </div>

        <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            Rotating the secret will break existing CDN worker configs until updated.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Integration > Analytics ────────────────────────────── */

function AnalyticsSubTab({ tenant, onUpdate }: { tenant: TenantData; onUpdate: () => void }) {
  const [measurementId, setMeasurementId] = useState(tenant.ga_measurement_id || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = measurementId.trim();
  const isValid = trimmed === '' || /^G-[A-Z0-9]+$/.test(trimmed);

  async function handleSave() {
    if (!isValid) {
      setError('Measurement ID must look like G-XXXXXXXXXX (uppercase letters and digits only).');
      return;
    }
    setError(null);
    setSaving(true);
    await supabase
      .from('gifaa_tenants')
      .update({ ga_measurement_id: trimmed === '' ? null : trimmed })
      .eq('id', tenant.id);
    setSaving(false);
    setSaved(true);
    onUpdate();
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleRemove() {
    setError(null);
    setSaving(true);
    await supabase
      .from('gifaa_tenants')
      .update({ ga_measurement_id: null })
      .eq('id', tenant.id);
    setMeasurementId('');
    setSaving(false);
    setSaved(true);
    onUpdate();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Google Analytics</h2>
            <p className="text-sm text-gray-500 mt-0.5">Track tenant pages with your own GA4 property.</p>
          </div>
        </div>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">GA4 Measurement ID</label>
            <Input
              value={measurementId}
              onChange={(e) => { setMeasurementId(e.target.value); setError(null); }}
              placeholder="G-XXXXXXXXXX"
              className="text-sm font-mono"
            />
            {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving || !isValid} className="gap-2">
              {saving ? 'Saving...' : saved ? <><Check className="w-4 h-4" /> Saved</> : 'Save'}
            </Button>
            {tenant.ga_measurement_id && (
              <Button variant="ghost" onClick={handleRemove} disabled={saving} className="text-red-600 hover:text-red-700">
                Remove
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-100">
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <p>
              The GA script is injected only on pages with <span className="font-mono font-semibold">status = approved</span>.
              Drafts, previews, and published pages are not tracked.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Design > Logo ──────────────────────────────────────── */

function LogoSubTab({ tenant, onUpdate }: { tenant: TenantData; onUpdate: () => void }) {
  const [logoUrl, setLogoUrl] = useState(tenant.logo_url || '');
  const [headerLogoHeight, setHeaderLogoHeight] = useState(tenant.header_logo_height);
  const [footerLogoHeight, setFooterLogoHeight] = useState(tenant.footer_logo_height);
  const [poweredByEnabled, setPoweredByEnabled] = useState(tenant.powered_by_enabled);
  const [poweredByHeight, setPoweredByHeight] = useState(tenant.powered_by_height);
  const [poweredByOpacity, setPoweredByOpacity] = useState(tenant.powered_by_opacity);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleSave() {
    setSaving(true);
    await supabase
      .from('gifaa_tenants')
      .update({
        logo_url: logoUrl || null,
        header_logo_height: headerLogoHeight,
        footer_logo_height: footerLogoHeight,
        powered_by_enabled: poweredByEnabled,
        powered_by_height: poweredByHeight,
        powered_by_opacity: poweredByOpacity,
      })
      .eq('id', tenant.id);
    setSaving(false);
    setSaved(true);
    onUpdate();
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop() || 'png';
    const path = `tenant-logos/${tenant.tenant_key}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('tool-logos').upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });
    if (!error) {
      const { data: urlData } = supabase.storage.from('tool-logos').getPublicUrl(path);
      setLogoUrl(urlData.publicUrl);
    }
    setUploading(false);
  }

  return (
    <div className="space-y-6">
      {/* Client Logo */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Logo</h2>
        <p className="text-sm text-gray-500 mb-4">This logo appears in the page header and footer instead of the site name text.</p>

        <div className="flex items-start gap-6">
          <div className="w-48 h-24 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 shrink-0 overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo preview" className="max-w-full max-h-full object-contain p-2" />
            ) : (
              <div className="text-center">
                <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                <span className="text-xs text-gray-400">No logo</span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Logo URL</label>
              <Input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
                className="text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-gray-400" />
                {uploading ? 'Uploading...' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              {logoUrl && (
                <Button variant="ghost" size="sm" onClick={() => setLogoUrl('')} className="text-xs text-red-500 hover:text-red-700">
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>

        {logoUrl && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-3">Logo Display Size</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Header Height (px)</label>
                <Input
                  type="number"
                  min={16}
                  max={80}
                  value={headerLogoHeight}
                  onChange={(e) => setHeaderLogoHeight(Number(e.target.value) || 32)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Footer Height (px)</label>
                <Input
                  type="number"
                  min={12}
                  max={60}
                  value={footerLogoHeight}
                  onChange={(e) => setFooterLogoHeight(Number(e.target.value) || 24)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Powered by AstroGTM */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Powered by AstroGTM</h2>
            <p className="text-sm text-gray-500 mt-0.5">Badge shown in article page footers with a link back to AstroGTM.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={poweredByEnabled}
              onChange={(e) => setPoweredByEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900" />
          </label>
        </div>

        {poweredByEnabled && (
          <div className="pt-4 border-t border-gray-100 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Logo Height (px)</label>
                <Input
                  type="number"
                  min={12}
                  max={40}
                  value={poweredByHeight}
                  onChange={(e) => setPoweredByHeight(Number(e.target.value) || 20)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Opacity (%)</label>
                <Input
                  type="number"
                  min={10}
                  max={100}
                  value={poweredByOpacity}
                  onChange={(e) => setPoweredByOpacity(Math.min(100, Math.max(10, Number(e.target.value) || 60)))}
                  className="text-sm"
                />
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Preview (exactly as shown in footer)</p>
              <div className="inline-flex items-center gap-1.5" style={{ opacity: poweredByOpacity / 100 }}>
                <span className="text-[11px] text-gray-400 font-medium">Powered by</span>
                <span
                  className="inline-flex items-center px-2 py-0.5 bg-gray-200 rounded text-gray-600 font-bold"
                  style={{ fontSize: `${Math.max(10, poweredByHeight * 0.55)}px`, height: `${poweredByHeight}px` }}
                >
                  AstroGTM
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? 'Saving...' : saved ? <><Check className="w-4 h-4" /> Saved</> : 'Save Logo Settings'}
        </Button>
      </div>
    </div>
  );
}

/* ─── Design > Typography ────────────────────────────────── */

const FONT_OPTIONS = [
  { value: '', label: 'System Default' },
  { value: "'Inter', sans-serif", label: 'Inter' },
  { value: "'Georgia', serif", label: 'Georgia' },
  { value: "'Merriweather', serif", label: 'Merriweather' },
  { value: "'Roboto', sans-serif", label: 'Roboto' },
  { value: "'Lora', serif", label: 'Lora' },
  { value: "'Playfair Display', serif", label: 'Playfair Display' },
  { value: "'Source Sans Pro', sans-serif", label: 'Source Sans Pro' },
  { value: "'DM Sans', sans-serif", label: 'DM Sans' },
  { value: "'Nunito', sans-serif", label: 'Nunito' },
];

function TypographySubTab({ tenant, onUpdate }: { tenant: TenantData; onUpdate: () => void }) {
  const [fontFamily, setFontFamily] = useState(tenant.theme_font_family || '');
  const [fontSizeBody, setFontSizeBody] = useState(tenant.theme_font_size_body);
  const [fontSizeHeading, setFontSizeHeading] = useState(tenant.theme_font_size_heading);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await supabase
      .from('gifaa_tenants')
      .update({
        theme_font_family: fontFamily || null,
        theme_font_size_body: fontSizeBody,
        theme_font_size_heading: fontSizeHeading,
      })
      .eq('id', tenant.id);
    setSaving(false);
    setSaved(true);
    onUpdate();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Typography</h2>
        <p className="text-sm text-gray-500 mb-5">Control the fonts and sizes used on tenant pages.</p>

        <div className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Font Family</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
            >
              {FONT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Body Font Size (px)</label>
              <Input type="number" min={12} max={24} value={fontSizeBody} onChange={(e) => setFontSizeBody(Number(e.target.value) || 16)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Heading Font Size (px)</label>
              <Input type="number" min={20} max={64} value={fontSizeHeading} onChange={(e) => setFontSizeHeading(Number(e.target.value) || 32)} />
            </div>
          </div>

          {/* Typography Preview */}
          <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
            <p className="text-xs font-medium text-gray-400 mb-3">Preview</p>
            <h3 style={{ fontFamily: fontFamily || 'inherit', fontSize: `${fontSizeHeading}px`, lineHeight: 1.2 }} className="font-bold text-gray-900 mb-2">
              Heading Preview
            </h3>
            <p style={{ fontFamily: fontFamily || 'inherit', fontSize: `${fontSizeBody}px`, lineHeight: 1.6 }} className="text-gray-700">
              This is how body text will appear on your tenant pages. The font family and size are applied globally across all articles and listing pages.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? 'Saving...' : saved ? <><Check className="w-4 h-4" /> Saved</> : 'Save Typography'}
        </Button>
      </div>
    </div>
  );
}

/* ─── Design > Colors ────────────────────────────────────── */

function ColorsSubTab({ tenant, onUpdate }: { tenant: TenantData; onUpdate: () => void }) {
  const [bgColor, setBgColor] = useState(tenant.theme_bg_color || '');
  const [headerBgColor, setHeaderBgColor] = useState(tenant.theme_header_bg_color || '');
  const [headerTextColor, setHeaderTextColor] = useState(tenant.theme_header_text_color || '');
  const [footerBgColor, setFooterBgColor] = useState(tenant.theme_footer_bg_color || '');
  const [footerTextColor, setFooterTextColor] = useState(tenant.theme_footer_text_color || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await supabase
      .from('gifaa_tenants')
      .update({
        theme_bg_color: bgColor.trim() || null,
        theme_header_bg_color: headerBgColor.trim() || null,
        theme_header_text_color: headerTextColor.trim() || null,
        theme_footer_bg_color: footerBgColor.trim() || null,
        theme_footer_text_color: footerTextColor.trim() || null,
      })
      .eq('id', tenant.id);
    setSaving(false);
    setSaved(true);
    onUpdate();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Page Colors */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Page Colors</h2>
        <p className="text-sm text-gray-500 mb-5">Customize the background color for your homepage and articles listing.</p>

        <div className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Background Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={bgColor || '#ffffff'} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
              <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} placeholder="#ffffff (default)" className="max-w-[160px] font-mono text-sm" />
              {bgColor && (
                <Button variant="ghost" size="sm" onClick={() => setBgColor('')} className="text-xs text-gray-500">Clear</Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Header Colors */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Header Colors</h2>
        <p className="text-sm text-gray-500 mb-5">Customize the header bar appearance on tenant pages.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mb-5">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Background</label>
            <div className="flex items-center gap-2">
              <input type="color" value={headerBgColor || '#ffffff'} onChange={(e) => setHeaderBgColor(e.target.value)} className="w-8 h-8 rounded border border-gray-200 cursor-pointer p-0.5" />
              <Input value={headerBgColor} onChange={(e) => setHeaderBgColor(e.target.value)} placeholder="#ffffff" className="font-mono text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Text Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={headerTextColor || '#111827'} onChange={(e) => setHeaderTextColor(e.target.value)} className="w-8 h-8 rounded border border-gray-200 cursor-pointer p-0.5" />
              <Input value={headerTextColor} onChange={(e) => setHeaderTextColor(e.target.value)} placeholder="#111827" className="font-mono text-sm" />
            </div>
          </div>
        </div>

        {/* Header Preview */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-5 py-3 flex items-center justify-between" style={{ backgroundColor: headerBgColor || '#ffffff', color: headerTextColor || '#111827' }}>
            <span className="text-sm font-bold">{tenant.site_name || 'Site Name'}</span>
            <div className="flex items-center gap-4">
              <span className="text-xs opacity-80">Home</span>
              <span className="text-xs opacity-80">About</span>
              <span className="text-xs opacity-80">Contact</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Colors */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Footer Colors</h2>
        <p className="text-sm text-gray-500 mb-5">Customize the footer appearance on tenant pages.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mb-5">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Background</label>
            <div className="flex items-center gap-2">
              <input type="color" value={footerBgColor || '#111827'} onChange={(e) => setFooterBgColor(e.target.value)} className="w-8 h-8 rounded border border-gray-200 cursor-pointer p-0.5" />
              <Input value={footerBgColor} onChange={(e) => setFooterBgColor(e.target.value)} placeholder="#111827" className="font-mono text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Text Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={footerTextColor || '#ffffff'} onChange={(e) => setFooterTextColor(e.target.value)} className="w-8 h-8 rounded border border-gray-200 cursor-pointer p-0.5" />
              <Input value={footerTextColor} onChange={(e) => setFooterTextColor(e.target.value)} placeholder="#ffffff" className="font-mono text-sm" />
            </div>
          </div>
        </div>

        {/* Footer Preview */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-5 py-4" style={{ backgroundColor: footerBgColor || '#111827', color: footerTextColor || '#ffffff' }}>
            <span className="text-xs font-medium opacity-80">{tenant.site_name || 'Site Name'}</span>
            <p className="text-[10px] mt-1 opacity-60">All rights reserved.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? 'Saving...' : saved ? <><Check className="w-4 h-4" /> Saved</> : 'Save Colors'}
        </Button>
      </div>
    </div>
  );
}

/* ─── Content > Articles Page ────────────────────────────── */

function ArticlesPageSubTab({ tenant, onUpdate }: { tenant: TenantData; onUpdate: () => void }) {
  const [metaTitle, setMetaTitle] = useState(tenant.articles_meta_title || '');
  const [metaDescription, setMetaDescription] = useState(tenant.articles_meta_description || '');
  const [pageHeading, setPageHeading] = useState(tenant.articles_page_heading || '');
  const [pageSubtitle, setPageSubtitle] = useState(tenant.articles_page_subtitle || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await supabase
      .from('gifaa_tenants')
      .update({
        articles_meta_title: metaTitle.trim() || null,
        articles_meta_description: metaDescription.trim() || null,
        articles_page_heading: pageHeading.trim() || null,
        articles_page_subtitle: pageSubtitle.trim() || null,
      })
      .eq('id', tenant.id);
    setSaving(false);
    setSaved(true);
    onUpdate();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Articles Page Appearance */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Articles Page Appearance</h2>
        <p className="text-sm text-gray-500 mb-5">Control the heading and subtitle shown on your /articles listing page.</p>

        <div className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Page Heading</label>
            <Input value={pageHeading} onChange={(e) => setPageHeading(e.target.value)} placeholder="e.g. Our Blog" />
            <p className="text-xs text-gray-400 mt-1">Displayed as the main H1 heading on the articles page. Defaults to &quot;Articles&quot; if empty.</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Page Subtitle</label>
            <Input value={pageSubtitle} onChange={(e) => setPageSubtitle(e.target.value)} placeholder="e.g. Insights, guides, and stories from our team" />
            <p className="text-xs text-gray-400 mt-1">Short description shown below the heading.</p>
          </div>
        </div>

        {/* Inline Preview */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-400 mb-3">Preview</p>
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{pageHeading || 'Articles'}</h1>
            <p className="text-sm text-gray-500">{pageSubtitle || 'Your subtitle appears here'}</p>
          </div>
        </div>
      </div>

      {/* Articles Page SEO */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Articles Page SEO</h2>
        <p className="text-sm text-gray-500 mb-5">Meta tags for the /articles listing page. Shown in search results and social shares.</p>

        <div className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Meta Title</label>
            <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="e.g. Blog | Company Name" />
            <p className="text-xs text-gray-400 mt-1">{metaTitle.length}/60 characters</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Meta Description</label>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="e.g. Read our latest articles on..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none h-20"
            />
            <p className="text-xs text-gray-400 mt-1">{metaDescription.length}/155 characters</p>
          </div>
        </div>

        {(metaTitle || metaDescription) && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-400 mb-2">Search Engine Result Preview</p>
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg">
              <p className="text-blue-700 text-sm font-medium truncate">{metaTitle || tenant.site_name}</p>
              <p className="text-green-700 text-xs truncate">https://{tenant.public_domain}/articles</p>
              <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{metaDescription || 'No description set'}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? 'Saving...' : saved ? <><Check className="w-4 h-4" /> Saved</> : 'Save Articles Page Settings'}
        </Button>
      </div>
    </div>
  );
}

/* ─── Content > Navigation ───────────────────────────────── */

interface HeaderMenuItem {
  label: string;
  url: string;
}

interface FooterLink {
  heading: string;
  text: string;
  url: string;
}

function NavigationSubTab({ tenant, onUpdate }: { tenant: TenantData; onUpdate: () => void }) {
  const [headerItems, setHeaderItems] = useState<HeaderMenuItem[]>(tenant.header_menu_items || []);
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>(tenant.footer_links || []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await supabase
      .from('gifaa_tenants')
      .update({
        header_menu_items: headerItems,
        footer_links: footerLinks,
      })
      .eq('id', tenant.id);
    setSaving(false);
    setSaved(true);
    onUpdate();
    setTimeout(() => setSaved(false), 2000);
  }

  function addHeaderItem() { setHeaderItems([...headerItems, { label: '', url: '' }]); }
  function updateHeaderItem(index: number, patch: Partial<HeaderMenuItem>) {
    const items = [...headerItems]; items[index] = { ...items[index], ...patch }; setHeaderItems(items);
  }
  function removeHeaderItem(index: number) { setHeaderItems(headerItems.filter((_, i) => i !== index)); }
  function moveHeaderItem(index: number, dir: -1 | 1) {
    const items = [...headerItems]; const target = index + dir;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]]; setHeaderItems(items);
  }

  function addFooterLink() { setFooterLinks([...footerLinks, { heading: '', text: '', url: '' }]); }
  function updateFooterLink(index: number, patch: Partial<FooterLink>) {
    const links = [...footerLinks]; links[index] = { ...links[index], ...patch }; setFooterLinks(links);
  }
  function removeFooterLink(index: number) { setFooterLinks(footerLinks.filter((_, i) => i !== index)); }
  function moveFooterLink(index: number, dir: -1 | 1) {
    const links = [...footerLinks]; const target = index + dir;
    if (target < 0 || target >= links.length) return;
    [links[index], links[target]] = [links[target], links[index]]; setFooterLinks(links);
  }

  return (
    <div className="space-y-8">
      {/* Header Menu Items */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Header Menu</h2>
            <p className="text-sm text-gray-500 mt-0.5">Navigation links shown in the site header. Displayed on all article pages.</p>
          </div>
          <Button onClick={addHeaderItem} variant="outline" size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Item
          </Button>
        </div>
        <div className="p-6">
          {headerItems.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
              <Menu className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-1">No menu items configured</p>
              <p className="text-xs text-gray-400">Add navigation links that appear in the header alongside the logo.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {headerItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50/30 group">
                  <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <Input value={item.label} onChange={(e) => updateHeaderItem(i, { label: e.target.value })} placeholder="Label (e.g. Home)" className="text-sm" />
                    <Input value={item.url} onChange={(e) => updateHeaderItem(i, { url: e.target.value })} placeholder="URL (e.g. https://example.com)" className="text-sm font-mono" />
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={() => moveHeaderItem(i, -1)} disabled={i === 0} className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded"><ChevronUp className="w-3.5 h-3.5" /></button>
                    <button onClick={() => moveHeaderItem(i, 1)} disabled={i === headerItems.length - 1} className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded"><ChevronDown className="w-3.5 h-3.5" /></button>
                    <button onClick={() => removeHeaderItem(i)} className="p-1.5 text-red-400 hover:text-red-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {headerItems.length > 0 && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-3">Preview</p>
              <div className="border border-gray-200 rounded-lg px-4 py-3 bg-white flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900 italic" style={{ fontFamily: "'Georgia', serif" }}>
                  {tenant.site_name.toLowerCase()}
                </span>
                <nav className="flex items-center gap-5">
                  {headerItems.filter(i => i.label).map((item, i) => (
                    <span key={i} className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors cursor-default">{item.label}</span>
                  ))}
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Links */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Footer Links</h2>
            <p className="text-sm text-gray-500 mt-0.5">Links displayed in the page footer. Each can have a heading, description, and URL.</p>
          </div>
          <Button onClick={addFooterLink} variant="outline" size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Link
          </Button>
        </div>
        <div className="p-6">
          {footerLinks.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
              <ExternalLink className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-1">No footer links configured</p>
              <p className="text-xs text-gray-400">Add links with headings and descriptions for the site footer.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {footerLinks.map((link, i) => (
                <div key={i} className="p-4 border border-gray-200 rounded-lg bg-gray-50/30 group">
                  <div className="flex items-start gap-3">
                    <GripVertical className="w-4 h-4 text-gray-300 shrink-0 mt-2" />
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wide font-medium text-gray-400 mb-1">Heading</label>
                          <Input value={link.heading} onChange={(e) => updateFooterLink(i, { heading: e.target.value })} placeholder="e.g. About Us" className="text-sm" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-wide font-medium text-gray-400 mb-1">URL</label>
                          <Input value={link.url} onChange={(e) => updateFooterLink(i, { url: e.target.value })} placeholder="https://..." className="text-sm font-mono" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wide font-medium text-gray-400 mb-1">Description (optional)</label>
                        <Input value={link.text} onChange={(e) => updateFooterLink(i, { text: e.target.value })} placeholder="Short description for this link..." className="text-sm" />
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 shrink-0">
                      <button onClick={() => moveFooterLink(i, -1)} disabled={i === 0} className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded"><ChevronUp className="w-3.5 h-3.5" /></button>
                      <button onClick={() => moveFooterLink(i, 1)} disabled={i === footerLinks.length - 1} className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded"><ChevronDown className="w-3.5 h-3.5" /></button>
                      <button onClick={() => removeFooterLink(i)} className="p-1.5 text-red-400 hover:text-red-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {footerLinks.length > 0 && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-3">Preview</p>
              <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {footerLinks.filter(l => l.heading || l.url).map((link, i) => (
                    <div key={i} className="space-y-1">
                      {link.heading && <p className="text-xs font-semibold text-gray-900">{link.heading}</p>}
                      {link.text && <p className="text-[11px] text-gray-500 leading-relaxed">{link.text}</p>}
                      {link.url && <p className="text-[11px] text-sky-600 font-mono truncate">{link.url}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? 'Saving...' : saved ? <><Check className="w-4 h-4" /> Saved</> : 'Save Navigation'}
        </Button>
        <p className="text-xs text-gray-400">Changes affect all article pages for this tenant.</p>
      </div>
    </div>
  );
}

/* ─── Content > Categories ───────────────────────────────── */

function CategoriesSubTab({ tenant, onUpdate }: { tenant: TenantData; onUpdate: () => void }) {
  const [categories, setCategories] = useState<string[]>(tenant.default_categories || []);
  const [newCategory, setNewCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function addCategory() {
    const trimmed = newCategory.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    setCategories([...categories, trimmed]);
    setNewCategory('');
  }

  function removeCategory(index: number) {
    setCategories(categories.filter((_, i) => i !== index));
  }

  function moveCategory(index: number, dir: -1 | 1) {
    const arr = [...categories];
    const target = index + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    setCategories(arr);
  }

  async function handleSave() {
    setSaving(true);
    await supabase
      .from('gifaa_tenants')
      .update({ default_categories: categories })
      .eq('id', tenant.id);
    setSaving(false);
    setSaved(true);
    onUpdate();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Default Categories</h2>
        <p className="text-sm text-gray-500 mb-5">
          Define default categories for this tenant. These appear as suggestions in the article editor category field. Authors can still type custom categories.
        </p>

        <div className="space-y-2 mb-5">
          {categories.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
              <Tag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-1">No categories defined</p>
              <p className="text-xs text-gray-400">Add categories below to give article authors quick suggestions.</p>
            </div>
          ) : (
            categories.map((cat, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 group">
                <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
                <span className="flex-1 text-sm text-gray-800">{cat}</span>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => moveCategory(i, -1)} disabled={i === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded">
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => moveCategory(i, 1)} disabled={i === categories.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => removeCategory(i)} className="p-1 text-red-400 hover:text-red-600 rounded">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="e.g. Wedding Gifts"
            className="text-sm max-w-xs"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCategory(); } }}
          />
          <Button onClick={addCategory} disabled={!newCategory.trim()} variant="outline" className="gap-2 text-sm">
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? 'Saving...' : saved ? <><Check className="w-4 h-4" /> Saved</> : 'Save Categories'}
        </Button>
        <p className="text-xs text-gray-400">{categories.length} categor{categories.length === 1 ? 'y' : 'ies'} configured</p>
      </div>
    </div>
  );
}

/* ─── Pages Tab ──────────────────────────────────────────── */

interface ArticleAnalytics {
  views: number;
  unique_users: number;
  cta_clicks: number;
}

function PagesTab() {
  const router = useRouter();
  const { tenantKey } = useTenant();
  const [articles, setArticles] = useState<Article[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, ArticleAnalytics>>({});
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadArticles();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadArticles() {
    const { data } = await supabase
      .from('gifaa_articles')
      .select('id, slug, title, tenant, category, status, published_at, updated_at')
      .eq('tenant', tenantKey)
      .order('updated_at', { ascending: false });
    const articleList = data || [];
    setArticles(articleList);
    setLoading(false);

    if (articleList.length > 0) {
      loadAnalytics(articleList.map((a) => a.id));
    }
  }

  async function loadAnalytics(articleIds: string[]) {
    const { data } = await supabase
      .from('gifaa_page_views')
      .select('article_id, visitor_hash, event_type')
      .in('article_id', articleIds);

    if (!data) return;

    const map: Record<string, ArticleAnalytics> = {};
    for (const id of articleIds) {
      map[id] = { views: 0, unique_users: 0, cta_clicks: 0 };
    }

    const uniqueVisitors: Record<string, Set<string>> = {};
    for (const row of data) {
      if (!map[row.article_id]) continue;
      if (row.event_type === 'view') {
        map[row.article_id].views++;
        if (!uniqueVisitors[row.article_id]) uniqueVisitors[row.article_id] = new Set();
        uniqueVisitors[row.article_id].add(row.visitor_hash);
      } else if (row.event_type === 'cta_click') {
        map[row.article_id].cta_clicks++;
      }
    }

    for (const id of articleIds) {
      if (uniqueVisitors[id]) {
        map[id].unique_users = uniqueVisitors[id].size;
      }
    }

    setAnalytics(map);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await supabase.from('gifaa_articles').delete().eq('id', id);
    setArticles((prev) => prev.filter((a) => a.id !== id));
  }

  if (loading) return <p className="text-gray-400 text-sm py-10 text-center">Loading...</p>;

  if (articles.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
        <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm mb-4">No articles yet</p>
        <Button onClick={() => router.push(`/admin/tenants/${tenantKey}/edit/new`)} variant="outline" className="gap-2">
          <Plus className="w-4 h-4" /> Create your first article
        </Button>
      </div>
    );
  }

  const statuses = ['all', ...Array.from(new Set(articles.map(a => a.status)))];
  const filtered = articles.filter(a => {
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchesSearch = !searchQuery || a.title?.toLowerCase().includes(searchQuery.toLowerCase()) || a.slug?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3 flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="text-sm max-w-xs"
          />
          <div className="flex items-center gap-1">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterStatus === status
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={() => router.push(`/admin/tenants/${tenantKey}/edit/new`)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Article
        </Button>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-center px-3 py-3 font-medium text-gray-600">Views</th>
              <th className="text-center px-3 py-3 font-medium text-gray-600">Users</th>
              <th className="text-center px-3 py-3 font-medium text-gray-600">CTA</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Updated</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((article) => {
              const stats = analytics[article.id];
              return (
                <tr key={article.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{article.title || 'Untitled'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">/articles/{article.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{article.category || '\u2014'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      article.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700'
                        : article.status === 'published'
                        ? 'bg-blue-50 text-blue-700'
                        : article.status === 'preview'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-xs font-medium text-gray-700">{stats?.views ?? '\u2014'}</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-xs font-medium text-gray-700">{stats?.unique_users ?? '\u2014'}</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-xs font-medium text-gray-700">{stats?.cta_clicks ?? '\u2014'}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(article.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => window.open(`/articles/${article.slug}?preview=true`, '_blank')} className="h-8 w-8 p-0" title="Preview">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/tenants/${tenantKey}/edit/${article.id}`)} className="h-8 w-8 p-0" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(article.id, article.title)} className="h-8 w-8 p-0 text-red-500 hover:text-red-700" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">
                  No articles match your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-3">{filtered.length} of {articles.length} articles shown</p>
    </div>
  );
}

/* ─── AI Researcher Tab ──────────────────────────────────── */

function AIResearcherTab({ tenant }: { tenant: TenantData }) {
  return <AIResearcherModule tenantId={tenant.id} tenantKey={tenant.tenant_key} />;
}

/* ─── Worker Code Generator ──────────────────────────────── */

function generateWorkerCode(tenantKey: string, proxySecret: string, domain: string): string {
  return `// Cloudflare Worker for ${domain}
// Routes: ${domain}/*

const ORIGIN = "https://astrogtm.com";
const TENANT_KEY = "${tenantKey}";
const PROXY_SECRET = "${proxySecret}";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Build the origin URL preserving path and query
    const originUrl = new URL(url.pathname + url.search, ORIGIN);

    // Clone headers and inject tenant identification
    const headers = new Headers(request.headers);
    headers.set("x-site", TENANT_KEY);
    headers.set("x-secret", PROXY_SECRET);
    headers.set("x-forwarded-host", url.hostname);

    // Forward the request to origin
    const response = await fetch(originUrl.toString(), {
      method: request.method,
      headers,
      body: request.method !== "GET" && request.method !== "HEAD"
        ? request.body
        : undefined,
      redirect: "manual",
    });

    // Return the response with CORS headers
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("X-Served-By", "cloudflare-worker");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  },
};`;
}
