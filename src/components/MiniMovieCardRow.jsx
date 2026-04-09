import imdbLogo from '../assets/imdb-logo.svg'

/**
 * Shared mini poster + metadata row for booking (screen 2) and tickets (screen 3).
 * Keeps size and typography identical so there is no jump when navigating between flows.
 */
export default function MiniMovieCardRow({
  posterUrl,
  movie,
  miniCardRef,
  hidePosterAndText = false,
}) {
  return (
    <div className="mx-5 mt-5 flex min-w-0 items-center gap-3 sm:mx-6 sm:mt-6 sm:gap-4">
      <div
        ref={miniCardRef}
        className="w-[120px] h-[80px] rounded-[12px] overflow-hidden shrink-0"
      >
        <img
          src={posterUrl}
          alt={`${movie.title} poster`}
          className={`w-full h-full object-cover object-top ${hidePosterAndText ? 'opacity-0' : 'opacity-100'}`}
          draggable={false}
        />
      </div>
      <div
        className={`flex flex-col gap-1 min-w-0 flex-1 ${hidePosterAndText ? 'opacity-0' : 'opacity-100'}`}
        aria-hidden={hidePosterAndText}
      >
        <h3 className="text-white text-[18px] font-bold leading-tight">
          {movie.title}
        </h3>
        <span className="text-gray-light text-[13px]">
          {movie.year} · {movie.genre} · {movie.duration}
        </span>
        <div className="flex items-center gap-1.5">
          <img src={imdbLogo} alt="IMDb" className="h-[16px] w-auto" />
          <span className="text-white text-[13px] font-medium">{movie.imdbRating}</span>
        </div>
      </div>
    </div>
  )
}
