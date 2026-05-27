'use client';
import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/utils';
import { calcCompletionPct } from '@/hooks/useHabits';
import { useConfetti } from '@/hooks/useConfetti';
import { useExport } from '@/hooks/useExport';
import { useDragDrop } from '@/hooks/useDragDrop';
import { useData } from '@/context/DataContext';
import type { Habit, HabitCategory } from '@/types';
import type { HabitInput } from '@/hooks/useHabits';
import HabitCard from '@/components/ui/HabitCard';
import HabitForm from '@/components/ui/HabitForm';
import HabitSkeleton from '@/components/ui/HabitSkeleton';
import MonthHeatmap from '@/charts/MonthHeatmap';
import XPToast, { type ToastItem } from '@/components/ui/XPToast';
import LevelUpModal from '@/components/ui/LevelUpModal';
import { generateId } from '@/utils';

type FilterStatus = 'all' | 'done' | 'pending';

const CAT_FILTERS: { label: string; value: HabitCategory | 'all' }[] = [
  { label: 'All',         value: 'all'      },
  { label: '💪 Fitness',  value: 'fitness'  },
  { label: '🧘 Mindset',  value: 'mindset'  },
  { label: '❤️ Health',   value: 'health'   },
  { label: '💼 Work',     value: 'work'     },
  { label: '📚 Learning', value: 'learning' },
  { label: '🎨 Creative', value: 'creative' },
  { label: '🤝 Social',   value: 'social'   },
  { label: '💰 Finance',  value: 'finance'  },
];

function TopStreakRow({ habit }: { habit: Habit }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] transition-colors">
      <span className="text-xl">{habit.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white/70 truncate">{habit.name}</p>
        <p className="text-[10px] text-white/30 capitalize">{habit.category}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span>🔥</span>
        <span className="text-sm font-extrabold text-white/80 tabular-nums">{habit.streak}</span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HabitsPage() {
  const { habits: { habits, loaded, addHabit, updateHabit, deleteHabit, toggleToday, isDoneToday, weekProgress, reorderHabits }, gamification: { profile, levelInfo, onHabitComplete } } = useData();
  const { launch } = useConfetti();
  const { exportCsv, exportPdf } = useExport(habits);

  const [catFilter,    setCatFilter]    = useState<HabitCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [search,       setSearch]       = useState('');
  const [formOpen,     setFormOpen]     = useState(false);
  const [editing,      setEditing]      = useState<Habit | null>(null);
  const [toasts,       setToasts]       = useState<ToastItem[]>([]);
  const [levelUpData,  setLevelUpData]  = useState<{ level: number; title: string; color: string } | null>(null);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const doneCount     = useMemo(() => habits.filter(h => isDoneToday(h)).length, [habits, isDoneToday]);
  const totalHabits   = habits.length;
  const completionPct = useMemo(() => calcCompletionPct(habits), [habits]);
  const bestStreak    = useMemo(() => habits.reduce((m, h) => Math.max(m, h.bestStreak), 0), [habits]);
  const topStreaks     = useMemo(() => [...habits].sort((a, b) => b.streak - a.streak).slice(0, 3), [habits]);

  const filtered = useMemo(() => habits.filter(h => {
    if (catFilter !== 'all' && h.category !== catFilter) return false;
    if (statusFilter === 'done'    && !isDoneToday(h)) return false;
    if (statusFilter === 'pending' &&  isDoneToday(h)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!h.name.toLowerCase().includes(q) && !h.category.toLowerCase().includes(q) && !h.description?.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [habits, catFilter, statusFilter, isDoneToday, search]);

  const { dragId, overId, getDragProps } = useDragDrop(habits, reorderHabits ?? (() => {}));

  // ── Gamified toggle ───────────────────────────────────────────────────────
  const handleToggle = useCallback((id: string) => {
    const habit = habits.find(h => h.id === id);
    const wasNotDone = habit && !isDoneToday(habit);

    toggleToday(id);

    if (wasNotDone && habit) {
      // Small delay so habit state has updated before XP calc
      setTimeout(() => {
        const event = onHabitComplete(habit, habits);
        if (!event) return;

        // Show XP toast
        const toast: ToastItem = {
          id: generateId(),
          xp: event.xp,
          reason: event.reason,
          levelUp: event.levelUp ? { to: event.levelUp.to, title: event.levelUp.title, color: event.levelUp.color } : undefined,
        };
        setToasts(prev => [...prev, toast]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toast.id)), 3500);

        // Level-up modal + confetti
        if (event.levelUp) {
          setLevelUpData({ level: event.levelUp.to, title: event.levelUp.title, color: event.levelUp.color });
          launch();
        } else if (event.newBadges.length > 0) {
          // Badge unlock — smaller confetti burst
          launch(undefined, undefined, 60);
        }

        // Perfect day confetti
        const allDone = habits.every(h => h.id === id || isDoneToday(h));
        if (allDone && habits.length > 1) {
          setTimeout(() => launch(undefined, undefined, 100), 300);
        }
      }, 50);
    }
  }, [habits, isDoneToday, toggleToday, onHabitComplete, launch]);

  const handleSave = (data: HabitInput) => {
    if (editing) { updateHabit(editing.id, data); setEditing(null); }
    else addHabit(data);
  };
  const openEdit  = (h: Habit) => { setEditing(h); setFormOpen(true); };
  const openAdd   = ()         => { setEditing(null); setFormOpen(true); };
  const closeForm = ()         => { setFormOpen(false); setEditing(null); };

  if (!loaded) return (
    <div className="max-w-7xl mx-auto space-y-6 pb-28">
      <div className="h-10 bg-white/[0.06] rounded-2xl w-64 animate-pulse" />
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <HabitSkeleton key={i} />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-28">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white/90">
            Habit <span className="grad-text">Tracker</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {doneCount} of {totalHabits} habits completed today
          </p>
        </div>
        <button onClick={openAdd}
          className="btn-glow px-5 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-2 shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Add Habit
        </button>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { label: 'Total Habits',  value: String(totalHabits),          icon: '🎯', color: '#a78bfa' },
          { label: 'Done Today',    value: String(doneCount),             icon: '✅', color: '#34d399' },
          { label: 'Remaining',     value: String(totalHabits - doneCount), icon: '⏳', color: '#06b6d4' },
          { label: 'Completion',    value: `${completionPct}%`,           icon: '📈', color: '#67e8f9' },
          { label: 'Best Streak',   value: `${bestStreak}d`,              icon: '🏆', color: '#fbbf24' },
          { label: 'Level',         value: `Lv.${levelInfo.current.level}`, icon: '⚡', color: levelInfo.current.color },
        ].map((s, i) => (
          <div key={i} className="glass rounded-2xl p-4 flex flex-col justify-between" style={{ height: '88px' }}>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wide leading-tight">{s.label}</span>
              <span className="text-sm shrink-0">{s.icon}</span>
            </div>
            <p className="text-2xl font-extrabold tabular-nums" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Toolbar: search + export ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl glass border border-white/[0.08] hover:border-accent/30 transition-all flex-1 min-w-[200px] max-w-xs">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-white/30 shrink-0">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            className="flex-1 bg-transparent text-sm text-white/70 placeholder-white/25 outline-none"
            placeholder="Search habits…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-white/30 hover:text-white/60 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>

        {/* Export buttons */}
        <div className="flex gap-2 ml-auto">
          <button onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold glass border border-white/[0.08] hover:border-emerald-400/30 hover:text-emerald-400 text-white/50 transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            CSV
          </button>
          <button onClick={exportPdf}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold glass border border-white/[0.08] hover:border-rose-400/30 hover:text-rose-400 text-white/50 transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            PDF
          </button>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="flex gap-5 items-start">
        <div className="flex-1 min-w-0 space-y-4">

          {/* Filter bar */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex gap-1 p-1 glass rounded-2xl">
              {(['all', 'done', 'pending'] as FilterStatus[]).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
                    statusFilter === s ? 'bg-accent/25 text-accent2 border border-accent/30' : 'text-white/30 hover:text-white/60')}>
                  {s === 'all' ? 'All' : s === 'done' ? '✓ Done' : '○ Pending'}
                </button>
              ))}
            </div>
            <div className="w-px h-6 bg-white/[0.08]" />
            <div className="flex gap-1.5 flex-wrap">
              {CAT_FILTERS.map(({ label, value }) => (
                <button key={value} onClick={() => setCatFilter(value)}
                  className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap',
                    catFilter === value
                      ? 'bg-accent/20 text-accent2 border border-accent/30 shadow-[0_0_12px_rgba(124,106,247,0.2)]'
                      : 'glass text-white/35 hover:text-white/65 border border-white/[0.06]')}>
                  {label}
                </button>
              ))}
            </div>
            <span className="ml-auto text-xs text-white/25">{filtered.length} habit{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Card grid with drag-and-drop */}
          {filtered.length === 0 ? (
            <EmptyState onAdd={openAdd} hasHabits={totalHabits > 0} search={search} />
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((h, i) => (
                <div
                  key={h.id}
                  className={cn(
                    'animate-slide-up transition-all duration-200',
                    dragId === h.id && 'opacity-40 scale-95',
                    overId === h.id && 'ring-2 ring-accent/50 rounded-3xl scale-[1.02]',
                  )}
                  style={{ animationDelay: `${i * 55}ms`, animationFillMode: 'both' }}
                  {...getDragProps(h.id)}
                >
                  {/* Drag handle indicator */}
                  <div className="relative">
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-0.5">
                        {[0,1].map(col => (
                          <div key={col} className="flex flex-col gap-0.5">
                            {[0,1,2].map(row => <div key={row} className="w-1 h-1 rounded-full bg-white/20" />)}
                          </div>
                        ))}
                      </div>
                    </div>
                    <HabitCard
                      habit={h}
                      doneToday={isDoneToday(h)}
                      progress={weekProgress(h)}
                      onToggle={handleToggle}
                      onEdit={openEdit}
                      onDelete={deleteHabit}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <aside className="hidden xl:flex flex-col gap-4 w-64 shrink-0">
          <div className="glass rounded-3xl p-5">
            <h3 className="text-sm font-bold text-white/70 mb-3 flex items-center gap-2">🏆 Top Streaks</h3>
            {topStreaks.length > 0
              ? <div className="space-y-2">{topStreaks.map(h => <TopStreakRow key={h.id} habit={h} />)}</div>
              : <p className="text-xs text-white/25">No streaks yet!</p>}
          </div>

          <div className="glass rounded-3xl p-5">
            <h3 className="text-sm font-bold text-white/70 mb-4 flex items-center gap-2">📅 This Week</h3>
            <div className="space-y-3">
              {habits.slice(0, 6).map(h => {
                const pct = weekProgress(h);
                return (
                  <div key={h.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50 truncate flex-1">{h.icon} {h.name}</span>
                      <span className="text-[10px] text-white/35 ml-2 tabular-nums">{pct}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-accent to-accent2 transition-all duration-700"
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass rounded-3xl p-5">
            <MonthHeatmap habits={habits} />
          </div>

          <div className="glass rounded-3xl p-5 bg-gradient-to-br from-accent/10 to-accent2/5 border border-accent/20">
            <p className="text-xs text-white/50 italic leading-relaxed">
              "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
            </p>
            <p className="text-[10px] text-white/25 mt-2">— Aristotle</p>
          </div>
        </aside>
      </div>

{/* ── Form modal ── */}
      <HabitForm open={formOpen} editing={editing} onSave={handleSave} onClose={closeForm} />

      {/* ── XP Toasts ── */}
      <XPToast toasts={toasts} />

      {/* ── Level-up modal ── */}
      {levelUpData && (
        <LevelUpModal
          level={levelUpData.level}
          title={levelUpData.title}
          color={levelUpData.color}
          xp={profile.xp}
          onClose={() => setLevelUpData(null)}
        />
      )}
    </div>
  );
}

function EmptyState({ onAdd, hasHabits, search }: { onAdd: () => void; hasHabits: boolean; search?: string }) {
  const isSearch = !!search;
  return (
    <div className="glass rounded-3xl p-16 flex flex-col items-center justify-center gap-5 text-center">
      <div className="w-20 h-20 rounded-3xl glass flex items-center justify-center text-4xl animate-float">
        {isSearch ? '🔎' : hasHabits ? '🔍' : '🌱'}
      </div>
      <div>
        <p className="text-lg font-bold text-white/70">
          {isSearch ? `No results for "${search}"` : hasHabits ? 'No habits match this filter' : 'No habits yet'}
        </p>
        <p className="text-sm text-white/30 mt-1">
          {isSearch ? 'Try a different search term' : hasHabits ? 'Try a different category or status filter' : 'Start building your routine — one habit at a time'}
        </p>
      </div>
      {!hasHabits && !isSearch && (
        <button onClick={onAdd} className="btn-glow px-6 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Add Your First Habit
        </button>
      )}
    </div>
  );
}
