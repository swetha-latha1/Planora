'use client';
import dynamic from 'next/dynamic';
import { cn } from '@/utils';
import { PASTEL } from '@/charts/chartDefaults';

// Dynamic imports — Chart.js needs browser canvas API
const TrendLineChart       = dynamic(() => import('@/charts/TrendLineChart'),       { ssr: false });
const WeeklyBarChart       = dynamic(() => import('@/charts/WeeklyBarChart'),       { ssr: false });
const CircularProgressChart = dynamic(() => import('@/charts/CircularProgressChart'), { ssr: false });
const MonthlyComparisonChart = dynamic(() => import('@/charts/MonthlyComparisonChart'), { ssr: false });

// ── Stat pill row above each chart ──────────────────────────────────────────
function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-2 rounded-2xl glass gap-0.5">
      <span className="text-lg font-extrabold" style={{ color }}>{value}</span>
      <span className="text-[10px] text-white/35 uppercase tracking-widest whitespace-nowrap">{label}</span>
    </div>
  );
}

// ── Section header ───────────────────────────────────────────────────────────
function SectionHeader({
  title, subtitle, badge, children,
}: { title: string; subtitle: string; badge?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-white/85">{title}</h2>
          {badge && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/20 text-accent2 border border-accent/25">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-white/30 mt-0.5">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

// ── Period toggle ────────────────────────────────────────────────────────────
function PeriodToggle({ options, active }: { options: string[]; active: string }) {
  return (
    <div className="flex gap-1 p-1 rounded-xl glass">
      {options.map(o => (
        <button key={o} className={cn(
          'px-3 py-1 rounded-lg text-xs font-semibold transition-all',
          o === active
            ? 'bg-accent/25 text-accent2 border border-accent/30'
            : 'text-white/30 hover:text-white/60',
        )}>{o}</button>
      ))}
    </div>
  );
}

// ── Circular chart data ──────────────────────────────────────────────────────
const CATEGORY_SEGMENTS = [
  { label: 'Work',     value: 42, color: PASTEL.violet.pastel },
  { label: 'Personal', value: 24, color: PASTEL.cyan.pastel   },
  { label: 'Health',   value: 18, color: PASTEL.emerald.pastel },
  { label: 'Learning', value: 16, color: PASTEL.amber.pastel  },
];

const HABIT_SEGMENTS = [
  { label: 'Completed', value: 68, color: PASTEL.emerald.pastel },
  { label: 'Partial',   value: 20, color: PASTEL.amber.pastel   },
  { label: 'Missed',    value: 12, color: PASTEL.rose.pastel    },
];

const FOCUS_SEGMENTS = [
  { label: 'Deep Work',  value: 55, color: PASTEL.violet.pastel },
  { label: 'Meetings',   value: 25, color: PASTEL.sky.pastel    },
  { label: 'Admin',      value: 20, color: PASTEL.pink.pastel   },
];

// ── Insight cards ────────────────────────────────────────────────────────────
const INSIGHTS = [
  {
    icon: '🚀', title: 'Peak Performance Day',
    body: 'You\'re most productive on Thursdays — averaging 15 tasks completed.',
    color: 'from-violet-500/15 to-accent2/5', border: 'border-violet-500/20',
  },
  {
    icon: '🔥', title: 'Streak Milestone',
    body: '12-day streak is your personal best. Keep going to hit 14!',
    color: 'from-orange-500/15 to-rose-500/5', border: 'border-orange-500/20',
  },
  {
    icon: '⚡', title: 'Focus Improvement',
    body: 'Focus session duration increased 34% compared to last month.',
    color: 'from-cyan-500/15 to-accent3/5', border: 'border-cyan-500/20',
  },
  {
    icon: '🎯', title: 'Goal on Track',
    body: 'Monthly completion at 84% — you\'re 4 days ahead of schedule.',
    color: 'from-emerald-500/15 to-teal-500/5', border: 'border-emerald-500/20',
  },
];

// ── Main page ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">

      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white/90">
            Analytics <span className="grad-text">Overview</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Detailed insights into your productivity patterns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodToggle options={['7D', '30D', '90D', '1Y']} active="30D" />
          <button className="btn-glow px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* ── Row 1: Trend Line (full width) ── */}
      <div className="glass rounded-3xl p-5 md:p-6">
        <SectionHeader
          title="Productivity Trend"
          subtitle="30-day rolling score vs target baseline"
          badge="Live"
        >
          <div className="flex gap-2 flex-wrap">
            <StatPill label="Avg Score"  value="84"   color={PASTEL.violet.solid} />
            <StatPill label="Peak"       value="96"   color={PASTEL.cyan.solid}   />
            <StatPill label="Above Target" value="22d" color={PASTEL.emerald.solid} />
          </div>
        </SectionHeader>
        <TrendLineChart />
      </div>

      {/* ── Row 2: Weekly Bar + 3 Doughnuts ── */}
      <div className="grid lg:grid-cols-5 gap-4 md:gap-5">

        {/* Weekly bar — 3 cols */}
        <div className="lg:col-span-3 glass rounded-3xl p-5 md:p-6">
          <SectionHeader
            title="Weekly Activity"
            subtitle="Tasks completed, created & focus hours"
          >
            <PeriodToggle options={['This Week', 'Last Week']} active="This Week" />
          </SectionHeader>
          <WeeklyBarChart />
          {/* Weekly totals */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Total Completed', value: '68', color: PASTEL.violet.solid },
              { label: 'Total Created',   value: '81', color: PASTEL.cyan.solid   },
              { label: 'Focus Hours',     value: '26.5h', color: PASTEL.emerald.solid },
            ].map(s => (
              <div key={s.label} className="glass rounded-2xl p-3 text-center">
                <p className="text-xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] text-white/35 mt-0.5 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3 doughnuts stacked — 2 cols */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          <div className="glass rounded-3xl p-5 flex-1">
            <SectionHeader title="Task Categories" subtitle="Distribution by type" />
            <CircularProgressChart
              title="Categories"
              centerValue="168"
              centerLabel="Total Tasks"
              segments={CATEGORY_SEGMENTS}
            />
          </div>

        </div>
      </div>

      {/* ── Row 3: Two more doughnuts + Monthly comparison ── */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">

        <div className="glass rounded-3xl p-5">
          <SectionHeader title="Habit Completion" subtitle="This month's habit rate" />
          <CircularProgressChart
            title="Habits"
            centerValue="68%"
            centerLabel="Completion"
            segments={HABIT_SEGMENTS}
          />
        </div>

        <div className="glass rounded-3xl p-5">
          <SectionHeader title="Time Allocation" subtitle="How your focus time is split" />
          <CircularProgressChart
            title="Focus"
            centerValue="26.5h"
            centerLabel="This Week"
            segments={FOCUS_SEGMENTS}
          />
        </div>

        {/* Heatmap-style day breakdown */}
        <div className="glass rounded-3xl p-5 md:col-span-2 lg:col-span-1">
          <SectionHeader title="Daily Breakdown" subtitle="Tasks completed per hour today" />
          <HourlyHeatmap />
        </div>

      </div>

      {/* ── Row 4: Monthly comparison (full width) ── */}
      <div className="glass rounded-3xl p-5 md:p-6">
        <SectionHeader
          title="Monthly Comparison"
          subtitle="Year-over-year productivity score & tasks completed"
          badge="2025 vs 2024"
        >
          <div className="flex gap-2 flex-wrap">
            <StatPill label="YoY Growth"  value="+18%"  color={PASTEL.emerald.solid} />
            <StatPill label="Best Month"  value="Dec"   color={PASTEL.violet.solid}  />
            <StatPill label="Avg Tasks"   value="79/mo" color={PASTEL.cyan.solid}    />
          </div>
        </SectionHeader>
        <MonthlyComparisonChart />
      </div>

      {/* ── Row 5: AI Insights ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-base font-bold text-white/85">AI Insights</h2>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            4 new
          </span>
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
          {INSIGHTS.map((ins, i) => (
            <div
              key={i}
              className={cn(
                'glass rounded-3xl p-4 border bg-gradient-to-br cursor-pointer group',
                ins.color, ins.border,
              )}
              style={{ transition: 'transform 0.25s ease, box-shadow 0.25s ease' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 40px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = '';
                (e.currentTarget as HTMLElement).style.boxShadow = '';
              }}
            >
              <div className="text-2xl mb-3">{ins.icon}</div>
              <p className="text-sm font-semibold text-white/80 mb-1.5 group-hover:text-white transition-colors">
                {ins.title}
              </p>
              <p className="text-xs text-white/40 leading-relaxed group-hover:text-white/55 transition-colors">
                {ins.body}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ── Hourly heatmap (pure CSS, no chart lib needed) ───────────────────────────
const HOURS = ['6am','7','8','9','10','11','12pm','1','2','3','4','5','6','7','8','9'];
const HEAT  = [1, 2, 4, 7, 9, 8, 6, 10, 9, 7, 5, 4, 3, 2, 1, 0];

function HourlyHeatmap() {
  const max = Math.max(...HEAT);
  return (
    <div className="space-y-3">
      <div className="flex gap-1 flex-wrap">
        {HEAT.map((v, i) => {
          const intensity = v / max;
          return (
            <div key={i} className="flex flex-col items-center gap-1 group cursor-pointer">
              <div
                className="w-5 rounded-md transition-all duration-200 group-hover:scale-110"
                style={{
                  height: `${Math.max(8, intensity * 60)}px`,
                  background: `rgba(167,139,250,${0.1 + intensity * 0.8})`,
                  boxShadow: intensity > 0.6 ? `0 0 8px rgba(167,139,250,${intensity * 0.5})` : 'none',
                }}
              />
              <span className="text-[8px] text-white/20 group-hover:text-white/50 transition-colors">
                {HOURS[i]}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-[10px] text-white/25">
        <span>6:00 AM</span>
        <span className="text-white/40">Peak: 1pm (10 tasks)</span>
        <span>10:00 PM</span>
      </div>
    </div>
  );
}
