import test from 'node:test';
import assert from 'node:assert/strict';
import { COUNTRIES, findCountryByName, filterCountries } from '../data/countries';

test('COUNTRIES contains unique codes and names with flags', () => {
  assert.ok(COUNTRIES.length >= 190);
  const codes = new Set(COUNTRIES.map((c) => c.code));
  assert.equal(codes.size, COUNTRIES.length);
  for (const country of COUNTRIES) {
    assert.ok(country.code.length === 2);
    assert.ok(country.name.length > 0);
    assert.ok(country.flag.length > 0);
  }
});

test('findCountryByName finds Thailand and Myanmar case-insensitively', () => {
  const th = findCountryByName('  thailand ');
  assert.equal(th?.code, 'TH');
  assert.equal(th?.name, 'Thailand');
  assert.equal(th?.flag, '🇹🇭');

  const mm = findCountryByName('Myanmar');
  assert.equal(mm?.code, 'MM');
  assert.equal(mm?.flag, '🇲🇲');

  assert.equal(findCountryByName(''), undefined);
});

test('filterCountries filters by name or ISO code', () => {
  assert.equal(filterCountries('').length, COUNTRIES.length);
  const myanmarMatches = filterCountries('myan');
  assert.ok(myanmarMatches.some((c) => c.name === 'Myanmar'));

  const sgMatches = filterCountries('SG');
  assert.ok(sgMatches.some((c) => c.name === 'Singapore'));
});
