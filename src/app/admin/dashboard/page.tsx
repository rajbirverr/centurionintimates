import { getAllProducts } from '@/lib/actions/products'
import { getAllOrders } from '@/lib/actions/orders'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import StatsCard from '@/components/admin/StatsCard'
import HeroImageUpload from '@/components/admin/HeroImageUpload'
import ShowcaseCardImageUpload from '@/components/admin/ShowcaseCardImageUpload'
import HomepageCarouselProducts from '@/components/admin/HomepageCarouselProducts'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient()

  // Fetch stats
  const products = await getAllProducts()
  const orders = await getAllOrders()

  // Get total revenue
  const totalRevenue = orders
    .filter(order => order.payment_status === 'paid')
    .reduce((sum, order) => sum + order.total, 0)

  // Get pending orders
  const pendingOrders = orders.filter(order => order.status === 'pending' || order.status === 'processing').length

  // Get low stock products
  const lowStockProducts = products.filter(product => product.inventory_count < 10).length

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-normal mb-12 text-gray-900 tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Products"
          value={products.length.toString()}
          subtitle={`${products.filter(p => p.status === 'published').length} published`}
          icon="📦"
        />
        <StatsCard
          title="Total Orders"
          value={orders.length.toString()}
          subtitle={`${pendingOrders} pending`}
          icon="🛒"
        />
        <StatsCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          subtitle="From paid orders"
          icon="💰"
        />
        <StatsCard
          title="Low Stock"
          value={lowStockProducts.toString()}
          subtitle="Products with < 10 units"
          icon="⚠️"
        />
      </div>

      {/* Hero Image Upload Section */}
      <div className="mb-8">
        <HeroImageUpload />
      </div>

      {/* Showcase Card Image Upload Section */}
      <div className="mb-8">
        <ShowcaseCardImageUpload />
      </div>

      {/* Homepage Carousel Products Section */}
      <div className="mb-8">
        <HomepageCarouselProducts />
      </div>

      <div className="bg-white border border-gray-200 p-6">
        <h2 className="text-sm font-normal mb-6 text-gray-900 tracking-wide uppercase">Recent Orders</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.slice(0, 10).map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customer_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{order.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                        }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

