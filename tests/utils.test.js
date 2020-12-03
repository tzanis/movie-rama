import { describe } from 'mocha';
import { expect } from 'chai';

import { buildApiEndpointUrl } from '../src/utils/utils';
import { API_URL, API_KEY } from '../src/consts/constants';

describe('Utils', function () {
  describe('#buildApiEndpointUrl', function () {
    it('should generate API endPoint urls properly', function () {
      const endPoint = 'test/endpoint';
      const expectedApiUrl = `${API_URL}/${endPoint}?api_key=${API_KEY}`;
      expect(buildApiEndpointUrl(endPoint)).to.equal(expectedApiUrl);
    });
  });
});

