'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AdminShell } from '@/components/admin-shell';
import { Button } from '@/components/ui/button';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader as Loader2,
  Save,
  Eye,
  EyeOff,
  ShieldCheck,
  Clock,
  CalendarDays,
  TriangleAlert as AlertTriangle,
  CircleCheck as CheckCircle2,
  Mail,
  User,
  KeyRound,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string;
  auth_user_id: string | null;
  email: string;
  display_name: string;
  created_at: string;
  last_login_at: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeAgo(iso: string | null) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

async function callEdgeFn(method: string, body?: object, params?: Record<string, string>) {
  const { data: { session } } = await supabase.auth.getSession();
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/manage-admin-users`;
  const url = params ? `${base}?${new URLSearchParams(params)}` : base;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

// ── Modals ────────────────────────────────────────────────────────────────────

function AddUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setSaving(true);
    setError('');
    const res = await callEdgeFn('POST', { email: email.trim(), password, display_name: displayName.trim() });
    setSaving(false);
    if (res.error) { setError(res.error); return; }
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
              <Plus className="w-4 h-4 text-sky-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Add Admin User</p>
              <p className="text-[11px] text-slate-500">Grant full admin panel access</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 bg-slate-50"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Display name <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 bg-slate-50"
                placeholder="Jane Smith"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type={showPw ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 bg-slate-50"
                placeholder="Min. 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400">Minimum 8 characters</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-700">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-9 text-sm flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving || !email.trim() || !password.trim()}
              className="h-9 text-sm flex-1 bg-slate-900 hover:bg-slate-800 text-white"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Plus className="w-3.5 h-3.5 mr-2" />}
              {saving ? 'Creating...' : 'Create Admin'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditUserModal({
  user,
  onClose,
  onSaved,
}: {
  user: AdminUser;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [displayName, setDisplayName] = useState(user.display_name);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const body: Record<string, string> = {
      id: user.id,
      auth_user_id: user.auth_user_id ?? '',
      display_name: displayName,
    };
    if (password.trim()) body.password = password;
    const res = await callEdgeFn('PUT', body);
    setSaving(false);
    if (res.error) { setError(res.error); return; }
    setSuccess(true);
    onSaved();
    setTimeout(onClose, 800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Pencil className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Edit Admin User</p>
              <p className="text-[11px] text-slate-500 truncate max-w-[220px]">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Display name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 bg-slate-50"
                placeholder="Display name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              New password <span className="text-slate-400 normal-case font-normal">(leave blank to keep current)</span>
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type={showPw ? 'text' : 'password'}
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 bg-slate-50"
                placeholder="Leave blank to keep current"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-700">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <p className="text-[11px] text-emerald-700">Saved successfully</p>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-9 text-sm flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="h-9 text-sm flex-1 bg-slate-900 hover:bg-slate-800 text-white"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-2" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({
  user,
  currentUserEmail,
  onClose,
  onDeleted,
}: {
  user: AdminUser;
  currentUserEmail: string;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const isSelf = user.email === currentUserEmail;

  async function handleDelete() {
    setDeleting(true);
    setError('');
    const res = await callEdgeFn('DELETE', undefined, {
      id: user.id,
      auth_user_id: user.auth_user_id ?? '',
    });
    setDeleting(false);
    if (res.error) { setError(res.error); return; }
    onDeleted();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Remove Admin User</p>
              <p className="text-[11px] text-slate-500">This cannot be undone</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-4">
            <p className="text-xs font-semibold text-slate-800 truncate">{user.display_name || user.email}</p>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
          </div>

          {isSelf && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 mb-4">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700">You cannot remove your own account.</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-4">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-700">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="h-9 text-sm flex-1">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleDelete}
              disabled={deleting || isSelf}
              className="h-9 text-sm flex-1 bg-red-600 hover:bg-red-700 text-white border-0"
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 mr-2" />}
              {deleting ? 'Removing...' : 'Remove User'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);

  const fetchUsers = useCallback(async () => {
    const { data } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });
    setUsers((data as AdminUser[]) ?? []);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/admin/login'); return; }
      setCurrentUserEmail(session.user.email ?? '');
      fetchUsers().finally(() => setLoading(false));
    });
  }, [router, fetchUsers]);

  if (loading) {
    return (
      <AdminShell>
        <div className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="p-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Admin Users</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage who has access to the admin panel. All users here have full access to every feature.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[11px]">{users.length} {users.length === 1 ? 'user' : 'users'}</Badge>
            <Button
              size="sm"
              onClick={() => setShowAdd(true)}
              className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Admin
            </Button>
          </div>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 bg-sky-50 border border-sky-200 rounded-xl px-4 py-3.5 mb-6">
          <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[12px] font-semibold text-sky-800">Full access model</p>
            <p className="text-[11px] text-sky-600 mt-0.5 leading-relaxed">
              All admin users have unrestricted access to every feature. There is no role or permission hierarchy — if you can log in, you have full access.
            </p>
          </div>
        </div>

        {/* User list */}
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300 gap-3">
            <Users className="w-10 h-10" />
            <p className="text-sm font-medium text-slate-400">No admin users yet</p>
            <Button size="sm" onClick={() => setShowAdd(true)} className="text-xs h-8 bg-slate-900 hover:bg-slate-800 text-white mt-1">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add first admin
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u) => {
              const isSelf = u.email === currentUserEmail;
              const initials = (u.display_name || u.email).slice(0, 2).toUpperCase();
              return (
                <div
                  key={u.id}
                  className={`bg-white border rounded-xl px-5 py-4 flex items-center gap-4 transition-all ${isSelf ? 'border-sky-200 ring-1 ring-sky-100' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isSelf ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'}`}>
                    {initials}
                  </div>

                  {/* Identity */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {u.display_name || <span className="text-slate-400 font-normal italic">No display name</span>}
                      </p>
                      {isSelf && (
                        <Badge className="text-[9px] bg-sky-50 text-sky-600 border border-sky-200 px-1.5 py-px">You</Badge>
                      )}
                    </div>
                    <p className="text-[12px] text-slate-500 truncate mt-0.5">{u.email}</p>
                  </div>

                  {/* Dates */}
                  <div className="hidden md:flex flex-col items-end gap-1.5 shrink-0">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <CalendarDays className="w-3 h-3 text-slate-300" />
                      <span>Added {formatDate(u.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3 text-slate-300" />
                      {u.last_login_at ? (
                        <span>Last login {timeAgo(u.last_login_at)} &middot; {formatDate(u.last_login_at)}</span>
                      ) : (
                        <span className="italic text-slate-300">Never logged in</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                      onClick={() => setEditUser(u)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                      title="Edit user"
                    >
                      <Pencil className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button
                      onClick={() => setDeleteUser(u)}
                      disabled={isSelf}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title={isSelf ? 'Cannot remove your own account' : 'Remove user'}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAdd && (
        <AddUserModal
          onClose={() => setShowAdd(false)}
          onCreated={fetchUsers}
        />
      )}
      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={fetchUsers}
        />
      )}
      {deleteUser && (
        <DeleteConfirmModal
          user={deleteUser}
          currentUserEmail={currentUserEmail}
          onClose={() => setDeleteUser(null)}
          onDeleted={fetchUsers}
        />
      )}
    </AdminShell>
  );
}
