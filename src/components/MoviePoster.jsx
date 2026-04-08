export default function MoviePoster({ posterUrl, title = 'Dune 3' }) {
  return (
    <div className="relative w-full px-4">
      <div className="poster-card rounded-[20px] overflow-hidden aspect-[3/4] max-h-[520px]">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={`${title} poster`}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-amber-950 via-stone-900 to-black flex items-center justify-center">
            <span className="text-white/50 text-lg">{title}</span>
          </div>
        )}

        {/* Bottom gradient fade to dark background */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark via-dark/70 to-transparent" />
      </div>
    </div>
  )
}
