'use client';

import { useState } from 'react';
import { PinkButton } from '@/components/ui/PinkButton';

export default function HeroReviewSection() {
    const [isFormOpen, setIsFormOpen] = useState(false);

    return (
        <div className="w-full bg-[#faefe6] rounded-b-2xl px-6 py-8 md:py-10 -mt-1 relative z-10 shadow-sm">
            <div className="max-w-4xl mx-auto text-center space-y-6">

                {/* Review Quote */}
                <div className="space-y-4">
                    <p className="text-[#5a4c46] text-lg md:text-xl font-serif italic leading-relaxed">
                        "Bravo I've just washed and blow dried my hair. I am totally blown away by the quality of the products."
                    </p>
                    <p className="text-[#8B5A3C] text-sm font-bold tracking-widest uppercase">
                        ALEXANDRA MIRO
                    </p>
                </div>

                {/* Action Button / Form Toggle */}
                <div className="pt-4">
                    {!isFormOpen ? (
                        <PinkButton onClick={() => setIsFormOpen(true)}>
                            WRITE A REVIEW
                        </PinkButton>
                    ) : (
                        <form className="max-w-md mx-auto bg-white/50 p-6 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="space-y-2 text-left">
                                <label className="text-xs font-bold text-[#8B5A3C] uppercase tracking-wider">Name</label>
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    className="w-full px-4 py-2 rounded-lg border border-[#e6d0c0] focus:outline-none focus:ring-2 focus:ring-[#FFC0CB] bg-white/80"
                                />
                            </div>

                            <div className="space-y-2 text-left">
                                <label className="text-xs font-bold text-[#8B5A3C] uppercase tracking-wider">Comment</label>
                                <textarea
                                    rows={3}
                                    placeholder="Share your thoughts..."
                                    className="w-full px-4 py-2 rounded-lg border border-[#e6d0c0] focus:outline-none focus:ring-2 focus:ring-[#FFC0CB] bg-white/80 resize-none"
                                />
                            </div>

                            <div className="space-y-2 text-left">
                                <label className="text-xs font-bold text-[#8B5A3C] uppercase tracking-wider">Upload Image</label>
                                <div className="border-2 border-dashed border-[#e6d0c0] rounded-lg p-4 text-center cursor-pointer hover:bg-white/50 transition-colors">
                                    <span className="text-sm text-[#8B5A3C]/70">Click to upload photo</span>
                                    <input type="file" className="hidden" accept="image/*" />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <PinkButton type="submit" className="flex-1">
                                    SUBMIT REVIEW
                                </PinkButton>
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-[#8B5A3C]/60 hover:text-[#8B5A3C]"
                                >
                                    CANCEL
                                </button>
                            </div>
                        </form>
                    )}
                </div>

            </div>
        </div>
    );
}
