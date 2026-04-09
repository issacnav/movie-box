import { useState, useEffect, useCallback, useMemo } from 'react'
import { X, ChevronDown } from 'lucide-react'
import ShowtimeGrid from './ShowtimeGrid'
import MiniMovieCardRow from './MiniMovieCardRow.jsx'
import { openingWeekForMovie } from '../data/featuredMovies'

/** Showtime panel: fast start, slow settle (open); slightly quicker collapse — iOS-adjacent. */
const PANEL_OPEN_MS = 540
const PANEL_CLOSE_MS = 340
const PANEL_EASE_OPEN = 'cubic-bezier(0.32, 0.72, 0, 1)'
const PANEL_EASE_CLOSE = 'cubic-bezier(0.4, 0, 0.2, 1)'

function StaggerChild({ index, active, children, className = '', style = {} }) {
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
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1), transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {children}
    </div>
  )
}

export default function BookingScreen({
  posterUrl,
  onClose,
  onContinue,
  movie,
  miniCardRef,
  active,
  revealStaticCopy,
}) {
  const hideUntilMorph = !revealStaticCopy
  const week = useMemo(() => openingWeekForMovie(movie), [movie])
  const showtimeSet = useMemo(() => new Set(week.showtimeChipIds), [week])

  const [panelMsOpen, setPanelMsOpen] = useState(PANEL_OPEN_MS)
  const [panelMsClose, setPanelMsClose] = useState(PANEL_CLOSE_MS)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => {
      setPanelMsOpen(mq.matches ? 120 : PANEL_OPEN_MS)
      setPanelMsClose(mq.matches ? 100 : PANEL_CLOSE_MS)
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const [selectedDateId, setSelectedDateId] = useState(null)
  const [selectedShowtime, setSelectedShowtime] = useState(null)

  useEffect(() => {
    setSelectedDateId(null)
    setSelectedShowtime(null)
  }, [movie?.id])

  const showTimePanel = selectedDateId != null && showtimeSet.has(selectedDateId)

  const selectDate = useCallback((id) => {
    setSelectedDateId(id)
    setSelectedShowtime(null)
  }, [])

  const selectedDateLine = useMemo(() => {
    const chip = week.chips.find((c) => c.id === selectedDateId)
    return chip?.line ?? ''
  }, [week.chips, selectedDateId])

  const panelMs = showTimePanel ? panelMsOpen : panelMsClose
  const panelEase = showTimePanel ? PANEL_EASE_OPEN : PANEL_EASE_CLOSE

  const canContinue = Boolean(selectedShowtime)

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* 1. Close button */}
        <StaggerChild
          index={0}
          active={active}
          className="ml-3 mt-3 shrink-0 self-start pt-[env(safe-area-inset-top,0px)] sm:ml-4 sm:mt-4"
        >
          <button
            onClick={onClose}
            className="cursor-pointer border-none bg-transparent p-1"
            aria-label="Close"
          >
            <X size={24} className="text-white/70" strokeWidth={2} />
          </button>
        </StaggerChild>

        {/* 2. Mini movie card — static copy hidden until morph ends (overlay shows poster meanwhile) */}
        <MiniMovieCardRow
          posterUrl={posterUrl}
          movie={movie}
          miniCardRef={miniCardRef}
          hidePosterAndText={hideUntilMorph}
        />

        <div className="hide-scrollbar min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
          {/* 3. Divider */}
          <StaggerChild index={1} active={active} className="mx-5 mt-6 h-px bg-white/10 sm:mx-6 sm:mt-8" />

          {/* 4. When to Watch — instant after morph (no stagger); hidden under morph */}
          <div
            className={`mx-5 mt-6 sm:mx-6 sm:mt-8 ${hideUntilMorph ? 'opacity-0' : 'opacity-100'}`}
            aria-hidden={hideUntilMorph}
          >
            <h2 className="text-[21px] font-bold text-white sm:text-[24px]">When to Watch?</h2>
            <p className="mt-1 text-[13px] text-gray-text sm:text-[14px]">Select date and time</p>
          </div>

          {/* 5. Date selector + day labels — grid avoids horizontal overflow on narrow phones */}
          <StaggerChild index={2} active={active} className="mx-5 mt-5 sm:mx-6 sm:mt-6">
            <div className="grid w-full grid-cols-5 gap-2 sm:gap-3">
              {week.chips.map((c) => {
                const isSelected = selectedDateId === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectDate(c.id)}
                    className={`aspect-square w-full max-h-[60px] cursor-pointer rounded-full border-none text-[15px] font-medium transition-colors duration-200 ease-out sm:text-[18px] ${
                      isSelected ? 'bg-white text-dark' : 'bg-dark-surface text-white'
                    }`}
                  >
                    {c.dayNum}
                  </button>
                )
              })}
              <button
                type="button"
                className="flex aspect-square w-full max-h-[60px] cursor-pointer items-center justify-center rounded-full border-none bg-dark-surface"
                aria-label="More dates"
              >
                <ChevronDown size={20} className="text-white" />
              </button>
            </div>
            <div className="mt-2 grid w-full grid-cols-5 gap-2 sm:gap-3">
              {week.chips.map((c) => (
                <span key={c.id} className="text-center text-[10px] text-gray-text sm:text-[11px]">
                  {c.weekday}
                </span>
              ))}
              <span className="min-h-[1em]" aria-hidden />
            </div>
          </StaggerChild>

          {/* 6. Placeholder — hide when showtimes panel is open */}
          <StaggerChild index={3} active={active} className="flex min-h-[4rem] flex-col">
            {!showTimePanel && (
              <div className="flex flex-1 items-center justify-center px-6 py-6 sm:px-10">
                <p className="text-center text-[13px] leading-relaxed text-gray-text sm:text-[14px]">
                  Select a day to see the
                  <br />
                  available showtimes
                </p>
              </div>
            )}
          </StaggerChild>

          {/* Showtimes: emerge from bottom (transform + opacity; grid-rows reveal — motion skill) */}
          <div
            className={`booking-time-panel-grid grid shrink-0 overflow-hidden transition-[grid-template-rows] ${
              showTimePanel ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
            style={{
              transitionDuration: `${panelMs}ms`,
              transitionTimingFunction: panelEase,
            }}
          >
            <div className="min-h-0 overflow-hidden">
              <div
                className={`booking-time-panel-inner px-5 pb-3 transition-[opacity,transform] sm:px-6 ${
                  showTimePanel ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
                }`}
                style={{
                  transitionDuration: `${panelMs}ms`,
                  transitionTimingFunction: panelEase,
                }}
              >
                <p className="mb-3 text-[12px] text-gray-text sm:text-[13px]">Select showtime</p>
                <ShowtimeGrid value={selectedShowtime} onChange={setSelectedShowtime} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Continue */}
      <StaggerChild
        index={4}
        active={active}
        className="shrink-0 px-5 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] sm:px-6 sm:pb-[max(2rem,env(safe-area-inset-bottom,0px))]"
      >
        <button
          type="button"
          disabled={!canContinue}
          onClick={
            canContinue
              ? () =>
                  onContinue?.({
                    whenLine: `${selectedDateLine} at ${selectedShowtime}`,
                    screenNumber: 2,
                  })
              : undefined
          }
          className={`w-full h-[52px] rounded-full text-[15px] font-semibold tracking-[-0.01em] border-none transition-all duration-200 ease-out ${
            canContinue
              ? 'bg-yellow text-dark cursor-pointer active:scale-[0.98] active:brightness-95'
              : 'bg-[#1C1C20] text-white/20 cursor-not-allowed'
          }`}
          style={canContinue ? {
            boxShadow: '0 4px 20px -4px rgba(245,197,24,0.3), 0 1px 3px rgba(245,197,24,0.12)',
          } : undefined}
        >
          Continue
        </button>
      </StaggerChild>
    </div>
  )
}
