'use client';
import { useMemo } from 'react';
import type { Habit } from '@/types';
import { calcWeekProgress } from './useHabits';

export type InsightType =
  | 'best_habit'
  | 'weak_habit'
  | 'consistency'
  | 'trend_up'
  | 'trend_down'
  | 'streak_risk'
  | 'perfect_day'
  | 'recovery';

export type InsightSeverity = 'positive' | 'warning' | 'critical' | 'info';

export interface HabitInsight {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  body: string;
  metric: string;
  metricLabel: string;
  habit?: Habit;
  spark: number[];          // 7-point sparkline
  actionLabel?: string;
  trend: 'up' | 'down' | 'flat';
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

/** Completion rate for a habit over the last N days */
function rateOverDays(h: Habit, days: number): number {
  let count = 0;
  for (let i = 0; i < days; i++) {
    if (h.completedDates.includes(dateStr(i))) count++;
  }
  return Math.round((count / days) * 100);
}

/** 7-day sparkline: daily completion % across all habits */
function globalSparkline(habits: Habit[]): number[] {
  if (!habits.length) return Array(7).fill(0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = dateStr(6 - i);
    const done = habits.filter(h => h.completedDates.includes(d)).length;
    return Math.round((done / habits.length) * 100);
  });
}

/** Per-habit 7-day sparkline */
function habitSparkline(h: Habit): number[] {
  return Array.from({ length: 7 }, (_, i) =>
    h.completedDates.includes(dateStr(6 - i)) ? 100 : 0
  );
}

/** Weekly consistency score: avg daily completion % over last 7 days */
function weeklyConsistency(habits: Habit[]): number {
  if (!habits.length) return 0;
  const spark = globalSparkline(habits);
  return Math.round(spark.reduce((a, b) => a + b, 0) / 7);
}

/** Compare this week vs last week for a habit */
function weekOverWeek(h: Habit): number {
  const thisWeek  = rateOverDays(h, 7);
  const lastWeek  = (() => {
    let count = 0;
    for (let i = 7; i < 14; i++) {
      if (h.completedDates.includes(dateStr(i))) count++;
    }
    return Math.round((count / 7) * 100);
  })();
  return thisWeek - lastWeek;
}

// ── Main hook ─────────────────────────────────────────────────────────────────
export function useInsights(habits: Habit[]): HabitInsight[] {
  return useMemo(() => {
    if (!habits.length) return [];
    const insights: HabitInsight[] = [];

    const spark7 = globalSparkline(habits);
    const consistency = weeklyConsistency(habits);

    // ── 1. Best performing habit ──────────────────────────────────────────────
    const ranked = [...habits]
      .map(h => ({ h, rate: rateOverDays(h, 7) }))
      .sort((a, b) => b.rate - a.rate);

    const best = ranked[0];
    if (best && best.rate >= 60) {
      const wow = weekOverWeek(best.h);
      insights.push({
        id: 'best',
        type: 'best_habit',
        severity: 'positive',
        title: 'Top Performing Habit',
        body: `${best.h.icon} ${best.h.name} is your strongest habit this week with a ${best.rate}% completion rate${wow > 0 ? ` — up ${wow}% from last week` : ''}.`,
        metric: `${best.rate}%`,
        metricLabel: '7-day rate',
        habit: best.h,
        spark: habitSparkline(best.h),
        actionLabel: 'View habit',
        trend: wow > 0 ? 'up' : wow < 0 ? 'down' : 'flat',
      });
    }

    // ── 2. Weak / struggling habit ────────────────────────────────────────────
    const weak = ranked[ranked.length - 1];
    if (weak && weak.rate < 50 && habits.length > 1) {
      const missedDays = 7 - Math.round((weak.rate / 100) * 7);
      insights.push({
        id: 'weak',
        type: 'weak_habit',
        severity: weak.rate < 20 ? 'critical' : 'warning',
        title: 'Needs Attention',
        body: `${weak.h.icon} ${weak.h.name} was missed ${missedDays} out of the last 7 days. Consistency here could unlock a new streak.`,
        metric: `${weak.rate}%`,
        metricLabel: '7-day rate',
        habit: weak.h,
        spark: habitSparkline(weak.h),
        actionLabel: 'Focus on this',
        trend: 'down',
      });
    }

    // ── 3. Weekly consistency score ───────────────────────────────────────────
    const prevConsistency = (() => {
      if (!habits.length) return 0;
      const vals = Array.from({ length: 7 }, (_, i) => {
        const d = dateStr(7 + (6 - i));
        const done = habits.filter(h => h.completedDates.includes(d)).length;
        return Math.round((done / habits.length) * 100);
      });
      return Math.round(vals.reduce((a, b) => a + b, 0) / 7);
    })();
    const consistencyDelta = consistency - prevConsistency;

    insights.push({
      id: 'consistency',
      type: 'consistency',
      severity: consistency >= 70 ? 'positive' : consistency >= 40 ? 'info' : 'warning',
      title: 'Weekly Consistency Score',
      body: consistency >= 70
        ? `Excellent week! You maintained ${consistency}% consistency across all habits${consistencyDelta > 0 ? `, up ${consistencyDelta}% from last week` : ''}.`
        : consistency >= 40
        ? `You're at ${consistency}% consistency this week. Completing habits earlier in the day tends to improve follow-through.`
        : `Consistency dropped to ${consistency}% this week. Try reducing your habit count or adjusting targets to rebuild momentum.`,
      metric: `${consistency}%`,
      metricLabel: 'consistency',
      spark: spark7,
      actionLabel: 'See breakdown',
      trend: consistencyDelta > 2 ? 'up' : consistencyDelta < -2 ? 'down' : 'flat',
    });

    // ── 4. Trend analysis (this week vs last week overall) ────────────────────
    const thisWeekAvg  = spark7.reduce((a, b) => a + b, 0) / 7;
    const lastWeekDays = Array.from({ length: 7 }, (_, i) => {
      const d = dateStr(7 + (6 - i));
      const done = habits.filter(h => h.completedDates.includes(d)).length;
      return Math.round((done / habits.length) * 100);
    });
    const lastWeekAvg = lastWeekDays.reduce((a, b) => a + b, 0) / 7;
    const trendDelta  = Math.round(thisWeekAvg - lastWeekAvg);

    if (Math.abs(trendDelta) >= 5) {
      insights.push({
        id: 'trend',
        type: trendDelta > 0 ? 'trend_up' : 'trend_down',
        severity: trendDelta > 0 ? 'positive' : 'warning',
        title: trendDelta > 0 ? 'Upward Trend Detected' : 'Downward Trend Detected',
        body: trendDelta > 0
          ? `Your overall completion is up ${trendDelta}% compared to last week. You're building real momentum — keep it going.`
          : `Completion dropped ${Math.abs(trendDelta)}% vs last week. Identify which days you're slipping and set a reminder for those times.`,
        metric: `${trendDelta > 0 ? '+' : ''}${trendDelta}%`,
        metricLabel: 'vs last week',
        spark: [...lastWeekDays, ...spark7].slice(-7),
        actionLabel: 'View analytics',
        trend: trendDelta > 0 ? 'up' : 'down',
      });
    }

    // ── 5. Streak at risk ─────────────────────────────────────────────────────
    const streakRisk = habits
      .filter(h => h.streak >= 3 && !h.completedDates.includes(dateStr(0)))
      .sort((a, b) => b.streak - a.streak)[0];

    if (streakRisk) {
      insights.push({
        id: 'streak_risk',
        type: 'streak_risk',
        severity: streakRisk.streak >= 7 ? 'critical' : 'warning',
        title: 'Streak at Risk',
        body: `${streakRisk.icon} ${streakRisk.name} has a ${streakRisk.streak}-day streak that will break tonight if not completed. Don't lose it now!`,
        metric: `${streakRisk.streak}d`,
        metricLabel: 'streak',
        habit: streakRisk,
        spark: habitSparkline(streakRisk),
        actionLabel: 'Complete now',
        trend: 'flat',
      });
    }

    // ── 6. Perfect day detection ──────────────────────────────────────────────
    const todayDone = habits.filter(h => h.completedDates.includes(dateStr(0))).length;
    if (todayDone === habits.length && habits.length > 0) {
      insights.push({
        id: 'perfect',
        type: 'perfect_day',
        severity: 'positive',
        title: 'Perfect Day Achieved! 🎉',
        body: `You completed all ${habits.length} habits today. This is exactly the kind of day that compounds into long-term results.`,
        metric: '100%',
        metricLabel: 'today',
        spark: spark7,
        trend: 'up',
      });
    }

    // ── 7. Recovery signal ────────────────────────────────────────────────────
    const recovering = habits.find(h => {
      const yesterday = h.completedDates.includes(dateStr(1));
      const dayBefore  = h.completedDates.includes(dateStr(2));
      const twoBefore  = h.completedDates.includes(dateStr(3));
      const hadGap     = !dayBefore && !twoBefore;
      return yesterday && hadGap && h.streak >= 1;
    });

    if (recovering) {
      insights.push({
        id: 'recovery',
        type: 'recovery',
        severity: 'info',
        title: 'Recovery in Progress',
        body: `${recovering.icon} ${recovering.name} is back on track after a gap. Rebuilding a habit after a miss is harder — this shows real discipline.`,
        metric: `${recovering.streak}d`,
        metricLabel: 'new streak',
        habit: recovering,
        spark: habitSparkline(recovering),
        actionLabel: 'Keep going',
        trend: 'up',
      });
    }

    return insights;
  }, [habits]);
}
