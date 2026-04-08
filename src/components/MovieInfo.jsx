import imdbLogo from '../assets/imdb-logo.svg'

export default function MovieInfo({ year, genre, duration, imdbRating }) {
  return (
    <div className="flex flex-col items-center gap-2.5 -mt-6 relative z-10">
      {/* Year | Genre | Duration */}
      <div className="flex items-center gap-2 text-[15px] text-gray-light tracking-wide">
        <span>{year}</span>
        <span className="text-gray-text">&#183;</span>
        <span>{genre}</span>
        <span className="text-gray-text">&#183;</span>
        <span>{duration}</span>
      </div>

      {/* IMDb Rating */}
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
    </div>
  )
}
