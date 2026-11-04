import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizePhoneNumber,
  formatWhatsAppUrl,
  formatTelegramUrl,
  formatViberUrl,
  formatDateDisplay,
  getDropOffStatus,
  filterAndSortTrips,
} from './tripUtils';
import { TripPost } from '../types/trip';

test('sanitizePhoneNumber strips non-digit characters correctly', () => {
  assert.equal(sanitizePhoneNumber('+66 (81) 234-5678'), '66812345678');
  assert.equal(sanitizePhoneNumber('+95 9 123 456 789'), '959123456789');
  assert.equal(sanitizePhoneNumber(''), '');
});

test('formatWhatsAppUrl generates wa.me links with encoded messages', () => {
  const url1 = formatWhatsAppUrl('+66812345678');
  assert.equal(url1, 'https://wa.me/66812345678');

  const url2 = formatWhatsAppUrl('+66 81 234 5678', 'Hello Alex, I want to send an item');
  assert.equal(url2, 'https://wa.me/66812345678?text=Hello%20Alex%2C%20I%20want%20to%20send%20an%20item');
});

test('formatTelegramUrl generates t.me link removing leading @', () => {
  assert.equal(formatTelegramUrl('@alex_traveler'), 'https://t.me/alex_traveler');
  assert.equal(formatTelegramUrl('alex_traveler'), 'https://t.me/alex_traveler');
  assert.equal(formatTelegramUrl(''), '');
});

test('formatViberUrl generates viber:// protocol url', () => {
  assert.equal(formatViberUrl('+66 81 234 5678'), 'viber://chat?number=%2B66812345678');
});

test('formatDateDisplay formats YYYY-MM-DD gracefully', () => {
  const formatted = formatDateDisplay('2026-11-20');
  assert.match(formatted, /Nov 20, 2026/);
});

test('getDropOffStatus computes days remaining and urgency', () => {
  const status1 = getDropOffStatus('2026-11-20', '2026-11-15');
  assert.equal(status1.daysRemaining, 5);
  assert.equal(status1.isUrgent, false);
  assert.equal(status1.isExpired, false);

  const status2 = getDropOffStatus('2026-11-16', '2026-11-15');
  assert.equal(status2.daysRemaining, 1);
  assert.equal(status2.isUrgent, true);

  const statusExpired = getDropOffStatus('2026-11-10', '2026-11-15');
  assert.equal(statusExpired.isExpired, true);
});

test('filterAndSortTrips filters by city and sorts by date', () => {
  const sampleTrips: TripPost[] = [
    {
      id: '1',
      userId: 'u1',
      departureCity: 'Bangkok',
      departureCountry: 'Thailand',
      arrivalCity: 'Yangon',
      arrivalCountry: 'Myanmar',
      departureDate: '2026-11-20',
      arrivalDate: '2026-11-20',
      lastDropOffDate: '2026-11-19',
      checkOutDate: '2026-11-21',
      weightCapacityKg: 10,
      weightAvailableKg: 8,
      serviceFeeType: 'free',
      announcement: 'Direct flight to Yangon, documents and clothing welcome',
      dropOffLocationNote: 'Siam Paragon BTS',
      pickUpLocationNote: 'Junction City Mall',
      acceptedItems: ['Documents', 'Clothing'],
      prohibitedItems: ['Liquids'],
      contacts: {
        whatsapp: '+66812345678',
        viber: '+66812345678',
        telegram: 'alex_bkk',
      },
      traveler: {
        name: 'Alex T',
        avatarUrl: '',
        rating: 4.9,
        reviewCount: 12,
        tripsCompleted: 8,
        isVerified: true,
        memberSince: '2025',
        bio: 'Frequent flyer between BKK and RGN',
        languages: ['English', 'Burmese'],
      },
      createdAt: '2026-11-01T10:00:00Z',
      status: 'active',
    },
    {
      id: '2',
      userId: 'u2',
      departureCity: 'Singapore',
      departureCountry: 'Singapore',
      arrivalCity: 'Tokyo',
      arrivalCountry: 'Japan',
      departureDate: '2026-11-15',
      arrivalDate: '2026-11-15',
      lastDropOffDate: '2026-11-14',
      checkOutDate: '2026-11-16',
      weightCapacityKg: 15,
      weightAvailableKg: 15,
      serviceFeeType: 'voluntary_tip',
      announcement: 'Carrying books and packaged food to Tokyo Haneda',
      dropOffLocationNote: 'Changi Airport T3',
      pickUpLocationNote: 'Shinjuku Station',
      acceptedItems: ['Books', 'Packaged Food'],
      prohibitedItems: ['Batteries'],
      contacts: {
        whatsapp: '+6591234567',
        viber: '+6591234567',
        telegram: 'sg_kenji',
      },
      traveler: {
        name: 'Kenji S',
        avatarUrl: '',
        rating: 5.0,
        reviewCount: 20,
        tripsCompleted: 15,
        isVerified: true,
        memberSince: '2024',
        bio: 'Tech consultant travelling weekly',
        languages: ['English', 'Japanese'],
      },
      createdAt: '2026-11-02T10:00:00Z',
      status: 'active',
    },
  ];

  // Search by arrival city
  const resultTokyo = filterAndSortTrips(sampleTrips, {
    query: '',
    departureCity: '',
    arrivalCity: 'Tokyo',
    sortBy: 'date_asc',
  });
  assert.equal(resultTokyo.length, 1);
  assert.equal(resultTokyo[0].id, '2');

  // Search by general query matching Bangkok
  const resultBkk = filterAndSortTrips(sampleTrips, {
    query: 'bangkok',
    departureCity: '',
    arrivalCity: '',
    sortBy: 'date_asc',
  });
  assert.equal(resultBkk.length, 1);
  assert.equal(resultBkk[0].id, '1');

  // Sort by date_asc
  const sorted = filterAndSortTrips(sampleTrips, {
    query: '',
    departureCity: '',
    arrivalCity: '',
    sortBy: 'date_asc',
  });
  assert.equal(sorted[0].id, '2'); // 2026-11-15 is before 2026-11-20
});
