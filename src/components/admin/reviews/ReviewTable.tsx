'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminReview, updateReviewStatus, deleteReview, toggleVerifyReview } from '@/lib/actions/admin-reviews'
import Link from 'next/link'

interface ReviewTableProps {
    initialReviews: AdminReview[]
    page: number
    totalPages: number
    currentStatus: string
}

export default function ReviewTable({ initialReviews, page, totalPages, currentStatus }: ReviewTableProps) {
    const router = useRouter()
    const [processingId, setProcessingId] = useState<string | null>(null)

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        setProcessingId(id)
        await updateReviewStatus(id, newStatus)
        setProcessingId(null)
        router.refresh()
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) return

        setProcessingId(id)
        await deleteReview(id)
        setProcessingId(null)
        router.refresh()
    }

    const handleVerifyToggle = async (id: string, currentStatus: boolean) => {
        setProcessingId(id)
        await toggleVerifyReview(id, !currentStatus)
        setProcessingId(null)
        router.refresh()
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex space-x-2">
                    {['all', 'pending', 'approved', 'rejected', 'hidden'].map((status) => (
                        <Link
                            key={status}
                            href={`/admin/reviews?status=${status}`}
                            className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide transition-colors ${currentStatus === status
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {status}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {initialReviews.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No reviews found in this category.
                                </td>
                            </tr>
                        ) : (
                            initialReviews.map((review) => (
                                <tr key={review.id} className={processingId === review.id ? 'opacity-50 pointer-events-none' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap max-w-[200px]">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 relative overflow-hidden rounded bg-gray-100">
                                                {review.product?.images?.[0] ? (
                                                    <img
                                                        src={review.product.images[0]}
                                                        alt={review.product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                                )}
                                            </div>
                                            <div className="ml-4 truncate">
                                                <div className="text-sm font-medium text-gray-900 truncate" title={review.product?.name}>
                                                    {review.product?.name || 'Unknown Product'}
                                                </div>
                                                <Link href={`/product/${review.product?.slug}`} target="_blank" className="text-xs text-[#5a4c46] hover:underline">
                                                    View details
                                                </Link>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex text-yellow-400 text-sm">
                                            {'★'.repeat(review.rating)}
                                            <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-normal max-w-xs">
                                        <div className="text-sm font-medium text-gray-900 mb-1">{review.title}</div>
                                        <p className="text-sm text-gray-500 line-clamp-2" title={review.content}>
                                            {review.content}
                                        </p>
                                        {review.is_verified_purchase && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                                                Verified Purchase
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{review.author_name}</div>
                                        <div className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${review.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                review.status === 'pending' || !review.status ? 'bg-yellow-100 text-yellow-800' :
                                                    review.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                            }`}>
                                            {review.status || 'pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex flex-col space-y-2">
                                            {/* Approve / Reject buttons */}
                                            {(review.status !== 'approved') && (
                                                <button
                                                    onClick={() => handleStatusUpdate(review.id, 'approved')}
                                                    className="text-green-600 hover:text-green-900 text-left"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {(review.status !== 'rejected') && (
                                                <button
                                                    onClick={() => handleStatusUpdate(review.id, 'rejected')}
                                                    className="text-amber-600 hover:text-amber-900 text-left"
                                                >
                                                    Reject
                                                </button>
                                            )}

                                            {/* Verify Toggle */}
                                            <button
                                                onClick={() => handleVerifyToggle(review.id, review.is_verified_purchase)}
                                                className="text-blue-600 hover:text-blue-900 text-left"
                                            >
                                                {review.is_verified_purchase ? 'Unverify' : 'Mark Verified'}
                                            </button>

                                            {/* Delete */}
                                            <button
                                                onClick={() => handleDelete(review.id)}
                                                className="text-red-600 hover:text-red-900 text-left"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination (Simple) */}
            {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <button
                        onClick={() => router.push(`/admin/reviews?page=${page - 1}&status=${currentStatus}`)}
                        disabled={page <= 1}
                        className="disabled:opacity-50 px-3 py-1 border rounded"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                    <button
                        onClick={() => router.push(`/admin/reviews?page=${page + 1}&status=${currentStatus}`)}
                        disabled={page >= totalPages}
                        className="disabled:opacity-50 px-3 py-1 border rounded"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}
