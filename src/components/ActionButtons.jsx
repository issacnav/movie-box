import { Play } from 'lucide-react'

export default function ActionButtons({ onBuyTickets, trailerUrl, compact = false }) {
  const hasTrailer = Boolean(trailerUrl)

  const rowGap = compact ? 'gap-2 sm:gap-2.5' : 'gap-2.5 sm:gap-3'
  const rowMt = compact ? 'mt-2.5 sm:mt-3' : 'mt-5 sm:mt-8'

  const primaryClass = compact
    ? 'h-[44px] min-w-0 shrink px-6 text-[13px] shadow-[0_6px_28px_-8px_rgba(232,176,15,0.55),0_1px_0_rgba(255,255,255,0.22)_inset] sm:h-[46px] sm:min-w-[148px] sm:px-9 sm:text-[14px] rounded-full bg-yellow-button font-semibold tracking-[-0.01em] text-black transition-[background-color,transform,box-shadow] duration-200 hover:bg-yellow active:scale-[0.98]'
    : 'h-[46px] min-w-0 max-w-full shrink px-7 text-[14px] sm:h-[48px] sm:px-10 sm:text-[15px] rounded-full bg-yellow-button font-semibold tracking-tight text-black shadow-[0_6px_32px_-10px_rgba(232,176,15,0.5)] transition-[background-color,transform] duration-200 hover:bg-yellow active:scale-[0.98]'

  const playBase =
    'flex shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.06] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-[background-color,border-color,transform,box-shadow] duration-200 active:scale-[0.97]'
  const playSize = compact ? 'h-[44px] w-[44px] sm:h-[46px] sm:w-[46px]' : 'h-[46px] w-[46px] sm:h-[48px] sm:w-[48px]'

  return (
    <div className={`flex w-full min-w-0 flex-nowrap items-center justify-center ${rowGap} ${rowMt} px-1`}>
      <button
        type="button"
        onClick={onBuyTickets}
        className={`cursor-pointer border-none ${primaryClass}`}
      >
        Buy Tickets
      </button>

      {hasTrailer ? (
        <a
          href={trailerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${playBase} ${playSize} hover:border-white/[0.16] hover:bg-white/[0.1]`}
          aria-label="Open official trailer in a new tab"
        >
          <Play size={compact ? 17 : 18} className="ml-0.5 text-white" fill="currentColor" strokeWidth={0} />
        </a>
      ) : (
        <button
          type="button"
          disabled
          className={`${playBase} ${playSize} cursor-not-allowed border-white/[0.06] bg-white/[0.03] opacity-40`}
          aria-label="Trailer not available"
        >
          <Play size={compact ? 17 : 18} className="ml-0.5 text-white" fill="currentColor" strokeWidth={0} />
        </button>
      )}
    </div>
  )
}
