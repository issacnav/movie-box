import { useRef, useCallback, useEffect, useState, useLayoutEffect } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useMotionTemplate,
  useMotionValueEvent,
} from 'framer-motion'

const MotionDiv = motion.div

const STEP_SENSITIVITY = 0.42

/** Design-size layout (scaled down to fit the flex slot so buttons stay on-screen). */
const BASE_POSTER_W = 258
const BASE_POSTER_H = Math.round((BASE_POSTER_W * 4) / 3)
/** ~same proportion as prior (218/228) so side cards stay balanced on the ring. */
const BASE_RADIUS = Math.round(218 * (BASE_POSTER_W / 228))
const DESIGN_SCENE_W = 430
/** Tighter vertical padding than before — hero fills the stage; less “floating card” gap. */
const DESIGN_SCENE_VERTICAL_PAD = 48
const DESIGN_SCENE_H = BASE_POSTER_H + DESIGN_SCENE_VERTICAL_PAD

function frontIndexFromRotation(rotationDeg, count) {
  const step = 360 / count
  let k = Math.round(-rotationDeg / step)
  k = ((k % count) + count) % count
  return k
}

function snapRotation(rotationDeg, count) {
  const step = 360 / count
  const k = Math.round(-rotationDeg / step)
  return -k * step
}

export default function PosterRing3D({
  movies,
  activeIndex,
  onActiveIndexChange,
  /** Fired when the front-facing index changes (drag + snap) so copy can track the ring. */
  onLiveFrontIndexChange,
  posterCardRef,
}) {
  const count = movies.length
  const step = 360 / count

  const rot = useMotionValue(-activeIndex * step)
  const rotRef = useRef(-activeIndex * step)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startRot = useRef(0)

  const [liveIndex, setLiveIndex] = useState(() => activeIndex)
  const fitRef = useRef(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const el = fitRef.current
    if (!el) return

    const update = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      if (w < 8 || h < 8) return
      const s = Math.min(w / DESIGN_SCENE_W, h / DESIGN_SCENE_H, 1) * 0.995
      setScale(s)
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const target = -activeIndex * step
    rot.set(target)
    rotRef.current = target
    setLiveIndex(activeIndex)
  }, [activeIndex, step, rot])

  useMotionValueEvent(rot, 'change', (latest) => {
    setLiveIndex(frontIndexFromRotation(latest, count))
  })

  useEffect(() => {
    onLiveFrontIndexChange?.(liveIndex)
  }, [liveIndex, onLiveFrontIndexChange])

  const trackTransform = useMotionTemplate`rotateY(${rot}deg)`

  const handlePointerDown = useCallback(
    (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return
      dragging.current = true
      startX.current = e.clientX
      startRot.current = rot.get()
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [rot],
  )

  const handlePointerMove = useCallback(
    (e) => {
      if (!dragging.current) return
      const dx = e.clientX - startX.current
      const next = startRot.current + dx * STEP_SENSITIVITY
      rot.set(next)
      rotRef.current = next
    },
    [rot],
  )

  const endDrag = useCallback(
    (e) => {
      if (!dragging.current) return
      dragging.current = false
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
      const current = rot.get()
      const snapped = snapRotation(current, count)
      const idx = frontIndexFromRotation(snapped, count)
      animate(rot, snapped, {
        type: 'spring',
        stiffness: 118,
        damping: 22,
        mass: 0.85,
        onComplete: () => {
          rotRef.current = snapped
          onActiveIndexChange(idx)
        },
      })
    },
    [count, onActiveIndexChange, rot],
  )

  return (
    <div
      ref={fitRef}
      className="relative flex h-full min-h-0 w-full flex-col items-center justify-center select-none"
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: DESIGN_SCENE_W * scale,
          height: DESIGN_SCENE_H * scale,
        }}
      >
        <div
          style={{
            width: DESIGN_SCENE_W,
            height: DESIGN_SCENE_H,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          <div
            className="relative flex h-full w-full flex-col items-center justify-center"
            style={{ perspective: 1650, perspectiveOrigin: '50% 42%' }}
          >
            <div
              role="listbox"
              aria-label="Featured movies"
              className="relative mx-auto cursor-grab touch-none active:cursor-grabbing"
              style={{
                width: '100%',
                maxWidth: DESIGN_SCENE_W,
                height: DESIGN_SCENE_H,
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <MotionDiv
                className="absolute left-1/2 top-1/2"
                style={{
                  width: 1,
                  height: 1,
                  marginLeft: -0.5,
                  marginTop: -0.5,
                  transformStyle: 'preserve-3d',
                  transform: trackTransform,
                }}
              >
                {movies.map((movie, i) => {
                  const angle = i * step
                  const isFront = i === liveIndex
                  return (
                    <div
                      key={movie.id}
                      role="option"
                      aria-selected={isFront}
                      className="absolute left-0 top-0"
                      style={{
                        width: BASE_POSTER_W,
                        height: BASE_POSTER_H,
                        marginLeft: -BASE_POSTER_W / 2,
                        marginTop: -BASE_POSTER_H / 2,
                        transform: `rotateY(${angle}deg) translateZ(${BASE_RADIUS}px)`,
                        transformStyle: 'preserve-3d',
                        WebkitBackfaceVisibility: 'hidden',
                        backfaceVisibility: 'hidden',
                      }}
                    >
                      <div
                        ref={isFront ? posterCardRef : undefined}
                        className="h-full w-full"
                      >
                        <div
                          className={`poster-card h-full w-full overflow-hidden rounded-[22px] ${
                            isFront
                              ? 'shadow-[0_28px_72px_-12px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.1),0_0_64px_-24px_rgba(245,197,24,0.14)] ring-1 ring-white/[0.11]'
                              : 'shadow-[0_16px_48px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.06]'
                          } ${isFront ? '' : 'opacity-[0.36]'}`}
                          style={{
                            transform: isFront ? 'scale(1.03)' : 'scale(0.9)',
                            transition: 'opacity 0.24s cubic-bezier(0.22,1,0.36,1), transform 0.24s cubic-bezier(0.22,1,0.36,1), box-shadow 0.24s ease',
                          }}
                        >
                          <img
                            src={movie.posterUrl}
                            alt=""
                            className="h-full w-full object-cover object-top"
                            draggable={false}
                          />
                          <div
                            className={`pointer-events-none absolute inset-0 rounded-[22px] bg-gradient-to-t from-black/40 via-transparent to-black/[0.12] ${isFront ? 'opacity-100' : 'opacity-90'}`}
                          />
                          {isFront ? (
                            <div
                              className="pointer-events-none absolute inset-0 rounded-[22px]"
                              style={{
                                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.1)',
                              }}
                              aria-hidden
                            />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </MotionDiv>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
