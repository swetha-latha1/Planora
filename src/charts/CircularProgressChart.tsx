'use client';
import { useEffect, useRef } from 'react';
import {
  Chart, DoughnutController, ArcElement, Tooltip, Legend,
  type ChartConfiguration,
} from 'chart.js';
import { PASTEL, TOOLTIP_STYLE } from './chartDefaults';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

interface Props {
  title: string;
  centerLabel: string;
  centerValue: string;
  segments: { label: string; value: number; color: string }[];
}

// Center-text plugin
function makeCenterPlugin(value: string, label: string) {
  return {
    id: `center-${value}`,
    afterDraw(chart: Chart) {
      const { ctx, chartArea: { top, bottom, left, right } } = chart;
      const cx = (left + right) / 2;
      const cy = (top + bottom) / 2;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `700 26px Inter, system-ui, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillText(value, cx, cy - 10);
      ctx.font = `500 11px Inter, system-ui, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillText(label, cx, cy + 14);
      ctx.restore();
    },
  };
}

export default function CircularProgressChart({ title, centerLabel, centerValue, segments }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const chart = useRef<Chart | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = ref.current.getContext('2d')!;
    const plugin = makeCenterPlugin(centerValue, centerLabel);

    chart.current?.destroy();
    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: segments.map(s => s.label),
        datasets: [{
          data: segments.map(s => s.value),
          backgroundColor: segments.map(s => s.color),
          borderColor: 'rgba(255,255,255,0.04)',
          borderWidth: 2,
          hoverOffset: 8,
          hoverBorderColor: 'rgba(255,255,255,0.2)',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        animation: { duration: 1100, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            ...TOOLTIP_STYLE,
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%`,
            },
          },
        },
      },
      plugins: [plugin],
    };
    chart.current = new Chart(ctx, config);

    return () => { chart.current?.destroy(); };
  }, [centerValue, centerLabel, segments]);

  return (
    <div className="flex flex-col gap-4">
      <div style={{ height: '180px', position: 'relative' }}>
        <canvas ref={ref} />
      </div>
      {/* Custom legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-[11px] text-white/50 truncate">{s.label}</span>
            <span className="text-[11px] text-white/70 font-semibold ml-auto">{s.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
