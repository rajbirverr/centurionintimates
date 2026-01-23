import Link from 'next/link'
import { getAllCategories } from '@/lib/actions/categories'
import { deleteCategory } from '@/lib/actions/categories'
import { Button, Badge } from '@/components/admin/ui'
import DeleteCategoryButton from '@/components/admin/DeleteCategoryButton'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories()

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#5a4c46]">Categories</h1>
        <Link href="/admin/categories/new">
          <Button>+ New Category</Button>
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">No categories found</p>
          <Link href="/admin/categories/new">
            <Button>Create your first category</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sort Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {category.name}
                    </div>
                    {category.description && (
                      <div className="text-sm text-gray-500">
                        {category.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.sort_order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/admin/categories/${category.id}/edit`}
                      className="text-[#5a4c46] hover:text-[#4a3c36] mr-4"
                    >
                      Edit
                    </Link>
                    <DeleteCategoryButton categoryId={category.id} categoryName={category.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

