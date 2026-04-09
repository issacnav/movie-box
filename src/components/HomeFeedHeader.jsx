const CATEGORIES = ['In Theatre', 'Box Office', 'Coming Soon']

/**
 * @param {object} props
 * @param {number} props.categoryIndex
 * @param {(i: number) => void} [props.onCategoryChange]
 * @param {string[]} props.genres — labels for chips (e.g. from carousel movie genres)
 * @param {number} props.genreIndex — index into `genres`, synced to front movie
 * @param {(i: number) => void} [props.onGenreChange]
 */
export default function HomeFeedHeader({
  categoryIndex = 0,
  onCategoryChange,
  genres = [],
  genreIndex = 0,
  onGenreChange,
}) {
  const safeGenreIndex = genres.length ? Math.min(genreIndex, genres.length - 1) : 0

  return (
    <div className="w-full min-w-0 shrink-0">
      <div className="flex gap-5 overflow-x-auto hide-scrollbar px-4 pb-0 pt-0.5 sm:gap-7 sm:px-5">
        {CATEGORIES.map((label, i) => {
          const active = i === categoryIndex
          return (
            <button
              key={label}
              type="button"
              onClick={() => onCategoryChange?.(i)}
              className="relative shrink-0 cursor-pointer border-none bg-transparent pb-2.5 font-[family-name:var(--font-display)] text-[14px] tracking-[-0.01em] transition-colors"
              style={{
                color: active ? 'var(--color-white)' : 'var(--color-gray-text)',
                fontWeight: active ? 600 : 500,
              }}
            >
              {label}
              {active && (
                <span
                  className="absolute bottom-0 left-1/2 h-[2.5px] w-8 -translate-x-1/2 rounded-full bg-yellow shadow-[0_0_12px_rgba(245,197,24,0.35)]"
                  aria-hidden
                />
              )}
            </button>
          )
        })}
      </div>

      {genres.length > 0 && (
        <div className="mt-2.5 flex gap-1.5 overflow-x-auto hide-scrollbar px-4 pb-0.5 pt-0 sm:px-5">
          {genres.map((g, i) => {
            const active = i === safeGenreIndex
            return (
              <button
                key={g}
                type="button"
                onClick={() => onGenreChange?.(i)}
                className={`shrink-0 cursor-pointer rounded-full border px-[14px] py-[7px] font-[family-name:var(--font-display)] text-[12.5px] tracking-[-0.01em] transition-[color,background-color,border-color,box-shadow] duration-200 ${
                  active
                    ? 'border-yellow/50 bg-white/[0.07] text-white shadow-[0_0_0_1px_rgba(245,197,24,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]'
                    : 'border-white/[0.12] bg-white/[0.02] text-gray-light hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              >
                {g}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
