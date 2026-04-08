import { useState, useEffect, useCallback } from 'react'
import { X, ChevronDown } from 'lucide-react'
import ShowtimeGrid from './ShowtimeGrid'
import MiniMovieCardRow from './MiniMovieCardRow.jsx'

const DAYS = [
  { date: 11, day: 'T' },
  { date: 12, day: 'W' },
  { date: 13, day: 'T' },
  { date: 14, day: 'F' },
]

/** Dates that open the showtime panel (above Continue) */
const DATES_WITH_SHOWTIMES = [11, 12, 13]

const PANEL_MS = 280

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
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedShowtime, setSelectedShowtime] = useState(null)

  const showTimePanel =
    selectedDate != null && DATES_WITH_SHOWTIMES.includes(selectedDate)

  const selectDate = useCallback((date) => {
    setSelectedDate(date)
    setSelectedShowtime(null)
  }, [])

  const canContinue = Boolean(selectedShowtime)

  return (
    <div className="flex flex-col h-full">
      {/* 1. Close button */}
      <StaggerChild index={0} active={active} className="self-start mt-4 ml-4">
        <button
          onClick={onClose}
          className="p-1 cursor-pointer bg-transparent border-none"
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

      {/* 3. Divider */}
      <StaggerChild index={1} active={active} className="mx-6 mt-8 h-px bg-white/10" />

      {/* 4. When to Watch — instant after morph (no stagger); hidden under morph */}
      <div
        className={`mx-6 mt-8 ${hideUntilMorph ? 'opacity-0' : 'opacity-100'}`}
        aria-hidden={hideUntilMorph}
      >
        <h2 className="text-white text-[24px] font-bold">When to Watch?</h2>
        <p className="text-gray-text text-[14px] mt-1">Select date and time</p>
      </div>

      {/* 5. Date selector + day labels */}
      <StaggerChild index={2} active={active} className="mx-6 mt-6">
        <div className="flex items-center gap-3">
          {DAYS.map((d) => {
            const isSelected = selectedDate === d.date
            return (
              <button
                key={d.date}
                type="button"
                onClick={() => selectDate(d.date)}
                className={`w-[60px] h-[60px] rounded-full text-[18px] font-medium flex items-center justify-center cursor-pointer border-none transition-colors duration-200 ease-out ${
                  isSelected
                    ? 'bg-white text-dark'
                    : 'bg-dark-surface text-white'
                }`}
              >
                {d.date}
              </button>
            )
          })}
          <button
            type="button"
            className="w-[60px] h-[60px] rounded-full bg-dark-surface flex items-center justify-center cursor-pointer border-none"
            aria-label="More dates"
          >
            <ChevronDown size={20} className="text-white" />
          </button>
        </div>
        <div className="flex items-center gap-3 mt-2">
          {DAYS.map((d) => (
            <span key={d.day + d.date} className="w-[60px] text-center text-gray-text text-[13px]">
              {d.day}
            </span>
          ))}
          <span className="w-[60px]" />
        </div>
      </StaggerChild>

      {/* 6. Placeholder — hide when showtimes panel is open */}
      <StaggerChild
        index={3}
        active={active}
        className="flex-1 flex flex-col min-h-0"
      >
        {!showTimePanel && (
          <div className="flex-1 flex items-center justify-center px-10">
            <p className="text-gray-text text-[14px] text-center leading-relaxed">
              Select a day to see the<br />
              available showtimes
            </p>
          </div>
        )}
      </StaggerChild>

      {/* Showtimes: emerge from bottom (transform + opacity; grid-rows reveal — motion skill) */}
      <div
        className={`booking-time-panel-grid grid shrink-0 overflow-hidden transition-[grid-template-rows] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          showTimePanel ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
        style={{ transitionDuration: `${PANEL_MS}ms` }}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={`booking-time-panel-inner px-6 pb-3 transition-[opacity,transform] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              showTimePanel ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
            }`}
            style={{ transitionDuration: `${PANEL_MS}ms` }}
          >
            <p className="text-gray-text text-[13px] mb-3">Select showtime</p>
            <ShowtimeGrid value={selectedShowtime} onChange={setSelectedShowtime} />
          </div>
        </div>
      </div>

      {/* 7. Continue */}
      <StaggerChild index={4} active={active} className="px-6 pt-2 pb-[max(2rem,env(safe-area-inset-bottom))] shrink-0">
        <button
          type="button"
          disabled={!canContinue}
          onClick={canContinue ? onContinue : undefined}
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
