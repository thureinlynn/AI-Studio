import test from 'node:test';
import assert from 'node:assert/strict';
import { isTripExpired, isDropOffDatePassed, filterAndSortTrips, formatMemberSince } from './tripUtils';
import { TripPost, TripFilters } from '../types/trip';

const dummyTraveler = {
  name: 'Test Traveler',
  avatarUrl: '',
  rating: 5,
  reviewCount: 0,
  tripsCompleted: 1,
  isVerified: true,
  memberSince: '2026',
  bio: '',
  languages: ['English'],
};

const dummyContacts = {
  whatsapp: '+66812345678',
  viber: '+66812345678',
  telegram: 'traveler',
};

test('isTripExpired returns true when delivery date is in the past', () => {
  const refDate = new Date(2026, 10, 15); // Nov 15, 2026
  const pastTrip = { checkOutDate: '2026-11-10' };
  const futureTrip = { checkOutDate: '2026-11-20' };
  const todayTrip = { checkOutDate: '2026-11-15' };

  assert.equal(isTripExpired(pastTrip, refDate), true);
  assert.equal(isTripExpired(futureTrip, refDate), false);
  assert.equal(isTripExpired(todayTrip, refDate), false);
});

test('isDropOffDatePassed returns true only when drop-off date has strictly passed', () => {
  const refDate = new Date(2026, 10, 15); // Nov 15, 2026
  assert.equal(isDropOffDatePassed('2026-11-14', refDate), true); // yesterday -> passed
  assert.equal(isDropOffDatePassed('2026-11-15', refDate), false); // today -> still valid
  assert.equal(isDropOffDatePassed('2026-11-16', refDate), false); // tomorrow -> still valid
});

test('filterAndSortTrips excludes fully booked and expired trips from public list', () => {
  const refDate = new Date(2026, 10, 15); // Nov 15, 2026

  const activeValidTrip: TripPost = {
    id: 'trip-1',
    userId: 'u1',
    departureCity: 'Bangkok',
    departureCountry: 'Thailand',
    arrivalCity: 'Yangon',
    arrivalCountry: 'Myanmar',
    departureDate: '2026-11-16',
    arrivalDate: '2026-11-16',
    lastDropOffDate: '2026-11-15',
    checkOutDate: '2026-11-17',
    weightCapacityKg: 0,
    weightAvailableKg: 0,
    serviceFeeType: 'free',
    announcement: 'Flying BKK to RGN',
    dropOffLocationNote: 'Airport',
    pickUpLocationNote: 'Downtown',
    acceptedItems: ['Documents'],
    prohibitedItems: [],
    contacts: dummyContacts,
    traveler: dummyTraveler,
    createdAt: '2026-11-01T00:00:00.000Z',
    status: 'active',
  };

  const fullyBookedTrip: TripPost = {
    ...activeValidTrip,
    id: 'trip-2',
    status: 'fully_booked',
  };

  const expiredTrip: TripPost = {
    ...activeValidTrip,
    id: 'trip-3',
    checkOutDate: '2026-11-10', // past delivery date
  };

  const filters: TripFilters = {
    query: '',
    departureCity: '',
    arrivalCity: '',
    sortBy: 'date_asc',
  };

  // Public list: should only keep active, non-expired trip
  const publicList = filterAndSortTrips([activeValidTrip, fullyBookedTrip, expiredTrip], filters, {
    hideExpired: true,
    hideFullyBooked: true,
    referenceDate: refDate,
  });

  assert.equal(publicList.length, 1);
  assert.equal(publicList[0].id, 'trip-1');

  // Private profile list: options allows viewing all
  const profileList = filterAndSortTrips([activeValidTrip, fullyBookedTrip, expiredTrip], filters, {
    hideExpired: false,
    hideFullyBooked: false,
    referenceDate: refDate,
  });

  assert.equal(profileList.length, 3);
});

test('formatMemberSince formats account creation dates and avoids today date fallback', () => {
  assert.equal(formatMemberSince('2026-01-15T00:00:00.000Z'), 'Jan 15, 2026');
  assert.equal(formatMemberSince('Sun, 08 Nov 2026 12:00:00 GMT'), 'Nov 8, 2026');
  assert.equal(formatMemberSince('Nov 8, 2026'), 'Nov 8, 2026');
  assert.equal(formatMemberSince('2026'), '2026');
  assert.equal(formatMemberSince('Today'), '2026');
  assert.equal(formatMemberSince(''), '2026');
  assert.equal(formatMemberSince(undefined), '2026');
});
