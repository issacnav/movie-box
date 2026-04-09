import { Home, Clapperboard, Bookmark } from 'lucide-react'

/**
 * @param {'home' | 'theatre'} activeTab — Home = classic Now Showing; Theatre = ring browse screen.
 */
export default function BottomNav({ activeTab = 'home', onTabChange }) {
  return (
    <nav className="fixed bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 border-t border-white/5 bg-dark/95 backdrop-blur-md">
      <div className="flex items-center justify-around py-3 pb-7">
        <button
          type="button"
          aria-label="Home"
          aria-current={activeTab === 'home' ? 'page' : undefined}
          onClick={() => onTabChange?.('home')}
          className="flex cursor-pointer flex-col items-center gap-1 border-none bg-transparent"
        >
          <Home
            size={24}
            strokeWidth={1.5}
            className={activeTab === 'home' ? 'text-white' : 'text-gray-text'}
          />
        </button>
        <button
          type="button"
          aria-label="Theatre"
          aria-current={activeTab === 'theatre' ? 'page' : undefined}
          onClick={() => onTabChange?.('theatre')}
          className="flex cursor-pointer flex-col items-center gap-1 border-none bg-transparent"
        >
          <Clapperboard
            size={24}
            strokeWidth={1.5}
            className={activeTab === 'theatre' ? 'text-white' : 'text-gray-text'}
          />
        </button>
        <button
          type="button"
          aria-label="Saved"
          className="flex cursor-pointer flex-col items-center gap-1 border-none bg-transparent"
        >
          <Bookmark size={24} strokeWidth={1.5} className="text-gray-text" />
        </button>
      </div>
    </nav>
  )
}
