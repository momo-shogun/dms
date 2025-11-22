// Middleware for authentication and route protection

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/terms',
  '/privacy',
  '/api/auth/login',
  '/api/auth/register',
]

// Define API routes that require authentication
const protectedApiRoutes = [
  '/api/documents',
  '/api/folders',
  '/api/auth/profile',
  '/api/auth/logout',
]

// Define dashboard routes that require authentication
const protectedDashboardRoutes = [
  '/dashboard',
]

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route === '/') return pathname === '/'
    return pathname.startsWith(route)
  })
}

function isProtectedApiRoute(pathname: string): boolean {
  return protectedApiRoutes.some(route => pathname.startsWith(route))
}

function isProtectedDashboardRoute(pathname: string): boolean {
  return protectedDashboardRoutes.some(route => pathname.startsWith(route))
}

function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith('/login') || pathname.startsWith('/register')
}

// Mock token verification (replace with proper JWT verification in production)
function verifyToken(token: string): boolean {
  // In production, you would:
  // 1. Verify JWT signature
  // 2. Check expiration
  // 3. Validate issuer
  // 4. Check against blacklist
  
  return Boolean(token && typeof token === 'string' && token.startsWith('mock_token_'))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth_token')?.value

  console.log(`Middleware: ${pathname}, Token: ${token ? 'Present' : 'None'}`)

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    // Check if API route requires authentication
    if (isProtectedApiRoute(pathname)) {
      if (!token || !verifyToken(token)) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Unauthorized - Please login to access this resource' 
          },
          { status: 401 }
        )
      }
    }

    // Add CORS headers for API routes
    const response = NextResponse.next()
    
    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers })
    }

    return response
  }

  // Handle authentication routes
  if (isAuthRoute(pathname)) {
    // If user is already authenticated, redirect to dashboard
    if (token && verifyToken(token)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Handle protected dashboard routes
  if (isProtectedDashboardRoute(pathname)) {
    if (!token || !verifyToken(token)) {
      // Store the attempted URL for redirect after login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Handle public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Default: allow access
  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
