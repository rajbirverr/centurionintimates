"use client"

import React, { useRef, useEffect } from 'react';

interface BaseDropdownProps {
  isOpen: boolean;
  navHeight: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  children: React.ReactNode;
}

const BaseDropdown: React.FC<BaseDropdownProps> = ({
  isOpen,
  navHeight,
  onMouseEnter,
  onMouseLeave,
  children
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set dropdown position based on navbar height
    if (dropdownRef.current && isOpen) {
      // Set position immediately
      dropdownRef.current.style.top = `${navHeight}px`;
      // Then update again in next frame to ensure correct positioning after any layout changes
      requestAnimationFrame(() => {
        if (dropdownRef.current && isOpen) {
          dropdownRef.current.style.top = `${navHeight}px`;
        }
      });
    }
  }, [navHeight, isOpen]);

  // Lock body scroll on mobile when dropdown is open
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="fixed left-0 right-0 bg-[#f3f0ef] w-full shadow-md z-50 md:max-h-none md:bottom-auto bottom-0 overflow-y-auto"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BaseDropdown;
