'use client';

import { useState, useEffect } from 'react';
import { PinkButton } from '@/components/ui/PinkButton';

export default function HeroReviewSection() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentReview, setCurrentReview] = useState(0);
    const [fade, setFade] = useState(true);

    const reviews = [
        {
            text: "Bravo I've just washed and blow dried my hair. I am totally blown away by the quality of the products.",
            author: "ALEXANDRA MIRO"
        },
        {
            text: "The fit is absolutely divine. I've never felt more confident and comfortable in lingerie before.",
            author: "SOPHIE L."
        },
        {
            text: "Finally found a brand that understands luxury and comfort. The aesthetics are unmatched.",
            author: "JESSICA K."
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setCurrentReview((prev) => (prev + 1) % reviews.length);
                setFade(true);
            }, 500); // Wait for fade out
        }, 5000); // Change every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full bg-[#E3C4BE] rounded-b-2xl px-6 py-8 md:py-10 -mt-1 relative z-10 shadow-sm transition-all duration-300">
            <div className="max-w-4xl mx-auto text-center space-y-6">

                {/* Review Quote Carousel */}
                <div className={`space-y-4 transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
                    <p className="text-[#4A3728] text-lg md:text-xl font-serif italic leading-relaxed">
                        "{reviews[currentReview].text}"
                    </p>
                    <p className="text-[#6D4C41] text-sm font-bold tracking-widest uppercase">
                        {reviews[currentReview].author}
                    </p>
                </div>

                {/* Modern Interaction Trigger */}
                <div className="pt-8 pb-2">
                    <button
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className="group flex items-center justify-center mx-auto space-x-2 text-[#4A3728] hover:text-[#2C1810] transition-colors duration-300 focus:outline-none"
                    >
                        <span className="text-xs font-bold tracking-[0.2em] uppercase border-b border-transparent group-hover:border-[#4A3728] transition-all duration-300 pb-0.5">
                            {isFormOpen ? 'Close Review Form' : 'Share Your Experience'}
                        </span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-4 w-4 transition-transform duration-500 ease-in-out ${isFormOpen ? 'rotate-180' : 'rotate-0'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Elegant Reveal Dropdown */}
                    <div className={`overflow-hidden transition-all duration-700 ease-in-out ${isFormOpen ? 'max-h-[800px] opacity-100 mt-8' : 'max-h-0 opacity-0 mt-0'}`}>
                        <form className="max-w-xl mx-auto bg-white/40 backdrop-blur-md p-8 rounded-2xl shadow-sm border border-white/50 space-y-6">
                            <div className="text-center mb-2">
                                <h3 className="text-[#5a4c46] font-serif text-lg italic">Tell us your story</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-bold text-[#8B5A3C] uppercase tracking-widest">Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-0 py-2 bg-transparent border-b border-[#8B5A3C]/30 focus:border-[#8B5A3C] focus:outline-none text-[#5a4c46] placeholder-[#5a4c46]/40 transition-colors"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-bold text-[#8B5A3C] uppercase tracking-widest">Email (Private)</label>
                                    <input
                                        type="email"
                                        className="w-full px-0 py-2 bg-transparent border-b border-[#8B5A3C]/30 focus:border-[#8B5A3C] focus:outline-none text-[#5a4c46] placeholder-[#5a4c46]/40 transition-colors"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-bold text-[#8B5A3C] uppercase tracking-widest">Your Review</label>
                                <textarea
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-lg bg-white/50 border border-transparent focus:bg-white focus:shadow-sm focus:outline-none text-[#5a4c46] placeholder-[#5a4c46]/40 resize-none transition-all duration-300"
                                    placeholder="How did the products make you feel?"
                                />
                            </div>

                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-bold text-[#8B5A3C] uppercase tracking-widest">Photo (Optional)</label>
                                <div className="relative group cursor-pointer">
                                    <div className="flex items-center justify-center border border-dashed border-[#8B5A3C]/30 rounded-lg p-6 hover:bg-white/40 transition-all duration-300 group-hover:border-[#8B5A3C]/60">
                                        <div className="text-center space-y-2">
                                            <svg className="w-6 h-6 mx-auto text-[#8B5A3C]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            <span className="text-xs text-[#8B5A3C]/70 block">Drop image here or click to upload</span>
                                        </div>
                                    </div>
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                                </div>
                            </div>

                            <div className="pt-4">
                                <PinkButton type="submit" className="w-full md:w-auto min-w-[200px]">
                                    SUBMIT REVIEW
                                </PinkButton>
                            </div>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}
