'use client'

import { NebulaBackdrop } from '@/components/ui/nebula-backdrop'

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#050013] via-[#050010] to-black text-zinc-200">
      <NebulaBackdrop />
      <div className="relative z-10 flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900/70 px-4 py-2 shadow-lg shadow-black/40">
        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
        <span className="text-sm">Loading...</span>
      </div>
    </div>
  )
}
