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
      login(res.data.user, res.data.access, res.data.refresh)
      setSuccess('Login successful! Redirecting...')
      setTimeout(() => { window.location.href = '/shop' }, 1200)
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ══ ODOO-STYLE LEFT PANEL ══ */}
      <div className="odoo-left hidden lg:flex lg:w-[55%] flex-col justify-between p-14 overflow-hidden">

        {/* Glow orbs */}
        <div className="absolute top-[-120px] right-[-120px] w-[400px] h-[400px] rounded-full opacity-20 blur-[80px]"
          style={{ background: '#4f46e5', animation: 'glowPulse 6s ease-in-out infinite' }} />
        <div className="absolute bottom-[-100px] left-[-80px] w-[350px] h-[350px] rounded-full opacity-25 blur-[70px]"
          style={{ background: '#3730a3', animation: 'glowPulse 8s ease-in-out infinite 2s' }} />

        {/* Rotating ring decoration */}
        <div className="absolute top-1/2 right-[-60px] -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-white/[0.06]"
          style={{ animation: 'spinSlow 30s linear infinite' }} />
        <div className="absolute top-1/2 right-[-30px] -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-white/[0.04]"
          style={{ animation: 'spinSlow 20s linear infinite reverse' }} />

        {/* Logo */}
        <div className="relative z-10 al">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
              <span className="text-white font-black text-base">R</span>
            </div>
            <span className="text-white text-xl font-bold tracking-tight">RentEase</span>
          </div>
        </div>

        {/* Center hero */}
        <div className="relative z-10">
          <div className="au">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3.5 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#818cf8' }} />
              <span className="text-indigo-200 text-xs font-semibold tracking-wide">Odoo × KSV Hackathon 2026</span>
            </div>
            <h2 className="text-[42px] font-bold text-white leading-[1.15] mb-5 tracking-tight">
              The smarter way<br />
              <span style={{ background: 'linear-gradient(90deg, #a5b4fc, #818cf8, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                to rent anything.
              </span>
            </h2>
            <p className="text-indigo-200/80 text-[15px] leading-relaxed max-w-[340px] mb-10">
              A complete rental management platform — from browse to return, automated.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mb-10 au d2">
            {['📦 Product Catalog', '🔒 Secure Deposits', '📄 Auto Invoices', '🔄 Easy Returns'].map(f => (
              <span key={f} className="text-xs text-indigo-200 bg-white/8 border border-white/10 rounded-full px-3.5 py-1.5 font-medium">
                {f}
              </span>
            ))}
          </div>

          {/* Floating glass cards */}
          <div className="flex gap-3 au d3">
            <div className="glass-card af">
              <p className="text-indigo-300 text-[10px] font-semibold uppercase tracking-wider mb-1">Active Rentals</p>
              <p className="text-white text-2xl font-bold">1,240</p>
              <p className="text-emerald-300 text-xs mt-0.5 flex items-center gap-1">
                <span>↑</span> 18% this week
              </p>
            </div>
            <div className="glass-card af2">
              <p className="text-indigo-300 text-[10px] font-semibold uppercase tracking-wider mb-1">Deposits Safe</p>
              <p className="text-white text-2xl font-bold">₹8.4L</p>
              <p className="text-indigo-300 text-xs mt-0.5">auto-refunded on return</p>
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

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#4f46e5' }}>
              <span className="text-white font-black text-sm">R</span>
            </div>
            <span className="text-gray-900 text-lg font-bold">RentEase</span>
          </div>

          <div className="odoo-card au">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-gray-900 mb-1.5">Welcome back</h1>
              <p className="text-gray-500 text-sm">Sign in to your RentEase account</p>
            </div>

            {justRegistered && !success && (
              <div className="mb-5 as flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
                Account created successfully! Please sign in.
              </div>
            )}

            {success && (
              <div className="mb-5 as flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
                {success}
              </div>
            )}

            {error && (
              <div className="mb-5 as flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="au d1">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                <input type="email" name="email" value={form.email} onChange={onChange}
                  placeholder="you@example.com" className="odoo-input" />
              </div>

              <div className="au d2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-gray-700">Password</label>
                  <Link href="/reset-password" className="text-xs font-medium transition-colors" style={{ color: '#4f46e5' }}>
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} name="password" value={form.password}
                    onChange={onChange} placeholder="••••••••"
                    className="odoo-input" style={{ paddingRight: '44px' }} />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10 p-1">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="au d3 pt-1">
                <button type="submit" disabled={loading} className="odoo-btn">
                  {loading ? <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Signing in...
                  </> : 'Sign in'}
                </button>
              </div>
            </form>

            <div className="my-5 flex items-center gap-3 au d4">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <div className="space-y-2.5 au d5">
              <Link href="/signup" className="odoo-outline">Create a customer account</Link>
              <Link href="/vendor-signup" className="odoo-outline" style={{ borderColor: '#eef2ff', color: '#4f46e5' }}>
                Register as a Vendor
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5 au d6">
            By continuing, you agree to our{' '}
            <span className="hover:underline cursor-pointer" style={{ color: '#4f46e5' }}>Terms</span> &{' '}
            <span className="hover:underline cursor-pointer" style={{ color: '#4f46e5' }}>Privacy</span>
          </p>
        </div>
      </div>
    </div>
  )
}
