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

          {/* Smooth 3D Bevel TRENDING Text - SACHEU Style */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {/* Main text with gradient face and smooth bevel */}
              <h2
                className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase"
                style={{
                  fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif",
                  fontWeight: '900',
                  letterSpacing: '0.05em',
                  color: 'transparent',
                  background: 'linear-gradient(180deg, #ffffff 0%, #e0e0e0 50%, #d0d0d0 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextStroke: '3px #000000',
                  textShadow: `
                    -1px -1px 1px rgba(255, 255, 255, 0.8),
                    1px 1px 1px rgba(0, 0, 0, 0.8),
                    2px 2px 2px rgba(0, 0, 0, 0.6),
                    3px 3px 3px rgba(0, 0, 0, 0.4),
                    4px 4px 4px rgba(0, 0, 0, 0.3),
                    6px 6px 10px rgba(0, 0, 0, 0.5),
                    8px 8px 20px rgba(0, 0, 0, 0.3)
                  `,
                  filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.4))',
                  margin: 0,
                  padding: 0,
                  lineHeight: 1
                }}
              >
                TRENDING
              </h2>

              {/* Inner highlight layer for extra shine */}
              <h2
                aria-hidden="true"
                className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif",
                  fontWeight: '900',
                  letterSpacing: '0.05em',
                  color: 'transparent',
                  background: 'linear-gradient(170deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 50%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextStroke: '0px transparent',
                  pointerEvents: 'none',
                  margin: 0,
                  padding: 0,
                  lineHeight: 1
                }}
              >
                TRENDING
              </h2>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full h-full bg-gray-100 animate-pulse"></div>
      )}
    </div>
  )
}