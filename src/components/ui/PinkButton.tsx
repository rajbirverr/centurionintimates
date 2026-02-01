import React from 'react';

interface PinkButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'solid' | 'outline';
}

export function PinkButton({ children, className = '', variant = 'solid', ...props }: PinkButtonProps) {
    const baseStyles = "px-6 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        solid: "bg-[#FFC0CB] hover:bg-[#FFB6C1] text-[#8B5A3C] shadow-md hover:shadow-lg border border-transparent",
        outline: "bg-transparent border-2 border-[#FFC0CB] text-[#8B5A3C] hover:bg-[#FFC0CB]/20"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
