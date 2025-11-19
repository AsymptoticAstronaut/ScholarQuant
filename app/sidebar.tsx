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
  Github,
  Linkedin,
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
    { href: '/drafts', label: 'Draft Studio', Icon: FileText },
    { href: '/pattern-lab', label: 'Pattern Lab', Icon: Activity },
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
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200/30 px-4 py-4 dark:border-zinc-800/50">
          <div className="flex flex-col justify-center pl-2 pt-1">
            <p className="leading-tight font-medium text-zinc-900 dark:text-zinc-100">
              Console
            </p>
            <p className="leading-tight text-xs text-zinc-500 dark:text-zinc-400">
              By Frank Kocun & Yasser Noori
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
        <nav className="flex flex-col gap-1 p-4 text-sm">
          <div className="mt-2 mb-2 px-2 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Navigate
          </div>

          {navItems.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
                  className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
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

        {/* Connect Section */}
        <div className="px-4 pb-4">
          <div className="mt-4 mb-2 px-2 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Connect
          </div>

          <div className="flex flex-col gap-2">
            <a
              href={`mailto:${EMAIL}`}
              className="flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-zinc-600 dark:text-zinc-200" />
                <span className="text-sm font-normal text-zinc-800 dark:text-zinc-100">
                  Email
                </span>
              </div>
              <ExternalLink className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            </a>

            <a
              href={LINKEDIN}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <div className="flex items-center gap-3">
                <Linkedin className="h-4 w-4 text-zinc-600 dark:text-zinc-200" />
                <span className="text-sm font-normal text-zinc-800 dark:text-zinc-100">
                  LinkedIn
                </span>
              </div>
              <ExternalLink className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            </a>

            <a
              href={GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <div className="flex items-center gap-3">
                <Github className="h-4 w-4 text-zinc-600 dark:text-zinc-200" />
                <span className="text-sm font-normal text-zinc-800 dark:text-zinc-100">
                  GitHub
                </span>
              </div>
              <ExternalLink className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            </a>
          </div>
        </div>
      </aside>
    </>
  )
}
