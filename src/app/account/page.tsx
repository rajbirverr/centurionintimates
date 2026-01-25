'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import AccountSidebar from '@/components/account/AccountSidebar'
import ProfileSection from '@/components/account/ProfileSection'
import AddressSection from '@/components/account/AddressSection'
import OrdersSection from '@/components/account/OrdersSection'
import WishlistSection from '@/components/account/WishlistSection'
import { getUserProfile, type UserProfile } from '@/lib/actions/profile'

type Tab = 'overview' | 'addresses' | 'orders' | 'wishlist'

function AccountPageContent() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
    // Check URL for tab parameter
    const tab = searchParams.get('tab') as Tab
    if (tab && ['overview', 'addresses', 'orders', 'wishlist'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const loadProfile = async () => {
    try {
      const result = await getUserProfile()
      if (result.success && result.profile) {
        setProfile(result.profile)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get user's first name for personalized greeting
  const firstName = profile?.first_name || ''

  // Get heading text based on active tab
  const getHeading = () => {
    switch (activeTab) {
      case 'overview':
        return `Your account${firstName ? `, ${firstName}` : ''}`
      case 'orders':
        return `Your orders${firstName ? `, ${firstName}` : ''}`
      case 'addresses':
        return `Your addresses${firstName ? `, ${firstName}` : ''}`
      case 'wishlist':
        return `Your wishlist${firstName ? `, ${firstName}` : ''}`
      default:
        return `Your account${firstName ? `, ${firstName}` : ''}`
    }
  }

  return (
    <div className="min-h-screen bg-white auth-page">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-12">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Left Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <AccountSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">
            {/* Heading */}
            <h1 className="text-2xl md:text-3xl font-normal text-[#5a4c46] mb-6">
              {getHeading()}
            </h1>

            {/* Divider */}
            <hr className="border-0 border-b border-[#e5e2e0] mb-8" />

            {/* Tab Content */}
            <div>
              {activeTab === 'overview' && <ProfileSection />}
              {activeTab === 'addresses' && <AddressSection />}
              {activeTab === 'orders' && <OrdersSection />}
              {activeTab === 'wishlist' && <WishlistSection />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white auth-page flex items-center justify-center">
        <div className="text-[#84756f]">Loading...</div>
      </div>
    }>
      <AccountPageContent />
    </Suspense>
  )
}

