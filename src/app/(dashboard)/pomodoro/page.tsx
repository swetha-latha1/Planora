'use client';
import { useState, useEffect } from 'react';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useGamification } from '@/hooks/useGamification';
import { useConfetti } from '@/hooks/useConfetti';
import { cn } from '@/utils';
import type { PomodoroMode } from '@/types';
import Button from '@/components/ui/Button';
import XPToast, { type ToastItem } from '@/components/ui/XPToast';
import LevelUpModal from '@/components/ui/LevelUpModal';
import { generateId } from '@/utils';

const MODES: { label: string; value: PomodoroMode }[] = [
  { label: 'Focus', value: 'work' },
  { label: 'Short Break', value: 'short' },
  { label: 'Long Break', value: 'long' },
];

const SIZE = 220;
const STROKE = 12;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

export default function PomodoroPage() {
  const { mode, minutes, seconds, running, sessions, progress, setRunning, reset } = usePomodoro();
  const { onPomodoroComplete } = useGamification([]);
  const { launch } = useConfetti();
  
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [levelUpData, setLevelUpData] = useState<{ level: number; title: string; color: string; xp: number } | null>(null);
  const [prevSessions, setPrevSessions] = useState(0);

  // Detect when a new work session is completed
  useEffect(() => {
    if (sessions > prevSessions) {
      const event = onPomodoroComplete(sessions);
      if (event) {
        const toast: ToastItem = {
          id: generateId(),
          xp: event.xp,
          reason: event.reason,
          levelUp: event.levelUp ? { to: event.levelUp.to, title: event.levelUp.title, color: event.levelUp.color } : undefined,
        };
        setToasts(prev => [...prev, toast]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toast.id)), 3500);

        if (event.levelUp) {
          setLevelUpData({ level: event.levelUp.to, title: event.levelUp.title, color: event.levelUp.color, xp: event.xp });
          launch();
        } else if (event.newBadges.length > 0) {
          launch(undefined, undefined, 60);
        }
      }
      setPrevSessions(sessions);
    }
  }, [sessions, prevSessions, onPomodoroComplete, launch]);

  return (
    <div className="max-w-sm mx-auto space-y-6 text-center">
      <XPToast toasts={toasts} />
      {levelUpData && <LevelUpModal xp={levelUpData.xp} level={levelUpData.level} title={levelUpData.title} color={levelUpData.color} onClose={() => setLevelUpData(null)} />}
      <h1 className="text-2xl font-bold text-left">Pomodoro</h1>

      <div className="flex gap-2 justify-center">
        {MODES.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => reset(value)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium border transition',
              mode === value
                ? 'bg-accent text-white border-accent'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-accent hover:text-accent'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="card p-8 flex flex-col items-center gap-6">
        <svg width={SIZE} height={SIZE}>
          <defs>
            <linearGradient id="pomoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c6af7" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="#e5e7eb" strokeWidth={STROKE} />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="url(#pomoGrad)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - progress)}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
          <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="40" fontWeight="700" fill="currentColor">
            {minutes}:{seconds}
          </text>
        </svg>

        <div className="flex gap-3">
          <Button variant="primary" onClick={() => setRunning(!running)}>
            {running ? '⏸ Pause' : '▶ Start'}
          </Button>
          <Button variant="ghost" onClick={() => reset()}>↺ Reset</Button>
        </div>

        <p className="text-sm text-gray-500">Sessions completed: <strong>{sessions}</strong></p>
      </div>
    </div>
  );
}
