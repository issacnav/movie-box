import avengersPoster from '../../i-designed-a-poster-for-avengers-doomsday-v0-far08gr58ihd1.webp'
import spiderPoster from '../../SPIDER-MAN-BRAND-NEW-DAY.jpg'
import odysseyPoster from '../../the-odyssey2.png'

/**
 * Booking date row: Thu–Sun preview week. `showtimeChipIds` = first three chips get showtimes.
 * Release Fridays: Dune Dec 18; Avengers May 1; Spider-Man Jul 31; Odyssey Jul 17 (2026).
 */
const DUNE_OPENING_WEEK = {
  chips: [
    { id: '2026-12-17', dayNum: 17, weekday: 'Thu', line: 'Thu, Dec 17, 2026' },
    { id: '2026-12-18', dayNum: 18, weekday: 'Fri', line: 'Fri, Dec 18, 2026' },
    { id: '2026-12-19', dayNum: 19, weekday: 'Sat', line: 'Sat, Dec 19, 2026' },
    { id: '2026-12-20', dayNum: 20, weekday: 'Sun', line: 'Sun, Dec 20, 2026' },
  ],
  showtimeChipIds: ['2026-12-17', '2026-12-18', '2026-12-19'],
}

const AVENGERS_OPENING_WEEK = {
  chips: [
    { id: '2026-04-30', dayNum: 30, weekday: 'Thu', line: 'Thu, Apr 30, 2026' },
    { id: '2026-05-01', dayNum: 1, weekday: 'Fri', line: 'Fri, May 1, 2026' },
    { id: '2026-05-02', dayNum: 2, weekday: 'Sat', line: 'Sat, May 2, 2026' },
    { id: '2026-05-03', dayNum: 3, weekday: 'Sun', line: 'Sun, May 3, 2026' },
  ],
  showtimeChipIds: ['2026-04-30', '2026-05-01', '2026-05-02'],
}

const SPIDER_MAN_OPENING_WEEK = {
  chips: [
    { id: '2026-07-30', dayNum: 30, weekday: 'Thu', line: 'Thu, Jul 30, 2026' },
    { id: '2026-07-31', dayNum: 31, weekday: 'Fri', line: 'Fri, Jul 31, 2026' },
    { id: '2026-08-01', dayNum: 1, weekday: 'Sat', line: 'Sat, Aug 1, 2026' },
    { id: '2026-08-02', dayNum: 2, weekday: 'Sun', line: 'Sun, Aug 2, 2026' },
  ],
  showtimeChipIds: ['2026-07-30', '2026-07-31', '2026-08-01'],
}

const ODYSSEY_OPENING_WEEK = {
  chips: [
    { id: '2026-07-16', dayNum: 16, weekday: 'Thu', line: 'Thu, Jul 16, 2026' },
    { id: '2026-07-17', dayNum: 17, weekday: 'Fri', line: 'Fri, Jul 17, 2026' },
    { id: '2026-07-18', dayNum: 18, weekday: 'Sat', line: 'Sat, Jul 18, 2026' },
    { id: '2026-07-19', dayNum: 19, weekday: 'Sun', line: 'Sun, Jul 19, 2026' },
  ],
  showtimeChipIds: ['2026-07-16', '2026-07-17', '2026-07-18'],
}

/** Fallback when `movie.openingWeek` is missing. */
export function openingWeekForMovie(movie) {
  return movie?.openingWeek ?? DUNE_OPENING_WEEK
}

/** Original single-poster home (Dune); same entry is first in the Theatre ring. */
export const CLASSIC_HOME_MOVIE = {
  id: 'dune-3',
  title: 'Dune 3',
  posterUrl: '/poster.jpg',
  year: '2026',
  genre: 'Sci-Fi',
  duration: '140 min',
  imdbRating: '8.6',
  previewVideoUrl: '/dune.mp4',
  trailerYoutubeUrl: 'https://www.youtube.com/watch?v=3_9vCamtuPY',
  openingWeek: DUNE_OPENING_WEEK,
}

/** Featured carousel + booking metadata (Dune uses existing public asset). */
export const FEATURED_MOVIES = [
  CLASSIC_HOME_MOVIE,
  {
    id: 'avengers-doomsday',
    title: 'Avengers: Doomsday',
    posterUrl: avengersPoster,
    year: '2026',
    genre: 'Action',
    duration: '150 min',
    imdbRating: '8.4',
    previewVideoUrl: null,
    trailerYoutubeUrl: 'https://www.youtube.com/watch?v=S2sR2_HNJV0',
    openingWeek: AVENGERS_OPENING_WEEK,
  },
  {
    id: 'spider-man-bnd',
    title: 'Spider-Man: Brand New Day',
    posterUrl: spiderPoster,
    year: '2026',
    genre: 'Action',
    duration: '128 min',
    imdbRating: '8.2',
    previewVideoUrl: null,
    trailerYoutubeUrl: 'https://www.youtube.com/watch?v=8TZMtslA3UY',
    openingWeek: SPIDER_MAN_OPENING_WEEK,
  },
  {
    id: 'the-odyssey',
    title: 'The Odyssey',
    posterUrl: odysseyPoster,
    year: '2026',
    genre: 'Adventure',
    duration: '155 min',
    imdbRating: '8.1',
    previewVideoUrl: null,
    trailerYoutubeUrl: 'https://www.youtube.com/watch?v=Mzw2ttJD2qQ',
    openingWeek: ODYSSEY_OPENING_WEEK,
  },
]
