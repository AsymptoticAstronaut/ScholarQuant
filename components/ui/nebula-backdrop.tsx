export function NebulaBackdrop({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 opacity-70 ${className}`}>
      <div className="absolute -left-24 top-0 h-64 w-64 rounded-full bg-purple-700/40 blur-3xl" />
      <div className="absolute right-[-40px] top-6 h-72 w-72 rounded-full bg-fuchsia-500/35 blur-3xl" />
      <div className="absolute bottom-[-40px] left-1/3 h-72 w-72 rounded-full bg-indigo-500/28 blur-3xl" />
      <div className="absolute bottom-10 right-16 h-52 w-52 rounded-full bg-sky-500/18 blur-3xl" />
    </div>
  )
}

