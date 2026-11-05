import { TripPost } from '../types/trip';

/**
 * Initial empty trips list so users start purely with newly created trips.
 */
export const INITIAL_TRIPS: TripPost[] = [];

export const POPULAR_ROUTES = [
  { from: 'Bangkok', to: 'Yangon' },
  { from: 'Singapore', to: 'Tokyo' },
  { from: 'London', to: 'New York' },
  { from: 'Dubai', to: 'Mumbai' },
  { from: 'Paris', to: 'Montreal' },
  { from: 'Sydney', to: 'Denpasar (Bali)' },
];

export const COMMON_ITEM_CATEGORIES = [
  'Urgent Documents & Letters',
  'Clothing & Fashion Goods',
  'Sealed Packaged Food & Snacks',
  'Electronics & Tech Accessories',
  'Cosmetics & Personal Care',
  'Books, Stationery & Prints',
  'Gifts & Souvenirs',
  'Prescription Medicines (with receipt)',
];
