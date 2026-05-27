'use client';
import { useEffect, useRef } from 'react';
import {
  Chart, LineController, LineElement, PointElement,
  LinearScale, CategoryScale, Filler, Tooltip, Legend,
} from 'chart.js';
import { PASTEL, GRID_STYLE, TICK_STYLE, TOOLTIP_STYLE, makeGradient } from './chartDefaults';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const THIS_YEAR  = [62, 68, 71, 75, 80, 84, 88, 85, 90, 87, 92, 94];
const LAST_YEAR  = [50, 54, 58, 60, 65, 68, 70, 72, 74, 71, 76, 78];
const TASKS_DONE = [42, 55, 60, 70, 78, 85, 90, 88, 95, 91, 98, 102];

export default function MonthlyComparisonChart() {
  const ref = useRef<HTMLCanvasElement>(null);
  const chart = useRef<Chart | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = ref.current.getContext('2d')!;
    const h = ref.current.offsetHeight || 280;

    const thisGrad = makeGradient(ctx, h, 'rgba(167,139,250,0.35)', 'rgba(167,139,250,0.0)');
    const lastGrad = makeGradient(ctx, h, 'rgba(103,232,249,0.2)',  'rgba(103,232,249,0.0)');
    const taskGrad = makeGradient(ctx, h, 'rgba(110,231,183,0.2)',  'rgba(110,231,183,0.0)');

    chart.current?.destroy();
    chart.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: MONTHS,
        datasets: [
          {
            label: 'Score 2025',
            data: THIS_YEAR,
            borderColor: PASTEL.violet.solid,
            backgroundColor: thisGrad,
            borderWidth: 2.5,
            pointRadius: 4,
            pointBackgroundColor: PASTEL.violet.solid,
            pointBorderColor: 'rgba(10,8,30,0.8)',
            pointBorderWidth: 2,
            pointHoverRadius: 7,
            tension: 0.4,
            fill: true,
          },
          {
            label: 'Score 2024',
            data: LAST_YEAR,
            borderColor: PASTEL.cyan.solid,
            backgroundColor: lastGrad,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: PASTEL.cyan.solid,
            pointBorderColor: 'rgba(10,8,30,0.8)',
            pointBorderWidth: 2,
            pointHoverRadius: 6,
            tension: 0.4,
            fill: true,
          },
          {
            label: 'Tasks Done',
            data: TASKS_DONE,
            borderColor: PASTEL.emerald.solid,
            backgroundColor: taskGrad,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: PASTEL.emerald.solid,
            pointBorderColor: 'rgba(10,8,30,0.8)',
            pointBorderWidth: 2,
            pointHoverRadius: 6,
            tension: 0.4,
            fill: true,
            yAxisID: 'y2',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1400, easing: 'easeOutQuart' },
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
            ticks: { ...TICK_STYLE, callback: (v) => `${v}` },
            border: { display: false },
            min: 40, max: 100,
            position: 'left',
          },
          y2: {
            grid: { display: false },
            ticks: { ...TICK_STYLE, callback: (v) => `${v}` },
            border: { display: false },
            min: 0,
            position: 'right',
          },
        },
      },
    });

    return () => { chart.current?.destroy(); };
  }, []);

  return <canvas ref={ref} style={{ width: '100%', height: '280px' }} />;
}
