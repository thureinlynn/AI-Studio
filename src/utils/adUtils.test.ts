import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ADSTERRA_BANNER_HEIGHT,
  ADSTERRA_BANNER_KEY,
  ADSTERRA_BANNER_SCRIPT_SRC,
  ADSTERRA_BANNER_WIDTH,
  ADSTERRA_NATIVE_CONTAINER_ID,
  ADSTERRA_NATIVE_SCRIPT_SRC,
  buildAdsterraBannerSrcDoc,
  buildFeedWithAds,
} from './adUtils';

test('buildFeedWithAds returns empty array when trips list is empty', () => {
  assert.deepEqual(buildFeedWithAds([]), []);
});

test('buildFeedWithAds does not inject an ad when fewer than 5 trips exist', () => {
  const trips = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }];
  const result = buildFeedWithAds(trips);
  assert.equal(result.length, 4);
  assert.equal(
    result.some((item) => item.type === 'ad'),
    false
  );
});

test('buildFeedWithAds inserts an ad card after indices 4, 9, and 14', () => {
  const trips = Array.from({ length: 16 }, (_, idx) => ({ id: `trip-${idx}` }));
  const result = buildFeedWithAds(trips, 5);

  assert.equal(result.length, 19);

  const adIndices = result
    .map((item, pos) => (item.type === 'ad' ? { pos, afterIndex: item.afterIndex } : null))
    .filter((entry): entry is { pos: number; afterIndex: number } => entry !== null);

  assert.deepEqual(adIndices, [
    { pos: 5, afterIndex: 4 },
    { pos: 11, afterIndex: 9 },
    { pos: 17, afterIndex: 14 },
  ]);
});

test('buildAdsterraBannerSrcDoc includes the exact 320x50 atOptions key and script URL for Feed', () => {
  const html = buildAdsterraBannerSrcDoc();
  assert.equal(ADSTERRA_BANNER_WIDTH, 320);
  assert.equal(ADSTERRA_BANNER_HEIGHT, 50);
  assert.match(html, new RegExp(ADSTERRA_BANNER_KEY));
  assert.match(html, new RegExp(ADSTERRA_BANNER_SCRIPT_SRC));
  assert.match(html, /'width'\s*:\s*320/);
  assert.match(html, /'height'\s*:\s*50/);
});

test('Native Banner constants match the Trip Detail Adsterra snippet', () => {
  assert.equal(
    ADSTERRA_NATIVE_CONTAINER_ID,
    'container-a0dcee3020828a955c6cd6883aaf9256'
  );
  assert.equal(
    ADSTERRA_NATIVE_SCRIPT_SRC,
    'https://bicea.org/21/a0dcee3020828a955c6cd6883aaf9256'
  );
});
