import React from 'react';

interface StylizedTitleProps {
    text: string;
    className?: string;
    style?: React.CSSProperties;
}

const StylizedTitle: React.FC<StylizedTitleProps> = ({ text, className, style }) => {
    if (!text) return null;

    if (text.length <= 1) {
        return (
            <h2 className={`${className || ''} text-[#A47864]`} style={style}>
                {text}
            </h2>
        );
    }

    const first = text.charAt(0);
    const mid = text.slice(1, -1);
    const last = text.charAt(text.length - 1);

    // The parent className should define the base color (D7E8BC)
    return (
        <h2 className={className} style={style}>
            <span className="text-[#F4A492]">{first}</span>
            <span className="text-[#F4A492]">{mid}</span>
            <span className="text-[#F4A492]">{last}</span>
        </h2>
    );
};

export default StylizedTitle;
