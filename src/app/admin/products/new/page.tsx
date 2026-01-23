import ProductForm from '@/components/admin/ProductForm'

export const dynamic = 'force-dynamic'

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-[#5a4c46]">Create New Product</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <ProductForm />
      </div>
    </div>
  )
}

