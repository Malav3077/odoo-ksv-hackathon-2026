'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

function AddressCard({ address, onDelete, onSetDefault }) {
  return (
    <div className={`bg-white rounded-xl border p-4 relative ${address.is_default ? 'border-indigo-400 bg-indigo-50/30' : 'border-gray-200'}`}>
      {address.is_default && (
        <span className="absolute top-3 right-3 text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">Default</span>
      )}
      <p className="font-semibold text-gray-900 text-sm">{address.full_name}</p>
      <p className="text-sm text-gray-600 mt-1">{address.address_line}</p>
      <p className="text-sm text-gray-600">{address.city}, {address.zip_code}</p>
      <p className="text-sm text-gray-600">{address.country}</p>
      <div className="flex gap-3 mt-3">
        {!address.is_default && (
          <button onClick={() => onSetDefault(address.id)}
            className="text-xs text-indigo-600 hover:underline font-medium">
            Set as Default
          </button>
        )}
        <button onClick={() => onDelete(address.id)}
          className="text-xs text-red-500 hover:underline font-medium ml-auto">
          Remove
        </button>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, login } = useAuth()

  const [profile, setProfile] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [saveErr, setSaveErr] = useState('')

  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '' })

  const [showAddAddr, setShowAddAddr] = useState(false)
  const [addrForm, setAddrForm] = useState({ full_name: '', address_line: '', city: '', zip_code: '', country: 'India', is_default: false })
  const [addrSaving, setAddrSaving] = useState(false)
  const [addrErr, setAddrErr] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [meRes, addrRes] = await Promise.all([
          api.get('/auth/me/'),
          api.get('/auth/addresses/'),
        ])
        setProfile(meRes.data)
        setForm({ first_name: meRes.data.first_name || '', last_name: meRes.data.last_name || '', phone: meRes.data.phone || '' })
        const addrData = addrRes.data
        setAddresses(Array.isArray(addrData) ? addrData : addrData.results || [])
      } catch {
        // profile load failed silently
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSaveProfile(e) {
    e.preventDefault()
    setSaving(true)
    setSaveMsg('')
    setSaveErr('')
    try {
      const res = await api.patch('/auth/me/', form)
      setProfile(res.data)
      setSaveMsg('Profile updated successfully!')
      setTimeout(() => setSaveMsg(''), 3000)
    } catch (err) {
      setSaveErr(err.response?.data?.detail || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddAddress(e) {
    e.preventDefault()
    if (!addrForm.full_name || !addrForm.address_line || !addrForm.city || !addrForm.zip_code) {
      setAddrErr('Please fill all required fields.')
      return
    }
    setAddrSaving(true)
    setAddrErr('')
    try {
      const res = await api.post('/auth/addresses/', addrForm)
      setAddresses(prev => [...prev, res.data])
      setAddrForm({ full_name: '', address_line: '', city: '', zip_code: '', country: 'India', is_default: false })
      setShowAddAddr(false)
    } catch (err) {
      setAddrErr(err.response?.data?.detail || 'Failed to add address.')
    } finally {
      setAddrSaving(false)
    }
  }

  async function handleDeleteAddress(id) {
    try {
      await api.delete(`/auth/addresses/${id}/`)
      setAddresses(prev => prev.filter(a => a.id !== id))
    } catch {
      alert('Could not remove address.')
    }
  }

  async function handleSetDefault(id) {
    try {
      const res = await api.put(`/auth/addresses/${id}/`, { ...addresses.find(a => a.id === id), is_default: true })
      setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })))
    } catch {
      alert('Could not update address.')
    }
  }

  const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-32" />
      <div className="h-48 bg-gray-200 rounded-2xl" />
      <div className="h-48 bg-gray-200 rounded-2xl" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {/* Profile info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-indigo-700 font-bold text-xl uppercase">
              {profile?.first_name?.[0] || user?.username?.[0] || 'U'}
            </span>
          </div>
          <div>
            <p className="font-bold text-gray-900">{profile?.first_name} {profile?.last_name}</p>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            <span className="inline-block mt-1 text-xs bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full capitalize">
              {profile?.role || 'customer'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input type="text" value={form.first_name}
                onChange={e => setForm({...form, first_name: e.target.value})}
                placeholder="First name" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" value={form.last_name}
                onChange={e => setForm({...form, last_name: e.target.value})}
                placeholder="Last name" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" value={form.phone}
              onChange={e => setForm({...form, phone: e.target.value})}
              placeholder="10-digit mobile" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={profile?.email || ''} disabled
              className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed`} />
          </div>

          {saveMsg && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl text-sm">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
              </svg>
              {saveMsg}
            </div>
          )}
          {saveErr && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl">
              {saveErr}
            </div>
          )}

          <button type="submit" disabled={saving}
            className="w-full bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-800 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-xl transition shadow-md text-sm disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Addresses */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Saved Addresses</h2>
          <button onClick={() => setShowAddAddr(v => !v)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
            <span className="text-lg leading-none">+</span> Add Address
          </button>
        </div>

        {showAddAddr && (
          <form onSubmit={handleAddAddress} className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">New Address</h3>
            <input type="text" placeholder="Full Name *" value={addrForm.full_name}
              onChange={e => setAddrForm({...addrForm, full_name: e.target.value})}
              className={inputCls} />
            <input type="text" placeholder="Street Address *" value={addrForm.address_line}
              onChange={e => setAddrForm({...addrForm, address_line: e.target.value})}
              className={inputCls} />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="City *" value={addrForm.city}
                onChange={e => setAddrForm({...addrForm, city: e.target.value})}
                className={inputCls} />
              <input type="text" placeholder="Pincode *" value={addrForm.zip_code}
                onChange={e => setAddrForm({...addrForm, zip_code: e.target.value})}
                className={inputCls} />
            </div>
            <input type="text" placeholder="Country" value={addrForm.country}
              onChange={e => setAddrForm({...addrForm, country: e.target.value})}
              className={inputCls} />
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={addrForm.is_default}
                onChange={e => setAddrForm({...addrForm, is_default: e.target.checked})}
                className="accent-indigo-600" />
              Set as default address
            </label>
            {addrErr && <p className="text-red-500 text-xs">{addrErr}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowAddAddr(false)}
                className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50 transition">
                Cancel
              </button>
              <button type="submit" disabled={addrSaving}
                className="flex-1 bg-indigo-700 hover:bg-indigo-600 text-white py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50">
                {addrSaving ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </form>
        )}

        {addresses.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <svg className="w-10 h-10 mx-auto mb-2 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm">No saved addresses yet.</p>
            <button onClick={() => setShowAddAddr(true)}
              className="text-sm text-indigo-600 hover:underline mt-1 font-medium">
              Add your first address
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map(addr => (
              <AddressCard key={addr.id} address={addr}
                onDelete={handleDeleteAddress}
                onSetDefault={handleSetDefault} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <Link href="/orders" className="text-sm text-indigo-600 hover:underline">
          View My Orders →
        </Link>
      </div>
    </div>
  )
}
