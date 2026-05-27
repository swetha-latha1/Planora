'use client';
import { createContext, useContext, ReactNode } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useGamification } from '@/hooks/useGamification';
import { useUser } from '@/context/UserContext';

type DataCtx = {
  habits: ReturnType<typeof useHabits>;
  tasks: ReturnType<typeof useTasks>;
  projects: ReturnType<typeof useProjects>;
  gamification: ReturnType<typeof useGamification>;
};

const DataContext = createContext<DataCtx | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const user = useUser();
  const habits = useHabits(user?.id);
  const tasks = useTasks(user?.id);
  const projects = useProjects(user?.id);
  const gamification = useGamification(habits.habits, user?.id);

  return (
    <DataContext.Provider value={{ habits, tasks, projects, gamification }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}
