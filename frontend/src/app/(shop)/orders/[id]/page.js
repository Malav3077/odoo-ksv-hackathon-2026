'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'

const STATUS_CONFIG = {
  quotation:   { label: 'Quotation',   color: 'bg-gray-100 text-gray-600',     dot: 'bg-gray-400'   },
  sent:        { label: 'Sent',        color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500'   },
  reserved:    { label: 'Reserved',    color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  picked_up:   { label: 'Picked Up',   color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  late_pickup: { label: 'Late Pickup', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
  returned:    { label: 'Returned',    color: 'bg-green-100 text-green-700',   dot: 'bg-green-500'  },
  late_return: { label: 'Late Return', color: 'bg-red-100 text-red-600',       dot: 'bg-red-500'    },
  cancelled:   { label: 'Cancelled',   color: 'bg-gray-100 text-gray-500',     dot: 'bg-gray-400'   },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${cfg.color}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">{value || '—'}</span>
    </div>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [returning, setReturning] = useState(false)
  const [returnMsg, setReturnMsg] = useState('')

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true)
      try {
        const res = await api.get(`/orders/${id}/`)
        setOrder(res.data)
        try {
          const inv = await api.get(`/orders/${id}/invoice/`)
          setInvoice(inv.data)
        } catch {}
      } catch (err) {
        setError(err.response?.status === 404 ? 'Order not found.' : 'Failed to load order.')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  async function handleReturn() {
    if (!window.confirm('Confirm return of all items in this order?')) return
    setReturning(true)
    setReturnMsg('')
    try {
      await api.post(`/orders/${id}/return/`)
      const res = await api.get(`/orders/${id}/`)
      setOrder(res.data)
      setReturnMsg('Return confirmed! Deposit refund will be processed shortly.')
    } catch (err) {
      setReturnMsg(err.response?.data?.detail || 'Return failed. Please contact support.')
    } finally {
      setReturning(false)
    }
  }

  async function handleDownloadInvoice() {
    if (!invoice?.id) return
    setInvoiceLoading(true)
    try {
      const res = await api.get(`/invoices/${invoice.id}/pdf/`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoice.invoice_number || id}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Invoice PDF not available yet.')
    } finally {
      setInvoiceLoading(false)
    }
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse space-y-4">
      <div className="h-6 bg-gray-200 rounded w-40" />
      <div className="h-48 bg-gray-200 rounded-2xl" />
      <div className="h-48 bg-gray-200 rounded-2xl" />
    </div>
  )

  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-center">
      <div className="text-5xl mb-4">📭</div>
      <p className="text-gray-600 font-medium mb-4">{error}</p>
      <Link href="/orders" className="text-indigo-600 hover:underline text-sm">← Back to Orders</Link>
    </div>
  )

  if (!order) return null

  const lines = order.lines || order.order_items || order.items || []
  const total = Number(order.total_amount || 0)
  const deposit = Number(order.security_deposit_held || order.deposit_total || 0)
  const lateFee = Number(order.late_fee_charged || 0)
  const depositRefunded = Number(order.deposit_refunded || 0)

  const createdAt = order.created_at
    ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'
  const pickupDate = order.pickup_date
    ? new Date(order.pickup_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null
  const returnDate = order.return_date
    ? new Date(order.return_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

      {/* Back */}
      <Link href="/orders" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline mb-6">
        ← Back to My Orders
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Order #{order.order_reference || order.id}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Placed on {createdAt}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Total</p>
            <p className="text-base font-bold text-indigo-700">₹{total.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Deposit</p>
            <p className="text-base font-bold text-gray-800">₹{deposit.toLocaleString('en-IN')}</p>
          </div>
          {lateFee > 0 && (
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-xs text-red-400 mb-1">Late Fee</p>
              <p className="text-base font-bold text-red-600">₹{lateFee.toLocaleString('en-IN')}</p>
            </div>
          )}
          {depositRefunded > 0 && (
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-xs text-green-500 mb-1">Refunded</p>
              <p className="text-base font-bold text-green-600">₹{depositRefunded.toLocaleString('en-IN')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Return action */}
      {['picked_up', 'late_pickup'].includes(order.status) && (
        <div className="bg-white rounded-2xl border border-indigo-200 p-5 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-semibold text-gray-900 text-sm">Ready to return?</p>
              <p className="text-xs text-gray-500 mt-0.5">Click below to confirm you have returned all items.</p>
            </div>
            <button onClick={handleReturn} disabled={returning}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm disabled:opacity-50 flex-shrink-0">
              {returning ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M20 9A8 8 0 006 5.3M4 15a8 8 0 0014 3.7"/>
                </svg>
              )}
              {returning ? 'Processing...' : 'Return Items'}
            </button>
          </div>
          {returnMsg && (
            <div className={`mt-3 text-sm px-4 py-2.5 rounded-xl ${returnMsg.includes('failed') || returnMsg.includes('error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {returnMsg}
            </div>
          )}
        </div>
      )}

      {/* Order lines */}
      {lines.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
          <h2 className="font-bold text-gray-900 mb-4">Items Rented</h2>
          <div className="space-y-3">
            {lines.map((line, idx) => {
              const name = line.product?.name || line.product_name || `Item ${idx + 1}`
              const price = Number(line.unit_price || line.sales_price || 0)
              const qty = line.quantity || 1
              const start = line.rental_start
                ? new Date(line.rental_start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                : null
              const end = line.rental_end
                ? new Date(line.rental_end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                : null
              const lineTotal = Number(line.subtotal || line.total || price * qty)

              return (
                <div key={idx} className="flex items-start justify-between gap-3 py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{name}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {qty > 1 && <span className="text-xs text-gray-400">Qty: {qty}</span>}
                      {start && end && (
                        <span className="text-xs text-gray-400">{start} → {end}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">₹{lineTotal.toLocaleString('en-IN')}</p>
                    {price > 0 && <p className="text-xs text-gray-400">₹{price.toLocaleString('en-IN')}/day</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Order info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 mb-3">Order Details</h2>
          <InfoRow label="Order Reference" value={order.order_reference} />
          <InfoRow label="Delivery Method" value={order.delivery_method === 'pickup' ? 'Store Pickup' : 'Home Delivery'} />
          {pickupDate && <InfoRow label="Pickup Date" value={pickupDate} />}
          {returnDate && <InfoRow label="Return Date" value={returnDate} />}
          <InfoRow label="Invoice Status" value={order.invoice_status || '—'} />
        </div>

        {/* Delivery address */}
        {order.delivery_address && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-900 mb-3">Delivery Address</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-800">{order.delivery_address.full_name}</p>
              <p>{order.delivery_address.address_line}</p>
              <p>{order.delivery_address.city}, {order.delivery_address.zip_code}</p>
              <p>{order.delivery_address.country}</p>
            </div>
          </div>
        )}
      </div>

      {/* Invoice */}
      {invoice && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">Invoice</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                #{invoice.invoice_number} · {invoice.invoice_date
                  ? new Date(invoice.invoice_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-indigo-700">₹{Number(invoice.total_amount || 0).toLocaleString('en-IN')}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {invoice.status === 'paid' ? 'Paid' : 'Pending'}
              </span>
            </div>
          </div>
          <button
            onClick={handleDownloadInvoice}
            disabled={invoiceLoading}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-2.5 rounded-xl transition text-sm border border-indigo-200 disabled:opacity-50"
          >
            {invoiceLoading ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            {invoiceLoading ? 'Downloading...' : 'Download Invoice PDF'}
          </button>
        </div>
      )}

      {!invoice && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-700 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Invoice is being generated. Check back shortly.
        </div>
      )}
    </div>
  )
}
