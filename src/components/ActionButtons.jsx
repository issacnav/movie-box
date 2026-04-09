import { Play } from 'lucide-react'

export default function ActionButtons({ onBuyTickets, trailerUrl, compact = false }) {
  const hasTrailer = Boolean(trailerUrl)

  const handlePlayTrailer = () => {
    if (!trailerUrl) return
    window.open(trailerUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className={`flex items-center justify-center gap-3 ${compact ? 'mt-4' : 'mt-8'}`}>
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
        disabled={!hasTrailer}
        className={`flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full transition-colors ${
          hasTrailer
            ? 'cursor-pointer bg-dark-surface hover:bg-dark-surface/80'
            : 'cursor-not-allowed bg-dark-surface/40 opacity-45'
        }`}
        aria-label={hasTrailer ? 'Play trailer' : 'Trailer not available'}
      >
        <Play size={18} className="ml-0.5 text-white" fill="white" strokeWidth={0} />
      </button>
    </div>
  )
}
