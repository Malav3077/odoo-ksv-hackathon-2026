'use client'
import { useState, useEffect } from 'react'
import api from '@/lib/api'

const EMPTY = {
  name: '',
  category: '',
  description: '',
  sales_price: '',
  quantity_on_hand: '',
  image_url: '',
  periodicity: 'daily',
  padding_time: '0',
  late_fee_per_hour: '',
  security_deposit_amount: '',
}

export default function AddProductModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY)
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(EMPTY)
    setError('')
    api
      .get('/categories/')
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : res.data.results || []))
      .catch(() => {})
  }, [open])

  if (!open) return null

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.sales_price) {
      setError('Name and price are required.')
      return
    }
    setSaving(true)
    try {
      await api.post('/products/', {
        name: form.name,
        category: form.category || null,
        description: form.description,
        sales_price: form.sales_price,
        quantity_on_hand: parseInt(form.quantity_on_hand || '0', 10),
        image_url: form.image_url,
        rental_config: {
          periodicity: form.periodicity,
          padding_time: parseInt(form.padding_time || '0', 10),
          late_fee_per_hour: form.late_fee_per_hour || 0,
          security_deposit_amount: form.security_deposit_amount || 0,
        },
      })
      onCreated && onCreated()
      onClose()
    } catch (err) {
      const data = err.response?.data
      setError(
        typeof data === 'object'
          ? Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`).join(' · ')
          : 'Could not create product.'
      )
    } finally {
      setSaving(false)
    }
  }

  const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Add Product</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">{error}</div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input name="name" value={form.name} onChange={change} className={input} placeholder="e.g. Sony DSLR Camera" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category" value={form.category} onChange={change} className={input}>
                <option value="">— none —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price / day (₹) *</label>
              <input name="sales_price" type="number" min="0" value={form.sales_price} onChange={change} className={input} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock quantity</label>
              <input name="quantity_on_hand" type="number" min="0" value={form.quantity_on_hand} onChange={change} className={input} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Periodicity</label>
              <select name="periodicity" value={form.periodicity} onChange={change} className={input}>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input name="image_url" value={form.image_url} onChange={change} className={input} placeholder="https://..." />
          </div>

          <div className="rounded-xl bg-purple-50 border border-purple-100 p-3 space-y-3">
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Rental Settings</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Grace (hrs)</label>
                <input name="padding_time" type="number" min="0" value={form.padding_time} onChange={change} className={input} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Late fee/hr</label>
                <input name="late_fee_per_hour" type="number" min="0" value={form.late_fee_per_hour} onChange={change} className={input} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Deposit</label>
                <input name="security_deposit_amount" type="number" min="0" value={form.security_deposit_amount} onChange={change} className={input} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-300 text-gray-700 font-medium py-2.5 hover:bg-gray-50 transition text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold py-2.5 transition disabled:opacity-50 text-sm">
              {saving ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
