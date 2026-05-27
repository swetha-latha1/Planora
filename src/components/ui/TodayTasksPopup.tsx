'use client';
import { useEffect, useState } from 'react';
import type { Task } from '@/types';

interface Props {
  tasks: Task[];
  userName: string;
  onClose: () => void;
}

export default function TodayTasksPopup({ tasks, userName, onClose }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter(t => !t.completed && t.dueDate === today);
  const highPriority = tasks.filter(t => !t.completed && t.priority === 'high');

  // Merge and deduplicate
  const allImportant = Array.from(new Map([...highPriority, ...todayTasks].map(t => [t.id, t])).values()).slice(0, 6);

  function close() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', transition: 'opacity 0.3s', opacity: visible ? 1 : 0 }}>

      <div className="w-full max-w-lg rounded-3xl overflow-hidden border border-white/[0.12]"
        style={{
          background: 'linear-gradient(145deg,#13002a,#0a1628)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(124,106,247,0.2)',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(20px)',
          transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}>

        {/* Colorful top banner */}
        <div className="relative px-6 pt-6 pb-5 overflow-hidden"
          style={{ background: 'linear-gradient(135deg,rgba(124,106,247,0.3),rgba(6,182,212,0.2),rgba(16,185,129,0.15))' }}>
          {/* Decorative orbs */}
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-30 blur-2xl" style={{ background: '#7c6af7' }} />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full opacity-20 blur-2xl" style={{ background: '#06b6d4' }} />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">☀️</span>
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#a78bfa' }}>{greeting}</span>
              </div>
              <h2 className="text-xl font-extrabold text-white/90">
                Hey <span style={{ color: '#a78bfa' }}>{userName}</span>, here's your focus for today!
              </h2>
              <p className="text-xs text-white/45 mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button onClick={close}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/10 transition-all shrink-0 mt-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Summary pills */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {[
              { label: `${todayTasks.length} Due Today`, color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
              { label: `${highPriority.length} High Priority`, color: '#f43f5e', bg: 'rgba(244,63,94,0.15)' },
              { label: `${tasks.filter(t => !t.completed).length} Total Pending`, color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
            ].map(p => (
              <div key={p.label} className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: p.bg, border: `1px solid ${p.color}40`, color: p.color }}>
                {p.label}
              </div>
            ))}
          </div>
        </div>

        {/* Task list */}
        <div className="px-6 py-4 max-h-72 overflow-y-auto space-y-2">
          {allImportant.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">🎉</p>
              <p className="text-white/60 font-semibold">You're all caught up!</p>
              <p className="text-white/30 text-sm mt-1">No pending high-priority or due-today tasks.</p>
            </div>
          ) : (
            allImportant.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-all"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                {/* Priority dot */}
                <div className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    background: task.priority === 'high' ? '#f43f5e' : task.priority === 'medium' ? '#fbbf24' : '#10b981',
                    boxShadow: `0 0 8px ${task.priority === 'high' ? '#f43f5e' : task.priority === 'medium' ? '#fbbf24' : '#10b981'}80`,
                  }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/80 truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-white/30 capitalize">{task.category}</span>
                    {task.dueDate === today && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>Due Today</span>
                    )}
                    {task.priority === 'high' && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(244,63,94,0.15)', color: '#f43f5e' }}>🔴 High</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={close}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white/50 border border-white/[0.08] hover:bg-white/[0.05] hover:text-white/80 transition-all">
            Dismiss
          </button>
          <button onClick={close}
            className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#7c6af7,#a78bfa)', boxShadow: '0 4px 20px rgba(124,106,247,0.45)' }}>
            Let's Go! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
