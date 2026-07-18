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
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Email aur password dono zaroori hain.')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/login/', {
        email: form.email,
        password: form.password,
      })
      login(res.data.user, res.data.access, res.data.refresh)
      router.push('/shop')
    } catch (err) {
      const detail =
        err.response?.data?.detail || 'Login failed. Please try again.'
      setError(detail)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-white shadow rounded p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Welcome back</h1>
        <p className="text-gray-600 text-sm mt-1">
          Sign in to your RentEase account
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-700 text-white hover:bg-purple-800 rounded px-4 py-2 font-medium disabled:opacity-50 transition-colors"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-5 flex justify-between text-sm">
        <Link
          href="/reset-password"
          className="text-purple-700 hover:underline"
        >
          Forgot password?
        </Link>
        <Link href="/signup" className="text-purple-700 hover:underline">
          Create account
        </Link>
      </div>
    </div>
  )
}
