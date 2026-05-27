'use client';
import { useEffect } from 'react';
import { useConfetti } from '@/hooks/useConfetti';

interface Props {
  level: number;
  title: string;
  color: string;
  xp: number;
  onClose: () => void;
}

export default function LevelUpModal({ level, title, color, xp, onClose }: Props) {
  const { launch, stop } = useConfetti();

  useEffect(() => {
    launch(undefined, undefined, 160);
    const t = setTimeout(onClose, 6000);
    return () => { stop(); clearTimeout(t); };
  }, [launch, stop, onClose]);

  const size = 140, stroke = 10, r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col items-center gap-6 p-10 rounded-[2rem] text-center max-w-sm mx-4"
        style={{
          background: 'rgba(15,12,41,0.95)',
          border: `1px solid ${color}44`,
          boxShadow: `0 0 80px ${color}44, 0 24px 60px rgba(0,0,0,0.6)`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Glow orb */}
        <div className="absolute inset-0 rounded-[2rem] pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-20"
            style={{ background: color }} />
        </div>

        {/* Ring */}
        <div className="relative">
          <svg width={size} height={size} className="animate-[spin_8s_linear_infinite]">
            <defs>
              <linearGradient id="lvlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color}/>
                <stop offset="100%" stopColor={color} stopOpacity="0.3"/>
              </linearGradient>
            </defs>
            <circle cx={size/2} cy={size/2} r={r} fill="none"
              stroke="rgba(255,255,255,0.05)" strokeWidth={stroke}/>
            <circle cx={size/2} cy={size/2} r={r} fill="none"
              stroke="url(#lvlGrad)" strokeWidth={stroke} strokeLinecap="round"
              strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
              style={{ filter: `drop-shadow(0 0 8px ${color})` }}
            />
          </svg>
          {/* Level number */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black" style={{ color }}>{level}</span>
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Level</span>
          </div>
        </div>

        {/* Text */}
        <div className="relative space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Level Up!</p>
          <h2 className="text-3xl font-black text-white">{title}</h2>
          <p className="text-sm text-white/50">
            You've reached <span style={{ color }} className="font-bold">Level {level}</span>.
            Keep building your habits to unlock the next tier.
          </p>
          <p className="text-xs text-white/30 pt-1">Total XP: <span className="font-bold text-white/60">{xp.toLocaleString()}</span></p>
        </div>

        {/* CTA */}
        <button
          onClick={onClose}
          className="relative px-8 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
          style={{
            background: `linear-gradient(135deg,${color},${color}88)`,
            boxShadow: `0 4px 20px ${color}66`,
          }}
        >
          Keep Going 🚀
        </button>

        {/* Auto-close hint */}
        <p className="text-[10px] text-white/20">Closes automatically in a few seconds</p>
      </div>
    </div>
  );
}
