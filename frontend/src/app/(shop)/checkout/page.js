'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useCart } from '@/context/CartContext'

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI / QR Code', icon: '📱' },
  { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { id: 'netbanking', label: 'Net Banking', icon: '🏦' },
  { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
]

const DELIVERY_MODES = [
  { id: 'delivery', label: 'Home Delivery', icon: '🚚', desc: 'Delivered to your address' },
  { id: 'pickup', label: 'Store Pickup', icon: '🏪', desc: 'Collect from our store' },
]

function Step({ number, label, active, done }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
        done ? 'bg-green-500 text-white' : active ? 'bg-indigo-700 text-white' : 'bg-gray-200 text-gray-500'
      }`}>
        {done ? '✓' : number}
      </div>
      <span className={`text-sm font-medium hidden sm:block ${active ? 'text-indigo-700' : done ? 'text-green-600' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  )
}

function diffDays(start, end) {
  const diff = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)
  return Math.max(1, Math.round(diff))
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const [step, setStep] = useState(1)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')
  const [deliveryMode, setDeliveryMode] = useState('delivery')
  const [address, setAddress] = useState({ full_name: '', phone: '', address_line: '', city: '', zip_code: '', country: 'India' })
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [addressErrors, setAddressErrors] = useState({})

  useEffect(() => {
    if (items.length === 0) router.replace('/cart')
  }, [items, router])

  const rentalTotal = items.reduce((s, i) => s + Number(i.product?.sales_price || 0) * diffDays(i.rental_start, i.rental_end) * i.quantity, 0)
  const depositTotal = items.reduce((s, i) => s + Number(i.product?.rental_config?.security_deposit_amount || 0), 0)
  const grandTotal = rentalTotal + depositTotal

  function validateAddress() {
    const errors = {}
    if (deliveryMode === 'delivery') {
      if (!address.full_name.trim()) errors.full_name = 'Name is required'
      if (!address.phone.trim()) errors.phone = 'Phone is required'
      else if (!/^\d{10}$/.test(address.phone.trim())) errors.phone = 'Enter valid 10-digit phone'
      if (!address.address_line.trim()) errors.address_line = 'Address is required'
      if (!address.city.trim()) errors.city = 'City is required'
      if (!address.zip_code.trim()) errors.zip_code = 'Pincode is required'
      else if (!/^\d{6}$/.test(address.zip_code.trim())) errors.zip_code = 'Enter valid 6-digit pincode'
    }
    return errors
  }

  function handleNextFromDelivery() {
    const errors = validateAddress()
    if (Object.keys(errors).length > 0) { setAddressErrors(errors); return }
    setAddressErrors({})
    setStep(2)
  }

  async function handlePlaceOrder() {
    setPlacing(true)
    setError('')
    try {
      const lines = items.map(i => ({
        product: i.product.id,
        quantity: i.quantity,
        rental_start: i.rental_start,
        rental_end: i.rental_end,
      }))

      const payload = {
        lines,
        delivery_method: deliveryMode,
        payment: { method: paymentMethod },
      }

      if (deliveryMode === 'delivery') {
        payload.invoice_address = address
        payload.delivery_address = address
      }

      const res = await api.post('/checkout/', payload)
      clearCart()
      const ref = res.data?.order_reference || res.data?.order_id || res.data?.id || ''
      router.push(`/order-success?order=${ref}`)
    } catch (err) {
      const data = err.response?.data
      const msg = data?.detail || data?.message || (typeof data === 'string' ? data : 'Order placement failed. Please try again.')
      setError(msg)
      setPlacing(false)
    }
  }

  const inputClass = (field) =>
    `w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
      addressErrors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`

  if (items.length === 0) return null

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="flex items-center gap-4 mb-8">
        <Step number={1} label="Delivery" active={step === 1} done={step > 1} />
        <div className="flex-1 h-px bg-gray-200" />
        <Step number={2} label="Payment" active={step === 2} done={step > 2} />
        <div className="flex-1 h-px bg-gray-200" />
        <Step number={3} label="Review" active={step === 3} done={false} />
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">

          {/* STEP 1: DELIVERY */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-900 mb-4">Delivery Details</h2>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {DELIVERY_MODES.map(m => (
                  <button key={m.id} onClick={() => setDeliveryMode(m.id)}
                    className={`flex items-center gap-3 border rounded-xl p-3 text-left transition ${
                      deliveryMode === m.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <p className={`text-sm font-semibold ${deliveryMode === m.id ? 'text-indigo-700' : 'text-gray-700'}`}>{m.label}</p>
                      <p className="text-xs text-gray-400">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {deliveryMode === 'delivery' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input type="text" value={address.full_name}
                        onChange={e => setAddress({...address, full_name: e.target.value})}
                        placeholder="Your Name" className={inputClass('full_name')} />
                      {addressErrors.full_name && <p className="text-red-500 text-xs mt-1">{addressErrors.full_name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input type="tel" value={address.phone}
                        onChange={e => setAddress({...address, phone: e.target.value})}
                        placeholder="10-digit mobile" className={inputClass('phone')} />
                      {addressErrors.phone && <p className="text-red-500 text-xs mt-1">{addressErrors.phone}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input type="text" value={address.address_line}
                      onChange={e => setAddress({...address, address_line: e.target.value})}
                      placeholder="Street address, flat, building" className={inputClass('address_line')} />
                    {addressErrors.address_line && <p className="text-red-500 text-xs mt-1">{addressErrors.address_line}</p>}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input type="text" value={address.city}
                        onChange={e => setAddress({...address, city: e.target.value})}
                        placeholder="Surat" className={inputClass('city')} />
                      {addressErrors.city && <p className="text-red-500 text-xs mt-1">{addressErrors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input type="text" value={address.country}
                        onChange={e => setAddress({...address, country: e.target.value})}
                        placeholder="India" className={inputClass('country')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                      <input type="text" value={address.zip_code}
                        onChange={e => setAddress({...address, zip_code: e.target.value})}
                        placeholder="395001" className={inputClass('zip_code')} />
                      {addressErrors.zip_code && <p className="text-red-500 text-xs mt-1">{addressErrors.zip_code}</p>}
                    </div>
                  </div>
                </div>
              )}

              {deliveryMode === 'pickup' && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-800">
                  <p className="font-semibold mb-1">Store Address</p>
                  <p className="text-indigo-700">RentEase Store, KSV University Campus,<br />Gandhinagar, Gujarat — 382016</p>
                  <p className="text-indigo-500 text-xs mt-2">Open: Mon–Sat, 10 AM – 6 PM</p>
                </div>
              )}

              <button onClick={handleNextFromDelivery}
                className="w-full mt-5 bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-800 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md text-sm">
                Continue to Payment →
              </button>
            </div>
          )}

          {/* STEP 2: PAYMENT */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-2 mb-5">
                {PAYMENT_METHODS.map(m => (
                  <label key={m.id}
                    className={`flex items-center gap-3 border rounded-xl p-3.5 cursor-pointer transition ${
                      paymentMethod === m.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id)} className="accent-indigo-700" />
                    <span className="text-xl">{m.icon}</span>
                    <span className={`text-sm font-medium ${paymentMethod === m.id ? 'text-indigo-700' : 'text-gray-700'}`}>{m.label}</span>
                    {paymentMethod === m.id && (
                      <span className="ml-auto text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">Selected</span>
                    )}
                  </label>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 mb-4 flex gap-2">
                <span>ℹ️</span>
                <span>This is a demo — no real payment is processed. Click &quot;Review Order&quot; to continue.</span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="flex-1 border border-gray-300 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition text-sm">
                  ← Back
                </button>
                <button onClick={() => setStep(3)}
                  className="flex-1 bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-800 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md text-sm">
                  Review Order →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="font-bold text-gray-900 mb-3">Order Review</h2>
                <div className="space-y-2 mb-4">
                  {items.map((item, idx) => {
                    const days = diffDays(item.rental_start, item.rental_end)
                    const price = Number(item.product?.sales_price || 0)
                    return (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.product?.name || 'Product'} × {item.quantity} ({days}d)
                        </span>
                        <span className="font-medium text-gray-900">
                          ₹{(price * days * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery mode</span>
                    <span className="font-medium text-gray-700">{deliveryMode === 'pickup' ? 'Store Pickup' : 'Home Delivery'}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Payment method</span>
                    <span className="font-medium text-gray-700">{PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}</span>
                  </div>
                  {deliveryMode === 'delivery' && (
                    <div className="flex justify-between text-gray-500">
                      <span>Deliver to</span>
                      <span className="font-medium text-gray-700 text-right max-w-40">{address.full_name}, {address.city}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)}
                  className="flex-1 border border-gray-300 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition text-sm">
                  ← Back
                </button>
                <button onClick={handlePlaceOrder} disabled={placing}
                  className="flex-1 bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-800 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2">
                  {placing ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Processing...
                    </>
                  ) : '✓ Pay Now & Confirm Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ORDER SUMMARY SIDEBAR */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Summary</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Rental</span>
                <span>₹{rentalTotal.toLocaleString('en-IN')}</span>
              </div>
              {depositTotal > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Deposit</span>
                  <span>₹{depositTotal.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-1.5 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span className="text-indigo-700">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">{items.length} item{items.length !== 1 ? 's' : ''} in cart</p>
          </div>
        </div>
      </div>
    </div>
  )
}
