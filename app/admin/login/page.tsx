'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AstroGTMLogo } from '@/components/site-header';
import { Lock, Mail, CircleAlert as AlertCircle, Loader as Loader2, Shield, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message === 'Invalid login credentials' ? 'Invalid email or password. Please try again.' : authError.message);
      setLoading(false);
      return;
    }

    router.push('/admin/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14">
            <Link href="/" className="flex items-center">
              <AstroGTMLogo size={30} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Icon + Title */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-50 to-sky-100 border border-sky-200 flex items-center justify-center mx-auto mb-5 shadow-sm">
              <Shield className="w-6 h-6 text-sky-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Admin Portal</h1>
            <p className="text-sm text-slate-500 mt-1.5">
              Sign in to manage your AstroGTM content, tools, and settings.
            </p>
          </div>

          {/* Login card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-cyan-400 to-sky-500" />
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 leading-relaxed">{error}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@astrogtm.com"
                    required
                    className="pl-9 h-10 text-sm border-slate-200 focus-visible:ring-sky-500/20 focus-visible:border-sky-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    minLength={6}
                    className="pl-9 h-10 text-sm border-slate-200 focus-visible:ring-sky-500/20 focus-visible:border-sky-400"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </div>

          {/* Info section */}
          <div className="mt-6 bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">About the Admin Panel</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              The AstroGTM admin panel lets you manage tool listings, create AI-generated content,
              configure SEO settings, monitor analytics, and publish comparison pages. Only authorized
              team members can access this area.
            </p>
          </div>

          <p className="text-center text-[11px] text-slate-400 mt-5">
            Protected by Supabase Authentication
          </p>
        </div>
      </main>
    </div>
  );
}
