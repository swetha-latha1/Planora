'use client';
import { useCallback } from 'react';
import type { Habit } from '@/types';

function todayLabel() {
  return new Date().toISOString().slice(0, 10);
}

// ── CSV ───────────────────────────────────────────────────────────────────────
function habitsToCsv(habits: Habit[]): string {
  const headers = ['Name','Category','Frequency','Streak','Best Streak','Total Completions','Target Days/Week','Created'];
  const rows = habits.map(h => [
    `"${h.name.replace(/"/g, '""')}"`,
    h.category,
    h.frequency,
    h.streak,
    h.bestStreak,
    h.completedDates.length,
    h.targetDays,
    h.createdAt.slice(0, 10),
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── PDF via print ─────────────────────────────────────────────────────────────
function habitsToPrintHtml(habits: Habit[]): string {
  const rows = habits.map(h => `
    <tr>
      <td>${h.icon} ${h.name}</td>
      <td style="text-transform:capitalize">${h.category}</td>
      <td style="text-transform:capitalize">${h.frequency}</td>
      <td>${h.streak} days</td>
      <td>${h.bestStreak} days</td>
      <td>${h.completedDates.length}</td>
      <td>${Math.round((h.completedDates.length / Math.max(1, Math.ceil((Date.now() - new Date(h.createdAt).getTime()) / 86400000))) * 100)}%</td>
    </tr>`).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <title>Habit Report — ${todayLabel()}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #1e1b4b; background: #fff; }
    h1 { font-size: 24px; font-weight: 800; margin-bottom: 4px; color: #7c6af7; }
    p.sub { font-size: 12px; color: #6b7280; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #7c6af7; color: #fff; padding: 10px 12px; text-align: left; font-weight: 600; }
    td { padding: 9px 12px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) td { background: #f9fafb; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; }
    @media print { body { padding: 20px; } }
  </style></head><body>
  <h1>🎯 Habit Report</h1>
  <p class="sub">Generated ${new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})} · ${habits.length} habits tracked</p>
  <table>
    <thead><tr>
      <th>Habit</th><th>Category</th><th>Frequency</th>
      <th>Current Streak</th><th>Best Streak</th><th>Total Done</th><th>Completion Rate</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p style="margin-top:24px;font-size:11px;color:#9ca3af">FocusOS Productivity Dashboard · focusos.app</p>
  </body></html>`;
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useExport(habits: Habit[]) {
  const exportCsv = useCallback(() => {
    downloadBlob(habitsToCsv(habits), `habits-${todayLabel()}.csv`, 'text/csv;charset=utf-8;');
  }, [habits]);

  const exportPdf = useCallback(() => {
    const html  = habitsToPrintHtml(habits);
    const win   = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  }, [habits]);

  return { exportCsv, exportPdf };
}
