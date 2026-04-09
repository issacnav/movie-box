import { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useLottie } from 'lottie-react'
import { ArrowLeft, Minus, Plus } from 'lucide-react'
import MiniMovieCardRow from './MiniMovieCardRow.jsx'
import kawaiiHiAnimation from '../assets/kawaii-emoji-hi.json'
import kawaiiEmojiAnimation from '../assets/kawaii-animals-emoji-animation.json'
import kawaiiGivingLoveAnimation from '../assets/kawaii-animals-giving-love.json'
import { prepareLottieData } from '../utils/prepareLottieData.js'
import TicketQuantityDigit from './TicketQuantityDigit.jsx'
import {
  IOS_TICKET_MAIN_ENTER_ANIMATE,
  IOS_TICKET_MAIN_ENTER_INITIAL,
  IOS_TICKET_MAIN_ENTER_REDUCED,
  IOS_TICKET_MAIN_ENTER_TRANSITION,
} from '../motion/iosScreenMotion.js'

const MASCOT_LOTTIE_PREPARE = { omitLayers: ['Layer 1'] }
const EMPTY_LOTTIE = { v: '5.5.7', fr: 1, ip: 0, op: 1, w: 100, h: 100, layers: [] }
const TICKET_COUNTER_MAX_PX = 286
const TICKET_MASCOT_ROW_MAX_PX = 196
const TICKET_MASCOT_ROW_MIN_PX = 54
const TICKET_MASCOT_ROW_OVERLAP_RATIO = 0.34
const PREPARED_TICKET_MASCOTS = [
  prepareLottieData(kawaiiHiAnimation, MASCOT_LOTTIE_PREPARE),
  prepareLottieData(kawaiiEmojiAnimation, MASCOT_LOTTIE_PREPARE),
  prepareLottieData(kawaiiGivingLoveAnimation, MASCOT_LOTTIE_PREPARE),
]

function StaggerChild({ index, active, children, className = '', style: styleProp }) {
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

function SingleKawaiiLottie({ size, animationData }) {
  const lottieOptions = useMemo(
    () =>
      animationData
        ? {
            animationData,
            loop: false,
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
        className="flex shrink-0 items-center justify-center rounded-full bg-dark-surface text-[2rem] leading-none pointer-events-none"
        style={{ width: size, height: size }}
        aria-hidden
      >
        *
      </div>
    )
  }

  return (
    <div
      className="flex h-full w-full shrink-0 items-center justify-center pointer-events-none"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {View}
    </div>
  )
}

function mascotVariantForSlot(count, index) {
  if (count <= 1) return 0
  if (count === 2) return 1
  if (count === 3) return 2
  return index % PREPARED_TICKET_MASCOTS.length
}

function estimateMascotRowSize(count, width) {
  const safeCount = Math.max(1, count)
  const denom = safeCount - (safeCount - 1) * TICKET_MASCOT_ROW_OVERLAP_RATIO
  if (denom <= 0) return TICKET_MASCOT_ROW_MIN_PX
  const raw = Math.floor(width / denom)
  return Math.min(TICKET_MASCOT_ROW_MAX_PX, Math.max(TICKET_MASCOT_ROW_MIN_PX, raw))
}

function TicketMascot({ count }) {
  const safeCount = Math.max(1, Math.min(10, count))
  const containerRef = useRef(null)
  const [mascotSize, setMascotSize] = useState(() => estimateMascotRowSize(safeCount, 280))

  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return

    const measure = () => {
      const width = element.getBoundingClientRect().width
      if (width <= 0) return
      setMascotSize(estimateMascotRowSize(safeCount, width))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [safeCount])

  const overlapPx = Math.min(
    Math.round(mascotSize * TICKET_MASCOT_ROW_OVERLAP_RATIO),
    Math.max(0, mascotSize - 20),
  )

  return (
    <div
      ref={containerRef}
      className="mx-auto flex h-[min(220px,30svh)] min-h-[120px] w-full items-center justify-center overflow-hidden sm:h-[220px] sm:min-h-0"
    >
      <div className="flex items-end justify-center">
        {Array.from({ length: safeCount }, (_, index) => {
          const animationData = PREPARED_TICKET_MASCOTS[mascotVariantForSlot(safeCount, index)]
          return (
            <div
              key={`${safeCount}-${index}`}
              className="ticket-mascot-reveal ticket-mascot-tint-base flex shrink-0 items-center justify-center"
              style={{
                width: mascotSize,
                height: mascotSize,
                marginLeft: index === 0 ? 0 : -overlapPx,
              }}
            >
              <SingleKawaiiLottie size={mascotSize} animationData={animationData} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function TicketScreen({ posterUrl, movie, onBack, onContinue, active }) {
  const [count, setCount] = useState(1)
  const stepDirectionRef = useRef(0)
  const reduceMotion = useReducedMotion()

  const decrement = () => {
    stepDirectionRef.current = -1
    setCount((current) => Math.max(1, current - 1))
  }

  const increment = () => {
    stepDirectionRef.current = 1
    setCount((current) => Math.min(10, current + 1))
  }

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
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-hidden pt-[env(safe-area-inset-top,0px)]">
      <StaggerChild index={0} active={active} className="ml-3 mt-2 shrink-0 self-start sm:ml-4 sm:mt-3">
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer border-none bg-transparent p-1"
          aria-label="Go back"
        >
          <ArrowLeft size={24} className="text-white/70" strokeWidth={2} />
        </button>
      </StaggerChild>

      <StaggerChild index={0} active={active} className="shrink-0">
        <MiniMovieCardRow posterUrl={posterUrl} movie={movie} />
      </StaggerChild>

      <motion.div
        className="hide-scrollbar mx-5 mt-6 flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto sm:mx-6 sm:mt-8"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        initial={reduceMotion ? IOS_TICKET_MAIN_ENTER_REDUCED : IOS_TICKET_MAIN_ENTER_INITIAL}
        animate={IOS_TICKET_MAIN_ENTER_ANIMATE}
        transition={IOS_TICKET_MAIN_ENTER_TRANSITION}
      >
        <StaggerChild index={1} active={active} className="h-px w-full shrink-0 bg-white/10" />

        <StaggerChild index={2} active={active} className="shrink-0 pt-6 sm:pt-10">
          <h2 className="text-[21px] font-bold text-white sm:text-[24px]">Who&apos;s going?</h2>
          <p className="mt-1 text-[13px] text-gray-text sm:text-[14px]">Select tickets amount</p>
        </StaggerChild>

        <div className="flex min-h-0 flex-1 flex-col justify-center pb-2 sm:pb-4">
          <StaggerChild index={3} active={active} className="shrink-0 pt-4 sm:pt-8">
            <TicketMascot count={count} />
          </StaggerChild>

          <StaggerChild index={4} active={active} className="shrink-0 pt-4 sm:pt-6">
            <div
              className="mx-auto flex w-full items-center justify-between gap-6"
              style={{ maxWidth: `${TICKET_COUNTER_MAX_PX}px` }}
            >
              <button
                type="button"
                onClick={decrement}
                disabled={count <= 1}
                className={`flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border-none transition-opacity ${
                  count <= 1 ? 'cursor-not-allowed bg-[#2B2B2F] opacity-40' : 'cursor-pointer bg-[#2B2B2F] opacity-100'
                }`}
                aria-label="Decrease tickets"
              >
                <Minus size={24} className="text-white" strokeWidth={2.4} />
              </button>

              <TicketQuantityDigit value={count} directionRef={stepDirectionRef} />

              <button
                type="button"
                onClick={increment}
                disabled={count >= 10}
                className={`flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border-none transition-opacity ${
                  count >= 10 ? 'cursor-not-allowed bg-[#2B2B2F] opacity-40' : 'cursor-pointer bg-[#2B2B2F] opacity-100'
                }`}
                aria-label="Increase tickets"
              >
                <Plus size={24} className="text-white" strokeWidth={2.4} />
              </button>
            </div>
          </StaggerChild>
        </div>
      </motion.div>

      <StaggerChild
        index={5}
        active={active}
        className="shrink-0 px-5 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] sm:px-6 sm:pt-3 sm:pb-[max(2rem,env(safe-area-inset-bottom,0px))]"
      >
        <button
          type="button"
          onClick={() => onContinue?.(count)}
          className="h-[52px] w-full cursor-pointer rounded-full border-none bg-yellow text-[15px] font-semibold tracking-[-0.01em] text-dark transition-all duration-200 ease-out active:scale-[0.98] active:brightness-95"
          style={{ boxShadow: '0 4px 20px -4px rgba(245,197,24,0.3), 0 1px 3px rgba(245,197,24,0.12)' }}
        >
          Continue
        </button>
      </StaggerChild>
    </div>
  )
}
