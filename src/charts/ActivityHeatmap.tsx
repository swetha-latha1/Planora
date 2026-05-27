'use client';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils';
import type { Habit } from '@/types';
import { useHeatmap, yearDates, toWeekColumns, type DayActivity } from '@/hooks/useHeatmap';

// ── Color levels — violet → cyan gradient palette ─────────────────────────────
const LEVEL_STYLE: Record<number, { bg: string; shadow: string; label: string }> = {
  0: { bg: 'rgba(255,255,255,0.05)',  shadow: 'none',                          label: 'No activity'   },
  1: { bg: 'rgba(124,106,247,0.25)',  shadow: '0 0 4px rgba(124,106,247,0.2)', label: '1–25%'         },
  2: { bg: 'rgba(124,106,247,0.50)',  shadow: '0 0 6px rgba(124,106,247,0.35)',label: '26–50%'        },
  3: { bg: 'rgba(124,106,247,0.75)',  shadow: '0 0 8px rgba(124,106,247,0.5)', label: '51–75%'        },
  4: { bg: 'rgba(103,232,249,0.90)',  shadow: '0 0 10px rgba(103,232,249,0.6)',label: '76–100%'       },
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ── Tooltip ───────────────────────────────────────────────────────────────────
interface TooltipState {
  day: DayActivity;
  x: number;
  y: number;
}

function Tooltip({ tip }: { tip: TooltipState }) {
  const d = new Date(tip.day.date + 'T00:00:00');
  const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{ left: tip.x, top: tip.y, transform: 'translate(-50%, -110%)' }}
    >
      <div
        className="px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap"
        style={{
          background: 'rgba(10,8,30,0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}
      >
        <p className="text-white/80 font-semibold">{label}</p>
        {tip.day.count > 0 ? (
          <p className="text-white/50 mt-0.5">
            <span style={{ color: LEVEL_STYLE[tip.day.level].bg.replace('rgba','rgb').replace(/,[\d.]+\)/,')') }}>
              {tip.day.count} habit{tip.day.count !== 1 ? 's' : ''}
            </span>
            {' '}completed · {tip.day.pct}%
          </p>
        ) : (
          <p className="text-white/30 mt-0.5">No activity</p>
        )}
        {/* Arrow */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rotate-45"
          style={{ background: 'rgba(10,8,30,0.95)', borderRight: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }} />
      </div>
    </div>
  );
}

// ── Single cell ───────────────────────────────────────────────────────────────
interface CellProps {
  date: string | null;
  activity: DayActivity | undefined;
  isToday: boolean;
  onHover: (day: DayActivity | null, e: React.MouseEvent) => void;
}

function Cell({ date, activity, isToday, onHover }: CellProps) {
  if (!date) return <div className="w-3 h-3 rounded-sm" />;

  const level = activity?.level ?? 0;
  const style = LEVEL_STYLE[level];

  return (
    <div
      className={cn(
        'w-3 h-3 rounded-sm cursor-pointer transition-all duration-150',
        'hover:scale-125 hover:z-10 relative',
        isToday && 'ring-1 ring-white/60 ring-offset-1 ring-offset-transparent',
      )}
      style={{ background: style.bg, boxShadow: style.shadow }}
      onMouseEnter={e => onHover(activity ?? { date, count: 0, pct: 0, level: 0 }, e)}
      onMouseLeave={() => onHover(null, {} as React.MouseEvent)}
    />
  );
}

// ── Month label positions ─────────────────────────────────────────────────────
function getMonthPositions(weeks: (string | null)[][]): { label: string; col: number }[] {
  const positions: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, col) => {
    const firstDate = week.find(d => d !== null);
    if (!firstDate) return;
    const m = new Date(firstDate).getMonth();
    if (m !== lastMonth) {
      positions.push({ label: MONTHS[m], col });
      lastMonth = m;
    }
  });
  return positions;
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props {
  habits: Habit[];
  year?: number;
}

export default function ActivityHeatmap({ habits, year }: Props) {
  const currentYear = new Date().getFullYear();
  const displayYear = year ?? currentYear;
  const todayStr = new Date().toISOString().slice(0, 10);

  const activityMap = useHeatmap(habits);
  const weeks = toWeekColumns(yearDates(displayYear));
  const monthPositions = getMonthPositions(weeks);

  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to current month on mount
  useEffect(() => {
    if (scrollRef.current) {
      const today = new Date();
      const weekOfYear = Math.floor(
        (today.getTime() - new Date(displayYear, 0, 1).getTime()) / (7 * 86400000)
      );
      const cellW = 16; // 12px cell + 4px gap
      const scrollTo = Math.max(0, (weekOfYear - 20) * cellW);
      scrollRef.current.scrollLeft = scrollTo;
    }
  }, [displayYear]);

  const handleHover = (day: DayActivity | null, e: React.MouseEvent) => {
    if (!day) { setTooltip(null); return; }
    setTooltip({ day, x: e.clientX, y: e.clientY });
  };

  // Stats for this year
  const totalDays   = weeks.flat().filter(Boolean).length;
  const activeDays  = Array.from(activityMap.keys()).filter(d => d.startsWith(String(displayYear))).length;
  const maxStreak   = habits.reduce((m, h) => Math.max(m, h.bestStreak), 0);
  const totalCompletions = habits.reduce((s, h) =>
    s + h.completedDates.filter(d => d.startsWith(String(displayYear))).length, 0
  );

  return (
    <div className="glass rounded-3xl p-5 md:p-6 space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-white/85 text-base flex items-center gap-2">
            <span className="text-lg">📊</span>
            Activity Heatmap
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/20 text-accent2 border border-accent/25">
              {displayYear}
            </span>
          </h2>
          <p className="text-xs text-white/30 mt-0.5">Daily habit completion across the year</p>
        </div>

        {/* Year stats pills */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: 'Active Days',   value: activeDays,        color: '#a78bfa' },
            { label: 'Completions',   value: totalCompletions,  color: '#67e8f9' },
            { label: 'Best Streak',   value: `${maxStreak}d`,   color: '#6ee7b7' },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center px-3 py-1.5 rounded-xl glass gap-0">
              <span className="text-sm font-extrabold tabular-nums" style={{ color: s.color }}>{s.value}</span>
              <span className="text-[9px] text-white/30 uppercase tracking-widest">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div ref={scrollRef} className="overflow-x-auto pb-2 -mx-1 px-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(124,106,247,0.3) transparent' }}>
        <div style={{ minWidth: `${weeks.length * 16}px` }}>

          {/* Month labels */}
          <div className="flex mb-1" style={{ paddingLeft: '28px' }}>
            {weeks.map((_, col) => {
              const mp = monthPositions.find(p => p.col === col);
              return (
                <div key={col} className="w-3 mr-1 shrink-0">
                  {mp && (
                    <span className="text-[9px] text-white/35 font-medium whitespace-nowrap">
                      {mp.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Day rows + cells */}
          <div className="flex gap-0">
            {/* Day-of-week labels */}
            <div className="flex flex-col gap-1 mr-1 shrink-0">
              {DAYS.map((d, i) => (
                <div key={d} className="w-6 h-3 flex items-center justify-end pr-1">
                  {i % 2 === 1 && (
                    <span className="text-[8px] text-white/25 font-medium">{d.slice(0,1)}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Week columns */}
            <div className="flex gap-1">
              {weeks.map((week, col) => (
                <div key={col} className="flex flex-col gap-1">
                  {week.map((date, row) => (
                    <Cell
                      key={`${col}-${row}`}
                      date={date}
                      activity={date ? activityMap.get(date) : undefined}
                      isToday={date === todayStr}
                      onHover={handleHover}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: legend + summary */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-1 border-t border-white/[0.06]">
        {/* Legend */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/30">Less</span>
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className="w-3 h-3 rounded-sm"
              style={{ background: LEVEL_STYLE[level].bg, boxShadow: LEVEL_STYLE[level].shadow }}
              title={LEVEL_STYLE[level].label}
            />
          ))}
          <span className="text-[10px] text-white/30">More</span>
        </div>

        {/* Summary text */}
        <p className="text-[11px] text-white/30">
          <span className="text-white/60 font-semibold">{activeDays}</span> active days out of{' '}
          <span className="text-white/60 font-semibold">{totalDays}</span> this year
          {' · '}
          <span className="text-white/60 font-semibold">
            {totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0}%
          </span> consistency
        </p>
      </div>

      {tooltip && <Tooltip tip={tooltip} />}
    </div>
  );
}
