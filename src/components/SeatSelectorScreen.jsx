import { useState, useMemo, useCallback, useEffect } from 'react'
import { ArrowLeft, ChevronDown } from 'lucide-react'

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

function SeatSelectorHeader({ onBack }) {
  return (
    <header className="shrink-0 px-6 pt-[max(0.75rem,env(safe-area-inset-top))] pb-1">
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

function CinemaScreenPreview({ posterUrl, title }) {
  return (
    <div className="relative mx-auto w-full max-w-[300px] px-2">
      {/* Ambient glow beneath screen */}
      <div
        className="pointer-events-none absolute -bottom-3 left-1/2 z-0 h-12 w-[80%] -translate-x-1/2 rounded-[50%] blur-2xl"
        style={{
          background:
            'radial-gradient(ellipse 90% 80% at 50% 30%, rgba(245, 197, 24, 0.28) 0%, rgba(245, 197, 24, 0.08) 50%, transparent 75%)',
        }}
        aria-hidden
      />
      {/* Subtle side spill light */}
      <div
        className="pointer-events-none absolute -bottom-5 left-1/2 z-0 h-20 w-[60%] -translate-x-1/2 blur-3xl opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(245, 197, 24, 0.15), transparent 70%)',
        }}
        aria-hidden
      />
      <div
        className="relative z-[1] overflow-hidden"
        style={{
          borderRadius: '50% / 16%',
          aspectRatio: '2.6 / 1',
          transform: 'perspective(500px) rotateX(5deg)',
          transformOrigin: '50% 0%',
          boxShadow: '0 8px 40px -8px rgba(0,0,0,0.9), 0 2px 12px -2px rgba(245,197,24,0.08)',
        }}
      >
        <img
          src={posterUrl}
          alt=""
          className="h-full w-full scale-110 object-cover object-[50%_30%] opacity-85"
          style={{ filter: 'blur(2px) saturate(1.05) brightness(0.7)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />
        {/* Thin bright edge at the bottom to simulate screen edge lighting */}
        <div
          className="absolute inset-x-0 bottom-0 h-[1px]"
          style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.08) 50%, transparent 90%)' }}
        />
      </div>
      <span className="sr-only">Screening: {title}</span>
    </div>
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

function SeatSelectionOverlay({ visible, rowLabel, seatCount, ticketQty }) {
  if (!visible) return null
  const n = Math.min(ticketQty, 4)
  return (
    <div
      className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2"
      style={{ top: '-2.5rem' }}
    >
      <div
        className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-[#1A1A1E]/95 py-1.5 pl-2 pr-3 backdrop-blur-xl"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 1px 0 inset rgba(255,255,255,0.04)' }}
        role="status"
      >
        <div className="flex -space-x-1.5 pl-0.5">
          {Array.from({ length: n }, (_, i) => (
            <div
              key={i}
              className="h-6 w-6 shrink-0 rounded-full border-[1.5px] border-[#1A1A1E] bg-gradient-to-br from-amber-300/90 to-amber-600/80"
              style={{ zIndex: n - i }}
              aria-hidden
            />
          ))}
        </div>
        <p className="text-[12px] font-medium tracking-tight text-white/90">
          Row {rowLabel} · {seatCount} {seatCount === 1 ? 'Seat' : 'Seats'}
        </p>
      </div>
    </div>
  )
}

function SeatsTogetherChip({ count }) {
  return (
    <button
      type="button"
      className="mx-auto flex cursor-pointer items-center gap-1.5 rounded-full border border-white/[0.07] bg-[#1C1C20] px-4 py-2.5 text-[13px] font-medium tracking-wide text-white/90 transition-colors active:bg-[#28282C]"
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 3px rgba(0,0,0,0.3)' }}
    >
      {count} {count === 1 ? 'Seat' : 'Seats'} Together
      <ChevronDown size={14} className="ml-0.5 text-white/40" strokeWidth={2.2} />
    </button>
  )
}

function SeatHelperText() {
  return (
    <p className="mt-2 text-center text-[11px] leading-snug tracking-wide text-white/35">
      Showing where you can sit together
    </p>
  )
}

function BottomCTA({ disabled, onContinue }) {
  return (
    <div className="shrink-0 px-6 pt-2 pb-[max(2rem,env(safe-area-inset-bottom))]">
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

function SeatMapSection({
  layout,
  seatStates,
  onToggle,
  overlayVisible,
  overlayRow,
  selectedCount,
  ticketQty,
}) {
  return (
    <div className="relative mx-auto mt-3 w-full min-w-0 shrink-0 px-2 pb-1">
      <div
        className="relative mx-auto flex max-w-[min(100%,340px)] flex-col items-center"
        style={{ perspective: '500px' }}
      >
        <SeatSelectionOverlay
          visible={overlayVisible}
          rowLabel={overlayRow}
          seatCount={selectedCount}
          ticketQty={ticketQty}
        />
        <div
          className="w-full px-1 pt-0"
          style={{
            transform: 'perspective(550px) rotateX(8deg)',
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
  posterUrl,
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

      <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto hide-scrollbar">
        <div className="shrink-0 pt-1">
          <CinemaScreenPreview posterUrl={posterUrl} title={movie?.title} />
        </div>
        <SeatMapSection
          layout={layout}
          seatStates={seatStates}
          onToggle={toggle}
          overlayVisible={selectedCount > 0}
          overlayRow={overlayRow ?? '—'}
          selectedCount={selectedCount}
          ticketQty={ticketQty}
        />

        <div className="flex shrink-0 flex-col items-center px-6 pb-2 pt-4">
          <SeatsTogetherChip count={ticketQty} />
          <SeatHelperText />
        </div>
      </div>

      <BottomCTA disabled={!canContinue} onContinue={handleContinue} />
    </div>
  )
}
