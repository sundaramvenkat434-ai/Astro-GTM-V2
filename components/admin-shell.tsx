'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { SESSION_EXPIRY_KEY } from '@/lib/admin-session';
import { AstroGTMLogo } from '@/components/site-header';
import {
  Plus,
  LayoutDashboard,
  LayoutGrid,
  Map,
  Shield,
  FileText,
  MessageSquareCode,
  Users as Users2,
  BadgeCheck,
  Settings2,
  LogOut,
  User,
  ChevronDown,
  Loader as Loader2,
  CalendarCheck,
  Gift,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Page Templates', href: '/admin/templates', icon: <LayoutGrid className="w-4 h-4" /> },
    ],
  },
  {
    title: 'SEO Config Files',
    items: [
      { label: 'Sitemap.xml', href: '/admin/sitemap', icon: <Map className="w-4 h-4" /> },
      { label: 'Robots.txt', href: '/admin/robots', icon: <Shield className="w-4 h-4" /> },
      { label: 'llms.txt', href: '/admin/llms-txt', icon: <FileText className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'AI Prompts', href: '/admin/prompts', icon: <MessageSquareCode className="w-4 h-4" /> },
      { label: 'Author Profiles', href: '/admin/authors', icon: <Users2 className="w-4 h-4" /> },
      { label: 'Tool Claims', href: '/admin/claims', icon: <BadgeCheck className="w-4 h-4" /> },
      { label: 'Gifaa', href: '/admin/gifaa', icon: <Gift className="w-4 h-4" /> },
    ],
  },
];

async function enforceSessionExpiry(signOut: () => Promise<void>) {
  const raw = localStorage.getItem(SESSION_EXPIRY_KEY);
  if (!raw) return;
  const expiry = parseInt(raw);
  if (isNaN(expiry)) return;
  if (Date.now() >= expiry) {
    localStorage.removeItem(SESSION_EXPIRY_KEY);
    await signOut();
  }
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);

  async function doSignOut() {
    localStorage.removeItem(SESSION_EXPIRY_KEY);
    await supabase.auth.signOut();
    router.push('/admin/login');
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/admin/login');
        return;
      }

      // Check if a day-session expiry exists and is past
      await enforceSessionExpiry(doSignOut);

      const raw = localStorage.getItem(SESSION_EXPIRY_KEY);
      if (raw) setSessionExpiresAt(parseInt(raw));

      setUserEmail(session.user.email || '');
      setLoading(false);
    });
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  // Schedule automatic sign-out at midnight when day-session is active
  useEffect(() => {
    if (!sessionExpiresAt) return;
    const msUntilExpiry = sessionExpiresAt - Date.now();
    if (msUntilExpiry <= 0) return;
    const timer = setTimeout(() => {
      doSignOut();
    }, msUntilExpiry);
    return () => clearTimeout(timer);
  }, [sessionExpiresAt]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSignOut() {
    await doSignOut();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-[240px] bg-white border-r border-slate-200 flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-slate-100">
          <Link href="/admin/dashboard" className="flex items-center">
            <AstroGTMLogo size={28} />
          </Link>
        </div>

        {/* Create Page button */}
        <div className="px-3 pt-4 pb-2">
          <Link
            href="/admin/ai-create"
            className="flex items-center gap-2 w-full px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Page
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
          {NAV_SECTIONS.map((section, sIdx) => (
            <div key={sIdx}>
              {section.title && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{section.title}</p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-sky-50 text-sky-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className={isActive ? 'text-sky-600' : 'text-slate-400'}>{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Day-session badge */}
        {sessionExpiresAt && (
          <div className="mx-3 mb-2 flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-lg px-3 py-2">
            <CalendarCheck className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-sky-700">Logged in today</p>
              <p className="text-[9px] text-sky-500 truncate">
                Expires at {new Date(sessionExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        )}

        {/* Bottom section */}
        <div className="border-t border-slate-100 p-3 mt-auto">
          <div className="relative">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-sky-600" />
              </div>
              <span className="flex-1 text-left truncate text-xs font-medium text-slate-700">{userEmail}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden">
                  <Link
                    href="/admin/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Settings2 className="w-4 h-4 text-slate-400" />
                    Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4 text-slate-400" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
