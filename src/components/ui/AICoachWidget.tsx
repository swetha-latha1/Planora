'use client';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils';

interface ChatMsg { role: 'coach' | 'user'; text: string }

const QUICK_PROMPTS = [
  'How to improve consistency?',
  'Best habit to start with?',
  'How to beat procrastination?',
];

export default function AICoachWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { role: 'coach', text: "Hi! I'm your AI Coach 🤖 Ask me anything about productivity, habits, or tasks!" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, loading, open]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    const newMsgs: ChatMsg[] = [...msgs, { role: 'user', text: msg }];
    setMsgs(newMsgs);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMsgs.slice(1),
          context: 'User is asking a general productivity question via the floating AI coach widget.',
        }),
      });
      const json = await res.json();
      setMsgs(prev => [...prev, {
        role: 'coach',
        text: res.ok ? (json.text ?? 'No response received.') : `⚠️ ${json.error ?? 'Something went wrong.'}`,
      }]);
    } catch {
      setMsgs(prev => [...prev, { role: 'coach', text: '⚠️ Could not reach the server. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* Chat popup */}
      {open && (
        <div
          className="w-[340px] sm:w-[380px] rounded-3xl border border-white/[0.10] flex flex-col overflow-hidden animate-fade-in"
          style={{
            background: 'rgba(18, 10, 35, 0.97)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(251,146,60,0.25)',
            height: '520px',
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-3 border-b border-white/[0.07]"
            style={{ background: 'rgba(251,146,60,0.12)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0" style={{ background: 'rgba(251,146,60,0.2)', border: '1px solid rgba(251,146,60,0.4)' }}>💀</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white/85">AI Coach</p>
              <p className="text-[10px] text-white/35">Powered by Gemini</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/80 transition-all ml-1"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn(
                  'max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap',
                  m.role === 'coach'
                    ? 'bg-white/[0.06] border border-white/[0.08] text-white/70 rounded-tl-sm'
                    : 'bg-accent/25 border border-accent/30 text-white/85 rounded-tr-sm'
                )}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/[0.06] border border-white/[0.08] px-3.5 py-2.5 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                  {[0, 150, 300].map(delay => (
                    <span key={delay} className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
            {QUICK_PROMPTS.map(p => (
              <button key={p} onClick={() => send(p)} disabled={loading}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/45 hover:text-white/75 hover:border-accent/40 transition-all disabled:opacity-40 font-medium">
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 pb-4 flex gap-2">
            <input
              className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-2xl px-3.5 py-2.5 text-xs text-white/70 placeholder-white/25 outline-none focus:border-accent/40 transition-colors disabled:opacity-40"
              placeholder="Ask your AI coach…"
              value={input}
              disabled={loading}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
            />
            <button onClick={() => send()} disabled={loading}
              className="w-10 h-10 rounded-2xl btn-glow flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-transform disabled:opacity-40">
              {loading
                ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
              }
            </button>
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 relative',
          open && 'rotate-12'
        )}
        style={{ background: 'linear-gradient(135deg,#f97316,#fb923c)', boxShadow: '0 4px 28px rgba(249,115,22,0.6)' }}
        title="AI Coach"
      >
        {!open && (
          <span className="absolute inset-0 rounded-2xl animate-ping opacity-30" style={{ background: 'linear-gradient(135deg,#f97316,#fb923c)' }} />
        )}
        {!open && (
          <span className="absolute w-3 h-3 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.9)] animate-[orbitDot_2s_linear_infinite]" />
        )}
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6 relative z-10">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <span className="relative z-10 animate-[botWiggle_3s_ease-in-out_infinite]">💀</span>
        )}
      </button>
    </div>
  );
}
