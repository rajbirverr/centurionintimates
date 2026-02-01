import { getHeroImageSettings } from '@/lib/actions/homepage-hero'

export default async function HomepageHeroImage() {
  const { url: heroImageUrl, altText } = await getHeroImageSettings()

  return (
    <div className="w-full rounded-t-2xl overflow-hidden">
      {heroImageUrl ? (
        <img
          src={heroImageUrl}
          alt={altText || "Hero Image"}
          className="w-full h-auto object-contain"
          style={{ display: 'block' }}
        />
      ) : (
        <div className="w-full h-[450px] bg-gray-100 animate-pulse"></div>
      )}
    </div>
  )
}