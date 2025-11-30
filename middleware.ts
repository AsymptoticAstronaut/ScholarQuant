import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PUBLIC_PATHS = ['/login', '/favicon.ico', '/robots.txt', '/sitemap.xml']

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  // Allow Next internals and auth endpoints to pass through
  if (pathname.startsWith('/_next') || pathname.startsWith('/static')) return NextResponse.next()
  if (pathname.startsWith('/api/auth')) return NextResponse.next()
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next()

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    const loginUrl = new URL('/login', req.url)
    const callbackUrl = `${pathname}${search}`
    loginUrl.searchParams.set('callbackUrl', callbackUrl)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
}
