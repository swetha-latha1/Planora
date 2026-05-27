'use client';
import { useMemo } from 'react';
import type { Habit, Task } from '@/types';

export type InsightCategory = 'strength' | 'weakness' | 'pattern' | 'motivation' | 'action';
export type InsightPriority = 'high' | 'medium' | 'low';

export interface AIInsight {
  id: string;
  category: InsightCategory;
  priority: InsightPriority;
  icon: string;
  title: string;
  message: string;
  metric?: string;
  metricLabel?: string;
  actionLabel?: string;
  color: string;
}

export interface ActionStep {
  id: string;
  title: string;
  desc: string;
  icon: string;
  timeframe: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface BehaviorPattern {
  label: string;
  value: number;   // 0-100
  color: string;
  desc: string;
}

export interface CoachMessage {
  id: string;
  role: 'coach' | 'user';
  text: string;
  time: string;
}

export interface AICoachData {
  productivityScore: number;
  scoreLabel: string;
  scoreColor: string;
  summary: string;
  insights: AIInsight[];
  actionPlan: ActionStep[];
  patterns: BehaviorPattern[];
  weekdayActivity: { day: string; pct: number }[];
  topHabit: Habit | null;
  weakHabit: Habit | null;
  totalCompletions: number;
  activeDays: number;
  consistencyPct: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function dateStr(daysAgo: number) {
  const d = new Date(); d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function completionRate(h: Habit, days: number): number {
  let count = 0;
  for (let i = 0; i < days; i++) if (h.completedDates.includes(dateStr(i))) count++;
  return Math.round((count / days) * 100);
}

function weekdayActivity(habits: Habit[]): { day: string; pct: number }[] {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return days.map((day, dow) => {
    let total = 0, done = 0;
    for (let w = 0; w < 8; w++) {
      const d = new Date(); d.setDate(d.getDate() - (d.getDay() - dow + 7 * w) % 7);
      const ds = d.toISOString().slice(0, 10);
      habits.forEach(h => { total++; if (h.completedDates.includes(ds)) done++; });
    }
    return { day, pct: total ? Math.round((done / total) * 100) : 0 };
  });
}

// ── Main hook ─────────────────────────────────────────────────────────────────
export function useAICoach(habits: Habit[], tasks: Task[]): AICoachData {
  return useMemo(() => {
    const totalHabits = habits.length;
    const totalTasks  = tasks.length;

    // ── Core metrics ──────────────────────────────────────────────────────────
    const totalCompletions = habits.reduce((s, h) => s + h.completedDates.length, 0);
    const allDates = Array.from(new Set(habits.flatMap(h => h.completedDates))).sort();
    const activeDays = allDates.length;
    const daysSinceStart = habits.length
      ? Math.max(1, Math.round((Date.now() - Math.min(...habits.map(h => new Date(h.createdAt).getTime()))) / 86400000))
      : 1;
    const consistencyPct = Math.min(100, Math.round((activeDays / daysSinceStart) * 100));

    // 7-day rates per habit
    const rates = habits.map(h => ({ h, rate: completionRate(h, 7) })).sort((a, b) => b.rate - a.rate);
    const topHabit  = rates[0]?.h ?? null;
    const weakHabit = rates[rates.length - 1]?.h ?? null;

    // Weekday activity
    const wdActivity = weekdayActivity(habits);
    const bestDay    = wdActivity.reduce((a, b) => b.pct > a.pct ? b : a, wdActivity[0]);
    const worstDay   = wdActivity.reduce((a, b) => b.pct < a.pct ? b : a, wdActivity[0]);

    // Task metrics
    const completedTasks = tasks.filter(t => t.completed).length;
    const overdueTasks   = tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length;
    const highPriDone    = tasks.filter(t => t.completed && t.priority === 'high').length;
    const highPriTotal   = tasks.filter(t => t.priority === 'high').length;
    const taskCompRate   = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Streak analysis
    const avgStreak  = habits.length ? Math.round(habits.reduce((s, h) => s + h.streak, 0) / habits.length) : 0;
    const bestStreak = habits.reduce((m, h) => Math.max(m, h.bestStreak), 0);

    // Weekend vs weekday
    const weekendDays = wdActivity.filter(d => d.day === 'Sat' || d.day === 'Sun');
    const weekdayDays = wdActivity.filter(d => d.day !== 'Sat' && d.day !== 'Sun');
    const weekendAvg  = Math.round(weekendDays.reduce((s, d) => s + d.pct, 0) / 2);
    const weekdayAvg  = Math.round(weekdayDays.reduce((s, d) => s + d.pct, 0) / 5);

    // ── Productivity score ────────────────────────────────────────────────────
    const score = Math.min(100, Math.round(
      consistencyPct * 0.35 +
      taskCompRate   * 0.25 +
      (avgStreak > 0 ? Math.min(100, avgStreak * 5) : 0) * 0.2 +
      (totalCompletions > 0 ? Math.min(100, totalCompletions * 2) : 0) * 0.2
    ));

    const scoreLabel = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Building' : 'Getting Started';
    const scoreColor = score >= 80 ? '#34d399' : score >= 60 ? '#a78bfa' : score >= 40 ? '#fbbf24' : '#fb7185';

    // ── Summary ───────────────────────────────────────────────────────────────
    const summary = totalHabits === 0
      ? "You haven't added any habits yet. Start by creating 2–3 daily habits to unlock your full productivity potential."
      : score >= 80
      ? `Outstanding work! You're maintaining ${consistencyPct}% consistency with ${totalCompletions} total completions. Your ${bestStreak}-day best streak shows real discipline.`
      : score >= 60
      ? `You're building solid momentum with ${consistencyPct}% consistency. ${topHabit ? `${topHabit.icon} ${topHabit.name} is your strongest habit.` : ''} A few targeted improvements will push you to the next level.`
      : `You're in the early stages of building your productivity system. Focus on consistency over perfection — even 3 habits done daily compounds into massive results over time.`;

    // ── Insights ──────────────────────────────────────────────────────────────
    const insights: AIInsight[] = [];

    // Best day pattern
    if (bestDay && bestDay.pct > 50) {
      insights.push({
        id: 'best_day', category: 'pattern', priority: 'medium',
        icon: '📅', color: '#a78bfa',
        title: `${bestDay.day} is Your Power Day`,
        message: `You complete ${bestDay.pct}% of habits on ${bestDay.day}s — your highest performing day. Schedule your most important habits and deep work sessions on this day.`,
        metric: `${bestDay.pct}%`, metricLabel: 'completion',
      });
    }

    // Weekend drop
    if (weekdayAvg - weekendAvg > 20) {
      insights.push({
        id: 'weekend_drop', category: 'weakness', priority: 'high',
        icon: '📉', color: '#fb7185',
        title: 'Weekend Consistency Drops',
        message: `Your weekend completion (${weekendAvg}%) is ${weekdayAvg - weekendAvg}% lower than weekdays (${weekdayAvg}%). Try setting lighter weekend targets or a dedicated "weekend routine" with just 2–3 core habits.`,
        metric: `${weekendAvg}%`, metricLabel: 'weekends',
        actionLabel: 'Fix weekends',
      });
    }

    // Top habit strength
    if (topHabit && rates[0]?.rate >= 70) {
      insights.push({
        id: 'top_habit', category: 'strength', priority: 'low',
        icon: '⭐', color: '#34d399',
        title: `${topHabit.icon} ${topHabit.name} is Rock Solid`,
        message: `${rates[0].rate}% completion rate over the last 7 days. This habit is fully automated in your routine. Use this momentum as an anchor to build adjacent habits.`,
        metric: `${rates[0].rate}%`, metricLabel: '7-day rate',
      });
    }

    // Weak habit
    if (weakHabit && habits.length > 1 && (rates[rates.length - 1]?.rate ?? 0) < 40) {
      const weakRate = rates[rates.length - 1]?.rate ?? 0;
      insights.push({
        id: 'weak_habit', category: 'weakness', priority: 'high',
        icon: '⚠️', color: '#fbbf24',
        title: `${weakHabit.icon} ${weakHabit.name} Needs Attention`,
        message: `Only ${weakRate}% completion this week. Consider reducing the target days, pairing it with a stronger habit, or changing the time of day you attempt it.`,
        metric: `${weakRate}%`, metricLabel: '7-day rate',
        actionLabel: 'Improve this',
      });
    }

    // Streak motivation
    if (bestStreak >= 7) {
      insights.push({
        id: 'streak', category: 'motivation', priority: 'medium',
        icon: '🔥', color: '#f97316',
        title: `${bestStreak}-Day Best Streak — Keep Pushing`,
        message: `Your personal best is ${bestStreak} days. Research shows habits become automatic after 66 days. You're ${Math.max(0, 66 - bestStreak)} days away from full automation.`,
        metric: `${bestStreak}d`, metricLabel: 'best streak',
      });
    }

    // Task overdue warning
    if (overdueTasks > 0) {
      insights.push({
        id: 'overdue', category: 'action', priority: 'high',
        icon: '🚨', color: '#fb7185',
        title: `${overdueTasks} Overdue Task${overdueTasks > 1 ? 's' : ''} Need Attention`,
        message: `Overdue tasks create mental load that reduces focus on habits. Block 30 minutes today to either complete, reschedule, or delete these tasks.`,
        metric: `${overdueTasks}`, metricLabel: 'overdue',
        actionLabel: 'Clear backlog',
      });
    }

    // High priority task completion
    if (highPriTotal > 0) {
      const highPriRate = Math.round((highPriDone / highPriTotal) * 100);
      insights.push({
        id: 'high_pri', category: highPriRate >= 70 ? 'strength' : 'weakness', priority: 'medium',
        icon: highPriRate >= 70 ? '🎯' : '📌', color: highPriRate >= 70 ? '#34d399' : '#fbbf24',
        title: highPriRate >= 70 ? 'Strong High-Priority Execution' : 'High-Priority Tasks Lagging',
        message: highPriRate >= 70
          ? `You complete ${highPriRate}% of high-priority tasks — excellent prioritization. This directly correlates with your productivity score.`
          : `Only ${highPriRate}% of high-priority tasks are done. Try the "eat the frog" method — tackle your hardest task first thing in the morning.`,
        metric: `${highPriRate}%`, metricLabel: 'high-pri rate',
      });
    }

    // Consistency insight
    if (consistencyPct < 50 && totalHabits > 0) {
      insights.push({
        id: 'consistency', category: 'action', priority: 'high',
        icon: '📊', color: '#22d3ee',
        title: 'Build Daily Consistency First',
        message: `At ${consistencyPct}% consistency, focus on showing up every day rather than doing everything perfectly. Even completing 1 habit daily builds the neural pathway for discipline.`,
        metric: `${consistencyPct}%`, metricLabel: 'consistency',
        actionLabel: 'Start streak',
      });
    }

    // ── Action plan ───────────────────────────────────────────────────────────
    const actionPlan: ActionStep[] = [];

    if (weekendAvg < weekdayAvg - 15) {
      actionPlan.push({
        id: 'ap1', icon: '📅', difficulty: 'easy', timeframe: 'This weekend',
        title: 'Create a Weekend Micro-Routine',
        desc: 'Pick just 2 habits to maintain on weekends. Lower the bar — consistency beats perfection.',
      });
    }

    if (weakHabit && (rates[rates.length - 1]?.rate ?? 0) < 40) {
      actionPlan.push({
        id: 'ap2', icon: '⏰', difficulty: 'easy', timeframe: 'Today',
        title: `Reschedule "${weakHabit.name}"`,
        desc: 'Move it to a time slot right after a habit you already do consistently (habit stacking).',
      });
    }

    if (overdueTasks > 0) {
      actionPlan.push({
        id: 'ap3', icon: '🗑️', difficulty: 'medium', timeframe: 'Next 30 min',
        title: 'Clear Your Task Backlog',
        desc: `Review ${overdueTasks} overdue task${overdueTasks > 1 ? 's' : ''}. Complete, reschedule, or delete each one. A clean slate reduces cognitive load.`,
      });
    }

    actionPlan.push({
      id: 'ap4', icon: '🌅', difficulty: 'medium', timeframe: 'This week',
      title: 'Design a Morning Anchor Habit',
      desc: 'Start each day with one non-negotiable habit. This sets a "win" tone for the entire day and triggers momentum.',
    });

    if (avgStreak < 5) {
      actionPlan.push({
        id: 'ap5', icon: '🔥', difficulty: 'easy', timeframe: 'Next 7 days',
        title: 'Chase a 7-Day Streak',
        desc: 'Pick your single easiest habit and commit to a 7-day streak. Small wins build the identity of someone who follows through.',
      });
    }

    actionPlan.push({
      id: 'ap6', icon: '📵', difficulty: 'hard', timeframe: 'This week',
      title: 'Add a Deep Work Block',
      desc: 'Schedule 90 minutes of distraction-free work daily. No phone, no notifications. This is where your highest-value output happens.',
    });

    // ── Behavior patterns ─────────────────────────────────────────────────────
    const patterns: BehaviorPattern[] = [
      { label: 'Morning Energy',   value: bestDay?.day === 'Mon' || bestDay?.day === 'Tue' ? 78 : 55, color: '#fbbf24', desc: 'Productivity in AM hours' },
      { label: 'Consistency',      value: consistencyPct,  color: '#a78bfa', desc: 'Daily habit follow-through' },
      { label: 'Task Completion',  value: taskCompRate,    color: '#34d399', desc: 'Tasks finished vs created' },
      { label: 'Streak Strength',  value: Math.min(100, bestStreak * 3), color: '#f97316', desc: 'Longest consecutive run' },
      { label: 'Weekend Habits',   value: weekendAvg,      color: '#22d3ee', desc: 'Sat/Sun completion rate' },
      { label: 'Focus Depth',      value: Math.min(100, highPriDone * 10 + 30), color: '#fb7185', desc: 'High-priority execution' },
    ];

    return {
      productivityScore: score,
      scoreLabel,
      scoreColor,
      summary,
      insights,
      actionPlan,
      patterns,
      weekdayActivity: wdActivity,
      topHabit,
      weakHabit,
      totalCompletions,
      activeDays,
      consistencyPct,
    };
  }, [habits, tasks]);
}
