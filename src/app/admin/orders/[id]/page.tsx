import { notFound } from 'next/navigation'
import { getOrderById, getOrderItems, updateOrderStatus, updateOrderPaymentStatus } from '@/lib/actions/orders'
import { Badge, Button } from '@/components/admin/ui'
import UpdateOrderStatus from '@/components/admin/UpdateOrderStatus'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const order = await getOrderById(id)
  const orderItems = await getOrderItems(id)

  if (!order) {
    notFound()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#5a4c46]">Order Details</h1>
        <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'}>
          {order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Order Information */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order ID:</span>
                <span className="font-medium">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span className="font-medium">{formatDate(order.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <UpdateOrderStatus orderId={order.id} currentStatus={order.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Status:</span>
                <UpdateOrderStatus orderId={order.id} currentPaymentStatus={order.payment_status} isPayment />
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
            {orderItems.length === 0 ? (
              <p className="text-gray-500 text-sm">No items found</p>
            ) : (
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-sm text-gray-500">SKU: {item.product_sku} × {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">₹{Number(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal:</span>
              <span className="font-medium">₹{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping:</span>
              <span className="font-medium">₹{order.shipping_cost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax:</span>
              <span className="font-medium">₹{order.tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span>₹{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Customer & Shipping Info */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer</h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{order.customer_name}</p>
              <p className="text-gray-500">{order.customer_email}</p>
              {order.customer_phone && (
                <p className="text-gray-500">{order.customer_phone}</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
            <div className="text-sm text-gray-500 space-y-1">
              {order.shipping_address && typeof order.shipping_address === 'object' ? (
                <>
                  <p>{order.shipping_address.name || order.customer_name}</p>
                  <p>{order.shipping_address.address_line_1}</p>
                  {order.shipping_address.address_line_2 && (
                    <p>{order.shipping_address.address_line_2}</p>
                  )}
                  <p>
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                  </p>
                  <p>{order.shipping_address.country}</p>
                </>
              ) : (
                <p>No shipping address provided</p>
              )}
            </div>
          </div>

          {order.notes && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-sm text-gray-500">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

