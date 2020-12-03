import MovieList from 'components/MovieList';
import { fetchGenres, fetchConfiguration } from 'api';
// Register styles
import 'styles/index.scss';

/**
 * Fetches application prerequisites: list of available genres and api configuration.
 *
 * @return {Promise<{genres: *, config: *}>}
 */
const fetchPrerequisites = async () => {
  const genres = await fetchGenres();
  const config = await fetchConfiguration();
  return { genres, config };
};

/**
 * Fetches application prerequisites: list of available genres and api configuration.
 *
 * @return {Promise<{genres: *, config: *}>}
 */
fetchPrerequisites().then(({ config, genres }) => {
  const moviesList = new MovieList(config, genres);
  moviesList.render();
});
