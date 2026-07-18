'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

export default function VendorSignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    first_name:'', last_name:'', username:'', email:'',
    company_name:'', gst_no:'', password:'', confirm_password:''
  })
  const [showPw, setShowPw] = useState(false)
  const [showCpw, setShowCpw] = useState(false)
  const [fe, setFe] = useState({})
  const [ge, setGe] = useState('')
  const [loading, setLoading] = useState(false)

  const pw = form.password
  const rules = {
    length: pw.length >= 6 && pw.length <= 12,
    upper: /[A-Z]/.test(pw), lower: /[a-z]/.test(pw), special: /[@$&_]/.test(pw),
  }
  const pwOk = Object.values(rules).every(Boolean)

  function onChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setFe(f => ({ ...f, [e.target.name]: '' }))
    setGe('')
  }

  function validate() {
    const e = {}
    if (!form.first_name.trim()) e.first_name = ['Required']
    if (!form.last_name.trim()) e.last_name = ['Required']
    if (!form.username.trim()) e.username = ['Required']
    if (!form.email.trim()) e.email = ['Required']
    if (!form.company_name.trim()) e.company_name = ['Required']
    if (!form.gst_no.trim()) e.gst_no = ['Required']
    if (!pwOk) e.password = ['Password does not meet all requirements']
    if (form.password !== form.confirm_password) e.confirm_password = ['Passwords do not match']
    return e
  }

  async function onSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFe(errs); return }
    setLoading(true)
    try {
      await api.post('/auth/register/vendor/', {
        username: form.username, email: form.email,
        password: form.password, confirm_password: form.confirm_password,
        first_name: form.first_name, last_name: form.last_name,
        company_name: form.company_name, gst_no: form.gst_no,
      })
      router.push('/login?registered=vendor')
    } catch (err) {
      const d = err.response?.data
      if (d && typeof d === 'object') setFe(d)
      else setGe('Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  const ic = f => `odoo-input${fe[f] ? ' e' : ''}`
  const err = f => { const v = fe[f]; return Array.isArray(v) ? v[0] : (v || '') }

  return (
    <div className="min-h-screen flex">

      {/* ══ LEFT PANEL ══ */}
      <div className="odoo-left hidden lg:flex lg:w-[52%] flex-col justify-between p-14 overflow-hidden">

        <div className="absolute top-[-120px] right-[-120px] w-[380px] h-[380px] rounded-full bg-violet-500 opacity-20 blur-[80px]"
          style={{ animation: 'glowPulse 7s ease-in-out infinite' }} />
        <div className="absolute bottom-[-100px] left-[-80px] w-[320px] h-[320px] rounded-full bg-purple-700 opacity-25 blur-[70px]"
          style={{ animation: 'glowPulse 10s ease-in-out infinite 2s' }} />
        <div className="absolute top-1/2 right-[-60px] -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-white/[0.06]"
          style={{ animation: 'spinSlow 35s linear infinite' }} />

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
              <span className="w-1.5 h-1.5 bg-violet-300 rounded-full animate-pulse" />
              <span className="text-violet-200 text-xs font-semibold tracking-wide">For Vendors</span>
            </div>
            <h2 className="text-[40px] font-bold text-white leading-[1.15] mb-5 tracking-tight">
              Grow your rental<br />
              <span style={{ background: 'linear-gradient(90deg, #c4b5fd, #a78bfa, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                business here.
              </span>
            </h2>
            <p className="text-violet-200/80 text-[15px] leading-relaxed max-w-[340px] mb-10">
              List products, process orders, manage pickups & returns — all from your vendor dashboard.
            </p>
          </div>

          <div className="space-y-3 au d2">
            {[
              { icon: '🏪', title: 'List products', desc: 'Publish your rental catalog easily' },
              { icon: '📋', title: 'Manage orders', desc: 'Quotation to confirmation in clicks' },
              { icon: '🔄', title: 'Pickup & return', desc: 'Streamlined inspection workflow' },
              { icon: '💰', title: 'Revenue tracking', desc: 'Real-time earnings & deposits' },
            ].map(f => (
              <div key={f.title} className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-base flex-shrink-0">{f.icon}</div>
                <div>
                  <p className="text-white text-sm font-semibold leading-none mb-0.5">{f.title}</p>
                  <p className="text-violet-300 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 au d3">
            <div className="glass-card af w-fit">
              <p className="text-violet-300 text-[10px] font-semibold uppercase tracking-wider mb-1">Avg. vendor this month</p>
              <p className="text-white text-2xl font-bold">₹48,200</p>
              <p className="text-emerald-300 text-xs mt-0.5">↑ 23% vs last month</p>
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
            <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">R</span>
            </div>
            <span className="text-gray-900 text-lg font-bold">RentEase</span>
          </div>

          <div className="odoo-card au">
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 bg-violet-50 border border-violet-200 text-violet-600 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                🏪 Vendor Registration
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1.5">Register as Vendor</h1>
              <p className="text-gray-500 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-violet-600 font-semibold hover:text-violet-800 transition-colors">Sign in</Link>
              </p>
            </div>

            {ge && (
              <div className="mb-5 as flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
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
                  <input type="text" name="first_name" value={form.first_name} onChange={onChange} placeholder="Malav" className={ic('first_name')} />
                  {err('first_name') && <p className="text-red-500 text-xs mt-1">{err('first_name')}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last name</label>
                  <input type="text" name="last_name" value={form.last_name} onChange={onChange} placeholder="Patel" className={ic('last_name')} />
                  {err('last_name') && <p className="text-red-500 text-xs mt-1">{err('last_name')}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 au d2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
                  <input type="text" name="username" value={form.username} onChange={onChange} placeholder="malav_co" className={ic('username')} />
                  {err('username') && <p className="text-red-500 text-xs mt-1">{err('username')}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <input type="email" name="email" value={form.email} onChange={onChange} placeholder="you@co.com" className={ic('email')} />
                  {err('email') && <p className="text-red-500 text-xs mt-1">{err('email')}</p>}
                </div>
              </div>

              {/* Business section */}
              <div className="au d3 rounded-xl border border-violet-100 bg-violet-50/50 p-4 space-y-3">
                <p className="text-xs font-bold text-violet-600 uppercase tracking-wider flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                  Business Details
                </p>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company name</label>
                  <input type="text" name="company_name" value={form.company_name} onChange={onChange} placeholder="Patel Rentals Pvt. Ltd." className={ic('company_name')} />
                  {err('company_name') && <p className="text-red-500 text-xs mt-1">{err('company_name')}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">GST number</label>
                  <input type="text" name="gst_no" value={form.gst_no} onChange={onChange} placeholder="22AAAAA0000A1Z5" className={ic('gst_no')} />
                  {err('gst_no') && <p className="text-red-500 text-xs mt-1">{err('gst_no')}</p>}
                </div>
              </div>

              <div className="au d4">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={onChange}
                    placeholder="Create a strong password" className={ic('password')} style={{ paddingRight: '44px' }} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600 transition-colors text-sm">
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
                {err('password') && <p className="text-red-500 text-xs mt-1">{err('password')}</p>}
                {form.password.length > 0 && (
                  <div className="mt-2.5 grid grid-cols-2 gap-1.5 p-3 bg-violet-50 border border-violet-100 rounded-xl as">
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
                  <button type="button" onClick={() => setShowCpw(!showCpw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600 transition-colors text-sm">
                    {showCpw ? '🙈' : '👁️'}
                  </button>
                </div>
                {err('confirm_password') && <p className="text-red-500 text-xs mt-1">{err('confirm_password')}</p>}
              </div>

              <div className="pt-1 au d6">
                <button type="submit" disabled={loading} className="odoo-btn">
                  {loading ? <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Registering...
                  </> : 'Register as Vendor'}
                </button>
              </div>
            </form>

            <p className="text-center text-xs text-gray-400 mt-5">
              Want to rent instead?{' '}
              <Link href="/signup" className="text-violet-600 font-semibold hover:underline">Customer signup</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
