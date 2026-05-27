'use client';
import { useState, useMemo } from 'react';
import { cn } from '@/utils';
import { generateId } from '@/utils';

type Priority = 'high' | 'medium' | 'low';
type Filter = 'all' | 'active' | 'completed';

interface CheckItem {
  id: string;
  text: string;
  done: boolean;
  priority: Priority;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'vacation',  name: 'Vacation',  icon: '✈️',  color: '#06b6d4' },
  { id: 'work',      name: 'Work',      icon: '💼',  color: '#7c6af7' },
  { id: 'shopping',  name: 'Shopping',  icon: '🛒',  color: '#f97316' },
  { id: 'health',    name: 'Health',    icon: '❤️',  color: '#10b981' },
  { id: 'personal',  name: 'Personal',  icon: '👤',  color: '#a78bfa' },
  { id: 'events',    name: 'Events',    icon: '🎉',  color: '#fbbf24' },
];

const PRIORITY_COLOR: Record<Priority, string> = {
  high:   '#f43f5e',
  medium: '#f97316',
  low:    '#10b981',
};

const PRIORITY_BG: Record<Priority, string> = {
  high:   'rgba(244,63,94,0.12)',
  medium: 'rgba(249,115,22,0.12)',
  low:    'rgba(16,185,129,0.12)',
};

const CAT_ICONS = ['✈️','💼','🛒','❤️','👤','🎉','📚','🏠','💰','🎯','🏋️','🎨','🤝','🌱','🔧'];
const CAT_COLORS = ['#06b6d4','#7c6af7','#f97316','#10b981','#a78bfa','#fbbf24','#f43f5e','#ec4899','#67e8f9','#34d399'];

export default function ChecklistPage() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [items, setItems] = useState<CheckItem[]>([]);
  const [activeCat, setActiveCat] = useState<string>(DEFAULT_CATEGORIES[0].id);
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [filter, setFilter] = useState<Filter>('all');
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🎯');
  const [newCatColor, setNewCatColor] = useState('#7c6af7');

  const cat = categories.find(c => c.id === activeCat)!;
  const catItems = items.filter(i => i.categoryId === activeCat);

  const filtered = useMemo(() => {
    const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
    const sorted = [...catItems].sort((a, b) => order[a.priority] - order[b.priority]);
    if (filter === 'active')    return sorted.filter(i => !i.done);
    if (filter === 'completed') return sorted.filter(i => i.done);
    return sorted;
  }, [catItems, filter]);

  const doneCount  = catItems.filter(i => i.done).length;
  const totalCount = catItems.length;
  const pct        = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  function addItem() {
    if (!input.trim()) return;
    setItems(prev => [...prev, { id: generateId(), text: input.trim(), done: false, priority, categoryId: activeCat }]);
    setInput('');
  }

  function toggle(id: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i));
  }

  function remove(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function clearCompleted() {
    setItems(prev => prev.filter(i => !(i.categoryId === activeCat && i.done)));
  }

  function addCategory() {
    if (!newCatName.trim()) return;
    const id = generateId();
    setCategories(prev => [...prev, { id, name: newCatName.trim(), icon: newCatIcon, color: newCatColor }]);
    setActiveCat(id);
    setNewCatName('');
    setShowNewCat(false);
  }

  function deleteCategory(id: string) {
    if (categories.length === 1) return;
    setCategories(prev => prev.filter(c => c.id !== id));
    setItems(prev => prev.filter(i => i.categoryId !== id));
    if (activeCat === id) setActiveCat(categories.find(c => c.id !== id)!.id);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white/90">
          <span className="grad-text">Checklist</span>
        </h1>
        <p className="text-white/40 text-sm mt-1">Organised by category</p>
      </div>

      <div className="flex gap-5 items-start">

        {/* Left: category sidebar */}
        <div className="w-48 shrink-0 space-y-1.5">
          {categories.map(c => {
            const count = items.filter(i => i.categoryId === c.id).length;
            const done  = items.filter(i => i.categoryId === c.id && i.done).length;
            return (
              <div key={c.id} className="group relative">
                <button onClick={() => setActiveCat(c.id)}
                  className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all text-left',
                    activeCat === c.id ? 'text-white' : 'text-white/45 hover:text-white/75 hover:bg-white/[0.05]'
                  )}
                  style={activeCat === c.id ? { background: `${c.color}20`, border: `1px solid ${c.color}40` } : {}}>
                  <span className="text-base shrink-0">{c.icon}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  {count > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                      style={{ background: `${c.color}25`, color: c.color }}>
                      {done}/{count}
                    </span>
                  )}
                </button>
                {categories.length > 1 && (
                  <button onClick={() => deleteCategory(c.id)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 w-5 h-5 rounded-lg flex items-center justify-center text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                )}
              </div>
            );
          })}

          {/* Add category */}
          {!showNewCat ? (
            <button onClick={() => setShowNewCat(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-2xl text-xs text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all border border-dashed border-white/[0.08]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              New category
            </button>
          ) : (
            <div className="glass rounded-2xl p-3 space-y-2">
              <input autoFocus
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white/80 placeholder-white/25 outline-none focus:border-accent/50 transition-colors"
                placeholder="Category name"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCategory()}
              />
              {/* Icon picker */}
              <div className="flex flex-wrap gap-1">
                {CAT_ICONS.map(ic => (
                  <button key={ic} onClick={() => setNewCatIcon(ic)}
                    className={cn('w-6 h-6 rounded-lg text-sm flex items-center justify-center transition-all',
                      newCatIcon === ic ? 'bg-accent/30 ring-1 ring-accent/50' : 'hover:bg-white/[0.06]')}>
                    {ic}
                  </button>
                ))}
              </div>
              {/* Color picker */}
              <div className="flex gap-1 flex-wrap">
                {CAT_COLORS.map(col => (
                  <button key={col} onClick={() => setNewCatColor(col)}
                    className={cn('w-4 h-4 rounded-full transition-all', newCatColor === col && 'ring-2 ring-white/50 scale-110')}
                    style={{ background: col }} />
                ))}
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setShowNewCat(false)}
                  className="flex-1 py-1.5 rounded-xl text-[10px] font-semibold text-white/35 border border-white/[0.08] hover:bg-white/[0.04] transition-all">
                  Cancel
                </button>
                <button onClick={addCategory}
                  className="flex-1 py-1.5 rounded-xl text-[10px] font-semibold btn-glow">
                  Add
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: checklist content */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Category header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{cat.icon}</span>
              <div>
                <h2 className="text-base font-bold text-white/85">{cat.name}</h2>
                <p className="text-xs text-white/30">{doneCount} of {totalCount} completed</p>
              </div>
            </div>
            {doneCount > 0 && (
              <button onClick={clearCompleted}
                className="text-xs px-3 py-1.5 rounded-xl glass border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-all">
                Clear done
              </button>
            )}
          </div>

          {/* Progress */}
          {totalCount > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-white/30">
                <span>Progress</span><span>{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${cat.color}, ${cat.color}88)` }} />
              </div>
            </div>
          )}

          {/* Input */}
          <div className="glass rounded-2xl p-3 flex flex-col gap-2.5">
            <input
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/25 outline-none focus:border-accent/50 transition-colors"
              placeholder={`Add to ${cat.name}…`}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
            />
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {(['high', 'medium', 'low'] as Priority[]).map(p => (
                  <button key={p} onClick={() => setPriority(p)}
                    className={cn('px-2.5 py-1 rounded-xl text-[10px] font-semibold capitalize transition-all border',
                      priority === p ? '' : 'text-white/35 border-white/[0.08] hover:text-white/60'
                    )}
                    style={priority === p ? { background: PRIORITY_BG[p], borderColor: PRIORITY_COLOR[p] + '60', color: PRIORITY_COLOR[p] } : {}}>
                    {p}
                  </button>
                ))}
              </div>
              <button onClick={addItem}
                className="ml-auto btn-glow px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Add
              </button>
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-1 p-1 glass rounded-2xl w-fit">
            {(['all', 'active', 'completed'] as Filter[]).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn('px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all',
                  filter === f ? 'bg-accent/25 text-accent2 border border-accent/30' : 'text-white/30 hover:text-white/60')}>
                {f}
                <span className="ml-1 text-[10px] opacity-60">
                  {f === 'all' ? totalCount : f === 'active' ? totalCount - doneCount : doneCount}
                </span>
              </button>
            ))}
          </div>

          {/* Items */}
          {filtered.length === 0 ? (
            <div className="glass rounded-3xl p-10 flex flex-col items-center gap-3 text-center">
              <span className="text-3xl">{cat.icon}</span>
              <p className="text-white/50 font-semibold text-sm">
                {filter === 'completed' ? 'No completed items' : filter === 'active' ? 'All done!' : `No items in ${cat.name}`}
              </p>
              {filter === 'all' && <p className="text-white/25 text-xs">Add your first item above</p>}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(item => (
                <div key={item.id}
                  className={cn('glass rounded-2xl px-4 py-3 flex items-center gap-3 group transition-all',
                    item.done && 'opacity-50')}>
                  <button onClick={() => toggle(item.id)}
                    className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all"
                    style={{
                      borderColor: item.done ? PRIORITY_COLOR[item.priority] : 'rgba(255,255,255,0.2)',
                      background:  item.done ? PRIORITY_COLOR[item.priority] : 'transparent',
                    }}>
                    {item.done && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    )}
                  </button>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: PRIORITY_COLOR[item.priority] }} />
                  <span className={cn('flex-1 text-sm', item.done ? 'line-through text-white/30' : 'text-white/75')}>
                    {item.text}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize shrink-0 hidden sm:block"
                    style={{ background: PRIORITY_BG[item.priority], color: PRIORITY_COLOR[item.priority] }}>
                    {item.priority}
                  </span>
                  <button onClick={() => remove(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-white/25 hover:text-rose-400 transition-all shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
