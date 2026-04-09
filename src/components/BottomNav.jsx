import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLottie } from 'lottie-react'
import { prepareLottieData } from '../utils/prepareLottieData.js'
import homeLottie from '../assets/nav-lottie/home-hover-fold.json'
import ticketLottie from '../assets/nav-lottie/ticket-hover-ticket.json'
import bookmarkLottie from '../assets/nav-lottie/bookmark-morph.json'

const EMPTY_LOTTIE = { v: '5.5.7', fr: 1, ip: 0, op: 1, w: 100, h: 100, layers: [] }

function usePrefersReducedMotion() {
  return useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])
}

/**
 * Tab icon: Lottie idle at frame 0; plays full segment on each `playToken` bump; tints to light UI.
 */
function NavLottieIcon({ rawAnimationData, playToken, isActive, size }) {
  const reduceMotion = usePrefersReducedMotion()
  const animationData = useMemo(() => prepareLottieData(rawAnimationData), [rawAnimationData])
  const onCompleteRef = useRef(() => {})

  const style = useMemo(() => ({ width: size, height: size, display: 'block' }), [size])

  const lottieOptions = useMemo(
    () => ({
      animationData: animationData ?? EMPTY_LOTTIE,
      loop: false,
      autoplay: false,
      renderer: 'svg',
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet',
        className: 'nav-tab-lottie-svg',
      },
      onComplete: () => onCompleteRef.current?.(),
    }),
    [animationData],
  )

  const { View, goToAndStop, goToAndPlay } = useLottie(lottieOptions, style)

  onCompleteRef.current = () => {
    goToAndStop(0, true)
  }

  useEffect(() => {
    goToAndStop(0, true)
  }, [animationData, goToAndStop])

  useEffect(() => {
    if (playToken <= 0 || reduceMotion) return
    goToAndPlay(0, true)
  }, [playToken, goToAndPlay, reduceMotion])

  useEffect(() => {
    if (!reduceMotion) return
    goToAndStop(0, true)
  }, [reduceMotion, goToAndStop])

  if (!animationData) {
    return (
      <span
        className="inline-block shrink-0 rounded bg-white/10"
        style={{ width: size, height: size }}
        aria-hidden
      />
    )
  }

  return (
    <span
      className={`pointer-events-none flex shrink-0 items-center justify-center transition-opacity duration-200 ${
        isActive ? 'opacity-[0.95]' : 'opacity-[0.62]'
      }`}
      style={{
        width: size,
        height: size,
        filter: 'brightness(0) invert(1)',
      }}
      aria-hidden
    >
      {View}
    </span>
  )
}

/**
 * Floating iOS-style tab bar with Lottie icons (play on tap).
 * @param {'home' | 'theatre'} activeTab — Home = classic Now Showing; Theatre = ring browse screen.
 */
export default function BottomNav({ activeTab = 'home', onTabChange }) {
  const [plays, setPlays] = useState({ home: 0, theatre: 0, saved: 0 })
  const bump = useCallback((key) => {
    setPlays((p) => ({ ...p, [key]: p[key] + 1 }))
  }, [])

  const iconSize = 24

  const itemClass = (isActive) =>
    [
      'flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center gap-[3px] rounded-[14px] border-none bg-transparent',
      'px-1 py-1 transition-[color,opacity,transform] duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]',
      'active:scale-[0.97] active:opacity-70',
      isActive ? 'text-white' : 'text-[rgb(235,235,245)]/32',
    ].join(' ')

  const labelClass = (isActive) =>
    [
      'max-w-full truncate text-center font-sans text-[10px] leading-[1.05] tracking-[-0.02em]',
      isActive ? 'font-normal text-white/[0.88]' : 'font-normal text-[rgb(235,235,245)]/34',
    ].join(' ')

  return (
    <nav
      className="pointer-events-none fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))]"
      aria-label="Tab bar"
    >
      <div className="pointer-events-auto pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] pt-1.5">
        <div
          className="relative mx-auto w-full max-w-[min(100%,21.5rem)] overflow-hidden rounded-[22px]"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 42%, transparent 100%), rgba(8,8,10,0.34)',
            backdropFilter: 'saturate(200%) blur(40px)',
            WebkitBackdropFilter: 'saturate(200%) blur(40px)',
            boxShadow:
              '0 12px 48px -10px rgba(0,0,0,0.4), 0 4px 16px -8px rgba(0,0,0,0.22), inset 0 0.5px 0 rgba(255,255,255,0.06)',
            border: '0.5px solid rgba(255,255,255,0.028)',
          }}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-[0.22]"
            style={{
              background: 'linear-gradient(90deg, transparent 12%, rgba(255,255,255,0.18) 50%, transparent 88%)',
            }}
            aria-hidden
          />
          <div
            className="relative flex items-stretch justify-between gap-0.5 px-2 py-2.5 sm:gap-1 sm:px-2.5 sm:py-3"
            role="tablist"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'home'}
              aria-label="Home"
              aria-current={activeTab === 'home' ? 'page' : undefined}
              onClick={() => {
                bump('home')
                onTabChange?.('home')
              }}
              className={itemClass(activeTab === 'home')}
            >
              <NavLottieIcon
                rawAnimationData={homeLottie}
                playToken={plays.home}
                isActive={activeTab === 'home'}
                size={iconSize}
              />
              <span className={labelClass(activeTab === 'home')}>Home</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'theatre'}
              aria-label="Theatre"
              aria-current={activeTab === 'theatre' ? 'page' : undefined}
              onClick={() => {
                bump('theatre')
                onTabChange?.('theatre')
              }}
              className={itemClass(activeTab === 'theatre')}
            >
              <NavLottieIcon
                rawAnimationData={ticketLottie}
                playToken={plays.theatre}
                isActive={activeTab === 'theatre'}
                size={iconSize}
              />
              <span className={labelClass(activeTab === 'theatre')}>Theatre</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={false}
              aria-label="Saved"
              onClick={() => bump('saved')}
              className={itemClass(false)}
            >
              <NavLottieIcon
                rawAnimationData={bookmarkLottie}
                playToken={plays.saved}
                isActive={false}
                size={iconSize}
              />
              <span className={labelClass(false)}>Saved</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
