'use client'
import { TextLoop } from '@/components/ui/text-loop'

export function Footer() {
  return (
    <footer className="mt-24 border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <a href="https://github.com/AsymptoticAstronaut" target="_blank">
          <TextLoop className="text-xs text-zinc-500">
            <span>© 2025 Frank Kocun & Yasser Noori.</span>
            <span>Built with passion.</span>
          </TextLoop>
        </a>
      </div>
    </footer>
  )
}
