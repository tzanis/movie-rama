import { stringify as stringifyQuery } from 'query-string';

import { API_URL, API_KEY } from './../consts/constants';


/**
 * Builds api endpoint URL attaching api_key as query param.
 * @param {String} endPoint - api endpoint.
 * @param {Object} params - params to append toe the url.
 *
 * @return {String} Generated API end point URL.
 */
export const buildApiEndpointUrl = (endPoint, params) => {
  const queryParams  = stringifyQuery({
    api_key: API_KEY,
    ...params,
  });
  return `${API_URL}/${endPoint}?${queryParams}`;
};

/**
 * Builds api endpoint URL attaching api_key as query param.
 * @param {String} poster_path - Image path.
 * @param {Object} config - Api configuration.
 * @param {String} size - image size.
 *
 * @return {String} Image url.
 */
export const generatePosterUrl = (poster_path, config, size) => {
  const { images: { secure_base_url } } = config;
  return `${secure_base_url}/${size}/${poster_path}`;
};

/**
 * Shows loading indication.
 */
export const showLoadingIndication = () => {
  const loadingHtml = '<div class="loading-indicator">loading...</div>';
  document.getElementsByTagName('body')[0].insertAdjacentHTML('beforeEnd', loadingHtml);
};

/**
 * Hides loading indication.
 */
export const hideLoadingIndication = () => {
  const el = document.getElementsByClassName('loading-indicator')[0].remove();
};

/**
 * Checks if a number is an odd number.
 *
 * @param {Number} n - Given number.
 * @return {Boolean} is Odd.
 */
export const isOdd = n => n % 2 === 1;
