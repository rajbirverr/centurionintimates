import React from 'react';

export const metadata = {
  title: 'About Us - Intimate',
  description: 'Learn about Intimate\'s journey and mission to empower women through beautiful intimate apparel.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          {/* Main Quote */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#5a4c46] uppercase tracking-wide mb-8">
              ELEVATING WOMEN, EMPOWERING BEAUTY
            </h1>
          </div>

          {/* Brand Story */}
          <div className="text-center space-y-6">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-light text-[#5a4c46] mb-4" style={{ fontFamily: "'Rhode', sans-serif" }}>
                Our Journey
              </h2>
              <p className="text-base md:text-lg text-[#84756f] leading-relaxed max-w-3xl mx-auto">
                Intimate was born in 1999 in the vibrant city of Visakhapatnam, founded by our visionary leader, <span className="font-medium text-[#5a4c46]">Gurvinder Verma</span>. What began as a dream to create beautiful intimate apparel has evolved into a movement dedicated to empowering women.
              </p>
            </div>

            <div className="mb-8">
              <p className="text-base md:text-lg text-[#84756f] leading-relaxed max-w-3xl mx-auto">
                For over two decades, Gurvinder Verma has been at the helm, shaping Intimate with a singular vision: to empower women through our work, our culture, and our craft. Our mission is brought to life through a powerful chain of working women who travel across regions, carefully selecting and curating each piece with passion and expertise.
              </p>
            </div>

            <div className="mb-8">
              <p className="text-base md:text-lg text-[#84756f] leading-relaxed max-w-3xl mx-auto">
                Our working culture is built on the foundation of empowerment, where every woman in our team—from those who travel and select pieces to those who curate our collections—is valued, supported, and encouraged to shine. We believe that when women are empowered, they create beauty that transcends jewelry—they create change.
              </p>
            </div>

            <div className="pt-6 border-t border-[#e5e2e0]">
              <p className="text-sm md:text-base text-[#5a4c46] italic font-light">
                "Empowering women isn't just our goal—it's our legacy, our culture, and our commitment to the future."
              </p>
              <p className="text-xs md:text-sm text-[#84756f] mt-2">— Gurvinder Verma, Founder & Owner</p>
            </div>
          </div>

          {/* Impact Statistic */}
          <div className="mt-12 pt-8 border-t border-[#e5e2e0] text-center">
            <div className="inline-block">
              <p className="text-5xl md:text-6xl font-bold text-[#5a4c46] mb-2">4+</p>
              <p className="text-base md:text-lg text-[#84756f] uppercase tracking-wide">Members in Empowering Women</p>
              <p className="text-sm text-[#84756f] mt-1 italic">and counting</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
