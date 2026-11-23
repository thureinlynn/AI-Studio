import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getDropOffStatus,
  formatDateDisplay,
  filterAndSortTrips,
  formatFacebookUrl,
  formatTelegramUrl,
  sanitizeExternalHttpUrl,
} from './tripUtils';
import { safeJsonLdStringify, escapeXml } from './seoUtils';
import type { TripPost } from '../types/trip';

test('getDropOffStatus handles missing or invalid dates safely', () => {
  const missing = getDropOffStatus(undefined, '2026-11-13');
  assert.equal(missing.label, 'Drop-off date TBD');
  assert.equal(missing.isExpired, false);

  const invalid = getDropOffStatus('not-a-date', '2026-11-13');
  assert.equal(invalid.label, 'Drop-off date TBD');
  assert.equal(invalid.isExpired, false);
});

test('getDropOffStatus computes upcoming, today, and expired statuses accurately', () => {
  const today = getDropOffStatus('2026-11-13', '2026-11-13');
  assert.equal(today.label, 'Drop-off today!');
  assert.equal(today.isUrgent, true);
  assert.equal(today.isExpired, false);

  const oneDay = getDropOffStatus('2026-11-14', '2026-11-13');
  assert.equal(oneDay.label, '1 day left to drop off');
  assert.equal(oneDay.isUrgent, true);
  assert.equal(oneDay.isExpired, false);

  const expired = getDropOffStatus('2026-11-12', '2026-11-13');
  assert.equal(expired.label, 'Drop-off closed');
  assert.equal(expired.isExpired, true);
});

test('formatDateDisplay formats YYYY-MM-DD cleanly', () => {
  assert.equal(formatDateDisplay('2026-11-15'), 'Nov 15, 2026');
  assert.equal(formatDateDisplay(''), '');
});

test('filterAndSortTrips excludes expired and booked trips by default', () => {
  const refDate = new Date(2026, 10, 13);
  const trips: TripPost[] = [
    {
      id: 't1',
      userId: 'u1',
      traveler: { name: 'Alice', avatarUrl: '', bio: '', isVerified: false, rating: 5, reviewCount: 0, memberSince: '2026', tripsCompleted: 0, languages: ['English'] },
      departureCity: 'Bangkok',
      departureCountry: 'Thailand',
      arrivalCity: 'Yangon',
      arrivalCountry: 'Myanmar',
      departureDate: '2026-11-20',
      arrivalDate: '2026-11-20',
      lastDropOffDate: '2026-11-19',
      checkOutDate: '2026-11-21',
      dropOffLocationNote: 'Siam',
      pickUpLocationNote: 'Downtown',
      weightAvailableKg: 10,
      weightCapacityKg: 20,
      serviceFeeType: 'free',
      announcement: 'Happy to help',
      acceptedItems: ['Documents'],
      prohibitedItems: ['Liquids'],
      contacts: { whatsapp: '+66123456', viber: '', telegram: '', preferred: 'whatsapp' },
      createdAt: '2026-11-10T00:00:00.000Z',
      status: 'active',
    },
    {
      id: 't2',
      userId: 'u2',
      traveler: { name: 'Bob', avatarUrl: '', bio: '', isVerified: false, rating: 5, reviewCount: 0, memberSince: '2026', tripsCompleted: 0, languages: ['English'] },
      departureCity: 'Singapore',
      departureCountry: 'Singapore',
      arrivalCity: 'Tokyo',
      arrivalCountry: 'Japan',
      departureDate: '2026-11-05',
      arrivalDate: '2026-11-05',
      lastDropOffDate: '2026-11-04',
      checkOutDate: '2026-11-06',
      dropOffLocationNote: 'Orchard',
      pickUpLocationNote: 'Shinjuku',
      weightAvailableKg: 5,
      weightCapacityKg: 10,
      serviceFeeType: 'free',
      announcement: 'Expired trip',
      acceptedItems: [],
      prohibitedItems: [],
      contacts: { whatsapp: '', viber: '', telegram: 'bob', preferred: 'telegram' },
      createdAt: '2026-11-01T00:00:00.000Z',
      status: 'active',
    },
  ];

  const activeOnly = filterAndSortTrips(
    trips,
    { query: '', departureCity: '', arrivalCity: '', sortBy: 'date_asc' },
    { hideExpired: true, hideFullyBooked: true, referenceDate: refDate }
  );
  assert.equal(activeOnly.length, 1);
  assert.equal(activeOnly[0].id, 't1');
});

test('contact and external URL sanitizers block phishing domains and unsafe URI schemes', () => {
  assert.equal(sanitizeExternalHttpUrl('https://airasia.com/deals'), 'https://airasia.com/deals');
  assert.equal(sanitizeExternalHttpUrl('javascript:alert(1)'), '');
  assert.equal(sanitizeExternalHttpUrl('data:text/html,<script>alert(1)</script>'), '');

  assert.equal(formatFacebookUrl('https://www.facebook.com/traveler.alex'), 'https://www.facebook.com/traveler.alex');
  assert.equal(formatFacebookUrl('alex_thant'), 'https://facebook.com/alex_thant');
  assert.equal(formatFacebookUrl('https://evil-phishing.example.com/login'), '');
  assert.equal(formatFacebookUrl('javascript:alert(1)'), 'https://facebook.com/javascriptalert1');

  assert.equal(formatTelegramUrl('@alex_travel?start=evil/../foo'), 'https://t.me/alex_travelstartevilfoo');
});

test('SEO JSON-LD and XML helpers escape script breakout and XML metacharacters', () => {
  const payload = { description: '</script><script>alert(1)</script>&test' };
  const serialized = safeJsonLdStringify(payload);
  assert.equal(serialized.includes('</script>'), false);
  assert.equal(serialized.includes('\\u003c/script\\u003e'), true);

  const xml = escapeXml('https://example.com/?a=1&b="<evil>"');
  assert.equal(xml, 'https://example.com/?a=1&amp;b=&quot;&lt;evil&gt;&quot;');
});

