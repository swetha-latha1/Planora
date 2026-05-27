'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Badge, GamificationProfile, Habit } from '@/types';
import { supabase } from '@/lib/supabase';
import { todayStr } from './useHabits';

export const XP_REWARDS = {
  habitComplete: 10, perfectDay: 50, streak7: 75, streak14: 100, streak30: 200, streak100: 500,
  firstHabit: 25, badgeUnlock: 30, taskComplete: 5, taskHighPriority: 8, task10Complete: 25,
  task25Complete: 75, pomodoroSession: 8, pomodoro5Sessions: 50, pomodoro10Sessions: 100,
  projectComplete: 20, projectMilestone: 30,
} as const;

export const LEVELS = [
  { level: 1,  xp: 0,    title: 'Beginner',     color: '#94a3b8' },
  { level: 2,  xp: 100,  title: 'Apprentice',   color: '#67e8f9' },
  { level: 3,  xp: 250,  title: 'Practitioner', color: '#6ee7b7' },
  { level: 4,  xp: 500,  title: 'Achiever',     color: '#a78bfa' },
  { level: 5,  xp: 900,  title: 'Expert',       color: '#fbbf24' },
  { level: 6,  xp: 1400, title: 'Master',       color: '#fb923c' },
  { level: 7,  xp: 2100, title: 'Champion',     color: '#f472b6' },
  { level: 8,  xp: 3000, title: 'Legend',       color: '#7c6af7' },
  { level: 9,  xp: 4200, title: 'Mythic',       color: '#06b6d4' },
  { level: 10, xp: 6000, title: 'Transcendent', color: '#fcd34d' },
] as const;

export function getLevelInfo(xp: number) {
  let currentIdx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) { currentIdx = i; break; }
  }
  const current = LEVELS[currentIdx];
  const next = LEVELS[Math.min(currentIdx + 1, LEVELS.length - 1)];
  const xpIntoLevel = xp - current.xp;
  const xpNeeded = next.xp - current.xp;
  const pct = current.level === 10 ? 100 : Math.round((xpIntoLevel / xpNeeded) * 100);
  return { current, next, xpIntoLevel, xpNeeded, pct };
}

export const ALL_BADGES: Badge[] = [
  { id: 'streak_3',         name: 'Hat Trick',        description: '3-day streak on any habit',        icon: '🎩', rarity: 'common',    xpReward: 20   },
  { id: 'streak_7',         name: 'Week Warrior',      description: '7-day streak on any habit',        icon: '⚔️', rarity: 'common',    xpReward: 75   },
  { id: 'streak_14',        name: 'Fortnight Force',   description: '14-day streak on any habit',       icon: '🛡️', rarity: 'rare',      xpReward: 100  },
  { id: 'streak_30',        name: 'Iron Will',         description: '30-day streak on any habit',       icon: '🔩', rarity: 'epic',      xpReward: 200  },
  { id: 'streak_100',       name: 'Century Club',      description: '100-day streak on any habit',      icon: '💯', rarity: 'legendary', xpReward: 500  },
  { id: 'first_done',       name: 'First Step',        description: 'Complete your first habit',        icon: '👣', rarity: 'common',    xpReward: 25   },
  { id: 'done_10',          name: 'Getting Started',   description: '10 total habit completions',       icon: '🌱', rarity: 'common',    xpReward: 30   },
  { id: 'done_50',          name: 'Momentum',          description: '50 total habit completions',       icon: '🚀', rarity: 'rare',      xpReward: 60   },
  { id: 'done_100',         name: 'Centurion',         description: '100 total habit completions',      icon: '🏛️', rarity: 'rare',      xpReward: 100  },
  { id: 'done_500',         name: 'Unstoppable',       description: '500 total habit completions',      icon: '⚡', rarity: 'epic',      xpReward: 250  },
  { id: 'task_10',          name: 'Task Runner',       description: 'Complete 10 tasks',                icon: '🧤', rarity: 'common',    xpReward: 40   },
  { id: 'task_25',          name: 'Task Champion',     description: 'Complete 25 tasks',                icon: '🏆', rarity: 'rare',      xpReward: 100  },
  { id: 'pomodoro_5',       name: 'Focused Flow',      description: 'Finish 5 pomodoro sessions',       icon: '⏱️', rarity: 'common',    xpReward: 50   },
  { id: 'pomodoro_10',      name: 'Pomodoro Pro',      description: 'Finish 10 pomodoro sessions',      icon: '🔥', rarity: 'rare',      xpReward: 125  },
  { id: 'project_complete', name: 'Project Finisher',  description: 'Complete a project',               icon: '🏁', rarity: 'rare',      xpReward: 100  },
  { id: 'project_milestone',name: 'Milestone Maker',   description: 'Complete a project milestone',     icon: '🎯', rarity: 'epic',      xpReward: 150  },
  { id: 'perfect_1',        name: 'Perfect Day',       description: 'Complete all habits in one day',   icon: '✨', rarity: 'common',    xpReward: 50   },
  { id: 'perfect_7',        name: 'Perfect Week',      description: '7 perfect days total',             icon: '🌟', rarity: 'rare',      xpReward: 150  },
  { id: 'perfect_30',       name: 'Perfect Month',     description: '30 perfect days total',            icon: '🌙', rarity: 'epic',      xpReward: 400  },
  { id: 'level_5',          name: 'Rising Star',       description: 'Reach Level 5',                   icon: '⭐', rarity: 'rare',      xpReward: 100  },
  { id: 'level_10',         name: 'Transcendent',      description: 'Reach Level 10',                  icon: '👑', rarity: 'legendary', xpReward: 1000 },
  { id: 'multi_habit',      name: 'Collector',         description: 'Track 5 or more habits',          icon: '🎯', rarity: 'common',    xpReward: 40   },
  { id: 'all_cats',         name: 'Renaissance',       description: 'Have habits in 4+ categories',    icon: '🎨', rarity: 'epic',      xpReward: 200  },
  { id: 'comeback',         name: 'Comeback Kid',      description: 'Resume a habit after a 3-day gap', icon: '🔄', rarity: 'rare',      xpReward: 80   },
];

function defaultProfile(): GamificationProfile {
  return { xp: 0, level: 1, badges: ALL_BADGES.map(b => ({ ...b })), totalCompletions: 0, perfectDays: 0, milestones: [] };
}

export interface XPEvent {
  xp: number;
  reason: string;
  levelUp?: { from: number; to: number; title: string; color: string };
  newBadges: Badge[];
}

export function useGamification(habits: Habit[], userId?: string | null) {
  const [profile, setProfile] = useState<GamificationProfile>(defaultProfile);
  const [loaded, setLoaded] = useState(false);

  // ── Load / upsert row ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) { setLoaded(true); return; }
    supabase
      .from('gamification_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        if (data) {
          const saved = data as Record<string, unknown>;
          const savedBadges = (saved.badges as Badge[]) ?? [];
          const merged = ALL_BADGES.map(def => savedBadges.find(b => b.id === def.id) ?? def);
          setProfile({
            xp: saved.xp as number,
            level: saved.level as number,
            badges: merged,
            totalCompletions: saved.total_completions as number,
            perfectDays: saved.perfect_days as number,
            lastPerfectDay: saved.last_perfect_day as string | undefined,
            milestones: (saved.milestones as string[]) ?? [],
          });
        } else {
          // First time — insert default row
          supabase.from('gamification_profiles').insert({
            user_id: userId,
            xp: 0, level: 1, badges: [], total_completions: 0, perfect_days: 0, milestones: [],
          });
        }
        setLoaded(true);
      });
  }, [userId]);

  // ── Persist to Supabase ───────────────────────────────────────────────────
  const persist = useCallback(async (p: GamificationProfile) => {
    if (!userId) return;
    await supabase.from('gamification_profiles').upsert({
      user_id: userId,
      xp: p.xp,
      level: p.level,
      badges: p.badges,
      total_completions: p.totalCompletions,
      perfect_days: p.perfectDays,
      last_perfect_day: p.lastPerfectDay ?? null,
      milestones: p.milestones,
    });
  }, [userId]);

  // ── Core award ────────────────────────────────────────────────────────────
  const awardXP = useCallback((amount: number, reason: string, badgeIds: string[] = []): XPEvent => {
    let event!: XPEvent;
    setProfile(prev => {
      const oldLevel = getLevelInfo(prev.xp).current.level;
      const newXP = prev.xp + amount;
      const newLevel = getLevelInfo(newXP).current.level;
      const newBadges: Badge[] = [];
      const badges = prev.badges.map(b => {
        if (badgeIds.includes(b.id) && !b.unlockedAt) {
          const unlocked = { ...b, unlockedAt: new Date().toISOString() };
          newBadges.push(unlocked);
          return unlocked;
        }
        return b;
      });
      const next: GamificationProfile = { ...prev, xp: newXP, level: newLevel, badges };
      event = {
        xp: amount + newBadges.reduce((s, b) => s + b.xpReward, 0),
        reason,
        newBadges,
        levelUp: newLevel > oldLevel
          ? { from: oldLevel, to: newLevel, title: getLevelInfo(newXP).current.title, color: getLevelInfo(newXP).current.color }
          : undefined,
      };
      persist(next);
      return next;
    });
    return event;
  }, [persist]);

  // ── Habit complete ────────────────────────────────────────────────────────
  const onHabitComplete = useCallback((habit: Habit, allHabits: Habit[]): XPEvent => {
    let xpGained = XP_REWARDS.habitComplete;
    const badgesToUnlock: string[] = [];
    const reasons: string[] = [`+${XP_REWARDS.habitComplete} habit complete`];
    const today = todayStr();
    const totalCompletions = profile.totalCompletions + 1;

    if (totalCompletions === 1)   badgesToUnlock.push('first_done');
    if (totalCompletions === 10)  badgesToUnlock.push('done_10');
    if (totalCompletions === 50)  badgesToUnlock.push('done_50');
    if (totalCompletions === 100) badgesToUnlock.push('done_100');
    if (totalCompletions === 500) badgesToUnlock.push('done_500');

    const streak = habit.streak + 1;
    if (streak === 3)   { badgesToUnlock.push('streak_3');   xpGained += XP_REWARDS.streak7;   reasons.push('3-day streak!'); }
    if (streak === 7)   { badgesToUnlock.push('streak_7');   xpGained += XP_REWARDS.streak7;   reasons.push('7-day streak!'); }
    if (streak === 14)  { badgesToUnlock.push('streak_14');  xpGained += XP_REWARDS.streak14;  reasons.push('14-day streak!'); }
    if (streak === 30)  { badgesToUnlock.push('streak_30');  xpGained += XP_REWARDS.streak30;  reasons.push('30-day streak!'); }
    if (streak === 100) { badgesToUnlock.push('streak_100'); xpGained += XP_REWARDS.streak100; reasons.push('100-day streak!'); }

    const othersDoneToday = allHabits.filter(h => h.id !== habit.id && h.completedDates.includes(today)).length;
    const isPerfectDay = othersDoneToday === allHabits.length - 1;
    let newPerfectDays = profile.perfectDays;
    if (isPerfectDay && profile.lastPerfectDay !== today) {
      xpGained += XP_REWARDS.perfectDay;
      newPerfectDays += 1;
      reasons.push(`+${XP_REWARDS.perfectDay} perfect day!`);
      if (newPerfectDays === 1)  badgesToUnlock.push('perfect_1');
      if (newPerfectDays === 7)  badgesToUnlock.push('perfect_7');
      if (newPerfectDays === 30) badgesToUnlock.push('perfect_30');
    }

    if (allHabits.length >= 5) badgesToUnlock.push('multi_habit');
    const cats = new Set(allHabits.map(h => h.category));
    if (cats.size >= 4) badgesToUnlock.push('all_cats');

    const d1 = new Date(); d1.setDate(d1.getDate() - 1);
    const d3 = new Date(); d3.setDate(d3.getDate() - 3);
    const d4 = new Date(); d4.setDate(d4.getDate() - 4);
    const wasYesterday = habit.completedDates.includes(d1.toISOString().slice(0, 10));
    const hadGap = !habit.completedDates.includes(d3.toISOString().slice(0, 10)) &&
                   !habit.completedDates.includes(d4.toISOString().slice(0, 10));
    if (wasYesterday && hadGap) badgesToUnlock.push('comeback');

    const newBadgeIds = badgesToUnlock.filter(id => !profile.badges.find(b => b.id === id)?.unlockedAt);

    setProfile(prev => {
      const updated = { ...prev, totalCompletions, perfectDays: newPerfectDays, lastPerfectDay: isPerfectDay ? today : prev.lastPerfectDay };
      persist(updated);
      return updated;
    });

    return awardXP(xpGained, reasons.join(' · '), newBadgeIds);
  }, [profile, awardXP, persist]);

  // ── Level badge check ─────────────────────────────────────────────────────
  const checkLevelBadges = useCallback(() => {
    const { current } = getLevelInfo(profile.xp);
    const toUnlock: string[] = [];
    if (current.level >= 5  && !profile.badges.find(b => b.id === 'level_5')?.unlockedAt)  toUnlock.push('level_5');
    if (current.level >= 10 && !profile.badges.find(b => b.id === 'level_10')?.unlockedAt) toUnlock.push('level_10');
    if (toUnlock.length) awardXP(0, 'Level badge unlocked', toUnlock);
  }, [profile, awardXP]);

  useEffect(() => { if (loaded) checkLevelBadges(); }, [profile.level, loaded, checkLevelBadges]);

  // ── Task complete ─────────────────────────────────────────────────────────
  const onTaskComplete = useCallback((priority: 'high' | 'medium' | 'low', totalTasksCompleted: number): XPEvent => {
    let xpGained = XP_REWARDS.taskComplete;
    const reasons: string[] = [`+${XP_REWARDS.taskComplete} task complete`];
    const badgesToUnlock: string[] = [];
    if (priority === 'high') { xpGained += XP_REWARDS.taskHighPriority; reasons.push(`+${XP_REWARDS.taskHighPriority} high priority`); }
    if (totalTasksCompleted === 10) { xpGained += XP_REWARDS.task10Complete; badgesToUnlock.push('task_10'); }
    if (totalTasksCompleted === 25) { xpGained += XP_REWARDS.task25Complete; badgesToUnlock.push('task_25'); }
    const newBadgeIds = badgesToUnlock.filter(id => !profile.badges.find(b => b.id === id)?.unlockedAt);
    return awardXP(xpGained, reasons.join(' · '), newBadgeIds);
  }, [profile, awardXP]);

  // ── Pomodoro complete ─────────────────────────────────────────────────────
  const onPomodoroComplete = useCallback((totalSessions: number): XPEvent => {
    let xpGained = XP_REWARDS.pomodoroSession;
    const reasons: string[] = [`+${XP_REWARDS.pomodoroSession} pomodoro session`];
    const badgesToUnlock: string[] = [];
    if (totalSessions === 5)  { xpGained += XP_REWARDS.pomodoro5Sessions;  badgesToUnlock.push('pomodoro_5'); }
    if (totalSessions === 10) { xpGained += XP_REWARDS.pomodoro10Sessions; badgesToUnlock.push('pomodoro_10'); }
    const newBadgeIds = badgesToUnlock.filter(id => !profile.badges.find(b => b.id === id)?.unlockedAt);
    return awardXP(xpGained, reasons.join(' · '), newBadgeIds);
  }, [profile, awardXP]);

  // ── Project complete ──────────────────────────────────────────────────────
  const onProjectComplete = useCallback((projectName: string, isMilestone = false): XPEvent => {
    let xpGained = XP_REWARDS.projectComplete;
    const reasons: string[] = [`+${XP_REWARDS.projectComplete} project complete`];
    const badgesToUnlock = ['project_complete'];
    if (isMilestone) { xpGained += XP_REWARDS.projectMilestone; reasons.push(`+${XP_REWARDS.projectMilestone} milestone!`); badgesToUnlock.push('project_milestone'); }
    return awardXP(xpGained, reasons.join(' · '), badgesToUnlock);
  }, [awardXP]);

  const awardCustomXP = useCallback((amount: number, reason: string): XPEvent => awardXP(amount, reason, []), [awardXP]);

  return {
    profile, loaded, levelInfo: getLevelInfo(profile.xp),
    unlockedBadges: profile.badges.filter(b => b.unlockedAt),
    lockedBadges: profile.badges.filter(b => !b.unlockedAt),
    onHabitComplete, onTaskComplete, onPomodoroComplete, onProjectComplete, awardCustomXP,
    awardXP: awardXP as typeof awardXP,
  };
}
