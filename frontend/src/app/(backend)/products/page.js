'use client'
import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import AddProductModal from '@/components/AddProductModal'

function StockBadge({ qty }) {
  if (qty === 0) return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />Out of Stock</span>
  if (qty <= 3) return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Low: {qty}</span>
  return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />{qty} In Stock</span>
}

function StockEditor({ product, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(String(product.quantity_on_hand))
  const [saving, setSaving] = useState(false)

  async function save() {
    const n = parseInt(val, 10)
    if (isNaN(n) || n < 0) return
    setSaving(true)
    try {
      await api.patch(`/products/${product.id}/`, { quantity_on_hand: n })
      onUpdate(product.id, n)
      setEditing(false)
    } catch {
      alert('Failed to update stock.')
    } finally {
      setSaving(false)
    }
  }

  if (!editing) return (
    <div className="flex items-center gap-2">
      <StockBadge qty={product.quantity_on_hand} />
      <button onClick={() => { setVal(String(product.quantity_on_hand)); setEditing(true) }}
        className="text-xs text-gray-400 hover:text-indigo-600 transition" title="Edit stock">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
    </div>
  )

  return (
    <div className="flex items-center gap-1.5">
      <input type="number" min="0" value={val} onChange={e => setVal(e.target.value)}
        className="w-16 rounded-lg border border-indigo-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        autoFocus onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }} />
      <button onClick={save} disabled={saving}
        className="rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition">
        {saving ? '...' : 'Save'}
      </button>
      <button onClick={() => setEditing(false)}
        className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-50 transition">
        Cancel
      </button>
    </div>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/products/')
      const data = res.data
      setProducts(Array.isArray(data) ? data : data.results || [])
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  function handleUpdate(id, newQty) {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, quantity_on_hand: newQty } : p))
  }

  async function handlePublish(product) {
    try {
      const res = await api.post(`/products/${product.id}/publish/`, { is_published: !product.is_published })
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_published: res.data.is_published } : p))
    } catch (err) {
      alert(err.response?.status === 403 ? 'Only an admin can publish products.' : 'Could not update.')
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category_name || '').toLowerCase().includes(search.toLowerCase())
  )

  const outOfStock = products.filter(p => p.quantity_on_hand === 0).length
  const lowStock = products.filter(p => p.quantity_on_hand > 0 && p.quantity_on_hand <= 3).length

  return (
    <div>
      <AddProductModal open={showAdd} onClose={() => setShowAdd(false)} onCreated={load} />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products & Stock</h1>
          <p className="mt-1 text-sm text-gray-500">Click the edit icon to update stock for any product.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => setShowAdd(true)} className="rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold px-4 py-1.5 transition">
            + Add Product
          </button>
          {outOfStock > 0 && (
            <span className="rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-red-700 font-medium">
              {outOfStock} Out of Stock
            </span>
          )}
          {lowStock > 0 && (
            <span className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-amber-700 font-medium">
              {lowStock} Low Stock
            </span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search products..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1,2,3,4,5].map(i => <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-sm">{search ? 'No products match your search.' : 'No products found.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Product</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Category</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">Price/Day</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Stock</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                            <svg className="h-5 w-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{product.name}</p>
                          {product.rental_config?.security_deposit_amount > 0 && (
                            <p className="text-xs text-gray-400">Deposit: ₹{Number(product.rental_config.security_deposit_amount).toLocaleString('en-IN')}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                        {product.category_name || (typeof product.category === 'object' ? product.category?.name : '—')}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-gray-800">
                      ₹{Number(product.sales_price).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-4">
                      <StockEditor product={product} onUpdate={handleUpdate} />
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handlePublish(product)}
                        title="Click to toggle (admin only)"
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition hover:opacity-80 ${product.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                      >
                        {product.is_published ? 'Published' : 'Draft — Publish?'}
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
