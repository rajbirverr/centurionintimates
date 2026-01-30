import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Get the pathname from the URL
    const pathname = request.nextUrl.pathname

    // Clone the request headers and set the x-pathname header
    // This allows server components (like layout.tsx) to know the current path
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-pathname', pathname)

    // You can also stick the header in the response if needed, 
    // but for layout.tsx checks, passing it in the request is key.

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
