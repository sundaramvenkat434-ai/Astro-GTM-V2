'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { AdminShell } from '@/components/admin-shell';
import { BadgeCheck, Trash2, Check, X, Loader as Loader2, ExternalLink, Calendar, Mail, Linkedin, Globe } from 'lucide-react';
import { format } from 'date-fns';

interface Claim {
  id: string;
  tool_id: string;
  tool_name: string;
  name: string;
  email: string;
  linkedin: string | null;
  website: string | null;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
};

export default function AdminClaimsPage() {
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const q = supabase.from('listing_claims').select('*').order('submitted_at', { ascending: false });
    const { data } = await q;
    setClaims((data || []) as Claim[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/admin/login'); return; }
      load();
    });
  }, [router, load]);

  async function approve(claim: Claim) {
    setActionId(claim.id);
    await supabase.from('listing_claims').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', claim.id);
    await supabase.from('tool_pages').update({ is_claimed: true }).eq('id', claim.tool_id);
    setClaims(prev => prev.map(c => c.id === claim.id ? { ...c, status: 'approved', reviewed_at: new Date().toISOString() } : c));
    setActionId(null);
  }

  async function reject(claim: Claim) {
    setActionId(claim.id);
    await supabase.from('listing_claims').update({ status: 'rejected', reviewed_at: new Date().toISOString() }).eq('id', claim.id);
    setClaims(prev => prev.map(c => c.id === claim.id ? { ...c, status: 'rejected', reviewed_at: new Date().toISOString() } : c));
    setActionId(null);
  }

  async function deleteClaim(id: string) {
    setActionId(id);
    await supabase.from('listing_claims').delete().eq('id', id);
    setClaims(prev => prev.filter(c => c.id !== id));
    setActionId(null);
  }

  const filtered = filter === 'all' ? claims : claims.filter(c => c.status === filter);
  const counts = { all: claims.length, pending: claims.filter(c => c.status === 'pending').length, approved: claims.filter(c => c.status === 'approved').length, rejected: claims.filter(c => c.status === 'rejected').length };

  if (loading) {
    return (
      <AdminShell>
        <div className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="p-6">
        {/* Filter tabs */}
        <div className="flex gap-1 mb-6 bg-white border border-slate-200 rounded-xl p-1 w-fit">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${filter === f ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {f} ({counts[f]})
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <BadgeCheck className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-400">No {filter === 'all' ? '' : filter} claims</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(claim => (
              <div key={claim.id} className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${STATUS_STYLES[claim.status]}`}>
                        {claim.status}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">
                        Claiming: <Link href={`/admin/edit/${claim.tool_id}`} className="text-sky-600 hover:underline">{claim.tool_name}</Link>
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-400 w-16 shrink-0">Name</span>
                        <span>{claim.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <a href={`mailto:${claim.email}`} className="text-sky-600 hover:underline">{claim.email}</a>
                      </div>
                      {claim.linkedin && (
                        <div className="flex items-center gap-1.5">
                          <Linkedin className="w-3 h-3 text-slate-400 shrink-0" />
                          <a href={claim.linkedin} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline truncate">{claim.linkedin}</a>
                        </div>
                      )}
                      {claim.website && (
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                          <a href={claim.website} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline truncate">{claim.website}</a>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{format(new Date(claim.submitted_at), 'MMM d, yyyy — HH:mm')}</span>
                      </div>
                      {claim.reviewed_at && (
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Reviewed {format(new Date(claim.reviewed_at), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {claim.status === 'pending' && (
                      <>
                        <button
                          onClick={() => approve(claim)}
                          disabled={actionId === claim.id}
                          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                        >
                          {actionId === claim.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          Approve
                        </button>
                        <button
                          onClick={() => reject(claim)}
                          disabled={actionId === claim.id}
                          className="inline-flex items-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                        >
                          <X className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </>
                    )}
                    {claim.status === 'approved' && (
                      <Link
                        href={`/admin/edit/${claim.tool_id}`}
                        className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Edit Listing
                      </Link>
                    )}
                    <button
                      onClick={() => deleteClaim(claim.id)}
                      disabled={actionId === claim.id}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-60"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
