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
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex">

      {/* ══ LEFT PANEL ══ */}
      <div className="odoo-left hidden lg:flex lg:w-[52%] flex-col justify-between p-14 overflow-hidden">

        <div className="absolute top-[-120px] right-[-120px] w-[380px] h-[380px] rounded-full opacity-20 blur-[80px]"
          style={{ background: '#9c27b0', animation: 'glowPulse 7s ease-in-out infinite' }} />
        <div className="absolute bottom-[-100px] left-[-80px] w-[320px] h-[320px] rounded-full opacity-25 blur-[70px]"
          style={{ background: '#6a1b9a', animation: 'glowPulse 9s ease-in-out infinite 1.5s' }} />
        <div className="absolute top-1/2 right-[-60px] -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-white/[0.06]"
          style={{ animation: 'spinSlow 28s linear infinite' }} />

        <div className="relative z-10 al">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
              <span className="text-white font-black text-base">R</span>
            </div>
            <span className="text-white text-xl font-bold tracking-tight">RentEase</span>
          </div>
        </div>

        <div className="relative z-10">
          <div className="au">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3.5 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#ce93d8' }} />
              <span className="text-purple-200 text-xs font-semibold tracking-wide">Account Recovery</span>
            </div>
            <h2 className="text-[40px] font-bold text-white leading-[1.15] mb-5 tracking-tight">
              Locked out?<br />
              <span style={{ background: 'linear-gradient(90deg, #f48fb1, #ce93d8, #ab47bc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                We&apos;ll get you back in.
              </span>
            </h2>
            <p className="text-purple-200/80 text-[15px] leading-relaxed max-w-[340px] mb-10">
              Enter your email and we&apos;ll send a secure link to reset your password instantly.
            </p>
          </div>

          <div className="space-y-3 au d2">
            {[
              { icon: '📧', title: 'Enter your email', desc: 'The one you registered with' },
              { icon: '🔗', title: 'Get the reset link', desc: 'Check your inbox in seconds' },
              { icon: '🔑', title: 'Set new password', desc: 'Follow the link to reset' },
              { icon: '✅', title: 'Sign back in', desc: 'Use your new credentials' },
            ].map(f => (
              <div key={f.title} className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-base flex-shrink-0">{f.icon}</div>
                <div>
                  <p className="text-white text-sm font-semibold leading-none mb-0.5">{f.title}</p>
                  <p className="text-purple-300 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 au d3">
            <div className="glass-card af2 w-fit">
              <p className="text-purple-300 text-[10px] font-semibold uppercase tracking-wider mb-1">Response time</p>
              <p className="text-white text-2xl font-bold">&lt; 60s</p>
              <p className="text-purple-300 text-xs mt-0.5">reset link in your inbox</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/30 text-xs">© 2026 RentEase — Built for Odoo × KSV Hackathon</p>
        </div>
      </div>

      {/* ══ RIGHT PANEL ══ */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-[400px]">

          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#7b1fa2' }}>
              <span className="text-white font-black text-sm">R</span>
            </div>
            <span className="text-gray-900 text-lg font-bold">RentEase</span>
          </div>

          {submitted ? (
            <div className="odoo-card text-center as">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h1>
              <p className="text-gray-500 text-sm mb-3">We sent a password reset link to:</p>
              <div className="inline-block bg-gray-50 border border-gray-200 text-gray-700 font-semibold text-sm px-4 py-2 rounded-xl mb-6">
                {email}
              </div>
              <p className="text-gray-400 text-xs mb-7">Didn&apos;t receive it? Check your spam folder.</p>
              <button onClick={() => { setSubmitted(false); setEmail('') }} className="odoo-outline mb-3">
                Try a different email
              </button>
              <Link href="/login" className="odoo-btn" style={{ textDecoration: 'none' }}>
                Back to Sign in
              </Link>
            </div>
          ) : (
            <div className="odoo-card au">
              <div className="mb-7">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: '#f3e5f5', border: '1px solid #e1bee7' }}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#7b1fa2' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1.5">Forgot password?</h1>
                <p className="text-gray-500 text-sm">Enter your email and we&apos;ll send you a reset link.</p>
              </div>

              {error && (
                <div className="mb-5 as flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="au d1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                  <input type="email" value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    placeholder="you@example.com" className="odoo-input" />
                </div>
                <div className="au d2 pt-1">
                  <button type="submit" disabled={loading} className="odoo-btn">
                    {loading ? <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Sending...
                    </> : 'Send reset link'}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center au d3">
                <Link href="/login" className="text-sm font-semibold transition-colors" style={{ color: '#7b1fa2' }}>
                  ← Back to Sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
