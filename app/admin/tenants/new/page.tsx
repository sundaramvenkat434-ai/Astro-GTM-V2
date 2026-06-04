'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AdminShell } from '@/components/admin-shell';
import { buildNewTenantPayload } from '@/lib/tenant-defaults';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Loader as Loader2 } from 'lucide-react';

const TENANT_KEY_PATTERN = /^[a-z][a-z0-9-]*[a-z0-9]$/;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
}

export default function NewTenantPage() {
  return (
    <AdminShell>
      <NewTenantForm />
    </AdminShell>
  );
}

function NewTenantForm() {
  const router = useRouter();
  const [siteName, setSiteName] = useState('');
  const [tenantKey, setTenantKey] = useState('');
  const [publicDomain, setPublicDomain] = useState('');
  const [keyEdited, setKeyEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleSiteNameChange(value: string) {
    setSiteName(value);
    if (!keyEdited) {
      setTenantKey(slugify(value));
    }
  }

  function handleKeyChange(value: string) {
    setTenantKey(value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
    setKeyEdited(true);
  }

  const keyValid = tenantKey.length >= 2 && tenantKey.length <= 30 && TENANT_KEY_PATTERN.test(tenantKey);
  const formValid = siteName.trim().length > 0 && keyValid && publicDomain.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formValid) return;
    setSaving(true);
    setError('');

    const { data: existing } = await supabase
      .from('gifaa_tenants')
      .select('id')
      .eq('tenant_key', tenantKey)
      .maybeSingle();

    if (existing) {
      setError(`Tenant key "${tenantKey}" is already taken.`);
      setSaving(false);
      return;
    }

    const payload = buildNewTenantPayload({
      tenant_key: tenantKey,
      site_name: siteName.trim(),
      public_domain: publicDomain.trim().toLowerCase(),
    });

    const { data, error: rpcError } = await supabase.rpc('create_tenant_with_domain', {
      p_tenant_key: payload.tenant_key,
      p_site_name: payload.site_name,
      p_public_domain: payload.public_domain,
      p_proxy_secret: payload.proxy_secret,
      p_logo_url: payload.logo_url,
      p_header_logo_height: payload.header_logo_height,
      p_footer_logo_height: payload.footer_logo_height,
      p_powered_by_enabled: payload.powered_by_enabled,
      p_powered_by_height: payload.powered_by_height,
      p_powered_by_opacity: payload.powered_by_opacity,
      p_ga_measurement_id: payload.ga_measurement_id,
      p_header_menu_items: JSON.stringify(payload.header_menu_items),
      p_footer_links: JSON.stringify(payload.footer_links),
      p_status: payload.status,
    });

    if (rpcError) {
      if (rpcError.message?.includes('duplicate key') || rpcError.message?.includes('unique')) {
        setError('A tenant with this key or domain already exists.');
      } else {
        setError(rpcError.message || 'Failed to create tenant.');
      }
      setSaving(false);
      return;
    }

    router.push(`/admin/tenants/${tenantKey}`);
  }

  return (
    <div className="p-6 max-w-lg">
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <h1 className="text-xl font-bold text-gray-900">Add Tenant</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Site Name</label>
            <Input
              value={siteName}
              onChange={(e) => handleSiteNameChange(e.target.value)}
              placeholder="e.g. My Client Blog"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Tenant Key</label>
            <Input
              value={tenantKey}
              onChange={(e) => handleKeyChange(e.target.value)}
              placeholder="e.g. my-client-blog"
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Permanent identifier. 2-30 characters, lowercase letters, numbers, and hyphens.
            </p>
            {tenantKey.length > 0 && !keyValid && (
              <p className="text-xs text-red-500 mt-1">Must start and end with a letter/number, 2-30 chars, lowercase only.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Public Domain</label>
            <Input
              value={publicDomain}
              onChange={(e) => setPublicDomain(e.target.value)}
              placeholder="e.g. blog.example.com"
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              The domain where articles will be served. Set up the Cloudflare Worker after creation.
            </p>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" disabled={!formValid || saving} className="gap-2 w-full">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {saving ? 'Creating...' : 'Create Tenant'}
        </Button>
      </form>
    </div>
  );
}
