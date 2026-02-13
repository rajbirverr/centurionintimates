'use client'

import { useState } from 'react'
import { submitReview } from '@/lib/actions/reviews'

interface ReviewFormProps {
  productId: string
  productName: string
  onReviewSubmitted?: () => void
}

export default function ReviewForm({ productId, productName, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [favoriteFeatures, setFavoriteFeatures] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Server action will check if user is logged in
      const result = await submitReview({
        product_id: productId,
        rating,
        title,
        content,
        author_name: authorName,
        age_range: ageRange || undefined,
        favorite_features: favoriteFeatures.length > 0 ? favoriteFeatures : undefined,
        is_verified_purchase: false // Can be determined by checking order history
      })

      if (result.success) {
        setSuccess(true)
        setRating(0)
        setTitle('')
        setContent('')
        setAuthorName('')
        setAgeRange('')
        setFavoriteFeatures([])

        if (onReviewSubmitted) {
          setTimeout(() => {
            onReviewSubmitted()
            setSuccess(false)
          }, 2000)
        }
      } else {
        setError(result.error || 'Failed to submit review')
      }
    } catch (err: any) {
      console.error('Error submitting review:', err)
      setError(err.message || 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-t border-gray-200 pt-8">
      <h3 className="text-xl md:text-2xl font-bold tracking-tight text-[#6b4423] mb-6" style={{ fontFamily: 'var(--font-montserrat)' }}>
        Write a Review.
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
          Thank you! Your review has been submitted.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-[#5a4c46] mb-2">
            Rating *
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl transition-colors ${star <= rating
                    ? 'text-yellow-400'
                    : 'text-gray-300 hover:text-yellow-300'
                  }`}
              >
                ★
              </button>
            ))}
            {rating > 0 && (
              <span className="text-sm text-gray-600 ml-2">
                {rating} out of 5
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-[#5a4c46] mb-2">
            Review Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
            placeholder="Summarize your experience"
          />
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-[#5a4c46] mb-2">
            Review *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
            placeholder="Tell others about your experience with this product"
          />
        </div>

        {/* Author Name */}
        <div>
          <label htmlFor="authorName" className="block text-sm font-medium text-[#5a4c46] mb-2">
            Your Name *
          </label>
          <input
            id="authorName"
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
            placeholder="John D."
          />
        </div>

        {/* Age Range (Optional) */}
        <div>
          <label htmlFor="ageRange" className="block text-sm font-medium text-[#5a4c46] mb-2">
            Age Range (Optional)
          </label>
          <select
            id="ageRange"
            value={ageRange}
            onChange={(e) => setAgeRange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
          >
            <option value="">Select age range</option>
            <option value="18-24">18-24</option>
            <option value="25-34">25-34</option>
            <option value="35-44">35-44</option>
            <option value="45-54">45-54</option>
            <option value="55+">55+</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || rating === 0}
          className="w-full md:w-auto px-8 h-12 rounded-full bg-[#5a4c46] text-white uppercase text-sm tracking-widest hover:bg-[#4a3c36] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none font-medium flex items-center justify-center mt-2"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  )
}

