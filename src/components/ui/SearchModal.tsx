'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils';
import type { Task, Habit } from '@/types';

const PAGES = [
  { label: 'Dashboard',    href: '/dashboard',     icon: '⊞', desc: 'Overview & stats' },
  { label: 'Tasks',        href: '/tasks',          icon: '✓', desc: 'Manage your tasks' },
  { label: 'Habits',       href: '/habits',         icon: '🔥', desc: 'Track daily habits' },
  { label: 'Calendar',     href: '/calendar',       icon: '📅', desc: 'Checklist & schedule' },
  { label: 'Focus Timer',  href: '/pomodoro',       icon: '⏱', desc: 'Pomodoro sessions' },
  { label: 'Analytics',    href: '/analytics',      icon: '📊', desc: 'Productivity insights' },
  { label: 'AI Coach',     href: '/ai-coach',       icon: '💀', desc: 'AI productivity coach' },
  { label: 'Gamification', href: '/gamification',   icon: '🏆', desc: 'XP, badges & levels' },
  { label: 'Settings',     href: '/settings',       icon: '⚙️', desc: 'App preferences' },
  { label: 'Profile',      href: '/profile',        icon: '👤', desc: 'Your profile' },
  { label: 'Billing',      href: '/billing',        icon: '💳', desc: 'Plans & billing' },
  { label: 'Help Center',  href: '/help',           icon: '❓', desc: 'Support & docs' },
];

type ResultItem =
  | { kind: 'page';  label: string; href: string; icon: string; desc: string }
  | { kind: 'task';  label: string; href: string; icon: string; desc: string }
  | { kind: 'habit'; label: string; href: string; icon: string; desc: string };

interface Props { open: boolean; onClose: () => void; }

export default function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const search = useCallback((q: string) => {
    const lower = q.toLowerCase().trim();
    if (!lower) { setResults([]); return; }

    const items: ResultItem[] = [];

    // Pages
    PAGES.forEach(p => {
      if (p.label.toLowerCase().includes(lower) || p.desc.toLowerCase().includes(lower))
        items.push({ kind: 'page', ...p });
    });

    // Tasks from localStorage
    try {
      const raw = localStorage.getItem('pd_tasks');
      const tasks: Task[] = raw ? JSON.parse(raw) : [];
      tasks.forEach(t => {
        if (t.title.toLowerCase().includes(lower) || t.description?.toLowerCase().includes(lower))
          items.push({
            kind: 'task',
            label: t.title,
            href: '/tasks',
            icon: t.completed ? '✅' : t.priority === 'high' ? '🔴' : t.priority === 'medium' ? '🟡' : '🟢',
            desc: `${t.category} · ${t.completed ? 'Completed' : 'Pending'}${t.dueDate ? ` · Due ${t.dueDate}` : ''}`,
          });
      });
    } catch { /* ignore */ }

    // Habits from localStorage
    try {
      const raw = localStorage.getItem('pd_habits');
      const habits: Habit[] = raw ? JSON.parse(raw) : [];
      habits.forEach(h => {
        if (h.name.toLowerCase().includes(lower) || h.description?.toLowerCase().includes(lower))
          items.push({
            kind: 'habit',
            label: h.name,
            href: '/habits',
            icon: h.icon,
            desc: `${h.category} · ${h.frequency} · 🔥 ${h.streak} day streak`,
          });
      });
    } catch { /* ignore */ }

    setResults(items.slice(0, 10));
    setActive(0);
  }, []);

  useEffect(() => { search(query); }, [query, search]);

  useEffect(() => {
    if (open) { setQuery(''); setResults([]); setActive(0); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  const navigate = (href: string) => { router.push(href); onClose(); };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(v => Math.min(v + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(v => Math.max(v - 1, 0)); }
    else if (e.key === 'Enter' && results[active]) navigate(results[active].href);
    else if (e.key === 'Escape') onClose();
  };

  if (!open) return null;

  const kindLabel: Record<string, string> = { page: 'Page', task: 'Task', habit: 'Habit' };
  const kindColor: Record<string, string> = {
    page:  'rgba(124,106,247,0.15)',
    task:  'rgba(6,182,212,0.15)',
    habit: 'rgba(249,115,22,0.15)',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh]"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="w-full max-w-xl mx-4 rounded-3xl overflow-hidden animate-fade-in"
        style={{ background: '#1a1030', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 32px 80px rgba(0,0,0,0.8)' }}
        onClick={e => e.stopPropagation()}>

        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.07]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-white/40 shrink-0">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search tasks, habits, pages…"
            className="flex-1 bg-transparent text-white/85 placeholder-white/25 outline-none text-sm"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-white/30 hover:text-white/60 transition-colors text-xs">✕</button>
          )}
          <kbd className="text-[10px] text-white/20 border border-white/10 rounded px-1.5 py-0.5">ESC</kbd>
        </div>

        {/* Results */}
        {results.length > 0 ? (
          <ul className="max-h-80 overflow-y-auto py-2">
            {results.map((r, i) => (
              <li key={i}>
                <button
                  onClick={() => navigate(r.href)}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    'w-full flex items-center gap-3 px-5 py-3 text-left transition-colors',
                    active === i ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]'
                  )}
                >
                  <span className="text-lg w-7 text-center shrink-0">{r.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 font-medium truncate">{r.label}</p>
                    <p className="text-[11px] text-white/35 truncate mt-0.5">{r.desc}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0"
                    style={{ background: kindColor[r.kind], color: 'rgba(255,255,255,0.5)' }}>
                    {kindLabel[r.kind]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : query ? (
          <div className="py-12 text-center text-white/30 text-sm">No results for "{query}"</div>
        ) : (
          <div className="py-5 px-5">
            <p className="text-[11px] text-white/25 uppercase tracking-wide mb-3 font-semibold">Quick navigation</p>
            <div className="grid grid-cols-3 gap-2">
              {PAGES.slice(0, 6).map(p => (
                <button key={p.href} onClick={() => navigate(p.href)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-white/[0.06]"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-base">{p.icon}</span>
                  <span className="text-xs text-white/55 font-medium truncate">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="px-5 py-2.5 border-t border-white/[0.06] flex items-center gap-4 text-[10px] text-white/20">
          <span><kbd className="border border-white/10 rounded px-1">↑↓</kbd> navigate</span>
          <span><kbd className="border border-white/10 rounded px-1">↵</kbd> open</span>
          <span><kbd className="border border-white/10 rounded px-1">ESC</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
