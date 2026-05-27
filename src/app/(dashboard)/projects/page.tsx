'use client';
import { useState, useMemo, useRef, useCallback } from 'react';
import { useData } from '@/context/DataContext';
import { useConfetti } from '@/hooks/useConfetti';
import type { Project, ProjectPriority, ProjectStatus, ProjectCategory } from '@/hooks/useProjects';
import { cn } from '@/utils';
import TaskCompleteEffect from '@/components/ui/TaskCompleteEffect';
import XPToast, { type ToastItem } from '@/components/ui/XPToast';
import LevelUpModal from '@/components/ui/LevelUpModal';
import { generateId } from '@/utils';

const COLORS = [
  'from-violet-500 to-purple-400',
  'from-cyan-500 to-blue-400',
  'from-emerald-500 to-teal-400',
  'from-rose-500 to-orange-400',
  'from-pink-500 to-rose-400',
  'from-amber-400 to-orange-500',
  'from-indigo-500 to-violet-400',
  'from-sky-500 to-cyan-400',
];

const ICONS = ['🎨','⚡','🚀','💼','📚','🏆','🔥','💡','🎯','🌟','💎','🛠️','📱','🌐','🎵','📊'];

const PRIORITY_STYLES: Record<ProjectPriority, { label: string; color: string; bg: string }> = {
  high:   { label: 'High',   color: '#f43f5e', bg: 'rgba(244,63,94,0.15)'   },
  medium: { label: 'Medium', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)'  },
  low:    { label: 'Low',    color: '#10b981', bg: 'rgba(16,185,129,0.15)'  },
};

const STATUS_STYLES: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  'in-progress': { label: 'In Progress', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)'   },
  'completed':   { label: 'Completed',   color: '#10b981', bg: 'rgba(16,185,129,0.15)'  },
  'pending':     { label: 'Pending',     color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
};

const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  work: '💼 Work', study: '📚 Study', personal: '👤 Personal', design: '🎨 Design',
};

const inputCls = 'w-full px-4 py-2.5 rounded-xl text-sm text-white/80 placeholder-white/25 outline-none border border-white/[0.1] focus:border-violet-500/60 transition-all';
const inputStyle = { background: 'rgba(255,255,255,0.05)' };

function getProgress(p: Project) {
  if (!p.subtasks.length) return 0;
  return Math.round((p.subtasks.filter(s => s.done).length / p.subtasks.length) * 100);
}

function getTotalHours(p: Project) {
  return p.timeEntries.reduce((a, e) => a + e.hours, 0);
}

function isOverdue(p: Project) {
  return p.dueDate && p.status !== 'completed' && new Date(p.dueDate) < new Date();
}

const EMPTY: Omit<Project, 'id' | 'createdAt'> = {
  name: '', description: '', category: 'work', priority: 'medium', status: 'pending',
  color: COLORS[0], icon: '🚀', dueDate: '', notes: '', pinned: false, subtasks: [], timeEntries: [],
};

export default function ProjectsPage() {
  const { projects: { projects, addProject, updateProject, deleteProject, togglePin, toggleSubtask, addSubtask, deleteSubtask, addTimeEntry, reorderProjects }, gamification: { onProjectComplete } } = useData();
  const { launch } = useConfetti();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<ProjectPriority | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<ProjectCategory | 'all'>('all');

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<Project, 'id' | 'createdAt'>>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newSubtask, setNewSubtask] = useState('');
  const [logHours, setLogHours] = useState('');
  const [showEffect, setShowEffect] = useState(false);
  const [celebratedId, setCelebratedId] = useState<string | null>(null);
  
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [levelUpData, setLevelUpData] = useState<{ level: number; title: string; color: string; xp: number } | null>(null);

  // Drag & drop
  const dragIdx = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const openAdd = () => { setFormData(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (p: Project) => {
    setFormData({ name: p.name, description: p.description, category: p.category, priority: p.priority, status: p.status, color: p.color, icon: p.icon, dueDate: p.dueDate, notes: p.notes, pinned: p.pinned, subtasks: p.subtasks, timeEntries: p.timeEntries });
    setEditId(p.id); setShowForm(true);
  };

  const submitForm = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    // Check if marking a project as completed
    let projectCompletedXP = null;
    if (editId) {
      const oldProject = projects.find(p => p.id === editId);
      if (oldProject && oldProject.status !== 'completed' && formData.status === 'completed') {
        projectCompletedXP = onProjectComplete(formData.name, oldProject.subtasks.every(s => s.done));
      }
      updateProject(editId, formData);
    } else {
      addProject(formData);
    }

    // Show gamification feedback
    if (projectCompletedXP) {
      setShowEffect(true);
      const toast: ToastItem = {
        id: generateId(),
        xp: projectCompletedXP.xp,
        reason: projectCompletedXP.reason,
        levelUp: projectCompletedXP.levelUp ? { to: projectCompletedXP.levelUp.to, title: projectCompletedXP.levelUp.title, color: projectCompletedXP.levelUp.color } : undefined,
      };
      setToasts(prev => [...prev, toast]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toast.id)), 3500);

      if (projectCompletedXP.levelUp) {
        setLevelUpData({ level: projectCompletedXP.levelUp.to, title: projectCompletedXP.levelUp.title, color: projectCompletedXP.levelUp.color, xp: projectCompletedXP.xp });
        launch();
      } else if (projectCompletedXP.newBadges.length > 0) {
        launch(undefined, undefined, 60);
      }
    }

    setShowForm(false);
  }, [editId, formData, projects, onProjectComplete, addProject, updateProject, launch]);

  const handleToggleSubtask = useCallback((projectId: string, subtaskId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const subtask = project.subtasks.find(s => s.id === subtaskId);
    const willComplete = subtask && !subtask.done;
    toggleSubtask(projectId, subtaskId);
    // Check if all subtasks will be done after this toggle
    const doneBefore = project.subtasks.filter(s => s.done).length;
    const total = project.subtasks.length;
    if (willComplete && doneBefore + 1 === total && celebratedId !== projectId) {
      setShowEffect(true);
      setCelebratedId(projectId);
      const event = onProjectComplete(project.name, false);
      if (event) {
        const toast: ToastItem = {
          id: generateId(),
          xp: event.xp,
          reason: event.reason,
          levelUp: event.levelUp ? { to: event.levelUp.to, title: event.levelUp.title, color: event.levelUp.color } : undefined,
        };
        setToasts(prev => [...prev, toast]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toast.id)), 3500);

        if (event.levelUp) {
          setLevelUpData({ level: event.levelUp.to, title: event.levelUp.title, color: event.levelUp.color, xp: event.xp });
          launch();
        } else if (event.newBadges.length > 0) {
          launch(undefined, undefined, 60);
        }
      }
    }
  }, [projects, toggleSubtask, celebratedId, onProjectComplete, launch]);

  const sorted = useMemo(() => {
    return [...projects]
      .filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || p.status === filterStatus;
        const matchPriority = filterPriority === 'all' || p.priority === filterPriority;
        const matchCategory = filterCategory === 'all' || p.category === filterCategory;
        return matchSearch && matchStatus && matchPriority && matchCategory;
      })
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [projects, search, filterStatus, filterPriority, filterCategory]);

  const stats = useMemo(() => ({
    total: projects.length,
    completed: projects.filter(p => p.status === 'completed').length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    totalHours: projects.reduce((a, p) => a + getTotalHours(p), 0),
  }), [projects]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <XPToast toasts={toasts} />
      {levelUpData && <LevelUpModal xp={levelUpData.xp} level={levelUpData.level} title={levelUpData.title} color={levelUpData.color} onClose={() => setLevelUpData(null)} />}
      {showEffect && <TaskCompleteEffect onDone={() => setShowEffect(false)} />}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white/90">Projects <span className="text-white/20 text-xl">({projects.length})</span></h1>
          <p className="text-white/40 text-sm mt-1">Manage and track all your projects</p>
        </div>
        <button onClick={openAdd} className="btn-glow px-5 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-2 shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M12 5v14M5 12h14"/></svg>
          New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: '#7c6af7', bg: 'rgba(124,106,247,0.12)', border: 'rgba(124,106,247,0.25)' },
          { label: 'In Progress', value: stats.inProgress, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.25)' },
          { label: 'Completed', value: stats.completed, color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
          { label: 'Hours Logged', value: stats.totalHours, color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.25)' },
        ].map(s => (
          <div key={s.label} className="flex flex-col items-center justify-center py-4 rounded-2xl" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
            <span className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</span>
            <span className="text-[10px] text-white/40 uppercase tracking-wide mt-1">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm text-white/70 placeholder-white/25 outline-none border border-white/[0.08] focus:border-violet-500/50 transition-all"
            style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>
        {(['all', 'in-progress', 'completed', 'pending'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={cn('px-3 py-2 rounded-xl text-xs font-medium transition-all border', filterStatus === s ? 'bg-violet-500/20 text-violet-300 border-violet-500/40' : 'text-white/40 border-white/[0.08] hover:text-white/70')}>
            {s === 'all' ? 'All Status' : STATUS_STYLES[s].label}
          </button>
        ))}
        {(['all', 'high', 'medium', 'low'] as const).map(p => (
          <button key={p} onClick={() => setFilterPriority(p)}
            className={cn('px-3 py-2 rounded-xl text-xs font-medium transition-all border', filterPriority === p ? 'bg-violet-500/20 text-violet-300 border-violet-500/40' : 'text-white/40 border-white/[0.08] hover:text-white/70')}>
            {p === 'all' ? 'All Priority' : PRIORITY_STYLES[p].label}
          </button>
        ))}
        {(['all', 'work', 'study', 'personal', 'design'] as const).map(c => (
          <button key={c} onClick={() => setFilterCategory(c)}
            className={cn('px-3 py-2 rounded-xl text-xs font-medium transition-all border', filterCategory === c ? 'bg-violet-500/20 text-violet-300 border-violet-500/40' : 'text-white/40 border-white/[0.08] hover:text-white/70')}>
            {c === 'all' ? 'All Categories' : CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="text-5xl">📁</div>
          <p className="text-white/50 font-semibold">No projects found</p>
          <button onClick={openAdd} className="btn-glow px-5 py-2.5 rounded-2xl text-sm font-semibold">Create your first project</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map((p, idx) => {
            const progress = getProgress(p);
            const hours = getTotalHours(p);
            const overdue = isOverdue(p);
            const isExpanded = expandedId === p.id;
            const pri = PRIORITY_STYLES[p.priority];
            const sta = STATUS_STYLES[p.status];

            return (
              <div key={p.id}
                draggable
                onDragStart={() => { dragIdx.current = idx; }}
                onDragOver={e => { e.preventDefault(); setDragOver(idx); }}
                onDrop={() => { if (dragIdx.current !== null && dragIdx.current !== idx) reorderProjects(dragIdx.current, idx); dragIdx.current = null; setDragOver(null); }}
                onDragEnd={() => { dragIdx.current = null; setDragOver(null); }}
                className={cn('glass rounded-3xl p-5 flex flex-col gap-3 transition-all duration-200 cursor-grab active:cursor-grabbing', dragOver === idx && 'ring-2 ring-violet-500/50 scale-[1.02]')}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 bg-gradient-to-br', p.color)}>{p.icon}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        {p.pinned && <span className="text-amber-400 text-xs">📌</span>}
                        <h3 className="font-bold text-white/90 text-sm truncate">{p.name}</h3>
                      </div>
                      <p className="text-[10px] text-white/35 mt-0.5">{CATEGORY_LABELS[p.category]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => togglePin(p.id)} className={cn('w-7 h-7 rounded-lg flex items-center justify-center transition-all text-sm', p.pinned ? 'text-amber-400' : 'text-white/20 hover:text-amber-400')} title="Pin">📌</button>
                    <button onClick={() => openEdit(p)} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-violet-400 transition-all">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => deleteProject(p.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-rose-400 transition-all">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                    </button>
                  </div>
                </div>

                {/* Description */}
                {p.description && <p className="text-xs text-white/45 leading-relaxed">{p.description}</p>}

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: pri.color, background: pri.bg }}>{pri.label}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: sta.color, background: sta.bg }}>{sta.label}</span>
                  {overdue && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-rose-300" style={{ background: 'rgba(244,63,94,0.15)' }}>⚠ Overdue</span>}
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-[10px] text-white/35 mb-1">
                    <span>Progress</span><span>{progress}%</span>
                  </div>
                  <div className="h-1.5 progress-track">
                    <div className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', p.color)} style={{ width: `${progress}%` }} />
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between text-[10px] text-white/30">
                  <span>📅 {p.dueDate || 'No deadline'}</span>
                  <span>⏱ {hours}h logged</span>
                  <span>✅ {p.subtasks.filter(s => s.done).length}/{p.subtasks.length} tasks</span>
                </div>

                {/* Expand toggle */}
                <button onClick={() => setExpandedId(isExpanded ? null : p.id)}
                  className="w-full py-1.5 rounded-xl text-xs text-white/30 hover:text-white/60 border border-white/[0.06] hover:border-white/[0.12] transition-all flex items-center justify-center gap-1">
                  {isExpanded ? '▲ Hide details' : '▼ Show details'}
                </button>

                {/* Expanded section */}
                {isExpanded && (
                  <div className="flex flex-col gap-4 pt-1 border-t border-white/[0.06]">

                    {/* Subtasks */}
                    <div>
                      <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wide mb-2">Task Checklist</p>
                      <div className="space-y-1.5">
                        {p.subtasks.map(s => (
                          <div key={s.id} className="flex items-center gap-2 group">
                            <button onClick={() => handleToggleSubtask(p.id, s.id)}
                              className={cn('w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all text-[10px]', s.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/20 hover:border-violet-400')}>
                              {s.done && '✓'}
                            </button>
                            <span className={cn('text-xs flex-1', s.done ? 'line-through text-white/25' : 'text-white/65')}>{s.title}</span>
                            <button onClick={() => deleteSubtask(p.id, s.id)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-rose-400 transition-all text-xs">✕</button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <input value={newSubtask} onChange={e => setNewSubtask(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && newSubtask.trim()) { addSubtask(p.id, newSubtask.trim()); setNewSubtask(''); } }}
                          placeholder="Add subtask & press Enter"
                          className="flex-1 px-3 py-1.5 rounded-lg text-xs text-white/70 placeholder-white/20 outline-none border border-white/[0.08] focus:border-violet-500/40 transition-all"
                          style={{ background: 'rgba(255,255,255,0.04)' }} />
                      </div>
                    </div>

                    {/* Time Tracker */}
                    <div>
                      <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wide mb-2">Time Tracker — {hours}h total</p>
                      <div className="flex gap-2">
                        <input type="number" min="0.5" step="0.5" value={logHours} onChange={e => setLogHours(e.target.value)}
                          placeholder="Hours"
                          className="flex-1 px-3 py-1.5 rounded-lg text-xs text-white/70 placeholder-white/20 outline-none border border-white/[0.08] focus:border-violet-500/40 transition-all"
                          style={{ background: 'rgba(255,255,255,0.04)' }} />
                        <button onClick={() => { if (logHours) { addTimeEntry(p.id, parseFloat(logHours)); setLogHours(''); } }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold btn-glow">Log</button>
                      </div>
                      {p.timeEntries.length > 0 && (
                        <div className="mt-2 space-y-1 max-h-20 overflow-y-auto">
                          {[...p.timeEntries].reverse().slice(0, 5).map((e, i) => (
                            <div key={i} className="flex justify-between text-[10px] text-white/30">
                              <span>{e.date}</span><span>{e.hours}h</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {p.notes && (
                      <div>
                        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wide mb-1">Notes</p>
                        <p className="text-xs text-white/50 leading-relaxed p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>{p.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }} onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg rounded-3xl p-6 border border-white/[0.10] my-4" style={{ background: '#1a1030' }} onClick={e => e.stopPropagation()}>
            <h2 className="text-base font-bold text-white/90 mb-5">{editId ? 'Edit Project' : 'New Project'}</h2>
            <form onSubmit={submitForm} className="flex flex-col gap-3">

              {/* Icon picker */}
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wide mb-1.5 block">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(ic => (
                    <button key={ic} type="button" onClick={() => setFormData(f => ({ ...f, icon: ic }))}
                      className={cn('w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all', formData.icon === ic ? 'ring-2 ring-violet-500 bg-violet-500/20' : 'bg-white/[0.04] hover:bg-white/[0.08]')}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <input className={inputCls} style={inputStyle} placeholder="Project name *" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} required />
              <textarea className={inputCls} style={inputStyle} placeholder="Description (optional)" rows={2} value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />

              <div className="grid grid-cols-2 gap-2">
                <select className={inputCls} style={{ background: '#1a1030', colorScheme: 'dark' }} value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value as ProjectCategory }))}>
                  <option value="work">💼 Work</option>
                  <option value="study">📚 Study</option>
                  <option value="personal">👤 Personal</option>
                  <option value="design">🎨 Design</option>
                </select>
                <select className={inputCls} style={{ background: '#1a1030', colorScheme: 'dark' }} value={formData.priority} onChange={e => setFormData(f => ({ ...f, priority: e.target.value as ProjectPriority }))}>
                  <option value="high">🔴 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select className={inputCls} style={{ background: '#1a1030', colorScheme: 'dark' }} value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value as ProjectStatus }))}>
                  <option value="pending">⏳ Pending</option>
                  <option value="in-progress">🔄 In Progress</option>
                  <option value="completed">✅ Completed</option>
                </select>
                <input type="date" className={inputCls} style={{ background: 'rgba(255,255,255,0.05)', colorScheme: 'dark' }} value={formData.dueDate} onChange={e => setFormData(f => ({ ...f, dueDate: e.target.value }))} />
              </div>

              {/* Color picker */}
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wide mb-1.5 block">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setFormData(f => ({ ...f, color: c }))}
                      className={cn('w-8 h-8 rounded-full bg-gradient-to-r transition-all', c, formData.color === c ? 'ring-2 ring-white/60 scale-110' : 'opacity-50 hover:opacity-100')} />
                  ))}
                </div>
              </div>

              <textarea className={inputCls} style={inputStyle} placeholder="Notes (optional)" rows={2} value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} />

              <div className="flex gap-2 mt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white/40 border border-white/[0.08] hover:bg-white/[0.04] transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-glow">{editId ? 'Save Changes' : 'Create Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
