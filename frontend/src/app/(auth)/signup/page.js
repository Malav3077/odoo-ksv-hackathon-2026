'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import api from '@/lib/api'

function Rule({ met, text }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${met ? 'rule-met' : 'rule-no'}`}>
      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-200 ${met ? 'rule-dot-met' : 'rule-dot-no'}`}>
        {met && <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
      </div>
      {text}
    </div>
  )
}

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ first_name:'', last_name:'', username:'', email:'', password:'', confirm_password:'' })
  const [showPw, setShowPw] = useState(false)
  const [showCpw, setShowCpw] = useState(false)
  const [fe, setFe] = useState({})
  const [ge, setGe] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const pw = form.password
  const rules = {
    length: pw.length >= 6 && pw.length <= 12,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    special: /[@$&_]/.test(pw),
  }
  const pwOk = Object.values(rules).every(Boolean)

  function onChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setFe(f => ({ ...f, [e.target.name]: '' }))
    setGe('')
  }

  function validate() {
    const e = {}
    if (!form.first_name.trim()) e.first_name = 'Required'
    if (!form.last_name.trim()) e.last_name = 'Required'
    if (!form.username.trim()) e.username = 'Required'
    if (!form.email.trim()) e.email = 'Required'
    if (!pwOk) e.password = 'Password does not meet all requirements'
    if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match'
    return e
  }

  async function onSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFe(errs); return }
    setLoading(true)
    try {
      await api.post('/auth/register/', {
        username: form.username, email: form.email,
        password: form.password, confirm_password: form.confirm_password,
        first_name: form.first_name, last_name: form.last_name,
      })
      setSuccess('Account created successfully! Redirecting to login...')
      setTimeout(() => { window.location.href = '/login?registered=true' }, 1500)
    } catch (err) {
      const d = err.response?.data
      if (d && typeof d === 'object') setFe(d)
      else setGe('Registration failed. Please try again.')
      setLoading(false)
    }
  }

  const ic = f => `odoo-input${fe[f] ? ' e' : ''}`
  const err = f => { const v = fe[f]; return Array.isArray(v) ? v[0] : (v || '') }

  return (
    <div className="min-h-screen flex">

      {/* ══ LEFT PANEL ══ */}
      <div className="odoo-left hidden lg:flex lg:w-[52%] flex-col justify-between p-14 overflow-hidden">

        <div className="absolute top-[-120px] right-[-120px] w-[380px] h-[380px] rounded-full opacity-20 blur-[80px]"
          style={{ background: '#9c27b0', animation: 'glowPulse 6s ease-in-out infinite' }} />
        <div className="absolute bottom-[-100px] left-[-80px] w-[320px] h-[320px] rounded-full opacity-25 blur-[70px]"
          style={{ background: '#6a1b9a', animation: 'glowPulse 9s ease-in-out infinite 3s' }} />
        <div className="absolute top-1/2 right-[-60px] -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-white/[0.06]"
          style={{ animation: 'spinSlow 30s linear infinite' }} />

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
              <span className="text-purple-200 text-xs font-semibold tracking-wide">Get started free</span>
            </div>
            <h2 className="text-[40px] font-bold text-white leading-[1.15] mb-5 tracking-tight">
              Rent anything,<br />
              <span style={{ background: 'linear-gradient(90deg, #f48fb1, #ce93d8, #ab47bc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                anywhere, anytime.
              </span>
            </h2>
            <p className="text-purple-200/80 text-[15px] leading-relaxed max-w-[340px] mb-10">
              Join thousands of customers who rent smarter with RentEase.
            </p>
          </div>

          <div className="space-y-3 au d2">
            {[
              { icon: '🚀', title: 'Quick signup', desc: 'Be renting in under 2 minutes' },
              { icon: '🛍️', title: 'Instant access', desc: 'Browse and book right away' },
              { icon: '💳', title: 'Safe deposits', desc: 'Fully refundable on return' },
              { icon: '📊', title: 'Order tracking', desc: 'Every stage, real-time' },
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
            <div className="glass-card af w-fit">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['bg-violet-400','bg-indigo-400','bg-blue-400','bg-purple-400'].map((c,i) => (
                    <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-white/20`} />
                  ))}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">1,200+ customers</p>
                  <p className="text-purple-300 text-xs">already on RentEase</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/30 text-xs">© 2026 RentEase — Built for Odoo × KSV Hackathon</p>
        </div>
      </div>

      {/* ══ RIGHT PANEL ══ */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-10">
        <div className="w-full max-w-[420px]">

          <div className="flex items-center gap-2.5 mb-6 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#7b1fa2' }}>
              <span className="text-white font-black text-sm">R</span>
            </div>
            <span className="text-gray-900 text-lg font-bold">RentEase</span>
          </div>

          <div className="odoo-card au">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1.5">Create account</h1>
              <p className="text-gray-500 text-sm">
                Already have one?{' '}
                <Link href="/login" className="font-semibold transition-colors" style={{ color: '#7b1fa2' }}>Sign in</Link>
              </p>
            </div>

            {success && (
              <div className="mb-5 as flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
                {success}
              </div>
            )}

            {ge && (
              <div className="mb-5 as flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {ge}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">

              <div className="grid grid-cols-2 gap-3 au d1">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">First name</label>
                  <input type="text" name="first_name" value={form.first_name} onChange={onChange} placeholder="Dhruvi" className={ic('first_name')} />
                  {err('first_name') && <p className="text-red-500 text-xs mt-1">{err('first_name')}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last name</label>
                  <input type="text" name="last_name" value={form.last_name} onChange={onChange} placeholder="Shah" className={ic('last_name')} />
                  {err('last_name') && <p className="text-red-500 text-xs mt-1">{err('last_name')}</p>}
                </div>
              </div>

              <div className="au d2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
                <input type="text" name="username" value={form.username} onChange={onChange} placeholder="dhruvi_shah" className={ic('username')} />
                {err('username') && <p className="text-red-500 text-xs mt-1">{err('username')}</p>}
              </div>

              <div className="au d3">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                <input type="email" name="email" value={form.email} onChange={onChange} placeholder="you@example.com" className={ic('email')} />
                {err('email') && <p className="text-red-500 text-xs mt-1">{err('email')}</p>}
              </div>

              <div className="au d4">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={onChange}
                    placeholder="Create a strong password" className={ic('password')} style={{ paddingRight: '44px' }} />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10 p-1">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {err('password') && <p className="text-red-500 text-xs mt-1">{err('password')}</p>}
                {form.password.length > 0 && (
                  <div className="mt-2.5 grid grid-cols-2 gap-1.5 p-3 bg-purple-50 border border-purple-100 rounded-xl as">
                    <Rule met={rules.length} text="6–12 characters" />
                    <Rule met={rules.upper} text="One uppercase" />
                    <Rule met={rules.lower} text="One lowercase" />
                    <Rule met={rules.special} text="One special (@ $ & _)" />
                  </div>
                )}
              </div>

              <div className="au d5">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm password</label>
                <div className="relative">
                  <input type={showCpw ? 'text' : 'password'} name="confirm_password" value={form.confirm_password} onChange={onChange}
                    placeholder="Repeat your password" className={ic('confirm_password')} style={{ paddingRight: '44px' }} />
                  <button type="button" onClick={() => setShowCpw(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10 p-1">
                    {showCpw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {err('confirm_password') && <p className="text-red-500 text-xs mt-1">{err('confirm_password')}</p>}
                {form.confirm_password && form.password === form.confirm_password && !err('confirm_password') && (
                  <p className="text-emerald-600 text-xs mt-1 flex items-center gap-1 as">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                    Passwords match
                  </p>
                )}
              </div>

              <div className="pt-1 au d6">
                <button type="submit" disabled={loading} className="odoo-btn">
                  {loading ? <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Creating account...
                  </> : 'Create account'}
                </button>
              </div>
            </form>

            <p className="text-center text-xs text-gray-400 mt-5">
              Are you a vendor?{' '}
              <Link href="/vendor-signup" className="font-semibold hover:underline" style={{ color: '#7b1fa2' }}>Register as Vendor</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
