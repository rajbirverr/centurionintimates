'use client'

import { useEffect, useState } from 'react'
import { fetchProductReviews, markReviewHelpful } from '@/lib/actions/reviews'
import ReviewForm from './ReviewForm'

interface ReviewsSectionProps {
  productId: string
  productName: string
}

interface Review {
  id: string
  rating: number
  title: string
  content: string
  author_name: string
  age_range?: string
  favorite_features?: string[]
  helpful_yes: number
  helpful_no: number
  is_verified_purchase: boolean
  created_at: string
}

// Helper to format "time ago"
const timeAgo = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
  return `${Math.floor(diffInSeconds / 31536000)} years ago`
}

export default function ReviewsSection({ productId, productName }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [helpfulClicked, setHelpfulClicked] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Load clicked state from localStorage on mount
    const saved = localStorage.getItem(`helpful-reviews-${productId}`)
    if (saved) {
      setHelpfulClicked(new Set(JSON.parse(saved)))
    }
    loadReviews()
  }, [productId])

  const handleHelpfulClick = async (reviewId: string) => {
    if (helpfulClicked.has(reviewId)) return

    // Optimistic update
    setReviews(prev => prev.map(r =>
      r.id === reviewId ? { ...r, helpful_yes: r.helpful_yes + 1 } : r
    ))

    // Update local state
    const newClicked = new Set(helpfulClicked)
    newClicked.add(reviewId)
    setHelpfulClicked(newClicked)
    localStorage.setItem(`helpful-reviews-${productId}`, JSON.stringify(Array.from(newClicked)))

    // Server action
    await markReviewHelpful(reviewId, true)
  }

  const loadReviews = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await fetchProductReviews(productId, 'most_recent')

      if (result.success && result.reviews) {
        setReviews(result.reviews)
      } else {
        setError(result.error || 'Failed to load reviews')
      }
    } catch (err: any) {
      console.error('Error loading reviews:', err)
      setError(err.message || 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-12 border-t border-gray-200">
      <div className="max-w-4xl mx-auto">
        <h2
          className="text-2xl md:text-3xl font-bold tracking-tight text-[#6b4423] mb-8"
          style={{ fontFamily: 'var(--font-montserrat)' }}
        >
          Customer Reviews.
        </h2>

        {/* Average Rating */}
        {reviews.length > 0 && (
          <div className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-light text-[#5a4c46]">
                {averageRating.toFixed(1)}
              </div>
              <div>
                <div className="flex items-center space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${star <= Math.round(averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                        }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading reviews...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-8 mb-12">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-8 last:border-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-[#5a4c46] mb-1">{review.title}</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                              }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">{review.author_name}</span>
                      {review.is_verified_purchase && (
                        <div className="flex items-center gap-1">
                          <div className="w-3.5 h-3.5 rounded-full bg-pink-500 flex items-center justify-center">
                            <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <span className="text-xs font-medium text-gray-500">Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    {timeAgo(review.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">{review.content}</p>
                {review.favorite_features && review.favorite_features.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-600 mb-1">Favorite Features:</p>
                    <div className="flex flex-wrap gap-2">
                      {review.favorite_features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <button
                    className={`hover:text-[#5a4c46] transition-colors ${helpfulClicked.has(review.id) ? 'text-[#5a4c46] font-medium cursor-default' : ''}`}
                    onClick={() => handleHelpfulClick(review.id)}
                    disabled={helpfulClicked.has(review.id)}
                  >
                    Helpful ({review.helpful_yes})
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Form */}
        <ReviewForm productId={productId} productName={productName} onReviewSubmitted={loadReviews} />
      </div>
    </div>
  )
}
