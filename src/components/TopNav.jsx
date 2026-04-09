import { ChevronDown } from 'lucide-react'

export default function TopNav() {
  return (
    <nav className="flex items-center justify-between px-6 pt-3 pb-4">
      <div className="flex items-center gap-1.5">
        <span className="text-[22px] font-semibold tracking-tight text-white">
          Now Showing
        </span>
        <ChevronDown size={18} className="mt-0.5 text-white" strokeWidth={2.5} />
      </div>

      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500">
        <div className="h-3 w-3 rounded-full bg-white/90" />
      </div>
    </nav>
  )
}
