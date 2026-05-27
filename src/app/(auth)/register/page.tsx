'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const FEATURES = [
  { icon: '🎯', title: 'Smart Task Management', desc: 'Organize tasks with priorities, categories & due dates' },
  { icon: '🔥', title: 'Habit Tracking', desc: 'Build streaks and track daily habits effortlessly' },
  { icon: '🤖', title: 'AI Coach', desc: 'Get personalized productivity insights powered by Gemini' },
  { icon: '📊', title: 'Analytics', desc: 'Visualize your progress with beautiful charts' },
];

const COLORS = ['#7c6af7','#06b6d4','#f43f5e','#f97316','#10b981','#a78bfa','#fbbf24','#ec4899'];
const FLOATING_EMOJIS = ['🚀','⚡','🌟','💡','🎯','🔥','💎','🏆','✨','💪','🎉'];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [particles] = useState(() =>
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      size: Math.random() * 8 + 3,
      x: Math.random() * 100,
      delay: Math.random() * 6,
      duration: Math.random() * 9 + 7,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: Math.random() > 0.5 ? '50%' : '4px',
    }))
  );

  const [floatingEmojis] = useState(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      emoji: FLOATING_EMOJIS[Math.floor(Math.random() * FLOATING_EMOJIS.length)],
      x: Math.random() * 100,
      delay: Math.random() * 12,
      duration: Math.random() * 8 + 5,
      size: Math.random() * 18 + 14,
    }))
  );

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard');
    });
  }, [router]);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', '#f43f5e', '#f97316', '#fbbf24', '#10b981'];

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !confirm) { setError('Please fill in all fields.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (!agreed) { setError('You must agree to the Terms & Conditions to continue.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setStep(1);
  }

  return (
    <div className="min-h-screen flex overflow-hidden relative" style={{ background: 'linear-gradient(135deg,#0c0015 0%,#0a0a2e 40%,#001a2c 100%)' }}>

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {particles.map(p => (
          <div key={p.id} className="absolute"
            style={{
              width: p.size, height: p.size,
              left: `${p.x}%`, bottom: '-20px',
              background: p.color,
              borderRadius: p.shape,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
              animation: `regFloat ${p.duration}s ${p.delay}s infinite linear`,
              opacity: 0.75,
            }} />
        ))}

        {/* Emoji rain */}
        {floatingEmojis.map(e => (
          <div key={e.id} className="absolute select-none"
            style={{
              left: `${e.x}%`, top: '-40px',
              fontSize: e.size,
              animation: `emojiRain ${e.duration}s ${e.delay}s infinite linear`,
              opacity: 0,
              filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.35)) drop-shadow(0 0 16px rgba(124,106,247,0.2))',
            }}>
            {e.emoji}
          </div>
        ))}

        <div className="absolute w-[500px] h-[500px] rounded-full -top-40 -right-40 opacity-15 blur-3xl" style={{ background: 'radial-gradient(circle,#a78bfa,transparent)' }} />
        <div className="absolute w-96 h-96 rounded-full -bottom-20 -left-20 opacity-15 blur-3xl" style={{ background: 'radial-gradient(circle,#06b6d4,transparent)' }} />
        <div className="absolute w-64 h-64 rounded-full top-1/3 left-1/3 opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle,#10b981,transparent)' }} />
      </div>

      {/* Left features panel */}
      <div className="hidden lg:flex flex-col justify-between w-[48%] p-12 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#7c6af7,#a78bfa)', boxShadow: '0 0 20px rgba(124,106,247,0.5)' }}>
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <span className="text-2xl font-bold">
            <span style={{ background: 'linear-gradient(135deg,#7c6af7,#a78bfa,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Plan</span>
            <span className="text-white/80">ora</span>
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-extrabold text-white/90 leading-tight">
              Start your{' '}
              <span style={{ background: 'linear-gradient(135deg,#7c6af7,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                productivity
              </span>
              {' '}journey today 🌟
            </h2>
            <p className="text-white/40 mt-2 text-sm leading-relaxed">Join thousands of people who use Planora to achieve more every day.</p>
          </div>

          <div className="space-y-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-white/[0.07] transition-all hover:-translate-y-0.5"
                style={{ background: 'rgba(255,255,255,0.03)', animationDelay: `${i * 100}ms` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: `${['#7c6af7','#06b6d4','#a78bfa','#10b981'][i]}20`, border: `1px solid ${['#7c6af7','#06b6d4','#a78bfa','#10b981'][i]}40` }}>
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/80">{f.title}</p>
                  <p className="text-xs text-white/35 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Colorful progress bar decoration */}
          <div className="flex gap-1.5">
            {['#7c6af7','#06b6d4','#10b981','#f97316','#f43f5e','#a78bfa'].map((c, i) => (
              <div key={i} className="h-1.5 flex-1 rounded-full" style={{ background: c, boxShadow: `0 0 8px ${c}60`, opacity: 0.7 }} />
            ))}
          </div>
        </div>

        <p className="text-white/20 text-xs">© 2025 Planora. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">

          {step === 1 ? (
            /* Success state */
            <div className="rounded-3xl p-10 border border-white/[0.10] text-center"
              style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(28px)', boxShadow: '0 24px 80px rgba(0,0,0,0.7)' }}>
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-5"
                style={{ background: 'linear-gradient(135deg,#10b981,#06b6d4)', boxShadow: '0 0 40px rgba(16,185,129,0.5)' }}>
                🎉
              </div>
              <h2 className="text-2xl font-extrabold text-white/90 mb-2">Check your email! 📬</h2>
              <p className="text-white/45 text-sm mb-6">We sent a confirmation link to <span style={{ color: '#a78bfa' }}>{email}</span>. Click it to activate your account, then sign in.</p>
              <Link href="/login" className="inline-block px-6 py-3 rounded-2xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#7c6af7,#06b6d4)', boxShadow: '0 4px 20px rgba(124,106,247,0.5)' }}>
                Go to Sign In →
              </Link>
            </div>
          ) : (
            <div className="rounded-3xl p-8 border border-white/[0.10]"
              style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(28px)', boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,106,247,0.1)' }}>

              {/* Mobile logo */}
              <div className="lg:hidden flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7c6af7,#a78bfa)' }}>
                  <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <span className="text-lg font-bold" style={{ background: 'linear-gradient(135deg,#7c6af7,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Planora</span>
              </div>

              <h1 className="text-2xl font-extrabold text-white/90 mb-1">Create your account ✨</h1>
              <p className="text-sm text-white/40 mb-6">Join Planora and start achieving more today</p>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-2xl text-sm text-rose-300 border border-rose-500/30" style={{ background: 'rgba(244,63,94,0.1)' }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">Full Name</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </span>
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="Your name" required
                      className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm text-white/80 placeholder-white/25 outline-none transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      onFocus={e => (e.currentTarget.style.borderColor = 'rgba(124,106,247,0.7)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">Email</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </span>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" required
                      className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm text-white/80 placeholder-white/25 outline-none transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      onFocus={e => (e.currentTarget.style.borderColor = 'rgba(124,106,247,0.7)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                    </span>
                    <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 6 characters" required
                      className="w-full pl-10 pr-11 py-3 rounded-2xl text-sm text-white/80 placeholder-white/25 outline-none transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      onFocus={e => (e.currentTarget.style.borderColor = 'rgba(124,106,247,0.7)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                      {showPass
                        ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                  {/* Strength bar */}
                  {password.length > 0 && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex gap-1 flex-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                            style={{ background: i <= strength ? strengthColor[strength] : 'rgba(255,255,255,0.1)', boxShadow: i <= strength ? `0 0 6px ${strengthColor[strength]}` : 'none' }} />
                        ))}
                      </div>
                      <span className="text-[10px] font-semibold" style={{ color: strengthColor[strength] }}>{strengthLabel[strength]}</span>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">Confirm Password</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                    </span>
                    <input type={showPass ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
                      placeholder="Re-enter password" required
                      className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm text-white/80 placeholder-white/25 outline-none transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${confirm && confirm !== password ? 'rgba(244,63,94,0.5)' : confirm && confirm === password ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.1)'}` }}
                      onFocus={e => (e.currentTarget.style.borderColor = 'rgba(124,106,247,0.7)')}
                      onBlur={e => (e.currentTarget.style.borderColor = confirm && confirm !== password ? 'rgba(244,63,94,0.5)' : confirm && confirm === password ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.1)')}
                    />
                    {confirm && (
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm">
                        {confirm === password ? '✅' : '❌'}
                      </span>
                    )}
                  </div>
                </div>

                {/* T&C checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group mt-1">
                  <div className="relative mt-0.5 shrink-0">
                    <input type="checkbox" className="sr-only" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      agreed ? 'border-violet-500 bg-violet-500' : 'border-white/20 bg-white/[0.04] group-hover:border-white/40'
                    }`}>
                      {agreed && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3"><path d="M20 6L9 17l-5-5"/></svg>}
                    </div>
                  </div>
                  <span className="text-xs text-white/45 leading-relaxed">
                    I have read and agree to the{' '}
                    <button type="button" onClick={() => setShowTerms(true)} className="font-semibold hover:text-white transition-colors" style={{ color: '#a78bfa' }}>Terms & Conditions</button>
                    {' '}and{' '}
                    <button type="button" onClick={() => setShowPrivacy(true)} className="font-semibold hover:text-white transition-colors" style={{ color: '#a78bfa' }}>Privacy Policy</button>
                  </span>
                </label>

                <button type="submit" disabled={loading || !agreed}
                  className="w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#7c6af7,#06b6d4)', boxShadow: '0 4px 28px rgba(124,106,247,0.5)' }}
                  onMouseEnter={e => !loading && agreed && ((e.currentTarget as HTMLElement).style.boxShadow = '0 6px 36px rgba(124,106,247,0.75)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 4px 28px rgba(124,106,247,0.5)')}>
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
                    : <><span>Create Account</span><span>🚀</span></>
                  }
                </button>
              </form>

              <p className="text-center text-sm text-white/35 mt-4">
                Already have an account?{' '}
                <Link href="/login" className="font-bold hover:text-white transition-colors" style={{ color: '#a78bfa' }}>
                  Sign in →
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-lg rounded-3xl border border-white/[0.12] flex flex-col" style={{ background: '#120a23', boxShadow: '0 24px 64px rgba(0,0,0,0.8)', maxHeight: '80vh' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
              <h2 className="text-base font-bold text-white/90">Terms & Conditions</h2>
              <button onClick={() => setShowTerms(false)} className="w-8 h-8 rounded-xl hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-4 text-xs text-white/50 leading-relaxed">
              <p className="text-sm font-bold text-white/80">Last updated: January 1, 2025</p>
              {[
                ['1. Acceptance', 'By creating an account and using Planora, you agree to be bound by these Terms. If you do not agree, please do not use our service.'],
                ['2. Use of Service', 'Planora is a personal productivity tool. You agree to use it only for lawful purposes and not to misuse, reverse-engineer, or gain unauthorised access to any part of the service.'],
                ['3. Account Responsibility', 'You are responsible for maintaining the confidentiality of your credentials. Notify us immediately of any unauthorised use. Planora is not liable for losses from unauthorised account use.'],
                ['4. Data Storage', 'All your data is stored locally in your browser. Planora does not transmit personal productivity data to external servers, except AI Coach queries processed by Google Gemini.'],
                ['5. AI Coach', 'The AI Coach is powered by Google Gemini. Your messages and anonymised context are sent to Google API. Please review Google privacy policy for details.'],
                ['6. Intellectual Property', 'All content, design, and code within Planora is our intellectual property. You may not copy or distribute any part without prior written permission.'],
                ['7. Limitation of Liability', 'Planora is provided as-is without warranties. We are not liable for indirect or consequential damages, including loss of data.'],
                ['8. Modifications', 'We may modify these terms at any time. Continued use after changes constitutes acceptance.'],
                ['9. Termination', 'We may suspend or terminate your account if you violate these terms. You may delete your account anytime from Settings.'],
                ['10. Contact', 'For questions, contact us at legal@planora.app.'],
              ].map(([title, body]) => (
                <div key={title}>
                  <p className="font-bold text-white/70 mb-1">{title}</p>
                  <p>{body}</p>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-white/[0.08] flex justify-end gap-3">
              <button onClick={() => setShowTerms(false)} className="px-5 py-2 rounded-xl text-sm font-semibold text-white/50 border border-white/[0.1] hover:bg-white/[0.06] transition-all">Close</button>
              <button onClick={() => { setAgreed(true); setShowTerms(false); }} className="px-5 py-2 rounded-xl text-sm font-semibold btn-glow">I Agree</button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-lg rounded-3xl border border-white/[0.12] flex flex-col" style={{ background: '#120a23', boxShadow: '0 24px 64px rgba(0,0,0,0.8)', maxHeight: '80vh' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
              <h2 className="text-base font-bold text-white/90">Privacy Policy</h2>
              <button onClick={() => setShowPrivacy(false)} className="w-8 h-8 rounded-xl hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-4 text-xs text-white/50 leading-relaxed">
              <p className="text-sm font-bold text-white/80">Last updated: January 1, 2025</p>
              {[
                ['1. Information We Collect', 'Planora collects only your name and email address during registration. We do not collect payment info, location data, or any other personal data.'],
                ['2. How We Use It', 'Your name and email are used solely to personalise your experience. We do not sell, rent, or share your personal information with third parties for marketing.'],
                ['3. Local Data Storage', 'Your productivity data — tasks, habits, settings, gamification — is stored exclusively in your browser localStorage and never leaves your device unless you export it.'],
                ['4. AI Coach Data', 'When using AI Coach, your messages and anonymised productivity context are sent to Google Gemini API. No personally identifiable information is included in these requests.'],
                ['5. Cookies', 'Planora does not use tracking cookies. We may use essential session storage to maintain your login state.'],
                ['6. Data Security', 'We implement reasonable security measures. No internet transmission is 100% secure — use a strong password and keep it confidential.'],
                ['7. Data Retention', 'Your data is retained while your account is active. Delete all data anytime from Settings → Data Management → Reset Everything.'],
                ['8. Children', 'Planora is not intended for children under 13. We do not knowingly collect data from children under 13.'],
                ['9. Changes', 'We may update this policy from time to time and will notify you of significant changes in the app.'],
                ['10. Contact', 'Questions? Contact us at privacy@planora.app.'],
              ].map(([title, body]) => (
                <div key={title}>
                  <p className="font-bold text-white/70 mb-1">{title}</p>
                  <p>{body}</p>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-white/[0.08] flex justify-end gap-3">
              <button onClick={() => setShowPrivacy(false)} className="px-5 py-2 rounded-xl text-sm font-semibold text-white/50 border border-white/[0.1] hover:bg-white/[0.06] transition-all">Close</button>
              <button onClick={() => { setAgreed(true); setShowPrivacy(false); }} className="px-5 py-2 rounded-xl text-sm font-semibold btn-glow">I Agree</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes regFloat {
          0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 0.8; }
          100% { transform: translateY(-105vh) rotate(540deg) scale(0.2); opacity: 0; }
        }
        @keyframes fillBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
