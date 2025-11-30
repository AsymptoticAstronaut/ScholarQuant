'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Sun,
  Moon,
  LayoutDashboard,
  BookOpenCheck,
  UserCircle2,
  FileText,
  Activity,
  SlidersHorizontal,
  Mail,
  ExternalLink,
  ChevronDown,
  UserCircle2 as UserIcon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { signOut } from 'next-auth/react'
import { useStudentProfileStore } from '@/lib/stores/student-profiles-store'

const EMAIL = 'yasser.noori@mail.utoronto.ca'
const LINKEDIN = 'https://www.linkedin.com/in/yasser-noori'
const GITHUB = 'https://github.com/AsymptoticAstronaut'

export function Sidebar() {
  const router = useRouter()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [studentMenuOpen, setStudentMenuOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const studentMenuRef = useRef<HTMLDivElement>(null)
  const studentProfiles = useStudentProfileStore((s) => s.profiles)
  const selectedProfileId = useStudentProfileStore((s) => s.selectedProfileId)
  const isProfileComplete = useStudentProfileStore((s) => s.isProfileComplete)
  const setSelectedProfileId = useStudentProfileStore((s) => s.setSelectedProfileId)
  const selectedStudent = useMemo(
    () => studentProfiles.find((profile) => profile.id === selectedProfileId),
    [selectedProfileId, studentProfiles]
  )

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    const unsub = useStudentProfileStore.persist?.onFinishHydration?.(() => setHydrated(true))
    if (useStudentProfileStore.persist?.hasHydrated?.()) setHydrated(true)
    return () => unsub?.()
  }, [])
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!studentMenuRef.current) return
      if (studentMenuRef.current.contains(event.target as Node)) return
      setStudentMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // initial open on desktop
  useEffect(() => {
    const setDesktopOpen = () =>
      setOpen(window.matchMedia('(min-width: 768px)').matches)
    setDesktopOpen()
    const mq = window.matchMedia('(min-width: 768px)')
    mq.addEventListener('change', setDesktopOpen)
    return () => mq.removeEventListener('change', setDesktopOpen)
  }, [])

  // listen for header/keyboard toggles
  useEffect(() => {
    const onToggle = () => setOpen((v) => !v)
    const onClose = () => setOpen(false)
    const onOpen = () => setOpen(true)
    window.addEventListener('toggleSidebar', onToggle)
    window.addEventListener('closeSidebar', onClose)
    window.addEventListener('openSidebar', onOpen)
    return () => {
      window.removeEventListener('toggleSidebar', onToggle)
      window.removeEventListener('closeSidebar', onClose)
      window.removeEventListener('openSidebar', onOpen)
    }
  }, [])

  // sync margin on app-root and emit sidebarChange
  useEffect(() => {
    const root = document.getElementById('app-root')
    if (!root) return
    const cls = 'md:ml-64'
    if (open) root.classList.add(cls)
    else root.classList.remove(cls)
    window.dispatchEvent(new CustomEvent('sidebarChange', { detail: open }))
  }, [open])

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light')

  const navItems = [
    { href: '/profiles', label: 'Profiles', Icon: UserCircle2 },
    { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { href: '/scholarships', label: 'Scholarships', Icon: BookOpenCheck },
    { href: '/pattern-lab', label: 'Pattern Lab', Icon: Activity },
    { href: '/drafts', label: 'Draft Studio', Icon: FileText },
  ]

  const secondaryItems = [
    { href: '/settings', label: 'Settings', Icon: SlidersHorizontal },
  ]

  const profileIncomplete =
    hydrated && !!selectedProfileId && !isProfileComplete(selectedProfileId)
  const noProfiles = hydrated && studentProfiles.length === 0
  const lockNav = noProfiles || profileIncomplete

  return (
    <>
      {/* Overlay (mobile only) */}
      {open && (
        <div
          className="fixed inset-0 z-45 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <aside
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-[72vw] transform border-r border-zinc-200/30 bg-white/80 transition-transform duration-300 ease-in-out dark:border-zinc-800/50 dark:bg-zinc-950/80 md:w-64 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!open}
      >
        {/* Inner wrapper to contain nebula without changing sidebar layout */}
        <div className="relative h-full w-full overflow-hidden">
          {/* Nebula background (slightly dimmer; shapes unchanged) */}
          <div className="pointer-events-none absolute inset-0 z-0 opacity-70 dark:opacity-60">
            {/* unified wash with slightly lower intensity */}
            <div className="absolute inset-0 bg-[radial-gradient(95%_85%_at_0%_0%,rgba(16,185,129,0.14),transparent_58%),radial-gradient(105%_90%_at_100%_12%,rgba(56,189,248,0.14),transparent_60%),radial-gradient(115%_95%_at_42%_100%,rgba(129,140,248,0.12),transparent_62%),radial-gradient(85%_75%_at_60%_40%,rgba(217,70,239,0.11),transparent_64%)]" />

            {/* soft clouds: reduced alpha only */}
            <div className="absolute -left-6 top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.32),transparent_60%)] blur-[56px]" />
            <div className="absolute right-[-40px] top-28 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.30),transparent_62%)] blur-[60px]" />
            <div className="absolute bottom-[-56px] left-8 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(217,70,239,0.27),transparent_64%)] blur-[66px]" />
            <div className="absolute bottom-10 right-6 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.25),transparent_62%)] blur-[54px]" />
            {/* extra faint teal-green lift, dimmer */}
            <div className="absolute top-1/2 left-1/3 h-44 w-44 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.12),transparent_67%)] blur-[70px]" />
          </div>

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between border-b border-zinc-200/30 px-4 py-4 dark:border-zinc-800/50">
            <div className="flex flex-col justify-center pl-2 pt-1">
              <p className="leading-tight font-medium text-zinc-900 dark:text-zinc-100">
                ScholarQuant
              </p>
              <p className="leading-tight text-xs text-zinc-500 dark:text-zinc-400">
              </p>
            </div>

            {mounted ? (
              <button
                onClick={toggleTheme}
                className="hidden cursor-pointer rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 md:inline-flex"
                aria-label="Toggle theme"
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="h-4 w-4 text-zinc-200" />
                ) : (
                  <Moon className="h-4 w-4 text-zinc-800" />
                )}
              </button>
            ) : (
              <div className="hidden h-4 w-4 md:inline-flex" aria-hidden />
            )}
          </div>

          {/* Student selector */}
          <div
            ref={studentMenuRef}
            className="relative z-10 border-b border-zinc-200/40 px-4 py-4 dark:border-zinc-800/60"
          >
            <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              Drafting for
            </p>
            {studentProfiles.length ? (
              <>
                <button
                  type="button"
                  onClick={() => setStudentMenuOpen((v) => !v)}
                  className="flex w-full items-center justify-between rounded-lg border border-zinc-200/70 bg-white/70 px-3 py-2 text-left text-sm text-zinc-800 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800/70 dark:bg-zinc-900/70 dark:text-zinc-100"
                >
                  <div>
                    <p className="font-medium">
                      {selectedStudent?.name ?? 'Select a student'}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {selectedStudent
                        ? `${selectedStudent.program} • ${selectedStudent.year}`
                        : 'No student selected'}
                    </p>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-zinc-500 transition ${
                      studentMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {studentMenuOpen && (
                  <div className="mt-2 max-h-56 w-full overflow-y-auto rounded-lg border border-zinc-200/80 bg-white/90 text-sm shadow-lg dark:border-zinc-800/70 dark:bg-zinc-900/90">
                    {studentProfiles.map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => {
                          setSelectedProfileId(student.id)
                          setStudentMenuOpen(false)
                        }}
                        className={`flex w-full items-start gap-3 px-3 py-2 text-left transition hover:bg-zinc-100/80 dark:hover:bg-zinc-800/70 ${
                          student.id === selectedProfileId
                            ? 'bg-zinc-100/70 dark:bg-zinc-800/60'
                            : ''
                        }`}
                      >
                        <div className="mt-0.5 rounded-full bg-zinc-200 p-1 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          <UserIcon className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                            {student.name}
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            {student.program}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {student.tags.slice(0, 2).map((tag) => (
                              <span
                                key={`${student.id}-${tag}`}
                                className="rounded-full border border-zinc-200/80 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Add a student profile to start drafting.
              </p>
            )}
          </div>

          {/* Navigation */}
          <nav className="relative z-10 flex flex-col gap-1 p-4 text-sm">
            <div className="mt-2 mb-2 px-2 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Navigate
            </div>

            {navItems.map(({ href, label, Icon }) => {
              const disabled = lockNav && href !== '/profiles'

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={(e) => {
                    if (disabled) {
                      e.preventDefault()
                      router.push('/profiles?missing=1')
                    }
                  }}
                  className={`flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-white/3 dark:hover:bg-white/3 hover:backdrop-blur-[1px] hover:shadow-[inset_0_0_0_0.4px_rgba(255,255,255,0.15)] ${
                    disabled ? 'cursor-not-allowed opacity-60' : ''
                  }`}
                  aria-disabled={disabled}
                >
                  <Icon className="h-4 w-4 text-zinc-600 dark:text-zinc-200" />
                  <span className="font-normal text-zinc-800 dark:text-zinc-100">
                    {label}
                  </span>
                </Link>
              )
            })}

            {secondaryItems.length > 0 && (
              <>
                <div className="mt-4 mb-2 px-2 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  System
                </div>
                {secondaryItems.map(({ href, label, Icon }) => {
                  const disabled = lockNav
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={(e) => {
                        if (disabled) {
                          e.preventDefault()
                          router.push('/profiles?missing=1')
                        }
                      }}
                      className={`flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-white/3 dark:hover:bg-white/3 hover:backdrop-blur-[1px] hover:shadow-[inset_0_0_0_0.4px_rgba(255,255,255,0.15)] ${
                        disabled ? 'cursor-not-allowed opacity-60' : ''
                      }`}
                      aria-disabled={disabled}
                    >
                      <Icon className="h-4 w-4 text-zinc-600 dark:text-zinc-200" />
                      <span className="font-normal text-zinc-800 dark:text-zinc-100">
                        {label}
                      </span>
                    </Link>
                  )
                })}
              </>
            )}
          </nav>

          {/* Support Section */}
          <div className="relative z-10 px-4 pb-4">
            <div className="mt-4 mb-2 px-2 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Support
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={`mailto:${EMAIL}`}
                className="flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:bg-white/3 dark:hover:bg-white/3 hover:backdrop-blur-[1px] hover:shadow-[inset_0_0_0_0.4px_rgba(255,255,255,0.15)]
"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-zinc-600 dark:text-zinc-200" />
                  <span className="text-sm font-normal text-zinc-800 dark:text-zinc-100">
                    Email
                  </span>
                </div>
                <ExternalLink className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              </a>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center justify-between rounded-md px-2 py-2 text-left transition-colors hover:bg-white/3 dark:hover:bg-white/3 hover:backdrop-blur-[1px] hover:shadow-[inset_0_0_0_0.4px_rgba(255,255,255,0.15)]"
              >
                <div className="flex items-center gap-3">
                  <UserIcon className="h-4 w-4 text-zinc-600 dark:text-zinc-200" />
                  <span className="text-sm font-normal text-zinc-800 dark:text-zinc-100">
                    Sign out
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
