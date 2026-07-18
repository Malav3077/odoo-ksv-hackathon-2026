'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

function CartItem({ item, onUpdate, onRemove }) {
  const [updating, setUpdating] = useState(false)

  async function changeQty(newQty) {
    if (newQty < 1) return
    setUpdating(true)
    await onUpdate(item.id, newQty)
    setUpdating(false)
  }

  async function changeDays(newDays) {
    if (newDays < 1) return
    setUpdating(true)
    await onUpdate(item.id, item.quantity, newDays)
    setUpdating(false)
  }

  const pricePerDay = Number(item.product?.price_per_day || item.price_per_day || 0)
  const subtotal = pricePerDay * item.rental_days * item.quantity

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-4 relative">
      {/* Image */}
      <div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
        {item.product?.image ? (
          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">
              {item.product?.name || item.product_name || 'Product'}
            </h3>
            {item.product?.category && (
              <span className="text-xs text-gray-400">{item.product.category}</span>
            )}
          </div>
          <button
            onClick={() => onRemove(item.id)}
            className="text-gray-300 hover:text-red-500 transition flex-shrink-0 p-1"
            title="Remove"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-4 items-center">
          {/* Quantity */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Qty:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => changeQty(item.quantity - 1)}
                disabled={updating || item.quantity <= 1}
                className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center text-xs text-gray-600 hover:border-purple-400 disabled:opacity-40 transition"
              >−</button>
              <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
              <button
                onClick={() => changeQty(item.quantity + 1)}
                disabled={updating}
                className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center text-xs text-gray-600 hover:border-purple-400 disabled:opacity-40 transition"
              >+</button>
            </div>
          </div>

          {/* Rental days */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Days:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => changeDays(item.rental_days - 1)}
                disabled={updating || item.rental_days <= 1}
                className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center text-xs text-gray-600 hover:border-purple-400 disabled:opacity-40 transition"
              >−</button>
              <span className="w-6 text-center text-sm font-medium">{item.rental_days}</span>
              <button
                onClick={() => changeDays(item.rental_days + 1)}
                disabled={updating}
                className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center text-xs text-gray-600 hover:border-purple-400 disabled:opacity-40 transition"
              >+</button>
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-400">₹{pricePerDay.toLocaleString('en-IN')}/day × {item.rental_days}d × {item.quantity}</span>
          <span className="font-bold text-purple-700 text-sm">₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {updating && (
        <div className="absolute inset-0 bg-white/60 rounded-2xl flex items-center justify-center">
          <svg className="animate-spin w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      )}
    </div>
  )
}

export default function CartPage() {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function fetchCart() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/cart/')
      const data = res.data
      setItems(Array.isArray(data) ? data : data.items || data.results || [])
    } catch (err) {
      setError('Failed to load your cart.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCart() }, [])

  async function handleUpdate(itemId, quantity, rentalDays) {
    try {
      await api.patch(`/cart/${itemId}/`, {
        ...(quantity !== undefined && { quantity }),
        ...(rentalDays !== undefined && { rental_days: rentalDays }),
      })
      await fetchCart()
    } catch {
      // ignore
    }
  }

  async function handleRemove(itemId) {
    try {
      await api.delete(`/cart/${itemId}/`)
      setItems(prev => prev.filter(i => i.id !== itemId))
    } catch {
      await fetchCart()
    }
  }

  const rentalTotal = items.reduce((sum, item) => {
    const ppd = Number(item.product?.price_per_day || item.price_per_day || 0)
    return sum + ppd * item.rental_days * item.quantity
  }, 0)

  const depositTotal = items.reduce((sum, item) => {
    return sum + Number(item.product?.deposit_amount || item.deposit_amount || 0)
  }, 0)

  const grandTotal = rentalTotal + depositTotal

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="h-8 bg-gray-200 rounded w-32 mb-6 animate-pulse" />
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 h-28 animate-pulse" />
        ))}
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
        {items.length > 0 && (
          <span className="bg-purple-100 text-purple-700 text-sm font-semibold px-3 py-1 rounded-full">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <span>⚠️</span><span>{error}</span>
          <button onClick={fetchCart} className="ml-auto underline font-medium">Retry</button>
        </div>
      )}

      {items.length === 0 && !error ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-gray-700 font-semibold text-lg mb-1">Your cart is empty</h3>
          <p className="text-gray-400 text-sm mb-5">Browse products and add items to rent.</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-600 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => (
              <CartItem
                key={item.id}
                item={item}
                onUpdate={handleUpdate}
                onRemove={handleRemove}
              />
            ))}

            <Link
              href="/shop"
              className="inline-flex items-center gap-1 text-purple-600 text-sm font-medium hover:underline mt-2"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-24">
              <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Rental total</span>
                  <span>₹{rentalTotal.toLocaleString('en-IN')}</span>
                </div>
                {depositTotal > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Security deposit</span>
                    <span>₹{depositTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span>
                  <span className="text-purple-700">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {depositTotal > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  Deposit of ₹{depositTotal.toLocaleString('en-IN')} is fully refundable on timely return.
                </p>
              )}

              <button
                onClick={() => router.push('/checkout')}
                className="w-full mt-5 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg text-sm"
              >
                Proceed to Checkout →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
