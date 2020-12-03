import { buildApiEndpointUrl } from './../utils/utils';

export async function fetchConfiguration() {
  const apiEndpoint = buildApiEndpointUrl('configuration');
  const response = await fetch(apiEndpoint);
  return await response.json();
};

export async function fetchNowPlaying(params) {
  const apiEndpoint = buildApiEndpointUrl('movie/now_playing', params);
  const response = await fetch(apiEndpoint);
  return await response.json();
};

export async function searchMovies(params) {
  const apiEndpoint = buildApiEndpointUrl('search/movie', params);
  const response = await fetch(apiEndpoint);
  return await response.json();
};

export async function fetchGenres() {
  const apiEndpoint = buildApiEndpointUrl('genre/movie/list');
  const response = await fetch(apiEndpoint);
  return await response.json();
};

export async function fetchMovieDetails(id) {
  const apiEndpoint = buildApiEndpointUrl(`movie/${id}`);
  const response = await fetch(apiEndpoint);
  return await response.json();
};

export async function fetchMovieReviews(id) {
  const apiEndpoint = buildApiEndpointUrl(`movie/${id}/reviews`);
  const response = await fetch(apiEndpoint);
  return await response.json();
};

export async function fetchSimilarMovies(id) {
  const apiEndpoint = buildApiEndpointUrl(`movie/${id}/similar`);
  const response = await fetch(apiEndpoint);
  return await response.json();
};

export async function fetchMovieVideos(id) {
  const apiEndpoint = buildApiEndpointUrl(`movie/${id}/videos`);
  const response = await fetch(apiEndpoint);
  return await response.json();
};
