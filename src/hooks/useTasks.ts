'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Task, Priority, Category } from '@/types';
import { generateId } from '@/utils';
import { supabase } from '@/lib/supabase';

function rowToTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string | undefined,
    priority: row.priority as Priority,
    category: row.category as Category,
    customCategory: row.custom_category as string | undefined,
    completed: row.completed as boolean,
    dueDate: row.due_date as string | undefined,
    createdAt: row.created_at as string,
  };
}

export function useTasks(userId?: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) { setTasks([]); return; }
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setTasks((data ?? []).map(rowToTask)));
  }, [userId]);

  // ── Add ───────────────────────────────────────────────────────────────────
  const addTask = useCallback(async (data: {
    title: string;
    description?: string;
    priority: Priority;
    category: Category;
    customCategory?: string;
    dueDate?: string;
  }) => {
    if (!userId) return;
    const row = {
      id: generateId(),
      user_id: userId,
      title: data.title,
      description: data.description ?? null,
      priority: data.priority,
      category: data.category,
      custom_category: data.customCategory ?? null,
      completed: false,
      due_date: data.dueDate ?? null,
    };
    const { data: inserted } = await supabase.from('tasks').insert(row).select().single();
    if (inserted) setTasks(prev => [rowToTask(inserted), ...prev]);
  }, [userId]);

  // ── Toggle ────────────────────────────────────────────────────────────────
  const toggleTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const { data: updated } = await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', id)
      .select()
      .single();
    if (updated) setTasks(prev => prev.map(t => t.id === id ? rowToTask(updated) : t));
  }, [tasks]);

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteTask = useCallback(async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Update ────────────────────────────────────────────────────────────────
  const updateTask = useCallback(async (id: string, data: Partial<Task>) => {
    const patch: Record<string, unknown> = {};
    if (data.title !== undefined)          patch.title = data.title;
    if (data.description !== undefined)    patch.description = data.description;
    if (data.priority !== undefined)       patch.priority = data.priority;
    if (data.category !== undefined)       patch.category = data.category;
    if (data.customCategory !== undefined) patch.custom_category = data.customCategory;
    if (data.completed !== undefined)      patch.completed = data.completed;
    if (data.dueDate !== undefined)        patch.due_date = data.dueDate;
    const { data: updated } = await supabase.from('tasks').update(patch).eq('id', id).select().single();
    if (updated) setTasks(prev => prev.map(t => t.id === id ? rowToTask(updated) : t));
  }, []);

  return { tasks, addTask, toggleTask, deleteTask, updateTask };
}
