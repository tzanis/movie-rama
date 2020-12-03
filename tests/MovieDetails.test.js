import { describe } from 'mocha';
import { expect } from 'chai';

import MovieDetails from '../src/components/MovieDetails';

const movieDetails = new MovieDetails(2, null);

describe('MovieList', function () {
  describe('Movie Trailer', function () {
    it('should not render if videos not provided', async function () {
      expect(movieDetails.renderTrailer([])).to.equals('');
    });

    it('should not render if trailer not available', async function () {
      expect(movieDetails.renderTrailer([
        {"id":"1","site":"YouTube","size":1080,"type":"Teaser"},
      ])).to.equals('');
    });

    it('should render player if video is available', async function () {
      expect(movieDetails.renderTrailer([
        {"id":"1","site":"YouTube","size":1080,"type":"Trailer"},
      ])).to.contain('<iframe');
    });
  });

  describe('Reviews list', function () {
    it('should not render if reviews not provided', async function () {
      expect(movieDetails.renderReviews([])).to.equals('');
    });

    it('should render properly if reviews are availble', async function () {
      expect(movieDetails.renderReviews([
        {"author":"msbreviews","content":"xxxx","id":"5eecd1829661fc00385ec18e","url":"https://www.themoviedb.org/review/5eecd1829661fc00385ec18e"},
      ]))
        .to.contain('<h4>Reviews</h4>')
        .and.to.contain('<div class="movie-details__review-item">')
        .and.to.contain('<span class="movie-details__review-author">')
        .and.to.contain('<p class="movie-details__review-content"');
    });
  });
});

