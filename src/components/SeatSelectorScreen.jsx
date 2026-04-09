import { useState, useMemo, useCallback, useEffect, useId, useRef } from 'react'
import { ArrowLeft, ChevronDown } from 'lucide-react'

/** Cinema screen art: outer frame + inner picture area (video clips to inner only) */
const SCREEN_OUTER_PATH =
  'M82 115 C220 82 360 60 504 58 C648 60 788 82 932 114 L886 260 C764 228 638 214 504 212 C370 214 244 228 125 260 Z'
const SCREEN_INNER_PATH =
  'M90 123 C228 90 364 68 504 66 C644 68 780 89 924 121 L881 252 C761 222 637 210 504 208 C371 210 247 223 130 255 Z'
const SCREEN_FRAME_FILL = '#2F3337'
const SCREEN_INNER_FILL = '#F3E6C9'
/** Full user space (clips & foreignObject still use this) */
const SCREEN_W = 1009
const SCREEN_H = 416
/**
 * Cropped viewBox: art only reaches ~y=260; 0–416 left a large empty band under the screen,
 * which stacked as a big gap before the reflection.
 */
const SCREEN_VIEWBOX = '52 44 906 242'
const screenViewBox = SCREEN_VIEWBOX

/** Theater-style rows: left block, center aisle, right block. Numbers = seat count per side. */
const THEATER_ROWS = [
  { row: 1, left: 3, right: 3 },
  { row: 2, left: 4, right: 4 },
  { row: 3, left: 4, right: 5 },
  { row: 4, left: 5, right: 5 },
  { row: 5, left: 5, right: 6 },
  { row: 6, left: 6, right: 6 },
  { row: 7, left: 5, right: 5 },
  { row: 8, left: 4, right: 5 },
]

/** Seat ids unavailable for demo (deterministic “taken” seats) */
const UNAVAILABLE_IDS = new Set([
  '1-L0',
  '2-R2',
  '3-L1',
  '3-L3',
  '4-R0',
  '4-R4',
  '5-L2',
  '5-R3',
  '6-L0',
  '7-R1',
  '8-L2',
  '8-R3',
])

const THEATER_FRAME_MAX_WIDTH = 360

function SeatSelectorHeader({ onBack }) {
  return (
    <header className="shrink-0 px-6 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
      <button
        type="button"
        onClick={onBack}
        className="-ml-1 mb-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-none bg-white/[0.06] p-0 backdrop-blur-sm transition-colors active:bg-white/[0.12]"
        aria-label="Go back"
      >
        <ArrowLeft size={20} className="text-white/90" strokeWidth={2.2} />
      </button>
      <h1 className="text-[28px] font-bold tracking-[-0.02em] text-white">Where to Sit?</h1>
      <p className="mt-0.5 text-[13px] font-medium tracking-wide uppercase text-white/40">Select Seats</p>
    </header>
  )
}

function SeatCell({ id, state, onToggle }) {
  const isSelected = state === 'selected'
  const isUnavailable = state === 'unavailable'
  const isAvailable = state === 'available'

  const stroke = isSelected ? '#F5C518' : isUnavailable ? '#1E1E22' : '#55555A'
  const fill = isSelected ? 'rgba(245, 197, 24, 0.22)' : isUnavailable ? '#111113' : '#28282C'
  const opacity = isUnavailable ? 0.32 : 1

  return (
    <button
      type="button"
      disabled={isUnavailable}
      onClick={() => isAvailable && onToggle(id)}
      className={`flex h-[22px] w-[18px] shrink-0 items-center justify-center border-none bg-transparent p-0 transition-all duration-200 ease-out ${
        isAvailable ? 'cursor-pointer active:scale-[0.85]' : 'cursor-default'
      }`}
      style={isSelected ? {
        filter: 'drop-shadow(0 0 6px rgba(245,197,24,0.5)) drop-shadow(0 0 12px rgba(245,197,24,0.2))',
      } : undefined}
      aria-pressed={isSelected}
      aria-label={isUnavailable ? 'Seat unavailable' : isSelected ? 'Seat selected' : 'Seat available'}
    >
      <svg width="18" height="22" viewBox="0 0 22 26" fill="none" aria-hidden style={{ opacity }}>
        <path
          d="M4 10.5C4 8.567 5.567 7 7.5 7H14.5C16.433 7 18 8.567 18 10.5V17.5C18 18.328 17.328 19 16.5 19H5.5C4.672 19 4 18.328 4 17.5V10.5Z"
          fill={fill}
          stroke={stroke}
          strokeWidth={isSelected ? '1.5' : '1.1'}
        />
        <path
          d="M6.5 7V5.8C6.5 4.806 7.306 4 8.3 4H13.7C14.694 4 15.5 4.806 15.5 5.8V7"
          stroke={stroke}
          strokeWidth={isSelected ? '1.5' : '1.1'}
          strokeLinecap="round"
        />
        <path d="M4 12.5H2.8C2.358 12.5 2 12.858 2 13.3V15.5C2 16.052 2.448 16.5 3 16.5H4" stroke={stroke} strokeWidth={isSelected ? '1.5' : '1.1'} />
        <path
          d="M18 12.5H19.2C19.642 12.5 20 12.858 20 13.3V15.5C20 16.052 19.552 16.5 19 16.5H18"
          stroke={stroke}
          strokeWidth={isSelected ? '1.5' : '1.1'}
        />
      </svg>
    </button>
  )
}

function SeatRow({ rowIndex, children }) {
  const curve = Math.sin((rowIndex + 0.5) * 0.5) * 3
  return (
    <div
      className="flex justify-center gap-[5px]"
      style={{ transform: `translateX(${curve}px)` }}
    >
      {children}
    </div>
  )
}

function SeatGrid({ layout, seatStates, onToggle }) {
  return (
    <div className="flex flex-col items-center gap-[5px]">
      {layout.map((def, i) => (
        <SeatRow key={def.row} rowIndex={i}>
          {Array.from({ length: def.left }, (_, j) => {
            const id = `${def.row}-L${j}`
            return <SeatCell key={id} id={id} state={seatStates.get(id)} onToggle={onToggle} />
          })}
          <div className="mx-[3px] w-[14px] shrink-0" aria-hidden />
          {Array.from({ length: def.right }, (_, j) => {
            const id = `${def.row}-R${j}`
            return <SeatCell key={id} id={id} state={seatStates.get(id)} onToggle={onToggle} />
          })}
        </SeatRow>
      ))}
    </div>
  )
}

function SeatsTogetherChip({ count }) {
  return (
    <button
      type="button"
      className="mx-auto flex min-w-[190px] cursor-pointer items-center justify-center gap-1.5 rounded-full border border-white/[0.07] bg-[#1C1C20] px-4 py-2.5 text-center text-[13px] font-medium tracking-wide text-white/90 transition-colors active:bg-[#28282C]"
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 3px rgba(0,0,0,0.3)' }}
    >
      {count} {count === 1 ? 'Seat' : 'Seats'} Together
      <ChevronDown size={14} className="ml-0.5 text-white/40" strokeWidth={2.2} />
    </button>
  )
}

function SeatHelperText() {
  return (
    <p className="text-center text-[11px] leading-snug tracking-wide text-white/35">
      Showing where you can sit together
    </p>
  )
}

function BottomCTA({ disabled, onContinue }) {
  return (
    <div className="shrink-0 px-6 pt-5 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <button
        type="button"
        disabled={disabled}
        onClick={disabled ? undefined : onContinue}
        className={`h-[52px] w-full rounded-full border-none text-[15px] font-semibold tracking-[-0.01em] transition-all duration-250 ease-out ${
          disabled
            ? 'cursor-not-allowed bg-[#1C1C20] text-white/20'
            : 'cursor-pointer bg-yellow text-dark active:scale-[0.98] active:brightness-95'
        }`}
        style={!disabled ? {
          boxShadow: '0 4px 20px -4px rgba(245,197,24,0.35), 0 1px 3px rgba(245,197,24,0.15)',
        } : undefined}
      >
        Continue
      </button>
    </div>
  )
}

/** Alpha mask: stronger at the top (near the screen), fades to invisible toward the floor */
const REFLECTION_MASK =
  'linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.55) 34%, rgba(0,0,0,0.18) 66%, transparent 100%)'
/** Overall reflection strength — keep within ~0.08–0.2 for a believable floor reflection */
const REFLECTION_OPACITY_VIDEO = 0.14
const REFLECTION_OPACITY_STATIC = 0.1

function CinemaScreenMedia({ videoUrl, title }) {
  const clipId = useId().replace(/:/g, '')
  const reflectClipId = useId().replace(/:/g, '')
  const innerGradId = useId().replace(/:/g, '')
  const frameShadowId = useId().replace(/:/g, '')
  const mainVideoRef = useRef(null)
  const reflectVideoRef = useRef(null)
  const [videoFailed, setVideoFailed] = useState(false)
  const showVideo = Boolean(videoUrl) && !videoFailed

  const syncReflectionTime = useCallback(() => {
    const main = mainVideoRef.current
    const reflect = reflectVideoRef.current
    if (!main || !reflect) return
    const delta = Math.abs(reflect.currentTime - main.currentTime)
    if (delta > 0.12) reflect.currentTime = main.currentTime
  }, [])

  useEffect(() => {
    if (!showVideo) return
    const main = mainVideoRef.current
    const reflect = reflectVideoRef.current
    if (!main || !reflect) return

    const mirrorPlayState = () => {
      if (main.paused) reflect.pause()
      else reflect.play().catch(() => {})
    }

    const onSeeked = () => {
      reflect.currentTime = main.currentTime
    }

    main.addEventListener('play', mirrorPlayState)
    main.addEventListener('pause', mirrorPlayState)
    main.addEventListener('seeked', onSeeked)
    main.addEventListener('timeupdate', syncReflectionTime)

    reflect.currentTime = main.currentTime
    if (!main.paused) reflect.play().catch(() => {})

    return () => {
      main.removeEventListener('play', mirrorPlayState)
      main.removeEventListener('pause', mirrorPlayState)
      main.removeEventListener('seeked', onSeeked)
      main.removeEventListener('timeupdate', syncReflectionTime)
    }
  }, [showVideo, syncReflectionTime, videoUrl])

  const videoStyle = {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    pointerEvents: 'none',
  }

  const foInnerStyle = {
    width: SCREEN_W,
    height: SCREEN_H,
    overflow: 'hidden',
    backgroundColor: '#0a0a0a',
  }

  return (
    <div
      className="flex w-full shrink-0 flex-col"
      role={title ? 'group' : undefined}
      aria-label={title ? `Screening: ${title}` : undefined}
      aria-hidden={title ? undefined : true}
    >
      <svg viewBox={screenViewBox} className="block h-auto w-full shrink-0">
        <defs>
          <filter
            id={frameShadowId}
            x="-8%"
            y="-8%"
            width="116%"
            height="116%"
            colorInterpolationFilters="sRGB"
          >
            <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000000" floodOpacity="0.38" />
          </filter>
          <linearGradient id={innerGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FAF3E3" />
            <stop offset="55%" stopColor="#F3E6C9" />
            <stop offset="100%" stopColor="#E5D4B0" />
          </linearGradient>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <path d={SCREEN_INNER_PATH} />
          </clipPath>
        </defs>
        <path d={SCREEN_OUTER_PATH} fill={SCREEN_FRAME_FILL} filter={`url(#${frameShadowId})`} />
        {showVideo ? (
          <>
            <foreignObject x="0" y="0" width={SCREEN_W} height={SCREEN_H} clipPath={`url(#${clipId})`}>
              <div xmlns="http://www.w3.org/1999/xhtml" style={foInnerStyle}>
                <video
                  ref={mainVideoRef}
                  src={videoUrl}
                  muted
                  playsInline
                  autoPlay
                  loop
                  preload="metadata"
                  style={videoStyle}
                  onError={() => setVideoFailed(true)}
                />
              </div>
            </foreignObject>
            <path
              d={SCREEN_INNER_PATH}
              fill="none"
              stroke="rgba(0,0,0,0.2)"
              strokeWidth="1.25"
              pointerEvents="none"
            />
          </>
        ) : (
          <path
            d={SCREEN_INNER_PATH}
            fill={`url(#${innerGradId})`}
            stroke="rgba(0,0,0,0.14)"
            strokeWidth="1"
          />
        )}
      </svg>

      <div
        className="pointer-events-none w-full shrink-0 overflow-hidden"
        style={{
          marginTop: '-4px',
          WebkitMaskImage: REFLECTION_MASK,
          maskImage: REFLECTION_MASK,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskSize: '100% 100%',
          maskSize: '100% 100%',
          opacity: showVideo ? REFLECTION_OPACITY_VIDEO : REFLECTION_OPACITY_STATIC,
        }}
        aria-hidden
      >
        <div className="w-full" style={{ filter: 'blur(1px)' }}>
          <svg
            viewBox={screenViewBox}
            preserveAspectRatio="xMidYMid meet"
            className="block h-auto w-full"
            style={{ transform: 'scaleY(-1)' }}
          >
          <defs>
            <clipPath id={reflectClipId} clipPathUnits="userSpaceOnUse">
              <path d={SCREEN_INNER_PATH} />
            </clipPath>
          </defs>
          {showVideo ? (
            <foreignObject x="0" y="0" width={SCREEN_W} height={SCREEN_H} clipPath={`url(#${reflectClipId})`}>
              <div xmlns="http://www.w3.org/1999/xhtml" style={foInnerStyle}>
                <video
                  ref={reflectVideoRef}
                  src={videoUrl}
                  muted
                  playsInline
                  autoPlay
                  loop
                  preload="metadata"
                  style={videoStyle}
                  tabIndex={-1}
                />
              </div>
            </foreignObject>
          ) : (
            <path d={SCREEN_INNER_PATH} fill={SCREEN_INNER_FILL} fillOpacity={0.35} />
          )}
          </svg>
        </div>
      </div>
    </div>
  )
}

function SeatMapSection({ layout, seatStates, onToggle }) {
  return (
    <div className="relative mx-auto w-full min-w-0 shrink-0 px-6">
      <div
        className="relative mx-auto flex w-full flex-col items-center"
        style={{ maxWidth: `${THEATER_FRAME_MAX_WIDTH}px`, perspective: '500px' }}
      >
        <div
          className="w-full pt-0"
          style={{
            transform: 'perspective(550px) rotateX(10deg) scale(0.96)',
            transformOrigin: '50% 0%',
          }}
        >
          <div className="flex justify-center">
            <SeatGrid layout={layout} seatStates={seatStates} onToggle={onToggle} />
          </div>
        </div>
      </div>
    </div>
  )
}

/** Build initial seat id list + unavailable from layout */
function buildSeatModel(layout) {
  const ids = []
  for (const def of layout) {
    for (let j = 0; j < def.left; j++) ids.push(`${def.row}-L${j}`)
    for (let j = 0; j < def.right; j++) ids.push(`${def.row}-R${j}`)
  }
  return ids
}

export default function SeatSelectorScreen({
  movie,
  ticketQty,
  onBack,
  onContinue,
  active,
}) {
  const layout = THEATER_ROWS
  const allIds = useMemo(() => buildSeatModel(layout), [layout])

  const [selected, setSelected] = useState(() => new Set())

  const seatStates = useMemo(() => {
    const map = new Map()
    for (const id of allIds) {
      if (UNAVAILABLE_IDS.has(id)) map.set(id, 'unavailable')
      else if (selected.has(id)) map.set(id, 'selected')
      else map.set(id, 'available')
    }
    return map
  }, [allIds, selected])

  const toggle = useCallback(
    (id) => {
      if (UNAVAILABLE_IDS.has(id)) return
      setSelected((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else if (next.size < ticketQty) next.add(id)
        return next
      })
    },
    [ticketQty],
  )

  const selectedCount = selected.size
  const canContinue = selectedCount === ticketQty && ticketQty > 0

  const overlayRow = useMemo(() => {
    if (selectedCount === 0) return null
    let minRow = 999
    for (const id of selected) {
      const row = Number.parseInt(id.split('-')[0], 10)
      if (!Number.isNaN(row)) minRow = Math.min(minRow, row)
    }
    return minRow === 999 ? null : String(minRow)
  }, [selected, selectedCount])

  useEffect(() => {
    if (!active) return
    const html = document.documentElement
    const body = document.body
    const root = document.getElementById('root')
    const prevHtml = html.style.overflow
    const prevBody = body.style.overflow
    const prevRoot = root?.style.overflow ?? ''
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    if (root) root.style.overflow = 'hidden'
    return () => {
      html.style.overflow = prevHtml
      body.style.overflow = prevBody
      if (root) root.style.overflow = prevRoot
    }
  }, [active])

  const handleContinue = useCallback(() => {
    if (!canContinue) return
    const parse = (id) => {
      const m = id.match(/^(\d+)-([LR])(\d+)$/)
      if (!m) return { row: 0, side: 'L', idx: 0 }
      return { row: Number(m[1]), side: m[2], idx: Number(m[3]) }
    }
    const sorted = [...selected].sort((a, b) => {
      const pa = parse(a)
      const pb = parse(b)
      if (pa.row !== pb.row) return pa.row - pb.row
      if (pa.side !== pb.side) return pa.side === 'L' ? -1 : 1
      return pa.idx - pb.idx
    })
    onContinue?.({ seatIds: sorted, summary: `Row ${overlayRow} · ${selectedCount} seats` })
  }, [canContinue, selected, onContinue, overlayRow, selectedCount])

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-[#050506]">
      <SeatSelectorHeader onBack={onBack} />

      <div className="relative flex min-h-0 flex-1 overflow-y-auto hide-scrollbar">
        <div className="flex min-h-full w-full flex-col justify-center gap-5 py-4">
          <div
            className="mx-auto w-full shrink-0 px-6"
            style={{ maxWidth: `${THEATER_FRAME_MAX_WIDTH}px` }}
          >
            <CinemaScreenMedia videoUrl={movie?.previewVideoUrl} title={movie?.title} />
          </div>

          <SeatMapSection layout={layout} seatStates={seatStates} onToggle={toggle} />

          <div className="mt-4 flex shrink-0 flex-col items-center gap-3 px-6">
            <SeatsTogetherChip count={ticketQty} />
            <SeatHelperText />
          </div>
        </div>
      </div>

      <BottomCTA disabled={!canContinue} onContinue={handleContinue} />
    </div>
  )
}
