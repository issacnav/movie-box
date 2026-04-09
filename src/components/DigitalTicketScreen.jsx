import { useId, useMemo } from 'react'
import { InteractiveCard } from './InteractiveCard'
import { TICKET_ASPECT_RATIO_CLASS, TICKET_MAX_WIDTH_CLASS } from '../constants/ticketLayout.js'
import { TicketSilhouetteDefs } from './TicketSilhouette.jsx'

/** Seeded PRNG for stable barcode per ticket. */
function seedFromString(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed) {
  return function next() {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Horizontal 1D-style barcode (decorative): vertical light bars, dark gaps — like cinema stubs.
 */
function BarcodeStrip({ ticketId }) {
  const bars = useMemo(() => {
    const rand = mulberry32(seedFromString(ticketId))
    const out = []
    let total = 0
    const maxW = 180
    while (total < maxW) {
      const w = 1 + Math.floor(rand() * 3)
      out.push(w)
      total += w + 1
    }
    return out
  }, [ticketId])

  return (
    <div
      className="flex w-full justify-center px-2"
      role="img"
      aria-label="Ticket barcode (illustration)"
    >
      <div className="flex h-[44px] max-w-[min(100%,200px)] items-stretch justify-center gap-px bg-[#0a0a0c] px-2 py-1">
        {bars.map((w, i) => (
          <span
            key={i}
            className="h-full shrink-0 rounded-[0.5px] bg-neutral-100"
            style={{ width: w }}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Tall poster (~80%), dark stub (~20%) with barcode; ticket silhouette via SVG mask.
 */
export default function DigitalTicketScreen({
  posterUrl,
  movie,
  whenLine,
  detailLine,
  ticketId,
  onDone,
}) {
  const rawId = useId()
  const maskId = `ticket-mask-${rawId.replace(/\W/g, '')}`

  return (
    <div
      className="ticket-fullscreen fixed inset-0 z-[70] flex min-h-[100dvh] flex-col items-center justify-center overflow-y-auto bg-black px-5 py-8"
      style={{
        paddingLeft: 'max(1.25rem, env(safe-area-inset-left))',
        paddingRight: 'max(1.25rem, env(safe-area-inset-right))',
        paddingTop: 'max(2rem, env(safe-area-inset-top))',
        paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
      }}
    >
      <div
        className={`relative w-full ${TICKET_MAX_WIDTH_CLASS}`}
        style={{
          filter: 'drop-shadow(0 22px 50px rgba(0,0,0,0.75))',
        }}
      >
        <TicketSilhouetteDefs maskId={maskId} />
        <InteractiveCard
          maskId={maskId}
          wrapperClassName="w-full"
          borderRadius="0"
          frameClassName="rounded-none border-0 shadow-none"
          InteractiveColor="rgba(245, 197, 24, 0.42)"
          tailwindBgClass="bg-transparent"
          rotationFactor={0.35}
        >
          <article
            className={`grid w-full grid-rows-[minmax(0,4fr)_minmax(0,1fr)] overflow-hidden bg-black ${TICKET_ASPECT_RATIO_CLASS}`}
          >
            <div className="relative min-h-0 min-w-0 overflow-hidden bg-[#1a0a0a]">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover object-top"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/80" />
              <div className="absolute inset-x-0 top-0 p-3 pb-1.5">
                <h1 className="text-[17px] font-bold leading-tight tracking-[-0.02em] text-white drop-shadow-md">
                  {movie?.title}
                </h1>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-3 pt-8">
                {whenLine ? (
                  <p className="text-[11px] font-medium text-white/78">{whenLine}</p>
                ) : null}
                {detailLine ? (
                  <p className="mt-0.5 text-[10px] font-medium text-white/52">{detailLine}</p>
                ) : null}
              </div>
            </div>

            <div className="flex min-h-[76px] flex-col items-center justify-center gap-1.5 border-t border-white/[0.06] bg-[#141416] px-2.5 py-2">
              <BarcodeStrip ticketId={ticketId} />
              <p className="font-mono text-[9px] tracking-wide text-[#6b6b70]">
                {ticketId.slice(0, 10).toUpperCase()}
              </p>
            </div>
          </article>
        </InteractiveCard>
      </div>

      <button
        type="button"
        onClick={onDone}
        className={`mt-8 h-[48px] w-full ${TICKET_MAX_WIDTH_CLASS} cursor-pointer rounded-full border-none bg-yellow text-[15px] font-semibold text-dark`}
        style={{
          boxShadow: '0 4px 20px -4px rgba(245,197,24,0.35), 0 1px 3px rgba(245,197,24,0.15)',
        }}
      >
        Done
      </button>
    </div>
  )
}
