import { fetchNowPlaying, searchMovies } from './../api';
import { generatePosterUrl, isOdd, showLoadingIndication, hideLoadingIndication } from './../utils/utils';
import MovieDetails from './../components/MovieDetails';
import { SCROLLING_THRESHOLD } from './../consts/constants';

const ACTIONS = {
  OPEN: 1,
  CLOSE: 2,
};

/**
 * Movies list component. Renders movies listing, search results with infinite scrolling.
 */
class MovieList {
   /**
   * @param {object} config - api configuration object.
   * @param {array} genres - available genres.
   */
  constructor(config, genres) {
    this.config = config;
    this.genres = genres;
    this.isLoading = true;
    this.isLastPage = false;
    this.page = 1;
    this.searchKeyword = '';
  }

  /**
   * Check if data set of response is the last one (last page).
   * @param {Object} moviesResponse - Movies results API response.
   * @param {Number} moviesResponse.page - Current page.
   * @param {Number} moviesResponse.total_pages - Total pages.
   */
  checkIfIsLastPage({ page, total_pages }) {
    return page === total_pages;
  };

  /**
   * Fetches next data set (page). Checks if search keyword has been used in order to perform
   * a search request. Otherwise, fetches now-playing movies.
   * @param {Object} params - query params used in the api url generation.
   */
  async fetchNextBatch(params) {
    this.isLoading = true;

    if (this.searchKeyword !== '') {
      return searchMovies({ ...params, query: this.searchKeyword });
    } else {
      return fetchNowPlaying(params);
    }
  };

  /**
   * onScroll event handler. Implements an infinite scroll pagination.
   */
  async onScroll() {
    if (!this.isLoading && !this.isLastPage && (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - SCROLLING_THRESHOLD)) {
      const moviesResponse = await this.fetchNextBatch({ page: this.page });
      this.page += 1;
      this.isLastPage = this.checkIfIsLastPage(moviesResponse);
      this.appendMovies(moviesResponse.results).then(() => { this.isLoading = false; });

      // remove redundant event listener when there is no more pages to fetch.
      if (this.isLastPage) {
        window.removeEventListener('scroll', this.onScroll);
      }
    }
  };

  /**
   * Generates movie listing html.
   * @param {Array} movies - List of movie objects.
   */
  generateMoviesListHtml(movies) {
    const { images: { poster_sizes } } = this.config;

    return movies.map(({
      title, id, overview, genre_ids, poster_path, vote_average, release_date,
    }) => (
      `<li class="movie-list-item" id="movie-item-${id}">
        <div class="movie-list-item__container">
          <div  class="movie-list-item__overview">
            <div class="movie-list-item__poster ${poster_path ? '' : 'movie-list-item__poster--not-available'}">
              ${poster_path ? `
                <img
                  data-hook-id="${id}"
                   data-hook-action=${ACTIONS.OPEN}
                  loading="lazy"
                  alt="${title}" src="${generatePosterUrl(poster_path, this.config, poster_sizes[3])}"
                  width="${poster_sizes[3].replace('w', '')}"
                  height="${parseInt(poster_sizes[3].replace('w', '') * 1.5)}"
                />`
          : `<span>No poster available</span>`
        }
            </div>
            <div class="movie-list-item__basic-info">
              <h3>
                <a href="#" data-hook-action=${ACTIONS.OPEN} data-hook-id="${id}" >${title}</a>
              </h3>

              <a
                href="#"
                data-hook-action=${ACTIONS.CLOSE}
                data-hook-id="${id}"
                class="close"
                title="Close"
              >
                x
              </a>
      
              <div class="movie-list-item__extra-info">
                <span>Year: <strong>${(new Date(release_date)).getFullYear()}</strong></span>
                <span>Rating: <strong>${vote_average}</strong></span>
                <span>Genres: <strong>${this.renderGenres(genre_ids)}</strong></span> 
              </div>
              
              <p>
                ${overview}
              </p>
            </div>
          </div>
          <div class="movie-list-item__details"></div>
        </div>
      </li>`
    )).join('');
  }

  /**
   * Generates a comma separated genre names list.
   * @param {Array} genre_ids - List of genre ids.
   */
  renderGenres(genre_ids) {
    return genre_ids.map(gid => {
       const found = this.genres.genres.find(g => g.id === gid);
       return found ? found.name : 'N/A';
    }).join(', ');
  }

  /**
   * Appends movies list html to the end of the existing movies list.
   * @param {Array} movies - List of Movies.
   */
  async appendMovies(movies) {
    const list = this.generateMoviesListHtml(movies);
    const movieList = document.getElementById('movie-list');
    movieList.insertAdjacentHTML('beforeEnd', list);
  }

  /**
   * Handles movie selection.
   *
   * @param {number} movieId - Movie Id.
   */
  handleOpenMovie(movieId) {
    const movieList = document.getElementById('movie-list');
    const currentlyActive = document.getElementsByClassName('movie-list-item--active')[0];
    let isAllReadyActive = false;

    if (!movieId) {
      return;
    }

    if (currentlyActive && currentlyActive.getAttribute('id') === `movie-item-${movieId}`) {
      isAllReadyActive = true;
    }

    if (!isAllReadyActive) {
      // Remove details content
      const detailsEl = currentlyActive && currentlyActive.getElementsByClassName('movie-list-item__details')[0];
      if (currentlyActive && detailsEl) {
        detailsEl.innerHTML = '';
        detailsEl.classList.remove('movie-list-item__details--show');
      }

      // Remove active class from previously opened item
      if (currentlyActive) {
        currentlyActive.classList.remove('movie-list-item--active');
      }

      const currentlyHidden = document.getElementsByClassName('movie-list-item--hidden')[0];
      if (currentlyHidden) {
        currentlyHidden.classList.remove('movie-list-item--hidden');
        currentlyHidden.classList.add('movie-list-item--recovering');
        currentlyHidden.classList.remove('movie-list-item--recovering');
      }

      const el = document.getElementById(`movie-item-${movieId}`);
      el.classList.add('movie-list-item--active');

      const nodes = Array.prototype.slice.call(movieList.children);
      const itemPosition = nodes.indexOf(el);
      const isMobile = document.body['scrollWidth'] > 990;

      // If in desktop view (2-col layout), hide previous item
      if (isOdd(itemPosition) && isMobile) {
        const prevItem = nodes[itemPosition - 1];
        prevItem.classList.add('movie-list-item--hidden');
      }

      const movieDetails = new MovieDetails(movieId, el.getElementsByClassName('movie-list-item__container')[0]);
      movieDetails.fetchDataAndRender().then(() => {
        setTimeout(() => {
          document.getElementsByClassName('movie-list-item--active')[0].scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        }, 500);
      });
    }
  }

  /**
   * Handles closing a movie.
   *
   * @param {number} movieId - Movie Id.
   */
  handleCloseMovie(movieId) {
    const currentlyActive = document.getElementsByClassName('movie-list-item--active')[0];
    const detailsEl = currentlyActive && currentlyActive.getElementsByClassName('movie-list-item__details')[0];
    if (currentlyActive && detailsEl) {
      //detailsEl.innerHTML = '';
      currentlyActive.classList.remove('movie-list-item--active');
      detailsEl.innerHTML = '';
      const currentlyHidden = document.getElementsByClassName('movie-list-item--hidden')[0];
      if (currentlyHidden) {
        currentlyHidden.classList.remove('movie-list-item--hidden');
        currentlyHidden.classList.add('movie-list-item--recovering');
        currentlyHidden.classList.remove('movie-list-item--recovering');
      }
      detailsEl.classList.remove('movie-list-item__details--show');
    }
  }

  /**
   * Handles onClick event.
   *
   * @param {Event} e - event triggered on movies selection.
   */
  onItemClick(e) {
    e.preventDefault();
    const movieId = e.target.getAttribute('data-hook-id');
    const action = e.target.getAttribute('data-hook-action');
    const currentlyActive = document.getElementsByClassName('movie-list-item--active')[0];

    if (parseInt(action) === ACTIONS.OPEN) {
      // If selected movie is already active, close it.
      if (currentlyActive && currentlyActive.id === `movie-item-${movieId}`) {
        this.handleCloseMovie(movieId);
      } else {
        this.handleOpenMovie(movieId);
      }
    } else if (currentlyActive || parseInt(action) === ACTIONS.CLOSE) {
      this.handleCloseMovie(movieId);
    }
  }

  /**
   * Register event listeners.
   */
  registerEventListeners() {
    /**
     * For performance reasons, we attach the event to the list it self (taking advantage of event delegation).
     * Doing so, we can also add items to the list without having to register event listeners each time.
     */
    document.getElementById('movie-list').addEventListener('click', this.onItemClick.bind(this));
    this.page += 1;

    // Register onScroll event
    window.addEventListener('scroll', this.onScroll.bind(this));

    // Prevent form submission when hitting Enter.
    document.getElementById('search').addEventListener("submit", async e => e.preventDefault());

    let searchTimeout;
    document.getElementById('keyword').addEventListener("keyup", async e => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      searchTimeout = setTimeout(async () => {
        this.page = 1;
        showLoadingIndication();
        this.searchKeyword = e.target.value;
        const movieList = document.getElementById('movie-list');
        movieList.innerHTML = '';
        const moviesResponse = await this.fetchNextBatch({ page: this.page });
        const { results, total_results } = moviesResponse;
        document.getElementsByTagName('h2')[0]
          .innerText = this.searchKeyword !== '' ? `Search Results (${total_results})` : 'In Theaters';
        this.isLastPage = this.checkIfIsLastPage(moviesResponse);
        this.appendMovies(results).then(() => {
          this.isLoading = false;
          hideLoadingIndication();
        });

        window.addEventListener('scroll', this.onScroll.bind(this));
      }, 800);
    });
  }

  /**
   * Renders component's markup and triggers event registration.
   */
  async render() {
    const movieListDiv = document.getElementsByClassName('movie-list-container')[0];
    movieListDiv.innerHTML = `<div class="loading">Fetching data...</div>`;

    const nowPlaying = await this.fetchNextBatch();

    movieListDiv.innerHTML = `
      <h2>In Theaters</h2>
      <ul id="movie-list" class="movie-list"></ul>
    `;

    await this.appendMovies(nowPlaying.results).then(() => { this.isLoading = false });

    this.registerEventListeners();
  }
}

export default MovieList;
