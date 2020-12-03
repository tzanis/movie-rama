import { describe } from 'mocha';
import { expect } from 'chai';

import MovieList from '../src/components/MovieList';


const genresFixture = {
  genres : [
    { id: 1, name: 'genre 1' },
    { id: 2, name: 'genre 2' },
  ],
};
const movieList = new MovieList({ images: { poster_sizes: [] } }, genresFixture);

describe('MovieList', function () {
  describe('Genre list', function () {
    it('should render genres properly', function () {
      expect(movieList.renderGenres([1, 2])).to.equal('genre 1, genre 2');
    });

    it('should show N/A if genre id not found', function () {
      expect(movieList.renderGenres([1, 4])).to.equal('genre 1, N/A');
    });
  });
});

