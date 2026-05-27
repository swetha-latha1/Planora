'use client';
import { useMemo } from 'react';
import type { Habit } from '@/types';

export interface DayActivity {
  date: string;       // 'YYYY-MM-DD'
  count: number;      // habits completed that day
  pct: number;        // 0-100 completion %
  level: 0 | 1 | 2 | 3 | 4; // intensity bucket
}

/** Build a full-year activity map from all habits' completedDates */
export function useHeatmap(habits: Habit[]): Map<string, DayActivity> {
  return useMemo(() => {
    const total = habits.length || 1;

    // Count completions per date across all habits
    const counts = new Map<string, number>();
    for (const h of habits) {
      for (const d of h.completedDates) {
        counts.set(d, (counts.get(d) ?? 0) + 1);
      }
    }

    // Build DayActivity for every date that has data
    const map = new Map<string, DayActivity>();
    Array.from(counts.entries()).forEach(([date, count]) => {
      const pct = Math.round((count / total) * 100);
      const level = pct === 0 ? 0
        : pct <= 25  ? 1
        : pct <= 50  ? 2
        : pct <= 75  ? 3
        : 4;
      map.set(date, { date, count, pct, level });
    });
    return map;
  }, [habits]);
}

/** Generate every date string in a given year */
export function yearDates(year: number): string[] {
  const dates: string[] = [];
  const d = new Date(year, 0, 1);
  while (d.getFullYear() === year) {
    dates.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

/** Get all dates in a given month */
export function monthDates(year: number, month: number): string[] {
  const dates: string[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    dates.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

/** Group year dates into weeks (Sun-Sat columns) */
export function toWeekColumns(dates: string[]): (string | null)[][] {
  const cols: (string | null)[][] = [];
  let col: (string | null)[] = [];

  // Pad start so first date lands on correct day-of-week
  const firstDay = new Date(dates[0]).getDay(); // 0=Sun
  for (let i = 0; i < firstDay; i++) col.push(null);

  for (const d of dates) {
    col.push(d);
    if (col.length === 7) { cols.push(col); col = []; }
  }
  if (col.length) {
    while (col.length < 7) col.push(null);
    cols.push(col);
  }
  return cols;
}
