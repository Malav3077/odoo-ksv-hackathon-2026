'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

function PasswordRule({ met, text }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs transition-colors duration-300 ${met ? 'text-green-600' : 'text-gray-400'}`}>
      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-all duration-300 ${met ? 'bg-green-100' : 'bg-gray-100'}`}>
        {met ? '✓' : '·'}
      </span>
      <span>{text}</span>
    </div>
  )
}

export default function VendorSignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '', email: '',
    company_name: '', gst_no: '', password: '', confirm_password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  const [loading, setLoading] = useState(false)

  const pw = form.password
  const rules = {
    length: pw.length >= 6 && pw.length <= 12,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    special: /[@$&_]/.test(pw),
  }
  const passwordValid = Object.values(rules).every(Boolean)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' })
    setGeneralError('')
  }

  function validate() {
    const e = {}
    if (!form.first_name.trim()) e.first_name = ['Required']
    if (!form.last_name.trim()) e.last_name = ['Required']
    if (!form.username.trim()) e.username = ['Required']
    if (!form.email.trim()) e.email = ['Required']
    if (!form.company_name.trim()) e.company_name = ['Required']
    if (!form.gst_no.trim()) e.gst_no = ['Required']
    if (!passwordValid) e.password = ['Password does not meet requirements']
    if (form.password !== form.confirm_password) e.confirm_password = ['Passwords do not match']
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return }
    setLoading(true)
    try {
      await api.post('/auth/register/vendor/', {
        username: form.username, email: form.email,
        password: form.password, confirm_password: form.confirm_password,
        first_name: form.first_name, last_name: form.last_name,
        company_name: form.company_name, gst_no: form.gst_no,
      })
      router.push('/login?registered=vendor')
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') setFieldErrors(data)
      else setGeneralError('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const ic = (f) => `input-purple${fieldErrors[f] ? ' error' : ''}`
  const fe = (f) => fieldErrors[f]?.[0] || (typeof fieldErrors[f] === 'string' ? fieldErrors[f] : '')

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── */}
      <div className="left-panel hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-[-60px] left-[-60px] w-72 h-72 bg-purple-400 opacity-10 rounded-full animate-blob" />
        <div className="absolute bottom-[-40px] right-[-40px] w-80 h-80 bg-violet-500 opacity-10 rounded-full animate-blob delay-400" />

        <div className="absolute right-8 top-1/4 animate-float delay-200">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-3 shadow-lg">
            <p className="text-white text-xs font-semibold mb-1">📊 This month</p>
            <p className="text-2xl font-bold text-white">₹48,200</p>
            <p className="text-green-300 text-xs">↑ 23% vs last month</p>
          </div>
        </div>

        <div className="relative z-10 animate-slide-right">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-purple-700 font-black text-lg">R</span>
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">RentEase</span>
          </div>
        </div>

        <div className="relative z-10 animate-fade-slide-up delay-200">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-5">
            <span className="text-yellow-300 text-xs">★</span>
            <span className="text-white text-xs font-medium">Join 50+ active vendors</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Grow your rental<br />
            <span className="text-purple-300">business with us.</span>
          </h2>
          <p className="text-purple-200 text-sm leading-relaxed mb-8">
            List your products, manage orders, and process returns — all from one powerful dashboard.
          </p>
          <div className="space-y-3">
            {[
              { icon: '🏪', text: 'List and manage your rental products' },
              { icon: '📋', text: 'Create quotations and confirm orders' },
              { icon: '🔄', text: 'Handle pickup and return workflows' },
              { icon: '📊', text: 'Track revenue and deposits in real time' },
            ].map((item, i) => (
              <div key={item.text} className={`flex items-center gap-3 animate-slide-right delay-${300 + i * 100}`}>
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                  {item.icon}
                </div>
                <span className="text-purple-100 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-purple-400 text-xs">© 2026 RentEase · Odoo x KSV Hackathon</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-white px-6 py-10">
        <div className="w-full max-w-md animate-fade-slide-up">

          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 bg-purple-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">R</span>
            </div>
            <span className="text-purple-900 text-xl font-bold">RentEase</span>
          </div>

          <div className="auth-card">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                🏪 Vendor Registration
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Register as Vendor</h1>
              <p className="text-gray-500 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-purple-600 font-semibold hover:text-purple-800 transition-colors">Sign in</Link>
              </p>
            </div>

            {generalError && (
              <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm animate-scale-in">
                <span>⚠️</span><span>{generalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="grid grid-cols-2 gap-3 animate-fade-slide-up delay-100">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">First Name</label>
                  <input type="text" name="first_name" value={form.first_name} onChange={handleChange} placeholder="Malav" className={ic('first_name')} />
                  {fe('first_name') && <p className="text-red-500 text-xs mt-1">{fe('first_name')}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Last Name</label>
                  <input type="text" name="last_name" value={form.last_name} onChange={handleChange} placeholder="Patel" className={ic('last_name')} />
                  {fe('last_name') && <p className="text-red-500 text-xs mt-1">{fe('last_name')}</p>}
                </div>
              </div>

              <div className="animate-fade-slide-up delay-150">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Username</label>
                <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="malav_rentals" className={ic('username')} />
                {fe('username') && <p className="text-red-500 text-xs mt-1">{fe('username')}</p>}
              </div>

              <div className="animate-fade-slide-up delay-200">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email Address</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="malav@company.com" className={ic('email')} />
                {fe('email') && <p className="text-red-500 text-xs mt-1">{fe('email')}</p>}
              </div>

              {/* Business Details box */}
              <div className="animate-fade-slide-up delay-250 bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 bg-purple-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs">🏪</span>
                  </div>
                  <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Business Details</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Company Name</label>
                  <input type="text" name="company_name" value={form.company_name} onChange={handleChange} placeholder="Patel Rentals Pvt. Ltd." className={ic('company_name')} />
                  {fe('company_name') && <p className="text-red-500 text-xs mt-1">{fe('company_name')}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">GST Number</label>
                  <input type="text" name="gst_no" value={form.gst_no} onChange={handleChange} placeholder="22AAAAA0000A1Z5" className={ic('gst_no')} />
                  {fe('gst_no') && <p className="text-red-500 text-xs mt-1">{fe('gst_no')}</p>}
                </div>
              </div>

              <div className="animate-fade-slide-up delay-300">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Create a strong password" className={ic('password')} style={{ paddingRight: '48px' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors text-sm">
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {fe('password') && <p className="text-red-500 text-xs mt-1">{fe('password')}</p>}
                {form.password.length > 0 && (
                  <div className="mt-2.5 grid grid-cols-2 gap-1.5 bg-gray-50 rounded-xl p-3 animate-scale-in">
                    <PasswordRule met={rules.length} text="6–12 characters" />
                    <PasswordRule met={rules.upper} text="One uppercase (A-Z)" />
                    <PasswordRule met={rules.lower} text="One lowercase (a-z)" />
                    <PasswordRule met={rules.special} text="One special (@ $ & _)" />
                  </div>
                )}
              </div>

              <div className="animate-fade-slide-up delay-400">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} name="confirm_password" value={form.confirm_password} onChange={handleChange} placeholder="Repeat your password" className={ic('confirm_password')} style={{ paddingRight: '48px' }} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors text-sm">
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
                {fe('confirm_password') && <p className="text-red-500 text-xs mt-1">{fe('confirm_password')}</p>}
              </div>

              <div className="pt-1 animate-fade-slide-up delay-500">
                <button type="submit" disabled={loading} className="btn-purple">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Registering...
                    </span>
                  ) : 'Register as Vendor →'}
                </button>
              </div>
            </form>

            <p className="text-center text-xs text-gray-400 mt-4">
              Want to rent products?{' '}
              <Link href="/signup" className="text-purple-600 font-semibold hover:underline">Customer signup</Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            By signing up you agree to our{' '}
            <span className="text-purple-600 cursor-pointer hover:underline">Terms</span>
            {' '}&{' '}
            <span className="text-purple-600 cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  )
}
