'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import RouteGuard from '@/components/RouteGuard'
import { useAuth } from '@/context/AuthContext'

export default function BackendLayout({ children }) {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <RouteGuard allow={['admin', 'vendor']}>
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6">
          <button
            className="text-2xl text-gray-600 md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            &#9776;
          </button>
          <div className="flex flex-1 items-center">
            <input
              type="search"
              placeholder="Search..."
              className="w-full max-w-xs rounded border border-gray-200 px-3 py-1.5 text-sm focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-gray-600 sm:inline">
              {user?.name || user?.email || 'User'}
            </span>
            <button
              onClick={logout}
              className="rounded bg-purple-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-800"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
    </RouteGuard>
  )
}
