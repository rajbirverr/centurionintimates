'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface AccountSidebarProps {
  activeTab: 'overview' | 'orders' | 'addresses' | 'wishlist'
  onTabChange: (tab: 'overview' | 'orders' | 'addresses' | 'wishlist') => void
}

export default function AccountSidebar({ activeTab, onTabChange }: AccountSidebarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    window.location.href = '/login'
  }

  return (
    <div className="w-full md:w-64 pr-8 pb-8">
      <nav className="space-y-1">
        <label className="flex items-center cursor-pointer py-2">
          <input
            type="radio"
            name="account-nav"
            checked={activeTab === 'overview'}
            onChange={() => onTabChange('overview')}
            className="mr-3 w-4 h-4 text-[#4a5568] focus:ring-[#4a5568] focus:ring-2"
          />
          <span className="text-[#5a4c46] text-sm">Account overview</span>
        </label>

        <label className="flex items-center cursor-pointer py-2">
          <input
            type="radio"
            name="account-nav"
            checked={activeTab === 'orders'}
            onChange={() => onTabChange('orders')}
            className="mr-3 w-4 h-4 text-[#4a5568] focus:ring-[#4a5568] focus:ring-2"
          />
          <span className="text-[#5a4c46] text-sm">Orders</span>
        </label>

        <label className="flex items-center cursor-pointer py-2">
          <input
            type="radio"
            name="account-nav"
            checked={activeTab === 'addresses'}
            onChange={() => onTabChange('addresses')}
            className="mr-3 w-4 h-4 text-[#4a5568] focus:ring-[#4a5568] focus:ring-2"
          />
          <span className="text-[#5a4c46] text-sm">Addresses</span>
        </label>

        <label className="flex items-center cursor-pointer py-2">
          <input
            type="radio"
            name="account-nav"
            checked={activeTab === 'wishlist'}
            onChange={() => onTabChange('wishlist')}
            className="mr-3 w-4 h-4 text-[#4a5568] focus:ring-[#4a5568] focus:ring-2"
          />
          <span className="text-[#5a4c46] text-sm">Wishlist</span>
        </label>
      </nav>

      <div className="mt-8 pt-8 border-t border-[#e5e2e0]">
        <p className="text-sm text-[#5a4c46] mb-6">
          Need help? <a href="#" className="underline">Contact us.</a>
        </p>
        <button
          onClick={handleLogout}
          className="w-full text-left text-sm text-[#5a4c46] border border-[#e5e2e0] px-4 py-2 hover:bg-[#f5f5f5] transition-colors uppercase tracking-wider"
        >
          LOG OUT
        </button>
      </div>
    </div>
  )
}

