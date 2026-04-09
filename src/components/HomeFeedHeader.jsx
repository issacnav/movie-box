const CATEGORIES = ['In Theatre', 'Box Office', 'Coming Soon']
const GENRES = ['Action', 'Crime', 'Comedy', 'Drama', 'Thriller']

export default function HomeFeedHeader({
  categoryIndex = 0,
  onCategoryChange,
  genreIndex = 0,
  onGenreChange,
}) {
  return (
    <div className="w-full shrink-0">
      <div className="flex gap-6 overflow-x-auto hide-scrollbar px-6 pb-0.5 pt-1">
        {CATEGORIES.map((label, i) => {
          const active = i === categoryIndex
          return (
            <button
              key={label}
              type="button"
              onClick={() => onCategoryChange?.(i)}
              className="relative shrink-0 cursor-pointer border-none bg-transparent pb-2.5 font-[family-name:var(--font-display)] text-[15px] tracking-tight transition-colors"
              style={{
                color: active ? 'var(--color-white)' : 'var(--color-gray-text)',
                fontWeight: active ? 600 : 500,
              }}
            >
              {label}
              {active && (
                <span
                  className="absolute bottom-0 left-1/2 h-[3px] w-7 -translate-x-1/2 rounded-full bg-yellow"
                  aria-hidden
                />
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto hide-scrollbar px-6 pb-1">
        {GENRES.map((g, i) => {
          const active = i === genreIndex
          return (
            <button
              key={g}
              type="button"
              onClick={() => onGenreChange?.(i)}
              className={`shrink-0 cursor-pointer rounded-full border px-4 py-2 font-[family-name:var(--font-display)] text-[13px] tracking-tight transition-colors ${
                active
                  ? 'border-yellow/85 text-white bg-white/[0.04]'
                  : 'border-white/18 text-gray-light hover:border-white/28'
              }`}
            >
              {g}
            </button>
          )
        })}
      </div>
    </div>
  )
}
