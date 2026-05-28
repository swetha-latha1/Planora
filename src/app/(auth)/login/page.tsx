'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain", emoji: "🚀", color: "#7c6af7" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela", emoji: "💪", color: "#06b6d4" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", emoji: "⏰", color: "#f43f5e" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier", emoji: "🌟", color: "#f97316" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", emoji: "✨", color: "#10b981" },
  { text: "Dream big. Start small. Act now.", author: "Robin Sharma", emoji: "🎯", color: "#a78bfa" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown", emoji: "🔥", color: "#f43f5e" },
  { text: "Great things never come from comfort zones.", author: "Unknown", emoji: "💎", color: "#06b6d4" },
  { text: "Work hard in silence, let success make the noise.", author: "Frank Ocean", emoji: "🏆", color: "#fbbf24" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar", emoji: "⚡", color: "#7c6af7" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown", emoji: "💡", color: "#10b981" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown", emoji: "🎉", color: "#ec4899" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown", emoji: "🌟", color: "#f97316" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery", emoji: "✨", color: "#a78bfa" },
  { text: "Little things make big days.", author: "Unknown", emoji: "💪", color: "#06b6d4" },
  { text: "It's going to be hard, but hard does not mean impossible.", author: "Unknown", emoji: "🚀", color: "#7c6af7" },
  { text: "Don't wait for opportunity. Create it.", author: "Unknown", emoji: "🎯", color: "#f43f5e" },
  { text: "Sometimes we're tested not to show our weaknesses, but to discover our strengths.", author: "Unknown", emoji: "🔥", color: "#10b981" },
  { text: "The key to success is to focus on goals, not obstacles.", author: "Unknown", emoji: "💎", color: "#fbbf24" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown", emoji: "🏆", color: "#ec4899" },
];

const FLOATING_EMOJIS = ['🚀','⚡','🌟','💡','🎯','🔥','💎','🏆','✨','💪','🎉'];
const COLORS = ['#7c6af7','#06b6d4','#f43f5e','#f97316','#10b981','#a78bfa','#fbbf24','#ec4899'];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [show, setShow] = useState(true);
  const [error, setError] = useState('');
  const transitioning = useRef(false);

  const goNext = useCallback(() => {
    if (transitioning.current) return;
    transitioning.current = true;
    setShow(false);
    setTimeout(() => {
      setQuoteIdx(i => (i + 1) % QUOTES.length);
      setShow(true);
      transitioning.current = false;
    }, 350);
  }, []);

  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      size: Math.random() * 8 + 3,
      x: Math.random() * 100,
      delay: Math.random() * 8,
      duration: Math.random() * 10 + 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: Math.random() > 0.4 ? '50%' : '4px',
    }))
  );

  const [stars] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 60,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
    }))
  );

  const [floatingEmojis] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      emoji: FLOATING_EMOJIS[Math.floor(Math.random() * FLOATING_EMOJIS.length)],
      x: Math.random() * 100,
      delay: Math.random() * 12,
      duration: Math.random() * 8 + 5,
      size: Math.random() * 18 + 14,
      opacity: Math.random() * 0.4 + 0.3,
    }))
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard');
    });
  }, [router]);

  useEffect(() => {
    const iv = setInterval(goNext, 2500);
    return () => clearInterval(iv);
  }, [goNext]);

  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);

  async function handleOAuth(provider: 'google' | 'github') {
    setOauthLoading(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) { setError(error.message); setOauthLoading(null); }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed'))
        setError('Please confirm your email first. Check your inbox for a confirmation link.');
      else
        setError(error.message);
      return;
    }
    router.push('/dashboard');
  }

  const q = QUOTES[quoteIdx];

  return (
    <div className="min-h-screen flex flex-row overflow-hidden relative" style={{ background: 'linear-gradient(135deg,#0c0015 0%,#0a0a2e 50%,#001a2c 100%)' }}>

      {/* Animated background grid */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(rgba(124,106,247,1) 1px,transparent 1px),linear-gradient(90deg,rgba(124,106,247,1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{overflow:'hidden'}}>
        {particles.map(p => (
          <div key={p.id} className="absolute"
            style={{
              width: p.size, height: p.size,
              left: `${p.x}%`, bottom: '-20px',
              background: p.color,
              borderRadius: p.shape,
              boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
              animation: `loginFloat ${p.duration}s ${p.delay}s infinite linear`,
              opacity: 0.85,
            }} />
        ))}

        {/* Shooting stars */}
        {stars.map(s => (
          <div key={s.id} className="absolute"
            style={{
              left: `${s.x}%`, top: `${s.y}%`,
              width: 80, height: 2,
              background: 'linear-gradient(90deg,transparent,#fff,transparent)',
              borderRadius: 99,
              animation: `shootingStar ${s.duration}s ${s.delay}s infinite linear`,
              opacity: 0,
            }} />
        ))}

        {/* Glowing orbs */}
        <div className="absolute w-[600px] h-[600px] rounded-full -top-40 -left-40 opacity-15 blur-3xl" style={{ background: 'radial-gradient(circle,#7c6af7,transparent)' }} />
        <div className="absolute w-96 h-96 rounded-full -bottom-20 -right-20 opacity-15 blur-3xl" style={{ background: 'radial-gradient(circle,#06b6d4,transparent)' }} />
        <div className="absolute w-72 h-72 rounded-full top-1/2 right-1/3 opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle,#f43f5e,transparent)' }} />
        <div className="absolute w-64 h-64 rounded-full bottom-1/3 left-1/4 opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle,#10b981,transparent)' }} />
      </div>

      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[48%] p-12 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#7c6af7,#a78bfa)', boxShadow: '0 0 24px rgba(124,106,247,0.6)' }}>
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <span className="text-2xl font-bold">
            <span style={{ background: 'linear-gradient(135deg,#7c6af7,#a78bfa,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Plan</span>
            <span className="text-white/80">ora</span>
          </span>
        </div>

        <div className="flex flex-col items-center gap-8">
          {/* Orbital system */}
          <div className="relative flex items-center justify-center" style={{ width: 340, height: 340 }}>

            {/* Ring 1 — drift wrapper + spin inner */}
            <div className="absolute" style={{ width:140, height:140, top:'50%', left:'50%', marginTop:-70, marginLeft:-70, animation:'ringDrift1 4s ease-in-out infinite' }}>
              <div className="w-full h-full rounded-full" style={{ border:'2px solid transparent', borderTopColor:'rgba(124,106,247,0.9)', borderRightColor:'rgba(124,106,247,0.4)', boxShadow:'0 0 20px rgba(124,106,247,0.5)', animation:'ringSpin 3s linear infinite' }} />
            </div>

            {/* Ring 2 — drift wrapper + spin inner reverse */}
            <div className="absolute" style={{ width:210, height:210, top:'50%', left:'50%', marginTop:-105, marginLeft:-105, animation:'ringDrift2 5.5s ease-in-out infinite' }}>
              <div className="w-full h-full rounded-full" style={{ border:'2px solid transparent', borderTopColor:'rgba(6,182,212,0.9)', borderLeftColor:'rgba(6,182,212,0.4)', boxShadow:'0 0 20px rgba(6,182,212,0.4)', animation:'ringSpin 5s linear infinite reverse' }} />
            </div>

            {/* Ring 3 — drift wrapper + spin inner */}
            <div className="absolute" style={{ width:280, height:280, top:'50%', left:'50%', marginTop:-140, marginLeft:-140, animation:'ringDrift3 7s ease-in-out infinite' }}>
              <div className="w-full h-full rounded-full" style={{ border:'2px solid transparent', borderTopColor:'rgba(244,63,94,0.9)', borderRightColor:'rgba(244,63,94,0.4)', boxShadow:'0 0 20px rgba(244,63,94,0.35)', animation:'ringSpin 8s linear infinite' }} />
            </div>

            {/* Orbiter 1 — purple, fast */}
            <div className="absolute" style={{ width:140, height:140, top:'50%', left:'50%', marginTop:-70, marginLeft:-70, animation:'orbitSpin 5s linear infinite' }}>
              <div style={{ position:'absolute', top:-16, left:'50%', transform:'translateX(-50%)', width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#7c6af7,#a78bfa)', boxShadow:'0 0 20px #7c6af7, 0 0 40px #7c6af780, inset 0 0 10px rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>⚡</div>
            </div>

            {/* Orbiter 2 — cyan, medium reverse */}
            <div className="absolute" style={{ width:210, height:210, top:'50%', left:'50%', marginTop:-105, marginLeft:-105, animation:'orbitSpin 9s linear infinite reverse' }}>
              <div style={{ position:'absolute', top:-16, left:'50%', transform:'translateX(-50%)', width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#06b6d4,#0ea5e9)', boxShadow:'0 0 20px #06b6d4, 0 0 40px #06b6d480, inset 0 0 10px rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🌟</div>
            </div>

            {/* Orbiter 3 — red, slow */}
            <div className="absolute" style={{ width:280, height:280, top:'50%', left:'50%', marginTop:-140, marginLeft:-140, animation:'orbitSpin 15s linear infinite' }}>
              <div style={{ position:'absolute', top:-16, left:'50%', transform:'translateX(-50%)', width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#f43f5e,#fb7185)', boxShadow:'0 0 20px #f43f5e, 0 0 40px #f43f5e80, inset 0 0 10px rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🔥</div>
            </div>

            {/* Orbiter 4 — gold, medium offset */}
            <div className="absolute" style={{ width:210, height:210, top:'50%', left:'50%', marginTop:-105, marginLeft:-105, animation:'orbitSpin 9s linear infinite', animationDelay:'-4.5s' }}>
              <div style={{ position:'absolute', bottom:-16, left:'50%', transform:'translateX(-50%)', width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#fbbf24,#f97316)', boxShadow:'0 0 20px #fbbf24, 0 0 40px #fbbf2480, inset 0 0 10px rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>💎</div>
            </div>

            {/* Orbiter 5 — green, unique orbit */}
            <div className="absolute" style={{ width:140, height:140, top:'50%', left:'50%', marginTop:-70, marginLeft:-70, animation:'orbitSpin 5s linear infinite reverse', animationDelay:'-2.5s' }}>
              <div style={{ position:'absolute', bottom:-16, left:'50%', transform:'translateX(-50%)', width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#10b981,#14b8a6)', boxShadow:'0 0 20px #10b981, 0 0 40px #10b98180, inset 0 0 10px rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>💚</div>
            </div>

            {/* Center glow pulse - enhanced */}
            <div className="absolute rounded-full" style={{ width:110, height:110, top:'50%', left:'50%', marginTop:-55, marginLeft:-55, background:'radial-gradient(circle,rgba(124,106,247,0.4),transparent)', animation:'centerPulse 2s ease-in-out infinite' }} />

            {/* Additional center glow layer */}
            <div className="absolute rounded-full" style={{ width:80, height:80, top:'50%', left:'50%', marginTop:-40, marginLeft:-40, background:'radial-gradient(circle,rgba(6,182,212,0.3),transparent)', animation:'centerPulse 2.5s ease-in-out infinite', animationDelay:'-0.5s' }} />

            {/* Center rocket — enhanced sun effect */}
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl relative z-10 transition-transform hover:scale-110"
              style={{
                background:'linear-gradient(135deg,#7c6af7,#06b6d4)',
                boxShadow:'0 0 60px rgba(124,106,247,1), 0 0 100px rgba(6,182,212,0.8), inset 0 0 30px rgba(255,255,255,0.2)',
                animation:'rocketFloat 3s ease-in-out infinite',
                border: '2px solid rgba(255,255,255,0.3)'
              }}>
              🚀
            </div>
          </div>

          {/* Quote card */}
          <div className="w-full max-w-sm rounded-3xl p-6"
            style={{
              background: `linear-gradient(135deg,${q.color}20,${q.color}08)`,
              border: `1px solid ${q.color}60`,
              boxShadow: `0 0 40px ${q.color}30`,
            }}>
            <div style={{
              opacity: show ? 1 : 0,
              transform: show ? 'translateY(0px)' : 'translateY(12px)',
              transition: 'opacity 0.35s ease, transform 0.35s ease',
            }}>
              <div className="text-3xl mb-3">{q.emoji}</div>
              <p className="text-sm font-semibold text-white/80 leading-relaxed italic">"{q.text}"</p>
              <p className="text-xs mt-3 font-bold" style={{ color: q.color }}>— {q.author}</p>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-1.5">
                {QUOTES.map((_, i) => (
                  <div key={i} style={{ width: i === quoteIdx ? 14 : 5, height: 5, borderRadius: 99, background: i === quoteIdx ? q.color : 'rgba(255,255,255,0.15)', transition: 'all 0.3s ease' }} />
                ))}
              </div>
            </div>
          </div>

          {/* Colorful stats */}
          <div className="flex gap-3 flex-wrap justify-center">
            {[
              { label: '10K+ Users', color: '#7c6af7', emoji: '👥' },
              { label: '1M+ Tasks', color: '#06b6d4', emoji: '✅' },
              { label: '500K+ Habits', color: '#10b981', emoji: '🔥' },
            ].map(s => (
              <div key={s.label} className="px-4 py-2 rounded-full text-xs font-bold text-white/80 flex items-center gap-1.5"
                style={{ background: `${s.color}20`, border: `1px solid ${s.color}50`, boxShadow: `0 0 16px ${s.color}30` }}>
                <span>{s.emoji}</span> {s.label}
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/20 text-xs">© 2025 Planora. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="rounded-3xl p-8 border border-white/[0.10]"
            style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(28px)', boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,106,247,0.15)' }}>

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7c6af7,#a78bfa)' }}>
                <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <span className="text-lg font-bold" style={{ background: 'linear-gradient(135deg,#7c6af7,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Planora</span>
            </div>

            {/* Colorful top bar */}
            <div className="flex gap-1 mb-6 rounded-full overflow-hidden h-1">
              {COLORS.map((c, i) => (
                <div key={i} className="flex-1 h-full" style={{ background: c, boxShadow: `0 0 8px ${c}`, animation: `colorPulse ${1.5 + i * 0.2}s ease-in-out infinite alternate` }} />
              ))}
            </div>

            <h1 className="text-2xl font-extrabold text-white/90 mb-1">Welcome back! 👋</h1>
            <p className="text-sm text-white/40 mb-7">Sign in to continue your productivity journey</p>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-2xl text-sm text-rose-300 border border-rose-500/30" style={{ background: 'rgba(244,63,94,0.1)' }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
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

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  </span>
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required
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
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: '#7c6af7' }} />
                  <span className="text-xs text-white/40">Remember me</span>
                </label>
                <span className="text-xs font-semibold cursor-pointer hover:text-white/80 transition-colors" style={{ color: '#a78bfa' }}>Forgot password?</span>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#7c6af7,#a78bfa,#06b6d4)', boxShadow: '0 4px 28px rgba(124,106,247,0.6)' }}>
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg,#06b6d4,#7c6af7,#a78bfa)' }} />
                <span className="relative z-10 flex items-center gap-2">
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                    : <><span>Sign In</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
                  }
                </span>
              </button>
            </form>


            <p className="text-center text-sm text-white/35 mt-6">
              Don't have an account?{' '}
              <Link href="/register" className="font-bold hover:text-white transition-colors" style={{ color: '#a78bfa' }}>
                Sign up free →
              </Link>
            </p>
          </div>
        </div>
      </div>


    </div>
  );
}
