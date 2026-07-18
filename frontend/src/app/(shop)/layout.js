'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'

export default function ShopLayout({ children }) {
  const { user, logout } = useAuth()
  const { totalItems } = useCart()
  const pathname = usePathname()
  const router = useRouter()

  function handleLogout() {
    logout()
    router.push('/login')
  }

  const navLinks = [
    { href: '/shop', label: 'Products' },
    { href: '/orders', label: 'My Orders' },
    { href: '/profile', label: 'Profile' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/shop" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">R</span>
              </div>
              <span className="text-indigo-900 text-xl font-bold tracking-tight">RentEase</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    pathname === link.href
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/cart"
                className="relative p-2 text-gray-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition"
                title="Cart"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              {user && (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-700 font-semibold text-xs uppercase">
                        {user.first_name?.[0] || user.username?.[0] || 'U'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700 font-medium">
                      {user.first_name || user.username}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition font-medium"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-700 rounded flex items-center justify-center">
              <span className="text-white font-black text-xs">R</span>
            </div>
            <span className="text-gray-500 text-sm">© 2026 RentEase · Odoo x KSV Hackathon</span>
          </div>
          <div className="flex gap-4 text-xs text-gray-400">
            <span className="hover:text-indigo-600 cursor-pointer">Terms</span>
            <span className="hover:text-indigo-600 cursor-pointer">Privacy</span>
            <span className="hover:text-indigo-600 cursor-pointer">Support</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
