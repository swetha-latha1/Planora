export type Priority = 'high' | 'medium' | 'low';
export type Category = 'work' | 'personal' | 'health' | 'other';

export type HabitCategory = 'health' | 'mindset' | 'work' | 'fitness' | 'learning' | 'social' | 'creative' | 'finance';
export type HabitFrequency = 'daily' | 'weekdays' | 'weekends';
export type HabitColor = 'violet' | 'cyan' | 'emerald' | 'rose' | 'amber' | 'sky' | 'pink' | 'orange';

// ── Gamification ─────────────────────────────────────────────────────────────
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  unlockedAt?: string;   // ISO date string when earned
  xpReward: number;
}

export interface GamificationProfile {
  xp: number;
  level: number;
  badges: Badge[];
  totalCompletions: number;
  perfectDays: number;       // days where all habits were done
  lastPerfectDay?: string;
  milestones: string[];      // milestone IDs already triggered
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  color: HabitColor;
  icon: string;
  targetDays: number;          // days per period to hit
  completedDates: string[];    // ISO date strings 'YYYY-MM-DD'
  streak: number;              // current streak
  bestStreak: number;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  category: Category;
  customCategory?: string;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
}

export interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
}

export type PomodoroMode = 'work' | 'short' | 'long';

export interface StatCard {
  label: string;
  value: number | string;
  icon: string;
}
