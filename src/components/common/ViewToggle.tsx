"use client"

import React from 'react';
import { LayoutGrid, RectangleVertical } from 'lucide-react';

interface ViewToggleProps {
    isSingleView: boolean;
    onToggle: () => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ isSingleView, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#D4CFC8] bg-white transition-all duration-300 hover:border-[#8B7355] group"
            aria-label={isSingleView ? "Switch to grid view" : "Switch to single view"}
        >
            {isSingleView ? (
                <>
                    <LayoutGrid className="w-4 h-4 text-[#8B7355] group-hover:text-[#5C4D3C] transition-colors" />
                    <span className="text-[10px] uppercase tracking-wider text-[#8B7355] font-medium hidden xs:inline-block">Grid</span>
                </>
            ) : (
                <>
                    <RectangleVertical className="w-4 h-4 text-[#8B7355] group-hover:text-[#5C4D3C] transition-colors" />
                    <span className="text-[10px] uppercase tracking-wider text-[#8B7355] font-medium hidden xs:inline-block">Single</span>
                </>
            )}
        </button>
    );
};

export default ViewToggle;
