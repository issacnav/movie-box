import { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react'
import { useLottie } from 'lottie-react'
import { ArrowLeft, Minus, Plus } from 'lucide-react'
import imdbLogo from '../assets/imdb-logo.svg'
import kawaiiHiAnimation from '../assets/kawaii-emoji-hi.json'
import kawaiiEmojiAnimation from '../assets/kawaii-animals-emoji-animation.json'
import kawaiiGivingLoveAnimation from '../assets/kawaii-animals-giving-love.json'
import { prepareLottieData } from '../utils/prepareLottieData.js'

/** Ground disc layer name shared by these mascot exports */
const MASCOT_LOTTIE_PREPARE = { omitLayers: ['Layer 1'] }

const EMPTY_LOTTIE = { v: '5.5.7', fr: 1, ip: 0, op: 1, w: 100, h: 100, layers: [] }

function StaggerChild({ index, active, children, className = '', style: styleProp }) {
  // Start visible when active so first paint isn’t opacity:0 (blank) before useEffect runs
  const [visible, setVisible] = useState(() => Boolean(active))

  useEffect(() => {
    if (!active) {
      setVisible(false)
      return
    }
    const timer = setTimeout(() => setVisible(true), index * 100)
    return () => clearTimeout(timer)
  }, [active, index])

  return (
    <div
      className={className}
      style={{
        ...styleProp,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1), transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {children}
    </div>
  )
}

/** One instance per hook call — do not call useLottie inside a .map() in the parent. */
function SingleKawaiiLottie({ size, animationData }) {
  const lottieOptions = useMemo(
    () =>
      animationData
        ? {
            animationData,
            loop: true,
            renderer: 'svg',
            rendererSettings: {
              preserveAspectRatio: 'xMidYMid meet',
            },
          }
        : null,
    [animationData],
  )

  const style = useMemo(
    () => ({ width: size, height: size, display: 'block' }),
    [size],
  )

  const { View } = useLottie(
    lottieOptions ?? {
      animationData: EMPTY_LOTTIE,
      loop: false,
      autoplay: false,
    },
    style,
  )

  if (!animationData) {
    return (
      <div
        className="shrink-0 flex items-center justify-center rounded-full bg-dark-surface text-[length:clamp(1.5rem,12vw,2.5rem)] leading-none pointer-events-none"
        style={{ width: size, height: size }}
        aria-hidden
      >
        👋
      </div>
    )
  }

  return (
    <div
      className="shrink-0 flex items-end justify-center pointer-events-none w-full h-full min-h-0"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {View}
    </div>
  )
}

/** Reference (Emmanuel Ikechukwu): ~30–40% overlap, characters tightly clustered. */
const MASCOT_ROW_OVERLAP_RATIO = 0.38
/** Reference: mascots ~150–180px on phone; cap keeps tablets from overscaling. */
const MASCOT_ROW_MAX_PX = 180

/** Same vertical gap for mascot→counter and counter→Continue (reference). */
const TICKET_STACK_GAP_PX = 16

/** Counter cluster slightly narrower than Continue (reference). */
const TICKET_COUNTER_MAX_PX = 260

/** Conservative per-slot size before ResizeObserver runs (avoids row wider than ~260px content). */
function estimateInitialMascotPer(safeCount) {
  const c = safeCount
  const r = MASCOT_ROW_OVERLAP_RATIO
  const denom = c - (c - 1) * r
  if (denom <= 0) return 56
  return Math.min(MASCOT_ROW_MAX_PX, Math.max(56, Math.floor(260 / denom)))
}

/** Wraps one Lottie: entrance motion + alternating tint + smooth resize when count changes */
function MascotSlot({ size, overlapPx, animationData, index }) {
  const tint = index % 2 === 1 ? 'ticket-mascot-tint-warm' : 'ticket-mascot-tint-base'
  return (
    <div
      className={`ticket-mascot-reveal ticket-mascot-slot-size flex shrink-0 items-end justify-center pointer-events-none overflow-visible ${tint}`}
      style={{
        width: size,
        height: size,
        marginLeft: index > 0 ? -overlapPx : 0,
        zIndex: index,
      }}
      aria-hidden
    >
      <SingleKawaiiLottie size={size} animationData={animationData} />
    </div>
  )
}

/** 0 = wave hi, 1 = emoji burst, 2 = giving love; 4+ tickets → random mix per slot */
function mascotVariantForTicketCount(safeCount, slotIndex, randomPicks) {
  if (safeCount <= 1) return 0
  if (safeCount === 2) return 1
  if (safeCount === 3) return 2
  return randomPicks[slotIndex] ?? 0
}

/** N tickets → N equal Lotties in one row, sized to fit the row (like your reference). */
function KawaiiMascotRow({ count }) {
  const prepared = useMemo(
    () =>
      [
        prepareLottieData(kawaiiHiAnimation, MASCOT_LOTTIE_PREPARE),
        prepareLottieData(kawaiiEmojiAnimation, MASCOT_LOTTIE_PREPARE),
        prepareLottieData(kawaiiGivingLoveAnimation, MASCOT_LOTTIE_PREPARE),
      ],
    [],
  )

  const containerRef = useRef(null)
  const safeCount = Math.max(1, Math.min(10, count))
  const [size, setSize] = useState(() => estimateInitialMascotPer(safeCount))
  const [overlapPx, setOverlapPx] = useState(() => {
    const per = estimateInitialMascotPer(safeCount)
    return Math.min(
      Math.round(per * MASCOT_ROW_OVERLAP_RATIO),
      Math.max(0, per - 20),
    )
  })
  const [randomPicks, setRandomPicks] = useState(() => [])

  useLayoutEffect(() => {
    if (safeCount < 4) {
      setRandomPicks([])
      return
    }
    setRandomPicks((prev) => {
      const next = prev.slice(0, safeCount)
      while (next.length < safeCount) {
        next.push(Math.floor(Math.random() * 3))
      }
      return next
    })
  }, [safeCount])

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    const measure = () => {
      const w = el.getBoundingClientRect().width
      if (w <= 0) return
      const c = safeCount
      const r = MASCOT_ROW_OVERLAP_RATIO
      const denom = c - (c - 1) * r
      let per = denom > 0 ? Math.floor(w / denom) : Math.floor(w)
      per = Math.min(MASCOT_ROW_MAX_PX, Math.max(56, per))
      let overlap = Math.min(Math.round(per * r), Math.max(0, per - 20))
      let rowSpan = c * per - (c - 1) * overlap
      while (rowSpan > w && per > 56) {
        per -= 1
        overlap = Math.min(Math.round(per * r), Math.max(0, per - 20))
        rowSpan = c * per - (c - 1) * overlap
      }
      setSize(per)
      setOverlapPx(overlap)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [safeCount])

  return (
    <div
      ref={containerRef}
      className="mx-auto flex w-full min-w-0 max-w-full flex-row flex-nowrap items-end justify-center gap-0 overflow-x-hidden"
    >
      {Array.from({ length: safeCount }, (_, i) => {
        const v = mascotVariantForTicketCount(safeCount, i, randomPicks)
        const animationData = prepared[v]
        return (
          <MascotSlot
            key={i}
            size={size}
            overlapPx={overlapPx}
            animationData={animationData}
            index={i}
          />
        )
      })}
    </div>
  )
}

export default function TicketScreen({ posterUrl, movie, onBack, onContinue, active }) {
  const [count, setCount] = useState(1)

  const decrement = () => setCount((c) => Math.max(1, c - 1))
  const increment = () => setCount((c) => Math.min(10, c + 1))

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

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-hidden">
      {/* 1. Back arrow */}
      <StaggerChild index={0} active={active} className="ml-4 mt-4 shrink-0 self-start">
        <button
          onClick={onBack}
          className="p-1 cursor-pointer bg-transparent border-none"
          aria-label="Go back"
        >
          <ArrowLeft size={24} className="text-white/70" strokeWidth={2} />
        </button>
      </StaggerChild>

      {/* 2. Mini movie card (same layout as BookingScreen) */}
      <StaggerChild index={0} active={active} className="flex items-center gap-4 mx-6 mt-6 shrink-0">
        <div className="w-[120px] h-[80px] rounded-[12px] overflow-hidden shrink-0">
          <img
            src={posterUrl}
            alt={`${movie.title} poster`}
            className="w-full h-full object-cover object-top"
            draggable={false}
          />
        </div>
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <h3 className="text-white text-[18px] font-bold leading-tight">
            {movie.title}
          </h3>
          <span className="text-gray-light text-[13px]">
            {movie.year} · {movie.genre} · {movie.duration}
          </span>
          <div className="flex items-center gap-1.5">
            <img src={imdbLogo} alt="IMDb" className="h-[16px] w-auto" />
            <span className="text-white text-[13px] font-medium">{movie.imdbRating}</span>
          </div>
        </div>
      </StaggerChild>

      {/*
        Reference layout: mascots vertically centered in the band below the heading and above the
        counter; mascot→counter gap ≈ counter→Continue; dense bottom control group.
      */}
      <div
        className="hide-scrollbar mx-6 mt-8 flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex shrink-0 flex-col gap-6">
          <StaggerChild index={1} active={active} className="h-px w-full shrink-0 bg-white/10" />

          <StaggerChild index={2} active={active} className="shrink-0">
            <h2 className="text-white text-[24px] font-bold">Who's going?</h2>
            <p className="text-gray-text mt-1 text-[14px]">Select tickets amount</p>
          </StaggerChild>
        </div>

        <div
          className="flex min-h-0 min-w-0 flex-1 flex-col"
          style={{ gap: TICKET_STACK_GAP_PX }}
        >
          <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center overflow-x-hidden">
            <StaggerChild
              index={3}
              active={active}
              className="flex w-full min-w-0 max-w-full shrink-0 justify-center overflow-x-hidden px-1"
            >
              <div className="w-full min-w-0 max-w-full overflow-x-hidden">
                <KawaiiMascotRow count={count} />
              </div>
            </StaggerChild>
          </div>

          <StaggerChild
            index={4}
            active={active}
            className="flex w-full shrink-0 justify-center px-1"
          >
            <div
              className="flex w-full items-center justify-between gap-6"
              style={{ maxWidth: TICKET_COUNTER_MAX_PX }}
            >
              <button
                type="button"
                onClick={decrement}
                disabled={count <= 1}
                className={`flex h-[56px] w-[56px] shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-dark-surface transition-opacity ${
                  count <= 1 ? 'cursor-not-allowed opacity-40' : 'opacity-100'
                }`}
                aria-label="Decrease tickets"
              >
                <Minus size={22} className="text-white" />
              </button>

              <span className="min-w-[48px] shrink-0 text-center text-[40px] font-bold leading-none tabular-nums text-white">
                {count}
              </span>

              <button
                type="button"
                onClick={increment}
                disabled={count >= 10}
                className={`flex h-[56px] w-[56px] shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-dark-surface transition-opacity ${
                  count >= 10 ? 'cursor-not-allowed opacity-40' : 'opacity-100'
                }`}
                aria-label="Increase tickets"
              >
                <Plus size={22} className="text-white" />
              </button>
            </div>
          </StaggerChild>
        </div>
      </div>

      {/* Continue — margin matches TICKET_STACK_GAP_PX (reference: equal vertical rhythm). */}
      <StaggerChild
        index={5}
        active={active}
        className="shrink-0 px-6 pb-10 pt-1"
        style={{ marginTop: TICKET_STACK_GAP_PX }}
      >
        <button
          type="button"
          onClick={() => onContinue?.(count)}
          className="h-[56px] w-full cursor-pointer rounded-full border-none bg-yellow text-[16px] font-semibold text-dark transition-colors duration-200 ease-out hover:bg-yellow-button"
        >
          Continue
        </button>
      </StaggerChild>
    </div>
  )
}
