'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type ProjectPriority = 'high' | 'medium' | 'low';
export type ProjectStatus = 'in-progress' | 'completed' | 'pending';
export type ProjectCategory = 'work' | 'study' | 'personal' | 'design';

export interface SubTask {
  id: string;
  title: string;
  done: boolean;
}

export interface TimeEntry {
  date: string;
  hours: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: ProjectCategory;
  priority: ProjectPriority;
  status: ProjectStatus;
  color: string;
  icon: string;
  dueDate: string;
  notes: string;
  pinned: boolean;
  subtasks: SubTask[];
  timeEntries: TimeEntry[];
  createdAt: string;
}

function rowToProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? '',
    category: row.category as ProjectCategory,
    priority: row.priority as ProjectPriority,
    status: row.status as ProjectStatus,
    color: row.color as string,
    icon: row.icon as string,
    dueDate: (row.due_date as string) ?? '',
    notes: (row.notes as string) ?? '',
    pinned: row.pinned as boolean,
    subtasks: (row.subtasks as SubTask[]) ?? [],
    timeEntries: (row.time_entries as TimeEntry[]) ?? [],
    createdAt: row.created_at as string,
  };
}

export function useProjects(userId?: string | null) {
  const [projects, setProjects] = useState<Project[]>([]);

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) { setProjects([]); return; }
    supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setProjects((data ?? []).map(rowToProject)));
  }, [userId]);

  // ── Add ───────────────────────────────────────────────────────────────────
  const addProject = useCallback(async (data: Omit<Project, 'id' | 'createdAt'>) => {
    if (!userId) return;
    const row = {
      id: Date.now().toString(),
      user_id: userId,
      name: data.name,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: data.status,
      color: data.color,
      icon: data.icon,
      due_date: data.dueDate,
      notes: data.notes,
      pinned: data.pinned,
      subtasks: data.subtasks,
      time_entries: data.timeEntries,
    };
    const { data: inserted } = await supabase.from('projects').insert(row).select().single();
    if (inserted) setProjects(prev => [rowToProject(inserted), ...prev]);
  }, [userId]);

  // ── Update ────────────────────────────────────────────────────────────────
  const updateProject = useCallback(async (id: string, data: Partial<Project>) => {
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined)        patch.name = data.name;
    if (data.description !== undefined) patch.description = data.description;
    if (data.category !== undefined)    patch.category = data.category;
    if (data.priority !== undefined)    patch.priority = data.priority;
    if (data.status !== undefined)      patch.status = data.status;
    if (data.color !== undefined)       patch.color = data.color;
    if (data.icon !== undefined)        patch.icon = data.icon;
    if (data.dueDate !== undefined)     patch.due_date = data.dueDate;
    if (data.notes !== undefined)       patch.notes = data.notes;
    if (data.pinned !== undefined)      patch.pinned = data.pinned;
    if (data.subtasks !== undefined)    patch.subtasks = data.subtasks;
    if (data.timeEntries !== undefined) patch.time_entries = data.timeEntries;
    const { data: updated } = await supabase.from('projects').update(patch).eq('id', id).select().single();
    if (updated) setProjects(prev => prev.map(p => p.id === id ? rowToProject(updated) : p));
  }, []);

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteProject = useCallback(async (id: string) => {
    await supabase.from('projects').delete().eq('id', id);
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  // ── Toggle pin ────────────────────────────────────────────────────────────
  const togglePin = useCallback(async (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    const { data: updated } = await supabase
      .from('projects')
      .update({ pinned: !project.pinned })
      .eq('id', id)
      .select()
      .single();
    if (updated) setProjects(prev => prev.map(p => p.id === id ? rowToProject(updated) : p));
  }, [projects]);

  // ── Toggle subtask ────────────────────────────────────────────────────────
  const toggleSubtask = useCallback(async (projectId: string, subtaskId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const subtasks = project.subtasks.map(s => s.id === subtaskId ? { ...s, done: !s.done } : s);
    const status: ProjectStatus = subtasks.every(s => s.done) ? 'completed'
      : project.status === 'completed' ? 'in-progress' : project.status;
    const { data: updated } = await supabase
      .from('projects')
      .update({ subtasks, status })
      .eq('id', projectId)
      .select()
      .single();
    if (updated) setProjects(prev => prev.map(p => p.id === projectId ? rowToProject(updated) : p));
  }, [projects]);

  // ── Add subtask ───────────────────────────────────────────────────────────
  const addSubtask = useCallback(async (projectId: string, title: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const subtasks = [...project.subtasks, { id: Date.now().toString(), title, done: false }];
    const { data: updated } = await supabase
      .from('projects')
      .update({ subtasks })
      .eq('id', projectId)
      .select()
      .single();
    if (updated) setProjects(prev => prev.map(p => p.id === projectId ? rowToProject(updated) : p));
  }, [projects]);

  // ── Delete subtask ────────────────────────────────────────────────────────
  const deleteSubtask = useCallback(async (projectId: string, subtaskId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const subtasks = project.subtasks.filter(s => s.id !== subtaskId);
    const { data: updated } = await supabase
      .from('projects')
      .update({ subtasks })
      .eq('id', projectId)
      .select()
      .single();
    if (updated) setProjects(prev => prev.map(p => p.id === projectId ? rowToProject(updated) : p));
  }, [projects]);

  // ── Add time entry ────────────────────────────────────────────────────────
  const addTimeEntry = useCallback(async (projectId: string, hours: number) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const timeEntries = [...project.timeEntries, { date: new Date().toISOString().slice(0, 10), hours }];
    const { data: updated } = await supabase
      .from('projects')
      .update({ time_entries: timeEntries })
      .eq('id', projectId)
      .select()
      .single();
    if (updated) setProjects(prev => prev.map(p => p.id === projectId ? rowToProject(updated) : p));
  }, [projects]);

  // ── Reorder (local only) ──────────────────────────────────────────────────
  const reorderProjects = useCallback((from: number, to: number) => {
    setProjects(prev => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
  }, []);

  return { projects, addProject, updateProject, deleteProject, togglePin, toggleSubtask, addSubtask, deleteSubtask, addTimeEntry, reorderProjects };
}
