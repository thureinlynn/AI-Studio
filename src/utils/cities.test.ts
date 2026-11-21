import test from 'node:test';
import assert from 'node:assert/strict';
import { POPULAR_CITIES, filterCities } from '../data/cities';

test('POPULAR_CITIES contains major global hub cities', () => {
  assert.ok(POPULAR_CITIES.length >= 30);
  for (const city of POPULAR_CITIES) {
    assert.ok(city.city.length > 0);
    assert.ok(city.country.length > 0);
  }
});

test('filterCities filters by city name, country, or airport code case-insensitively', () => {
  assert.equal(filterCities('').length, POPULAR_CITIES.length);
  const bangkokMatches = filterCities('bkk');
  assert.ok(bangkokMatches.some((c) => c.city === 'Bangkok'));

  const yangonMatches = filterCities('yangon');
  assert.ok(yangonMatches.some((c) => c.city === 'Yangon' && c.country === 'Myanmar'));
});
