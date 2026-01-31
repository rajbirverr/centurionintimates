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

          {/* Shop Your Style text overlay - left corner */}
          <div className="absolute top-8 left-8 z-10">
            <h2
              className="text-white text-3xl sm:text-4xl md:text-5xl font-normal tracking-wide drop-shadow-lg"
              style={{
                fontFamily: "'Rhode', sans-serif",
                textShadow: '2px 2px 8px rgba(0,0,0,0.5)'
              }}
            >
              Shop Your Style
            </h2>
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