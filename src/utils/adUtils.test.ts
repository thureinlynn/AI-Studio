import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ADSTERRA_BANNER_HEIGHT,
  ADSTERRA_BANNER_KEY,
  ADSTERRA_BANNER_SCRIPT_SRC,
  ADSTERRA_BANNER_WIDTH,
  ADSTERRA_NATIVE_CONTAINER_ID,
  ADSTERRA_NATIVE_SCRIPT_SRC,
  CUSTOM_FEED_ADS,
  buildAdsterraBannerSrcDoc,
  buildFeedWithAds,
  getRotatedCustomFeedAds,
} from './adUtils';
import { getCargoPartnerById } from '../data/cargoPartners';
import { formatGoogleMapsSearchUrl, formatTelUrl } from './tripUtils';

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

test('buildFeedWithAds inserts an ad card after indices 4, 9, 14, and 19', () => {
  const trips = Array.from({ length: 21 }, (_, idx) => ({ id: `trip-${idx}` }));
  const result = buildFeedWithAds(trips, 5);

  assert.equal(result.length, 25);

  const adIndices = result
    .map((item, pos) => (item.type === 'ad' ? { pos, afterIndex: item.afterIndex } : null))
    .filter((entry): entry is { pos: number; afterIndex: number } => entry !== null);

  assert.deepEqual(adIndices, [
    { pos: 5, afterIndex: 4 },
    { pos: 11, afterIndex: 9 },
    { pos: 17, afterIndex: 14 },
    { pos: 23, afterIndex: 19 },
  ]);

  const adItems = result.filter((item) => item.type === 'ad');
  assert.equal(adItems[0]?.customAd?.title, 'AstroNerd Inc.');
  assert.equal(adItems[0]?.customAd?.text, 'Digital Products');
  assert.equal(adItems[0]?.customAd?.href, 'https://www.astronerd.me');
  assert.equal(adItems[1]?.customAd?.title, 'NXE Gadgets');
  assert.equal(adItems[1]?.customAd?.text, 'Electronics Store');
  assert.equal(
    adItems[1]?.customAd?.href,
    'https://web.facebook.com/nxegadgets'
  );
  assert.equal(
    adItems[2]?.customAd?.title,
    'Khint Power International Trading Co.,Ltd.'
  );
  assert.equal(adItems[2]?.customAd?.category, 'cargo_partner');
  assert.equal(adItems[2]?.customAd?.partnerId, 'khint-power');
  assert.equal(adItems[2]?.customAd?.text, 'Cargo & E-commerence');
  assert.equal(
    adItems[2]?.customAd?.href,
    'https://web.facebook.com/Khintpowercargo'
  );
  assert.equal(adItems[3]?.customAd, null);
});

test('getRotatedCustomFeedAds and buildFeedWithAds alternate partner ad card positions across rotations', () => {
  const trips = Array.from({ length: 16 }, (_, idx) => ({ id: `trip-${idx}` }));

  // Offset 1 places Khint Power in the 2nd ad slot
  const feedOffset1 = buildFeedWithAds(trips, 5, 1).filter((item) => item.type === 'ad');
  assert.equal(feedOffset1[0]?.customAd?.id, 'custom-ad-nxe-gadgets');
  assert.equal(feedOffset1[1]?.customAd?.id, 'custom-ad-khint-power');
  assert.equal(feedOffset1[2]?.customAd?.id, 'custom-ad-astronerd');

  // Offset 2 places Khint Power in the 1st ad slot
  const feedOffset2 = buildFeedWithAds(trips, 5, 2).filter((item) => item.type === 'ad');
  assert.equal(feedOffset2[0]?.customAd?.id, 'custom-ad-khint-power');
  assert.equal(feedOffset2[1]?.customAd?.id, 'custom-ad-astronerd');
  assert.equal(feedOffset2[2]?.customAd?.id, 'custom-ad-nxe-gadgets');

  // Negative or wrapping offset resolves cleanly
  const wrapped = getRotatedCustomFeedAds(CUSTOM_FEED_ADS, -1);
  assert.equal(wrapped[0]?.id, 'custom-ad-khint-power');
});

test('getCargoPartnerById returns structured freight forwarder data and safe contact/map links', () => {
  const partner = getCargoPartnerById('khint-power');
  assert.ok(partner);
  assert.equal(partner.name, 'Khint Power International Trading Co.,Ltd.');
  assert.ok(partner.addresses.length >= 1);
  assert.ok(partner.contacts.phones.length >= 2);
  assert.ok(partner.contacts.whatsapp.length >= 1);
  assert.ok(partner.contacts.viber.length >= 1);
  assert.ok(partner.contacts.facebook.length >= 1);
  assert.ok(partner.serviceRegions.some((r) => r.country === 'Thailand'));
  assert.ok(partner.serviceRegions.some((r) => r.country === 'Myanmar'));
  assert.equal(getCargoPartnerById('non-existent'), null);

  assert.equal(formatTelUrl('+66 2 000 8421'), 'tel:+6620008421');
  assert.equal(formatTelUrl('invalid'), '');
  assert.equal(
    formatGoogleMapsSearchUrl('Bangkok, Thailand'),
    'https://www.google.com/maps/search/?api=1&query=Bangkok%2C%20Thailand'
  );
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
