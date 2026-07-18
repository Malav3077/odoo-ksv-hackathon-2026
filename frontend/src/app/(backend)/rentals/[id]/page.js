'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import StatusBadge from '@/components/StatusBadge'

function fmtDate(d) {
  return d
    ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'
}

function money(v) {
  return '₹' + Number(v || 0).toLocaleString('en-IN')
}

const ACTIONS = {
  quotation: [
    { act: 'send-quotation', label: 'Send Quotation', color: 'bg-purple-700 hover:bg-purple-800' },
    { act: 'confirm', label: 'Confirm Order', color: 'bg-indigo-700 hover:bg-indigo-800' },
  ],
  quotation_sent: [{ act: 'confirm', label: 'Confirm Order', color: 'bg-indigo-700 hover:bg-indigo-800' }],
  reserved: [{ act: 'pickup', label: 'Confirm Pickup', color: 'bg-indigo-700 hover:bg-indigo-800' }],
  picked_up: [{ act: 'return', label: 'Confirm Return', color: 'bg-green-600 hover:bg-green-700' }],
  late_pickup: [{ act: 'return', label: 'Confirm Return', color: 'bg-green-600 hover:bg-green-700' }],
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    api
      .get(`/orders/${id}/`)
      .then((res) => setOrder(res.data))
      .catch(() => setError('Order not found or access denied.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function runAction(act) {
    setBusy(true)
    setError('')
    try {
      await api.post(`/orders/${id}/${act}/`)
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Action failed.')
    } finally {
      setBusy(false)
    }
  }

  async function cancelOrder() {
    if (!confirm('Cancel this order?')) return
    runAction('cancel')
  }

  async function downloadInvoice() {
    try {
      const inv = await api.get(`/orders/${id}/invoice/`)
      const res = await api.get(`/invoices/${inv.data.id}/pdf/`, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(inv.data.invoice_number || 'invoice').replace(/\//g, '-')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Invoice not available yet.')
    }
  }

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
  if (!order) return <div className="py-16 text-center text-gray-400">{error || 'Not found'}</div>

  const actions = ACTIONS[order.status] || []
  const canCancel = ['quotation', 'quotation_sent', 'reserved', 'picked_up', 'late_pickup'].includes(order.status)
  const settled = ['returned', 'late_return'].includes(order.status)

  return (
    <div className="max-w-4xl">
      <Link href="/rentals" className="text-sm text-purple-700 hover:text-purple-900">&larr; Back to orders</Link>

      <div className="mt-3 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">{order.order_reference || `Order #${order.id}`}</h1>
          <StatusBadge status={order.status} />
        </div>
        <button onClick={downloadInvoice} className="rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 text-sm font-semibold px-4 py-2 transition">
          Download Invoice PDF
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>
      )}

      <div className="grid gap-5 sm:grid-cols-3 mb-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-gray-400">Customer</p>
          <p className="mt-1 font-semibold text-gray-900">{order.customer_name || 'Customer'}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-gray-400">Pickup</p>
          <p className="mt-1 text-sm font-medium text-gray-800">{fmtDate(order.pickup_date)}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-gray-400">Return</p>
          <p className="mt-1 text-sm font-medium text-gray-800">{fmtDate(order.return_date)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Product</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Qty</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">Unit Price</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(order.lines || []).map((l) => (
              <tr key={l.id}>
                <td className="px-5 py-3 font-medium text-gray-800">{l.product_name || 'Product'}</td>
                <td className="px-4 py-3 text-gray-600">{l.quantity}</td>
                <td className="px-4 py-3 text-right text-gray-600">{money(l.unit_price)}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800">{money(l.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm mb-6 max-w-sm ml-auto space-y-2 text-sm">
        <div className="flex justify-between text-gray-600"><span>Untaxed</span><span>{money(order.untaxed_amount)}</span></div>
        <div className="flex justify-between text-gray-600"><span>Tax</span><span>{money(order.tax_amount)}</span></div>
        <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2"><span>Total</span><span>{money(order.total_amount)}</span></div>
        <div className="flex justify-between text-gray-600 pt-1"><span>Security Deposit</span><span>{money(order.security_deposit_held)}</span></div>
        {settled && (
          <>
            {Number(order.late_fee_charged) > 0 && (
              <div className="flex justify-between text-red-600"><span>Late Fee</span><span>-{money(order.late_fee_charged)}</span></div>
            )}
            <div className="flex justify-between font-semibold text-green-700"><span>Deposit Refunded</span><span>{money(order.deposit_refunded)}</span></div>
          </>
        )}
      </div>

      {(actions.length > 0 || canCancel) && (
        <div className="flex flex-wrap gap-3">
          {actions.map((a) => (
            <button key={a.act} onClick={() => runAction(a.act)} disabled={busy}
              className={`rounded-xl text-white text-sm font-semibold px-5 py-2.5 transition disabled:opacity-50 ${a.color}`}>
              {busy ? 'Processing...' : a.label}
            </button>
          ))}
          {canCancel && (
            <button onClick={cancelOrder} disabled={busy}
              className="rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold px-5 py-2.5 transition disabled:opacity-50">
              Cancel Order
            </button>
          )}
        </div>
      )}
    </div>
  )
}
