'use client';
import { useState } from 'react';
import type { Priority, Category } from '@/types';

interface Props {
  onAdd: (data: { title: string; description?: string; priority: Priority; category: Category; customCategory?: string; dueDate?: string }) => void;
  onClose: () => void;
}

const inputCls = 'w-full px-4 py-2.5 rounded-xl text-sm text-white/80 placeholder-white/25 outline-none border border-white/[0.1] focus:border-accent/60 transition-all';
const inputStyle = { background: 'rgba(255,255,255,0.05)' };
const selectStyle = { background: '#1a1030', colorScheme: 'dark' as const };

export default function TaskForm({ onAdd, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('work');
  const [customCategory, setCustomCategory] = useState('');
  const [dueDate, setDueDate] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title, description: description || undefined, priority, category, customCategory: category === 'other' ? customCategory.trim() : undefined, dueDate: dueDate || undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="w-full max-w-md glass rounded-3xl p-6 border border-white/[0.10] animate-fade-in" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-white/90">New Task</h2>
            <p className="text-xs text-white/35 mt-0.5">Add a task to your list</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input autoFocus className={inputCls} style={inputStyle} placeholder="Task title *" value={title} onChange={e => setTitle(e.target.value)} required />
          <input className={inputCls} style={inputStyle} placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/35 uppercase tracking-wide px-1">Priority</label>
              <select className={inputCls} style={selectStyle} value={priority} onChange={e => setPriority(e.target.value as Priority)}>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/35 uppercase tracking-wide px-1">Category</label>
              <select className={inputCls} style={selectStyle} value={category} onChange={e => { setCategory(e.target.value as Category); setCustomCategory(''); }}>
                <option value="work">💼 Work</option>
                <option value="personal">👤 Personal</option>
                <option value="health">❤️ Health</option>
                <option value="other">📌 Other</option>
              </select>
            </div>
          </div>

          {category === 'other' && (
            <input className={inputCls} style={inputStyle} placeholder="Custom category name *" value={customCategory} onChange={e => setCustomCategory(e.target.value)} required />
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-white/35 uppercase tracking-wide px-1">Due Date (optional)</label>
            <input type="date" className={inputCls} style={{ ...inputStyle, colorScheme: 'dark' }} value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>

          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white/40 border border-white/[0.08] hover:bg-white/[0.04] transition-all">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-glow">
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
