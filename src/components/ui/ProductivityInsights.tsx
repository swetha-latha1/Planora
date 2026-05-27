'use client';
import { useState, useEffect } from 'react';
import { cn } from '@/utils';
import type { Habit } from '@/types';
import { useInsights, type HabitInsight, type InsightSeverity } from '@/hooks/useInsights';
import InsightCard from '@/components/ui/InsightCard';

// ── Animated scanning header ──────────────────────────────────────────────────
function ScanHeader({ scanning }: { scanning: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {/* AI orb */}
      <div className="relative w-9 h-9 shrink-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg,#7c6af7,#06b6d4)',
            boxShadow: scanning
              ? '0 0 20px rgba(124,106,247,0.7), 0 0 40px rgba(6,182,212,0.4)'
              : '0 0 12px rgba(124,106,247,0.4)',
            transition: 'box-shadow 0.4s ease',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" className="w-4.5 h-4.5 w-[18px] h-[18px]">
            <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/>
            <path d="M12 8v4l3 3"/>
            <path d="M8.5 3.5l1 2M15.5 3.5l-1 2M3.5 8.5l2 1M3.5 15.5l2-1M8.5 20.5l1-2M15.5 20.5l-1-2M20.5 8.5l-2 1M20.5 15.5l-2-1"/>
          </svg>
        </div>
        {scanning && (
          <div className="absolute inset-0 rounded-xl animate-ping opacity-30"
            style={{ background: 'linear-gradient(135deg,#7c6af7,#06b6d4)' }} />
        )}
      </div>

      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-white/85">AI Productivity Insights</h2>
          <span className={cn(
            'text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-widest transition-all',
            scanning
              ? 'bg-violet-500/20 text-violet-300 border-violet-500/30 animate-pulse'
              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
          )}>
            {scanning ? 'Analysing…' : 'Live'}
          </span>
        </div>
        <p className="text-[11px] text-white/30 mt-0.5">
          Personalised insights generated from your habit data
        </p>
      </div>
    </div>
  );
}

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, label }: { score: number; label: string }) {
  const size = 80, stroke = 7, r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const color = score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#fb7185';

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color}/>
            <stop offset="100%" stopColor={color} stopOpacity="0.6"/>
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="rgba(255,255,255,0.05)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="url(#scoreGrad)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - score / 100)}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 6px ${color})` }}
        />
        <text x="50%" y="46%" dominantBaseline="middle" textAnchor="middle"
          fontSize="16" fontWeight="800" fill={color}>{score}</text>
        <text x="50%" y="66%" dominantBaseline="middle" textAnchor="middle"
          fontSize="8" fill="rgba(255,255,255,0.3)">/100</text>
      </svg>
      <p className="text-[10px] text-white/35 uppercase tracking-widest text-center">{label}</p>
    </div>
  );
}

// ── Filter pill ───────────────────────────────────────────────────────────────
const FILTERS: { label: string; value: InsightSeverity | 'all' }[] = [
  { label: 'All',       value: 'all'      },
  { label: '✅ Wins',   value: 'positive' },
  { label: '⚠️ Watch',  value: 'warning'  },
  { label: '🚨 Urgent', value: 'critical' },
  { label: '💡 Info',   value: 'info'     },
];

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyInsights() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center text-3xl animate-float">🤖</div>
      <div>
        <p className="text-sm font-semibold text-white/50">Not enough data yet</p>
        <p className="text-xs text-white/25 mt-1">Complete habits for a few days to unlock AI insights</p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props { habits: Habit[] }

export default function ProductivityInsights({ habits }: Props) {
  const insights = useInsights(habits);
  const [filter, setFilter]     = useState<InsightSeverity | 'all'>('all');
  const [scanning, setScanning] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Simulate a brief scan on mount and on refresh
  useEffect(() => {
    setScanning(true);
    const t = setTimeout(() => setScanning(false), 1800);
    return () => clearTimeout(t);
  }, [refreshKey]);

  const filtered = filter === 'all'
    ? insights
    : insights.filter(i => i.severity === filter);

  // Aggregate score: weighted average of consistency + best habit rate
  const consistencyInsight = insights.find(i => i.type === 'consistency');
  const consistencyScore   = consistencyInsight ? parseInt(consistencyInsight.metric) : 0;
  const positiveCount      = insights.filter(i => i.severity === 'positive').length;
  const criticalCount      = insights.filter(i => i.severity === 'critical').length;
  const overallScore       = Math.max(0, Math.min(100,
    consistencyScore + positiveCount * 5 - criticalCount * 10
  ));

  const counts = {
    positive: insights.filter(i => i.severity === 'positive').length,
    warning:  insights.filter(i => i.severity === 'warning').length,
    critical: insights.filter(i => i.severity === 'critical').length,
    info:     insights.filter(i => i.severity === 'info').length,
  };

  return (
    <div className="glass rounded-3xl p-5 md:p-6 space-y-5">

      {/* ── Top bar ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <ScanHeader scanning={scanning} />

        <div className="flex items-center gap-3">
          {/* Score ring */}
          <ScoreRing score={overallScore} label="Overall Score" />

          {/* Refresh */}
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/40 hover:text-white/80 transition-all hover:bg-white/[0.08]"
            title="Refresh insights"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={cn('w-4 h-4 transition-transform duration-700', scanning && 'animate-spin')}>
              <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Summary pills ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Wins',     count: counts.positive, color: '#34d399', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)'  },
          { label: 'Warnings', count: counts.warning,  color: '#fbbf24', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)'  },
          { label: 'Urgent',   count: counts.critical, color: '#fb7185', bg: 'rgba(244,63,94,0.1)',   border: 'rgba(244,63,94,0.2)'   },
          { label: 'Insights', count: counts.info,     color: '#a78bfa', bg: 'rgba(124,106,247,0.1)', border: 'rgba(124,106,247,0.2)' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl"
            style={{ background: s.bg, border: `1px solid ${s.border}` }}>
            <span className="text-xl font-extrabold tabular-nums" style={{ color: s.color }}>{s.count}</span>
            <span className="text-[10px] text-white/40 uppercase tracking-wide font-semibold">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Filter bar ── */}
      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap',
              filter === f.value
                ? 'bg-accent/25 text-accent2 border border-accent/35 shadow-[0_0_12px_rgba(124,106,247,0.2)]'
                : 'glass text-white/35 hover:text-white/65 border border-white/[0.06]',
            )}
          >
            {f.label}
            {f.value !== 'all' && (
              <span className="ml-1.5 text-[9px] opacity-60">
                {f.value === 'positive' ? counts.positive
                  : f.value === 'warning' ? counts.warning
                  : f.value === 'critical' ? counts.critical
                  : counts.info}
              </span>
            )}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-white/20 self-center">
          {filtered.length} insight{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Insight cards grid ── */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {scanning ? (
          // Skeleton shimmer while scanning
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass rounded-3xl p-5 space-y-3 animate-pulse"
              style={{ animationDelay: `${i * 150}ms` }}>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.06]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/[0.06] rounded-full w-3/4" />
                  <div className="h-2 bg-white/[0.04] rounded-full w-1/2" />
                </div>
                <div className="w-12 space-y-1">
                  <div className="h-5 bg-white/[0.06] rounded-full" />
                  <div className="h-2 bg-white/[0.04] rounded-full" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="h-2 bg-white/[0.05] rounded-full" />
                <div className="h-2 bg-white/[0.05] rounded-full w-5/6" />
                <div className="h-2 bg-white/[0.05] rounded-full w-4/6" />
              </div>
              <div className="flex justify-between items-end">
                <div className="w-16 h-6 bg-white/[0.04] rounded-lg" />
                <div className="w-20 h-6 bg-white/[0.04] rounded-xl" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <EmptyInsights />
        ) : (
          filtered.map((insight, i) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              index={i}
              onAction={(_ins: HabitInsight) => {
                // Scroll to habits section or trigger relevant action
              }}
            />
          ))
        )}
      </div>

      {/* ── Footer ── */}
      {!scanning && insights.length > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
          <p className="text-[10px] text-white/20">
            Based on {habits.length} habit{habits.length !== 1 ? 's' : ''} ·{' '}
            {habits.reduce((s, h) => s + h.completedDates.length, 0)} total completions
          </p>
          <p className="text-[10px] text-white/20">
            Updated just now
          </p>
        </div>
      )}
    </div>
  );
}
