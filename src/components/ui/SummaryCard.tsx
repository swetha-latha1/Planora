'use client';
import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/utils';

interface SparkPoint { v: number }

interface SummaryCardProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  spark?: SparkPoint[];
  gradient: string;          // tailwind bg-gradient-to-br classes
  glowColor: string;         // rgba string for box-shadow
  iconBg: string;            // tailwind gradient for icon bg
  delay?: number;
}

function Sparkline({ points, color }: { points: SparkPoint[]; color: string }) {
  const max = Math.max(...points.map(p => p.v), 1);
  const min = Math.min(...points.map(p => p.v));
  const range = max - min || 1;
  const w = 80, h = 32, pad = 2;

  const coords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * (w - pad * 2);
    const y = h - pad - ((p.v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });

  const area = `M${coords[0]} L${coords.join(' L')} L${w - pad},${h} L${pad},${h} Z`;
  const line = `M${coords[0]} L${coords.join(' L')}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last point dot */}
      <circle
        cx={coords[coords.length - 1].split(',')[0]}
        cy={coords[coords.length - 1].split(',')[1]}
        r="2.5" fill={color}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );
}

// Allow only valid rgba/rgb/hex color strings to prevent XSS via inline styles
function sanitizeColor(color: string): string {
  return /^(rgba?\([\d.,\s]+\)|#[0-9a-fA-F]{3,8})$/.test(color.trim()) ? color.trim() : 'rgba(124,106,247,0.4)';
}

export default function SummaryCard({
  label, value, suffix = '', prefix = '',
  icon, trend, spark, gradient, glowColor: rawGlowColor, iconBg, delay = 0,
}: SummaryCardProps) {
  const glowColor = sanitizeColor(rawGlowColor);
  const count = useCountUp(value, 1600, delay);
  const isUp = (trend?.value ?? 0) >= 0;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl p-5 cursor-default select-none',
        'glass group',
        gradient,
      )}
      style={{
        transition: 'transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease, border-color 0.28s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px) scale(1.015)';
        (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 50px rgba(0,0,0,0.45), 0 0 30px ${glowColor}`;
        (e.currentTarget as HTMLElement).style.borderColor = glowColor.replace('0.', '0.5').replace(')', ')');
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = '';
        (e.currentTarget as HTMLElement).style.boxShadow = '';
        (e.currentTarget as HTMLElement).style.borderColor = '';
      }}
    >
      {/* Top row: icon + trend */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        {/* Icon */}
        <div
          className={cn('w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0', iconBg)}
          style={{ boxShadow: `0 4px 16px ${glowColor}` }}
        >
          {icon}
        </div>

        {/* Trend badge */}
        {trend && (
          <div className={cn(
            'flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold',
            isUp
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
          )}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              className={cn('w-3 h-3 transition-transform', !isUp && 'rotate-180')}>
              <path d="M18 15l-6-6-6 6"/>
            </svg>
            {Math.abs(trend.value)}{trend.label}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="relative z-10 mb-1">
        <div className="flex items-end gap-1">
          {prefix && <span className="text-lg font-bold text-white/50 mb-0.5">{prefix}</span>}
          <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none tabular-nums">
            {count}
          </span>
          {suffix && <span className="text-lg font-bold text-white/50 mb-0.5">{suffix}</span>}
        </div>
        <p className="text-xs font-semibold text-white/40 mt-2 uppercase tracking-widest">{label}</p>
      </div>

      {/* Sparkline */}
      {spark && (
        <div className="mt-3 relative z-10 opacity-70 group-hover:opacity-100 transition-opacity">
          <Sparkline points={spark} color={glowColor.replace(/rgba?\(([^,]+,[^,]+,[^,]+).*/, 'rgb($1)')} />
        </div>
      )}

      {/* Bottom shimmer line on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${glowColor.replace('0.4', '0.8')}, transparent)` }}
      />
    </div>
  );
}
