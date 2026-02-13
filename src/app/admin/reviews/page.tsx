import { fetchAdminReviews } from '@/lib/actions/admin-reviews'
import ReviewTable from '@/components/admin/reviews/ReviewTable'

export default async function AdminReviewsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const page = typeof params.page === 'string' ? parseInt(params.page) : 1
    const status = typeof params.status === 'string' ? params.status : 'all'
    const search = typeof params.search === 'string' ? params.search : ''

    const { reviews, totalPages, total, error } = await fetchAdminReviews(page, 20, status, search)

    return (
        <div className="max-w-[1440px] px-4 md:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#5a4c46]">Review Management</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage customer reviews, approve content, and verify purchases.
                    </p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Total Reviews: </span>
                    <span className="text-lg font-bold text-[#5a4c46]">{total || 0}</span>
                </div>
            </div>

            {error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            ) : (
                <ReviewTable
                    initialReviews={reviews || []}
                    page={page}
                    totalPages={totalPages || 0}
                    currentStatus={status}
                />
            )}
        </div>
    )
}
