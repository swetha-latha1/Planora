'use client';
import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { useUser } from '@/context/UserContext';
import { getTaskStats, getTaskChartData, formatDate } from '@/utils';
import TaskCompletionChart from '@/charts/TaskCompletionChart';
import SummaryCard from '@/components/ui/SummaryCard';
import { cn } from '@/utils';
import TaskCompleteEffect from '@/components/ui/TaskCompleteEffect';
import Link from 'next/link';
import type { Priority, Category } from '@/types';

export default function DashboardPage() {
  const user = useUser();
  const {
    tasks: { tasks, addTask, toggleTask },
    habits: { habits },
    projects: { projects },
    gamification: { profile, levelInfo },
  } = useData();

  const [showEffect, setShowEffect] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('work');
  const [dueDate, setDueDate] = useState('');
  type Period = 'W' | 'M' | 'Y';
  const [period, setPeriod] = useState<Period>('W');

  const handleToggle = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) setShowEffect(true);
    toggleTask(id);
  };

  const submitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({ title, priority, category, dueDate: dueDate || undefined });
    setTitle(''); setPriority('medium'); setCategory('work'); setDueDate('');
    setShowForm(false);
  };

  // ── Live KPI data ──────────────────────────────────────────────────────────
  const { total, completed, overdue, completionRate } = getTaskStats(tasks);
  const chartData = useMemo(() => getTaskChartData(tasks, period), [tasks, period]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayDone     = tasks.filter(t => t.completed && t.createdAt?.startsWith(todayStr)).length;
  const activeHabits  = habits.length;
  const longestStreak = habits.reduce((m, h) => Math.max(m, h.streak), 0);
  const habitsDoneToday = habits.filter(h => h.completedDates.includes(todayStr)).length;

  // Spark data from last 7 days task completions
  const spark = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const ds = d.toISOString().slice(0, 10);
      return { v: tasks.filter(t => t.completed && t.createdAt?.startsWith(ds)).length };
    });
  }, [tasks]);

  // Projects stats
  const projectStats = useMemo(() => ({
    total: projects.length,
    completed: projects.filter(p => p.status === 'completed').length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
  }), [projects]);

  const recentProjects = projects.slice(0, 3);
  const recent = tasks.slice(0, 5);

  const PERIOD_LABEL: Record<Period, string> = { W: 'Last 7 days', M: 'Last 30 days', Y: 'Last 12 months' };
  const periodTotal     = chartData[0].value;
  const periodCompleted = chartData[1].value;
  const periodOverdue   = chartData[2].value;
  const periodPending   = chartData[3].value;

  function getProjectProgress(p: { subtasks: { done: boolean }[] }) {
    if (!p.subtasks.length) return 0;
    return Math.round((p.subtasks.filter(s => s.done).length / p.subtasks.length) * 100);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">

      {showEffect && <TaskCompleteEffect onDone={() => setShowEffect(false)} />}

      {/* New Task Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md rounded-3xl p-6 border border-white/[0.10]" style={{ background: '#1a1030' }} onClick={e => e.stopPropagation()}>
            <h2 className="text-base font-bold text-white/90 mb-4">New Task</h2>
            <form onSubmit={submitTask} className="flex flex-col gap-3">
              <input autoFocus className="w-full px-4 py-2.5 rounded-xl text-sm text-white/80 placeholder-white/25 outline-none border border-white/[0.1] focus:border-accent/60 transition-all" style={{ background: 'rgba(255,255,255,0.05)' }} placeholder="Task title *" value={title} onChange={e => setTitle(e.target.value)} required />
              <div className="grid grid-cols-2 gap-2">
                <select className="px-3 py-2.5 rounded-xl text-sm text-white/70 outline-none border border-white/[0.1] focus:border-accent/60 transition-all cursor-pointer" style={{ background: '#1a1030' }} value={priority} onChange={e => setPriority(e.target.value as Priority)}>
                  <option value="high">🔴 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
                <select className="px-3 py-2.5 rounded-xl text-sm text-white/70 outline-none border border-white/[0.1] focus:border-accent/60 transition-all cursor-pointer" style={{ background: '#1a1030' }} value={category} onChange={e => setCategory(e.target.value as Category)}>
                  <option value="work">💼 Work</option>
                  <option value="personal">👤 Personal</option>
                  <option value="health">❤️ Health</option>
                  <option value="other">📌 Other</option>
                </select>
              </div>
              <input type="date" className="w-full px-4 py-2.5 rounded-xl text-sm text-white/70 outline-none border border-white/[0.1] focus:border-accent/60 transition-all" style={{ background: 'rgba(255,255,255,0.05)', colorScheme: 'dark' }} value={dueDate} onChange={e => setDueDate(e.target.value)} />
              <div className="flex gap-2 mt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white/40 border border-white/[0.08] hover:bg-white/[0.04] transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-glow">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white/90">
            Good morning, <span className="grad-text">{user?.name ?? ''}</span> 👋
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            {' · '}You have <span className="text-accent2 font-medium">{total - completed} tasks</span> remaining today
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-glow px-5 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-2 shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>
          New Task
        </button>
      </div>

      {/* ── KPI Cards — all live ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 md:gap-4">
        <SummaryCard label="Productivity Score" value={completionRate} suffix="/100" delay={0}
          trend={{ value: completionRate, label: '% task completion' }} spark={spark}
          gradient="bg-gradient-to-br from-violet-600/20 to-accent2/10" glowColor="rgba(124,106,247,0.4)"
          iconBg="bg-gradient-to-br from-violet-500 to-accent2"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinejoin="round" /></svg>} />

        <SummaryCard label="Active Habits" value={activeHabits} delay={100}
          trend={{ value: habitsDoneToday, label: ` done today` }} spark={spark}
          gradient="bg-gradient-to-br from-cyan-500/20 to-accent3/10" glowColor="rgba(6,182,212,0.4)"
          iconBg="bg-gradient-to-br from-cyan-400 to-accent3"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" /><path d="M12 6v6l4 2" /></svg>} />

        <SummaryCard label="Longest Streak" value={longestStreak} suffix=" days" delay={200}
          trend={{ value: longestStreak, label: ' day streak' }} spark={spark}
          gradient="bg-gradient-to-br from-orange-500/20 to-rose-500/10" glowColor="rgba(249,115,22,0.4)"
          iconBg="bg-gradient-to-br from-orange-400 to-rose-500"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" /></svg>} />

        <SummaryCard label="Projects" value={projectStats.total} suffix={` (${projectStats.inProgress} active)`} delay={300}
          trend={{ value: projectStats.completed, label: ' completed' }} spark={spark}
          gradient="bg-gradient-to-br from-emerald-500/20 to-teal-500/10" glowColor="rgba(16,185,129,0.4)"
          iconBg="bg-gradient-to-br from-emerald-400 to-teal-500"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>} />

        <SummaryCard label="Tasks Done Today" value={todayDone} delay={400}
          trend={{ value: total - completed, label: ' remaining' }} spark={spark}
          gradient="bg-gradient-to-br from-pink-500/20 to-rose-500/10" glowColor="rgba(236,72,153,0.4)"
          iconBg="bg-gradient-to-br from-pink-500 to-rose-500"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4" /></svg>} />
      </div>

      {/* ── Task Overview + Completion Ring ── */}
      <div className="grid lg:grid-cols-3 gap-4 md:gap-5">
        <div className="lg:col-span-2 glass rounded-3xl p-5">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
            <div>
              <h2 className="font-semibold text-white/80">Task Overview</h2>
              <p className="text-xs text-white/30 mt-0.5">{PERIOD_LABEL[period]}</p>
            </div>
            <div className="flex gap-1">
              {(['W', 'M', 'Y'] as Period[]).map(t => (
                <button key={t} onClick={() => setPeriod(t)} className={cn('px-3 py-1 rounded-lg text-xs font-medium transition-all', period === t ? 'bg-accent/20 text-accent2 border border-accent/30' : 'text-white/30 hover:text-white/60 border border-transparent')}>{t}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
            {[
              { label: 'Total',     value: periodTotal,     color: '#7c6af7', bg: 'rgba(124,106,247,0.12)', border: 'rgba(124,106,247,0.25)' },
              { label: 'Completed', value: periodCompleted, color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)'  },
              { label: 'Overdue',   value: periodOverdue,   color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',   border: 'rgba(244,63,94,0.25)'   },
              { label: 'Pending',   value: periodPending,   color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.25)'   },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <span className="text-2xl font-extrabold tabular-nums leading-none" style={{ color: s.color }}>{s.value}</span>
                <span className="text-[10px] text-white/40 font-medium mt-1 uppercase tracking-wide">{s.label}</span>
              </div>
            ))}
          </div>
          <TaskCompletionChart data={chartData} />
        </div>

        <div className="glass rounded-3xl p-5 flex flex-col items-center justify-center gap-4">
          <div>
            <h2 className="font-semibold text-white/80 text-center">Completion</h2>
            <p className="text-xs text-white/30 mt-0.5 text-center">Overall progress</p>
          </div>
          <CompletionRing percent={completionRate} />
          <div className="w-full space-y-2">
            {[
              { label: 'Work',     val: calcCatPct(tasks, 'work'),     color: 'from-accent to-accent2'      },
              { label: 'Personal', val: calcCatPct(tasks, 'personal'), color: 'from-accent3 to-accent'      },
              { label: 'Health',   val: calcCatPct(tasks, 'health'),   color: 'from-emerald-500 to-accent3' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-xs text-white/40 w-14">{item.label}</span>
                <div className="flex-1 h-1.5 progress-track">
                  <div className={`h-full rounded-full bg-gradient-to-r ${item.color}`} style={{ width: `${item.val}%` }} />
                </div>
                <span className="text-xs text-white/40 w-8 text-right">{item.val}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Projects + Recent Tasks + Activity ── */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">

        {/* Projects — live */}
        <div className="glass rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white/80">Projects</h2>
            <Link href="/projects" className="text-xs text-accent2 hover:text-white transition-colors">View all →</Link>
          </div>

          {recentProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
              <div className="text-3xl">📁</div>
              <p className="text-sm text-white/40">No projects yet</p>
            </div>
          ) : (
            <div className="space-y-3 mb-3">
              {recentProjects.map(p => {
                const pct = getProjectProgress(p);
                return (
                  <div key={p.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-base bg-gradient-to-br ${p.color}`}>{p.icon}</div>
                        <span className="text-sm text-white/70 font-medium truncate max-w-[120px]">{p.name}</span>
                      </div>
                      <span className="text-xs text-white/30">{p.subtasks.length} tasks</span>
                    </div>
                    <div className="h-1.5 progress-track">
                      <div className={`h-full rounded-full bg-gradient-to-r ${p.color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-white/25 mt-1">{pct}% complete · {p.status}</p>
                  </div>
                );
              })}
            </div>
          )}

          <Link href="/projects" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold text-white/60 hover:text-white border border-dashed border-white/[0.12] hover:border-accent/40 hover:bg-accent/5 transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>
            {recentProjects.length === 0 ? 'Add New Project' : 'Manage Projects'}
          </Link>
        </div>

        {/* Recent Tasks — live with See all link */}
        <div className="glass rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white/80">Recent Tasks</h2>
            <Link href="/tasks" className="text-xs text-accent2 hover:text-white transition-colors">See all →</Link>
          </div>
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4 text-center px-4">
              <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center text-3xl">📭</div>
              <div>
                <p className="text-sm font-semibold text-white/50">No tasks yet</p>
                <p className="text-xs text-white/30 mt-1">Start by adding your first task</p>
              </div>
              <button onClick={() => setShowForm(true)} className="btn-glow w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>
                Add your first task
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map(t => (
                <div key={t.id} onClick={() => handleToggle(t.id)} className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-white/[0.04] transition-colors group cursor-pointer">
                  <div className={cn('w-2 h-2 rounded-full shrink-0', t.priority === 'high' ? 'bg-rose-400' : t.priority === 'medium' ? 'bg-yellow-400' : 'bg-emerald-400')} />
                  <span className={cn('text-sm flex-1 truncate', t.completed ? 'line-through text-white/25' : 'text-white/70 group-hover:text-white/90')}>{t.title}</span>
                  {t.dueDate && <span className="text-[10px] text-white/25 shrink-0">{formatDate(t.dueDate)}</span>}
                </div>
              ))}
              <Link href="/tasks" className="block text-center text-xs text-accent2 hover:text-white transition-colors pt-2">
                View all {tasks.length} tasks →
              </Link>
            </div>
          )}
        </div>

        {/* Activity feed — live */}
        <div className="glass rounded-3xl p-5 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white/80">Activity</h2>
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse-slow" />
          </div>
          {tasks.length === 0 && habits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
              <div className="text-3xl">🌱</div>
              <p className="text-sm text-white/40">No activity yet</p>
              <p className="text-xs text-white/25">Start adding tasks & habits to see your activity here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                ...tasks.slice(0, 3).map(t => ({
                  key: `t-${t.id}`,
                  icon: t.completed ? '✅' : '📌',
                  text: t.completed ? `Completed "${t.title}"` : `Added "${t.title}"`,
                  date: t.createdAt,
                  color: t.completed ? 'bg-emerald-400' : t.priority === 'high' ? 'bg-rose-400' : 'bg-accent2',
                })),
                ...habits.slice(0, 2).map(h => ({
                  key: `h-${h.id}`,
                  icon: h.icon,
                  text: `Habit: ${h.name} · ${h.streak}d streak`,
                  date: h.createdAt,
                  color: 'bg-violet-400',
                })),
              ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((item, i, arr) => (
                <div key={item.key} className="flex gap-3 group">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${item.color}`} />
                    {i < arr.length - 1 && <div className="w-px flex-1 bg-white/[0.06]" />}
                  </div>
                  <div className="pb-3 flex-1 min-w-0">
                    <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors leading-relaxed">
                      {item.icon} {item.text}
                    </p>
                    <p className="text-[10px] text-white/25 mt-0.5">{item.date ? new Date(item.date).toLocaleDateString() : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function calcCatPct(tasks: { completed: boolean; category: string }[], cat: string) {
  const total = tasks.filter(t => t.category === cat).length;
  if (!total) return 0;
  return Math.round(tasks.filter(t => t.completed && t.category === cat).length / total * 100);
}

function CompletionRing({ percent }: { percent: number }) {
  const size = 130, stroke = 10, r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size}>
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c6af7" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#ringGrad)" strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - percent / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
      <text x="50%" y="46%" dominantBaseline="middle" textAnchor="middle" fontSize="22" fontWeight="700" fill="white" opacity="0.9">{percent}%</text>
      <text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle" fontSize="9" fill="white" opacity="0.3">COMPLETE</text>
    </svg>
  );
}
