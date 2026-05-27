'use client';
import { useState, useRef, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { useAICoach } from '@/hooks/useAICoach';
import { cn } from '@/utils';

function ScoreRing({ score, color }: { score: number; color: string }) {
  const size = 120, stroke = 8, r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="shrink-0">
      <defs>
        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#scoreGrad)" strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }} />
      <text x="50%" y="44%" dominantBaseline="middle" textAnchor="middle"
        fontSize="22" fontWeight="800" fill="white" opacity="0.9">{score}</text>
      <text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle"
        fontSize="9" fill="white" opacity="0.4" letterSpacing="1">SCORE</text>
    </svg>
  );
}

interface ChatMsg { role: 'coach' | 'user'; text: string }

const QUICK_PROMPTS = [
  'How can I improve my consistency?',
  'What habit should I focus on?',
  'How do I beat weekend slumps?',
  'Tips for building streaks?',
];

function ChatPanel({ data }: { data: ReturnType<typeof useAICoach> }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { role: 'coach', text: `Hi! I'm your AI Coach 🤖 Your productivity score is ${data.productivityScore} (${data.scoreLabel}). ${data.summary} Ask me anything!` },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const context = [
    `Productivity Score: ${data.productivityScore}/100 (${data.scoreLabel})`,
    `Consistency: ${data.consistencyPct}%`,
    `Total habit completions: ${data.totalCompletions}`,
    `Active days: ${data.activeDays}`,
    `Top habit: ${data.topHabit ? `${data.topHabit.name} (streak: ${data.topHabit.streak})` : 'none'}`,
    `Weakest habit: ${data.weakHabit ? `${data.weakHabit.name} (streak: ${data.weakHabit.streak})` : 'none'}`,
  ].join('\n');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, loading]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    const newMsgs: ChatMsg[] = [...msgs.slice(1), { role: 'user', text: msg }];
    setMsgs(prev => [...prev, { role: 'user', text: msg }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs, context }),
      });
      const json = await res.json();
      setMsgs(prev => [...prev, {
        role: 'coach',
        text: res.ok ? (json.text ?? 'Sorry, no response received.') : `⚠️ ${json.error ?? 'Something went wrong.'}`,
      }]);
    } catch {
      setMsgs(prev => [...prev, { role: 'coach', text: '⚠️ Could not reach the server. Try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass rounded-3xl flex flex-col h-[380px]">
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-base">🤖</div>
        <div>
          <p className="text-sm font-bold text-white/80">AI Coach Chat</p>
          <p className="text-[10px] text-white/30">Powered by Google Gemini</p>
        </div>
        <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {msgs.map((m, i) => (
          <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn(
              'max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
              m.role === 'coach'
                ? 'glass border border-white/[0.08] text-white/70 rounded-tl-sm'
                : 'bg-accent/25 border border-accent/30 text-white/80 rounded-tr-sm'
            )}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="glass border border-white/[0.08] px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-5 pb-3 flex gap-2 flex-wrap">
        {QUICK_PROMPTS.map(p => (
          <button key={p} onClick={() => send(p)} disabled={loading}
            className="text-xs px-3.5 py-1.5 rounded-xl glass border border-white/[0.08] text-white/50 hover:text-white/80 hover:border-accent/40 transition-all whitespace-nowrap font-medium disabled:opacity-40">
            {p}
          </button>
        ))}
      </div>

      <div className="px-5 pb-5 flex gap-2">
        <input
          className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-2xl px-4 py-3 text-sm text-white/70 placeholder-white/25 outline-none focus:border-accent/40 transition-colors disabled:opacity-40"
          placeholder="Ask your AI coach…"
          value={input}
          disabled={loading}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button onClick={() => send()} disabled={loading}
          className="w-11 h-11 rounded-2xl btn-glow flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-transform disabled:opacity-40">
          {loading
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
          }
        </button>
      </div>
    </div>
  );
}

export default function AICoachPage() {
  const { habits: { habits }, tasks: { tasks } } = useData();
  const data = useAICoach(habits, tasks);
  const bestDay = data.weekdayActivity.reduce((a, b) => b.pct > a.pct ? b : a, data.weekdayActivity[0]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white/90">
          AI <span className="grad-text">Coach</span>
        </h1>
        <p className="text-white/40 text-sm mt-1">Personalized insights powered by your habit & task data</p>
      </div>

      {/* Score + stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass rounded-3xl p-6 flex items-center gap-5">
          <ScoreRing score={data.productivityScore} color={data.scoreColor} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Productivity Score</p>
            <p className="text-xl font-extrabold" style={{ color: data.scoreColor }}>{data.scoreLabel}</p>
            <p className="text-xs text-white/40 mt-2 leading-relaxed line-clamp-3">{data.summary}</p>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Completions', value: data.totalCompletions,       icon: '✅', color: 'text-emerald-400' },
            { label: 'Active Days', value: data.activeDays,             icon: '📅', color: 'text-violet-400'  },
            { label: 'Consistency', value: `${data.consistencyPct}%`,  icon: '📊', color: 'text-cyan-400'    },
            { label: 'Best Day',    value: bestDay?.day ?? '—',         icon: '⚡', color: 'text-amber-400'   },
            { label: 'Top Habit',   value: data.topHabit ? `${data.topHabit.icon} ${data.topHabit.name}` : '—', icon: '🏆', color: 'text-rose-400' },
            { label: 'Insights',    value: data.insights.length,        icon: '🔍', color: 'text-sky-400'     },
          ].map((s, i) => (
            <div key={i} className="glass rounded-2xl p-4 flex items-center gap-3">
              <span className="text-xl shrink-0">{s.icon}</span>
              <div className="min-w-0">
                <p className={cn('text-base font-extrabold tabular-nums truncate', s.color)}>{s.value}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-wide">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
      <ChatPanel data={data} />
    </div>
  );
}
