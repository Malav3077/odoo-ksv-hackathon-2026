'use client'
import { useState, useEffect } from 'react'
import api from '@/lib/api'
import StatusBadge from '@/components/StatusBadge'

const TABS = [
  { key: 'reserved',   label: 'Pending Pickups' },
  { key: 'picked_up',  label: 'Active Rentals' },
  { key: 'returned',   label: 'Returned' },
  { key: 'cancelled',  label: 'Cancelled' },
]

function OrderCard({ order, onAction, actionLoading }) {
  const customer = order.customer?.first_name
    ? `${order.customer.first_name} ${order.customer.last_name || ''}`.trim()
    : order.customer?.username || 'Customer'
  const lines = order.lines || order.order_items || []
  const total = '₹' + Number(order.total_amount || 0).toLocaleString('en-IN')
  const deposit = Number(order.security_deposit_held || 0)
  const pickupDate = order.pickup_date ? new Date(order.pickup_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
  const returnDate = order.return_date ? new Date(order.return_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
  const isLoading = actionLoading === order.id

  const now = new Date()
  const isOverdue = order.return_date && new Date(order.return_date) < now && ['picked_up', 'late_pickup'].includes(order.status)

  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm transition-all ${isOverdue ? 'border-red-200 bg-red-50/20' : 'border-gray-100'}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-gray-900 text-sm">{order.order_reference || `#${order.id}`}</span>
            <StatusBadge status={order.status} />
            {isOverdue && <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">Overdue</span>}
          </div>
          <p className="text-sm text-gray-700 font-medium">{customer}</p>
          <p className="text-xs text-gray-400 mt-0.5">Pickup: {pickupDate} · Return: {returnDate}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-gray-900">{total}</p>
          {deposit > 0 && <p className="text-xs text-gray-400">Deposit: ₹{deposit.toLocaleString('en-IN')}</p>}
        </div>
      </div>

      {lines.length > 0 && (
        <div className="mb-3 space-y-1">
          {lines.slice(0, 3).map((line, idx) => (
            <div key={idx} className="flex justify-between text-xs text-gray-600">
              <span className="truncate mr-3">{line.product?.name || `Item ${idx + 1}`}{line.quantity > 1 ? ` ×${line.quantity}` : ''}</span>
              <span className="text-gray-400 flex-shrink-0">₹{Number(line.unit_price || 0).toLocaleString('en-IN')}/day</span>
            </div>
          ))}
          {lines.length > 3 && <p className="text-xs text-gray-400">+{lines.length - 3} more</p>}
        </div>
      )}

      <div className="flex gap-2 border-t border-gray-100 pt-3">
        {order.status === 'reserved' && (
          <button onClick={() => onAction(order.id, 'pickup')} disabled={isLoading}
            className="flex-1 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold py-2 transition disabled:opacity-50">
            {isLoading ? 'Processing...' : 'Confirm Pickup'}
          </button>
        )}
        {['picked_up', 'late_pickup'].includes(order.status) && (
          <button onClick={() => onAction(order.id, 'return')} disabled={isLoading}
            className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 transition disabled:opacity-50">
            {isLoading ? 'Processing...' : 'Confirm Return'}
          </button>
        )}
        {['reserved', 'picked_up', 'late_pickup'].includes(order.status) && (
          <button onClick={() => onAction(order.id, 'cancel')} disabled={isLoading}
            className="rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold px-4 py-2 transition disabled:opacity-50">
            Cancel
          </button>
        )}
        {['returned', 'late_return', 'cancelled'].includes(order.status) && (
          <div className="text-xs text-gray-400 py-2">
            {order.status === 'cancelled' ? 'Order cancelled' : `Returned · Refund: ₹${Number(order.deposit_refunded || 0).toLocaleString('en-IN')}`}
          </div>
        )}
      </div>
    </div>
  )
}

export default function PickupReturnPage() {
  const [activeTab, setActiveTab] = useState('reserved')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [counts, setCounts] = useState({})

  async function fetchOrders(status) {
    setLoading(true)
    try {
      const res = await api.get(`/dashboard/orders/?status=${status}&ordering=-created_at`)
      const data = res.data
      setOrders(Array.isArray(data) ? data : data.results || [])
    } catch {}
    finally { setLoading(false) }
  }

  async function fetchCounts() {
    try {
      const res = await api.get('/dashboard/stats/')
      const s = res.data
      setCounts({
        reserved:  s.upcoming_pickups || 0,
        picked_up: s.active_rentals || 0,
      })
    } catch {}
  }

  useEffect(() => {
    fetchOrders(activeTab)
    fetchCounts()
  }, [activeTab])

  async function handleAction(orderId, action) {
    setActionLoading(orderId)
    try {
      await api.post(`/orders/${orderId}/${action === 'return' ? 'return' : action}/`)
      fetchOrders(activeTab)
      fetchCounts()
    } catch (err) {
      alert(err.response?.data?.detail || 'Action failed.')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pickups &amp; Returns</h1>
        <p className="mt-1 text-sm text-gray-500">Manage order pickups, active rentals and returns.</p>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.key ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab.label}
            {counts[tab.key] > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No {TABS.find(t => t.key === activeTab)?.label.toLowerCase()}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} onAction={handleAction} actionLoading={actionLoading} />
          ))}
        </div>
      )}
    </div>
  )
}
