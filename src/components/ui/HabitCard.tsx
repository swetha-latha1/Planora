'use client';
import { useState } from 'react';
import { cn } from '@/utils';
import type { Habit } from '@/types';

// ── Color palette ─────────────────────────────────────────────────────────────
const COLOR = {
  violet:  { bg: 'from-violet-500/20 to-violet-600/5',   border: 'border-violet-500/25',   glow: 'rgba(167,139,250,0.35)', solid: '#a78bfa', tag: 'bg-violet-500/15 text-violet-300 border-violet-500/25',   bar: 'from-violet-400 to-violet-600',   ring: 'rgba(167,139,250,0.5)' },
  cyan:    { bg: 'from-cyan-500/20 to-cyan-600/5',        border: 'border-cyan-500/25',     glow: 'rgba(103,232,249,0.35)', solid: '#67e8f9', tag: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',         bar: 'from-cyan-400 to-cyan-600',       ring: 'rgba(103,232,249,0.5)' },
  emerald: { bg: 'from-emerald-500/20 to-emerald-600/5',  border: 'border-emerald-500/25',  glow: 'rgba(110,231,183,0.35)', solid: '#6ee7b7', tag: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25', bar: 'from-emerald-400 to-emerald-600', ring: 'rgba(110,231,183,0.5)' },
  rose:    { bg: 'from-rose-500/20 to-rose-600/5',        border: 'border-rose-500/25',     glow: 'rgba(253,164,175,0.35)', solid: '#fda4af', tag: 'bg-rose-500/15 text-rose-300 border-rose-500/25',         bar: 'from-rose-400 to-rose-600',       ring: 'rgba(253,164,175,0.5)' },
  amber:   { bg: 'from-amber-500/20 to-amber-600/5',      border: 'border-amber-500/25',    glow: 'rgba(252,211,77,0.35)',  solid: '#fcd34d', tag: 'bg-amber-500/15 text-amber-300 border-amber-500/25',      bar: 'from-amber-400 to-amber-500',     ring: 'rgba(252,211,77,0.5)'  },
  sky:     { bg: 'from-sky-500/20 to-sky-600/5',          border: 'border-sky-500/25',      glow: 'rgba(125,211,252,0.35)', solid: '#7dd3fc', tag: 'bg-sky-500/15 text-sky-300 border-sky-500/25',           bar: 'from-sky-400 to-sky-600',         ring: 'rgba(125,211,252,0.5)' },
  pink:    { bg: 'from-pink-500/20 to-pink-600/5',        border: 'border-pink-500/25',     glow: 'rgba(249,168,212,0.35)', solid: '#f9a8d4', tag: 'bg-pink-500/15 text-pink-300 border-pink-500/25',         bar: 'from-pink-400 to-pink-600',       ring: 'rgba(249,168,212,0.5)' },
  orange:  { bg: 'from-orange-500/20 to-orange-600/5',    border: 'border-orange-500/25',   glow: 'rgba(251,146,60,0.35)',  solid: '#fb923c', tag: 'bg-orange-500/15 text-orange-300 border-orange-500/25',   bar: 'from-orange-400 to-orange-600',   ring: 'rgba(251,146,60,0.5)'  },
} as const;

const CAT_LABEL: Record<string, string> = {
  health: 'Health', mindset: 'Mindset', work: 'Work', fitness: 'Fitness',
  learning: 'Learning', social: 'Social', creative: 'Creative', finance: 'Finance',
};

// ── 7-day dot grid ────────────────────────────────────────────────────────────
function WeekDots({ completedDates, color }: { completedDates: string[]; color: keyof typeof COLOR }) {
  const c = COLOR[color];
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const date = d.toISOString().slice(0, 10);
    return { date, label: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()] };
  });

  return (
    <div className="flex gap-1.5 items-end">
      {days.map(({ date, label }, i) => {
        const done = completedDates.includes(date);
        const isToday = i === 6;
        return (
          <div key={date} className="flex flex-col items-center gap-1">
            <div
              className={cn(
                'w-5 h-5 rounded-md transition-all duration-300',
                done ? `bg-gradient-to-br ${c.bar}` : 'bg-white/[0.06]',
                isToday && !done && 'border border-white/25',
                isToday && done && 'scale-110',
              )}
              style={done ? { boxShadow: `0 0 8px ${c.ring}` } : undefined}
            />
            <span className={cn('text-[9px] font-medium', isToday ? 'text-white/60' : 'text-white/20')}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
interface Props {
  habit: Habit;
  doneToday: boolean;
  progress: number;
  onToggle: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

export default function HabitCard({ habit, doneToday, progress, onToggle, onEdit, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pressing, setPressing] = useState(false);
  const c = COLOR[habit.color];
  const pct = Math.min(progress, 100);

  return (
    <div
      className={cn(
        'relative rounded-3xl border bg-gradient-to-br overflow-hidden group',
        'transition-all duration-300 ease-out',
        c.bg, c.border,
      )}
      style={{
        backdropFilter: 'blur(20px)',
        boxShadow: doneToday
          ? `0 8px 32px rgba(0,0,0,0.3), 0 0 24px ${c.glow}`
          : '0 4px 20px rgba(0,0,0,0.25)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLElement).style.boxShadow =
          `0 20px 48px rgba(0,0,0,0.4), 0 0 32px ${c.glow}`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = '';
        (e.currentTarget as HTMLElement).style.boxShadow = doneToday
          ? `0 8px 32px rgba(0,0,0,0.3), 0 0 24px ${c.glow}`
          : '0 4px 20px rgba(0,0,0,0.25)';
      }}
    >
      {/* Inner glass sheen */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent pointer-events-none" />

      {/* Done shimmer */}
      {doneToday && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ background: 'linear-gradient(135deg,white 0%,transparent 60%)' }} />
        </div>
      )}

      <div className="relative p-5 flex flex-col gap-4">

        {/* ── Header: icon · name · actions ── */}
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform duration-300 group-hover:scale-110"
            style={{
              background: `linear-gradient(135deg,${c.glow.replace('0.35','0.28')},${c.glow.replace('0.35','0.08')})`,
              boxShadow: `0 4px 16px ${c.glow}`,
              border: `1px solid ${c.ring.replace('0.5','0.2')}`,
            }}
          >
            {habit.icon}
          </div>

          {/* Name + tag */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={cn(
                'font-bold text-base leading-tight transition-colors',
                doneToday ? 'text-white/90' : 'text-white/75 group-hover:text-white/90',
              )}>
                {habit.name}
              </h3>
              {doneToday && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 animate-fade-in">
                  ✓ Done
                </span>
              )}
            </div>
            {habit.description && (
              <p className="text-xs text-white/35 mt-0.5 truncate">{habit.description}</p>
            )}
            <span className={cn(
              'inline-flex items-center mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide',
              c.tag,
            )}>
              {CAT_LABEL[habit.category]}
            </span>
          </div>

          {/* Edit / Delete — visible on hover */}
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => onEdit(habit)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-all"
              title="Edit"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>

            {confirmDelete ? (
              <div className="flex items-center gap-1 animate-fade-in">
                <button
                  onClick={() => { onDelete(habit.id); setConfirmDelete(false); }}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-500/25 text-rose-400 border border-rose-500/35 hover:bg-rose-500/35 transition-all"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white/[0.06] text-white/40 hover:bg-white/[0.1] transition-all"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                title="Delete"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ── Streak row ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border"
            style={{
              background: `linear-gradient(135deg,${c.glow.replace('0.35','0.14')},transparent)`,
              borderColor: c.ring.replace('0.5','0.2'),
            }}
          >
            <span className="text-base leading-none">🔥</span>
            <span className="text-lg font-extrabold text-white/90 tabular-nums leading-none">
              {habit.streak}
            </span>
            <span className="text-[10px] text-white/40 font-medium">day streak</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
            <span className="text-xs">🏆</span>
            <span className="text-xs font-bold text-white/55">{habit.bestStreak}</span>
            <span className="text-[10px] text-white/25">best</span>
          </div>

          <div className="ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3 text-white/30">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            <span className="text-[10px] text-white/40 capitalize font-medium">{habit.frequency}</span>
          </div>
        </div>

        {/* ── 7-day dot grid ── */}
        <WeekDots completedDates={habit.completedDates} color={habit.color} />

        {/* ── Progress bar ── */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">
              Weekly Progress
            </span>
            <span className="text-[11px] font-bold" style={{ color: c.solid }}>
              {pct}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out', c.bar)}
              style={{
                width: `${pct}%`,
                boxShadow: pct > 0 ? `0 0 8px ${c.glow}` : 'none',
              }}
            />
          </div>
          <p className="text-[10px] text-white/20">
            {Math.round((pct / 100) * habit.targetDays)} / {habit.targetDays} days this week
          </p>
        </div>

        {/* ── Daily toggle ── */}
        <button
          onMouseDown={() => setPressing(true)}
          onMouseUp={() => setPressing(false)}
          onMouseLeave={() => setPressing(false)}
          onClick={() => onToggle(habit.id)}
          className={cn(
            'w-full py-3 rounded-2xl font-semibold text-sm',
            'flex items-center justify-center gap-2',
            'transition-all duration-150',
            doneToday
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/15'
              : 'text-white',
          )}
          style={!doneToday ? {
            background: `linear-gradient(135deg,${c.glow.replace('0.35','0.45')},${c.glow.replace('0.35','0.2')})`,
            boxShadow: pressing ? 'none' : `0 4px 20px ${c.glow}`,
            transform: pressing ? 'scale(0.98)' : 'scale(1)',
            border: `1px solid ${c.ring.replace('0.5','0.3')}`,
          } : undefined}
        >
          {doneToday ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/>
              </svg>
              Completed Today — tap to undo
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 3"/>
              </svg>
              Mark Complete
            </>
          )}
        </button>

      </div>
    </div>
  );
}
