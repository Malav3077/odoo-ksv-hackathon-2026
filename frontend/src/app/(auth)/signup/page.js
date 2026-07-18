'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

function Rule({ met, text }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${met ? 'text-emerald-600' : 'text-slate-400'}`}>
      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-200 ${met ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
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
      router.push('/login?registered=true')
    } catch (err) {
      const d = err.response?.data
      if (d && typeof d === 'object') setFe(d)
      else setGe('Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  const ic = f => `pro-input${fe[f] ? ' err' : ''}`
  const err = f => { const v = fe[f]; return Array.isArray(v) ? v[0] : (v || '') }

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
            <p className="text-indigo-300 text-sm font-semibold uppercase tracking-widest mb-4">Get started free</p>
            <h2 className="text-4xl font-bold text-white leading-[1.2] mb-5">
              Rent anything,<br />anywhere, anytime.
            </h2>
            <p className="text-indigo-200 text-[15px] leading-relaxed mb-10 max-w-sm">
              Join thousands of customers who rent smarter with RentEase.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: '🚀', title: 'Quick signup', desc: 'Be renting in under 2 minutes' },
              { icon: '🛍️', title: 'Instant access', desc: 'Browse and book right away' },
              { icon: '💳', title: 'Safe deposits', desc: 'Fully refundable on return' },
              { icon: '📊', title: 'Order tracking', desc: 'Every stage, real-time' },
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

          <div className="mt-10 anim-float">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 w-fit">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['bg-violet-400','bg-indigo-400','bg-blue-400','bg-purple-400'].map((c,i) => (
                    <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-white/20`} />
                  ))}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">1,200+ customers</p>
                  <p className="text-indigo-300 text-xs">already on RentEase</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-indigo-400 text-xs">© 2026 RentEase · Odoo × KSV Hackathon</p>
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-white">
        <div className="w-full max-w-[420px]">

          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">R</span>
            </div>
            <span className="text-slate-800 text-lg font-bold">RentEase</span>
          </div>

          <div className="anim-fade-up">
            <h1 className="text-[26px] font-bold text-slate-900 mb-1">Create account</h1>
            <p className="text-slate-500 text-sm mb-7">
              Already have one?{' '}
              <Link href="/login" className="text-indigo-600 font-semibold hover:text-indigo-800">Sign in</Link>
            </p>
          </div>

          {ge && (
            <div className="mb-5 flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm anim-scale-up">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              {ge}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">

            <div className="grid grid-cols-2 gap-3 anim-fade-up d-1">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">First name</label>
                <input type="text" name="first_name" value={form.first_name} onChange={onChange} placeholder="Dhruvi" className={ic('first_name')} />
                {err('first_name') && <p className="text-red-500 text-xs mt-1">{err('first_name')}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Last name</label>
                <input type="text" name="last_name" value={form.last_name} onChange={onChange} placeholder="Shah" className={ic('last_name')} />
                {err('last_name') && <p className="text-red-500 text-xs mt-1">{err('last_name')}</p>}
              </div>
            </div>

            <div className="anim-fade-up d-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
              <input type="text" name="username" value={form.username} onChange={onChange} placeholder="dhruvi_shah" className={ic('username')} />
              {err('username') && <p className="text-red-500 text-xs mt-1">{err('username')}</p>}
            </div>

            <div className="anim-fade-up d-3">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
              <input type="email" name="email" value={form.email} onChange={onChange} placeholder="you@example.com" className={ic('email')} />
              {err('email') && <p className="text-red-500 text-xs mt-1">{err('email')}</p>}
            </div>

            <div className="anim-fade-up d-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={onChange}
                  placeholder="Create a strong password" className={ic('password')} style={{ paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors text-sm">
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              {err('password') && <p className="text-red-500 text-xs mt-1">{err('password')}</p>}
              {form.password.length > 0 && (
                <div className="mt-2.5 grid grid-cols-2 gap-1.5 p-3 bg-slate-50 border border-slate-100 rounded-xl anim-scale-up">
                  <Rule met={rules.length} text="6–12 characters" />
                  <Rule met={rules.upper} text="One uppercase" />
                  <Rule met={rules.lower} text="One lowercase" />
                  <Rule met={rules.special} text="One special (@ $ & _)" />
                </div>
              )}
            </div>

            <div className="anim-fade-up d-5">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm password</label>
              <div className="relative">
                <input type={showCpw ? 'text' : 'password'} name="confirm_password" value={form.confirm_password} onChange={onChange}
                  placeholder="Repeat your password" className={ic('confirm_password')} style={{ paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowCpw(!showCpw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors text-sm">
                  {showCpw ? '🙈' : '👁️'}
                </button>
              </div>
              {err('confirm_password') && <p className="text-red-500 text-xs mt-1">{err('confirm_password')}</p>}
              {form.confirm_password && form.password === form.confirm_password && !err('confirm_password') && (
                <p className="text-emerald-600 text-xs mt-1 flex items-center gap-1 anim-scale-up">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                  Passwords match
                </p>
              )}
            </div>

            <div className="pt-1 anim-fade-up d-6">
              <button type="submit" disabled={loading} className="pro-btn">
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Creating account...
                    </span>
                  : 'Create account'}
              </button>
            </div>
          </form>

          <p className="text-center text-xs text-slate-400 mt-5">
            Are you a vendor?{' '}
            <Link href="/vendor-signup" className="text-indigo-600 font-semibold hover:underline">Register as Vendor</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
