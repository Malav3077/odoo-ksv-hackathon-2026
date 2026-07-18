'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import api from '@/lib/api'

function ProductCard({ product }) {
  const price = Number(product.sales_price || 0)
  const deposit = Number(product.rental_config?.security_deposit_amount || 0)
  const inStock = (product.quantity_on_hand ?? 1) > 0

  return (
    <Link
      href={`/product/${product.id}`}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all duration-200 group flex flex-col"
    >
      <div className="relative bg-gray-100 h-48 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
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
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-100">
            {typeof product.category === 'object' ? product.category.name : product.category}
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center">
            <span className="bg-white text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-indigo-700 transition-colors">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-gray-500 text-xs mb-3 line-clamp-2 flex-1">{product.description}</p>
        )}
        <div className="mt-auto">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-indigo-700 font-bold text-lg">₹{price.toLocaleString('en-IN')}</span>
                <span className="text-gray-400 text-xs">/day</span>
              </div>
              {deposit > 0 && (
                <span className="text-gray-400 text-xs">Deposit: ₹{deposit.toLocaleString('en-IN')}</span>
              )}
            </div>
            <div className="bg-indigo-700 group-hover:bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
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
  const [categoryId, setCategoryId] = useState(null)
  const [categoryLabel, setCategoryLabel] = useState('All')
  const [categories, setCategories] = useState([])
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    api.get('/categories/').then(res => {
      const data = res.data
      setCategories(Array.isArray(data) ? data : data.results || [])
    }).catch(() => {})
  }, [])

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
      if (categoryId !== null) params.category = categoryId
      const res = await api.get('/products/', { params })
      const data = res.data
      setProducts(Array.isArray(data) ? data : data.results || [])
    } catch {
      setError('Failed to load products. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, categoryId])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  function selectCategory(id, label) {
    setCategoryId(id)
    setCategoryLabel(label)
  }

  const isEmpty = !loading && products.length === 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 rounded-2xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-indigo-600 opacity-20 rounded-full" />
        <div className="absolute -left-6 -bottom-10 w-36 h-36 bg-indigo-500 opacity-15 rounded-full" />
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Browse Products for Rent</h1>
          <p className="text-indigo-200 text-sm sm:text-base">Rent what you need, when you need it — hassle-free.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => selectCategory(null, 'All')}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              categoryId === null
                ? 'bg-indigo-700 text-white shadow-sm'
                : 'bg-white border border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-700'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => selectCategory(cat.id, cat.name)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                categoryId === cat.id
                  ? 'bg-indigo-700 text-white shadow-sm'
                  : 'bg-white border border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {!loading && !error && (
        <p className="text-sm text-gray-500 mb-4">
          {products.length === 0
            ? 'No products found'
            : `${products.length} product${products.length !== 1 ? 's' : ''} available`}
          {categoryId !== null && ` in ${categoryLabel}`}
          {debouncedSearch && ` matching "${debouncedSearch}"`}
        </p>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2">
          <span>⚠️</span><span>{error}</span>
          <button onClick={fetchProducts} className="ml-auto text-red-600 font-medium underline hover:no-underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : isEmpty ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-gray-700 font-semibold text-lg mb-1">No products found</h3>
          <p className="text-gray-400 text-sm mb-4">
            {debouncedSearch || categoryId !== null ? 'Try a different search or category.' : 'No products are available right now.'}
          </p>
          {(debouncedSearch || categoryId !== null) && (
            <button onClick={() => { setSearch(''); selectCategory(null, 'All') }} className="text-sm text-indigo-600 font-medium hover:underline">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
