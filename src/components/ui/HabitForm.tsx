'use client';
import { useState, useEffect } from 'react';
import { cn } from '@/utils';
import type { Habit, HabitCategory, HabitFrequency, HabitColor } from '@/types';
import type { HabitInput } from '@/hooks/useHabits';

const ICONS = ['🧘','📚','💪','⚡','💧','✍️','🎯','🏃','🥗','😴','🎨','🎵','💰','🤝','🧠','🌿','☀️','🚴'];

const COLORS: HabitColor[] = ['violet','cyan','emerald','rose','amber','sky','pink','orange'];
const COLOR_DOT: Record<HabitColor, string> = {
  violet: 'bg-violet-400', cyan: 'bg-cyan-400', emerald: 'bg-emerald-400',
  rose: 'bg-rose-400', amber: 'bg-amber-400', sky: 'bg-sky-400',
  pink: 'bg-pink-400', orange: 'bg-orange-400',
};

const CATEGORIES: HabitCategory[] = ['health','mindset','work','fitness','learning','social','creative','finance'];
const FREQUENCIES: HabitFrequency[] = ['daily','weekdays','weekends'];

interface Props {
  open: boolean;
  editing?: Habit | null;
  onSave: (data: HabitInput) => void;
  onClose: () => void;
}

const DEFAULTS: HabitInput = {
  name: '', description: '', category: 'health',
  frequency: 'daily', color: 'violet', icon: '🎯', targetDays: 7,
};

export default function HabitForm({ open, editing, onSave, onClose }: Props) {
  const [form, setForm] = useState<HabitInput>(DEFAULTS);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name, description: editing.description ?? '',
        category: editing.category, frequency: editing.frequency,
        color: editing.color, icon: editing.icon, targetDays: editing.targetDays,
      });
    } else {
      setForm(DEFAULTS);
    }
  }, [editing, open]);

  if (!open) return null;

  const set = <K extends keyof HabitInput>(k: K, v: HabitInput[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
    onClose();
  };

  const inputCls = 'w-full px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-sm text-white/80 placeholder-white/25 outline-none focus:border-accent/50 focus:bg-white/[0.08] transition-all';
  const labelCls = 'text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-1.5 block';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 md:inset-0 md:flex md:items-center md:justify-center z-50 pointer-events-none">
        <div
          className={cn(
            'pointer-events-auto w-full md:max-w-lg md:mx-4',
            'glass rounded-t-3xl md:rounded-3xl border border-white/[0.1]',
            'shadow-[0_-20px_60px_rgba(0,0,0,0.5)]',
            'animate-slide-up md:animate-fade-in',
          )}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          <form onSubmit={submit} className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white/90">
                  {editing ? 'Edit Habit' : 'New Habit'}
                </h2>
                <p className="text-xs text-white/30 mt-0.5">
                  {editing ? 'Update your habit details' : 'Build a new daily routine'}
                </p>
              </div>
              <button
                type="button" onClick={onClose}
                className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/40 hover:text-white/80 transition-all"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Icon picker */}
            <div>
              <label className={labelCls}>Icon</label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map(ic => (
                  <button
                    key={ic} type="button"
                    onClick={() => set('icon', ic)}
                    className={cn(
                      'w-10 h-10 rounded-xl text-xl transition-all duration-150',
                      form.icon === ic
                        ? 'bg-accent/25 border border-accent/50 scale-110 shadow-[0_0_12px_rgba(124,106,247,0.4)]'
                        : 'bg-white/[0.05] border border-white/[0.06] hover:bg-white/[0.1] hover:scale-105',
                    )}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className={labelCls}>Habit Name *</label>
              <input
                className={inputCls}
                placeholder="e.g. Morning Meditation"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Description</label>
              <input
                className={inputCls}
                placeholder="Optional short description"
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
            </div>

            {/* Category + Frequency */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Category</label>
                <select
                  className={cn(inputCls, 'cursor-pointer')}
                  value={form.category}
                  onChange={e => set('category', e.target.value as HabitCategory)}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c} className="bg-[#0f0c29] capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Frequency</label>
                <select
                  className={cn(inputCls, 'cursor-pointer')}
                  value={form.frequency}
                  onChange={e => set('frequency', e.target.value as HabitFrequency)}
                >
                  {FREQUENCIES.map(f => (
                    <option key={f} value={f} className="bg-[#0f0c29] capitalize">{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Color picker */}
            <div>
              <label className={labelCls}>Color Theme</label>
              <div className="flex gap-2.5 flex-wrap">
                {COLORS.map(col => (
                  <button
                    key={col} type="button"
                    onClick={() => set('color', col)}
                    className={cn(
                      'w-8 h-8 rounded-full transition-all duration-150',
                      COLOR_DOT[col],
                      form.color === col
                        ? 'scale-125 ring-2 ring-white/50 ring-offset-2 ring-offset-transparent'
                        : 'opacity-60 hover:opacity-100 hover:scale-110',
                    )}
                    title={col}
                  />
                ))}
              </div>
            </div>

            {/* Target days */}
            <div>
              <label className={labelCls}>Target Days / Week — <span className="text-white/60 normal-case">{form.targetDays} days</span></label>
              <input
                type="range" min={1} max={7} step={1}
                value={form.targetDays}
                onChange={e => set('targetDays', Number(e.target.value))}
                className="w-full accent-accent h-1.5 rounded-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-white/20 mt-1">
                {[1,2,3,4,5,6,7].map(n => <span key={n}>{n}</span>)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button" onClick={onClose}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white/50 bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.09] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white btn-glow transition-all"
              >
                {editing ? 'Save Changes' : 'Create Habit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
