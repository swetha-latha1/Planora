'use client';
import { useState } from 'react';
import { cn } from '@/utils';
import type { Badge, BadgeRarity, GamificationProfile } from '@/types';
import { getLevelInfo, LEVELS, ALL_BADGES, XP_REWARDS } from '@/hooks/useGamification';

// ── Rarity config ─────────────────────────────────────────────────────────────
const RARITY: Record<BadgeRarity, { label: string; color: string; glow: string; border: string; bg: string }> = {
  common:    { label: 'Common',    color: '#94a3b8', glow: 'rgba(148,163,184,0.3)', border: 'rgba(148,163,184,0.2)', bg: 'rgba(148,163,184,0.06)' },
  rare:      { label: 'Rare',      color: '#67e8f9', glow: 'rgba(103,232,249,0.4)', border: 'rgba(103,232,249,0.25)',bg: 'rgba(103,232,249,0.08)' },
  epic:      { label: 'Epic',      color: '#a78bfa', glow: 'rgba(167,139,250,0.5)', border: 'rgba(167,139,250,0.3)', bg: 'rgba(167,139,250,0.1)'  },
  legendary: { label: 'Legendary', color: '#fbbf24', glow: 'rgba(251,191,36,0.6)',  border: 'rgba(251,191,36,0.35)', bg: 'rgba(251,191,36,0.1)'   },
};

// ── Milestones ────────────────────────────────────────────────────────────────
const MILESTONES = [
  { id: 'm1',  xp: 0,    icon: '🌱', label: 'Started',        desc: 'Began your journey'         },
  { id: 'm2',  xp: 100,  icon: '🔥', label: 'First Flame',    desc: 'Earned 100 XP'              },
  { id: 'm3',  xp: 250,  icon: '⚡', label: 'Energised',      desc: 'Earned 250 XP'              },
  { id: 'm4',  xp: 500,  icon: '🚀', label: 'Launched',       desc: 'Earned 500 XP'              },
  { id: 'm5',  xp: 900,  icon: '⭐', label: 'Star Power',     desc: 'Earned 900 XP'              },
  { id: 'm6',  xp: 1400, icon: '🏆', label: 'Champion',       desc: 'Earned 1,400 XP'            },
  { id: 'm7',  xp: 2100, icon: '💎', label: 'Diamond',        desc: 'Earned 2,100 XP'            },
  { id: 'm8',  xp: 3000, icon: '👑', label: 'Royalty',        desc: 'Earned 3,000 XP'            },
  { id: 'm9',  xp: 4200, icon: '🌙', label: 'Lunar',          desc: 'Earned 4,200 XP'            },
  { id: 'm10', xp: 6000, icon: '✨', label: 'Transcendent',   desc: 'Reached max level'          },
];

// ── Badge card ────────────────────────────────────────────────────────────────
function BadgeCard({ badge, size = 'md' }: { badge: Badge; size?: 'sm' | 'md' }) {
  const [hovered, setHovered] = useState(false);
  const r = RARITY[badge.rarity];
  const unlocked = !!badge.unlockedAt;
  const isLg = size === 'md';

  return (
    <div
      className={cn(
        'relative flex flex-col items-center gap-2 rounded-2xl border transition-all duration-300 cursor-default',
        isLg ? 'p-4' : 'p-3',
        !unlocked && 'opacity-40 grayscale',
      )}
      style={{
        background: unlocked ? r.bg : 'rgba(255,255,255,0.03)',
        borderColor: unlocked ? r.border : 'rgba(255,255,255,0.06)',
        boxShadow: hovered && unlocked ? `0 8px 24px rgba(0,0,0,0.3), 0 0 20px ${r.glow}` : 'none',
        transform: hovered && unlocked ? 'translateY(-3px) scale(1.04)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={badge.description}
    >
      {/* Rarity shimmer on hover */}
      {unlocked && hovered && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ background: `radial-gradient(circle at 50% 0%, ${r.color}, transparent 70%)` }} />
        </div>
      )}

      {/* Icon */}
      <div
        className={cn('rounded-xl flex items-center justify-center', isLg ? 'w-12 h-12 text-2xl' : 'w-9 h-9 text-xl')}
        style={unlocked ? {
          background: `radial-gradient(circle, ${r.glow.replace('0.', '0.2').replace('0.3','0.15')}, transparent)`,
          boxShadow: `0 0 12px ${r.glow}`,
        } : undefined}
      >
        {unlocked ? badge.icon : '🔒'}
      </div>

      {/* Name */}
      <p className={cn('font-bold text-center leading-tight', isLg ? 'text-xs text-white/80' : 'text-[10px] text-white/60')}>
        {badge.name}
      </p>

      {/* Rarity pill */}
      <span
        className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full"
        style={{ color: r.color, background: r.bg, border: `1px solid ${r.border}` }}
      >
        {r.label}
      </span>

      {/* XP reward */}
      {unlocked && isLg && (
        <span className="text-[9px] text-white/30">+{badge.xpReward} XP</span>
      )}

      {/* Unlock date */}
      {unlocked && badge.unlockedAt && isLg && (
        <span className="text-[8px] text-white/20">
          {new Date(badge.unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      )}
    </div>
  );
}

// ── Level XP bar ──────────────────────────────────────────────────────────────
function LevelBar({ profile }: { profile: GamificationProfile }) {
  const { current, next, xpIntoLevel, xpNeeded, pct } = getLevelInfo(profile.xp);

  return (
    <div className="flex items-center gap-4">
      {/* Level badge */}
      <div
        className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 font-black"
        style={{
          background: `linear-gradient(135deg,${current.color}33,${current.color}11)`,
          border: `2px solid ${current.color}55`,
          boxShadow: `0 0 20px ${current.color}44`,
          color: current.color,
        }}
      >
        <span className="text-xl leading-none">{current.level}</span>
        <span className="text-[8px] opacity-60 uppercase tracking-widest">Lvl</span>
      </div>

      <div className="flex-1 space-y-1.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-white/85">{current.title}</span>
            {current.level < 10 && (
              <span className="text-xs text-white/30 ml-2">→ {next.title}</span>
            )}
          </div>
          <span className="text-xs font-bold tabular-nums" style={{ color: current.color }}>
            {profile.xp.toLocaleString()} XP
          </span>
        </div>

        {/* XP bar */}
        <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden relative">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg,${current.color},${current.color}88)`,
              boxShadow: `0 0 10px ${current.color}88`,
            }}
          />
          {/* Shimmer */}
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <div className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              style={{ left: `${pct - 4}%`, transition: 'left 0.7s ease-out' }} />
          </div>
        </div>

        <div className="flex justify-between text-[10px] text-white/25">
          <span>{xpIntoLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP to next level</span>
          <span>{pct}%</span>
        </div>
      </div>
    </div>
  );
}

// ── Milestone timeline ────────────────────────────────────────────────────────
function MilestoneTimeline({ xp }: { xp: number }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest">Milestone Path</h3>
      <div className="flex items-center gap-0 overflow-x-auto pb-2">
        {MILESTONES.map((m, i) => {
          const reached = xp >= m.xp;
          const isCurrent = xp >= m.xp && (i === MILESTONES.length - 1 || xp < MILESTONES[i + 1].xp);
          return (
            <div key={m.id} className="flex items-center shrink-0">
              {/* Node */}
              <div
                className={cn(
                  'flex flex-col items-center gap-1 group cursor-default',
                  'transition-all duration-300',
                )}
                title={`${m.label}: ${m.desc}`}
              >
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all duration-300',
                    reached ? 'scale-100' : 'scale-90 opacity-30',
                    isCurrent && 'scale-110 animate-[glowPulse_2s_ease-in-out_infinite]',
                  )}
                  style={reached ? {
                    background: 'rgba(124,106,247,0.2)',
                    border: '1px solid rgba(124,106,247,0.4)',
                    boxShadow: isCurrent ? '0 0 16px rgba(124,106,247,0.6)' : '0 0 8px rgba(124,106,247,0.3)',
                  } : {
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {m.icon}
                </div>
                <span className={cn('text-[8px] font-semibold whitespace-nowrap', reached ? 'text-white/50' : 'text-white/20')}>
                  {m.label}
                </span>
              </div>

              {/* Connector */}
              {i < MILESTONES.length - 1 && (
                <div className="w-6 h-px mx-0.5 shrink-0 rounded-full"
                  style={{ background: xp >= MILESTONES[i + 1].xp ? 'rgba(124,106,247,0.5)' : 'rgba(255,255,255,0.06)' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────
type BadgeFilter = 'all' | 'unlocked' | BadgeRarity;

interface Props { profile: GamificationProfile }

export default function GamificationPanel({ profile }: Props) {
  const [badgeFilter, setBadgeFilter] = useState<BadgeFilter>('all');
  const [showAll, setShowAll] = useState(false);

  const allBadges = ALL_BADGES.map(def => {
    const saved = profile.badges.find(b => b.id === def.id);
    return saved ?? def;
  });

  const filtered = allBadges.filter(b => {
    if (badgeFilter === 'all')      return true;
    if (badgeFilter === 'unlocked') return !!b.unlockedAt;
    return b.rarity === badgeFilter;
  });

  const displayed = showAll ? filtered : filtered.slice(0, 12);
  const unlockedCount = allBadges.filter(b => b.unlockedAt).length;

  const BADGE_FILTERS: { label: string; value: BadgeFilter }[] = [
    { label: 'All',       value: 'all'       },
    { label: '✅ Earned', value: 'unlocked'  },
    { label: '⚪ Common', value: 'common'    },
    { label: '🔵 Rare',   value: 'rare'      },
    { label: '🟣 Epic',   value: 'epic'      },
    { label: '🟡 Legend', value: 'legendary' },
  ];

  return (
    <div className="glass rounded-3xl p-5 md:p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl btn-glow flex items-center justify-center text-xl">🎮</div>
          <div>
            <h2 className="text-base font-bold text-white/85">Gamification</h2>
            <p className="text-[11px] text-white/30">{unlockedCount} / {allBadges.length} badges · Level {profile.level}</p>
          </div>
        </div>
        {/* Quick stats */}
        <div className="flex gap-2">
          {[
            { v: profile.xp.toLocaleString(),       l: 'Total XP',    c: '#a78bfa' },
            { v: profile.totalCompletions.toString(),l: 'Completions', c: '#67e8f9' },
            { v: profile.perfectDays.toString(),     l: 'Perfect Days',c: '#34d399' },
          ].map(s => (
            <div key={s.l} className="flex flex-col items-center px-3 py-1.5 rounded-xl glass">
              <span className="text-sm font-extrabold tabular-nums" style={{ color: s.c }}>{s.v}</span>
              <span className="text-[9px] text-white/25 uppercase tracking-widest">{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Level bar */}
      <div className="glass rounded-2xl p-4">
        <LevelBar profile={profile} />
      </div>

      {/* All levels preview */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {LEVELS.map(l => {
          const reached = profile.level >= l.level;
          const isCurrent = profile.level === l.level;
          return (
            <div
              key={l.level}
              className={cn('flex flex-col items-center gap-1 shrink-0 px-2 py-1.5 rounded-xl transition-all', isCurrent && 'scale-110')}
              style={{
                background: reached ? `${l.color}18` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${reached ? l.color + '33' : 'rgba(255,255,255,0.05)'}`,
                boxShadow: isCurrent ? `0 0 12px ${l.color}55` : 'none',
              }}
              title={l.title}
            >
              <span className="text-xs font-black" style={{ color: reached ? l.color : 'rgba(255,255,255,0.2)' }}>
                {l.level}
              </span>
              <span className="text-[7px] text-white/20 whitespace-nowrap">{l.title.slice(0, 4)}</span>
            </div>
          );
        })}
      </div>

      {/* Milestone timeline */}
      <MilestoneTimeline xp={profile.xp} />

      {/* Badge section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-bold text-white/70 flex items-center gap-2">
            🏅 Achievement Badges
            <span className="text-[10px] font-normal text-white/30">
              {unlockedCount} earned
            </span>
          </h3>
          {/* Filter pills */}
          <div className="flex gap-1 flex-wrap">
            {BADGE_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setBadgeFilter(f.value)}
                className={cn(
                  'px-2.5 py-1 rounded-xl text-[10px] font-semibold transition-all whitespace-nowrap',
                  badgeFilter === f.value
                    ? 'bg-accent/25 text-accent2 border border-accent/30'
                    : 'glass text-white/30 hover:text-white/60 border border-white/[0.06]',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Badge grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {displayed.map(b => <BadgeCard key={b.id} badge={b} />)}
        </div>

        {filtered.length > 12 && (
          <button
            onClick={() => setShowAll(v => !v)}
            className="w-full py-2.5 rounded-2xl text-xs font-semibold text-white/40 glass hover:text-white/70 transition-all border border-white/[0.06]"
          >
            {showAll ? 'Show less ↑' : `Show all ${filtered.length} badges ↓`}
          </button>
        )}
      </div>

      {/* XP guide */}
      <div className="glass rounded-2xl p-4 space-y-2">
        <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest">How to Earn XP</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { label: 'Complete a habit',  xp: XP_REWARDS.habitComplete },
            { label: 'Perfect day',       xp: XP_REWARDS.perfectDay    },
            { label: '7-day streak',      xp: XP_REWARDS.streak7       },
            { label: '14-day streak',     xp: XP_REWARDS.streak14      },
            { label: '30-day streak',     xp: XP_REWARDS.streak30      },
            { label: 'Unlock a badge',    xp: XP_REWARDS.badgeUnlock   },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <span className="text-[10px] text-white/45">{r.label}</span>
              <span className="text-[10px] font-bold text-accent2">+{r.xp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
