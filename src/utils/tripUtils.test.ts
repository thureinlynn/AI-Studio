import test from 'node:test';
import assert from 'node:assert/strict';
import { getDropOffStatus, formatDateDisplay, filterAndSortTrips } from './tripUtils';
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
