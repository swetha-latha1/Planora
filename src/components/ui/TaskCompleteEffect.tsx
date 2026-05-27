'use client';
import { useEffect, useState } from 'react';

const EMOJIS = ['🎉', '⭐', '🔥', '✨', '💪', '🏆', '🎯', '💎'];
const COLORS = ['#7c6af7', '#06b6d4', '#f43f5e', '#10b981', '#fbbf24', '#a78bfa', '#f97316', '#ec4899'];

const MESSAGES = [
  { title: 'Task Crushed! 💪', sub: "You're on fire! Keep it up!" },
  { title: 'Nailed it! 🎯', sub: 'One step closer to your goal!' },
  { title: 'Boom! Done! 🔥', sub: 'That\'s what champions do!' },
  { title: 'Outstanding! 🏆', sub: 'You\'re absolutely killing it!' },
  { title: 'Level Up! ⭐', sub: 'Another task bites the dust!' },
];

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  emoji: string;
  size: number;
  vx: number;
  vy: number;
  rotation: number;
  shape: string;
}

interface Props {
  onDone: () => void;
}

export default function TaskCompleteEffect({ onDone }: Props) {
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: 50,
      y: 50,
      color: COLORS[i % COLORS.length],
      emoji: EMOJIS[i % EMOJIS.length],
      size: Math.random() * 10 + 6,
      vx: (Math.random() - 0.5) * 160,
      vy: (Math.random() - 0.5) * 160 - 60,
      rotation: Math.random() * 720,
      shape: Math.random() > 0.5 ? '50%' : '3px',
    }))
  );

  const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
    >
      {/* Confetti particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.shape === '50%' ? p.color : undefined,
            borderRadius: p.shape,
            fontSize: p.shape !== '50%' ? p.size + 4 : undefined,
            animation: `confettiBurst 2.6s ease-out forwards`,
            animationDelay: `${Math.random() * 0.3}s`,
            '--vx': `${p.vx}px`,
            '--vy': `${p.vy}px`,
            '--rot': `${p.rotation}deg`,
          } as React.CSSProperties}
        >
          {p.shape !== '50%' ? p.emoji : null}
        </div>
      ))}

      {/* Popup card */}
      <div
        className="relative flex flex-col items-center gap-3 px-10 py-8 rounded-3xl border border-white/20 pointer-events-auto"
        style={{
          background: 'linear-gradient(135deg,#1a0a3a,#0a1a2e)',
          boxShadow: '0 0 80px rgba(124,106,247,0.6), 0 24px 60px rgba(0,0,0,0.7)',
          animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}
      >
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 0%,rgba(124,106,247,0.25),transparent 70%)' }} />

        <div style={{ fontSize: 56, animation: 'bounceEmoji 0.6s ease-out 0.2s both' }}>🎉</div>
        <h2 className="text-2xl font-extrabold text-white/95 text-center">{msg.title}</h2>
        <p className="text-sm text-white/50 text-center">{msg.sub}</p>

        {/* XP badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full mt-1"
          style={{ background: 'linear-gradient(135deg,rgba(124,106,247,0.3),rgba(6,182,212,0.2))', border: '1px solid rgba(124,106,247,0.4)' }}>
          <span className="text-sm font-bold" style={{ color: '#a78bfa' }}>+10 XP</span>
          <span className="text-xs text-white/40">earned</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full mt-1" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#7c6af7,#06b6d4)', animation: 'fillBar 2.4s ease-out forwards' }} />
        </div>
      </div>

      <style>{`
        @keyframes confettiBurst {
          0%   { transform: translate(0,0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translate(var(--vx), var(--vy)) rotate(var(--rot)) scale(0); opacity: 0; }
        }
        @keyframes popIn {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes bounceEmoji {
          0%   { transform: scale(0) rotate(-20deg); }
          60%  { transform: scale(1.3) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
