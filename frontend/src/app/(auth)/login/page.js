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
      const res = await api.post('/auth/login/', {
        email: form.email,
        password: form.password,
      })
      login(res.data.user, res.data.access, res.data.refresh)
      router.push('/shop')
    } catch (err) {
      const detail =
        err.response?.data?.detail || 'Login failed. Please try again.'
      setError(detail)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-950 via-purple-900 to-purple-800 flex-col justify-between p-12 relative overflow-hidden">

        {/* background circles decoration */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-700 opacity-20 rounded-full" />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 bg-purple-600 opacity-20 rounded-full" />

        {/* logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-purple-900 font-black text-lg">R</span>
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">RentEase</span>
          </div>
        </div>

        {/* center content */}
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-snug mb-4">
            Rent smarter,<br />not harder.
          </h2>
          <p className="text-purple-200 text-base mb-10">
            Manage your entire rental lifecycle — from browsing to return — in one place.
          </p>

          <div className="space-y-4">
            {[
              { icon: '📦', text: 'Browse hundreds of rental products' },
              { icon: '📅', text: 'Choose your rental period instantly' },
              { icon: '🔒', text: 'Secure deposits & auto late-fee settlement' },
              { icon: '📄', text: 'Download invoice after every order' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-purple-100 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* bottom quote */}
        <div className="relative z-10">
          <p className="text-purple-300 text-xs">
            © 2026 RentEase · Odoo x KSV Hackathon
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">

          {/* mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-purple-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">R</span>
            </div>
            <span className="text-purple-900 text-xl font-bold">RentEase</span>
          </div>

          {/* heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">
              Sign in to continue to your account
            </p>
          </div>

          {/* error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              <span className="mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  href="/reset-password"
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                >
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
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* signup links */}
          <div className="space-y-3">
            <Link
              href="/signup"
              className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-100 transition text-sm"
            >
              Create a customer account
            </Link>
            <Link
              href="/vendor-signup"
              className="w-full flex items-center justify-center gap-2 border border-purple-200 text-purple-700 font-medium py-3 rounded-xl hover:bg-purple-50 transition text-sm"
            >
              Register as a Vendor
            </Link>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            By signing in you agree to our{' '}
            <span className="text-purple-600 cursor-pointer hover:underline">Terms</span>
            {' '}and{' '}
            <span className="text-purple-600 cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
