'use client';
import { useState } from 'react';
import { cn } from '@/utils';
import { useHabits } from '@/hooks/useHabits';
import { useTasks } from '@/hooks/useTasks';

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: '#12102a', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="px-6 py-4 flex items-center gap-3" style={{ background: '#16143a', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-lg">{icon}</span>
        <h2 className="text-sm font-bold text-white/80 uppercase tracking-widest">{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  );
}

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    color: '#94a3b8',
    features: ['Up to 3 habits', 'Basic task tracking', '7-day history', 'No analytics'],
    current: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: 'per month',
    color: '#a78bfa',
    features: ['Unlimited habits', 'Full task management', 'Complete analytics', 'AI insights', 'CSV & PDF export', 'Gamification & XP', 'Priority support'],
    current: true,
  },
  {
    name: 'Team',
    price: '$29',
    period: 'per month',
    color: '#22d3ee',
    features: ['Everything in Pro', 'Up to 10 members', 'Shared dashboards', 'Team analytics', 'Admin controls', 'SSO login', 'Dedicated support'],
    current: false,
  },
];

const INVOICES = [
  { id: 'INV-2024-012', date: 'Dec 1, 2024', amount: '$9.00', status: 'Paid' },
  { id: 'INV-2024-011', date: 'Nov 1, 2024', amount: '$9.00', status: 'Paid' },
  { id: 'INV-2024-010', date: 'Oct 1, 2024', amount: '$9.00', status: 'Paid' },
  { id: 'INV-2024-009', date: 'Sep 1, 2024', amount: '$9.00', status: 'Paid' },
];

export default function BillingPage() {
  const { habits } = useHabits();
  const { tasks }  = useTasks();
  const [billing,  setBilling]  = useState('monthly');
  const [cardOpen, setCardOpen] = useState(false);

  const usageItems = [
    { label: 'Habits',        used: habits.length, max: 'Unlimited', pct: Math.min(100, (habits.length / 10) * 100), color: '#a78bfa' },
    { label: 'Tasks',         used: tasks.length,  max: 'Unlimited', pct: Math.min(100, (tasks.length / 50) * 100),  color: '#22d3ee' },
    { label: 'Data History',  used: '365 days',    max: '365 days',  pct: 100,                                        color: '#34d399' },
    { label: 'Exports',       used: 'Unlimited',   max: 'Unlimited', pct: 100,                                        color: '#fbbf24' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in pb-10">

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white/90">
          Billing & <span className="grad-text">Plans</span>
        </h1>
        <p className="text-white/40 text-sm mt-1">Manage your subscription and payment details</p>
      </div>

      {/* ── Current plan banner ── */}
      <div className="rounded-3xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,rgba(124,106,247,0.2),rgba(167,139,250,0.08))', border: '1px solid rgba(124,106,247,0.3)' }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(124,106,247,0.15)', transform: 'translate(30%,-30%)' }} />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">⭐</span>
              <h2 className="text-xl font-extrabold text-white/90">Pro Plan</h2>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active</span>
            </div>
            <p className="text-white/50 text-sm">$9.00 / month · Renews January 1, 2025</p>
            <p className="text-white/30 text-xs mt-1">Next billing date: Jan 1, 2025</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white/60 border border-white/[0.12] hover:bg-white/[0.06] transition-all"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              Cancel Plan
            </button>
            <button className="btn-glow px-4 py-2 rounded-xl text-sm font-semibold">
              Upgrade to Team
            </button>
          </div>
        </div>
      </div>

      {/* ── Usage ── */}
      <Section title="Current Usage" icon="📊">
        <div className="p-6 space-y-4">
          {usageItems.map(u => (
            <div key={u.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-white/65 font-medium">{u.label}</span>
                <span className="text-xs text-white/40 font-mono">
                  {typeof u.used === 'number' ? u.used : u.used} / {u.max}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${u.pct}%`, background: u.color, boxShadow: `0 0 8px ${u.color}60` }} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Plans ── */}
      <Section title="Available Plans" icon="💎">
        <div className="p-6 space-y-4">
          {/* Billing toggle */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-sm text-white/50">Billing:</span>
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              {['monthly','yearly'].map(b => (
                <button key={b} onClick={() => setBilling(b)}
                  className={cn('px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all',
                    billing === b ? 'bg-accent/25 text-accent2 border border-accent/30' : 'text-white/35 hover:text-white/60')}>
                  {b}
                  {b === 'yearly' && <span className="ml-1.5 text-emerald-400">-20%</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {PLANS.map(plan => (
              <div key={plan.name}
                className={cn('rounded-2xl p-5 flex flex-col gap-4 relative transition-all duration-200', plan.current && 'scale-[1.02]')}
                style={{
                  background: plan.current ? `linear-gradient(135deg,${plan.color}18,${plan.color}08)` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${plan.current ? plan.color + '40' : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: plan.current ? `0 0 24px ${plan.color}20` : 'none',
                }}>
                {plan.current && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${plan.color}25`, color: plan.color, border: `1px solid ${plan.color}40` }}>
                    Current
                  </span>
                )}
                <div>
                  <p className="text-sm font-bold text-white/70 mb-1">{plan.name}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-extrabold" style={{ color: plan.color }}>
                      {billing === 'yearly' && plan.price !== '$0'
                        ? `$${Math.round(parseInt(plan.price.slice(1)) * 0.8)}`
                        : plan.price}
                    </span>
                    <span className="text-xs text-white/35 mb-1">/{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-2 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-white/55">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 shrink-0" style={{ color: plan.color }}>
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={cn('w-full py-2.5 rounded-xl text-sm font-semibold transition-all', plan.current ? 'cursor-default opacity-50' : 'hover:opacity-90')}
                  style={plan.current
                    ? { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }
                    : { background: `linear-gradient(135deg,${plan.color},${plan.color}bb)`, color: '#fff', boxShadow: `0 4px 16px ${plan.color}40` }
                  }
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : `Switch to ${plan.name}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Payment method ── */}
      <Section title="Payment Method" icon="💳">
        <div className="p-6 space-y-4">
          {/* Card display */}
          <div className="rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4"
            style={{ background: 'linear-gradient(135deg,rgba(124,106,247,0.15),rgba(6,182,212,0.08))', border: '1px solid rgba(124,106,247,0.2)' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 rounded-lg flex items-center justify-center text-lg font-bold"
                style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)', border: '1px solid rgba(255,255,255,0.1)' }}>
                💳
              </div>
              <div>
                <p className="text-sm font-semibold text-white/80">•••• •••• •••• 4242</p>
                <p className="text-xs text-white/35 mt-0.5">Visa · Expires 12/26</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setCardOpen(v => !v)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white/60 border border-white/[0.1] hover:bg-white/[0.06] transition-all"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                Update
              </button>
              <button className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 border border-rose-500/25 hover:bg-rose-500/10 transition-all">
                Remove
              </button>
            </div>
          </div>

          {/* Add/update card form */}
          {cardOpen && (
            <div className="rounded-2xl p-5 space-y-3 animate-fade-in"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-sm font-semibold text-white/70 mb-3">Update Card Details</p>
              <div className="grid grid-cols-1 gap-3">
                <input placeholder="Card number" className="w-full px-4 py-2.5 rounded-xl text-sm text-white/70 placeholder-white/25 outline-none border border-white/[0.1] focus:border-accent/50 transition-all" style={{ background: '#1a1840' }} />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="MM / YY" className="px-4 py-2.5 rounded-xl text-sm text-white/70 placeholder-white/25 outline-none border border-white/[0.1] focus:border-accent/50 transition-all" style={{ background: '#1a1840' }} />
                  <input placeholder="CVC" className="px-4 py-2.5 rounded-xl text-sm text-white/70 placeholder-white/25 outline-none border border-white/[0.1] focus:border-accent/50 transition-all" style={{ background: '#1a1840' }} />
                </div>
                <input placeholder="Name on card" className="w-full px-4 py-2.5 rounded-xl text-sm text-white/70 placeholder-white/25 outline-none border border-white/[0.1] focus:border-accent/50 transition-all" style={{ background: '#1a1840' }} />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setCardOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white/40 border border-white/[0.08] hover:bg-white/[0.04] transition-all">Cancel</button>
                <button onClick={() => setCardOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-glow">Save Card</button>
              </div>
            </div>
          )}

          <button className="flex items-center gap-2 text-sm text-accent2 hover:text-white transition-colors font-medium">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add new payment method
          </button>
        </div>
      </Section>

      {/* ── Invoice history ── */}
      <Section title="Invoice History" icon="🧾">
        <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          {INVOICES.map(inv => (
            <div key={inv.id} className="flex items-center justify-between px-6 py-4 flex-wrap gap-3 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                  style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  📄
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/75">{inv.id}</p>
                  <p className="text-xs text-white/35 mt-0.5">{inv.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-white/70">{inv.amount}</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  {inv.status}
                </span>
                <button className="text-xs text-accent2 hover:text-white transition-colors font-medium">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-3 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button className="text-xs text-white/30 hover:text-accent2 transition-colors">View all invoices →</button>
        </div>
      </Section>
    </div>
  );
}
