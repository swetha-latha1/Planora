'use client';
import type { Task } from '@/types';
import { cn, formatDate, isOverdue } from '@/utils';

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_CONFIG = {
  high:   { color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',   border: 'rgba(244,63,94,0.3)',   label: 'High',   dot: 'bg-rose-400'    },
  medium: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)',  label: 'Medium', dot: 'bg-amber-400'   },
  low:    { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)',  label: 'Low',    dot: 'bg-emerald-400' },
};

const CATEGORY_CONFIG: Record<string, { icon: string; color: string }> = {
  work:     { icon: '💼', color: '#a78bfa' },
  personal: { icon: '👤', color: '#06b6d4' },
  health:   { icon: '❤️', color: '#f43f5e' },
  other:    { icon: '📌', color: '#fbbf24' },
};

export default function TaskCard({ task, onToggle, onDelete }: Props) {
  const overdue = !task.completed && isOverdue(task.dueDate);
  const pri = PRIORITY_CONFIG[task.priority];
  const cat = CATEGORY_CONFIG[task.category] ?? CATEGORY_CONFIG.other;

  return (
    <div className={cn(
      'group relative glass rounded-2xl p-4 flex items-start gap-4 transition-all duration-200',
      'hover:border-white/[0.12] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
      task.completed && 'opacity-50',
    )}>
      {/* Priority bar */}
      <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full" style={{ background: pri.color, boxShadow: `0 0 8px ${pri.color}` }} />

      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className={cn(
          'mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-200',
          task.completed
            ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]'
            : 'border-white/20 hover:border-accent/60 hover:bg-accent/10'
        )}
      >
        {task.completed && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-semibold text-sm leading-snug',
          task.completed ? 'line-through text-white/30' : 'text-white/85'
        )}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-white/40 mt-0.5 truncate">{task.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-2.5">
          {/* Priority badge */}
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: pri.color, background: pri.bg, border: `1px solid ${pri.border}` }}>
            {pri.label}
          </span>

          {/* Category badge */}
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
            style={{ color: cat.color, background: `${cat.color}18`, border: `1px solid ${cat.color}35` }}>
            {cat.icon} {task.category === 'other' && task.customCategory ? task.customCategory : task.category}
          </span>

          {/* Due date */}
          {task.dueDate && (
            <span className={cn(
              'text-[10px] font-medium flex items-center gap-1',
              overdue ? 'text-rose-400' : 'text-white/35'
            )}>
              {overdue ? '⚠️' : '📅'} {overdue ? 'Overdue · ' : ''}{formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-xl flex items-center justify-center text-white/25 hover:text-rose-400 hover:bg-rose-500/10 transition-all shrink-0"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
