const ACCENTS = {
  purple: { grad: 'from-purple-50', chip: 'bg-purple-600', bar: 'bg-purple-500' },
  blue: { grad: 'from-blue-50', chip: 'bg-blue-600', bar: 'bg-blue-500' },
  indigo: { grad: 'from-indigo-50', chip: 'bg-indigo-600', bar: 'bg-indigo-500' },
  green: { grad: 'from-green-50', chip: 'bg-green-600', bar: 'bg-green-500' },
  red: { grad: 'from-red-50', chip: 'bg-red-600', bar: 'bg-red-500' },
  amber: { grad: 'from-amber-50', chip: 'bg-amber-500', bar: 'bg-amber-500' },
}

export default function StatTile({
  label,
  value,
  delta,
  deltaType = 'up',
  icon,
  accent = 'purple',
  index = 0,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-11 w-11 animate-pulse rounded-xl bg-gray-200" />
        </div>
        <div className="mt-4 h-7 w-24 animate-pulse rounded bg-gray-200" />
        <div className="mt-3 h-3 w-28 animate-pulse rounded bg-gray-200" />
      </div>
    )
  }

  const a = ACCENTS[accent] || ACCENTS.purple
  const deltaStyle =
    deltaType === 'down' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'

  return (
    <div
      className={`fade-in-up group relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br ${a.grad} to-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <span
        className={`absolute inset-x-0 top-0 h-1 ${a.bar} opacity-70`}
      />
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {icon && (
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm transition-transform duration-300 group-hover:scale-110 ${a.chip}`}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-gray-800">
        {value}
      </p>
      {delta && (
        <div className="mt-3 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${deltaStyle}`}
          >
            {deltaType === 'down' ? '▼' : '▲'} {delta}
          </span>
          <span className="text-xs text-gray-400">vs last week</span>
        </div>
      )}
    </div>
  )
}
