import { useState, useRef, useCallback, useLayoutEffect, useMemo, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const MotionDiv = motion.div
import { Star } from 'lucide-react'
import TopNav from './components/TopNav'
import TheatreTopNav from './components/TheatreTopNav'
import HomeFeedHeader from './components/HomeFeedHeader'
import PosterRing3D from './components/PosterRing3D'
import MoviePoster from './components/MoviePoster'
import MovieInfo from './components/MovieInfo'
import ActionButtons from './components/ActionButtons'
import BottomNav from './components/BottomNav'
import { CLASSIC_HOME_MOVIE, FEATURED_MOVIES } from './data/featuredMovies'
import BookingScreen from './components/BookingScreen'
import TicketScreen from './components/TicketScreen'
import SeatSelectorScreen from './components/SeatSelectorScreen'
import CheckoutSheet from './components/CheckoutSheet'
import TicketGeneratingScreen from './components/TicketGeneratingScreen'
import DigitalTicketScreen from './components/DigitalTicketScreen'

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

/** `?loader=1` — opens ticket generating UI (dev preview / QA; works in any build mode). */
function ticketLoaderPreviewFromSearch() {
  return (
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('loader') === '1'
  )
}

function App() {
  /** Bottom bar: classic “Now Showing” home vs Theatre (ring browse). */
  const [homeTab, setHomeTab] = useState('home')
  const [selectedMovieIndex, setSelectedMovieIndex] = useState(0)
  /** Theatre: follows ring front card during drag; keeps text in sync with posters. */
  const [theatreDisplayIndex, setTheatreDisplayIndex] = useState(0)
  const [homeCategoryIndex, setHomeCategoryIndex] = useState(0)
  const [homeGenreIndex, setHomeGenreIndex] = useState(0)

  const handleTheatreSnapIndex = useCallback((idx) => {
    setSelectedMovieIndex(idx)
  }, [])

  useEffect(() => {
    if (homeTab === 'theatre') {
      setTheatreDisplayIndex(selectedMovieIndex)
    }
  }, [homeTab, selectedMovieIndex])

  const activeHomeMovie = useMemo(() => {
    if (homeTab === 'theatre') {
      return FEATURED_MOVIES[theatreDisplayIndex] ?? FEATURED_MOVIES[0]
    }
    return CLASSIC_HOME_MOVIE
  }, [homeTab, theatreDisplayIndex])

  const theatreMetaTransition = useMemo(() => {
    const reduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return {
      duration: reduced ? 0.06 : 0.24,
      ease: [0.22, 1, 0.36, 1],
    }
  }, [])

  const [screen, setScreen] = useState(() =>
    ticketLoaderPreviewFromSearch() ? 'ticket-generating' : 'home',
  )
  const [ticketQty, setTicketQty] = useState(1)
  const [seatSummary, setSeatSummary] = useState(null)
  const [bookingWhenLine, setBookingWhenLine] = useState(null)
  const [bookingScreenNumber, setBookingScreenNumber] = useState(2)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  /** Keeps ticket screen mounted briefly while seats crossfades in (screen 2 → 3). */
  const [ticketsExitAfterContinue, setTicketsExitAfterContinue] = useState(false)
  const [issuedTicketId, setIssuedTicketId] = useState(() => {
    if (!ticketLoaderPreviewFromSearch()) return null
    return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `TKT-${Date.now()}`
  })

  const checkoutTotalFormatted = useMemo(() => {
    const pricePerTicket = 25
    return `$${(pricePerTicket * ticketQty).toFixed(2)}`
  }, [ticketQty])
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

  const handleBookingContinue = useCallback((detail) => {
    if (detail?.whenLine) setBookingWhenLine(detail.whenLine)
    if (detail?.screenNumber != null) setBookingScreenNumber(detail.screenNumber)
    setScreen('tickets')
  }, [])
  const handleTicketsBack = useCallback(() => setScreen('booking'), [])
  const handleTicketsContinue = useCallback((count) => {
    setTicketQty(count)
    setTicketsExitAfterContinue(true)
    setScreen('seats')
  }, [])
  const handleSeatsBack = useCallback(() => {
    setCheckoutOpen(false)
    setTicketsExitAfterContinue(false)
    setScreen('tickets')
  }, [])
  const handleSeatsContinue = useCallback((payload) => {
    setSeatSummary(payload?.summary ?? null)
    setCheckoutOpen(true)
  }, [])

  const handleCheckoutClose = useCallback(() => setCheckoutOpen(false), [])

  const handleCheckoutPay = useCallback(() => {
    setCheckoutOpen(false)
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `TKT-${Date.now()}`
    setIssuedTicketId(id)
    setScreen('ticket-generating')
  }, [])

  useEffect(() => {
    if (screen !== 'ticket-generating') return
    const reduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ms = reduced ? 1000 : 3000
    const t = window.setTimeout(() => setScreen('ticket-ready'), ms)
    return () => window.clearTimeout(t)
  }, [screen])

  const handleTicketDone = useCallback(() => {
    setSeatSummary(null)
    setBookingWhenLine(null)
    setBookingScreenNumber(2)
    setCheckoutOpen(false)
    setIssuedTicketId(null)
    setScreen('home')
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
  const isTicketGenerating = screen === 'ticket-generating'
  const isTicketReady = screen === 'ticket-ready'

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

  useEffect(() => {
    if (screen !== 'seats') setTicketsExitAfterContinue(false)
  }, [screen])

  useEffect(() => {
    if (!ticketsExitAfterContinue || screen !== 'seats') return undefined
    const id = window.setTimeout(() => setTicketsExitAfterContinue(false), 420)
    return () => window.clearTimeout(id)
  }, [screen, ticketsExitAfterContinue])

  return (
    <div
      ref={containerRef}
      className="relative mx-auto flex h-[100dvh] max-h-[100dvh] min-h-0 max-w-[430px] flex-col overflow-x-clip overflow-hidden bg-dark"
    >
      {/* Home screen — DOM stays warm under booking/confirmation; only opacity toggles */}
      {homeLayerMounted && (
        <div
          className={`flex min-h-0 flex-1 flex-col pb-24 ${homeTab === 'home' ? 'overflow-y-auto' : 'overflow-hidden'}`}
          style={{
            opacity: homeLayerVisible ? 1 : 0,
            pointerEvents: homeLayerInteractive ? 'auto' : 'none',
            transition: skipHomeOpacityTransition
              ? 'none'
              : `opacity ${homeFadeDuration} ${MORPH_EASE}`,
          }}
          aria-hidden={!homeLayerInteractive}
        >
          {homeTab === 'home' ? (
            <>
              <TopNav />
              <div ref={posterCardRef}>
                <MoviePoster posterUrl={CLASSIC_HOME_MOVIE.posterUrl} title={CLASSIC_HOME_MOVIE.title} />
              </div>
              <MovieInfo {...CLASSIC_HOME_MOVIE} />
              <ActionButtons
                onBuyTickets={handleBuyTickets}
                trailerUrl={CLASSIC_HOME_MOVIE.trailerYoutubeUrl}
              />
            </>
          ) : (
            <>
              <TheatreTopNav onMenuPress={() => {}} onSearchPress={() => {}} />
              <HomeFeedHeader
                categoryIndex={homeCategoryIndex}
                onCategoryChange={setHomeCategoryIndex}
                genreIndex={homeGenreIndex}
                onGenreChange={setHomeGenreIndex}
              />
              <div className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden py-1">
                <PosterRing3D
                  movies={FEATURED_MOVIES}
                  activeIndex={selectedMovieIndex}
                  onActiveIndexChange={handleTheatreSnapIndex}
                  onLiveFrontIndexChange={setTheatreDisplayIndex}
                  posterCardRef={posterCardRef}
                />
              </div>
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={activeHomeMovie.id}
                  className="flex shrink-0 flex-col items-center gap-2 px-4 pt-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={theatreMetaTransition}
                >
                  <h1 className="text-center font-[family-name:var(--font-display)] text-[21px] font-semibold leading-[1.25] tracking-tight text-white">
                    {activeHomeMovie.title}
                  </h1>
                  <div className="flex h-5 items-center justify-center gap-1.5 text-white">
                    <Star
                      className="size-4 shrink-0 fill-yellow text-yellow"
                      aria-hidden
                      strokeWidth={0}
                    />
                    <span className="text-[15px] font-medium tabular-nums leading-none">
                      {activeHomeMovie.imdbRating}
                    </span>
                  </div>
                  <MovieInfo {...activeHomeMovie} showImdbRating={false} variant="theatre" />
                </motion.div>
              </AnimatePresence>
              <div className="shrink-0">
                <ActionButtons
                  onBuyTickets={handleBuyTickets}
                  trailerUrl={activeHomeMovie.trailerYoutubeUrl}
                  compact
                />
              </div>
            </>
          )}
          <BottomNav activeTab={homeTab} onTabChange={setHomeTab} />
        </div>
      )}

      {/* Booking layer under morph: static copy + stagger hidden until morph completes */}
      {showBookingLayer && (
        <div className="absolute inset-0" style={{ zIndex: 20, backgroundColor: '#0D0D0F' }}>
          <BookingScreen
            posterUrl={activeHomeMovie.posterUrl}
            onClose={handleClose}
            onContinue={handleBookingContinue}
            movie={activeHomeMovie}
            miniCardRef={miniCardRef}
            active={bookingContentLive}
            revealStaticCopy={bookingContentLive}
          />
        </div>
      )}

      {/* Tickets + seats: one shell + shared bg; crossfade on Continue so step 2 → 3 feels continuous */}
      {(isTickets || isSeats || ticketsExitAfterContinue) && (
        <div
          className="ticket-fullscreen seat-fullscreen fixed inset-0 z-[60] flex h-[100dvh] max-h-[100dvh] w-full justify-center overflow-hidden overscroll-none bg-[#0D0D0F]"
          style={{ paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}
        >
          <div className="relative h-full min-h-0 w-full max-w-[430px] flex-1 overflow-hidden">
            {(isTickets || ticketsExitAfterContinue) && (
              <MotionDiv
                className="absolute inset-0 z-10 flex min-h-0 flex-col overflow-hidden"
                initial={false}
                animate={{
                  opacity: isTickets ? 1 : 0,
                }}
                transition={{
                  duration: 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  pointerEvents: isTickets && !isSeats ? 'auto' : 'none',
                }}
              >
                <TicketScreen
                  posterUrl={activeHomeMovie.posterUrl}
                  movie={activeHomeMovie}
                  onBack={handleTicketsBack}
                  onContinue={handleTicketsContinue}
                  active={isTickets && !isSeats}
                />
              </MotionDiv>
            )}
            {isSeats && (
              <div className="absolute inset-0 z-20 flex min-h-0 flex-col overflow-hidden">
                <SeatSelectorScreen
                  movie={activeHomeMovie}
                  ticketQty={ticketQty}
                  onBack={handleSeatsBack}
                  onContinue={handleSeatsContinue}
                  active={isSeats}
                />
                <CheckoutSheet
                  open={checkoutOpen}
                  onClose={handleCheckoutClose}
                  onPay={handleCheckoutPay}
                  posterUrl={activeHomeMovie.posterUrl}
                  movie={activeHomeMovie}
                  whenLine={bookingWhenLine ?? 'Pick a showtime'}
                  detailLine={
                    seatSummary
                      ? `Screen ${bookingScreenNumber} · ${seatSummary}`
                      : `Screen ${bookingScreenNumber}`
                  }
                  totalFormatted={checkoutTotalFormatted}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {isTicketGenerating && <TicketGeneratingScreen />}

      {isTicketReady && issuedTicketId && (
        <DigitalTicketScreen
          posterUrl={activeHomeMovie.posterUrl}
          movie={activeHomeMovie}
          whenLine={bookingWhenLine ?? ''}
          detailLine={
            seatSummary
              ? `Screen ${bookingScreenNumber} · ${seatSummary}`
              : `Screen ${bookingScreenNumber}`
          }
          ticketId={issuedTicketId}
          onDone={handleTicketDone}
        />
      )}

      {/* Morph overlay */}
      {isMorphing && (
        <img ref={overlayRef} src={activeHomeMovie.posterUrl} alt="" style={{ opacity: 0 }} />
      )}
    </div>
  )
}

export default App
