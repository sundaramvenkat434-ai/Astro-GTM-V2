'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminShell } from '@/components/admin-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  UserCog, Plus, Pencil, Trash2, Loader as Loader2,
  X, Eye, EyeOff, Clock, CalendarDays,
} from 'lucide-react';

interface AdminUser {
  id: string;
  auth_user_id: string;
  email: string;
  display_name: string;
  created_at: string;
  last_login_at: string | null;
}

export default function AdminUsersPage() {
  return (
    <AdminShell>
      <UsersManager />
    </AdminShell>
  );
}

function UsersManager() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/manage-admin-users`;

  const getHeaders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Authorization': `Bearer ${session?.access_token || ''}`,
      'Content-Type': 'application/json',
    };
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await getHeaders();
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'list' }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      } else {
        setError(data.error || 'Failed to load users');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, getHeaders]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleDelete(user: AdminUser) {
    if (!confirm(`Delete admin user "${user.display_name}" (${user.email})? This cannot be undone.`)) return;
    setActionLoading(true);
    setError('');
    try {
      const headers = await getHeaders();
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'delete', id: user.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Delete failed');
      } else {
        fetchUsers();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUpdate(id: string) {
    setActionLoading(true);
    setError('');
    try {
      const headers = await getHeaders();
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'update', id, display_name: editName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Update failed');
      } else {
        setEditingId(null);
        fetchUsers();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <UserCog className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-bold text-gray-900">Admin Users</h1>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {users.length} {users.length === 1 ? 'user' : 'users'}
          </span>
        </div>
        <Button onClick={() => setShowAddForm(true)} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Add User
        </Button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {showAddForm && (
        <AddUserForm
          apiUrl={apiUrl}
          getHeaders={getHeaders}
          onClose={() => setShowAddForm(false)}
          onSuccess={() => { setShowAddForm(false); fetchUsers(); }}
          onError={setError}
        />
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading users...
        </div>
      ) : users.length === 0 ? (
        <div className="py-12 text-center text-gray-400 text-sm">No admin users found.</div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-gray-600">
                  {(user.display_name || user.email)[0].toUpperCase()}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                {editingId === user.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 text-sm"
                      placeholder="Display name"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => handleUpdate(user.id)}
                      disabled={actionLoading || !editName.trim()}
                      className="h-8 text-xs"
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                      className="h-8 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900 truncate">{user.display_name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </>
                )}

                <div className="flex items-center gap-4 mt-1.5">
                  <span className="flex items-center gap-1 text-[11px] text-gray-400">
                    <CalendarDays className="w-3 h-3" />
                    Created {formatDate(user.created_at)}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Clock className="w-3 h-3" />
                    {user.last_login_at ? `Last login ${formatDate(user.last_login_at)}` : 'Never logged in'}
                  </span>
                </div>
              </div>

              {editingId !== user.id && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setEditingId(user.id); setEditName(user.display_name); }}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="w-3.5 h-3.5 text-gray-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(user)}
                    disabled={actionLoading}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddUserForm({
  apiUrl,
  getHeaders,
  onClose,
  onSuccess,
  onError,
}: {
  apiUrl: string;
  getHeaders: () => Promise<Record<string, string>>;
  onClose: () => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setCreating(true);
    try {
      const headers = await getHeaders();
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'create',
          email: email.trim(),
          password,
          display_name: displayName.trim() || email.split('@')[0],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || 'Failed to create user');
      } else {
        onSuccess();
      }
    } catch (err: any) {
      onError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mb-6 bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Add New Admin User</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
      <form onSubmit={handleCreate} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              minLength={6}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Display Name (optional)</label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Defaults to email username"
          />
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Button type="submit" disabled={creating || !email || !password} size="sm" className="gap-1.5">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create User
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? 'just now' : `${diffMins}m ago`;
    }
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
