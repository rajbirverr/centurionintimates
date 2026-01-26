import { headers } from 'next/headers'

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  
  // Allow access to register page without authentication
  // The middleware sets x-pathname header for /account/register
  if (pathname === '/account/register') {
    return <>{children}</>
  }

  // For all other account routes, middleware has already verified authentication
  // No need to check again or redirect - just render the layout
  return <>{children}</>
}
