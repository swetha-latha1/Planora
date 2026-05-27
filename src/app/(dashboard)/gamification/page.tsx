'use client';
import { useData } from '@/context/DataContext';
import GamificationPanel from '@/components/ui/GamificationPanel';
import ActivityHeatmap from '@/charts/ActivityHeatmap';

export default function GamificationPage() {
  const { habits: { habits }, gamification: { profile } } = useData();

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white/90">
          <span className="grad-text">Gamification</span>
        </h1>
        <p className="text-white/40 text-sm mt-1">Your XP, badges, streaks and activity history</p>
      </div>

      <GamificationPanel profile={profile} />
      <ActivityHeatmap habits={habits} />
    </div>
  );
}
