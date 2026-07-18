'use client'
import { useState, useEffect } from 'react'
import api from '@/lib/api'

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}

const STATUS_STYLE = {
  draft: 'bg-gray-100 text-gray-600',
  posted: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(null)

  useEffect(() => {
    api
      .get('/invoices/')
      .then((res) => {
        const data = res.data
        setInvoices(Array.isArray(data) ? data : data.results || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function download(inv) {
    setDownloading(inv.id)
    try {
      const res = await api.get(`/invoices/${inv.id}/pdf/`, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(inv.invoice_number || 'invoice').replace(/\//g, '-')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Failed to download invoice.')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
        <p className="mt-1 text-sm text-gray-500">All generated invoices. Download any as a PDF.</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-sm">No invoices yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Invoice</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Order</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Customer</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">Total</th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-gray-900">{inv.invoice_number}</td>
                    <td className="px-4 py-4 text-gray-600">{inv.order_reference}</td>
                    <td className="px-4 py-4 text-gray-600">{inv.customer_name}</td>
                    <td className="px-4 py-4 text-gray-500">{fmtDate(inv.invoice_date)}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[inv.status] || 'bg-gray-100 text-gray-600'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-gray-800">
                      ₹{Number(inv.total_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => download(inv)}
                        disabled={downloading === inv.id}
                        className="rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-semibold px-3 py-1.5 transition disabled:opacity-50"
                      >
                        {downloading === inv.id ? '...' : 'PDF'}
                      </button>
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
