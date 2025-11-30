'use client'

import React, { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const { status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasRetried = useRef(false)

  const error = searchParams.get('error')
  const isRetrying = error === 'OAuthCallback' && !hasRetried.current

  const errorMessage =
    error === 'Callback'
      ? 'Sign-in failed. Try again.'
      : error === 'AccessDenied'
        ? 'Access was denied. Try a different account.'
        : error
          ? 'Sign-in could not be completed. Please try again.'
          : null

  useEffect(() => {
    if (status === 'authenticated') router.push('/')
  }, [status, router])

  // If Cognito bounces us with an OAuthCallback error, retry once automatically
  useEffect(() => {
    if (status === 'unauthenticated' && error === 'OAuthCallback' && !hasRetried.current) {
      hasRetried.current = true
      signIn('cognito', { callbackUrl: '/profiles' }, { identity_provider: 'Google' })
    }
  }, [status, error])

  // Keep the page blank while we silently retry to avoid flashing an error screen.
  if (isRetrying || status === 'loading') {
    return null
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-b from-[#050013] via-[#050010] to-black px-4">
      <NebulaBackdrop />
      <Card className="relative z-10 w-full max-w-md border border-zinc-500/40 bg-zinc-900/30 text-zinc-50 shadow-2xl shadow-black/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-zinc-50">Sign in</CardTitle>
          <p className="text-sm text-zinc-400">Use Google to continue.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            type="button"
            className="w-full gap-2 border border-zinc-200/40 bg-zinc-50/10 text-zinc-50 backdrop-blur-lg hover:bg-zinc-50/20 hover:border-zinc-100/60"
            onClick={() =>
              signIn('cognito', { callbackUrl: '/profiles' }, { identity_provider: 'Google' })
            }
            disabled={status === 'loading'}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-semibold text-blue-500">
              G
            </span>
            Continue with Google
          </Button>
          {errorMessage ? (
            <div className="rounded-md border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-100">
              {errorMessage}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

function NebulaBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-70">
      <div className="absolute -left-24 top-0 h-64 w-64 rounded-full bg-purple-700/40 blur-3xl" />
      <div className="absolute right-[-40px] top-6 h-72 w-72 rounded-full bg-fuchsia-500/35 blur-3xl" />
      <div className="absolute bottom-[-40px] left-1/3 h-72 w-72 rounded-full bg-indigo-500/28 blur-3xl" />
      <div className="absolute bottom-10 right-16 h-52 w-52 rounded-full bg-sky-500/18 blur-3xl" />
    </div>
  )
}
