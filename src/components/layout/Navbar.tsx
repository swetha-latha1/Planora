'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/utils';
import SearchModal from '@/components/ui/SearchModal';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/context/UserContext';

const NOTIFS: never[] = [];

const BREADCRUMB: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/tasks': 'Tasks',
  '/habits': 'Habits',
  '/calendar': 'Checklist',
  '/projects': 'Projects',
  '/pomodoro': 'Focus Timer',
  '/analytics': 'Analytics',
  '/ai-coach': 'AI Coach',
  '/gamification': 'Gamification',
  '/settings': 'Settings',
  '/profile': 'Profile',
  '/billing': 'Billing',
  '/help': 'Help Center',
};

const MOBILE_NAV = [
  { href: '/dashboard',  icon: '⊞' },
  { href: '/tasks',      icon: '✓' },
  { href: '/habits',     icon: '🔥' },
  { href: '/ai-coach',   icon: '🤖' },
  { href: '/settings',   icon: '⚙' },
];

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };
  const { isDark, toggle: toggleTheme } = useTheme();
  const user = useUser();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      <header className="h-16 shrink-0 flex items-center px-4 md:px-6 gap-4 glass border-b border-white/[0.06] relative z-20">
        {/* Breadcrumb */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-white/30 text-sm">Planora</span>
            <span className="text-white/20">/</span>
            <span className="text-sm font-semibold text-white/80">{BREADCRUMB[path] ?? 'Page'}</span>
          </div>
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl btn-glow flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <span className="font-bold text-base grad-text">Planora</span>
          </div>
        </div>

        {/* Search bar */}
        <button onClick={() => setSearchOpen(true)} className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl glass w-56 group hover:border-accent/40 transition-all border border-white/[0.06] cursor-pointer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-white/30 group-hover:text-white/50 transition-colors">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <span className="text-sm text-white/25 group-hover:text-white/40 transition-colors">Search anything...</span>
          <span className="ml-auto text-[10px] text-white/20 border border-white/10 rounded px-1">⌘K</span>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl glass hover:bg-white/[0.09] flex items-center justify-center text-white/50 hover:text-white/80 transition-all"
            title="Toggle theme"
          >
            {isDark ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]">
                <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              </svg>
            )}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen(v => !v); setProfileOpen(false); }}
              className="w-9 h-9 rounded-xl glass hover:bg-white/[0.09] flex items-center justify-center text-white/50 hover:text-white/80 transition-all relative"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-12 w-80 rounded-2xl border border-white/[0.10] overflow-hidden animate-fade-in z-50"
                style={{ background: '#1a1a2e', boxShadow: '0 16px 48px rgba(0,0,0,0.7)' }}>
                <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between">
                  <span className="text-sm font-semibold text-white/90">Notifications</span>
                </div>
                {NOTIFS.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                    <div className="text-2xl">🔔</div>
                    <p className="text-xs text-white/40">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.06]">
                    {NOTIFS.map((n: any) => (
                      <div key={n.id} className="px-4 py-3 cursor-pointer flex gap-3 hover:bg-white/[0.04] transition-colors">
                        <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0',
                          n.type === 'warn' ? 'bg-orange-400' : n.type === 'success' ? 'bg-emerald-400' : 'bg-accent2'
                        )} />
                        <div>
                          <p className="text-xs text-white/85 leading-relaxed">{n.text}</p>
                          <p className="text-[10px] text-white/40 mt-1">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl glass hover:bg-white/[0.09] transition-all"
            >
              <div className="avatar-ring">
                <div className="w-7 h-7 rounded-full bg-grad-accent flex items-center justify-center text-xs font-bold text-white">{user?.avatar ?? '?'}</div>
              </div>
              <span className="hidden sm:block text-sm font-medium text-white/70">{user?.name ?? ''}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={cn('w-3 h-3 text-white/30 transition-transform', profileOpen && 'rotate-180')}>
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 w-52 rounded-2xl border border-white/[0.10] overflow-hidden animate-fade-in z-50"
                style={{ background: '#1a1a2e', boxShadow: '0 16px 48px rgba(0,0,0,0.7)' }}>
                <div className="px-4 py-3 border-b border-white/[0.08]">
                  <p className="text-sm font-semibold text-white/90">{user?.name ?? ''}</p>
                  <p className="text-xs text-white/40 mt-0.5">{user?.email ?? ''}</p>
                </div>
                {[
                  { label: 'Profile',  icon: '👤', href: '/profile'  },
                  { label: 'Billing',  icon: '💳', href: '/billing'  },
                  { label: 'Settings', icon: '⚙️', href: '/settings' },
                ].map(item => (
                  <Link key={item.label} href={item.href}
                    onClick={() => setProfileOpen(false)}
                    className="w-full px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.04] flex items-center gap-3 transition-colors">
                    <span>{item.icon}</span>{item.label}
                  </Link>
                ))}
                <div className="border-t border-white/[0.08]">
                  <button
                    onClick={signOut}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:text-red-300 hover:bg-white/[0.04] flex items-center gap-3 transition-colors">
                    <span>🚪</span>Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/[0.06] flex items-center justify-around px-2 py-2">
        {MOBILE_NAV.map(({ href, icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center justify-center w-12 h-10 rounded-xl text-lg transition-all',
              path === href ? 'bg-accent/20 text-accent2 scale-110' : 'text-white/30 hover:text-white/60'
            )}
          >
            {icon}
          </Link>
        ))}
      </nav>
    </>
  );
}
