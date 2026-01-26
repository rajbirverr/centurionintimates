import { headers } from 'next/headers'
import Sidebar from '@/components/admin/Sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get current pathname from headers (set by middleware)
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  
  // Don't protect the /admin login page itself
  // Middleware already handles authentication redirects, so we don't need to redirect again
  if (pathname === '/admin') {
    return <>{children}</>
  }
  
  // For all other admin routes, middleware has already verified authentication and admin role
  // No need to check again or redirect - just render the layout
  return (
    <div className="min-h-screen bg-[#fafafa] auth-page" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <Sidebar />
      <div className="md:ml-64 p-4 md:p-8">
        {children}
      </div>
    </div>
  )
}
