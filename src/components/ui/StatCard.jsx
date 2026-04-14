export default function StatCard({ label, value, icon }) {
  return (
    <div className="panel p-6 flex items-start gap-4">
      {icon && <div className="text-2xl mt-0.5">{icon}</div>}
      <div>
        <div className="text-sm text-slatex/60">{label}</div>
        <div className="mt-1 text-3xl font-semibold tabular-nums">{value}</div>
      </div>
    </div>
  )
}
