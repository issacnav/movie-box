import { Menu, Search } from 'lucide-react'

const iconBtn =
  'z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-white transition-[background-color,transform] duration-200 active:scale-[0.97]'

export default function TheatreTopNav({ onMenuPress, onSearchPress }) {
  return (
    <nav className="relative flex shrink-0 items-center justify-between px-4 pb-1 pt-[calc(0.5rem+env(safe-area-inset-top,0px))] sm:px-5 sm:pt-[calc(0.75rem+env(safe-area-inset-top,0px))]">
      <button
        type="button"
        aria-label="Menu"
        onClick={onMenuPress}
        className={`${iconBtn} hover:bg-white/[0.05] active:bg-white/[0.08]`}
      >
        <Menu size={21} strokeWidth={1.75} className="text-white/95" />
      </button>
      <h2 className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-[family-name:var(--font-display)] text-[16px] font-semibold tracking-[-0.02em] text-white">
        Theatre
      </h2>
      <button
        type="button"
        aria-label="Search"
        onClick={onSearchPress}
        className={`${iconBtn} hover:bg-white/[0.05] active:bg-white/[0.08]`}
      >
        <Search size={20} strokeWidth={1.75} className="text-white/95" />
      </button>
    </nav>
  )
}
