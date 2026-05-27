'use client';
import { useState } from 'react';
import { cn } from '@/utils';

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = 'guide' | 'settings' | 'contact';

// ── Shared card ───────────────────────────────────────────────────────────────
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-3xl overflow-hidden', className)}
      style={{ background: '#12102a', border: '1px solid rgba(255,255,255,0.08)' }}>
      {children}
    </div>
  );
}

function CardHeader({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div className="px-6 py-4 flex items-center gap-3"
      style={{ background: '#16143a', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span className="text-xl">{icon}</span>
      <div>
        <h2 className="text-sm font-bold text-white/85 uppercase tracking-widest">{title}</h2>
        {sub && <p className="text-xs text-white/35 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Step card ─────────────────────────────────────────────────────────────────
function Step({ num, title, desc, icon }: { num: number; title: string; desc: string; icon: string }) {
  return (
    <div className="flex gap-4 p-5 rounded-2xl hover:bg-white/[0.03] transition-colors group"
      style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-extrabold text-sm"
        style={{ background: 'linear-gradient(135deg,rgba(124,106,247,0.3),rgba(6,182,212,0.15))', color: '#a78bfa', border: '1px solid rgba(124,106,247,0.3)' }}>
        {num}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">{icon}</span>
          <h3 className="text-sm font-bold text-white/80 group-hover:text-white/95 transition-colors">{title}</h3>
        </div>
        <p className="text-xs text-white/45 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ── FAQ item ──────────────────────────────────────────────────────────────────
function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-b-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.02] transition-colors group"
      >
        <span className="text-sm font-semibold text-white/70 group-hover:text-white/90 transition-colors pr-4">{q}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          className={cn('w-4 h-4 text-white/30 shrink-0 transition-transform duration-200', open && 'rotate-180')}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      {open && (
        <div className="px-6 pb-4 animate-fade-in">
          <p className="text-xs text-white/50 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

// ── Settings guide item ───────────────────────────────────────────────────────
function SettingItem({ icon, title, desc, path }: { icon: string; title: string; desc: string; path: string }) {
  return (
    <div className="flex items-start gap-4 p-5 rounded-2xl hover:bg-white/[0.03] transition-colors"
      style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-xl"
        style={{ background: 'rgba(124,106,247,0.12)', border: '1px solid rgba(124,106,247,0.2)' }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="text-sm font-bold text-white/80">{title}</h3>
          <span className="text-[10px] font-mono text-white/30 px-2 py-0.5 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {path}
          </span>
        </div>
        <p className="text-xs text-white/45 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ── Contact form ──────────────────────────────────────────────────────────────
function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [type, setType] = useState('general');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl text-sm text-white/80 placeholder-white/25 outline-none border border-white/[0.1] focus:border-accent/50 transition-all'

  const TYPES = [
    { value: 'general',  label: '💬 General'  },
    { value: 'bug',      label: '🐛 Bug Report'},
    { value: 'feature',  label: '✨ Feature'   },
    { value: 'billing',  label: '💳 Billing'   },
  ];

  return (
    <form onSubmit={submit} className="p-6 space-y-4">
      {/* Type selector */}
      <div>
        <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-2">Topic</p>
        <div className="flex gap-2 flex-wrap">
          {TYPES.map(t => (
            <button key={t.value} type="button" onClick={() => setType(t.value)}
              className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
                type === t.value
                  ? 'bg-accent/25 text-accent2 border border-accent/35'
                  : 'text-white/40 border border-white/[0.08] hover:text-white/65 hover:border-white/20'
              )}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-1.5">Name *</p>
          <input className={inputCls} style={{ background: '#1a1840' }}
            placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-1.5">Email *</p>
          <input className={inputCls} style={{ background: '#1a1840' }}
            placeholder="you@example.com" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        </div>
      </div>

      <div>
        <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-1.5">Subject</p>
        <input className={inputCls} style={{ background: '#1a1840' }}
          placeholder="Brief summary of your issue" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
      </div>

      <div>
        <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-1.5">Message *</p>
        <textarea className={cn(inputCls, 'resize-none h-32 leading-relaxed')} style={{ background: '#1a1840' }}
          placeholder="Describe your issue or question in detail…"
          value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
        <p className="text-xs text-white/30">We typically respond within 24 hours.</p>
        <button type="submit"
          className={cn('px-6 py-2.5 rounded-xl text-sm font-semibold transition-all',
            sent ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'btn-glow')}>
          {sent ? '✓ Message Sent!' : 'Send Message'}
        </button>
      </div>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HelpPage() {
  const [tab, setTab] = useState<Tab>('guide');

  const TABS: { value: Tab; label: string; icon: string }[] = [
    { value: 'guide',    label: 'How to Use',  icon: '📖' },
    { value: 'settings', label: 'Settings',    icon: '⚙️' },
    { value: 'contact',  label: 'Contact Us',  icon: '✉️' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in pb-10">

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white/90">
          Help <span className="grad-text">Center</span>
        </h1>
        <p className="text-white/40 text-sm mt-1">Everything you need to get the most out of FocusOS</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-2xl w-fit" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {TABS.map(t => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={cn('flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
              tab === t.value
                ? 'bg-accent/25 text-accent2 border border-accent/35 shadow-[0_0_12px_rgba(124,106,247,0.2)]'
                : 'text-white/40 hover:text-white/70'
            )}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: How to Use ── */}
      {tab === 'guide' && (
        <div className="space-y-4 animate-fade-in">
          <Card>
            <CardHeader icon="🚀" title="Getting Started" sub="Follow these steps to set up your productivity system" />
            <div className="p-5 space-y-3">
              <Step num={1} icon="🎯" title="Create Your First Habit"
                desc="Go to Habits in the sidebar. Click the + button (bottom right). Fill in the habit name, category, frequency, and target days per week. Hit Create Habit." />
              <Step num={2} icon="✅" title="Add Tasks"
                desc="Navigate to Tasks. Click New Task to add work items with priority (high/medium/low), category, and due date. Tasks appear on your Dashboard overview." />
              <Step num={3} icon="🔥" title="Complete Habits Daily"
                desc="Visit the Habits page each day and click Mark Complete on each habit. Your streak counter increases automatically and XP is awarded." />
              <Step num={4} icon="⏱" title="Use the Focus Timer"
                desc="Open Focus Timer for Pomodoro sessions — 25 min work, 5 min break. Completing sessions builds your focus streak and earns bonus XP." />
              <Step num={5} icon="📊" title="Track Your Progress"
                desc="The Analytics page shows your productivity trend, weekly activity, habit completion rates, and year-over-year comparisons." />
              <Step num={6} icon="🎮" title="Earn Badges & Level Up"
                desc="Complete habits consistently to earn XP, unlock achievement badges, and level up from Beginner to Transcendent. Check your progress in the Habits page." />
            </div>
          </Card>

          <Card>
            <CardHeader icon="💡" title="Tips & Tricks" sub="Get the most out of FocusOS" />
            <div className="p-5 space-y-3">
              {[
                { icon: '📅', tip: 'Check the Calendar view to see which days have tasks due — click any date to see its tasks.' },
                { icon: '🔍', tip: 'Use the search bar on the Habits page to quickly find a specific habit by name or category.' },
                { icon: '↕️', tip: 'Drag and drop habit cards to reorder them — your preferred order is saved automatically.' },
                { icon: '📤', tip: 'Export your habit data as CSV or PDF from Settings → Export Data for offline records.' },
                { icon: '🌙', tip: 'Toggle dark/light mode from the navbar sun/moon icon or from Settings → Appearance.' },
                { icon: '🏆', tip: 'The Gamification panel on the Habits page shows your full badge collection and milestone path.' },
              ].map((t, i) => (
                <div key={i} className="flex gap-3 items-start px-4 py-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                  <span className="text-lg shrink-0">{t.icon}</span>
                  <p className="text-xs text-white/55 leading-relaxed">{t.tip}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader icon="❓" title="Frequently Asked Questions" />
            <div>
              <FAQ q="How is my streak calculated?"
                a="A streak counts consecutive days where you completed a habit. If you miss a day, the streak resets to 0. Streaks are recalculated every time you open the app, so they stay accurate even if you haven't visited in a while." />
              <FAQ q="What happens to my data if I clear it?"
                a="Clearing data from Settings → Data Management permanently removes it from your browser's localStorage. There is no cloud backup, so export your data as CSV or PDF before clearing." />
              <FAQ q="How do I earn XP?"
                a="You earn 10 XP per habit completion, 50 XP for a perfect day (all habits done), 75 XP for a 7-day streak, 100 XP for 14 days, 200 XP for 30 days, and bonus XP when you unlock badges." />
              <FAQ q="Can I use FocusOS on mobile?"
                a="Yes — FocusOS is fully responsive. On mobile, use the bottom navigation bar to switch between pages. All features work on touch devices." />
              <FAQ q="How do I change my accent color?"
                a="Go to Settings → Profile → Accent Color and pick from 6 color options. The change applies instantly across the entire app." />
            </div>
          </Card>
        </div>
      )}

      {/* ── Tab: Settings Guide ── */}
      {tab === 'settings' && (
        <div className="space-y-4 animate-fade-in">
          <Card>
            <CardHeader icon="⚙️" title="Settings Overview" sub="A guide to every setting in FocusOS" />
            <div className="p-5 space-y-3">
              <SettingItem icon="👤" title="Profile" path="/profile"
                desc="Update your display name, email, bio, avatar emoji, and timezone. Your name appears in the dashboard greeting and exported reports." />
              <SettingItem icon="🎨" title="Appearance" path="/settings → Appearance"
                desc="Switch between Dark and Light mode. Toggle Compact View to reduce card spacing. Disable Animations if you prefer a static interface." />
              <SettingItem icon="🎨" title="Accent Color" path="/settings → Profile"
                desc="Choose from 6 accent colors (Violet, Cyan, Emerald, Rose, Amber, Pink). The selected color is applied to buttons, active nav items, and progress bars." />
              <SettingItem icon="🔔" title="Notifications" path="/settings → Notifications"
                desc="Enable Streak Alerts to be reminded when a streak is at risk. Turn on Daily Reminder for a nudge to complete habits. Weekly Summary sends a digest of your progress." />
              <SettingItem icon="📤" title="Export Data" path="/settings → Export"
                desc="Download all your habits as a CSV spreadsheet for use in Excel or Google Sheets. Generate a formatted PDF report for printing or sharing." />
              <SettingItem icon="🗄️" title="Data Management" path="/settings → Data"
                desc="Clear habits, tasks, or gamification data individually. Use Reset Everything to wipe all app data and start fresh. Always export first — this cannot be undone." />
              <SettingItem icon="💳" title="Billing" path="/billing"
                desc="View your current plan, usage limits, and billing cycle. Upgrade to Team for multi-user access. Update your payment card or download past invoices." />
              <SettingItem icon="🔑" title="Change Password" path="/profile → Password"
                desc="Update your account password. Must be at least 8 characters. Enter your current password to confirm the change." />
            </div>
          </Card>

          <Card>
            <CardHeader icon="🔒" title="Privacy & Data" sub="How your data is stored" />
            <div className="p-5 space-y-3">
              {[
                { icon: '💾', title: 'Local Storage', desc: 'All your habits, tasks, and settings are stored in your browser\'s localStorage. No data is sent to any server.' },
                { icon: '🔐', title: 'No Account Required', desc: 'FocusOS works entirely in your browser. Your data stays on your device unless you choose to export it.' },
                { icon: '📤', title: 'Export Anytime', desc: 'Use Settings → Export to download your data as CSV or PDF at any time. Keep a backup before clearing data.' },
                { icon: '🗑️', title: 'Right to Delete', desc: 'Use Settings → Data Management → Reset Everything to permanently delete all stored data from your browser.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start px-4 py-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white/75 mb-0.5">{item.title}</p>
                    <p className="text-xs text-white/45 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Tab: Contact ── */}
      {tab === 'contact' && (
        <div className="space-y-4 animate-fade-in">
          {/* Contact channels */}
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { icon: '✉️', label: 'Email Support', value: 'support@focusos.app', sub: 'Response within 24h', color: '#a78bfa' },
              { icon: '💬', label: 'Live Chat',     value: 'Available 9am–6pm',   sub: 'Mon–Fri IST',       color: '#22d3ee' },
              { icon: '🐦', label: 'Twitter / X',   value: '@focusos_app',        sub: 'Quick questions',   color: '#34d399' },
            ].map(c => (
              <div key={c.label} className="flex flex-col items-center text-center gap-2 p-5 rounded-2xl hover:bg-white/[0.03] transition-colors"
                style={{ background: '#12102a', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-3xl">{c.icon}</span>
                <p className="text-xs font-bold text-white/50 uppercase tracking-widest">{c.label}</p>
                <p className="text-sm font-semibold" style={{ color: c.color }}>{c.value}</p>
                <p className="text-[10px] text-white/30">{c.sub}</p>
              </div>
            ))}
          </div>

          {/* Contact form */}
          <Card>
            <CardHeader icon="📬" title="Send Us a Message" sub="Fill in the form and we'll get back to you" />
            <ContactForm />
          </Card>

          {/* Office info */}
          <Card>
            <CardHeader icon="🏢" title="Company Info" />
            <div className="p-6 grid sm:grid-cols-2 gap-4">
              {[
                { label: 'Company',  value: 'FocusOS Technologies Pvt. Ltd.' },
                { label: 'Location', value: 'Hyderabad, Telangana, India' },
                { label: 'Email',    value: 'hello@focusos.app' },
                { label: 'Support',  value: 'support@focusos.app' },
                { label: 'Hours',    value: 'Mon–Fri, 9:00 AM – 6:00 PM IST' },
                { label: 'Version',  value: 'FocusOS v1.0.0' },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-0.5">{item.label}</p>
                  <p className="text-sm text-white/65 font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
