'use client';

import { useState, useEffect } from 'react';
import { PinkButton } from '@/components/ui/PinkButton';

export default function HeroReviewSection() {
    // Force refresh
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
        <div className="w-full bg-[#E3C4BE] rounded-b-2xl border-t border-black/10 -mt-2 relative z-10 shadow-sm transition-all duration-300 overflow-hidden">
            {/* High Fashion "Ticker" Grid Layout */}
            <div className="flex flex-col md:flex-row items-stretch min-h-[80px] md:h-[90px]">

                {/* Left: The Review (Editorial Voice) */}
                <div className="flex-1 px-6 md:px-10 flex flex-col justify-center border-b md:border-b-0 md:border-r border-black/10 py-6 md:py-0 relative group cursor-default">
                    <div className={`transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <div className="flex items-baseline gap-3 mb-1">
                            <span className="font-['Rhode'] text-[10px] uppercase tracking-[0.2em] text-black/40 pt-1">Review</span>
                            <p className="font-serif italic text-xl md:text-2xl text-black leading-none">
                                "{reviews[currentReview].text}"
                            </p>
                        </div>
                        <p className="font-sans text-[10px] font-bold tracking-[0.2em] text-black/60 uppercase pl-[60px]">
                            — {reviews[currentReview].author}
                        </p>
                    </div>
                    {/* Subtle Progress Bar */}
                    <div className="absolute bottom-0 left-0 h-[2px] bg-black/5 w-full">
                        <div
                            key={currentReview}
                            className="h-full bg-black/20 w-full origin-left animate-[shimmer_5s_linear]"
                        />
                    </div>
                </div>

                {/* Right: The Interaction (Technical Action) */}
                <div className="w-full md:w-[280px] flex items-center justify-center p-4 bg-[#E3C4BE] md:bg-black/5 hover:bg-white/20 transition-colors duration-300">
                    <button
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className="group relative w-full h-full min-h-[50px] flex items-center justify-between px-6 border border-black/10 rounded-xl hover:border-black transition-all duration-300"
                    >
                        <div className="flex flex-col items-start text-left">
                            <span className="font-['Rhode'] text-[14px] text-black tracking-wide leading-none mb-1 group-hover:translate-x-1 transition-transform duration-300">
                                {isFormOpen ? 'CLOSE' : 'SHARE YOURS'}
                            </span>
                            <span className="font-sans text-[9px] text-black/50 uppercase tracking-widest group-hover:text-black/70 transition-colors">
                                Join the list
                            </span>
                        </div>
                        <div className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-black group-hover:text-[#E3C4BE] transition-all duration-300">
                            {/* "Plus" or "Close" Icon */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`w-4 h-4 transition-transform duration-500 ${isFormOpen ? 'rotate-45' : 'rotate-0'}`}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            >
                                <path d="M12 5V19M5 12H19" />
                            </svg>
                        </div>
                    </button>
                </div>
            </div>

            {/* Elegant Reveal Dropdown */}
            <div className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${isFormOpen ? 'max-h-[800px] border-t border-black/10' : 'max-h-0 border-t-0'}`}>
                <div className="bg-[#E3C4BE]/50 p-8 md:p-12">
                    <form className="max-w-xl mx-auto space-y-8">
                        {/* Title */}
                        <div className="text-center space-y-2">
                            <h3 className="font-['Rhode'] text-2xl text-black">Make your mark</h3>
                            <p className="font-serif italic text-black/60">Tell us how it feels.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="group relative">
                                <input type="text" placeholder=" " className="peer w-full bg-transparent border-b border-black/20 py-2 text-black focus:outline-none focus:border-black transition-colors" />
                                <label className="absolute left-0 top-2 text-[10px] font-['Rhode'] uppercase tracking-widest text-black/50 pointer-events-none transition-all duration-300 peer-focus:-top-4 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-black">
                                    Name
                                </label>
                            </div>
                            <div className="group relative">
                                <input type="email" placeholder=" " className="peer w-full bg-transparent border-b border-black/20 py-2 text-black focus:outline-none focus:border-black transition-colors" />
                                <label className="absolute left-0 top-2 text-[10px] font-['Rhode'] uppercase tracking-widest text-black/50 pointer-events-none transition-all duration-300 peer-focus:-top-4 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-black">
                                    Email
                                </label>
                            </div>
                        </div>

                        <div className="group relative">
                            <textarea rows={2} placeholder=" " className="peer w-full bg-transparent border-b border-black/20 py-2 text-black focus:outline-none focus:border-black resize-none transition-colors"></textarea>
                            <label className="absolute left-0 top-2 text-[10px] font-['Rhode'] uppercase tracking-widest text-black/50 pointer-events-none transition-all duration-300 peer-focus:-top-4 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-black">
                                Your Experience
                            </label>
                        </div>

                        <div className="pt-4 flex justify-center">
                            <PinkButton type="submit" className="w-full md:w-auto px-12 py-4 bg-black text-[#E3C4BE] hover:bg-black/80 hover:scale-100">
                                <span className="font-['Rhode'] tracking-widest text-sm">Submit Review</span>
                            </PinkButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
