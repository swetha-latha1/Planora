'use client';
import { useEffect, useRef } from 'react';
import {
  Chart, BarController, BarElement,
  LinearScale, CategoryScale, Tooltip, Legend,
} from 'chart.js';
import { PASTEL, GRID_STYLE, TICK_STYLE, TOOLTIP_STYLE } from './chartDefaults';

Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip, Legend);

// Rounded bar tops plugin
const roundedBars = {
  id: 'roundedBars',
  beforeDatasetsDraw(chart: Chart) {
    const { ctx } = chart;
    ctx.save();
  },
  afterDatasetsDraw(chart: Chart) {
    chart.ctx.restore();
  },
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const COMPLETED = [8, 12, 7, 15, 11, 6, 9];
const CREATED   = [10, 14, 9, 17, 13, 7, 11];
const FOCUS_HRS = [3.5, 5, 2.5, 6, 4.5, 2, 3];

export default function WeeklyBarChart() {
  const ref = useRef<HTMLCanvasElement>(null);
  const chart = useRef<Chart | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = ref.current.getContext('2d')!;

    chart.current?.destroy();
    chart.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: DAYS,
        datasets: [
          {
            label: 'Tasks Completed',
            data: COMPLETED,
            backgroundColor: PASTEL.violet.pastel,
            borderRadius: { topLeft: 8, topRight: 8 },
            borderSkipped: false,
            barPercentage: 0.55,
            categoryPercentage: 0.7,
          },
          {
            label: 'Tasks Created',
            data: CREATED,
            backgroundColor: PASTEL.cyan.pastel,
            borderRadius: { topLeft: 8, topRight: 8 },
            borderSkipped: false,
            barPercentage: 0.55,
            categoryPercentage: 0.7,
          },
          {
            label: 'Focus Hours',
            data: FOCUS_HRS,
            backgroundColor: PASTEL.emerald.pastel,
            borderRadius: { topLeft: 8, topRight: 8 },
            borderSkipped: false,
            barPercentage: 0.55,
            categoryPercentage: 0.7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1000, easing: 'easeOutBack' },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              color: 'rgba(255,255,255,0.45)',
              font: { family: 'Inter, system-ui, sans-serif', size: 11 },
              boxWidth: 8, boxHeight: 8, padding: 16, usePointStyle: true,
            },
          },
          tooltip: { ...TOOLTIP_STYLE },
        },
        scales: {
          x: {
            grid: { ...GRID_STYLE, display: false },
            ticks: { ...TICK_STYLE },
            border: { display: false },
          },
          y: {
            grid: GRID_STYLE,
            ticks: { ...TICK_STYLE, stepSize: 5 },
            border: { display: false },
            min: 0,
          },
        },
      },
      plugins: [roundedBars],
    });

    return () => { chart.current?.destroy(); };
  }, []);

  return <canvas ref={ref} style={{ width: '100%', height: '260px' }} />;
}
