'use client'

function NebulaBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-70">
      <div className="absolute -left-24 top-0 h-64 w-64 rounded-full bg-purple-700/40 blur-3xl" />
      <div className="absolute right-[-40px] top-6 h-72 w-72 rounded-full bg-fuchsia-500/35 blur-3xl" />
      <div className="absolute bottom-[-40px] left-1/3 h-72 w-72 rounded-full bg-indigo-500/28 blur-3xl" />
      <div className="absolute bottom-10 right-16 h-52 w-52 rounded-full bg-sky-500/18 blur-3xl" />
    </div>
  )
}

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
