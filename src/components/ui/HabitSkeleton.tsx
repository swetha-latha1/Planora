export default function HabitSkeleton() {
  return (
    <div className="relative rounded-3xl border border-white/[0.06] overflow-hidden p-5 flex flex-col gap-4"
      style={{ background: 'rgba(255,255,255,0.03)' }}>
      {/* Shimmer sweep */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite]"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)' }} />

      {/* Header row */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.06] shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3.5 bg-white/[0.07] rounded-full w-3/4" />
          <div className="h-2.5 bg-white/[0.04] rounded-full w-1/2" />
          <div className="h-4 bg-white/[0.05] rounded-full w-16 mt-1" />
        </div>
        <div className="w-16 space-y-1.5">
          <div className="h-5 bg-white/[0.06] rounded-full" />
          <div className="h-2 bg-white/[0.04] rounded-full" />
        </div>
      </div>

      {/* Streak row */}
      <div className="flex gap-2">
        <div className="h-8 bg-white/[0.05] rounded-2xl w-28" />
        <div className="h-8 bg-white/[0.04] rounded-2xl w-16" />
        <div className="h-8 bg-white/[0.04] rounded-2xl w-20 ml-auto" />
      </div>

      {/* Week dots */}
      <div className="flex gap-1.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="w-5 h-5 rounded-md bg-white/[0.05]" />
            <div className="w-2 h-1.5 bg-white/[0.03] rounded-full" />
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <div className="h-2 bg-white/[0.04] rounded-full w-24" />
          <div className="h-2 bg-white/[0.04] rounded-full w-8" />
        </div>
        <div className="h-1.5 bg-white/[0.06] rounded-full" />
      </div>

      {/* Toggle button */}
      <div className="h-11 bg-white/[0.05] rounded-2xl" />
    </div>
  );
}
