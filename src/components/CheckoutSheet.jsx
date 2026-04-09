import { useEffect, useCallback, useMemo } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X, Ticket, ChevronRight } from 'lucide-react'
import {
  IOS_CHECKOUT_SCRIM_EXIT_TRANSITION,
  IOS_CHECKOUT_SCRIM_TRANSITION,
  IOS_CHECKOUT_SHEET_ENTER_ANIMATE,
  IOS_CHECKOUT_SHEET_ENTER_INITIAL,
  IOS_CHECKOUT_SHEET_ENTER_REDUCED,
  IOS_CHECKOUT_SHEET_ENTER_TRANSITION,
  IOS_CHECKOUT_SHEET_EXIT_TRANSITION,
} from '../motion/iosScreenMotion.js'

function MastercardMark({ className = '' }) {
  return (
    <span className={`relative inline-flex h-[22px] w-[34px] shrink-0 ${className}`} aria-hidden>
      <span
        className="absolute left-0 top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full bg-[#EB001B]"
        style={{ opacity: 0.95 }}
      />
      <span
        className="absolute left-[10px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full bg-[#F79E1B] mix-blend-normal"
        style={{ opacity: 0.92 }}
      />
    </span>
  )
}

const REDUCED_TRANSITION = { duration: 0.12, ease: [0.4, 0, 1, 1] }

export default function CheckoutSheet({
  open,
  onClose,
  onPay,
  posterUrl,
  movie,
  whenLine,
  detailLine,
  totalFormatted,
  cardLast4 = '4558',
}) {
  const reduceMotion = useReducedMotion()

  const scrimVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: reduceMotion ? REDUCED_TRANSITION : IOS_CHECKOUT_SCRIM_TRANSITION.opacity,
      },
      leave: {
        opacity: 0,
        transition: reduceMotion ? REDUCED_TRANSITION : IOS_CHECKOUT_SCRIM_EXIT_TRANSITION.opacity,
      },
    }),
    [reduceMotion],
  )

  const sheetVariants = useMemo(
    () => ({
      offscreen: reduceMotion ? IOS_CHECKOUT_SHEET_ENTER_REDUCED : IOS_CHECKOUT_SHEET_ENTER_INITIAL,
      onscreen: {
        ...IOS_CHECKOUT_SHEET_ENTER_ANIMATE,
        transition: reduceMotion ? { duration: 0 } : IOS_CHECKOUT_SHEET_ENTER_TRANSITION,
      },
      leave: {
        y: '100%',
        opacity: 1,
        transition: reduceMotion ? REDUCED_TRANSITION : IOS_CHECKOUT_SHEET_EXIT_TRANSITION,
      },
    }),
    [reduceMotion],
  )

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose?.()
    },
    [onClose],
  )

  useEffect(() => {
    if (!open) return
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onKeyDown])

  const meta = [movie?.year, movie?.genre, movie?.duration].filter(Boolean).join(' · ')

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="checkout-scrim"
            role="presentation"
            aria-hidden
            variants={scrimVariants}
            initial="hidden"
            animate="visible"
            exit="leave"
            className="absolute inset-0 z-[80] cursor-default bg-black/[0.58]"
            onClick={onClose}
          />
          <motion.div
            key="checkout-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-sheet-title"
            variants={sheetVariants}
            initial="offscreen"
            animate="onscreen"
            exit="leave"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[81] flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] sm:px-4 sm:pb-[max(1rem,env(safe-area-inset-bottom,0px))]"
            style={{ willChange: 'transform' }}
          >
            <div className="pointer-events-auto w-full min-w-0 max-w-[430px] overflow-hidden rounded-[28px] bg-[#222222] shadow-[0_-8px_40px_rgba(0,0,0,0.45)] sm:rounded-[32px]">
              <div className="px-5 pt-5 pb-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 id="checkout-sheet-title" className="text-[22px] font-bold tracking-[-0.02em] text-white">
                    Checkout
                  </h2>
                  <button
                    type="button"
                    onClick={onClose}
                    className="-mr-1 -mt-1 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-white transition-colors active:bg-white/10"
                    aria-label="Close"
                  >
                    <X size={22} strokeWidth={2.2} />
                  </button>
                </div>

                <div className="mt-5 flex gap-3">
                  <div className="h-[72px] w-[108px] shrink-0 overflow-hidden rounded-xl bg-black/40">
                    {posterUrl ? (
                      <img src={posterUrl} alt="" className="h-full w-full object-cover object-top" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-[17px] font-bold leading-snug tracking-[-0.02em] text-white">{movie?.title}</p>
                    <p className="mt-1 text-[13px] font-medium text-[#8E8E93]">{meta}</p>
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                    <Ticket size={20} className="text-[#8E8E93]" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold leading-snug text-white">{whenLine}</p>
                    <p className="mt-0.5 text-[13px] font-medium text-[#8E8E93]">{detailLine}</p>
                  </div>
                </div>

                <div className="my-5 h-px bg-white/[0.08]" />

                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border-none bg-transparent py-1 text-left transition-colors active:bg-white/[0.04]"
                >
                  <span className="text-[15px] font-medium text-white">Pay With</span>
                  <span className="flex items-center gap-2">
                    <span className="text-[14px] font-medium tracking-wide text-white/90">•••• {cardLast4}</span>
                    <MastercardMark />
                    <ChevronRight size={18} className="text-[#8E8E93]" strokeWidth={2.2} />
                  </span>
                </button>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[15px] font-medium text-white">Total</span>
                  <span className="text-[17px] font-bold tracking-[-0.02em] text-white">{totalFormatted}</span>
                </div>

                <button
                  type="button"
                  onClick={onPay}
                  className="mt-6 h-[52px] w-full cursor-pointer rounded-full border-none bg-yellow text-[15px] font-bold tracking-[-0.01em] text-dark transition-transform active:scale-[0.98] active:brightness-95"
                  style={{
                    boxShadow: '0 4px 20px -4px rgba(245,197,24,0.35), 0 1px 3px rgba(245,197,24,0.15)',
                  }}
                >
                  Pay
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
