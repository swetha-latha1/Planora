'use client';
import { useEffect, useState } from 'react';

export interface ToastItem {
  id: string;
  xp: number;
  reason: string;
  levelUp?: { to: number; title: string; color: string };
}

interface Props { toasts: ToastItem[] }

export default function XPToast({ toasts }: Props) {
  return (
    <div className="fixed bottom-24 right-6 z-[100] flex flex-col-reverse gap-2 pointer-events-none">
      {toasts.map(t => <SingleToast key={t.id} toast={t} />)}
    </div>
  );
}

function SingleToast({ toast }: { toast: ToastItem }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const show = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(show);
  }, []);

  return (
    <div
      className="flex flex-col gap-1 transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
      }}
    >
      {/* XP pill */}
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold text-white shadow-lg"
        style={{
          background: 'linear-gradient(135deg,rgba(124,106,247,0.95),rgba(6,182,212,0.95))',
          boxShadow: '0 4px 20px rgba(124,106,247,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <span className="text-base">⚡</span>
        <span>+{toast.xp} XP</span>
        <span className="text-white/60 text-xs font-normal">{toast.reason.split('·')[0].trim()}</span>
      </div>

      {/* Level-up banner */}
      {toast.levelUp && (
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold text-white shadow-lg animate-bounce"
          style={{
            background: `linear-gradient(135deg,${toast.levelUp.color}cc,${toast.levelUp.color}88)`,
            boxShadow: `0 4px 20px ${toast.levelUp.color}66`,
            border: `1px solid ${toast.levelUp.color}44`,
          }}
        >
          <span className="text-base">🎉</span>
          <span>Level {toast.levelUp.to}!</span>
          <span className="text-white/70 text-xs font-normal">{toast.levelUp.title}</span>
        </div>
      )}
    </div>
  );
}
