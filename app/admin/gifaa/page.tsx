'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AdminShell } from '@/components/admin-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus, Pencil, Trash2, Eye, FileText, Copy, Check,
  RefreshCw, Lock, Globe, Shield, Server, TriangleAlert as AlertTriangle, Star, X,
  Image as ImageIcon, Upload,
} from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────── */

interface TenantData {
  id: string;
  tenant_key: string;
  public_domain: string;
  site_name: string;
  proxy_secret: string;
  logo_url: string | null;
  header_logo_height: number;
  footer_logo_height: number;
  created_at: string;
}

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

type Tab = 'overview' | 'domains' | 'security' | 'pages';

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'overview', label: 'Overview', icon: <Globe className="w-4 h-4" /> },
  { key: 'domains', label: 'Domains', icon: <Server className="w-4 h-4" /> },
  { key: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
  { key: 'pages', label: 'Pages', icon: <FileText className="w-4 h-4" /> },
];

export default function AdminGifaaPage() {
  return (
    <AdminShell>
      <GifaaDashboard />
    </AdminShell>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────── */

function GifaaDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTenant();
  }, []);

  async function loadTenant() {
    const { data } = await supabase
      .from('gifaa_tenants')
      .select('*')
      .eq('tenant_key', 'gifaa')
      .maybeSingle();
    setTenant(data);
    setLoading(false);
  }

  if (loading) {
    return <p className="p-6 text-gray-400 text-sm">Loading...</p>;
  }

  if (!tenant) {
    return <p className="p-6 text-red-500 text-sm">Gifaa tenant not found in database.</p>;
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gifaa</h1>
        <p className="text-sm text-gray-500 mt-1">Manage tenant settings and content</p>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? 'border-sky-500 text-sky-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab tenant={tenant} onUpdate={loadTenant} />}
      {activeTab === 'domains' && <DomainsTab tenant={tenant} onUpdate={loadTenant} />}
      {activeTab === 'security' && <SecurityTab tenant={tenant} onUpdate={loadTenant} />}
      {activeTab === 'pages' && <PagesTab />}
    </div>
  );
}

/* ─── Overview Tab ───────────────────────────────────────── */

function OverviewTab({ tenant, onUpdate }: { tenant: TenantData; onUpdate: () => void }) {
  const [siteName, setSiteName] = useState(tenant.site_name);
  const [publicDomain, setPublicDomain] = useState(tenant.public_domain);
  const [logoUrl, setLogoUrl] = useState(tenant.logo_url || '');
  const [headerLogoHeight, setHeaderLogoHeight] = useState(tenant.header_logo_height);
  const [footerLogoHeight, setFooterLogoHeight] = useState(tenant.footer_logo_height);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleSave() {
    setSaving(true);
    await supabase
      .from('gifaa_tenants')
      .update({
        site_name: siteName,
        public_domain: publicDomain,
        logo_url: logoUrl || null,
        header_logo_height: headerLogoHeight,
        footer_logo_height: footerLogoHeight,
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
      {/* Logo Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Logo</h2>
        <p className="text-sm text-gray-500 mb-4">This logo appears in the page header and footer instead of the site name text.</p>

        <div className="flex items-start gap-6">
          {/* Preview */}
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

          {/* Upload + URL */}
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

        {/* Logo Size Controls */}
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

      {/* Tenant Details */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tenant Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Tenant Key - readonly */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Tenant Key</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-sm font-mono text-gray-700">{tenant.tenant_key}</span>
            </div>
          </div>

          {/* ID - readonly */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">ID</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-sm font-mono text-gray-600 truncate">{tenant.id}</span>
            </div>
          </div>

          {/* Site Name - editable */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Site Name</label>
            <Input
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Public Domain - editable */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Public Domain</label>
            <Input
              value={publicDomain}
              onChange={(e) => setPublicDomain(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Created At - readonly */}
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

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Active
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
    </div>
  );
}

/* ─── Domains Tab ────────────────────────────────────────── */

function DomainsTab({ tenant, onUpdate }: { tenant: TenantData; onUpdate: () => void }) {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');
  const [adding, setAdding] = useState(false);

  const loadDomains = useCallback(async () => {
    const { data } = await supabase
      .from('gifaa_tenant_domains')
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('is_primary', { ascending: false });
    setDomains(data || []);
    setLoading(false);
  }, [tenant.id]);

  useEffect(() => {
    loadDomains();
  }, [loadDomains]);

  async function handleAdd() {
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

  async function handleRemove(domainId: string) {
    const domain = domains.find((d) => d.id === domainId);
    if (domain?.is_primary) {
      alert('Cannot remove the primary domain. Set another domain as primary first.');
      return;
    }
    if (!confirm(`Remove "${domain?.domain}"?`)) return;
    await supabase.from('gifaa_tenant_domains').delete().eq('id', domainId);
    loadDomains();
  }

  if (loading) return <p className="text-gray-400 text-sm">Loading domains...</p>;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Configured Domains</h2>

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
                  onClick={() => handleRemove(d.id)}
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

        {/* Add domain */}
        <div className="flex items-center gap-2">
          <Input
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="e.g. blog.gifaa.in"
            className="text-sm max-w-xs"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button onClick={handleAdd} disabled={adding || !newDomain.trim()} variant="outline" className="gap-2 text-sm">
            <Plus className="w-4 h-4" />
            Add Domain
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Security Tab ───────────────────────────────────────── */

function SecurityTab({ tenant, onUpdate }: { tenant: TenantData; onUpdate: () => void }) {
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={regenerating}
            className="gap-1.5 shrink-0"
          >
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

      {/* Cloudflare Worker */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Cloudflare Worker Setup</h2>
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
    </div>
  );
}

/* ─── Pages Tab (existing articles list) ─────────────────── */

function PagesTab() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  async function loadArticles() {
    const { data } = await supabase
      .from('gifaa_articles')
      .select('id, slug, title, tenant, category, status, published_at, updated_at')
      .eq('tenant', 'gifaa')
      .order('updated_at', { ascending: false });
    setArticles(data || []);
    setLoading(false);
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
        <Button onClick={() => router.push('/admin/gifaa/edit/new')} variant="outline" className="gap-2">
          <Plus className="w-4 h-4" /> Create your first article
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <Button onClick={() => router.push('/admin/gifaa/edit/new')} className="gap-2">
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
              <th className="text-left px-4 py-3 font-medium text-gray-600">Updated</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
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
                    article.status === 'published'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {article.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(article.updated_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/articles/${article.slug}`, '_blank')}
                      className="h-8 w-8 p-0"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/gifaa/edit/${article.id}`)}
                      className="h-8 w-8 p-0"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(article.id, article.title)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
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
