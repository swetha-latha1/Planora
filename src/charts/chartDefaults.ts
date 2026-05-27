// Pastel gradient palette — used across all charts
export const PASTEL = {
  violet:  { solid: 'rgba(167,139,250,1)',   pastel: 'rgba(167,139,250,0.85)',  glow: 'rgba(167,139,250,0.25)' },
  cyan:    { solid: 'rgba(103,232,249,1)',   pastel: 'rgba(103,232,249,0.85)',  glow: 'rgba(103,232,249,0.25)' },
  emerald: { solid: 'rgba(110,231,183,1)',   pastel: 'rgba(110,231,183,0.85)',  glow: 'rgba(110,231,183,0.25)' },
  rose:    { solid: 'rgba(253,164,175,1)',   pastel: 'rgba(253,164,175,0.85)',  glow: 'rgba(253,164,175,0.25)' },
  amber:   { solid: 'rgba(252,211,77,1)',    pastel: 'rgba(252,211,77,0.85)',   glow: 'rgba(252,211,77,0.25)'  },
  sky:     { solid: 'rgba(125,211,252,1)',   pastel: 'rgba(125,211,252,0.85)',  glow: 'rgba(125,211,252,0.25)' },
  pink:    { solid: 'rgba(249,168,212,1)',   pastel: 'rgba(249,168,212,0.85)',  glow: 'rgba(249,168,212,0.25)' },
  indigo:  { solid: 'rgba(165,180,252,1)',   pastel: 'rgba(165,180,252,0.85)',  glow: 'rgba(165,180,252,0.25)' },
};

// Shared grid/tick style for cartesian charts
export const GRID_STYLE = {
  color: 'rgba(255,255,255,0.05)',
  drawBorder: false,
};

export const TICK_STYLE = {
  color: 'rgba(255,255,255,0.3)',
  font: { family: 'Inter, system-ui, sans-serif', size: 11 },
  padding: 8,
};

// Shared tooltip style
export const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(10,8,30,0.92)',
  borderColor: 'rgba(255,255,255,0.08)',
  borderWidth: 1,
  titleColor: 'rgba(255,255,255,0.5)',
  bodyColor: 'rgba(255,255,255,0.85)',
  padding: 12,
  cornerRadius: 12,
  titleFont: { family: 'Inter, system-ui, sans-serif', size: 11 },
  bodyFont:  { family: 'Inter, system-ui, sans-serif', size: 13, weight: 'bold' as const },
  displayColors: true,
  boxWidth: 8,
  boxHeight: 8,
  boxPadding: 4,
  usePointStyle: true,
};

// Build a vertical canvas gradient (top → bottom)
export function makeGradient(
  ctx: CanvasRenderingContext2D,
  height: number,
  colorTop: string,
  colorBottom: string,
) {
  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, colorTop);
  g.addColorStop(1, colorBottom);
  return g;
}
