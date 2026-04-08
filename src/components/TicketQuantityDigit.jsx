import { AnimatePresence, motion } from 'framer-motion'

/** Slower motion + soft ease-out; opacity slightly quicker so overlap feels smooth */
const DIGIT_TRANSITION = {
  y: { type: 'tween', duration: 0.44, ease: [0.33, 1, 0.36, 1] },
  opacity: { type: 'tween', duration: 0.36, ease: [0.4, 0, 0.2, 1] },
}

const digitVariants = {
  enter: (dir) => ({
    y: dir === 1 ? 12 : dir === -1 ? -12 : 0,
    opacity: 0,
  }),
  center: {
    y: 0,
    opacity: 1,
  },
  exit: (dir) => ({
    y: dir === 1 ? -12 : dir === -1 ? 12 : 0,
    opacity: 0,
  }),
}

/**
 * iOS-style quantity value: only the number animates inside a fixed masked slot.
 * Parent must set directionRef.current to 1 (increment) or -1 (decrement) before updating value.
 */
export default function TicketQuantityDigit({ value, directionRef }) {
  const dir = directionRef.current

  return (
    <div
      className="relative flex h-[52px] w-[64px] shrink-0 items-center justify-center overflow-hidden"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence initial={false} custom={dir} mode="sync">
        <motion.span
          key={value}
          custom={dir}
          variants={digitVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={DIGIT_TRANSITION}
          className="absolute inset-0 flex items-center justify-center text-[40px] font-bold leading-none tabular-nums text-white"
          style={{ willChange: 'transform, opacity' }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
