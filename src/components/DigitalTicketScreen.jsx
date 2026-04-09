import { useId, useMemo } from 'react'
import { motion } from 'framer-motion'
import { InteractiveCard } from './InteractiveCard'
import { TICKET_ASPECT_RATIO_CLASS, TICKET_MAX_WIDTH_CLASS } from '../constants/ticketLayout.js'
import { TicketSilhouetteDefs } from './TicketSilhouette.jsx'

const MotionDiv = motion.div

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
function BarcodeStrip({ ticketId, className = '' }) {
  const bars = useMemo(() => {
    const rand = mulberry32(seedFromString(ticketId))
    const out = []
    let total = 0
    const maxW = 168
    while (total < maxW) {
      const w = 1 + Math.floor(rand() * 3)
      out.push(w)
      total += w + 1
    }
    return out
  }, [ticketId])

  return (
    <div
      className={`flex w-full justify-center ${className}`}
      role="img"
      aria-label="Ticket barcode (illustration)"
    >
      <div className="flex h-[32px] w-full max-w-[200px] items-stretch justify-center gap-px px-1 py-0.5">
        {bars.map((w, i) => (
          <span
            key={i}
            className="h-full shrink-0 rounded-[0.5px] bg-neutral-100/78"
            style={{ width: w }}
          />
        ))}
      </div>
    </div>
  )
}

function formatTicketCode(id) {
  const s = String(id ?? '')
    .replace(/\W/g, '')
    .toUpperCase()
    .slice(0, 12)
  if (!s) return '—'
  return s.replace(/(.{4})/g, '$1 ').trim()
}

/**
 * Designed artifact: composed hero artwork, metadata strip, structured stub/footer — SVG mask silhouette.
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

  const ticketEntrance = useMemo(() => {
    if (typeof window === 'undefined') {
      return { initial: false, transition: { duration: 0 } }
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      return { initial: false, transition: { duration: 0 } }
    }
    return {
      /** Clear read after loader unmounts: hold a beat, then ~0.5s fade + slower spring scale. */
      initial: { scale: 0.84, opacity: 0.25 },
      transition: {
        delay: 0.08,
        opacity: {
          duration: 0.52,
          ease: [0.22, 1, 0.36, 1],
        },
        scale: {
          type: 'spring',
          stiffness: 82,
          damping: 15,
          mass: 1.05,
        },
      },
    }
  }, [])

  return (
    <div
      className="ticket-fullscreen fixed inset-0 z-[70] flex h-[100dvh] max-h-[100dvh] min-h-0 w-full min-w-0 flex-col items-center justify-center overflow-x-hidden overflow-y-auto overscroll-y-contain bg-black py-5 sm:py-8"
      style={{
        paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))',
        paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
        boxSizing: 'border-box',
      }}
    >
      <MotionDiv
        className={`flex w-full flex-col items-stretch ${TICKET_MAX_WIDTH_CLASS}`}
        initial={ticketEntrance.initial}
        animate={{ scale: 1, opacity: 1 }}
        transition={ticketEntrance.transition}
        style={{ transformOrigin: '50% 45%' }}
      >
      <div
        className="relative w-full"
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
            className={`relative isolate grid w-full min-h-0 grid-rows-[minmax(0,1fr)_auto_minmax(128px,auto)] overflow-hidden bg-[#060607] ${TICKET_ASPECT_RATIO_CLASS}`}
            style={{
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.055), inset 0 -1px 0 rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.038), inset 0 0 88px rgba(0,0,0,0.2)',
            }}
          >
            {/* Continuous lower tonal field: softens the hero → info → footer read */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[58%]"
              style={{
                background:
                  'linear-gradient(180deg, transparent 0%, rgba(4,4,6,0.08) 14%, rgba(4,4,6,0.22) 26%, rgba(6,7,10,0.48) 44%, rgba(7,8,11,0.72) 62%, rgba(8,9,12,0.9) 82%, rgba(8,9,12,0.98) 100%)',
              }}
              aria-hidden
            />
            {/* Object read: edge falloff + crown highlight (restrained) */}
            <div
              className="pointer-events-none absolute inset-0 z-[3]"
              style={{
                background:
                  'linear-gradient(90deg, rgba(0,0,0,0.32) 0%, transparent 10%, transparent 90%, rgba(0,0,0,0.32) 100%), linear-gradient(180deg, rgba(255,255,255,0.042) 0%, rgba(255,255,255,0.01) 20%, transparent 45%, rgba(0,0,0,0.08) 100%)',
              }}
              aria-hidden
            />

            {/* Hero: artwork composed for the ticket (crop / scale), not full-bleed poster insert */}
            <div className="relative z-[1] min-h-0 min-w-0 overflow-hidden bg-[#120808]">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt=""
                  className="absolute left-1/2 top-[46%] h-[118%] w-[108%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover object-[center_20%]"
                />
              ) : null}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.06) 28%, rgba(0,0,0,0.03) 48%, rgba(0,0,0,0.18) 58%, rgba(0,0,0,0.38) 72%, rgba(0,0,0,0.62) 88%, rgba(0,0,0,0.72) 100%)',
                }}
                aria-hidden
              />
              {/* Title: typographic only — legibility from shadow + hero fade, no inset panel */}
              <div className="absolute inset-x-0 bottom-0 z-[1] px-4 pb-4 pt-20">
                <p className="text-[7px] font-medium uppercase tracking-[0.3em] text-white/44 [text-shadow:0_1px_3px_rgba(0,0,0,0.9),0_0_18px_rgba(0,0,0,0.55)]">
                  Admit one
                </p>
                <h1 className="mt-2 max-w-[98%] text-[17px] font-semibold leading-[1.1] tracking-[-0.03em] text-white [text-shadow:0_2px_32px_rgba(0,0,0,0.82),0_1px_3px_rgba(0,0,0,0.65)]">
                  {movie?.title}
                </h1>
              </div>
            </div>

            {/* Information break: feathered into hero + footer for one continuous read */}
            <div
              className="relative z-[2] min-h-[40px] border-t border-white/[0.028] px-4 py-3.5"
              style={{
                background:
                  'linear-gradient(180deg, rgba(5,6,9,0.28) 0%, rgba(6,7,10,0.58) 38%, rgba(7,8,11,0.82) 100%)',
              }}
            >
              {whenLine ? (
                <p className="text-[11px] font-medium leading-snug tracking-[-0.012em] text-white/92 [text-shadow:0_1px_10px_rgba(0,0,0,0.45)]">
                  {whenLine}
                </p>
              ) : null}
              {detailLine ? (
                <p className="mt-2 text-[10px] font-medium leading-snug tracking-[-0.01em] text-white/56 [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]">
                  {detailLine}
                </p>
              ) : null}
            </div>

            {/* Stub / barcode: calmer footer, barcode woven in — not a dropped-in module */}
            <div
              className="relative z-[2] flex min-h-0 flex-col border-t border-white/[0.028] px-4 pb-5 pt-4"
              style={{
                background:
                  'linear-gradient(180deg, rgba(7,8,11,0.42) 0%, rgba(8,9,13,0.78) 32%, rgba(9,10,14,0.95) 68%, #0a0b10 100%)',
              }}
            >
              <div
                className="pointer-events-none absolute left-[9%] right-[9%] top-0 h-px -translate-y-px opacity-90"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 14%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.06) 86%, transparent 100%)',
                }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute left-[12%] right-[12%] top-0 h-[3px] -translate-y-[5px] opacity-[0.28]"
                style={{
                  background:
                    'repeating-linear-gradient(90deg, transparent 0px, transparent 5px, rgba(255,255,255,0.06) 5px, rgba(255,255,255,0.06) 6px)',
                }}
                aria-hidden
              />

              <div className="mb-4 flex items-baseline justify-between gap-3">
                <span className="text-[7px] font-medium uppercase tracking-[0.22em] text-white/42">
                  Scan at entry
                </span>
                <span className="text-[7px] font-medium uppercase tracking-[0.18em] text-white/34">
                  E-ticket
                </span>
              </div>

              <div
                className="rounded-[2px] py-4"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.038) 0%, rgba(255,255,255,0.022) 50%, transparent 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.055)',
                }}
              >
                <div
                  className="mx-1 h-px opacity-75"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.09) 20%, rgba(255,255,255,0.09) 80%, transparent 100%)',
                  }}
                  aria-hidden
                />
                <BarcodeStrip ticketId={ticketId} className="pt-3.5" />
                <div
                  className="mx-1 mt-3.5 h-px opacity-55"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 25%, rgba(255,255,255,0.07) 75%, transparent 100%)',
                  }}
                  aria-hidden
                />
              </div>

              <div className="mt-5 flex flex-col items-center gap-1.5">
                <span className="text-[7px] font-medium uppercase tracking-[0.2em] text-white/38">
                  Confirmation
                </span>
                <p className="font-mono text-[9.5px] font-medium tracking-[0.15em] text-white/52">
                  {formatTicketCode(ticketId)}
                </p>
              </div>
            </div>
          </article>
        </InteractiveCard>
      </div>

      <button
        type="button"
        onClick={onDone}
        className="mt-5 h-[46px] w-full min-w-0 cursor-pointer rounded-full border-none bg-yellow text-[14px] font-semibold text-dark sm:mt-8 sm:h-[48px] sm:text-[15px]"
        style={{
          boxShadow: '0 4px 20px -4px rgba(245,197,24,0.35), 0 1px 3px rgba(245,197,24,0.15)',
        }}
      >
        Done
      </button>
      </MotionDiv>
    </div>
  )
}
