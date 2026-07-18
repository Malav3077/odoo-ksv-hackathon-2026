'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rentalDays, setRentalDays] = useState(1)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [addSuccess, setAddSuccess] = useState(false)
  const [addError, setAddError] = useState('')

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true)
      try {
        const res = await api.get(`/products/${id}/`)
        setProduct(res.data)
      } catch (err) {
        setError('Product not found or unavailable.')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  async function handleAddToCart() {
    setAdding(true)
    setAddError('')
    setAddSuccess(false)
    try {
      await api.post('/cart/add/', {
        product_id: parseInt(id),
        quantity,
        rental_days: rentalDays,
      })
      setAddSuccess(true)
      setTimeout(() => setAddSuccess(false), 3000)
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Failed to add to cart.'
      setAddError(msg)
    } finally {
      setAdding(false)
    }
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-200 rounded-2xl h-80" />
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  )

  if (error) return (
    <div className="max-w-5xl mx-auto px-4 py-10 text-center">
      <div className="text-5xl mb-4">😕</div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">{error}</h2>
      <Link href="/shop" className="text-purple-600 hover:underline text-sm font-medium">← Back to Products</Link>
    </div>
  )

  if (!product) return null

  const pricePerDay = Number(product.price_per_day)
  const deposit = Number(product.deposit_amount || 0)
  const totalRental = pricePerDay * rentalDays * quantity
  const totalWithDeposit = totalRental + deposit

  const inStock = product.stock === undefined || product.stock > 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/shop" className="hover:text-purple-600 transition">Products</Link>
        <span>/</span>
        {product.category && (
          <>
            <span className="hover:text-purple-600 cursor-pointer">{product.category}</span>
            <span>/</span>
          </>
        )}
        <span className="text-gray-700 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* ── IMAGE ── */}
        <div className="space-y-3">
          <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-square max-h-96 flex items-center justify-center">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-gray-300">
                <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">No image available</span>
              </div>
            )}
          </div>

          {/* Attributes */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Specifications</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(product.attributes).map(([key, val]) => (
                  <div key={key} className="text-xs">
                    <span className="text-gray-400 capitalize">{key}: </span>
                    <span className="text-gray-700 font-medium">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── DETAILS ── */}
        <div>
          {product.category && (
            <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              {product.category}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

          {product.description && (
            <p className="text-gray-500 text-sm leading-relaxed mb-4">{product.description}</p>
          )}

          {/* Stock badge */}
          <div className="flex items-center gap-2 mb-5">
            <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`} />
              {inStock ? `${product.stock ?? 'In'} Stock` : 'Out of Stock'}
            </span>
            {product.periodicity && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                Min: {product.periodicity}
              </span>
            )}
          </div>

          {/* Pricing */}
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 mb-5">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-purple-700">₹{pricePerDay.toLocaleString('en-IN')}</span>
              <span className="text-gray-500 text-sm">/ day</span>
            </div>
            {deposit > 0 && (
              <p className="text-sm text-gray-600">
                Security deposit: <span className="font-semibold text-gray-800">₹{deposit.toLocaleString('en-IN')}</span>
                <span className="text-xs text-gray-400 ml-1">(refundable)</span>
              </p>
            )}
            {product.late_fee_per_hour && (
              <p className="text-xs text-red-500 mt-1">
                Late fee: ₹{Number(product.late_fee_per_hour).toLocaleString('en-IN')}/hr if returned late
              </p>
            )}
          </div>

          {/* ── RENTAL CONFIG ── */}
          <div className="space-y-4 mb-5">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:border-purple-400 hover:text-purple-700 transition font-bold"
                >−</button>
                <span className="w-8 text-center font-semibold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-9 h-9 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:border-purple-400 hover:text-purple-700 transition font-bold"
                >+</button>
              </div>
            </div>

            {/* Rental days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Rental Duration</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setRentalDays(d => Math.max(1, d - 1))}
                  className="w-9 h-9 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:border-purple-400 hover:text-purple-700 transition font-bold"
                >−</button>
                <span className="w-24 text-center font-semibold text-gray-900">{rentalDays} day{rentalDays !== 1 ? 's' : ''}</span>
                <button
                  onClick={() => setRentalDays(d => d + 1)}
                  className="w-9 h-9 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:border-purple-400 hover:text-purple-700 transition font-bold"
                >+</button>
              </div>

              {/* Quick select */}
              <div className="flex gap-2 mt-2">
                {[1, 3, 7, 14, 30].map(d => (
                  <button
                    key={d}
                    onClick={() => setRentalDays(d)}
                    className={`text-xs px-2.5 py-1 rounded-lg transition ${rentalDays === d ? 'bg-purple-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700'}`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── PRICE BREAKDOWN ── */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5 text-sm space-y-1.5">
            <div className="flex justify-between text-gray-600">
              <span>₹{pricePerDay.toLocaleString('en-IN')} × {rentalDays} day{rentalDays !== 1 ? 's' : ''} × {quantity} unit{quantity !== 1 ? 's' : ''}</span>
              <span>₹{totalRental.toLocaleString('en-IN')}</span>
            </div>
            {deposit > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Security deposit</span>
                <span>₹{deposit.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-1.5 flex justify-between font-bold text-gray-900">
              <span>Total payable</span>
              <span className="text-purple-700">₹{totalWithDeposit.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* ── FEEDBACK ── */}
          {addSuccess && (
            <div className="mb-3 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl text-sm">
              <span>✅</span>
              <span>Added to cart!</span>
              <Link href="/cart" className="ml-auto font-medium underline text-green-700">View Cart →</Link>
            </div>
          )}
          {addError && (
            <div className="mb-3 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-sm">
              <span>⚠️</span>
              <span>{addError}</span>
            </div>
          )}

          {/* ── CTA BUTTONS ── */}
          <div className="space-y-3">
            <button
              onClick={handleAddToCart}
              disabled={adding || !inStock}
              className="w-full bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {adding ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Adding...
                </>
              ) : !inStock ? 'Out of Stock' : 'Add to Cart'}
            </button>

            <Link
              href="/cart"
              className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition text-sm"
            >
              View Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
