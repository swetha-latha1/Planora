'use client';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid, Legend,
} from 'recharts';

interface Props {
  data: { name: string; value: number; color: string }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3.5 py-2.5 rounded-2xl text-xs"
      style={{
        background: 'rgba(10,8,28,0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <p className="text-white/40 font-medium mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.fill }} />
          <span className="text-white/70 font-semibold">{p.value} tasks</span>
        </div>
      ))}
    </div>
  );
};

const CustomLegend = ({ data }: { data: { name: string; color: string; value: number }[] }) => (
  <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-3">
    {data.map(d => (
      <div key={d.name} className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: d.color }} />
        <span className="text-[11px] text-white/45 font-medium">{d.name}</span>
        <span className="text-[11px] font-bold" style={{ color: d.color }}>{d.value}</span>
      </div>
    ))}
  </div>
);

export default function TaskCompletionChart({ data }: Props) {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  // Nice round ceiling for Y axis
  const yMax = Math.ceil(maxVal / 5) * 5 || 10;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          barSize={40}
          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, system-ui' }}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            domain={[0, yMax]}
            tickCount={5}
            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.25)', fontFamily: 'Inter, system-ui' }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(255,255,255,0.04)', radius: 8 }}
          />
          <Bar dataKey="value" radius={[8, 8, 3, 3]} maxBarSize={56}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} fillOpacity={0.88} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <CustomLegend data={data} />
    </div>
  );
}
