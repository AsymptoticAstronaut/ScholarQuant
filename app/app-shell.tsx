"use client"

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Footer } from './footer'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { NebulaBackdrop } from '@/components/ui/nebula-backdrop'
import { useStudentProfileStore } from '@/lib/stores/student-profiles-store'

const AUTH_ROUTES = ['/login']

type AppShellProps = {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname?.startsWith(route))
  const { status } = useSession()

  const profiles = useStudentProfileStore((s) => s.profiles)
  const selectedProfileId = useStudentProfileStore((s) => s.selectedProfileId)
  const loadProfiles = useStudentProfileStore((s) => s.loadProfiles)
  const hasFetched = useStudentProfileStore((s) => s.hasFetched)
  const loadingProfiles = useStudentProfileStore((s) => s.loading)
  const [hydrated, setHydrated] = useState(false)
  const isProfileComplete = useStudentProfileStore((s) => s.isProfileComplete)
  const selectedProfile = useMemo(
    () => profiles.find((p) => p.id === selectedProfileId),
    [profiles, selectedProfileId]
  )

  useEffect(() => {
    const unsub = useStudentProfileStore.persist?.onFinishHydration?.(() => setHydrated(true))
    if (useStudentProfileStore.persist?.hasHydrated?.()) setHydrated(true)
    return () => unsub?.()
  }, [])

  useEffect(() => {
    if (status !== 'authenticated') return
    loadProfiles()
  }, [status, loadProfiles])

  const hasProfiles = profiles.length > 0
  const hasCompleteProfile =
    !!selectedProfileId && isProfileComplete(selectedProfileId)

  const shouldGateToProfiles =
    hasFetched &&
    !isAuthRoute &&
    !pathname?.startsWith('/profiles') &&
    (!hasProfiles || !hasCompleteProfile)

  useEffect(() => {
    if (!shouldGateToProfiles) return
    router.replace('/profiles?missing=1')
  }, [router, shouldGateToProfiles])

  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50">
        <main className="">
          {children}
        </main>
      </div>
    )
  }

  if (!hydrated || status === 'loading' || (status === 'authenticated' && !hasFetched)) {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#050013] via-[#050010] to-black text-zinc-200">
        <NebulaBackdrop />
        <div className="relative z-10 flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2 shadow-lg shadow-black/40">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
          <span className="text-sm">
            {status === 'loading' ? 'Checking session...' : 'Loading profiles...'}
          </span>
        </div>
      </div>
    )
  }

  if (loadingProfiles) {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#050013] via-[#050010] to-black text-zinc-200">
        <NebulaBackdrop />
        <div className="relative z-10 flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2 shadow-lg shadow-black/40">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
          <span className="text-sm">Syncing profiles...</span>
        </div>
      </div>
    )
  }

  if (shouldGateToProfiles && status === 'authenticated') {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#050013] via-[#050010] to-black text-zinc-200">
        <NebulaBackdrop />
        <div className="relative z-10 flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2 shadow-lg shadow-black/40">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
          <span className="text-sm">Redirecting to profile setup...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full font-[family-name:var(--font-inter-tight)]">
      <Sidebar />
      <div id="app-root" className="flex flex-1 flex-col transition-all duration-300 md:ml-64">
        <Header />
        <main className="pt-20">{children}</main>
        <Footer />
      </div>
    </div>
  )
}
