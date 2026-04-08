import { useState, useRef, useCallback, useLayoutEffect } from 'react'
import TopNav from './components/TopNav'
import MoviePoster from './components/MoviePoster'
import MovieInfo from './components/MovieInfo'
import ActionButtons from './components/ActionButtons'
import BottomNav from './components/BottomNav'
import BookingScreen from './components/BookingScreen'
import TicketScreen from './components/TicketScreen'

const POSTER_URL = '/poster.jpg'

const MOVIE = {
  title: 'Dune 3',
  year: '2027',
  genre: 'Sci-Fi',
  duration: '165 min',
  imdbRating: '8.6',
}

function relativeRect(el, container) {
  const elRect = el.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  return {
    top: elRect.top - containerRect.top,
    left: elRect.left - containerRect.left,
    width: elRect.width,
    height: elRect.height,
  }
}

// Mini card target position in booking layout
const MINI_CARD_TARGET = { top: 78, left: 24, width: 120, height: 80, borderRadius: 12 }

/** Morph: skill guidance — fast product motion (~150–300ms), ease-out-first feel, then tune duration */
const MORPH_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const MORPH_DURATION = '0.38s'
const MORPH_FALLBACK_MS = 480

function morphTiming() {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return { duration: '0.05s', fallbackMs: 120 }
  }
  return { duration: MORPH_DURATION, fallbackMs: MORPH_FALLBACK_MS }
}

function App() {
  const [screen, setScreen] = useState('home')
  const [ticketQty, setTicketQty] = useState(1)
  const containerRef = useRef(null)
  const posterCardRef = useRef(null)
  const overlayRef = useRef(null)
  const miniCardRef = useRef(null)
  const posterRectRef = useRef(null)

  const handleBuyTickets = useCallback(() => {
    const container = containerRef.current
    const posterCard = posterCardRef.current?.querySelector('.poster-card')
    if (!container || !posterCard) return
    posterRectRef.current = relativeRect(posterCard, container)
    posterRectRef.current.borderRadius = 20
    setScreen('morphing')
  }, [])

  const handleClose = useCallback(() => {
    const container = containerRef.current
    const miniCard = miniCardRef.current
    if (!container || !miniCard) { setScreen('home'); return }
    posterRectRef.current.reverseFrom = relativeRect(miniCard, container)
    posterRectRef.current.reverseFrom.borderRadius = 12
    setScreen('morphing-back')
  }, [])

  const handleBookingContinue = useCallback(() => setScreen('tickets'), [])
  const handleTicketsBack = useCallback(() => setScreen('booking'), [])
  const handleTicketsContinue = useCallback((count) => {
    setTicketQty(count)
    setScreen('confirmation')
  }, [])

  // Forward morph
  useLayoutEffect(() => {
    if (screen !== 'morphing' || !overlayRef.current) return
    const overlay = overlayRef.current
    const from = posterRectRef.current
    const to = MINI_CARD_TARGET

    overlay.style.cssText = `
      position:absolute; z-index:50;
      top:${from.top}px; left:${from.left}px;
      width:${from.width}px; height:${from.height}px;
      border-radius:${from.borderRadius}px;
      object-fit:cover; object-position:top; opacity:1;
    `
    overlay.offsetHeight
    const { duration, fallbackMs } = morphTiming()
    overlay.style.transition = `all ${duration} ${MORPH_EASE}`
    overlay.style.top = to.top + 'px'
    overlay.style.left = to.left + 'px'
    overlay.style.width = to.width + 'px'
    overlay.style.height = to.height + 'px'
    overlay.style.borderRadius = to.borderRadius + 'px'

    const done = () => setScreen('booking')
    const onEnd = (e) => {
      if (e.target !== overlay || e.propertyName !== 'top') return
      overlay.removeEventListener('transitionend', onEnd)
      clearTimeout(fb)
      done()
    }
    overlay.addEventListener('transitionend', onEnd)
    const fb = setTimeout(() => {
      overlay.removeEventListener('transitionend', onEnd)
      done()
    }, fallbackMs)
    return () => {
      clearTimeout(fb)
      overlay.removeEventListener('transitionend', onEnd)
    }
  }, [screen])

  // Reverse morph
  useLayoutEffect(() => {
    if (screen !== 'morphing-back' || !overlayRef.current) return
    const overlay = overlayRef.current
    const from = posterRectRef.current?.reverseFrom || MINI_CARD_TARGET
    const to = posterRectRef.current

    overlay.style.cssText = `
      position:absolute; z-index:50;
      top:${from.top}px; left:${from.left}px;
      width:${from.width}px; height:${from.height}px;
      border-radius:${from.borderRadius}px;
      object-fit:cover; object-position:top; opacity:1;
    `
    overlay.offsetHeight
    const { duration, fallbackMs } = morphTiming()
    overlay.style.transition = `all ${duration} ${MORPH_EASE}`
    overlay.style.top = to.top + 'px'
    overlay.style.left = to.left + 'px'
    overlay.style.width = to.width + 'px'
    overlay.style.height = to.height + 'px'
    overlay.style.borderRadius = to.borderRadius + 'px'

    const done = () => setScreen('home')
    const onEnd = (e) => {
      if (e.target !== overlay || e.propertyName !== 'top') return
      overlay.removeEventListener('transitionend', onEnd)
      clearTimeout(fb)
      done()
    }
    overlay.addEventListener('transitionend', onEnd)
    const fb = setTimeout(() => {
      overlay.removeEventListener('transitionend', onEnd)
      done()
    }, fallbackMs)
    return () => {
      clearTimeout(fb)
      overlay.removeEventListener('transitionend', onEnd)
    }
  }, [screen])

  const isHome = screen === 'home'
  const isMorphing = screen === 'morphing' || screen === 'morphing-back'
  const showBookingLayer = screen === 'morphing' || screen === 'booking'
  const bookingContentLive = screen === 'booking'
  const isTickets = screen === 'tickets'
  const isConfirmation = screen === 'confirmation'

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen max-w-[430px] mx-auto bg-dark overflow-hidden flex flex-col"
    >
      {/* Home screen */}
      {(isHome || screen === 'morphing' || screen === 'morphing-back') && (
        <div
          className="flex flex-col flex-1"
          style={{ opacity: isMorphing ? 0 : 1, transition: 'opacity 0.15s' }}
        >
          <TopNav />
          <div ref={posterCardRef}>
            <MoviePoster posterUrl={POSTER_URL} title={MOVIE.title} />
          </div>
          <MovieInfo {...MOVIE} />
          <ActionButtons onBuyTickets={handleBuyTickets} />
          <BottomNav />
        </div>
      )}

      {/* Booking layer under morph: static copy + stagger hidden until morph completes */}
      {showBookingLayer && (
        <div className="absolute inset-0" style={{ zIndex: 20, backgroundColor: '#0D0D0F' }}>
          <BookingScreen
            posterUrl={POSTER_URL}
            onClose={handleClose}
            onContinue={handleBookingContinue}
            movie={MOVIE}
            miniCardRef={miniCardRef}
            active={bookingContentLive}
            revealStaticCopy={bookingContentLive}
          />
        </div>
      )}

      {/* Tickets: fixed to viewport so layout never collapses when home/booking unmount */}
      {isTickets && (
        <div
          className="ticket-fullscreen fixed inset-0 z-[60] flex h-[100dvh] max-h-[100dvh] w-full justify-center overflow-hidden overscroll-none bg-[#0D0D0F]"
          style={{ paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}
        >
          <div className="flex h-full min-h-0 w-full max-w-[430px] flex-col overflow-hidden">
            <TicketScreen
              posterUrl={POSTER_URL}
              movie={MOVIE}
              onBack={handleTicketsBack}
              onContinue={handleTicketsContinue}
              active={isTickets}
            />
          </div>
        </div>
      )}

      {isConfirmation && (
        <div
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-4 px-8 text-center bg-[#0D0D0F] min-h-[100dvh]"
          style={{ paddingLeft: 'max(2rem, env(safe-area-inset-left))', paddingRight: 'max(2rem, env(safe-area-inset-right))' }}
        >
          <p className="text-white text-[22px] font-bold">You&apos;re set</p>
          <p className="text-gray-text text-[15px] max-w-[280px]">
            {ticketQty} ticket{ticketQty === 1 ? '' : 's'} for {MOVIE.title}
          </p>
          <button
            type="button"
            onClick={() => setScreen('home')}
            className="mt-2 h-[48px] px-8 rounded-full bg-yellow text-dark text-[15px] font-semibold border-none cursor-pointer"
          >
            Back to movies
          </button>
        </div>
      )}

      {/* Morph overlay */}
      {isMorphing && (
        <img ref={overlayRef} src={POSTER_URL} alt="" style={{ opacity: 0 }} />
      )}
    </div>
  )
}

export default App
