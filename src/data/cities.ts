export interface CityOption {
  city: string;
  country: string;
  code?: string;
}

export const POPULAR_CITIES: CityOption[] = [
  { city: 'Bangkok', country: 'Thailand', code: 'BKK' },
  { city: 'Yangon', country: 'Myanmar', code: 'RGN' },
  { city: 'Singapore', country: 'Singapore', code: 'SIN' },
  { city: 'Tokyo', country: 'Japan', code: 'HND' },
  { city: 'London', country: 'United Kingdom', code: 'LHR' },
  { city: 'New York', country: 'United States', code: 'JFK' },
  { city: 'Dubai', country: 'United Arab Emirates', code: 'DXB' },
  { city: 'Mumbai', country: 'India', code: 'BOM' },
  { city: 'Paris', country: 'France', code: 'CDG' },
  { city: 'Montreal', country: 'Canada', code: 'YUL' },
  { city: 'Sydney', country: 'Australia', code: 'SYD' },
  { city: 'Denpasar (Bali)', country: 'Indonesia', code: 'DPS' },
  { city: 'Kuala Lumpur', country: 'Malaysia', code: 'KUL' },
  { city: 'Seoul', country: 'South Korea', code: 'ICN' },
  { city: 'Hong Kong', country: 'Hong Kong', code: 'HKG' },
  { city: 'Taipei', country: 'Taiwan', code: 'TPE' },
  { city: 'Hanoi', country: 'Vietnam', code: 'HAN' },
  { city: 'Ho Chi Minh City', country: 'Vietnam', code: 'SGN' },
  { city: 'Manila', country: 'Philippines', code: 'MNL' },
  { city: 'Jakarta', country: 'Indonesia', code: 'CGK' },
  { city: 'Phnom Penh', country: 'Cambodia', code: 'PNH' },
  { city: 'Vientiane', country: 'Laos', code: 'VTE' },
  { city: 'Doha', country: 'Qatar', code: 'DOH' },
  { city: 'Istanbul', country: 'Turkey', code: 'IST' },
  { city: 'Frankfurt', country: 'Germany', code: 'FRA' },
  { city: 'Amsterdam', country: 'Netherlands', code: 'AMS' },
  { city: 'Los Angeles', country: 'United States', code: 'LAX' },
  { city: 'San Francisco', country: 'United States', code: 'SFO' },
  { city: 'Melbourne', country: 'Australia', code: 'MEL' },
  { city: 'Auckland', country: 'New Zealand', code: 'AKL' },
  { city: 'Mandalay', country: 'Myanmar', code: 'MDL' },
  { city: 'Chiang Mai', country: 'Thailand', code: 'CNX' },
  { city: 'Phuket', country: 'Thailand', code: 'HKT' },
  { city: 'Osaka', country: 'Japan', code: 'KIX' },
  { city: 'Beijing', country: 'China', code: 'PEK' },
  { city: 'Shanghai', country: 'China', code: 'PVG' },
];

export function filterCities(query: string): CityOption[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return POPULAR_CITIES;
  return POPULAR_CITIES.filter(
    (c) =>
      c.city.toLowerCase().includes(normalized) ||
      c.country.toLowerCase().includes(normalized) ||
      (c.code && c.code.toLowerCase().includes(normalized))
  );
}
