/** Display order for genre chips — only genres that appear in the carousel are shown. */
export const THEATRE_GENRE_ORDER = [
  'Action',
  'Sci-Fi',
  'Adventure',
  'Drama',
  'Thriller',
  'Comedy',
  'Crime',
]

export function genresForCarousel(movies) {
  if (!movies?.length) return []
  const present = new Set(movies.map((m) => m.genre))
  return THEATRE_GENRE_ORDER.filter((g) => present.has(g))
}

export function firstMovieIndexForGenre(movies, genre) {
  if (!movies?.length) return -1
  return movies.findIndex((m) => m.genre === genre)
}
