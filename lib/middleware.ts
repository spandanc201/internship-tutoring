import { getTokenFromCookie } from './auth'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getTokenFromCookie()

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
}
