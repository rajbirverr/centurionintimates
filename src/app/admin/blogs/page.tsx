
import Link from 'next/link';
import { getAllBlogsForAdmin, deleteBlog } from '@/lib/actions/blogs';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic'

export default async function AdminBlogsPage() {
    const result = await getAllBlogsForAdmin();
    const blogs = result.success ? result.data : [];

    async function handleDelete(id: string) {
        'use server'
        await deleteBlog(id);
        revalidatePath('/admin/blogs');
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
                    <p className="text-gray-500 mt-1">Manage your editorial content.</p>
                </div>
                <Link
                    href="/admin/blogs/create"
                    className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                    <span>+</span> Create New Post
                </Link>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm">Title</th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm">Status</th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm">Category</th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm">Date</th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {blogs && blogs.length > 0 ? (
                            blogs.map((blog: any) => (
                                <tr key={blog.id} className="hover:bg-gray-50 group">
                                    <td className="px-6 py-4">
                                        <Link href={`/admin/blogs/${blog.id}`} className="font-medium text-gray-900 hover:underline">
                                            {blog.title}
                                        </Link>
                                        <div className="text-xs text-gray-400 mt-0.5 font-mono">{blog.slug}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {blog.published_at ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                Published
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                Draft
                                            </span>
                                        )}
                                        {blog.is_featured && (
                                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                Featured
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {blog.category}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {blog.published_at
                                            ? new Date(blog.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                                            : 'Not published'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={`/admin/blogs/${blog.id}`}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                            >
                                                Edit
                                            </Link>
                                            <form action={async () => {
                                                'use server'
                                                await deleteBlog(blog.id)
                                            }}>
                                                <button className="text-sm font-medium text-red-600 hover:text-red-800">
                                                    Delete
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No blog posts found. Create your first one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
