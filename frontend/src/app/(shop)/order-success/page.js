'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order')

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      {/* Success animation circle */}
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
      <p className="text-gray-500 text-sm mb-1">Your rental order has been placed successfully.</p>
      {orderId && (
        <p className="text-purple-700 font-semibold text-sm mb-6">Order #{orderId}</p>
      )}

      {/* What happens next */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 text-left mb-6">
        <h2 className="font-semibold text-gray-900 text-sm mb-3">What happens next?</h2>
        <div className="space-y-3">
          {[
            { step: '1', icon: '✅', text: 'Order confirmed & reserved for you' },
            { step: '2', icon: '📧', text: 'Invoice will be generated automatically' },
            { step: '3', icon: '🚚', text: 'Product delivered / ready for pickup' },
            { step: '4', icon: '🔄', text: 'Return product before your rental period ends' },
            { step: '5', icon: '💰', text: 'Deposit refunded after inspection' },
          ].map(item => (
            <div key={item.step} className="flex items-start gap-3">
              <span className="w-5 h-5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                {item.step}
              </span>
              <span className="text-sm text-gray-600">{item.icon} {item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice download note */}
      {orderId && (
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-6 text-sm">
          <p className="text-purple-800 font-medium mb-1">📄 Invoice Ready</p>
          <p className="text-purple-600 text-xs">Your invoice is being generated. Download it from My Orders once ready.</p>
        </div>
      )}

      {/* CTA buttons */}
      <div className="space-y-3">
        {orderId && (
          <Link
            href={`/orders`}
            className="block w-full bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md text-sm"
          >
            View My Orders →
          </Link>
        )}
        <Link
          href="/shop"
          className="block w-full border border-gray-300 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition text-sm"
        >
          Continue Shopping
        </Link>
      </div>

      <p className="text-xs text-gray-400 mt-6">
        Need help? Contact us at{' '}
        <span className="text-purple-600 cursor-pointer hover:underline">support@rentease.in</span>
      </p>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 animate-pulse" />
        <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4 animate-pulse" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  )
}
