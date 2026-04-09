import { useId } from 'react'
import { TICKET_ASPECT_RATIO_CLASS, TICKET_MAX_WIDTH_CLASS } from '../constants/ticketLayout.js'
import { TicketSilhouetteDefs, ticketSilhouetteMaskStyle } from './TicketSilhouette.jsx'

/**
 * Post-pay loading: same ticket SVG mask + footprint as `DigitalTicketScreen` (no layout jump).
 * Layered: base + depth + footer/stub zone + dot matrix + masked “wake” pass + dual atmospheric wave.
 */
export default function TicketGeneratingScreen() {
  const rawId = useId()
  const safe = rawId.replace(/\W/g, '')
  const maskId = `ticket-mask-${safe}`
  const patternBaseId = `ticket-dot-base-${safe}`
  const patternWakeId = `ticket-dot-wake-${safe}`
  const maskStyle = ticketSilhouetteMaskStyle(maskId)

  return (
    <div
      className="ticket-fullscreen fixed inset-0 z-[70] flex h-[100dvh] max-h-[100dvh] min-h-0 w-full min-w-0 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain bg-black py-5 sm:py-8"
      style={{
        paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))',
        paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
        boxSizing: 'border-box',
      }}
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center">
        <div
          className={`relative w-full ${TICKET_MAX_WIDTH_CLASS}`}
          style={{
            filter:
              'drop-shadow(0 0 1px rgba(255,255,255,0.14)) drop-shadow(0 0 2px rgba(255,255,255,0.06)) drop-shadow(0 22px 52px rgba(0,0,0,0.88))',
          }}
        >
          <TicketSilhouetteDefs maskId={maskId} />
          <div
            className={`relative w-full overflow-hidden bg-[#0A0A10] ${TICKET_ASPECT_RATIO_CLASS}`}
            style={{
              ...maskStyle,
              boxShadow:
                'inset 0 1.5px 0 rgba(255,255,255,0.085), inset 0 -1px 0 rgba(0,0,0,0.55), inset 0 0 80px rgba(0,0,0,0.42), inset 0 -48px 64px rgba(0,0,0,0.35)',
            }}
          >
            {/* Lateral falloff: reads as a single thick object vs flat rect */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, rgba(0,0,0,0.42) 0%, transparent 11%, transparent 89%, rgba(0,0,0,0.42) 100%)',
              }}
              aria-hidden
            />

            {/* Main-field ambient (brighter crown, darker toward stub) */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.012) 22%, transparent 48%, rgba(0,0,0,0.22) 72%, rgba(0,0,0,0.38) 100%)',
              }}
              aria-hidden
            />

            {/* Stub / barcode zone: separate tonal block (aligns ~footer start on DigitalTicketScreen) */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0"
              style={{
                top: '78%',
                background:
                  'linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(12,13,18,0.92) 22%, #0D0E14 72%, #0B0C11 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.055)',
              }}
              aria-hidden
            />

            {/* Perforation / tear hint above stub */}
            <div
              className="pointer-events-none absolute left-[10%] right-[10%] h-px"
              style={{
                top: '78%',
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 15%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.08) 85%, transparent 100%)',
              }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute left-[14%] right-[14%]"
              style={{
                top: 'calc(78% - 2px)',
                height: '3px',
                background:
                  'repeating-linear-gradient(90deg, transparent 0px, transparent 5px, rgba(255,255,255,0.06) 5px, rgba(255,255,255,0.06) 6px)',
                opacity: 0.45,
              }}
              aria-hidden
            />

            {/* Dot matrix — base (quiet); wake layer follows wave via CSS mask */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.38]"
              aria-hidden
            >
              <defs>
                <pattern
                  id={patternBaseId}
                  width="4"
                  height="4"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="1.15" cy="1.15" r="0.45" fill="rgba(255,255,255,0.1)" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#${patternBaseId})`} />
            </svg>

            <div className="ticket-loader-dot-reveal-mask pointer-events-none absolute inset-0" aria-hidden>
              <svg className="h-full w-full opacity-[0.72]" aria-hidden>
                <defs>
                  <pattern
                    id={patternWakeId}
                    width="4"
                    height="4"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="1.15" cy="1.15" r="0.48" fill="rgba(255,255,255,0.2)" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#${patternWakeId})`} />
              </svg>
            </div>

            {/* Dual wave: wide haze + brighter core — same sweep, different blur/breathe */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
              <div
                className="ticket-loader-wave-haze absolute left-[-16%] w-[132%]"
                style={{
                  top: 0,
                  height: '58%',
                  background:
                    'linear-gradient(180deg, transparent 0%, rgba(180,190,255,0.035) 28%, rgba(220,225,240,0.055) 50%, rgba(180,190,255,0.03) 72%, transparent 100%)',
                  filter: 'blur(32px)',
                  mixBlendMode: 'plus-lighter',
                }}
              />
              <div
                className="ticket-loader-wave-core absolute left-[-14%] w-[128%]"
                style={{
                  top: 0,
                  height: '32%',
                  background:
                    'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.02) 22%, rgba(255,255,255,0.095) 48%, rgba(255,255,255,0.03) 76%, transparent 100%)',
                  filter: 'blur(13px)',
                  mixBlendMode: 'plus-lighter',
                }}
              />
            </div>

            {/* Barcode strip — structure only, very low contrast */}
            <div
              className="pointer-events-none absolute left-[14%] right-[14%]"
              style={{
                bottom: '5.5%',
                height: '14px',
                opacity: 0.14,
                backgroundImage:
                  'repeating-linear-gradient(90deg, rgba(255,255,255,0.85) 0px, rgba(255,255,255,0.85) 1px, transparent 1px, transparent 3px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,0.5) 4px, transparent 4px, transparent 7px)',
              }}
              aria-hidden
            />

            {/* Outer rim read */}
            <div
              className="pointer-events-none absolute inset-0 rounded-[inherit]"
              style={{
                boxShadow:
                  'inset 0 0 0 1px rgba(255,255,255,0.055), inset 0 2px 24px rgba(255,255,255,0.02)',
              }}
              aria-hidden
            />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 justify-center pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]">
        <div className="inline-flex max-w-[min(100%,calc(100vw-2rem))] items-center gap-2 rounded-full bg-[#1A1A1E] px-4 py-2.5 sm:gap-3 sm:px-5 sm:py-3">
          <span className="text-[13px] font-medium text-white/90 sm:text-[15px]">Generating your ticket</span>
          <span className="flex items-center gap-1.5" aria-hidden>
            <span className="ticket-generating-pulse-dot h-1 w-1 rounded-full bg-white/50" />
            <span className="ticket-generating-pulse-dot h-1 w-1 rounded-full bg-white/50" />
            <span className="ticket-generating-pulse-dot h-1 w-1 rounded-full bg-white/50" />
          </span>
        </div>
      </div>
    </div>
  )
}
