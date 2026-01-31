import { getHeroImageSettings } from '@/lib/actions/homepage-hero'

export default async function HomepageHeroImage() {
  const { url: heroImageUrl, altText } = await getHeroImageSettings()

  return (
    <div className="absolute inset-0 w-full h-full rounded-t-2xl overflow-hidden">
      {heroImageUrl ? (
        <>
          <div
            className="w-full h-full"
            role="img"
            aria-label={altText || "Hero Image"}
            style={{
              backgroundImage: `url('${heroImageUrl}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 2%'
            }}
          ></div>

          {/* 3D Chrome TRENDING Text Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <h2
              className="trending-text text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-wider"
              style={{
                fontFamily: "'Arial Black', 'Arial Bold', sans-serif",
                color: '#e8e8e8',
                textShadow: `
                  /* Main depth layers */
                  1px 1px 0 #333,
                  2px 2px 0 #2a2a2a,
                  3px 3px 0 #222,
                  4px 4px 0 #1a1a1a,
                  5px 5px 0 #111,
                  6px 6px 0 #0a0a0a,
                  7px 7px 0 #000,
                  
                  /* Chrome highlights */
                  -1px -1px 0 #fff,
                  -2px -2px 0 #f5f5f5,
                  
                  /* Inner glow for metallic effect */
                  0 0 10px rgba(255,255,255,0.3),
                  0 0 20px rgba(255,255,255,0.2),
                  
                  /* Bottom shadow for depth */
                  8px 8px 15px rgba(0,0,0,0.8),
                  10px 10px 30px rgba(0,0,0,0.6)
                `,
                WebkitTextStroke: '2px #bbb',
                filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.5))',
                letterSpacing: '0.15em'
              }}
            >
              TRENDING
            </h2>
          </div>
        </>
      ) : (
        <div className="w-full h-full bg-gray-100 animate-pulse"></div>
      )}
    </div>
  )
}