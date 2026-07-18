'use client'
import StatTile from '@/components/StatTile'
import StatusBadge from '@/components/StatusBadge'

const ic = 'h-5 w-5'

const ICONS = {
  active: (
    <svg className={ic} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  due: (
    <svg className={ic} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  pickup: (
    <svg className={ic} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7m0 0H8m9 0v9" />
    </svg>
  ),
  ret: (
    <svg className={ic} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 7L7 17m0 0h9m-9 0V8" />
    </svg>
  ),
  overdue: (
    <svg className={ic} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
  revenue: (
    <svg className={ic} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12M6 8h12m-9 0c3 0 5 1.5 5 4s-2 4-5 4H7l6 4M7 12h5" />
    </svg>
  ),
  deposit: (
    <svg className={ic} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 10l2-5h14l2 5M3 10v9a1 1 0 001 1h16a1 1 0 001-1v-9M16 14h.01" />
    </svg>
  ),
  latefee: (
    <svg className={ic} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

const TILES = [
  { label: 'Active Rentals', value: '128', delta: '8%', deltaType: 'up', accent: 'purple', icon: ICONS.active },
  { label: 'Due Today', value: '14', accent: 'blue', icon: ICONS.due },
  { label: 'Pickups', value: '9', accent: 'indigo', icon: ICONS.pickup },
  { label: 'Returns', value: '6', accent: 'green', icon: ICONS.ret },
  { label: 'Overdue', value: '3', delta: '2%', deltaType: 'down', accent: 'red', icon: ICONS.overdue },
  { label: 'Revenue', value: '₹2,45,000', delta: '12%', deltaType: 'up', accent: 'green', icon: ICONS.revenue },
  { label: 'Deposits Held', value: '₹86,000', accent: 'amber', icon: ICONS.deposit },
  { label: 'Late Fees', value: '₹4,200', delta: '5%', deltaType: 'up', accent: 'red', icon: ICONS.latefee },
]

const WEEK = [
  { day: 'Mon', pct: 45 },
  { day: 'Tue', pct: 62 },
  { day: 'Wed', pct: 38 },
  { day: 'Thu', pct: 78 },
  { day: 'Fri', pct: 90 },
  { day: 'Sat', pct: 70 },
  { day: 'Sun', pct: 55 },
]

const RECENT = [
  { id: 'RO-1042', customer: 'Aarav Shah', amount: '₹12,500', status: 'reserved' },
  { id: 'RO-1041', customer: 'Meera Patel', amount: '₹8,200', status: 'picked_up' },
  { id: 'RO-1040', customer: 'Kabir Joshi', amount: '₹15,900', status: 'returned' },
  { id: 'RO-1039', customer: 'Isha Mehta', amount: '₹6,400', status: 'quotation' },
  { id: 'RO-1038', customer: 'Rohan Desai', amount: '₹9,750', status: 'late_return' },
]

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of rentals, pickups, returns and revenue.
          </p>
        </div>
        <span className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 shadow-sm">
          This week
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {TILES.map((tile, idx) => (
          <StatTile
            key={tile.label}
            index={idx}
            label={tile.label}
            value={tile.value}
            delta={tile.delta}
            deltaType={tile.deltaType}
            accent={tile.accent}
            icon={tile.icon}
          />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">
              Weekly Revenue
            </h2>
            <span className="text-sm font-semibold text-green-600">+12%</span>
          </div>
          <div className="flex h-48 items-end justify-between gap-3">
            {WEEK.map((d, idx) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-40 w-full items-end">
                  <div
                    className="grow-bar w-full rounded-t-lg bg-gradient-to-t from-purple-600 to-indigo-400 transition-all duration-300 hover:from-purple-700"
                    style={{ height: `${d.pct}%`, animationDelay: `${idx * 80}ms` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-800">
            Recent Orders
          </h2>
          <div className="flex flex-col divide-y divide-gray-100">
            {RECENT.map((o) => (
              <div key={o.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{o.customer}</p>
                  <p className="text-xs text-gray-400">{o.id}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-semibold text-gray-700">
                    {o.amount}
                  </span>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
