import { fetchMovieDetails, fetchMovieReviews, fetchMovieVideos, fetchSimilarMovies } from './../api';
/**
 * Movies details component. Renders movie details.
 */
class MovieDetails {
  /**
   * @param {Number} id - api configuration object.
   * @param {HTMLElement} targetEl - DOM element to append the component to.
   */
  constructor(id, targetEl)  {
    this.id = id;
    this.targetEl = targetEl;
  }

  /**
   * Renders movie details
   * @param {Object} data - Movie object.
   * @param {Array} data.reviews - Total pages.
   * @param {Array} data.videos - Total pages.
   * @param {Array} data.similarMovies - Total pages.
   */
  render({ videos, reviews, similarMovies }) {
    let videoHtml = this.renderTrailer(videos);
    let reviewsHtml = this.renderReviews(reviews);
    let similarMoviesHtml = this.renderSimilarMovies(similarMovies);

    const html = ` 
      ${videoHtml}
      ${similarMoviesHtml}
      ${reviewsHtml}
    `;

    const detailsDiv = this.targetEl.getElementsByClassName('movie-list-item__details')[0];
    detailsDiv.innerHTML = html;

    // Wait till previously selected movie (if any) finished closing animation.
    setTimeout(() => {
      detailsDiv.classList.add('movie-list-item__details--show');
    }, 250);
  };

  /**
   * Renders reviews
   *
   * @param {Array} reviews.
   *
   * @Returns {String} generated HTML
   */
  renderReviews(reviews) {
    if (reviews && reviews.length > 0) {
      return `
        <div class="movie-details__reviews">
          <h4>Reviews</h4>
          ${reviews.slice(0, 2).map(({author, content}) => `
            <div class="movie-details__review-item">
              <span class="movie-details__review-author">by ${author}:</span>
              <p class="movie-details__review-content">${content}</p>
            </div>
          `).join('')}
         </div>
       `;
    }

    return '';
  }

  /**
   * Renders video trailer
   *
   * @param {Array} videos - videos.
   *
   * @Returns {String} generated HTML
   */
  renderTrailer(videos) {
    const trailer = videos.find(v => v.type === 'Trailer');
    if (trailer && trailer.site === 'YouTube') {
      const { key } = trailer;
      return `
        <iframe id="ytplayer" type="text/html" width="640" height="360"
          src="https://www.youtube.com/embed/${key}?autoplay=1"
          frameborder="0"></iframe>
      `;
    }

    return '';
  }

  /**
   * Renders similar movies
   *
   * @param {Array} similarMovies - Similar movies.
   *
   * @Returns {String} generated HTML
   */
  renderSimilarMovies(similarMovies) {
    if (similarMovies && similarMovies.length > 0) {
      return `
        <div class="movie-details__similar-movies">
          <h4>Similar Movies</h4>
          ${similarMovies.map(movie => movie.title).join(', ')}.
        </div>
      `;
    }

    return '';
  }

  /**
   * Gathers extra information about movie. Wait until all information has been retrieved.
   *
   * @returns {Promise<{Object}>}
   */
  async loadData() {
    const targetMovie = this.targetEl.getElementsByClassName('movie-list-item__details')[0];
    targetMovie.innerHTML = `
      <div class="movie-details__loading">Loading...</div>
    `;

    return Promise.all([
      fetchMovieReviews(this.id),
      fetchMovieVideos(this.id),
      fetchSimilarMovies(this.id),
    ]).then(result => {
      targetMovie.innerHTML = ``;
      return {
        reviews: result[0].results,
        videos: result[1].results,
        similarMovies: result[2].results,
      };
    });
  };

  /**
   * Triggers movie information fetch and rendering.
   */
  async fetchDataAndRender() {
    const { videos, reviews, similarMovies } = await this.loadData();
    this.render({ videos, reviews, similarMovies });
  }
}

export default MovieDetails;
