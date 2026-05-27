import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Task } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function isOverdue(dueDate?: string): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

export function getTaskStats(tasks: Task[]) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const overdue = tasks.filter((t) => !t.completed && isOverdue(t.dueDate)).length;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;
  return { total, completed, overdue, completionRate };
}

// ── Chart data bucketed by period ─────────────────────────────────────────────
type Period = 'W' | 'M' | 'Y';

function startOf(period: Period): Date {
  const d = new Date();
  if (period === 'W') { d.setDate(d.getDate() - 6); }
  else if (period === 'M') { d.setDate(d.getDate() - 29); }
  else { d.setFullYear(d.getFullYear() - 1); }
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getTaskChartData(tasks: Task[], period: Period) {
  const since = startOf(period);
  const inRange = tasks.filter(t => new Date(t.createdAt) >= since);
  const total     = inRange.length;
  const completed = inRange.filter(t => t.completed).length;
  const overdue   = inRange.filter(t => !t.completed && isOverdue(t.dueDate)).length;
  const pending   = Math.max(0, total - completed - overdue);
  return [
    { name: 'Total',     value: total,     color: '#7c6af7' },
    { name: 'Completed', value: completed, color: '#10b981' },
    { name: 'Overdue',   value: overdue,   color: '#f43f5e' },
    { name: 'Pending',   value: pending,   color: '#06b6d4' },
  ];
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}
