'use client';
import { useState } from 'react';
import { cn } from '@/utils';
import type { Habit } from '@/types';
import { useHeatmap, monthDates, type DayActivity } from '@/hooks/useHeatmap';

const LEVEL_COLOR: Record<number, string> = {
  0: 'rgba(255,255,255,0.04)',
  1: 'rgba(124,106,247,0.22)',
  2: 'rgba(124,106,247,0.45)',
  3: 'rgba(124,106,247,0.70)',
  4: 'rgba(103,232,249,0.85)',
};

const LEVEL_GLOW: Record<number, string> = {
  0: 'none',
  1: '0 0 6px rgba(124,106,247,0.2)',
  2: '0 0 8px rgba(124,106,247,0.35)',
  3: '0 0 10px rgba(124,106,247,0.5)',
  4: '0 0 12px rgba(103,232,249,0.55)',
};

const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];
const DAY_LABELS = ['S','M','T','W','T','F','S'];

interface Props {
  habits: Habit[];
  year?: number;
  month?: number; // 0-indexed
}

export default function MonthHeatmap({ habits, year, month }: Props) {
  const now = new Date();
  const y = year  ?? now.getFullYear();
  const m = month ?? now.getMonth();
  const todayStr = now.toISOString().slice(0, 10);

  const activityMap = useHeatmap(habits);
  const dates = monthDates(y, m);

  // Pad start to correct weekday
  const firstDow = new Date(dates[0]).getDay();
  const padded: (string | null)[] = [
    ...Array(firstDow).fill(null),
    ...dates,
  ];
  // Pad end to complete last row
  while (padded.length % 7 !== 0) padded.push(null);

  const [hovered, setHovered] = useState<DayActivity | null>(null);

  // Month stats
  const monthActivity = dates.map(d => activityMap.get(d));
  const activeDays = monthActivity.filter(Boolean).length;
  const totalHabits = habits.length || 1;
  const avgPct = activeDays
    ? Math.round(monthActivity.filter(Boolean).reduce((s, a) => s + (a?.pct ?? 0), 0) / activeDays)
    : 0;

  return (
    <div className="space-y-4">
      {/* Month header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white/80">{MONTH_NAMES[m]} {y}</h3>
          <p className="text-[10px] text-white/30 mt-0.5">
            {activeDays} active · {avgPct}% avg completion
          </p>
        </div>
        {/* Mini legend */}
        <div className="flex items-center gap-1">
          {[0,1,2,3,4].map(l => (
            <div key={l} className="w-2.5 h-2.5 rounded-sm"
              style={{ background: LEVEL_COLOR[l], boxShadow: LEVEL_GLOW[l] }} />
          ))}
        </div>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="text-center text-[9px] text-white/25 font-semibold py-0.5">{d}</div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-1">
        {padded.map((date, i) => {
          if (!date) return <div key={i} />;
          const activity = activityMap.get(date);
          const level = activity?.level ?? 0;
          const isToday = date === todayStr;
          const dayNum = new Date(date).getDate();
          const isFuture = date > todayStr;

          return (
            <div
              key={date}
              className={cn(
                'aspect-square rounded-xl flex items-center justify-center',
                'text-[10px] font-semibold cursor-pointer',
                'transition-all duration-200 hover:scale-110 hover:z-10 relative',
                isFuture && 'opacity-30 cursor-default',
                isToday && 'ring-1 ring-white/50 ring-offset-1 ring-offset-transparent',
              )}
              style={{
                background: LEVEL_COLOR[level],
                boxShadow: isToday
                  ? `${LEVEL_GLOW[level]}, 0 0 0 1px rgba(255,255,255,0.3)`
                  : LEVEL_GLOW[level],
                color: level >= 3 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
              }}
              onMouseEnter={() => !isFuture && setHovered(activity ?? { date, count: 0, pct: 0, level: 0 })}
              onMouseLeave={() => setHovered(null)}
            >
              {dayNum}
            </div>
          );
        })}
      </div>

      {/* Hover detail */}
      <div className={cn(
        'rounded-2xl px-4 py-3 transition-all duration-200',
        'border border-white/[0.06]',
        hovered ? 'bg-white/[0.05] opacity-100' : 'bg-transparent opacity-0 pointer-events-none',
      )} style={{ minHeight: '52px' }}>
        {hovered && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white/70">
                {new Date(hovered.date + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric',
                })}
              </p>
              <p className="text-[10px] text-white/35 mt-0.5">
                {hovered.count > 0
                  ? `${hovered.count} of ${totalHabits} habits completed`
                  : 'No habits completed'}
              </p>
            </div>
            {hovered.count > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-accent2"
                    style={{ width: `${hovered.pct}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-white/60 tabular-nums">{hovered.pct}%</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Month bar chart — daily completion bars */}
      <div className="space-y-1.5">
        <p className="text-[10px] text-white/25 uppercase tracking-widest">Daily completion this month</p>
        <div className="flex items-end gap-px h-10">
          {dates.map(date => {
            const a = activityMap.get(date);
            const pct = a?.pct ?? 0;
            const isFuture = date > todayStr;
            const isToday = date === todayStr;
            return (
              <div
                key={date}
                className="flex-1 rounded-t-sm transition-all duration-300 hover:opacity-100"
                style={{
                  height: `${Math.max(isFuture ? 0 : 4, pct * 0.4)}px`,
                  background: isFuture
                    ? 'rgba(255,255,255,0.03)'
                    : pct === 0
                    ? 'rgba(255,255,255,0.06)'
                    : `rgba(124,106,247,${0.3 + (pct / 100) * 0.65})`,
                  boxShadow: isToday ? '0 0 6px rgba(124,106,247,0.6)' : 'none',
                  opacity: isFuture ? 0.2 : 1,
                }}
                title={`${date}: ${pct}%`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
