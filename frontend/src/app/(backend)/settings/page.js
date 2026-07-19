'use client'
import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

const PREFS_KEY = 'rentease_prefs'
const DEFAULT_PREFS = { pageSize: 20, overdueAlerts: true, compactTables: false }

const ORG_FIELDS = [
  { key: 'company_name', label: 'Company Name', type: 'text' },
  { key: 'currency', label: 'Currency', type: 'text' },
  { key: 'invoice_prefix', label: 'Invoice Prefix', type: 'text' },
  { key: 'tax_percent', label: 'Tax (%)', type: 'number' },
  { key: 'default_grace_hours', label: 'Default Grace Period (hours)', type: 'number' },
  { key: 'default_late_fee_per_hour', label: 'Default Late Fee (per hour)', type: 'number' },
]

function Card({ title, description, children }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  )
}

const inputCls =
  'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-50 disabled:text-gray-400'

function Banner({ msg }) {
  if (!msg) return null
  const ok = msg.type === 'ok'
  return (
    <div
      className={`mb-4 rounded-lg px-3 py-2 text-sm ${
        ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
      }`}
    >
      {msg.text}
    </div>
  )
}

function firstError(err, fallback) {
  const data = err?.response?.data
  if (data && typeof data === 'object') {
    const val = Object.values(data)[0]
    if (Array.isArray(val)) return val[0]
    if (typeof val === 'string') return val
    if (typeof data.detail === 'string') return data.detail
  }
  return fallback
}

function OrganizationCard() {
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    let alive = true
    api
      .get('/settings/')
      .then((res) => alive && setForm(res.data))
      .catch(() => alive && setMsg({ type: 'err', text: 'Could not load settings (admin only).' }))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setMsg(null)
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    try {
      const res = await api.patch('/settings/', form)
      setForm(res.data)
      setMsg({ type: 'ok', text: 'Settings saved. New orders will use these values.' })
    } catch (err) {
      setMsg({ type: 'err', text: firstError(err, 'Could not save settings.') })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card title="Organization" description="Organization-wide rental configuration.">
      <Banner msg={msg} />
      {loading ? (
        <div className="h-40 animate-pulse rounded-xl bg-gray-100" />
      ) : !form ? (
        <p className="py-6 text-center text-sm text-gray-400">Not available.</p>
      ) : (
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {ORG_FIELDS.map((f) => (
              <Field key={f.key} label={f.label}>
                <input
                  name={f.key}
                  type={f.type}
                  min={f.type === 'number' ? '0' : undefined}
                  value={form[f.key] ?? ''}
                  onChange={change}
                  className={inputCls}
                />
              </Field>
            ))}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save settings'}
          </button>
          <p className="text-xs text-gray-400">
            Tax percent is applied to every new order total. Grace and late-fee defaults guide new product setup.
          </p>
        </form>
      )}
    </Card>
  )
}

function ProfileCard() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    let alive = true
    api
      .get('/auth/me/')
      .then((res) => {
        if (!alive) return
        setForm({
          first_name: res.data.first_name || '',
          last_name: res.data.last_name || '',
          phone: res.data.phone || '',
        })
      })
      .catch(() => alive && setMsg({ type: 'err', text: 'Could not load your profile.' }))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    try {
      const res = await api.patch('/auth/me/', form)
      updateUser({
        first_name: res.data.first_name,
        last_name: res.data.last_name,
        phone: res.data.phone,
        name: `${res.data.first_name} ${res.data.last_name}`.trim(),
      })
      setMsg({ type: 'ok', text: 'Profile updated.' })
    } catch (err) {
      setMsg({ type: 'err', text: firstError(err, 'Failed to update profile.') })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card title="Profile" description="Your account details and contact info.">
      <Banner msg={msg} />
      <form onSubmit={save} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name">
            <input
              className={inputCls}
              value={form.first_name}
              disabled={loading}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            />
          </Field>
          <Field label="Last name">
            <input
              className={inputCls}
              value={form.last_name}
              disabled={loading}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone">
            <input
              className={inputCls}
              value={form.phone}
              disabled={loading}
              placeholder="+91 …"
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>
          <Field label="Email (read-only)">
            <input className={inputCls} value={user?.email || ''} disabled />
          </Field>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving || loading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {user?.role && (
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-purple-700">
              {user.role}
            </span>
          )}
        </div>
      </form>
    </Card>
  )
}

function PasswordCard() {
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  async function save(e) {
    e.preventDefault()
    setMsg(null)
    if (form.new_password !== form.confirm) {
      setMsg({ type: 'err', text: 'New passwords do not match.' })
      return
    }
    setSaving(true)
    try {
      await api.post('/auth/change-password/', {
        old_password: form.old_password,
        new_password: form.new_password,
      })
      setForm({ old_password: '', new_password: '', confirm: '' })
      setMsg({ type: 'ok', text: 'Password changed successfully.' })
    } catch (err) {
      setMsg({ type: 'err', text: firstError(err, 'Failed to change password.') })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card title="Password" description="6–12 chars with an uppercase, lowercase & one of @ $ & _">
      <Banner msg={msg} />
      <form onSubmit={save} className="space-y-4">
        <Field label="Current password">
          <input
            type="password"
            className={inputCls}
            value={form.old_password}
            onChange={(e) => setForm({ ...form, old_password: e.target.value })}
            required
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="New password">
            <input
              type="password"
              className={inputCls}
              value={form.new_password}
              onChange={(e) => setForm({ ...form, new_password: e.target.value })}
              required
            />
          </Field>
          <Field label="Confirm new password">
            <input
              type="password"
              className={inputCls}
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              required
            />
          </Field>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </Card>
  )
}

function PreferencesCard() {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PREFS_KEY)
      if (saved) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(saved) })
    } catch {
      /* ignore corrupt prefs */
    }
  }, [])

  function save() {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
    setMsg({ type: 'ok', text: 'Preferences saved on this device.' })
  }

  function Toggle({ label, hint, on, onChange }) {
    return (
      <div className="flex items-center justify-between gap-4 py-2">
        <div>
          <p className="text-sm font-medium text-gray-800">{label}</p>
          {hint && <p className="text-xs text-gray-500">{hint}</p>}
        </div>
        <button
          type="button"
          onClick={() => onChange(!on)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition ${
            on ? 'bg-indigo-600' : 'bg-gray-300'
          }`}
          aria-pressed={on}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
              on ? 'left-[22px]' : 'left-0.5'
            }`}
          />
        </button>
      </div>
    )
  }

  return (
    <Card title="Preferences" description="Saved in this browser only.">
      <Banner msg={msg} />
      <div className="divide-y divide-gray-100">
        <div className="flex items-center justify-between gap-4 py-2">
          <div>
            <p className="text-sm font-medium text-gray-800">Rows per page</p>
            <p className="text-xs text-gray-500">Default page size for lists.</p>
          </div>
          <select
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
            value={prefs.pageSize}
            onChange={(e) => setPrefs({ ...prefs, pageSize: Number(e.target.value) })}
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <Toggle
          label="Overdue alerts"
          hint="Highlight late returns on the dashboard."
          on={prefs.overdueAlerts}
          onChange={(v) => setPrefs({ ...prefs, overdueAlerts: v })}
        />
        <Toggle
          label="Compact tables"
          hint="Tighter row spacing in lists."
          on={prefs.compactTables}
          onChange={(v) => setPrefs({ ...prefs, compactTables: v })}
        />
      </div>
      <button
        onClick={save}
        className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        Save preferences
      </button>
    </Card>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage organization config, your profile, password, and preferences.</p>
      </div>
      {user?.role === 'admin' && <OrganizationCard />}
      <ProfileCard />
      <PasswordCard />
      <PreferencesCard />
    </div>
  )
}
