import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PUBLIC_PATHS = ['/login', '/favicon.ico', '/robots.txt', '/sitemap.xml']

type RateLimitBucket = {
  count: number
  resetAt: number
}

const RATE_LIMIT_WINDOW_MS = 60_000

// Stricter bucket for expensive LLM calls.
const LLM_MAX_REQUESTS_PER_WINDOW = 10

// More relaxed bucket for general API usage.
const API_MAX_REQUESTS_PER_WINDOW = 120

const rateLimitStore = new Map<string, RateLimitBucket>()

const getClientKey = (req: NextRequest) => {
  const ipHeader =
    req.headers.get('x-forwarded-for') ??
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-real-ip')
  const forwardedIp = ipHeader?.split(',')[0]?.trim()
  const ip = forwardedIp ?? 'unknown'
  // Bucket by path prefix to isolate heavy endpoints.
  const path = req.nextUrl.pathname.startsWith('/api/generate-draft')
    ? '/api/generate-draft'
    : req.nextUrl.pathname.startsWith('/api/profiles')
      ? '/api/profiles'
      : '/api/other'
  return `${ip}:${path}`
}

const getLimitForPath = (pathname: string) => {
  if (pathname.startsWith('/api/generate-draft')) return LLM_MAX_REQUESTS_PER_WINDOW
  if (pathname.startsWith('/api/profiles')) return API_MAX_REQUESTS_PER_WINDOW
  if (pathname.startsWith('/api')) return API_MAX_REQUESTS_PER_WINDOW
  return null
}

const checkRateLimit = (req: NextRequest): NextResponse | null => {
  const { pathname } = req.nextUrl
  const maxRequests = getLimitForPath(pathname)
  if (!maxRequests) return null

  const key = getClientKey(req)
  const now = Date.now()
  const existing = rateLimitStore.get(key)

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    })
    return null
  }

  if (existing.count >= maxRequests) {
    const res = NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      { status: 429 }
    )
    const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000)
    res.headers.set('Retry-After', String(retryAfterSeconds))
    return res
  }

  existing.count += 1
  rateLimitStore.set(key, existing)
  return null
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  // Allow Next internals and auth endpoints to pass through
  if (pathname.startsWith('/_next') || pathname.startsWith('/static')) return NextResponse.next()
  if (pathname.startsWith('/api/auth')) return NextResponse.next()
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next()

  // Basic rate limiting for API routes (best-effort, per-instance).
  const rateLimitedResponse = checkRateLimit(req)
  if (rateLimitedResponse) return rateLimitedResponse

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
