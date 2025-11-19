'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Sun,
  Moon,
  Briefcase,
  LayoutGrid,
  Mail,
  Github,
  Linkedin,
  FileText,
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
    { href: '/', label: 'Summary', Icon: FileText },
    { href: '/portfolio', label: 'Portfolio', Icon: LayoutGrid },
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
        className={`fixed inset-y-0 left-0 z-50 transform bg-white/80 dark:bg-zinc-950/80 border-r border-zinc-200/30 dark:border-zinc-800/50 transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        } w-[72vw] md:w-64`}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-200/30 dark:border-zinc-800/50">
          <div className="flex flex-col justify-center pl-2 pt-1">
            <p className="font-medium text-zinc-900 dark:text-zinc-100 leading-tight">
              Yasser Noori
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight">
              CS & Econ @ UofT
            </p>
          </div>

          {mounted ? (
            <button
              onClick={toggleTheme}
              className="hidden md:inline-flex p-2 rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-4 w-4 text-zinc-200" />
              ) : (
                <Moon className="h-4 w-4 text-zinc-800" />
              )}
            </button>
          ) : (
            <div className="hidden md:inline-flex h-4 w-4" aria-hidden />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-4 text-sm">
          <div className="mt-4 mb-2 px-2 text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Navigate
          </div>
          {navItems.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Icon className="h-4 w-4 text-zinc-600 dark:text-zinc-200" />
              <span className="font-normal text-zinc-800 dark:text-zinc-100">
                {label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Connect Section */}
        <div className="px-4">
          <div className="mt-4 mb-2 px-2 text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Connect
          </div>

          <div className="flex flex-col gap-2">
            <a
              href={`mailto:${EMAIL}`}
              className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-zinc-600 dark:text-zinc-200" />
                <span className="font-normal text-zinc-800 dark:text-zinc-100 text-sm">
                  Email
                </span>
              </div>
              <ExternalLink className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            </a>

            <a
              href={LINKEDIN}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Linkedin className="h-4 w-4 text-zinc-600 dark:text-zinc-200" />
                <span className="font-normal text-zinc-800 dark:text-zinc-100 text-sm">
                  LinkedIn
                </span>
              </div>
              <ExternalLink className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            </a>

            <a
              href={GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Github className="h-4 w-4 text-zinc-600 dark:text-zinc-200" />
                <span className="font-normal text-zinc-800 dark:text-zinc-100 text-sm">
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
