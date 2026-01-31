import { Suspense } from 'react'
import HomepageHeroImage from './HomepageHeroImage'

/**
 * Hero section - renders immediately without waiting for data
 * This is the first thing users see, so it should load instantly
 */
export default function HomepageHero() {
  return (
    <section className="mb-16 px-4 md:px-8 lg:px-12 relative" aria-label="Hero Section">
      <div className="max-w-[1440px] mx-auto">
        {/* Full-width image container */}
        <div className="w-full relative" style={{ height: '450px' }}>
          {/* Background image - streams in with Suspense */}
          <Suspense fallback={<div className="absolute inset-0 w-full h-full rounded-t-2xl overflow-hidden bg-gray-100 animate-pulse"></div>}>
            <HomepageHeroImage />
          </Suspense>

          {/* Shop Now Button with Liquid Glass Effect */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10">
            <a
              href="/shop"
              className="group relative inline-block"
            >
              {/* Liquid glass button */}
              <div className="relative overflow-hidden rounded-full px-8 py-4 sm:px-10 sm:py-5 transition-all duration-500 hover:scale-105"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: `
                    0 8px 32px rgba(31, 38, 135, 0.37),
                    inset 0 2px 8px rgba(255, 255, 255, 0.4),
                    inset 0 -2px 8px rgba(0, 0, 0, 0.1)
                  `,
                }}
              >
                {/* Shine/glossy effect overlay */}
                <div
                  className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, transparent 50%, rgba(255, 255, 255, 0.3) 100%)',
                    animation: 'liquidShimmer 3s ease-in-out infinite'
                  }}
                />

                {/* Button text */}
                <span
                  className="relative text-white text-xl sm:text-2xl md:text-3xl font-semibold tracking-wide uppercase drop-shadow-lg"
                  style={{
                    fontFamily: "'Rhode', sans-serif",
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  Shop Now
                </span>
              </div>
            </a>
          </div>
        </div>
        {/* Cream Rectangle Container - Text Content */}
        <div className="w-full mb-6 rounded-b-2xl px-4 py-6 md:py-8" style={{
          backgroundColor: '#d4cdc3',
          backgroundImage: 'url(/intimate-bg-lace.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <h2 className="uppercase text-[#5a4c46] tracking-[0.2em] text-xs font-light mb-3 text-center">
            WHAT WE&apos;RE ALL ABOUT
          </h2>

          {/* Credits container */}
          <div className="credits-container-compact relative">
            <div className="brand-logo text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider w-full text-center"
                style={{
                  fontFamily: "'Rhode', sans-serif",
                  textAlign: "center",
                  color: '#8B5A3C'
                }}>
                INTIMATE
              </h1>
              <div className="w-24 h-0.5 bg-[#784D2C] my-2 mx-auto"></div>
            </div>

            <div className="credits-content">
              <div className="text-center py-3">
                <p className="text-[#5a4c46] text-base md:text-lg lg:text-xl font-normal tracking-wide leading-relaxed max-w-[900px] mx-auto">
                  Intimate makes apparel that&apos;s playful, pretty, and totally extra — for days when you wanna shine like you mean it (and nights when you really do)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}