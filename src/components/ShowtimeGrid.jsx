import { useCallback } from 'react'

export const DEFAULT_SHOWTIMES = [
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:30 PM',
  '03:00 PM',
  '05:30 PM',
  '07:30 PM',
  '09:00 PM',
]

/**
 * Compact 4×2 showtime grid — neutral styling for dark booking UIs.
 * Each chip is its own control; selection is per chip only.
 */
export default function ShowtimeGrid({
  times = DEFAULT_SHOWTIMES,
  value = null,
  onChange,
  className = '',
}) {
  const handleSelect = useCallback(
    (time) => {
      onChange?.(time)
    },
    [onChange],
  )

  return (
    <div
      className={`w-full max-w-full ${className}`}
      role="group"
      aria-label="Available showtimes"
    >
      <div className="grid w-full grid-cols-4 gap-2 sm:gap-2.5">
        {times.map((time) => {
          const isSelected = value === time
          return (
            <button
              key={time}
              type="button"
              onClick={() => handleSelect(time)}
              aria-pressed={isSelected}
              className={[
                'flex aspect-square w-full min-h-0 min-w-0 items-center justify-center',
                'rounded-3xl px-1.5 text-center text-[12px] font-medium leading-tight sm:text-[13px]',
                'transition-colors duration-200 ease-out',
                'cursor-pointer select-none border-none outline-none',
                'focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D0F]',
                isSelected
                  ? 'bg-white text-dark'
                  : 'bg-dark-surface text-gray-light hover:bg-white/[0.08] active:bg-white/[0.12]',
              ].join(' ')}
            >
              <span className="px-0.5">{time}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
