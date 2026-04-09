import { Menu, Search } from 'lucide-react'

export default function TheatreTopNav({ onMenuPress, onSearchPress }) {
  return (
    <nav className="relative flex items-center justify-between px-5 pt-4 pb-2">
      <button
        type="button"
        aria-label="Menu"
        onClick={onMenuPress}
        className="z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-white hover:bg-white/[0.06] active:bg-white/[0.08]"
      >
        <Menu size={22} strokeWidth={2} />
      </button>
      <h2 className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pt-1 font-[family-name:var(--font-display)] text-[17px] font-semibold tracking-tight text-white">
        Theatre
      </h2>
      <button
        type="button"
        aria-label="Search"
        onClick={onSearchPress}
        className="z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-white hover:bg-white/[0.06] active:bg-white/[0.08]"
      >
        <Search size={21} strokeWidth={2} />
      </button>
    </nav>
  )
}
