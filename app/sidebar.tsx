'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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
} from 'lucide-react'
import { useTheme } from 'next-themes'

const EMAIL = 'yasser.noori@mail.utoronto.ca'
const LINKEDIN = 'https://www.linkedin.com/in/yasser-noori'
const GITHUB = 'https://github.com/AsymptoticAstronaut'

export function Sidebar() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

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
    { href: '/', label: 'Dashboard', Icon: LayoutDashboard },
    { href: '/scholarships', label: 'Scholarships', Icon: BookOpenCheck },
    { href: '/profiles', label: 'Student Profiles', Icon: UserCircle2 },
    { href: '/pattern-lab', label: 'Pattern Lab', Icon: Activity },
    { href: '/drafts', label: 'Draft Studio', Icon: FileText },
  ]

  const secondaryItems = [
    { href: '/settings', label: 'Settings', Icon: SlidersHorizontal },
  ]

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

          {/* Navigation */}
          <nav className="relative z-10 flex flex-col gap-1 p-4 text-sm">
            <div className="mt-2 mb-2 px-2 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Navigate
            </div>

            {navItems.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-white/3 dark:hover:bg-white/3 hover:backdrop-blur-[1px] hover:shadow-[inset_0_0_0_0.4px_rgba(255,255,255,0.15)]
"
              >
                <Icon className="h-4 w-4 text-zinc-600 dark:text-zinc-200" />
                <span className="font-normal text-zinc-800 dark:text-zinc-100">
                  {label}
                </span>
              </Link>
            ))}

            {secondaryItems.length > 0 && (
              <>
                <div className="mt-4 mb-2 px-2 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  System
                </div>
                {secondaryItems.map(({ href, label, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-white/3 dark:hover:bg-white/3 hover:backdrop-blur-[1px] hover:shadow-[inset_0_0_0_0.4px_rgba(255,255,255,0.15)]
"
                  >
                    <Icon className="h-4 w-4 text-zinc-600 dark:text-zinc-200" />
                    <span className="font-normal text-zinc-800 dark:text-zinc-100">
                      {label}
                    </span>
                  </Link>
                ))}
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
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
