'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import StatusBadge from '@/components/StatusBadge'

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'quotation', label: 'Quotations' },
  { key: 'reserved', label: 'Reserved' },
  { key: 'picked_up', label: 'Picked Up' },
  { key: 'returned', label: 'Returned' },
  { key: 'late_return', label: 'Late Return' },
  { key: 'cancelled', label: 'Cancelled' },
]

function fmtDate(d) {
  return d
    ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'
}

export default function RentalsPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (search) params.set('search', search)
    params.set('ordering', '-created_at')
    api
      .get(`/dashboard/orders/?${params.toString()}`)
      .then((res) => {
        const data = res.data
        setOrders(Array.isArray(data) ? data : data.results || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [status, search])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Rental Orders</h1>
        <p className="mt-1 text-sm text-gray-500">All rental orders and their current status.</p>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatus(f.key)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
                status === f.key ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto max-w-xs w-full">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search order or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-sm">No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Order</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Customer</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Pickup</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Return</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">Total</th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-gray-900">{o.order_reference || `#${o.id}`}</td>
                    <td className="px-4 py-4 text-gray-700">{o.customer_name || 'Customer'}</td>
                    <td className="px-4 py-4"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-4 text-gray-500">{fmtDate(o.pickup_date)}</td>
                    <td className="px-4 py-4 text-gray-500">{fmtDate(o.return_date)}</td>
                    <td className="px-4 py-4 text-right font-semibold text-gray-800">
                      ₹{Number(o.total_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link href={`/rentals/${o.id}`} className="text-sm font-semibold text-purple-700 hover:text-purple-900">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
