'use client'

import React from 'react'

interface AspectRatioPickerProps {
    selectedRatio: string
    onSelect: (ratio: string) => void
    orientation?: 'portrait' | 'landscape' | 'all'
}

// All aspect ratio presets
const PORTRAIT_RATIOS = [
    { label: '1:3', value: '1:3' },
    { label: '1:2', value: '1:2' },
    { label: '9:16', value: '9:16' },
    { label: '10:16', value: '10:16' },
    { label: '2:3', value: '2:3' },
    { label: '3:4', value: '3:4' },
    { label: '4:5', value: '4:5' },
]

const LANDSCAPE_RATIOS = [
    { label: '3:1', value: '3:1' },
    { label: '2:1', value: '2:1' },
    { label: '16:9', value: '16:9' },
    { label: '16:10', value: '16:10' },
    { label: '3:2', value: '3:2' },
    { label: '4:3', value: '4:3' },
    { label: '5:4', value: '5:4' },
]

const SQUARE_RATIO = { label: '1:1', value: '1:1' }

// Parse ratio string to numeric value
const parseRatio = (ratio: string): number => {
    const [w, h] = ratio.split(':').map(Number)
    return w / h
}

// Generate a mini-preview box for the ratio
const RatioPreviewBox: React.FC<{ ratio: string; isSelected: boolean }> = ({ ratio, isSelected }) => {
    const numericRatio = parseRatio(ratio)
    const baseSize = 40

    let width: number, height: number
    if (numericRatio >= 1) {
        // Landscape or square
        width = baseSize
        height = baseSize / numericRatio
    } else {
        // Portrait
        height = baseSize
        width = baseSize * numericRatio
    }

    return (
        <div
            className={`border-2 rounded transition-all duration-200 ${isSelected
                    ? 'border-gray-900 bg-gray-900'
                    : 'border-gray-300 bg-gray-100 hover:border-gray-500'
                }`}
            style={{
                width: `${Math.max(width, 12)}px`,
                height: `${Math.max(height, 12)}px`,
            }}
        />
    )
}

export default function AspectRatioPicker({
    selectedRatio,
    onSelect,
    orientation = 'all',
}: AspectRatioPickerProps) {
    const showPortrait = orientation === 'all' || orientation === 'portrait'
    const showLandscape = orientation === 'all' || orientation === 'landscape'

    return (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Aspect Ratio</h4>

            <div className="flex gap-8">
                {/* Portrait Column */}
                {showPortrait && (
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3 text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="7" y="3" width="10" height="18" rx="1" strokeWidth="2" />
                            </svg>
                            <span className="text-xs font-medium uppercase tracking-wider">Portrait</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {PORTRAIT_RATIOS.map((r) => (
                                <button
                                    key={r.value}
                                    type="button"
                                    onClick={() => onSelect(r.value)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${selectedRatio === r.value
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <RatioPreviewBox ratio={r.value} isSelected={selectedRatio === r.value} />
                                    <span className="font-medium">{r.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Landscape Column */}
                {showLandscape && (
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3 text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="3" y="7" width="18" height="10" rx="1" strokeWidth="2" />
                            </svg>
                            <span className="text-xs font-medium uppercase tracking-wider">Landscape</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {LANDSCAPE_RATIOS.map((r) => (
                                <button
                                    key={r.value}
                                    type="button"
                                    onClick={() => onSelect(r.value)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${selectedRatio === r.value
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <RatioPreviewBox ratio={r.value} isSelected={selectedRatio === r.value} />
                                    <span className="font-medium">{r.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Square Option */}
            <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={() => onSelect(SQUARE_RATIO.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${selectedRatio === SQUARE_RATIO.value
                            ? 'bg-gray-900 text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    <RatioPreviewBox ratio={SQUARE_RATIO.value} isSelected={selectedRatio === SQUARE_RATIO.value} />
                    <span className="font-medium">{SQUARE_RATIO.label} (Square)</span>
                </button>
            </div>

            {/* Current Selection Display */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-500">Selected:</span>
                <span className="text-sm font-bold text-gray-900">{selectedRatio}</span>
            </div>
        </div>
    )
}
