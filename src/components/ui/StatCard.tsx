interface Props {
  label: string;
  value: number | string;
  icon: string;
  sub?: string;
}

export default function StatCard({ label, value, icon, sub }: Props) {
  return (
    <div className="card p-5 flex items-center gap-4 hover:-translate-y-1 transition-transform">
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}
