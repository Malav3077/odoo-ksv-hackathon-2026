'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please enter both email and password.')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/login/', { email: form.email, password: form.password })
      login(res.data.user, res.data.access, res.data.refresh)
      router.push('/shop')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── */}
      <div className="left-panel hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">

        {/* animated blobs */}
        <div className="absolute top-[-60px] left-[-60px] w-80 h-80 bg-purple-500 opacity-10 rounded-full animate-blob" />
        <div className="absolute bottom-[-40px] right-[-40px] w-96 h-96 bg-violet-400 opacity-10 rounded-full animate-blob delay-400" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-purple-300 opacity-5 rounded-full animate-float-slow" />

        {/* floating cards */}
        <div className="absolute right-10 top-1/4 animate-float delay-200">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-3 flex items-center gap-2.5 shadow-lg">
            <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center text-sm">✅</div>
            <div>
              <p className="text-white text-xs font-semibold">Order Confirmed</p>
              <p className="text-purple-200 text-xs">Camera lens — 3 days</p>
            </div>
          </div>
        </div>
        <div className="absolute right-16 top-1/2 animate-float-slow delay-300">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-3 flex items-center gap-2.5 shadow-lg">
            <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center text-sm">💰</div>
            <div>
              <p className="text-white text-xs font-semibold">Deposit Refunded</p>
              <p className="text-purple-200 text-xs">₹2,000 returned</p>
            </div>
          </div>
        </div>

        {/* logo */}
        <div className="relative z-10 animate-slide-right">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-purple-700 font-black text-lg">R</span>
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">RentEase</span>
          </div>
        </div>

        {/* center content */}
        <div className="relative z-10 animate-fade-slide-up delay-200">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white text-xs font-medium">500+ products available</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Rent smarter,<br />
            <span className="text-purple-300">not harder.</span>
          </h2>
          <p className="text-purple-200 text-sm leading-relaxed mb-8">
            Manage your entire rental lifecycle — from browsing to return — in one place.
          </p>
          <div className="space-y-3">
            {[
              { icon: '📦', text: 'Browse hundreds of rental products' },
              { icon: '📅', text: 'Choose your rental period instantly' },
              { icon: '🔒', text: 'Secure deposits & auto late-fee settlement' },
              { icon: '📄', text: 'Download invoice after every order' },
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
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-white px-6 py-12">
        <div className="w-full max-w-md animate-fade-slide-up">

          {/* mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-purple-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">R</span>
            </div>
            <span className="text-purple-900 text-xl font-bold">RentEase</span>
          </div>

          <div className="auth-card">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back 👋</h1>
              <p className="text-gray-500 text-sm">Sign in to continue to your account</p>
            </div>

            {error && (
              <div className="mb-5 flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm animate-scale-in">
                <span className="text-base">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="animate-fade-slide-up delay-100">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input-purple"
                />
              </div>

              <div className="animate-fade-slide-up delay-200">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <Link href="/reset-password" className="text-xs text-purple-600 hover:text-purple-800 font-medium transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="input-purple"
                    style={{ paddingRight: '48px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors text-sm w-6 h-6 flex items-center justify-center"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="pt-1 animate-fade-slide-up delay-300">
                <button type="submit" disabled={loading} className="btn-purple">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : 'Sign In →'}
                </button>
              </div>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <div className="space-y-2.5 animate-fade-slide-up delay-400">
              <Link
                href="/signup"
                className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:border-purple-300 hover:text-purple-700 hover:bg-purple-50/50 transition-all duration-200 text-sm"
              >
                👤 Create a customer account
              </Link>
              <Link
                href="/vendor-signup"
                className="w-full flex items-center justify-center gap-2 border-2 border-purple-200 text-purple-700 font-semibold py-2.5 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 text-sm"
              >
                🏪 Register as a Vendor
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            By signing in you agree to our{' '}
            <span className="text-purple-600 cursor-pointer hover:underline">Terms</span>
            {' '}&{' '}
            <span className="text-purple-600 cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  )
}
