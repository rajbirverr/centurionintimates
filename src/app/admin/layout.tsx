import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { checkAdminStatus } from '@/lib/actions/auth'
import Sidebar from '@/components/admin/Sidebar'

export const dynamic = 'force-dynamic';


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get current pathname from headers (set by proxy)
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  // Don't protect the /admin login page itself
  if (pathname === '/admin') {
    return <>{children}</>
  }

  // Server Layout Guard: Check authentication and admin role
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin')
  }

  // Check if user is admin
  const adminCheck = await checkAdminStatus()
  if (!adminCheck.success || !adminCheck.isAdmin) {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-[#fafafa] auth-page" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <Sidebar />
      <div className="md:ml-64 p-4 md:p-8">
        {children}
      </div>
    </div>
  )
}
