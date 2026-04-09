import { Play } from 'lucide-react'

export default function ActionButtons({ onBuyTickets, trailerUrl }) {
  const handlePlayTrailer = () => {
    if (!trailerUrl) return
    window.open(trailerUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      {/* Buy Tickets */}
      <button
        onClick={onBuyTickets}
        className="h-[48px] px-10 bg-yellow-button hover:bg-yellow transition-colors rounded-full text-black text-[15px] font-semibold tracking-tight cursor-pointer"
      >
        Buy Tickets
      </button>

      {/* Play Trailer */}
      <button
        type="button"
        onClick={handlePlayTrailer}
        className="w-[48px] h-[48px] shrink-0 rounded-full bg-dark-surface hover:bg-dark-surface/80 transition-colors flex items-center justify-center cursor-pointer"
        aria-label="Play trailer"
      >
        <Play size={18} className="text-white ml-0.5" fill="white" strokeWidth={0} />
      </button>
    </div>
  )
}
