'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import StatTile from '@/components/StatTile'
import StatusBadge from '@/components/StatusBadge'
import api from '@/lib/api'

const ic = 'h-5 w-5'

const ICONS = {
  active: <svg className={ic} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  due:    <svg className={ic} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  pickup: <svg className={ic} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7m0 0H8m9 0v9" /></svg>,
  ret:    <svg className={ic} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 7L7 17m0 0h9m-9 0V8" /></svg>,
  overdue:<svg className={ic} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>,
  revenue:<svg className={ic} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12M6 8h12m-9 0c3 0 5 1.5 5 4s-2 4-5 4H7l6 4M7 12h5" /></svg>,
  deposit:<svg className={ic} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 10l2-5h14l2 5M3 10v9a1 1 0 001 1h16a1 1 0 001-1v-9M16 14h.01" /></svg>,
  latefee:<svg className={ic} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
}

function fmt(val) {
  const n = Number(val || 0)
  return '₹' + n.toLocaleString('en-IN')
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [sRes, oRes] = await Promise.all([
          api.get('/dashboard/stats/'),
          api.get('/dashboard/orders/?ordering=-created_at'),
        ])
        setStats(sRes.data)
        const data = oRes.data
        setOrders((Array.isArray(data) ? data : data.results || []).slice(0, 5))
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  const tiles = stats ? [
    { label: 'Active Rentals',    value: String(stats.active_rentals),       accent: 'purple', icon: ICONS.active },
    { label: 'Due Today',         value: String(stats.rentals_due_today),     accent: 'blue',   icon: ICONS.due },
    { label: 'Upcoming Pickups',  value: String(stats.upcoming_pickups),      accent: 'indigo', icon: ICONS.pickup },
    { label: 'Upcoming Returns',  value: String(stats.upcoming_returns),      accent: 'green',  icon: ICONS.ret },
    { label: 'Overdue',           value: String(stats.overdue_rentals),       accent: 'red',    icon: ICONS.overdue },
    { label: 'Revenue',           value: fmt(stats.revenue),                  accent: 'green',  icon: ICONS.revenue },
    { label: 'Deposits Held',     value: fmt(stats.security_deposits_held),   accent: 'amber',  icon: ICONS.deposit },
    { label: 'Late Fees',         value: fmt(stats.late_fees_collected),      accent: 'red',    icon: ICONS.latefee },
  ] : Array.from({ length: 8 }).map(() => ({ loading: true }))

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Live overview of rentals, pickups, returns and revenue.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/products" className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 shadow-sm hover:bg-gray-50 transition">
            Manage Stock
          </Link>
          <Link href="/pickup-return" className="rounded-lg bg-purple-700 px-3 py-1.5 text-sm text-white shadow-sm hover:bg-purple-800 transition">
            Pickups &amp; Returns
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {tiles.map((tile, idx) => (
          <StatTile key={idx} index={idx} loading={tile.loading} label={tile.label}
            value={tile.value} delta={tile.delta} deltaType={tile.deltaType}
            accent={tile.accent} icon={tile.icon} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Attention panel */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-800">Needs Attention</h2>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-4 animate-pulse rounded bg-gray-200" />)}</div>
          ) : (
            <div className="space-y-3">
              {stats?.overdue_rentals > 0 && (
                <div className="flex items-center gap-3 rounded-xl bg-red-50 p-3">
                  <span className="text-red-500 text-lg">⚠️</span>
                  <div>
                    <p className="text-sm font-semibold text-red-700">{stats.overdue_rentals} Overdue Return{stats.overdue_rentals !== 1 ? 's' : ''}</p>
                    <p className="text-xs text-red-500">Items not returned on time</p>
                  </div>
                </div>
              )}
              {stats?.rentals_due_today > 0 && (
                <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-3">
                  <span className="text-amber-500 text-lg">📅</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-700">{stats.rentals_due_today} Due Today</p>
                    <p className="text-xs text-amber-500">Returns expected today</p>
                  </div>
                </div>
              )}
              {stats?.upcoming_pickups > 0 && (
                <div className="flex items-center gap-3 rounded-xl bg-indigo-50 p-3">
                  <span className="text-indigo-500 text-lg">📦</span>
                  <div>
                    <p className="text-sm font-semibold text-indigo-700">{stats.upcoming_pickups} Pending Pickup{stats.upcoming_pickups !== 1 ? 's' : ''}</p>
                    <p className="text-xs text-indigo-400">Customers yet to collect</p>
                  </div>
                </div>
              )}
              {!stats?.overdue_rentals && !stats?.rentals_due_today && !stats?.upcoming_pickups && (
                <div className="py-6 text-center text-gray-400 text-sm">All clear — nothing urgent!</div>
              )}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">Recent Orders</h2>
            <Link href="/pickup-return" className="text-xs text-purple-600 hover:underline font-medium">View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="h-10 animate-pulse rounded bg-gray-200" />)}</div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">No orders yet.</div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {orders.map(o => {
                const customer = o.customer?.first_name
                  ? `${o.customer.first_name} ${o.customer.last_name || ''}`.trim()
                  : o.customer?.username || 'Customer'
                const total = '₹' + Number(o.total_amount || 0).toLocaleString('en-IN')
                const date = o.created_at
                  ? new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                  : ''
                return (
                  <div key={o.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{customer}</p>
                      <p className="text-xs text-gray-400">{o.order_reference} · {date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-semibold text-gray-700">{total}</span>
                      <StatusBadge status={o.status} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
