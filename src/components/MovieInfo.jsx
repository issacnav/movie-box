import imdbLogo from '../assets/imdb-logo.svg'

export default function MovieInfo({
  year,
  genre,
  duration,
  imdbRating,
  showImdbRating = true,
  /** Theatre screen: no pull-up margin; parent owns vertical rhythm. */
  variant = 'default',
}) {
  const isTheatre = variant === 'theatre'

  return (
    <div
      className={`relative z-10 flex flex-col items-center ${isTheatre ? 'gap-0' : '-mt-1 gap-2.5'}`}
    >
      <div
        className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-0 text-[15px] tracking-wide text-gray-light ${isTheatre ? 'leading-5' : ''}`}
      >
        <span>{year}</span>
        <span className="select-none text-gray-text" aria-hidden>
          &#183;
        </span>
        <span>{genre}</span>
        <span className="select-none text-gray-text" aria-hidden>
          &#183;
        </span>
        <span>{duration}</span>
      </div>

      {showImdbRating && (
        <div className="flex items-center gap-2">
          <img
            src={imdbLogo}
            alt="IMDb"
            className="h-[22px] w-auto shrink-0"
            width={44}
            height={22}
          />
          <span className="text-[16px] font-medium text-white">{imdbRating}</span>
        </div>
      )}
    </div>
  )
}
