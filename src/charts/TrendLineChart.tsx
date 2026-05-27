'use client';
import { useEffect, useRef } from 'react';
import {
  Chart, LineController, LineElement, PointElement,
  LinearScale, CategoryScale, Filler, Tooltip, Legend,
} from 'chart.js';
import { PASTEL, GRID_STYLE, TICK_STYLE, TOOLTIP_STYLE, makeGradient } from './chartDefaults';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

const LABELS = ['Apr 1','Apr 4','Apr 7','Apr 10','Apr 13','Apr 16','Apr 19','Apr 22','Apr 25','Apr 28','May 1','May 4','May 7','May 10','May 13','May 16','May 19','May 22','May 25','May 28','Jun 1','Jun 4','Jun 7','Jun 10','Jun 13','Jun 16','Jun 19','Jun 22','Jun 25','Jun 28'];
const SCORE  = [58,62,55,70,68,74,72,80,78,82,79,85,83,88,86,84,90,88,92,89,91,87,93,90,94,92,95,91,96,92];
const TARGET = Array(30).fill(80);

export default function TrendLineChart() {
  const ref = useRef<HTMLCanvasElement>(null);
  const chart = useRef<Chart | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = ref.current.getContext('2d')!;
    const h = ref.current.offsetHeight || 260;

    const scoreGrad  = makeGradient(ctx, h, 'rgba(167,139,250,0.45)', 'rgba(167,139,250,0)');
    const targetGrad = makeGradient(ctx, h, 'rgba(103,232,249,0.12)', 'rgba(103,232,249,0)');

    chart.current?.destroy();
    chart.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: LABELS,
        datasets: [
          {
            label: 'Productivity Score',
            data: SCORE,
            borderColor: PASTEL.violet.solid,
            backgroundColor: scoreGrad,
            borderWidth: 2.5,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: PASTEL.violet.solid,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            tension: 0.45,
            fill: true,
          },
          {
            label: 'Target',
            data: TARGET,
            borderColor: PASTEL.cyan.pastel,
            backgroundColor: targetGrad,
            borderWidth: 1.5,
            borderDash: [6, 4],
            pointRadius: 0,
            pointHoverRadius: 0,
            tension: 0,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1200, easing: 'easeOutQuart' },
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
            grid: GRID_STYLE,
            ticks: {
              ...TICK_STYLE,
              maxTicksLimit: 8,
              maxRotation: 0,
            },
            border: { display: false },
          },
          y: {
            grid: GRID_STYLE,
            ticks: { ...TICK_STYLE, callback: (v) => `${v}` },
            border: { display: false },
            min: 40,
            max: 100,
          },
        },
      },
    });

    return () => { chart.current?.destroy(); };
  }, []);

  return <canvas ref={ref} style={{ width: '100%', height: '260px' }} />;
}
