import { ChevronDown } from 'lucide-react'

export default function TopNav() {
  return (
    <nav className="flex items-center justify-between px-6 pt-3 pb-4">
      <div className="flex items-center gap-1.5">
        <span className="text-[22px] font-semibold tracking-tight text-white">
          Now Showing
        </span>
        <ChevronDown size={18} className="text-white mt-0.5" strokeWidth={2.5} />
      </div>

      {/* Profile icon */}
      <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-white/90" />
      </div>
    </nav>
  )
}
