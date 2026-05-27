'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Habit, HabitCategory, HabitFrequency, HabitColor } from '@/types';
import { generateId } from '@/utils';
import { supabase } from '@/lib/supabase';

export const todayStr = () => new Date().toISOString().slice(0, 10);

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
}

export function calcStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const unique = Array.from(new Set(dates)).sort();
  const last = unique[unique.length - 1];
  const today = todayStr();
  if (daysBetween(last, today) > 1) return 0;
  let streak = 1;
  for (let i = unique.length - 2; i >= 0; i--) {
    if (daysBetween(unique[i], unique[i + 1]) === 1) streak++;
    else break;
  }
  return streak;
}

export function calcWeekProgress(h: Habit): number {
  const today = new Date();
  let done = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (h.completedDates.includes(d.toISOString().slice(0, 10))) done++;
  }
  return Math.min(100, Math.round((done / h.targetDays) * 100));
}

export function calcCompletionPct(habits: Habit[]): number {
  if (!habits.length) return 0;
  const today = todayStr();
  const done = habits.filter(h => h.completedDates.includes(today)).length;
  return Math.round((done / habits.length) * 100);
}

export type HabitInput = {
  name: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  color: HabitColor;
  icon: string;
  targetDays: number;
};

// ── DB row → Habit ────────────────────────────────────────────────────────────
function rowToHabit(row: Record<string, unknown>): Habit {
  const dates = (row.completed_dates as string[]) ?? [];
  const streak = calcStreak(dates);
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string | undefined,
    category: row.category as HabitCategory,
    frequency: row.frequency as HabitFrequency,
    color: row.color as HabitColor,
    icon: row.icon as string,
    targetDays: row.target_days as number,
    completedDates: dates,
    streak,
    bestStreak: Math.max(row.best_streak as number, streak),
    createdAt: row.created_at as string,
  };
}

export function useHabits(userId?: string | null) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loaded, setLoaded] = useState(false);

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) { setHabits([]); setLoaded(true); return; }
    supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setHabits((data ?? []).map(rowToHabit));
        setLoaded(true);
      });
  }, [userId]);

  // ── Add ───────────────────────────────────────────────────────────────────
  const addHabit = useCallback(async (data: HabitInput) => {
    if (!userId) return;
    const id = generateId();
    const row = {
      id,
      user_id: userId,
      name: data.name,
      description: data.description ?? null,
      category: data.category,
      frequency: data.frequency,
      color: data.color,
      icon: data.icon,
      target_days: data.targetDays,
      completed_dates: [],
      streak: 0,
      best_streak: 0,
    };
    const { data: inserted } = await supabase.from('habits').insert(row).select().single();
    if (inserted) setHabits(prev => [rowToHabit(inserted), ...prev]);
  }, [userId]);

  // ── Update ────────────────────────────────────────────────────────────────
  const updateHabit = useCallback(async (id: string, data: Partial<HabitInput>) => {
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined)        patch.name = data.name;
    if (data.description !== undefined) patch.description = data.description;
    if (data.category !== undefined)    patch.category = data.category;
    if (data.frequency !== undefined)   patch.frequency = data.frequency;
    if (data.color !== undefined)       patch.color = data.color;
    if (data.icon !== undefined)        patch.icon = data.icon;
    if (data.targetDays !== undefined)  patch.target_days = data.targetDays;
    const { data: updated } = await supabase.from('habits').update(patch).eq('id', id).select().single();
    if (updated) setHabits(prev => prev.map(h => h.id === id ? rowToHabit(updated) : h));
  }, []);

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteHabit = useCallback(async (id: string) => {
    await supabase.from('habits').delete().eq('id', id);
    setHabits(prev => prev.filter(h => h.id !== id));
  }, []);

  // ── Reorder (local only — no DB order column) ─────────────────────────────
  const reorderHabits = useCallback((reordered: Habit[]) => {
    setHabits(reordered);
  }, []);

  // ── Toggle today ──────────────────────────────────────────────────────────
  const toggleToday = useCallback(async (id: string) => {
    const today = todayStr();
    const habit = habits.find(h => h.id === id);
    if (!habit) return;
    const alreadyDone = habit.completedDates.includes(today);
    const completedDates = alreadyDone
      ? habit.completedDates.filter(d => d !== today)
      : [...habit.completedDates, today];
    const streak = calcStreak(completedDates);
    const bestStreak = Math.max(habit.bestStreak, streak);
    const { data: updated } = await supabase
      .from('habits')
      .update({ completed_dates: completedDates, streak, best_streak: bestStreak })
      .eq('id', id)
      .select()
      .single();
    if (updated) setHabits(prev => prev.map(h => h.id === id ? rowToHabit(updated) : h));
  }, [habits]);

  const isDoneToday = useCallback((h: Habit) => h.completedDates.includes(todayStr()), []);
  const weekProgress = useCallback((h: Habit) => calcWeekProgress(h), []);

  return { habits, loaded, addHabit, updateHabit, deleteHabit, reorderHabits, toggleToday, isDoneToday, weekProgress };
}
