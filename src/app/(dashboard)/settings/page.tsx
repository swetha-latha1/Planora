'use client';
import { useEffect, useState } from 'react';
import { cn } from '@/utils';
import { useTheme } from '@/hooks/useTheme';
import { useExport } from '@/hooks/useExport';
import { useData } from '@/context/DataContext';

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-3xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <h2 className="text-sm font-bold text-white/80 uppercase tracking-widest">{title}</h2>
      </div>
      <div className="divide-y divide-white/[0.05]">{children}</div>
    </div>
  );
}

// ── Setting row ───────────────────────────────────────────────────────────────
function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 gap-4 flex-wrap hover:bg-white/[0.02] transition-colors">
      <div>
        <p className="text-sm font-semibold text-white/75">{label}</p>
        {desc && <p className="text-xs text-white/35 mt-0.5">{desc}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={cn('w-12 h-6 rounded-full relative transition-all duration-300', on ? 'bg-accent' : 'bg-white/[0.12]')}
      style={{ boxShadow: on ? '0 0 12px rgba(124,106,247,0.5)' : 'none' }}
    >
      <span className={cn(
        'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300',
        on ? 'translate-x-6' : 'translate-x-0.5',
      )} />
    </button>
  );
}

// ── Theme card ────────────────────────────────────────────────────────────────
function ThemeCard({ mode, active, onClick }: { mode: 'dark' | 'light'; active: boolean; onClick: () => void }) {
  const isDark = mode === 'dark';
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative w-32 rounded-2xl overflow-hidden border-2 transition-all duration-200',
        active ? 'border-accent shadow-[0_0_16px_rgba(124,106,247,0.4)] scale-105' : 'border-white/[0.08] hover:border-white/20',
      )}
    >
      {/* Preview */}
      <div className={cn('h-16 p-2', isDark ? 'bg-[#080818]' : 'bg-[#f1f0ff]')}>
        <div className={cn('h-2 rounded-full w-3/4 mb-1.5', isDark ? 'bg-white/20' : 'bg-violet-300/60')} />
        <div className={cn('h-1.5 rounded-full w-1/2 mb-1', isDark ? 'bg-white/10' : 'bg-violet-200/60')} />
        <div className="flex gap-1 mt-2">
          {[1,2,3].map(i => (
            <div key={i} className={cn('h-4 flex-1 rounded-md', isDark ? 'bg-white/[0.06]' : 'bg-white/80')} />
          ))}
        </div>
      </div>
      <div className={cn('py-2 text-xs font-semibold text-center', isDark ? 'bg-[#0f0c29] text-white/60' : 'bg-white text-violet-700')}>
        {isDark ? '🌙 Dark' : '☀️ Light'}
      </div>
      {active && (
        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-2.5 h-2.5">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
      )}
    </button>
  );
}

// ── Accent color picker ───────────────────────────────────────────────────────
const ACCENTS = [
  { name: 'Violet',  value: '#7c6af7', light: '#a78bfa' },
  { name: 'Cyan',    value: '#06b6d4', light: '#67e8f9' },
  { name: 'Emerald', value: '#10b981', light: '#6ee7b7' },
  { name: 'Rose',    value: '#f43f5e', light: '#fda4af' },
  { name: 'Amber',   value: '#f59e0b', light: '#fcd34d' },
  { name: 'Pink',    value: '#ec4899', light: '#f9a8d4' },
];

function applyAccent(value: string, light: string) {
  const root = document.documentElement;
  root.style.setProperty('--accent',  value);
  root.style.setProperty('--accent2', light);
  root.style.setProperty('--accent3', light);
  // Update btn-glow and other gradient-based elements
  const style = document.getElementById('accent-override') || (() => {
    const s = document.createElement('style');
    s.id = 'accent-override';
    document.head.appendChild(s);
    return s;
  })();
  style.textContent = `
    .btn-glow { background: linear-gradient(135deg, ${value}, ${light}) !important; box-shadow: 0 4px 20px ${value}80 !important; }
    .btn-glow:hover { box-shadow: 0 6px 30px ${value}cc !important; }
    .grad-text { background: linear-gradient(135deg, ${value}, ${light}, #06b6d4) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; background-clip: text !important; }
    .nav-active { background: linear-gradient(135deg, ${value}33, ${light}1a) !important; border-color: ${value}59 !important; color: ${light} !important; }
    .avatar-ring { background: linear-gradient(135deg, ${value}, #06b6d4) !important; }
    .progress-fill { background: linear-gradient(90deg, ${value}, #06b6d4) !important; }
    .notif-dot { background: linear-gradient(135deg, #f43f5e, #f97316) !important; }
  `;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { theme, setTheme, isDark } = useTheme();
  const { habits: { habits } } = useData();
  const { exportCsv, exportPdf } = useExport(habits);

  const [name,         setName]         = useState('');
  const [accent,       setAccent]       = useState('#7c6af7');
  const [notifStreak,  setNotifStreak]  = useState(true);
  const [notifRemind,  setNotifRemind]  = useState(false);
  const [notifWeekly,  setNotifWeekly]  = useState(true);
  const [compactView,  setCompactView]  = useState(false);
  const [animations,   setAnimations]   = useState(true);
  const [saved,        setSaved]        = useState(false);

  useEffect(() => {
    setName(localStorage.getItem('pd_name') ?? '');
    const savedAccent = localStorage.getItem('pd_accent') ?? '#7c6af7';
    const savedLight  = ACCENTS.find(a => a.value === savedAccent)?.light ?? '#a78bfa';
    setAccent(savedAccent);
    applyAccent(savedAccent, savedLight);
    setNotifStreak(localStorage.getItem('pd_notif_streak') !== 'false');
    setNotifRemind(localStorage.getItem('pd_notif_remind') === 'true');
    setNotifWeekly(localStorage.getItem('pd_notif_weekly') !== 'false');
    setCompactView(localStorage.getItem('pd_compact') === 'true');
    setAnimations(localStorage.getItem('pd_animations') !== 'false');
  }, []);

  const saveProfile = () => {
    localStorage.setItem('pd_name', name);
    localStorage.setItem('pd_accent', accent);
    const light = ACCENTS.find(a => a.value === accent)?.light ?? '#a78bfa';
    applyAccent(accent, light);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const clearData = (key: string, label: string) => {
    if (confirm(`Clear all ${label}? This cannot be undone.`)) {
      localStorage.removeItem(key);
      window.location.reload();
    }
  };

  const clearAll = () => {
    if (confirm('Reset ALL app data? This cannot be undone.')) {
      ['pd_habits','pd_tasks','pd_gamification','pd_name','pd_accent'].forEach(k => localStorage.removeItem(k));
      window.location.reload();
    }
  };

  const inputCls = 'px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-sm text-white/80 placeholder-white/25 outline-none focus:border-accent/60 transition-all w-52';

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in pb-10">

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white/90">
          <span className="grad-text">Settings</span>
        </h1>
        <p className="text-white/40 text-sm mt-1">Customise your Planora experience</p>
      </div>

      {/* ── Profile ── */}
      <Section title="Profile" icon="👤">
        <Row label="Display Name" desc="Shown in greetings and reports">
          <div className="flex gap-2">
            <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
            <button onClick={saveProfile}
              className={cn('px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                saved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'btn-glow')}>
              {saved ? '✓ Saved' : 'Save'}
            </button>
          </div>
        </Row>
        <Row label="Accent Color" desc="Primary color used throughout the app">
          <div className="flex gap-2">
            {ACCENTS.map(a => (
              <button key={a.value} onClick={() => {
                setAccent(a.value);
                applyAccent(a.value, a.light);
                localStorage.setItem('pd_accent', a.value);
              }}
                className={cn('w-7 h-7 rounded-full transition-all duration-200', accent === a.value ? 'scale-125 ring-2 ring-white/50 ring-offset-2 ring-offset-transparent' : 'opacity-60 hover:opacity-100 hover:scale-110')}
                style={{ background: a.value }} title={a.name} />
            ))}
          </div>
        </Row>
      </Section>

      {/* ── Appearance ── */}
      <Section title="Appearance" icon="🎨">
        <Row label="Theme" desc="Choose between dark and light mode">
          <div className="flex gap-3">
            <ThemeCard mode="dark"  active={isDark}  onClick={() => setTheme('dark')}  />
            <ThemeCard mode="light" active={!isDark} onClick={() => setTheme('light')} />
          </div>
        </Row>
        <Row label="Compact View" desc="Reduce card padding and spacing">
          <Toggle on={compactView} onChange={v => { setCompactView(v); localStorage.setItem('pd_compact', String(v)); }} />
        </Row>
        <Row label="Animations" desc="Enable transitions and micro-animations">
          <Toggle on={animations} onChange={v => { setAnimations(v); localStorage.setItem('pd_animations', String(v)); }} />
        </Row>
      </Section>

      {/* ── Notifications ── */}
      <Section title="Notifications" icon="🔔">
        <Row label="Streak Alerts" desc="Notify when a streak is at risk of breaking">
          <Toggle on={notifStreak} onChange={v => { setNotifStreak(v); localStorage.setItem('pd_notif_streak', String(v)); }} />
        </Row>
        <Row label="Daily Reminder" desc="Remind you to complete habits each day">
          <Toggle on={notifRemind} onChange={v => { setNotifRemind(v); localStorage.setItem('pd_notif_remind', String(v)); }} />
        </Row>
        <Row label="Weekly Summary" desc="Receive a weekly progress digest">
          <Toggle on={notifWeekly} onChange={v => { setNotifWeekly(v); localStorage.setItem('pd_notif_weekly', String(v)); }} />
        </Row>
      </Section>

      {/* ── Export ── */}
      <Section title="Export Data" icon="📤">
        <Row label="Export as CSV" desc={`Download all ${habits.length} habits as a spreadsheet`}>
          <button onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold glass border border-white/[0.1] hover:border-accent/40 hover:bg-white/[0.08] transition-all text-white/70 hover:text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
            Export CSV
          </button>
        </Row>
        <Row label="Export as PDF" desc="Generate a printable habit report">
          <button onClick={exportPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold glass border border-white/[0.1] hover:border-rose-400/40 hover:bg-rose-500/[0.06] transition-all text-white/70 hover:text-rose-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              <path d="M9 13h1a2 2 0 010 4H9v-4zm5 0h2m-2 4h2"/>
            </svg>
            Export PDF
          </button>
        </Row>
      </Section>

      {/* ── Data Management ── */}
      <Section title="Data Management" icon="🗄️">
        <Row label="Clear Habits" desc="Delete all habit data and history">
          <button onClick={() => clearData('pd_habits', 'habit data')}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25 hover:bg-amber-500/20 transition-all">
            Clear Habits
          </button>
        </Row>
        <Row label="Clear Tasks" desc="Delete all task data">
          <button onClick={() => clearData('pd_tasks', 'task data')}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25 hover:bg-amber-500/20 transition-all">
            Clear Tasks
          </button>
        </Row>
        <Row label="Reset Gamification" desc="Reset XP, level, and all badges">
          <button onClick={() => clearData('pd_gamification', 'gamification data')}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25 hover:bg-amber-500/20 transition-all">
            Reset XP
          </button>
        </Row>
        <Row label="Reset Everything" desc="Wipe all app data and start fresh">
          <button onClick={clearAll}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 transition-all">
            Reset All Data
          </button>
        </Row>
      </Section>

      {/* ── About ── */}
      <Section title="About" icon="ℹ️">
        <Row label="Version" desc="Current app version">
          <span className="text-xs font-mono text-white/40 glass px-3 py-1.5 rounded-xl">v1.0.0</span>
        </Row>
        <Row label="Built with" desc="Technology stack">
          <div className="flex gap-1.5 flex-wrap justify-end">
            {['Next.js 14','TypeScript','Tailwind CSS','Chart.js'].map(t => (
              <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/15 text-accent2 border border-accent/20">{t}</span>
            ))}
          </div>
        </Row>
        <Row label="Planora" desc="A premium productivity dashboard">
          <span className="text-xs text-white/30">Made with ❤️</span>
        </Row>
      </Section>
    </div>
  );
}
