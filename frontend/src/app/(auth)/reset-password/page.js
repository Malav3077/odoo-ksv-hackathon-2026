'use client'
import { useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) { setError('Please enter your email address.'); return }
    setLoading(true)
    try {
      await api.post('/auth/password-reset/', { email })
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.email?.[0] || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── */}
      <div className="left-panel hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-[-60px] left-[-60px] w-72 h-72 bg-purple-400 opacity-10 rounded-full animate-blob" />
        <div className="absolute bottom-[-40px] right-[-40px] w-80 h-80 bg-violet-500 opacity-10 rounded-full animate-blob delay-400" />

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
            <span className="text-blue-300 text-xs">🔐</span>
            <span className="text-white text-xs font-medium">Secure password recovery</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            We&apos;ve got<br />
            <span className="text-purple-300">you covered.</span>
          </h2>
          <p className="text-purple-200 text-sm leading-relaxed mb-8">
            Forgot your password? No worries — we&apos;ll send a reset link to your email right away.
          </p>
          <div className="space-y-3">
            {[
              { icon: '📧', text: 'Enter your registered email address' },
              { icon: '🔗', text: 'We send a secure reset link' },
              { icon: '🔐', text: 'Click the link and set a new password' },
              { icon: '✅', text: 'Sign in with your new password' },
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

          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-purple-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">R</span>
            </div>
            <span className="text-purple-900 text-xl font-bold">RentEase</span>
          </div>

          <div className="auth-card">
            {submitted ? (
              /* ── SUCCESS STATE ── */
              <div className="text-center animate-scale-in">
                <div className="relative w-20 h-20 mx-auto mb-5">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-4xl">📧</span>
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-purple-300 animate-ping opacity-30" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox!</h1>
                <p className="text-gray-500 text-sm mb-1">We sent a password reset link to:</p>
                <div className="inline-block bg-purple-50 border border-purple-200 text-purple-700 font-semibold text-sm px-4 py-2 rounded-xl mb-5">
                  {email}
                </div>
                <p className="text-gray-400 text-xs mb-6">
                  Didn&apos;t receive it? Check your spam folder or try again.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setEmail('') }}
                  className="w-full border-2 border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:border-purple-300 hover:text-purple-700 hover:bg-purple-50 transition-all duration-200 text-sm mb-3"
                >
                  Try a different email
                </button>
                <Link
                  href="/login"
                  className="block w-full text-center btn-purple"
                  style={{ display: 'block', padding: '10px 24px' }}
                >
                  Back to Sign In
                </Link>
              </div>
            ) : (
              /* ── FORM STATE ── */
              <>
                <div className="mb-7">
                  <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
                    <span className="text-2xl">🔑</span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot password?</h1>
                  <p className="text-gray-500 text-sm">Enter your email and we&apos;ll send you a reset link.</p>
                </div>

                {error && (
                  <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm animate-scale-in">
                    <span>⚠️</span><span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="animate-fade-slide-up delay-100">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError('') }}
                      placeholder="you@example.com"
                      className="input-purple"
                    />
                  </div>
                  <div className="pt-1 animate-fade-slide-up delay-200">
                    <button type="submit" disabled={loading} className="btn-purple">
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Sending...
                        </span>
                      ) : 'Send Reset Link →'}
                    </button>
                  </div>
                </form>

                <div className="mt-5 text-center animate-fade-slide-up delay-300">
                  <Link href="/login" className="text-sm text-purple-600 hover:text-purple-800 font-semibold transition-colors">
                    ← Back to Sign In
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
