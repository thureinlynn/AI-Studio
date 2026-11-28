import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidLanguage,
  isLocaleLoaded,
  loadLocale,
  translateText,
  translateItemText,
} from '../i18n/loader';

test('isValidLanguage accepts supported codes and rejects unknown values', () => {
  assert.equal(isValidLanguage('en'), true);
  assert.equal(isValidLanguage('my'), true);
  assert.equal(isValidLanguage('th'), true);
  assert.equal(isValidLanguage('xx'), false);
  assert.equal(isValidLanguage(null), false);
});

test('English translations resolve synchronously without loading extra chunks', () => {
  assert.equal(isLocaleLoaded('en'), true);
  assert.equal(translateText('navBrowse', 'en'), 'Browse Trips');
  assert.equal(translateText('brandName', 'en'), 'LuuKyone');
});

test('loadLocale dynamically loads Burmese and Thai dictionaries and item translations', async () => {
  await loadLocale('my');
  assert.equal(isLocaleLoaded('my'), true);
  assert.equal(translateText('brandName', 'my'), 'လူကြုံ');
  assert.equal(
    translateItemText('Urgent Documents & Letters', 'my'),
    'အရေးကြီး စာရွက်စာတမ်းများနှင့် စာများ'
  );

  await loadLocale('th');
  assert.equal(isLocaleLoaded('th'), true);
  assert.notEqual(translateText('navBrowse', 'th'), 'Browse Trips');
});
