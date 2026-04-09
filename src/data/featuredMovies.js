import avengersPoster from '../../i-designed-a-poster-for-avengers-doomsday-v0-far08gr58ihd1.webp'
import spiderPoster from '../../SPIDER-MAN-BRAND-NEW-DAY.jpg'
import odysseyPoster from '../../the-odyssey2.png'

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
    trailerYoutubeUrl: '',
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
    trailerYoutubeUrl: '',
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
    trailerYoutubeUrl: '',
  },
]
