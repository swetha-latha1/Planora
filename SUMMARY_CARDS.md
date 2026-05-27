# Dashboard Summary Cards

## Overview
Premium animated summary cards for the productivity dashboard with:
- **Animated counters** — smooth count-up animation on mount
- **Sparkline charts** — 7-point mini trend graphs
- **Trend badges** — up/down indicators with percentage change
- **Hover effects** — lift, glow, and shimmer on hover
- **Glassmorphism** — frosted glass with gradient overlays

## Cards Included

### 1. Today's Productivity Score
- **Value**: 92/100
- **Trend**: +8% vs yesterday
- **Icon**: Lightning bolt (violet gradient)
- **Sparkline**: 7-day score history

### 2. Total Active Habits
- **Value**: 6 habits
- **Trend**: +2 new this week
- **Icon**: Clock (cyan gradient)
- **Sparkline**: Weekly habit count

### 3. Longest Streak
- **Value**: 12 days
- **Trend**: +5 days gained
- **Icon**: Flame (orange-rose gradient)
- **Sparkline**: Streak progression

### 4. Monthly Completion %
- **Value**: 84%
- **Trend**: +12% vs last month
- **Icon**: Check circle (emerald gradient)
- **Sparkline**: Monthly completion trend

### 5. Tasks Completed Today
- **Value**: Dynamic (from tasks data)
- **Trend**: +3 more than average
- **Icon**: Calendar check (pink-rose gradient)
- **Sparkline**: Hourly completion

## Technical Details

### Components
- `SummaryCard.tsx` — Main card component with all features
- `useCountUp.ts` — Custom hook for animated number counting

### Features
- **Ease-out-expo** animation curve for smooth deceleration
- **Staggered delays** — cards animate in sequence (0ms, 100ms, 200ms, etc.)
- **Responsive grid** — 1 col mobile, 2 cols tablet, 5 cols desktop
- **Hover glow** — dynamic box-shadow with card-specific colors
- **SVG sparklines** — gradient fill + stroke with animated dot
- **Tabular nums** — monospace digits prevent layout shift during animation

### Customization
Each card accepts:
```tsx
<SummaryCard
  label="Card Title"
  value={92}
  suffix="/100"        // optional
  prefix="$"           // optional
  delay={0}            // stagger animation
  trend={{ value: 8, label: '% vs yesterday' }}
  spark={[{v:1},{v:2},...]}  // 7 data points
  gradient="bg-gradient-to-br from-violet-600/20 to-accent2/10"
  glowColor="rgba(124,106,247,0.4)"
  iconBg="bg-gradient-to-br from-violet-500 to-accent2"
  icon={<svg>...</svg>}
/>
```

## Usage
Cards are rendered in `src/app/page.tsx` in the dashboard summary section.

To modify values, edit the sparkline data arrays at the top of the component:
```ts
const SPARK_SCORE  = [62,70,65,80,74,88,92].map(v => ({ v }));
const SPARK_HABITS = [3,4,4,5,4,6,6].map(v => ({ v }));
// etc...
```

## Performance
- Uses `requestAnimationFrame` for smooth 60fps animations
- Cleanup on unmount prevents memory leaks
- CSS transforms for hardware-accelerated hover effects
- Minimal re-renders with proper React hooks
