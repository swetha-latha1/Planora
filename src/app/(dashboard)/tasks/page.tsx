'use client';
import { useState, useCallback, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { useConfetti } from '@/hooks/useConfetti';
import { useConfetti as _useConfetti } from '@/hooks/useConfetti';
import TaskCard from '@/components/ui/TaskCard';
import TaskForm from '@/components/ui/TaskForm';
import TaskCompleteEffect from '@/components/ui/TaskCompleteEffect';
import XPToast, { type ToastItem } from '@/components/ui/XPToast';
import LevelUpModal from '@/components/ui/LevelUpModal';
import { cn } from '@/utils';
import type { Priority } from '@/types';
import { generateId } from '@/utils';

type Filter = 'all' | Priority | 'completed';

const FILTER_CONFIG: { label: string; value: Filter; icon: string; color: string }[] = [
  { label: 'All',       value: 'all',       icon: '📋', color: '#a78bfa' },
  { label: 'High',      value: 'high',      icon: '🔴', color: '#f43f5e' },
  { label: 'Medium',    value: 'medium',    icon: '🟡', color: '#fbbf24' },
  { label: 'Low',       value: 'low',       icon: '🟢', color: '#10b981' },
  { label: 'Completed', value: 'completed', icon: '✅', color: '#06b6d4' },
];

export default function TasksPage() {
  const { tasks: { tasks, addTask, toggleTask, deleteTask }, gamification: { onTaskComplete } } = useData();
  const { launch } = useConfetti();

  const [filter, setFilter] = useState<Filter>('all');
  const [showForm, setShowForm] = useState(false);
  const [showEffect, setShowEffect] = useState(false);
  const [search, setSearch] = useState('');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [levelUpData, setLevelUpData] = useState<{ level: number; title: string; color: string; xp: number } | null>(null);

  const totalCompleted = useMemo(() => tasks.filter(t => t.completed).length, [tasks]);
  const completionPct  = tasks.length ? Math.round((totalCompleted / tasks.length) * 100) : 0;

  const stats = useMemo(() => ({
    total:     tasks.length,
    completed: totalCompleted,
    pending:   tasks.filter(t => !t.completed).length,
    high:      tasks.filter(t => t.priority === 'high' && !t.completed).length,
  }), [tasks, totalCompleted]);

  const handleToggle = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      setShowEffect(true);
      const event = onTaskComplete(task.priority, totalCompleted + 1);
      if (event) {
        const toast: ToastItem = {
          id: generateId(),
          xp: event.xp,
          reason: event.reason,
          levelUp: event.levelUp ? { to: event.levelUp.to, title: event.levelUp.title, color: event.levelUp.color } : undefined,
        };
        setToasts(prev => [...prev, toast]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toast.id)), 3500);
        if (event.levelUp) {
          setLevelUpData({ level: event.levelUp.to, title: event.levelUp.title, color: event.levelUp.color, xp: event.xp });
          launch();
        } else if (event.newBadges.length > 0) {
          launch(undefined, undefined, 60);
        }
      }
    }
    toggleTask(id);
  }, [tasks, totalCompleted, onTaskComplete, toggleTask, launch]);

  const filtered = useMemo(() => tasks.filter(t => {
    const matchFilter = filter === 'all' ? true : filter === 'completed' ? t.completed : t.priority === filter;
    const matchSearch = !search.trim() || t.title.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  }), [tasks, filter, search]);

  const pending   = filtered.filter(t => !t.completed);
  const completed = filtered.filter(t => t.completed);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-10">
      <XPToast toasts={toasts} />
      {levelUpData && <LevelUpModal xp={levelUpData.xp} level={levelUpData.level} title={levelUpData.title} color={levelUpData.color} onClose={() => setLevelUpData(null)} />}
      {showEffect && <TaskCompleteEffect onDone={() => setShowEffect(false)} />}
      {showForm && <TaskForm onAdd={addTask} onClose={() => setShowForm(false)} />}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white/90">
            My <span className="grad-text">Tasks</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">{stats.pending} pending · {stats.completed} completed</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-glow px-5 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-2 shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>
          New Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',     value: stats.total,     color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.25)' },
          { label: 'Pending',   value: stats.pending,   color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.25)'   },
          { label: 'Completed', value: stats.completed, color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)'  },
          { label: 'High Prio', value: stats.high,      color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',   border: 'rgba(244,63,94,0.25)'   },
        ].map(s => (
          <div key={s.label} className="flex flex-col items-center justify-center py-4 rounded-2xl transition-all" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
            <span className="text-2xl font-extrabold tabular-nums" style={{ color: s.color }}>{s.value}</span>
            <span className="text-[10px] text-white/40 uppercase tracking-wide mt-1">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="glass rounded-2xl px-5 py-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-white/40 mb-2">
              <span>Overall Progress</span>
              <span className="font-semibold text-white/60">{completionPct}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${completionPct}%`, background: 'linear-gradient(90deg,#7c6af7,#06b6d4)', boxShadow: '0 0 10px rgba(124,106,247,0.5)' }} />
            </div>
          </div>
          <span className="text-2xl font-extrabold grad-text tabular-nums shrink-0">{completionPct}%</span>
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl glass border border-white/[0.08] hover:border-accent/30 transition-all">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-white/30 shrink-0">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            className="flex-1 bg-transparent text-sm text-white/70 placeholder-white/25 outline-none"
            placeholder="Search tasks…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-white/30 hover:text-white/60 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {FILTER_CONFIG.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={cn('px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border',
                filter === f.value
                  ? 'text-white border-transparent'
                  : 'glass text-white/40 border-white/[0.08] hover:text-white/70'
              )}
              style={filter === f.value ? { background: `${f.color}25`, borderColor: `${f.color}50`, color: f.color, boxShadow: `0 0 12px ${f.color}30` } : {}}>
              {f.icon} {f.label}
              <span className="ml-0.5 opacity-60 text-[10px]">
                ({f.value === 'all' ? tasks.length : f.value === 'completed' ? tasks.filter(t => t.completed).length : tasks.filter(t => t.priority === f.value && !t.completed).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="glass rounded-3xl flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center text-3xl">📭</div>
          <div>
            <p className="text-sm font-semibold text-white/50">{search ? `No results for "${search}"` : 'No tasks here'}</p>
            <p className="text-xs text-white/30 mt-1">{search ? 'Try a different search' : 'Add a new task to get started'}</p>
          </div>
          {!search && (
            <button onClick={() => setShowForm(true)} className="btn-glow px-5 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>
              Add Task
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Pending */}
          {pending.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-white/35 uppercase tracking-widest px-1">
                Pending · {pending.length}
              </p>
              {pending.map(t => (
                <TaskCard key={t.id} task={t} onToggle={handleToggle} onDelete={deleteTask} />
              ))}
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-white/35 uppercase tracking-widest px-1">
                Completed · {completed.length}
              </p>
              {completed.map(t => (
                <TaskCard key={t.id} task={t} onToggle={handleToggle} onDelete={deleteTask} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
