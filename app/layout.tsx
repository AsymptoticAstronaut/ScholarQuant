import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Header } from './header'
import { Footer } from './footer'
import { Sidebar } from './sidebar'
import { ThemeProvider } from 'next-themes'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
}

export const metadata: Metadata = {
  title: 'Yasser Noori | Profile',
  description: 'Yasser Noori\'s Personal website.',
}

const geist = Geist({ variable: '--font-geist', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} bg-white dark:bg-zinc-950`}>
        <ThemeProvider enableSystem attribute="class" storageKey="theme" defaultTheme="system">
          <div className="flex min-h-screen w-full font-[family-name:var(--font-inter-tight)]">
            {/* Sidebar (client) */}
            <Sidebar />

            {/* App root — Sidebar client will toggle `md:ml-64` on this element */}
            <div id="app-root" className="flex flex-col flex-1 transition-all duration-300 md:ml-64">
              <Header />
              <main className="pt-20 px-4 md:px-10">{children}</main>
              <Footer />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
