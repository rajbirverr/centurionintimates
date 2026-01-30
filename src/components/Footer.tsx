"use client"

import { useState, useEffect } from 'react'
import { getFooterData } from '@/lib/actions/footer'
import { addSubscriber } from '@/lib/actions/newsletter'
import Link from 'next/link'

// Calculate year at module level to avoid dynamic date issues
const CURRENT_YEAR = new Date().getFullYear()

const Footer = () => {
  const [email, setEmail] = useState('')
  const [footerData, setFooterData] = useState<any>(null)
  const [subscribing, setSubscribing] = useState(false)
  const [subscribeMessage, setSubscribeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    // Try to load footer data, but don't fail if database isn't set up
    const loadFooter = async () => {
      try {
        const data = await getFooterData()
        setFooterData(data)
      } catch (error) {
        // Silently fail - use hardcoded content
      }
    }
    loadFooter()
  }, [])

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubscribing(true)
    setSubscribeMessage(null)

    try {
      const result = await addSubscriber(email)
      if (result.success) {
        setSubscribeMessage({ type: 'success', text: 'Thank you for subscribing! Check your email for a welcome message.' })
        setEmail('')
      } else {
        setSubscribeMessage({ type: 'error', text: result.error || 'Failed to subscribe. Please try again.' })
      }
    } catch (error: any) {
      setSubscribeMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setSubscribing(false)
      // Clear message after 5 seconds
      setTimeout(() => setSubscribeMessage(null), 5000)
    }
  }

  // Use database data if available, otherwise use defaults
  const brandName = footerData?.settings?.brand_name || 'Intimate'
  const newsletterDescription = footerData?.settings?.newsletter_description || `Be the first to discover new drops, special offers, and all things ${brandName}`
  // Handle SMS enabled - could be boolean or string "true"/"false"
  const smsEnabledRaw = footerData?.settings?.sms_enabled
  const smsEnabled = smsEnabledRaw === true || smsEnabledRaw === 'true' || String(smsEnabledRaw).toLowerCase() === 'true'

  const smsText = footerData?.settings?.sms_text || `Text ${brandName.toUpperCase()} to 68805 to never miss a drop!`
  const smsNumber = footerData?.settings?.sms_number || '68805'
  const copyrightText = footerData?.settings?.copyright_text || 'All Rights Reserved.'
  const newsletterEnabled = footerData?.settings?.newsletter_enabled !== false

  // Default links - always use these as fallback
  const defaultHelpLinks = [
    { label: 'return policy', url: '#' },
    { label: 'start a return', url: '#' },
    { label: 'track order', url: '#' },
    { label: 'track return', url: '#' },
    { label: 'size guides', url: '#' },
    { label: 'bra calculator', url: '#' },
    { label: 'ordering', url: '#' },
    { label: 'shipping', url: '#' },
    { label: 'international', url: '#' },
    { label: 'faqs', url: '#' },
    { label: 'contact us', url: '#' },
    { label: 'product recall', url: '#' }
  ]

  const defaultMoreLinks = [
    { label: 'about', url: '#' },
    { label: 'influencers', url: '#' },
    { label: 'store finder', url: '#' },
    { label: 'environmental and social partnerships', url: '#' },
    { label: 'careers', url: '#' },
    { label: 'intimate tv', url: '#' },
    { label: 'blog', url: '#' }
  ]

  // Always use default links - database links are optional override
  let helpLinks = defaultHelpLinks
  let moreLinks = defaultMoreLinks

  // Only override defaults if database has valid links
  if (footerData?.sections && Array.isArray(footerData.sections) && footerData.sections.length > 0) {
    const helpSection = footerData.sections.find((s: any) => s.title && s.title.toUpperCase() === 'HELP')
    if (helpSection?.links && Array.isArray(helpSection.links) && helpSection.links.length > 0) {
      helpLinks = helpSection.links
        .filter((l: any) => l && l.label && l.url)
        .map((l: any) => ({ label: l.label, url: l.url }))
    }

    const moreSection = footerData.sections.find((s: any) => s.title && s.title.toUpperCase() === 'MORE')
    if (moreSection?.links && Array.isArray(moreSection.links) && moreSection.links.length > 0) {
      moreLinks = moreSection.links
        .filter((l: any) => l && l.label && l.url)
        .map((l: any) => ({ label: l.label, url: l.url }))
    }
  }

  // Ensure we always have links (fallback to defaults if somehow empty)
  if (!helpLinks || helpLinks.length === 0) {
    helpLinks = defaultHelpLinks
  }
  if (!moreLinks || moreLinks.length === 0) {
    moreLinks = defaultMoreLinks
  }

  // Get social media from database or use defaults
  const socialMediaLinks = footerData?.socialMedia?.filter((s: any) => s.is_enabled) || []

  return (
    <footer className="bg-[#f6f6f4] pt-16 pb-8 text-[#403b38] font-light">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-10 mb-16">
          {/* HELP column */}
          <div className="md:col-span-3 md:col-start-1 flex flex-col">
            <h2 className="text-base uppercase font-normal tracking-wider mb-6">HELP</h2>
            <nav className="flex flex-col space-y-3">
              {helpLinks.map((link, idx) => (
                <Link key={idx} href={link.url} className="text-sm hover:underline transition-all">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* STAY IN THE KNOW column */}
          {(newsletterEnabled || smsEnabled) && (
            <div className="md:col-span-6 md:col-start-4 flex flex-col">
              {newsletterEnabled && (
                <>
                  <h2 className="text-base uppercase font-normal tracking-wider mb-6 text-center">STAY IN THE KNOW</h2>
                  <p className="text-sm text-center mb-6">
                    {newsletterDescription}
                  </p>

                  <form onSubmit={handleSubscribe} className="mb-6">
                    <div className="flex mb-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your email"
                        className="flex-grow p-3 border border-[#cccbce] bg-white focus:outline-none text-sm"
                        required
                        disabled={subscribing}
                      />
                      <button
                        type="submit"
                        disabled={subscribing}
                        className="bg-[#2d2d2d] text-white p-3 transition-all hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Subscribe"
                      >
                        {subscribing ? (
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {subscribeMessage && (
                      <p className={`text-xs text-center mb-2 ${subscribeMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {subscribeMessage.text}
                      </p>
                    )}
                    <p className="text-xs text-center">
                      By submitting your email you agree to receive recurring automated marketing messages from {brandName}. View <Link href="#" className="underline hover:text-black transition-all">Terms</Link> & <Link href="#" className="underline hover:text-black transition-all">Privacy</Link>.
                    </p>
                  </form>
                </>
              )}

              {smsEnabled && (
                <div className={`text-center ${newsletterEnabled ? 'mb-8' : 'mb-6'}`}>
                  {!newsletterEnabled && (
                    <>
                      <h2 className="text-base uppercase font-normal tracking-wider mb-6 text-center">STAY IN THE KNOW</h2>
                    </>
                  )}
                  <div className="text-sm mb-2">{smsText}</div>
                  <p className="text-xs text-center">
                    By texting {brandName.toUpperCase()} to {smsNumber}, you agree to receive recurring automated promotional and personalized marketing text messages (e.g. cart reminders) from {brandName} at the cell number used when signing up. Consent is not a condition of any purchase. Reply HELP for help and STOP to cancel. Msg frequency varies. Msg & data rates may apply. View <Link href="#" className="underline hover:text-black transition-all">Terms</Link> & <Link href="#" className="underline hover:text-black transition-all">Privacy</Link>.
                  </p>
                </div>
              )}

              {socialMediaLinks.length > 0 ? (
                <div className="flex justify-center space-x-5 mt-auto">
                  {socialMediaLinks.map((social: any) => {
                    const platform = social.platform.toLowerCase()
                    return (
                      <a
                        key={social.id}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.platform}
                        className="text-[#403b38] hover:text-black transition-all"
                      >
                        {platform === 'instagram' && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.247-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.986.01-4.04.059-.976.045-1.505.207-1.858.344-.466.181-.8.398-1.15.748-.35.35-.566.683-.747 1.15-.137.353-.3.882-.344 1.857-.047 1.055-.059 1.37-.059 4.04 0 2.67.01 2.986.059 4.04.045.975.207 1.504.344 1.857.181.466.398.8.748 1.15.35.35.683.566 1.15.747.352.137.882.3 1.857.344 1.054.046 1.37.059 4.04.059 2.67 0 2.986-.01 4.04-.059.976-.045 1.505-.207 1.858-.344.466-.181.8-.398 1.15-.748.35-.35.566-.683.747-1.15.137-.352.3-.882.344-1.857.047-1.054.059-1.37.059-4.04 0-2.67-.01-2.986-.059-4.04-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 0 0-.748-1.15 3.098 3.098 0 0 0-1.15-.747c-.352-.137-.882-.3-1.857-.344-1.054-.047-1.37-.059-4.04-.059z" />
                            <path d="M12 6.865a5.135 5.135 0 1 0 0 10.27 5.135 5.135 0 0 0 0-10.27zm0 8.468a3.333 3.333 0 1 1 0-6.666 3.333 3.333 0 0 1 0 6.666zm6.538-8.671a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
                          </svg>
                        )}
                        {platform === 'facebook' && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                          </svg>
                        )}
                        {platform === 'twitter' && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                          </svg>
                        )}
                        {platform === 'youtube' && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                        )}
                        {platform === 'tiktok' && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                          </svg>
                        )}
                      </a>
                    )
                  })}
                </div>
              ) : (
                <div className="flex justify-center space-x-5 mt-auto">
                  <a href="#" aria-label="Instagram" className="text-[#403b38] hover:text-black transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.247-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.986.01-4.04.059-.976.045-1.505.207-1.858.344-.466.181-.8.398-1.15.748-.35.35-.566.683-.747 1.15-.137.353-.3.882-.344 1.857-.047 1.055-.059 1.37-.059 4.04 0 2.67.01 2.986.059 4.04.045.975.207 1.504.344 1.857.181.466.398.8.748 1.15.35.35.683.566 1.15.747.352.137.882.3 1.857.344 1.054.046 1.37.059 4.04.059 2.67 0 2.986-.01 4.04-.059.976-.045 1.505-.207 1.858-.344.466-.181.8-.398 1.15-.748.35-.35.566-.683.747-1.15.137-.352.3-.882.344-1.857.047-1.054.059-1.37.059-4.04 0-2.67-.01-2.986-.059-4.04-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 0 0-.748-1.15 3.098 3.098 0 0 0-1.15-.747c-.352-.137-.882-.3-1.857-.344-1.054-.047-1.37-.059-4.04-.059z" />
                      <path d="M12 6.865a5.135 5.135 0 1 0 0 10.27 5.135 5.135 0 0 0 0-10.27zm0 8.468a3.333 3.333 0 1 1 0-6.666 3.333 3.333 0 0 1 0 6.666zm6.538-8.671a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
                    </svg>
                  </a>
                  <a href="#" aria-label="Facebook" className="text-[#403b38] hover:text-black transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </a>
                  <a href="#" aria-label="Twitter" className="text-[#403b38] hover:text-black transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a href="#" aria-label="YouTube" className="text-[#403b38] hover:text-black transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                  <a href="#" aria-label="TikTok" className="text-[#403b38] hover:text-black transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* MORE column */}
          <div className="md:col-span-3 md:col-start-10 flex flex-col">
            <h2 className="text-base uppercase font-normal tracking-wider mb-6 text-right">MORE</h2>
            <nav className="flex flex-col space-y-3 items-end">
              {moreLinks.map((link, idx) => (
                <Link key={idx} href={link.url} className="text-sm hover:underline transition-all">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="border-t border-[#cccbce] pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-xs mb-4 md:mb-0">&copy; {CURRENT_YEAR} {brandName}. {copyrightText}</div>
          <div className="flex space-x-4 text-xs">
            <Link href="#" className="hover:underline transition-all">Accessibility</Link>
            <Link href="#" className="hover:underline transition-all">Terms of Service</Link>
            <Link href="#" className="hover:underline transition-all">Privacy Policy</Link>
            <Link href="#" className="hover:underline transition-all">CCPA</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
