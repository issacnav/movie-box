import { useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from 'framer-motion'
import { cn } from '../lib/utils'
import { ticketSilhouetteMaskStyle } from './TicketSilhouette.jsx'

function clipStyleFromProps(svgClipPathId, clipPath) {
  if (svgClipPathId) {
    const u = `url(#${svgClipPathId})`
    return { clipPath: u, WebkitClipPath: u }
  }
  if (clipPath) {
    return { clipPath, WebkitClipPath: clipPath }
  }
  return {}
}

export function InteractiveCard({
  children,
  className,
  wrapperClassName,
  frameClassName,
  clipPath,
  svgClipPathId,
  /** SVG mask element id — applied on inner wrapper below 3D transform for reliable painting */
  maskId,
  InteractiveColor = '#07eae6ff',
  borderRadius = '48px',
  rotationFactor = 0.4,
  transitionDuration = 0.3,
  transitionEasing = 'easeInOut',
  tailwindBgClass = 'bg-transparent backdrop-blur-md',
}) {
  const cardRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const reduceMotion = useReducedMotion()

  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)

  const rotateXTrans = useTransform(y, [0, 1], [rotationFactor * 15, -rotationFactor * 15])
  const rotateYTrans = useTransform(x, [0, 1], [-rotationFactor * 15, rotationFactor * 15])

  const handlePointerMove = (e) => {
    if (reduceMotion) return
    const bounds = cardRef.current?.getBoundingClientRect()
    if (!bounds) return

    const px = (e.clientX - bounds.left) / bounds.width
    const py = (e.clientY - bounds.top) / bounds.height

    x.set(px)
    y.set(py)
  }

  const handlePointerLeave = () => {
    setIsHovered(false)
    if (!reduceMotion) {
      x.set(0.5)
      y.set(0.5)
    }
  }

  const xPercentage = useTransform(x, (val) => `${val * 100}%`)
  const yPercentage = useTransform(y, (val) => `${val * 100}%`)

  const interactiveBackground = useMotionTemplate`radial-gradient(circle at ${xPercentage} ${yPercentage}, ${InteractiveColor} 0%, transparent 80%)`

  const usesSvgMask = Boolean(maskId)
  const usesClip = Boolean(svgClipPathId || clipPath)
  const customShape = usesSvgMask || usesClip
  const maskStyles = ticketSilhouetteMaskStyle(maskId)
  const clipStyles = clipStyleFromProps(svgClipPathId, clipPath)
  const shapeStyles = usesSvgMask ? maskStyles : clipStyles

  return (
    <motion.div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={handlePointerLeave}
      style={{
        perspective: 1000,
        borderRadius: customShape ? 0 : borderRadius,
      }}
      className={cn('relative isolate', wrapperClassName ?? 'w-[320px] aspect-[17/21]')}
    >
      {/* 3D transform only here — clip-path + preserve-3d on same layer often paints empty in WebKit */}
      <motion.div
        style={{
          rotateX: reduceMotion ? 0 : rotateXTrans,
          rotateY: reduceMotion ? 0 : rotateYTrans,
          transformStyle: 'preserve-3d',
          transition: `transform ${transitionDuration}s ${transitionEasing}`,
        }}
        className={cn(
          'relative w-full',
          customShape ? 'overflow-visible' : 'overflow-hidden',
          frameClassName ?? 'rounded-xl border border-white/10 shadow-lg',
        )}
      >
        <div
          className={cn('relative w-full', customShape ? 'overflow-hidden' : '')}
          style={{
            ...shapeStyles,
            borderRadius: customShape ? 0 : undefined,
          }}
        >
          <motion.div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              ...shapeStyles,
              borderRadius: customShape ? 0 : borderRadius,
              background: interactiveBackground,
              transition: `opacity ${transitionDuration}s ${transitionEasing}`,
              opacity: reduceMotion ? 0 : isHovered ? 0.6 : 0,
            }}
          />

          <div
            className={cn('relative z-10 w-full min-h-0', tailwindBgClass, className)}
            style={{ borderRadius: customShape ? 0 : borderRadius }}
          >
            {children}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
