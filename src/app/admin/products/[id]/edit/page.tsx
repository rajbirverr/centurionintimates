import { notFound } from 'next/navigation'
import { getProductById } from '@/lib/actions/products'
import { getProductImages } from '@/lib/actions/images'
import ProductForm from '@/components/admin/ProductForm'

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  // Fetch product images
  const images = await getProductImages(id)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-[#5a4c46]">Edit Product</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <ProductForm product={product} initialImages={images} />
      </div>
    </div>
  )
}

