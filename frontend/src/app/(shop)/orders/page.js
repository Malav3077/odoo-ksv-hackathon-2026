'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import api from '@/lib/api'


const STATUS_CONFIG = {
  quotation:    { label: 'Quotation',    color: 'bg-gray-100 text-gray-600',     dot: 'bg-gray-400'   },
  sent:         { label: 'Sent',         color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500'   },
  reserved:     { label: 'Reserved',     color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  picked_up:    { label: 'Picked Up',    color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  late_pickup:  { label: 'Late Pickup',  color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
  returned:     { label: 'Returned',     color: 'bg-green-100 text-green-700',   dot: 'bg-green-500'  },
  late_return:  { label: 'Late Return',  color: 'bg-red-100 text-red-600',       dot: 'bg-red-500'    },
  cancelled:    { label: 'Cancelled',    color: 'bg-gray-100 text-gray-500',     dot: 'bg-gray-400'   },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function OrderCard({ order }) {
  const items = order.items || order.order_items || []
  const total = Number(order.total_amount || order.total || 0)
  const deposit = Number(order.deposit_total || order.deposit_amount || 0)
  const invoiceUrl = order.invoice_url || order.invoice || null

  const dateStr = order.created_at
    ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  return (
    <Link href={`/orders/${order.id}`} className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-indigo-200 hover:shadow-md transition-all duration-200 block">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-gray-900 text-sm">Order #{order.id}</span>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-gray-400">{dateStr}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-purple-700 text-sm">₹{total.toLocaleString('en-IN')}</p>
          {deposit > 0 && (
            <p className="text-xs text-gray-400">Deposit: ₹{deposit.toLocaleString('en-IN')}</p>
          )}
        </div>
      </div>

      {/* Items */}
      {items.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {items.slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex justify-between text-xs text-gray-600">
              <span className="truncate mr-3">
                {item.product?.name || item.product_name || `Item ${idx + 1}`}
                {item.quantity > 1 && ` ×${item.quantity}`}
              </span>
              <span className="text-gray-400 flex-shrink-0">{item.rental_days}d</span>
            </div>
          ))}
          {items.length > 3 && (
            <p className="text-xs text-gray-400">+{items.length - 3} more item{items.length - 3 !== 1 ? 's' : ''}</p>
          )}
        </div>
      )}

      {/* Return date */}
      {order.return_date && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Return by: {new Date(order.return_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
        {invoiceUrl && (
          <a
            href={invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Invoice
          </a>
        )}

        {order.late_fee && Number(order.late_fee) > 0 && (
          <span className="text-xs bg-red-50 text-red-600 font-medium px-3 py-1.5 rounded-lg">
            Late fee: ₹{Number(order.late_fee).toLocaleString('en-IN')}
          </span>
        )}

        {order.deposit_refunded === false && order.status === 'returned' && (
          <span className="text-xs bg-amber-50 text-amber-700 font-medium px-3 py-1.5 rounded-lg ml-auto">
            Deposit pending refund
          </span>
        )}
      </div>
    </Link>
  )
}

const TABS = ['All', 'Active', 'Returned', 'Cancelled']

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('All')

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true)
      setError('')
      try {
        const res = await api.get('/orders/')
        const data = res.data
        setOrders(Array.isArray(data) ? data : data.results || [])
      } catch {
        setError('Failed to load orders.')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  function filterOrders(orders, tab) {
    switch (tab) {
      case 'Active':
        return orders.filter(o => ['reserved', 'picked_up', 'late_pickup', 'sent'].includes(o.status))
      case 'Returned':
        return orders.filter(o => ['returned', 'late_return'].includes(o.status))
      case 'Cancelled':
        return orders.filter(o => o.status === 'cancelled')
      default:
        return orders
    }
  }

  const displayed = filterOrders(orders, tab)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        {orders.length > 0 && (
          <span className="text-sm text-gray-400">{orders.length} total</span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              tab === t ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
            {t !== 'All' && (
              <span className="ml-1.5 text-xs text-gray-400">
                ({filterOrders(orders, t).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 h-36 animate-pulse" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-gray-700 font-semibold text-lg mb-1">
            {tab === 'All' ? 'No orders yet' : `No ${tab.toLowerCase()} orders`}
          </h3>
          <p className="text-gray-400 text-sm mb-5">
            {tab === 'All' ? "You haven't placed any orders yet." : `No orders in this category.`}
          </p>
          {tab === 'All' && (
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-600 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm"
            >
              Browse Products
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
