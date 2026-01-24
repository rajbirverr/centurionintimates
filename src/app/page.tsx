import Link from 'next/link';
import ProductGrid from '@/components/ProductGrid';
import CategoryCarousel from '@/components/CategoryCarousel';
import HomepageSetsSection from '@/components/homepage/HomepageSetsSection';
import ShineCarousel from '@/components/homepage/ShineCarousel';
import VisitShopButton from '@/components/homepage/VisitShopButton';
import { getHomepageData } from '@/lib/actions/homepage';
import { getHomepageSetsData } from '@/lib/actions/homepage-sets';


export const metadata = {
  title: 'CENTURION - Luxury Jewelry & Shine',
  description: 'Centurion makes jewelry that\'s playful, pretty, and totally extra — for days when you wanna shine like you mean it.',
};

export default async function HomePage() {
  // Fetch all data in parallel on the server
  const [homepageData, homepageSetsData] = await Promise.all([
    getHomepageData(),
    getHomepageSetsData()
  ]);

  const {
    heroImageUrl,
    showcaseCardImageUrl,
    shineCarouselProducts,
    dripCarouselProducts,
    categoryCarouselItems
  } = homepageData;

  return (
    <main className="App">
      {/* Main home page content */}
      {/* Brand Statement Section with image and scrolling credits */}
      <section className="mb-4 px-4 md:px-8 lg:px-12 relative" aria-label="Hero Section">
        <div className="max-w-[1440px] mx-auto">
          {/* Full-width image container - reduced height to fit viewport with scrolling text */}
          <div className="w-full mb-4 relative" style={{ height: '450px' }}>
            {/* Background image */}
            <div className="absolute inset-0 w-full h-full rounded-lg overflow-hidden">
              {heroImageUrl ? (
                <div className="w-full h-full" style={{
                  backgroundImage: `url('${heroImageUrl}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center 2%'
                }}></div>
              ) : (
                <div className="w-full h-full bg-gray-100 animate-pulse"></div>
              )}
            </div>

            {/* Fixed "Sparkle & Shine" text on image with sparkle effects only */}
            <div className="absolute top-[8%] left-[5%] z-20">
              <h3 className="sparkle-text text-[#784D2C] text-base sm:text-lg md:text-xl lg:text-2xl font-normal drop-shadow-md"
                style={{
                  fontFamily: "'Rhode', sans-serif",
                  letterSpacing: '0.01em',
                  textShadow: '0 0 3px white',
                  position: 'relative',
                  display: 'inline-block'
                }}>
                Sparkle & Shine

                {/* Sparkle particles */}
                <span className="sparkle-particle" style={{ top: '20%', left: '10%', animationDelay: '0s' }}></span>
                <span className="sparkle-particle" style={{ top: '30%', left: '80%', animationDelay: '0.3s' }}></span>
                <span className="sparkle-particle" style={{ top: '70%', left: '30%', animationDelay: '0.6s' }}></span>
                <span className="sparkle-particle" style={{ top: '60%', left: '70%', animationDelay: '0.9s' }}></span>
                <span className="sparkle-particle" style={{ top: '10%', left: '40%', animationDelay: '1.2s' }}></span>
                <span className="sparkle-particle" style={{ top: '80%', left: '60%', animationDelay: '1.5s' }}></span>
              </h3>
            </div>
          </div>

          {/* Scrolling text section below the image */}
          <div className="w-full mb-6">
            <h2 className="uppercase text-[#5a4c46] tracking-[0.2em] text-xs font-light mb-1 text-center">
              WHAT WE&apos;RE ALL ABOUT
            </h2>

            {/* Credits container with mask for fade out effect - reduced height */}
            <div className="credits-container-compact relative">
              {/* Brand logo that toggles visibility */}
              <div className="brand-logo text-center">
                <h1 className="text-[#5a4c46] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider w-full text-center"
                  style={{
                    fontFamily: "'Rhode', sans-serif",
                    textAlign: "center"
                  }}>
                  CENTURION
                </h1>
                <div className="w-24 h-0.5 bg-[#784D2C] my-1 mx-auto"></div>
              </div>

              {/* Scrolling credits content */}
              <div className="credits-content">
                <div className="py-4 text-center">
                  <p className="text-[#5a4c46] text-lg md:text-xl lg:text-2xl font-medium tracking-wide leading-relaxed max-w-[950px] mx-auto">
                    Centurion makes jewelry that&apos;s playful, pretty, and totally extra — for days when you wanna shine like you mean it (and nights when you really do)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jewelry Showcase Grid - Two cards side by side */}
      <section className="mb-16 px-4 md:px-8 lg:px-12" aria-label="Featured Collections">
        <div className="max-w-[1440px] mx-auto">
          {/* Section Title */}
          <div className="text-center mb-10">
            <h2 className="uppercase text-[#5a4c46] tracking-[0.2em] text-xs font-light mb-2">FEATURED COLLECTIONS</h2>
            <h3 className="text-[#784D2C] text-xl font-normal" style={{ fontFamily: "'Rhode', sans-serif", letterSpacing: '0.01em' }}>Our Exclusive Designs</h3>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Jewelry Card */}
            <div className="relative overflow-hidden rounded-3xl bg-black group cursor-pointer shadow-lg">
              <div className="aspect-[4/5] relative">
                {showcaseCardImageUrl ? (
                  <>
                    <img
                      src={showcaseCardImageUrl}
                      alt="Luxury jewelry"
                      className="absolute inset-0 w-full h-full object-cover object-center"
                      style={{ objectPosition: "center 10%" }}
                    />
                    
                    {/* Dark gradient overlay at bottom for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none"></div>

                    {/* Text overlay - bottom left corner */}
                    <div className="absolute bottom-0 left-0 p-6 sm:p-8 z-10 pointer-events-none">
                      {/* Large bold title */}
                      <h3 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold mb-2 leading-tight" style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
                        fontWeight: '700',
                        letterSpacing: '-0.02em'
                      }}>
                        The<br />
                        <span style={{ fontWeight: '700' }}>Jewelry</span>
                      </h3>
                      {/* Smaller subtitle */}
                      <p className="text-white text-sm sm:text-base font-normal mb-4" style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
                        fontWeight: '400',
                        letterSpacing: '0.01em'
                      }}>
                        Collection
                      </p>
                      {/* Visit shop button - always visible */}
                      <VisitShopButton />
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-gray-200 animate-pulse"></div>
                )}
              </div>
            </div>

            {/* Second Jewelry Card with Shine Carousel */}
            <div className="relative overflow-hidden rounded-3xl bg-black group shadow-lg">
              <div className="aspect-[4/5] relative">
                {/* Shine Carousel - fills entire card */}
                <ShineCarousel products={shineCarouselProducts} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid / Drip Carousel Section */}
      <ProductGrid products={dripCarouselProducts} />

      {/* Homepage Sets Section */}
      <HomepageSetsSection initialData={homepageSetsData} />

      {/* Category Carousel Section */}
      <CategoryCarousel categories={categoryCarouselItems} />

    </main>
  );
}
