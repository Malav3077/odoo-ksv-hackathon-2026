'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

function PasswordRule({ met, text }) {
  return (
    <div className={`flex items-center gap-2 text-xs ${met ? 'text-green-600' : 'text-gray-400'}`}>
      <span>{met ? '✅' : '○'}</span>
      <span>{text}</span>
    </div>
  )
}

function getFieldError(errors, field) {
  if (!errors) return ''
  if (errors[field]) return errors[field][0]
  if (errors.non_field_errors) return errors.non_field_errors[0]
  return ''
}

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    confirm_password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  const [loading, setLoading] = useState(false)

  const pw = form.password
  const passwordRules = {
    length: pw.length >= 6 && pw.length <= 12,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    special: /[@$&_]/.test(pw),
  }
  const passwordValid = Object.values(passwordRules).every(Boolean)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' })
    setGeneralError('')
  }

  function validateFrontend() {
    const errors = {}
    if (!form.first_name.trim()) errors.first_name = 'First name is required.'
    if (!form.last_name.trim()) errors.last_name = 'Last name is required.'
    if (!form.username.trim()) errors.username = 'Username is required.'
    if (!form.email.trim()) errors.email = 'Email is required.'
    if (!passwordValid) errors.password = 'Password does not meet the requirements.'
    if (form.password !== form.confirm_password) errors.confirm_password = 'Passwords do not match.'
    return errors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errors = validateFrontend()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/register/', {
        username: form.username,
        email: form.email,
        password: form.password,
        confirm_password: form.confirm_password,
        first_name: form.first_name,
        last_name: form.last_name,
      })
      router.push('/login?registered=true')
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        setFieldErrors(data)
      } else {
        setGeneralError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-950 via-purple-900 to-purple-800 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-700 opacity-20 rounded-full" />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 bg-purple-600 opacity-20 rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-purple-900 font-black text-lg">R</span>
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">RentEase</span>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-snug mb-4">
            Start renting<br />in minutes.
          </h2>
          <p className="text-purple-200 text-base mb-10">
            Create your free account and get access to hundreds of products available for rent.
          </p>
          <div className="space-y-4">
            {[
              { icon: '🚀', text: 'Quick and easy registration' },
              { icon: '🛍️', text: 'Browse and rent instantly' },
              { icon: '💳', text: 'Secure deposit management' },
              { icon: '📦', text: 'Track all your orders in one place' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-purple-100 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-purple-300 text-xs">© 2026 RentEase · Odoo x KSV Hackathon</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-10">
        <div className="w-full max-w-md">

          {/* mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 bg-purple-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">R</span>
            </div>
            <span className="text-purple-900 text-xl font-bold">RentEase</span>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Create account</h1>
            <p className="text-gray-500 text-sm mt-1">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-600 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {generalError && (
            <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              <span>⚠️</span>
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="Dhruvi"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${fieldErrors.first_name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                />
                {fieldErrors.first_name && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.first_name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Shah"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${fieldErrors.last_name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                />
                {fieldErrors.last_name && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.last_name}</p>
                )}
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="dhruvi_shah"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${fieldErrors.username ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              />
              {fieldErrors.username && (
                <p className="text-red-500 text-xs mt-1">{getFieldError(fieldErrors, 'username')}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="dhruvi@example.com"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${fieldErrors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-xs mt-1">{getFieldError(fieldErrors, 'email')}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className={`w-full border rounded-xl px-4 py-2.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${fieldErrors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
              )}
              {/* Password rules */}
              {form.password.length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-1">
                  <PasswordRule met={passwordRules.length} text="6–12 characters" />
                  <PasswordRule met={passwordRules.upper} text="One uppercase (A-Z)" />
                  <PasswordRule met={passwordRules.lower} text="One lowercase (a-z)" />
                  <PasswordRule met={passwordRules.special} text="One special (@ $ & _)" />
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirm_password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  className={`w-full border rounded-xl px-4 py-2.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${fieldErrors.confirm_password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {fieldErrors.confirm_password && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.confirm_password}</p>
              )}
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
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Are you a vendor?{' '}
            <Link href="/vendor-signup" className="text-purple-600 font-medium hover:underline">
              Register as Vendor
            </Link>
          </p>

          <p className="text-center text-xs text-gray-400 mt-2">
            By signing up you agree to our{' '}
            <span className="text-purple-600 cursor-pointer hover:underline">Terms</span>{' '}
            and{' '}
            <span className="text-purple-600 cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
