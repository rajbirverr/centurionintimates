'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin')
    router.refresh()
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/categories', label: 'Categories' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/filter-settings', label: 'Filter Settings' },
    { href: '/admin/footer', label: 'Footer' },
    { href: '/admin/blogs', label: 'Blogs' },
    { href: '/admin/returns', label: 'Returns' },
    { href: '/admin/homepagesets', label: 'Homepage Sets' },
    { href: '/admin/newsletter', label: 'Newsletter' },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 text-gray-900"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
        <div className="flex flex-col h-full p-6">
          <div className="mb-12">
            <h1 className="text-2xl font-normal text-gray-900 tracking-tight">Centurion Admin</h1>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <label
                  key={item.href}
                  className="flex items-center cursor-pointer group"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <input
                    type="radio"
                    name="nav"
                    checked={isActive}
                    readOnly
                    className="sr-only"
                  />
                  <div className={`w-2 h-2 rounded-full mr-4 transition-colors ${isActive ? 'bg-green-600' : 'border border-gray-300 group-hover:border-gray-400'
                    }`} />
                  <Link
                    href={item.href}
                    className={`text-sm tracking-wide uppercase transition-colors ${isActive
                      ? 'text-gray-900 font-normal'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    {item.label}
                  </Link>
                </label>
              )
            })}
          </nav>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-6">
              Need help? <a href="#" className="underline">Contact us</a>.
            </p>
            <button
              onClick={handleLogout}
              type="button"
              className="w-full py-3 px-4 border border-gray-900 text-xs uppercase tracking-wide text-gray-900 hover:bg-gray-50 transition-colors"
            >
              LOG OUT
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

