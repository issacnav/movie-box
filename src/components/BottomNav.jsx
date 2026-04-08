import { Home, Search, Bookmark } from 'lucide-react'

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-dark/95 backdrop-blur-md border-t border-white/5">
      <div className="flex items-center justify-around py-3 pb-7">
        <button className="flex flex-col items-center gap-1 cursor-pointer bg-transparent border-none">
          <Home size={24} className="text-white" strokeWidth={1.5} />
        </button>
        <button className="flex flex-col items-center gap-1 cursor-pointer bg-transparent border-none">
          <Search size={24} className="text-gray-text" strokeWidth={1.5} />
        </button>
        <button className="flex flex-col items-center gap-1 cursor-pointer bg-transparent border-none">
          <Bookmark size={24} className="text-gray-text" strokeWidth={1.5} />
        </button>
      </div>
    </nav>
  )
}
