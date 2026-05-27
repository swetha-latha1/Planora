interface Props {
  percent: number;
  size?: number;
  stroke?: number;
}

export default function ProgressRing({ percent, size = 120, stroke = 10 }: Props) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - percent / 100);

  return (
    <div className="card p-5 flex flex-col items-center gap-2">
      <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide self-start">Completion Rate</h3>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#7c6af7"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="22" fontWeight="700" fill="currentColor">
          {percent}%
        </text>
      </svg>
    </div>
  );
}
