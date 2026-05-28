'use client';
import { useEffect, useState } from 'react';
import { cn } from '@/utils';
import { useData } from '@/context/DataContext';
import { useUser, useUserActions } from '@/context/UserContext';
import { getLevelInfo } from '@/hooks/useGamification';

const AVATARS = ['🧑💻','👩💼','🧑🎨','👨🚀','👩🔬','🧑🏫','👩💻','🧑🎤'];

function StatPill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-5 py-4 rounded-2xl glass">
      <span className="text-2xl font-extrabold tabular-nums" style={{ color }}>{value}</span>
      <span className="text-[10px] text-white/35 uppercase tracking-widest font-semibold">{label}</span>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: '#12102a', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="px-6 py-4 flex items-center gap-3" style={{ background: '#16143a', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-lg">{icon}</span>
        <h2 className="text-sm font-bold text-white/80 uppercase tracking-widest">{title}</h2>
      </div>
      <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>{children}</div>
    </div>
  );
}

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 gap-4 flex-wrap">
      <div>
        <p className="text-sm font-semibold text-white/75">{label}</p>
        {desc && <p className="text-xs text-white/35 mt-0.5">{desc}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

const inputCls = 'px-4 py-2.5 rounded-xl text-sm text-white/80 placeholder-white/25 outline-none transition-all w-56 focus:ring-1 focus:ring-accent/50 border border-white/[0.1] focus:border-accent/60';

export default function ProfilePage() {
  const user = useUser();
  const { updateProfile, updatePassword } = useUserActions();
  const { habits: { habits }, tasks: { tasks }, gamification: { profile } } = useData();
  const levelInfo = getLevelInfo(profile.xp);

  // Form state — seeded from live Supabase user
  const [name,      setName]      = useState('');
  const [bio,       setBio]       = useState('');
  const [avatar,    setAvatar]    = useState('🧑💻');
  const [timezone,  setTimezone]  = useState('Asia/Kolkata');
  const [saved,     setSaved]     = useState(false);
  const [saving,    setSaving]    = useState(false);

  const [oldPw,     setOldPw]     = useState('');
  const [newPw,     setNewPw]     = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError,   setPwError]   = useState('');
  const [pwSaved,   setPwSaved]   = useState(false);
  const [pwSaving,  setPwSaving]  = useState(false);

  // Seed form from live user on load
  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setBio(user.bio);
    setAvatar(user.avatarEmoji);
    setTimezone(user.timezone);
  }, [user]);

  const saveProfile = async () => {
    setSaving(true);
    await updateProfile({ name, bio, timezone, avatarEmoji: avatar });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const changePassword = async () => {
    setPwError('');
    if (!oldPw) { setPwError('Enter your current password.'); return; }
    if (newPw.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return; }
    setPwSaving(true);
    const { error } = await updatePassword(newPw);
    setPwSaving(false);
    if (error) { setPwError(error); return; }
    setOldPw(''); setNewPw(''); setConfirmPw('');
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 2500);
  };

  // Live stats
  const completedTasks = tasks.filter(t => t.completed).length;
  const bestStreak     = habits.reduce((m, h) => Math.max(m, h.bestStreak), 0);
  const unlockedBadges = profile.badges.filter(b => b.unlockedAt).length;
  const memberSince    = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in pb-10">

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white/90">
          My <span className="grad-text">Profile</span>
        </h1>
        <p className="text-white/40 text-sm mt-1">Manage your personal information and account</p>
      </div>

      {/* Hero card */}
      <div className="rounded-3xl p-6" style={{ background: '#12102a', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

          {/* Avatar picker */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl"
              style={{ background: 'linear-gradient(135deg,rgba(124,106,247,0.3),rgba(6,182,212,0.2))', border: '2px solid rgba(124,106,247,0.3)' }}>
              {avatar}
            </div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest">Pick avatar</p>
            <div className="flex flex-wrap gap-1.5 justify-center max-w-[160px]">
              {AVATARS.map(a => (
                <button key={a} onClick={() => setAvatar(a)}
                  className={cn('w-8 h-8 rounded-xl text-lg transition-all',
                    avatar === a ? 'scale-110 ring-2 ring-accent/60 bg-accent/20' : 'hover:bg-white/[0.06]')}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h2 className="text-xl font-bold text-white/90">{user?.name || 'Your Name'}</h2>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: `${levelInfo.current.color}22`, color: levelInfo.current.color, border: `1px solid ${levelInfo.current.color}44` }}>
                Lv.{levelInfo.current.level} · {levelInfo.current.title}
              </span>
            </div>
            <p className="text-sm text-white/40 mb-1">{user?.email}</p>
            <p className="text-xs text-white/30 mb-3">Member since {memberSince}</p>
            <p className="text-sm text-white/55 leading-relaxed">{user?.bio || 'No bio yet — tell us about yourself.'}</p>

            {/* XP bar */}
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-xs text-white/35">
                <span>{profile.xp.toLocaleString()} XP</span>
                <span>{levelInfo.xpIntoLevel} / {levelInfo.xpNeeded} to Lv.{Math.min(levelInfo.current.level + 1, 10)}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${levelInfo.pct}%`, background: `linear-gradient(90deg,${levelInfo.current.color},${levelInfo.current.color}88)`, boxShadow: `0 0 8px ${levelInfo.current.color}66` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Live stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <StatPill label="Tasks Done"   value={completedTasks}   color="#10b981" />
          <StatPill label="Best Streak"  value={`${bestStreak}d`} color="#f97316" />
          <StatPill label="Badges"       value={unlockedBadges}   color="#a78bfa" />
          <StatPill label="Member Since" value={memberSince}      color="#06b6d4" />
        </div>
      </div>

      {/* Personal info */}
      <Section title="Personal Information" icon="✏️">
        <Row label="Full Name" desc="Your display name across the app">
          <input className={inputCls} style={{ background: '#1a1840' }} value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
        </Row>
        <Row label="Email Address" desc="Your login email (read-only)">
          <input className={inputCls} style={{ background: '#1a1840', opacity: 0.6 }} value={user?.email ?? ''} readOnly />
        </Row>
        <Row label="Bio" desc="A short description about yourself">
          <textarea className={cn(inputCls, 'resize-none h-20 leading-relaxed')} style={{ background: '#1a1840' }}
            value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself…" />
        </Row>
        <Row label="Timezone" desc="Used for streak and daily reset calculations">
          <select className={cn(inputCls, 'cursor-pointer')} style={{ background: '#1a1840' }}
            value={timezone} onChange={e => setTimezone(e.target.value)}>
            {['Asia/Kolkata','America/New_York','America/Los_Angeles','Europe/London','Europe/Paris','Asia/Tokyo','Australia/Sydney','UTC'].map(tz => (
              <option key={tz} value={tz} style={{ background: '#1a1840' }}>{tz}</option>
            ))}
          </select>
        </Row>
        <div className="px-6 py-4 flex justify-end">
          <button onClick={saveProfile} disabled={saving}
            className={cn('px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60',
              saved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'btn-glow')}>
            {saving ? 'Saving…' : saved ? '✓ Changes Saved' : 'Save Changes'}
          </button>
        </div>
      </Section>

      {/* Account */}
      <Section title="Account" icon="🔐">
        <Row label="Account Type" desc="Your current plan">
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-accent/20 text-accent2 border border-accent/30">⭐ Pro Plan</span>
        </Row>
        <Row label="Member Since" desc="When you joined Planora">
          <span className="text-sm text-white/50 font-medium">{memberSince}</span>
        </Row>
        <Row label="Account Status" desc="Your account is in good standing">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span className="text-sm text-emerald-400 font-semibold">Active</span>
          </div>
        </Row>
        <Row label="User ID" desc="Your unique identifier">
          <span className="text-xs font-mono text-white/30 px-3 py-1.5 rounded-xl truncate max-w-[200px] block"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {user?.id ?? '—'}
          </span>
        </Row>
      </Section>

      {/* Change password */}
      <Section title="Change Password" icon="🔑">
        <Row label="Current Password" desc="Enter your existing password">
          <input className={inputCls} style={{ background: '#1a1840' }} type="password" value={oldPw} onChange={e => setOldPw(e.target.value)} placeholder="••••••••" />
        </Row>
        <Row label="New Password" desc="At least 8 characters">
          <input className={inputCls} style={{ background: '#1a1840' }} type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="••••••••" />
        </Row>
        <Row label="Confirm Password" desc="Re-enter your new password">
          <input className={inputCls} style={{ background: '#1a1840' }} type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••" />
        </Row>
        {pwError && <div className="px-6 py-2"><p className="text-xs text-rose-400 font-medium">⚠️ {pwError}</p></div>}
        <div className="px-6 py-4 flex justify-end">
          <button onClick={changePassword} disabled={pwSaving}
            className={cn('px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60',
              pwSaved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'btn-glow')}>
            {pwSaving ? 'Updating…' : pwSaved ? '✓ Password Updated' : 'Update Password'}
          </button>
        </div>
      </Section>

      {/* Danger zone */}
      <Section title="Danger Zone" icon="⚠️">
        <Row label="Delete Account" desc="Permanently delete your account and all data">
          <button onClick={() => confirm('Are you sure? This cannot be undone.') && alert('Contact support to delete your account.')}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 transition-all">
            Delete Account
          </button>
        </Row>
      </Section>
    </div>
  );
}
