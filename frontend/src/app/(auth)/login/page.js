'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [justRegistered, setJustRegistered] = useState(false)

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    setJustRegistered(p.get('registered') === 'true')
  }, [])

  function onChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setError('') }

  async function onSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Please enter your email and password.'); return }
    setLoading(true)
    try {
      const res = await api.post('/auth/login/', { email: form.email, password: form.password })
      const user = res.data.user
      login(user, res.data.access, res.data.refresh)
      setSuccess('Login successful! Redirecting...')
      const dest = (user.role === 'admin' || user.role === 'vendor') ? '/dashboard' : '/shop'
      setTimeout(() => { window.location.href = dest }, 1200)
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.')
      setLoading(false)
    }
  }

  const meshBg = {
    background:
      'radial-gradient(1100px 560px at 18% 8%, #312e81 0%, transparent 58%),' +
      'radial-gradient(950px 520px at 85% 92%, #4338ca 0%, transparent 55%),' +
      'linear-gradient(135deg, #0b1020 0%, #1e1b4b 55%, #312e81 100%)',
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10" style={meshBg}>

      {/* ── animated backdrop ── */}
      <div className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="pointer-events-none absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full opacity-30 blur-[90px]"
        style={{ background: '#6366f1', animation: 'glowPulse 7s ease-in-out infinite' }} />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-[380px] w-[380px] rounded-full opacity-25 blur-[80px]"
        style={{ background: '#7c3aed', animation: 'glowPulse 9s ease-in-out infinite 2s' }} />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.05]"
        style={{ animation: 'spinSlow 40s linear infinite' }} />

      {/* ── floating stat chips (large screens) ── */}
      <div className="glass-card af absolute left-[7%] top-[20%] hidden xl:block">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-300">Active Rentals</p>
        <p className="text-2xl font-bold text-white">1,240</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-emerald-300"><span>↑</span> 18% this week</p>
      </div>
      <div className="glass-card af2 absolute bottom-[16%] right-[8%] hidden xl:block">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-300">Deposits Safe</p>
        <p className="text-2xl font-bold text-white">₹8.4L</p>
        <p className="mt-0.5 text-xs text-indigo-300">auto-refunded on return</p>
      </div>

      {/* ── centered auth column ── */}
      <div className="relative z-10 w-full max-w-[430px]">

        {/* brand */}
        <div className="mb-6 flex flex-col items-center text-center al">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur">
            <span className="text-2xl font-black text-white">R</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">RentEase</h1>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: '#818cf8' }} />
            <span className="text-[11px] font-semibold tracking-wide text-indigo-200">Odoo × KSV Hackathon 2026</span>
          </div>
        </div>

        {/* card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/95 p-8 shadow-2xl backdrop-blur-xl as">
          <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Welcome back 👋</h2>
            <p className="mt-1 text-sm text-gray-500">Sign in to continue to your dashboard</p>
          </div>

          {justRegistered && !success && (
            <div className="as mb-5 flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Account created successfully! Please sign in.
            </div>
          )}
          {success && (
            <div className="as mb-5 flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {success}
            </div>
          )}
          {error && (
            <div className="as mb-5 flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Email address</label>
              <input type="email" name="email" value={form.email} onChange={onChange}
                placeholder="you@example.com" className="odoo-input" autoComplete="email" />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <Link href="/reset-password" className="text-xs font-medium transition-colors hover:underline" style={{ color: '#4f46e5' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} name="password" value={form.password}
                  onChange={onChange} placeholder="••••••••" className="odoo-input" style={{ paddingRight: '44px' }}
                  autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3.5 top-1/2 z-10 -translate-y-1/2 p-1 text-gray-400 transition-colors hover:text-gray-600">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-1">
              <button type="submit" disabled={loading} className="odoo-btn">
                {loading ? <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </> : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-xs font-medium text-gray-400">new here?</span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Link href="/signup" className="odoo-outline">Customer</Link>
            <Link href="/vendor-signup" className="odoo-outline" style={{ borderColor: '#eef2ff', color: '#4f46e5' }}>
              Vendor
            </Link>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-white/50">
          By continuing, you agree to our{' '}
          <span className="cursor-pointer text-indigo-300 hover:underline">Terms</span> &{' '}
          <span className="cursor-pointer text-indigo-300 hover:underline">Privacy</span>
        </p>
      </div>
    </div>
  )
}
