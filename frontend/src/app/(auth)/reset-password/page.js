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
    <div className="min-h-screen flex bg-slate-50">

      {/* LEFT */}
      <div className="pro-left hidden lg:flex lg:w-[52%] flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-[-80px] right-[-60px] w-72 h-72 rounded-full bg-indigo-400 opacity-20 blur-3xl" />
        <div className="absolute bottom-[-60px] left-[-40px] w-64 h-64 rounded-full bg-violet-500 opacity-20 blur-3xl" />

        <div className="relative z-10 anim-slide-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/15 border border-white/25 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-base">R</span>
            </div>
            <span className="text-white text-xl font-bold">RentEase</span>
          </div>
        </div>

        <div className="relative z-10">
          <div className="anim-fade-up">
            <p className="text-indigo-300 text-sm font-semibold uppercase tracking-widest mb-4">Account Recovery</p>
            <h2 className="text-4xl font-bold text-white leading-[1.2] mb-5">
              Locked out?<br />We&apos;ll get you<br />back in.
            </h2>
            <p className="text-indigo-200 text-[15px] leading-relaxed mb-10 max-w-sm">
              Enter your email and we&apos;ll send a secure link to reset your password instantly.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { icon: '📧', title: 'Enter your email', desc: 'The one you registered with' },
              { icon: '🔗', title: 'Get the reset link', desc: 'Check your inbox in seconds' },
              { icon: '🔑', title: 'Set new password', desc: 'Follow the link to reset' },
              { icon: '✅', title: 'Sign back in', desc: 'Use your new credentials' },
            ].map((f, i) => (
              <div key={f.title} className={`flex items-center gap-3.5 anim-fade-up d-${i + 2}`}>
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-base flex-shrink-0">{f.icon}</div>
                <div>
                  <p className="text-white text-sm font-semibold leading-none mb-0.5">{f.title}</p>
                  <p className="text-indigo-300 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-indigo-400 text-xs">© 2026 RentEase · Odoo × KSV Hackathon</p>
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-[400px]">

          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">R</span>
            </div>
            <span className="text-slate-800 text-lg font-bold">RentEase</span>
          </div>

          {submitted ? (
            <div className="text-center anim-scale-up">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Check your inbox</h1>
              <p className="text-slate-500 text-sm mb-3">We sent a password reset link to:</p>
              <div className="inline-block bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm px-4 py-2 rounded-xl mb-6">
                {email}
              </div>
              <p className="text-slate-400 text-xs mb-7">Didn&apos;t receive it? Check your spam folder.</p>
              <button
                onClick={() => { setSubmitted(false); setEmail('') }}
                className="pro-btn-outline mb-3">
                Try a different email
              </button>
              <Link href="/login" className="pro-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                Back to Sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="anim-fade-up">
                <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                  </svg>
                </div>
                <h1 className="text-[26px] font-bold text-slate-900 mb-1">Forgot password?</h1>
                <p className="text-slate-500 text-sm mb-8">Enter your email and we&apos;ll send you a reset link.</p>
              </div>

              {error && (
                <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm anim-scale-up">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="anim-fade-up d-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
                  <input type="email" value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    placeholder="you@example.com" className="pro-input" />
                </div>
                <div className="anim-fade-up d-2 pt-1">
                  <button type="submit" disabled={loading} className="pro-btn">
                    {loading
                      ? <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                          </svg>
                          Sending...
                        </span>
                      : 'Send reset link'}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center anim-fade-up d-3">
                <Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold">
                  ← Back to Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
