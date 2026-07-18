'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import api from '@/lib/api'

const CATEGORIES = ['All', 'Electronics', 'Furniture', 'Vehicles', 'Tools', 'Sports', 'Events', 'Other']

function ProductCard({ product }) {
  const depositBadge = product.deposit_amount > 0
  return (
    <Link
      href={`/product/${product.id}`}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-purple-200 transition-all duration-200 group flex flex-col"
    >
      {/* Image */}
      <div className="relative bg-gray-100 h-48 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">No image</span>
          </div>
        )}
        {product.category && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-purple-100">
            {product.category}
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center">
            <span className="bg-white text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-purple-700 transition-colors">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-gray-500 text-xs mb-3 line-clamp-2 flex-1">{product.description}</p>
        )}

        <div className="mt-auto">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-purple-700 font-bold text-lg">₹{Number(product.price_per_day).toLocaleString('en-IN')}</span>
                <span className="text-gray-400 text-xs">/day</span>
              </div>
              {depositBadge && (
                <span className="text-gray-400 text-xs">Deposit: ₹{Number(product.deposit_amount).toLocaleString('en-IN')}</span>
              )}
            </div>
            <div className="bg-purple-700 group-hover:bg-purple-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
              View
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-gray-200 rounded w-24" />
          <div className="h-8 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  )
}

export default function ShopPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (debouncedSearch) params.search = debouncedSearch
      if (category !== 'All') params.category = category
      const res = await api.get('/products/', { params })
      const data = res.data
      setProducts(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      setError('Failed to load products. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, category])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const filtered = products // server already filters; client-side safety net
  const isEmpty = !loading && filtered.length === 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── HERO BANNER ── */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-700 rounded-2xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-purple-600 opacity-20 rounded-full" />
        <div className="absolute -left-6 -bottom-10 w-36 h-36 bg-purple-500 opacity-15 rounded-full" />
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Browse Products for Rent</h1>
          <p className="text-purple-200 text-sm sm:text-base">Rent what you need, when you need it — hassle-free.</p>
        </div>
      </div>

      {/* ── SEARCH + FILTER BAR ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                category === cat
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'bg-white border border-gray-300 text-gray-600 hover:border-purple-400 hover:text-purple-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── RESULTS COUNT ── */}
      {!loading && !error && (
        <p className="text-sm text-gray-500 mb-4">
          {filtered.length === 0
            ? 'No products found'
            : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} available`}
          {category !== 'All' && ` in ${category}`}
          {debouncedSearch && ` matching "${debouncedSearch}"`}
        </p>
      )}

      {/* ── ERROR ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
          <button onClick={fetchProducts} className="ml-auto text-red-600 font-medium underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* ── PRODUCT GRID ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : isEmpty ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-gray-700 font-semibold text-lg mb-1">No products found</h3>
          <p className="text-gray-400 text-sm mb-4">
            {debouncedSearch || category !== 'All'
              ? 'Try a different search or category.'
              : 'No products are available right now.'}
          </p>
          {(debouncedSearch || category !== 'All') && (
            <button
              onClick={() => { setSearch(''); setCategory('All') }}
              className="text-sm text-purple-600 font-medium hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
