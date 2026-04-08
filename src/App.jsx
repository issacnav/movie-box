import { useState, useRef, useCallback, useLayoutEffect } from 'react'
import TopNav from './components/TopNav'
import MoviePoster from './components/MoviePoster'
import MovieInfo from './components/MovieInfo'
import ActionButtons from './components/ActionButtons'
import BottomNav from './components/BottomNav'
import BookingScreen from './components/BookingScreen'
import TicketScreen from './components/TicketScreen'
import SeatSelectorScreen from './components/SeatSelectorScreen'

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
  const [seatSummary, setSeatSummary] = useState(null)
  const containerRef = useRef(null)
  const posterCardRef = useRef(null)
  const overlayRef = useRef(null)
  const miniCardRef = useRef(null)
  const posterRectRef = useRef(null)
  /** One-shot: skip opacity transition when landing on home after reverse morph (avoids gap + slow fade). */
  const revealHomeInstantRef = useRef(false)

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
    if (!container || !miniCard) {
      revealHomeInstantRef.current = true
      setScreen('home')
      return
    }
    posterRectRef.current.reverseFrom = relativeRect(miniCard, container)
    posterRectRef.current.reverseFrom.borderRadius = 12
    setScreen('morphing-back')
  }, [])

  const handleBookingContinue = useCallback(() => setScreen('tickets'), [])
  const handleTicketsBack = useCallback(() => setScreen('booking'), [])
  const handleTicketsContinue = useCallback((count) => {
    setTicketQty(count)
    setScreen('seats')
  }, [])
  const handleSeatsBack = useCallback(() => setScreen('tickets'), [])
  const handleSeatsContinue = useCallback((payload) => {
    setSeatSummary(payload?.summary ?? null)
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

    const done = () => {
      revealHomeInstantRef.current = true
      setScreen('home')
    }
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

  const isMorphing = screen === 'morphing' || screen === 'morphing-back'
  const showBookingLayer = screen === 'morphing' || screen === 'booking'
  const bookingContentLive = screen === 'booking'
  const isTickets = screen === 'tickets'
  const isSeats = screen === 'seats'
  const isConfirmation = screen === 'confirmation'

  /**
   * Keep the home layer mounted while booking (and other full-screen flows except tickets).
   * If we unmount on booking, closing runs reverse morph then remounts home from scratch —
   * layout/fonts/images pop in after a short opacity fade. Staying mounted keeps a smooth return.
   */
  const homeLayerMounted = !isTickets
  const homeLayerVisible = screen === 'home'
  const homeLayerInteractive = screen === 'home'
  const { duration: homeFadeDuration } = morphTiming()

  const skipHomeOpacityTransition = homeLayerVisible && revealHomeInstantRef.current

  useLayoutEffect(() => {
    if (screen === 'home') {
      revealHomeInstantRef.current = false
    }
  }, [screen])

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen max-w-[430px] mx-auto bg-dark overflow-hidden flex flex-col"
    >
      {/* Home screen — DOM stays warm under booking/confirmation; only opacity toggles */}
      {homeLayerMounted && (
        <div
          className="flex min-h-0 flex-1 flex-col"
          style={{
            opacity: homeLayerVisible ? 1 : 0,
            pointerEvents: homeLayerInteractive ? 'auto' : 'none',
            transition: skipHomeOpacityTransition
              ? 'none'
              : `opacity ${homeFadeDuration} ${MORPH_EASE}`,
          }}
          aria-hidden={!homeLayerInteractive}
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

      {isSeats && (
        <div
          className="seat-fullscreen ticket-fullscreen fixed inset-0 z-[60] flex h-[100dvh] max-h-[100dvh] w-full justify-center overflow-hidden overscroll-none bg-[#050506]"
          style={{ paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}
        >
          <div className="flex h-full min-h-0 w-full max-w-[430px] flex-col overflow-hidden">
            <SeatSelectorScreen
              posterUrl={POSTER_URL}
              movie={MOVIE}
              ticketQty={ticketQty}
              onBack={handleSeatsBack}
              onContinue={handleSeatsContinue}
              active={isSeats}
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
          {seatSummary && (
            <p className="text-gray-text text-[14px] max-w-[280px] -mt-1">{seatSummary}</p>
          )}
          <button
            type="button"
            onClick={() => {
              setSeatSummary(null)
              setScreen('home')
            }}
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
