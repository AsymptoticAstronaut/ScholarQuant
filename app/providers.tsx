'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'

type ProvidersProps = {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider enableSystem attribute="class" storageKey="theme" defaultTheme="system">
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
}
