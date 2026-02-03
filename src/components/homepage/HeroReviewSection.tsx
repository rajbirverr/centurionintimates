'use client';

import { useState, useEffect } from 'react';
import StylizedTitle from '@/components/common/StylizedTitle';

export default function HeroReviewSection() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentReview, setCurrentReview] = useState(0);
    const [fade, setFade] = useState(true);

    const reviews = [
        {
            text: "Finally found a brand that understands luxury and comfort. The aesthetics are unmatched.",
            author: "Jessica K.",
            verified: true
        },
        {
            text: "The fit is absolutely divine. I've never felt more confident and comfortable.",
            author: "Sophie L.",
            verified: true
        },
        {
            text: "Bravo! I am totally blown away by the quality of the products.",
            author: "Alexandra M.",
            verified: true
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setCurrentReview((prev) => (prev + 1) % reviews.length);
                setFade(true);
            }, 300);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative w-full -mt-4">
            <div className="py-10 md:py-12">

                {/* Rhode-Style Clean Card */}
                <div className="bg-[#FAF9F7] rounded-2xl p-8 md:p-10">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
                        <div className="text-left">
                            <StylizedTitle
                                text="What customers say"
                                className="text-[#583432] text-xl md:text-3xl font-black italic tracking-wider mb-1"
                                style={{ fontFamily: 'var(--font-montserrat)' }}
                            />
                            <p
                                className="text-[#8B7355] text-sm md:text-base font-bold tracking-wide"
                                style={{ fontFamily: 'var(--font-manrope)' }}
                            >
                                About Our Offline Store
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg key={star} className="w-3.5 h-3.5 text-[#5C4D3C]" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                    </div>

                    {/* Quote */}
                    <div className={`transition-all duration-400 ${fade ? 'opacity-100' : 'opacity-0'}`}>
                        <p className="text-[#3D3229] text-lg md:text-xl leading-relaxed mb-4 font-light" style={{ fontFamily: 'var(--font-manrope)' }}>
                            "{reviews[currentReview].text}"
                        </p>

                        <div className="flex items-center gap-2">
                            <span className="text-[#5C4D3C] text-sm font-medium" style={{ fontFamily: 'var(--font-manrope)' }}>
                                {reviews[currentReview].author}
                            </span>
                            {reviews[currentReview].verified && (
                                <span className="text-[#8B7355] text-[10px] uppercase tracking-wider" style={{ fontFamily: 'var(--font-manrope)' }}>
                                    Verified
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Navigation Dots */}
                    <div className="flex items-center gap-2 mt-6">
                        {reviews.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentReview(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${currentReview === index
                                    ? 'bg-[#5C4D3C]'
                                    : 'bg-[#D4CFC8] hover:bg-[#B8B0A5]'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="h-[1px] bg-[#E8E4DE] my-6" />

                    {/* Share Section */}
                    <div className="flex items-center justify-between">
                        <span className="text-[#8B7355] text-[11px] uppercase tracking-[0.15em]" style={{ fontFamily: 'var(--font-manrope)' }}>
                            Share your experience
                        </span>
                        <button
                            onClick={() => setIsFormOpen(!isFormOpen)}
                            className="text-[#5C4D3C] text-[11px] uppercase tracking-[0.15em] font-medium hover:text-[#3D3229] transition-colors flex items-center gap-2"
                            style={{ fontFamily: 'var(--font-manrope)' }}
                        >
                            {isFormOpen ? 'Close' : 'Write a review'}
                            <svg
                                className={`w-3 h-3 transition-transform duration-300 ${isFormOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>

                    {/* Form Expansion */}
                    <div className={`transition-all duration-500 overflow-hidden ${isFormOpen ? 'max-h-[400px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
                        <form className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[#8B7355] text-[10px] uppercase tracking-[0.15em] mb-2" style={{ fontFamily: 'var(--font-manrope)' }}>Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white border border-[#E8E4DE] rounded-lg px-4 py-2.5 text-sm text-[#3D3229] placeholder-[#B8B0A5] focus:outline-none focus:border-[#5C4D3C] transition-colors"
                                        placeholder="Your name"
                                        style={{ fontFamily: 'var(--font-manrope)' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[#8B7355] text-[10px] uppercase tracking-[0.15em] mb-2" style={{ fontFamily: 'var(--font-manrope)' }}>Email</label>
                                    <input
                                        type="email"
                                        className="w-full bg-white border border-[#E8E4DE] rounded-lg px-4 py-2.5 text-sm text-[#3D3229] placeholder-[#B8B0A5] focus:outline-none focus:border-[#5C4D3C] transition-colors"
                                        placeholder="your@email.com"
                                        style={{ fontFamily: 'var(--font-manrope)' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[#8B7355] text-[10px] uppercase tracking-[0.15em] mb-2" style={{ fontFamily: 'var(--font-manrope)' }}>Review</label>
                                <textarea
                                    rows={3}
                                    className="w-full bg-white border border-[#E8E4DE] rounded-lg px-4 py-2.5 text-sm text-[#3D3229] placeholder-[#B8B0A5] focus:outline-none focus:border-[#5C4D3C] transition-colors resize-none"
                                    placeholder="Share your experience..."
                                    style={{ fontFamily: 'var(--font-manrope)' }}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-full py-3 text-[11px] uppercase tracking-[0.15em] font-medium transition-all duration-300 border-2 border-[#8B7355] text-[#8B7355] bg-white/10 backdrop-blur-sm hover:bg-[#8B7355] hover:text-white"
                                style={{ fontFamily: 'var(--font-manrope)' }}
                            >
                                Submit Review
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
