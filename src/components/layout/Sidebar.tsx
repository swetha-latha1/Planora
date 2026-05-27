'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/utils';
import { useUser } from '@/context/UserContext';

const NAV = [
  {
    href: '/dashboard', label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
  },
  {
    href: '/tasks', label: 'Tasks',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4"/>
      </svg>
    ),
  },
  {
    href: '/habits', label: 'Habits',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/>
        <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/>
      </svg>
    ),
  },
  {
    href: '/calendar', label: 'Checklist',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
  },
  {
    href: '/projects', label: 'Projects',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>
      </svg>
    ),
  },
  {
    href: '/pomodoro', label: 'Focus',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
      </svg>
    ),
  },
  {
    href: '/ai-coach', label: 'AI Coach',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/>
        <path d="M12 8v4l3 3"/>
        <path d="M8.5 3.5l1 2M15.5 3.5l-1 2M3.5 8.5l2 1M3.5 15.5l2-1M8.5 20.5l1-2M15.5 20.5l-1-2M20.5 8.5l-2 1M20.5 15.5l-2-1"/>
      </svg>
    ),
  },
  {
    href: '/gamification', label: 'Gamification',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
  },
];

const BOTTOM = [
  {
    href: '/settings', label: 'Settings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
      </svg>
    ),
  },
  {
    href: '/help', label: 'Help',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <circle cx="12" cy="12" r="9"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r=".5" fill="currentColor"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const path = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const user = useUser();

  return (
    <aside
      className={cn(
        'relative hidden md:flex flex-col shrink-0 h-screen z-30 transition-[width] duration-200 ease-in-out',
        'border-r border-white/[0.06]',
        collapsed ? 'w-[68px]' : 'w-[240px]'
      )}
      style={{ background: 'var(--sidebar-bg)', willChange: 'width' }}
    >
      {/* Background orb */}
      <div className="absolute -top-20 -left-10 w-48 h-48 rounded-full bg-accent opacity-10 blur-3xl pointer-events-none" />

      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 mb-2', collapsed && 'justify-center px-0')}>
        <div className="w-8 h-8 rounded-xl btn-glow flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight">
            <span className="grad-text">Plan</span>
            <span className="text-white/80">ora</span>
          </span>
        )}
      </div>

      {/* Nav label */}
      {!collapsed && (
        <p className="px-4 text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-2">Menu</p>
      )}

      {/* Nav items */}
      <nav className="flex flex-col gap-1 px-2 flex-1">
        {NAV.map(({ href, label, icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 group relative',
                active
                  ? 'nav-active'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/[0.06]',
                collapsed && 'justify-center px-0 w-11 mx-auto'
              )}
            >
              <span className={cn('shrink-0 transition-transform duration-200', active ? 'text-accent2' : 'group-hover:scale-110')}>
                {icon}
              </span>
              {!collapsed && <span>{label}</span>}
              {active && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent2 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
              )}
              {collapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg glass text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-2 pb-4 flex flex-col gap-1">
        {BOTTOM.map(({ href, label, icon }) => {
          const active = path === href;
          return (
            <Link
              key={label}
              href={href}
              prefetch={true}
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 group relative',
                active
                  ? 'nav-active'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/[0.06]',
                collapsed && 'justify-center px-0 w-11 mx-auto'
              )}
            >
              <span className={cn('shrink-0 transition-transform duration-200', active ? 'text-accent2' : 'group-hover:scale-110')}>
                {icon}
              </span>
              {!collapsed && <span>{label}</span>}
              {active && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent2 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
              )}
              {collapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg glass text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {label}
                </span>
              )}
            </Link>
          );
        })}

        {/* User mini profile */}
        {!collapsed && (
          <div className="mt-3 mx-1 p-3 rounded-2xl glass flex items-center gap-3">
            <div className="avatar-ring shrink-0">
              <div className="w-7 h-7 rounded-full bg-grad-accent flex items-center justify-center text-xs font-bold text-white">{user?.avatar ?? '?'}</div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white/80 truncate">{user?.name ?? ''}</p>
              <p className="text-[10px] text-white/30 truncate">{user?.email ?? ''}</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full glass border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-accent/50 transition-all z-40"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={cn('w-3 h-3 transition-transform duration-300', collapsed ? 'rotate-180' : '')}>
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
    </aside>
  );
}
