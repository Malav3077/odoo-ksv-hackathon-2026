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
    if (!form.email || !form.password) { setError('Please enter email and password.'); return }
    setLoading(true)
    try {
      const res = await api.post('/auth/login/', { email: form.email, password: form.password })
      login(res.data.user, res.data.access, res.data.refresh)
      router.push('/shop')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* ── LEFT PANEL ── */}
      <div className="pro-left hidden lg:flex lg:w-[52%] flex-col justify-between p-14 relative overflow-hidden">

        {/* subtle dot grid overlay */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }} />

        {/* glow blobs */}
        <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full bg-indigo-400 opacity-20 blur-3xl" />
        <div className="absolute bottom-[-60px] left-[-40px] w-64 h-64 rounded-full bg-violet-500 opacity-20 blur-3xl" />

        {/* Logo */}
        <div className="relative z-10 anim-slide-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-base">R</span>
            </div>
            <span className="text-white text-xl font-bold tracking-tight">RentEase</span>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <div className="anim-fade-up">
            <p className="text-indigo-300 text-sm font-semibold uppercase tracking-widest mb-4">Rental Management</p>
            <h2 className="text-4xl font-bold text-white leading-[1.2] mb-5">
              The smarter way<br />to rent anything.
            </h2>
            <p className="text-indigo-200 text-[15px] leading-relaxed mb-10 max-w-sm">
              Browse, book, and manage your entire rental lifecycle from one clean dashboard.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              { icon: '📦', title: 'Huge catalog', desc: 'Electronics, furniture, vehicles & more' },
              { icon: '🔒', title: 'Secure deposits', desc: 'Auto refund on timely return' },
              { icon: '📄', title: 'Instant invoices', desc: 'PDF download after every order' },
              { icon: '🔄', title: 'Easy returns', desc: 'Track status at every step' },
            ].map((f, i) => (
              <div key={f.title} className={`flex items-center gap-3.5 anim-fade-up d-${i + 2}`}>
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-base flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold leading-none mb-0.5">{f.title}</p>
                  <p className="text-indigo-300 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Floating stats card */}
          <div className="mt-10 anim-float">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4 w-fit">
              <div className="w-10 h-10 bg-green-400/20 rounded-xl flex items-center justify-center">
                <span className="text-green-300 font-bold text-sm">↑</span>
              </div>
              <div>
                <p className="text-white text-sm font-semibold">500+ active rentals</p>
                <p className="text-indigo-300 text-xs">across all categories today</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-indigo-400 text-xs">© 2026 RentEase · Odoo × KSV Hackathon</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">R</span>
            </div>
            <span className="text-slate-800 text-lg font-bold">RentEase</span>
          </div>

          <div className="anim-fade-up">
            <h1 className="text-[26px] font-bold text-slate-900 mb-1">Sign in</h1>
            <p className="text-slate-500 text-sm mb-8">Welcome back — enter your credentials to continue.</p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm anim-scale-up">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="anim-fade-up d-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="you@example.com" className="pro-input" />
            </div>

            <div className="anim-fade-up d-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <Link href="/reset-password" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password}
                  onChange={handleChange} placeholder="Enter your password"
                  className="pro-input" style={{ paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors text-sm">
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="anim-fade-up d-3 pt-1">
              <button type="submit" disabled={loading} className="pro-btn">
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Signing in...
                    </span>
                  : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="my-6 pro-divider anim-fade-up d-4">or</div>

          <div className="space-y-2.5 anim-fade-up d-5">
            <Link href="/signup" className="pro-btn-outline">Create a customer account</Link>
            <Link href="/vendor-signup" className="pro-btn-outline" style={{ borderColor: '#c7d2fe', color: '#4f46e5' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.borderColor = '#818cf8' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#c7d2fe' }}>
              Register as a Vendor
            </Link>
          </div>

          <p className="text-center text-xs text-slate-400 mt-8 anim-fade-up d-6">
            By continuing you agree to our{' '}
            <span className="text-indigo-500 hover:underline cursor-pointer">Terms</span> &{' '}
            <span className="text-indigo-500 hover:underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  )
}
