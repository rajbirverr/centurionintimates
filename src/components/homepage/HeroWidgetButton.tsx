'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function HeroWidgetButton() {
    const [isPressed, setIsPressed] = useState(false)

    return (
        <Link href="/all-products">
            <span
                onMouseDown={() => setIsPressed(true)}
                onMouseUp={() => setIsPressed(false)}
                onMouseLeave={() => setIsPressed(false)}
                onTouchStart={() => setIsPressed(true)}
                onTouchEnd={() => setIsPressed(false)}
                style={{
                    display: 'inline-block',
                    padding: '10px 24px',
                    border: '1px solid rgba(245,237,227,0.7)',
                    borderRadius: '0px',
                    color: '#F5EDE3',
                    fontSize: '10px',
                    fontWeight: 400,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase' as const,
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: isPressed ? 'scale(0.97)' : 'scale(1)',
                    backgroundColor: isPressed ? 'rgba(245,237,227,0.1)' : 'transparent',
                    fontFamily: 'var(--font-inter)',
                }}
            >
                Shop Now
            </span>
        </Link>
    )
}
