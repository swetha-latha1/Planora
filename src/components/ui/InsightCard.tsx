'use client';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/utils';
import type { HabitInsight, InsightSeverity } from '@/hooks/useInsights';

// ── Theme per severity ────────────────────────────────────────────────────────
const THEME: Record<InsightSeverity, {
  bg: string; border: string; glow: string;
  badge: string; metricColor: string; iconBg: string;
}> = {
  positive: {
    bg:          'from-emerald-500/10 to-teal-500/5',
    border:      'border-emerald-500/25',
    glow:        'rgba(16,185,129,0.2)',
    badge:       'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    metricColor: '#34d399',
    iconBg:      'from-emerald-500 to-teal-400',
  },
  warning: {
    bg:          'from-amber-500/10 to-orange-500/5',
    border:      'border-amber-500/25',
    glow:        'rgba(245,158,11,0.2)',
    badge:       'bg-amber-500/15 text-amber-400 border-amber-500/25',
    metricColor: '#fbbf24',
    iconBg:      'from-amber-500 to-orange-400',
  },
  critical: {
    bg:          'from-rose-500/12 to-red-500/5',
    border:      'border-rose-500/30',
    glow:        'rgba(244,63,94,0.25)',
    badge:       'bg-rose-500/15 text-rose-400 border-rose-500/25',
    metricColor: '#fb7185',
    iconBg:      'from-rose-500 to-red-400',
  },
  info: {
    bg:          'from-violet-500/10 to-accent2/5',
    border:      'border-violet-500/25',
    glow:        'rgba(124,106,247,0.2)',
    badge:       'bg-violet-500/15 text-violet-300 border-violet-500/25',
    metricColor: '#a78bfa',
    iconBg:      'from-violet-500 to-accent2',
  },
};

const TYPE_ICON: Record<string, string> = {
  best_habit:  '⭐',
  weak_habit:  '⚠️',
  consistency: '📊',
  trend_up:    '📈',
  trend_down:  '📉',
  streak_risk: '🔥',
  perfect_day: '🎯',
  recovery:    '💪',
};

const SEVERITY_LABEL: Record<InsightSeverity, string> = {
  positive: 'Great',
  warning:  'Attention',
  critical: 'Urgent',
  info:     'Insight',
};

// ── Inline sparkline ──────────────────────────────────────────────────────────
function Spark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const w = 64, h = 24, pad = 2;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v / max) * (h - pad * 2));
    return `${x},${y}`;
  });
  const line = `M${pts.join(' L')}`;
  const area = `${line} L${w - pad},${h} L${pad},${h} Z`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible shrink-0">
      <defs>
        <linearGradient id={`sg-${color.replace(/[^a-z]/gi,'')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace(/[^a-z]/gi,'')})`}/>
      <path d={line} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"/>
      <circle
        cx={pts[pts.length-1].split(',')[0]}
        cy={pts[pts.length-1].split(',')[1]}
        r="2.5" fill={color}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );
}

// ── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 18, delay = 300) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(interval); setDone(true); }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { displayed, done };
}

// ── Trend arrow ───────────────────────────────────────────────────────────────
function TrendArrow({ trend, color }: { trend: 'up' | 'down' | 'flat'; color: string }) {
  if (trend === 'flat') return <span className="text-white/20 text-xs">—</span>;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"
      className={cn('w-3.5 h-3.5 transition-transform', trend === 'down' && 'rotate-180')}
    >
      <path d="M18 15l-6-6-6 6"/>
    </svg>
  );
}

// ── Main card ─────────────────────────────────────────────────────────────────
interface Props {
  insight: HabitInsight;
  index: number;
  onAction?: (insight: HabitInsight) => void;
}

export default function InsightCard({ insight, index, onAction }: Props) {
  const t = THEME[insight.severity];
  const { displayed, done } = useTypewriter(insight.body, 16, index * 120 + 200);
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative rounded-3xl border bg-gradient-to-br overflow-hidden',
        'transition-all duration-300 ease-out cursor-default',
        'animate-slide-up',
        t.bg, t.border,
      )}
      style={{
        animationDelay: `${index * 80}ms`,
        animationFillMode: 'both',
        backdropFilter: 'blur(20px)',
        boxShadow: hovered
          ? `0 20px 48px rgba(0,0,0,0.45), 0 0 32px ${t.glow}`
          : `0 4px 20px rgba(0,0,0,0.25), 0 0 0 0 ${t.glow}`,
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Animated gradient border shimmer on hover */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${t.glow.replace('0.2','0.15')}, transparent 60%)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Scanning line animation */}
      {!done && (
        <div
          className="absolute left-0 right-0 h-px pointer-events-none z-10"
          style={{
            background: `linear-gradient(90deg, transparent, ${t.metricColor}, transparent)`,
            animation: 'scanLine 1.8s ease-in-out infinite',
            top: '50%',
            opacity: 0.4,
          }}
        />
      )}

      <div className="relative p-5 flex flex-col gap-4">

        {/* ── Header row ── */}
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={cn('w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 bg-gradient-to-br', t.iconBg)}
            style={{ boxShadow: `0 4px 14px ${t.glow}` }}
          >
            {TYPE_ICON[insight.type]}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white/85 leading-tight">{insight.title}</h3>
              {/* Severity badge */}
              <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-widest', t.badge)}>
                {SEVERITY_LABEL[insight.severity]}
              </span>
            </div>
            {/* Habit name if attached */}
            {insight.habit && (
              <p className="text-[10px] text-white/30 mt-0.5 flex items-center gap-1">
                <span>{insight.habit.icon}</span>
                <span className="capitalize">{insight.habit.category}</span>
                <span className="text-white/15">·</span>
                <span className="capitalize">{insight.habit.frequency}</span>
              </p>
            )}
          </div>

          {/* Metric */}
          <div className="shrink-0 text-right">
            <div className="flex items-center gap-1 justify-end">
              <TrendArrow trend={insight.trend} color={t.metricColor} />
              <span className="text-xl font-extrabold tabular-nums leading-none" style={{ color: t.metricColor }}>
                {insight.metric}
              </span>
            </div>
            <p className="text-[9px] text-white/25 uppercase tracking-widest mt-0.5">{insight.metricLabel}</p>
          </div>
        </div>

        {/* ── Typewriter body ── */}
        <div className="min-h-[40px]">
          <p className="text-xs text-white/55 leading-relaxed">
            {displayed}
            {!done && (
              <span
                className="inline-block w-0.5 h-3 ml-0.5 align-middle rounded-full"
                style={{ background: t.metricColor, animation: 'blink 0.8s step-end infinite' }}
              />
            )}
          </p>
        </div>

        {/* ── Sparkline + action ── */}
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-[9px] text-white/20 uppercase tracking-widest">7-day trend</p>
            <Spark data={insight.spark} color={t.metricColor} />
          </div>

          {insight.actionLabel && (
            <button
              onClick={() => onAction?.(insight)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all duration-200',
                'hover:scale-105 active:scale-95',
                t.badge,
              )}
            >
              {insight.actionLabel} →
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
