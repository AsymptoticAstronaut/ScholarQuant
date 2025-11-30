"use client"

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sun, Moon, LogOut } from 'lucide-react'
import { useTheme } from 'next-themes'
import { signOut } from 'next-auth/react'

export function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [mounted, setMounted] = useState(false)
  const [showHeader, setShowHeader] = useState(false)

  useEffect(() => {
    setMounted(true)
    setShowHeader(true)
  }, [])

  // detect mobile viewport (client only)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const onChange = () => setIsMobile(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // derive page title
  const titleFromPath = (path?: string | null) => {
    if (!path || path === '/') return 'Dashboard'
    const parts = path.split('/').filter(Boolean)
    if (parts.length === 0) return 'Dashboard'
    const mapping: Record<string, string> = {
      home: 'Dashboard'
    }
    const top = parts[0]
    if (mapping[top]) {
      if (parts.length === 1) return mapping[top]
      const last = parts.slice(-1)[0]
      const human = last.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      return `${mapping[top]} — ${human}`
    }
    return parts.map((p) => p.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())).join(' / ')
  }
  const pageTitle = titleFromPath(pathname)

  // sync sidebar state from Sidebar events
  useEffect(() => {
    const onSidebarChange = (e: Event) => {
      const ev = e as CustomEvent<boolean>
      setSidebarOpen(Boolean(ev.detail))
    }
    window.addEventListener('sidebarChange', onSidebarChange as EventListener)

    const initial = document.getElementById('app-root')?.classList.contains('md:ml-64')
    if (typeof initial !== 'undefined') setSidebarOpen(Boolean(initial))

    return () => window.removeEventListener('sidebarChange', onSidebarChange as EventListener)
  }, [])

  const toggleSidebar = () => window.dispatchEvent(new CustomEvent('toggleSidebar'))

  // keyboard toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('toggleSidebar'))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  // header appearance: keep subtle translucent background; overlay will blur when open
  const leftOffsetClass = sidebarOpen ? 'md:left-64 left-0' : 'md:left-0 left-0'
  const bgClass = 'bg-white/30 dark:bg-zinc-950/30' // slightly more translucent to show blur
  const revealClass = showHeader ? 'translate-y-0' : '-translate-y-full pointer-events-none'

  return (
    <header
      // Added backdrop blur classes + inline styles for Safari & fallback
      style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      className={`fixed top-0 z-40 h-14 flex items-center transition-all duration-300 ${leftOffsetClass} right-0 ${bgClass} px-0 md:px-10 backdrop-blur-md ${revealClass}`}
    >
      {/* left-aligned: toggle + title */}
      <div className="flex items-center gap-3 pl-2">
        <button
          onClick={toggleSidebar}
          aria-expanded={sidebarOpen}
          aria-controls="sidebar"
          aria-label="Toggle sidebar"
          title="Toggle sidebar (or press Ctrl/Cmd+S)"
          className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 h-8 px-3 ml-0 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-panel-left"
            aria-hidden
          >
            <rect width="18" height="18" x="3" y="3" rx="2"></rect>
            <path d="M9 3v18"></path>
          </svg>
        </button>

        <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 leading-none">{pageTitle}</h1>

        <span className="ml-3 text-sm text-zinc-600 dark:text-zinc-300 hidden sm:inline-flex items-center">
          Click
          <kbd className="mx-2 px-1 rounded bg-zinc-100 dark:bg-zinc-800">Ctrl</kbd>+
          <kbd className="mx-2 px-1 rounded bg-zinc-100 dark:bg-zinc-800">S</kbd>
          to toggle sidebar
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2 pr-2">
        {mounted ? (
          <>
            <button
              onClick={toggleTheme}
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-zinc-100" /> : <Moon className="h-5 w-5 text-zinc-800" />}
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="hidden md:inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </>
        ) : (
          <div className="md:hidden h-5 w-5" aria-hidden />
        )}
      </div>
    </header>
  )
}
