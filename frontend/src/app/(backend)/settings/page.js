'use client'
import { useState, useEffect } from 'react'
import api from '@/lib/api'

const FIELDS = [
  { key: 'company_name', label: 'Company Name', type: 'text' },
  { key: 'currency', label: 'Currency', type: 'text' },
  { key: 'invoice_prefix', label: 'Invoice Prefix', type: 'text' },
  { key: 'tax_percent', label: 'Tax (%)', type: 'number' },
  { key: 'default_grace_hours', label: 'Default Grace Period (hours)', type: 'number' },
  { key: 'default_late_fee_per_hour', label: 'Default Late Fee (per hour)', type: 'number' },
]

export default function SettingsPage() {
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/settings/')
      .then((res) => setForm(res.data))
      .catch(() => setError('Could not load settings (admin only).'))
      .finally(() => setLoading(false))
  }, [])

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setMessage('')
    setError('')
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const res = await api.patch('/settings/', form)
      setForm(res.data)
      setMessage('Settings saved. New orders will use these values.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not save settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
  if (!form) return <div className="py-16 text-center text-gray-400">{error || 'Not available'}</div>

  const input =
    'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500'

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Organization-wide rental configuration.</p>
      </div>

      {message && (
        <div className="mb-4 rounded-xl bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">{message}</div>
      )}
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>
      )}

      <form onSubmit={save} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input
                name={f.key}
                type={f.type}
                min={f.type === 'number' ? '0' : undefined}
                value={form[f.key] ?? ''}
                onChange={change}
                className={input}
              />
            </div>
          ))}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold px-6 py-2.5 transition disabled:opacity-50 text-sm"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      <p className="mt-4 text-xs text-gray-400">
        Tax percent is applied to every new order total. Grace and late-fee defaults guide new product setup.
      </p>
    </div>
  )
}
