import { TripPost, TripFilters } from '../types/trip';

/**
 * Strips formatting symbols from phone numbers while preserving digits.
 * If leading plus is present or required, formats for WhatsApp (digits only, e.g. 15551234567 or 66812345678).
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, '');
}

/**
 * Builds direct WhatsApp click-to-chat URL with optional pre-filled message.
 */
export function formatWhatsAppUrl(phone: string, message?: string): string {
  const digits = sanitizePhoneNumber(phone);
  if (!digits) return '';
  const baseUrl = `https://wa.me/${digits}`;
  if (message && message.trim()) {
    return `${baseUrl}?text=${encodeURIComponent(message.trim())}`;
  }
  return baseUrl;
}

/**
 * Sanitizes Telegram username and builds direct Telegram link.
 */
export function formatTelegramUrl(username: string): string {
  if (!username) return '';
  const clean = username.trim().replace(/^@+/, '');
  if (!clean) return '';
  return `https://t.me/${clean}`;
}

/**
 * Formats Viber link.
 * Supports native app protocol viber://chat?number=%2B<digits>
 */
export function formatViberUrl(phone: string): string {
  const digits = sanitizePhoneNumber(phone);
  if (!digits) return '';
  // Viber protocol requires URL encoded + followed by digits
  return `viber://chat?number=%2B${digits}`;
}

/**
 * Formats dates for human display (e.g. "Nov 15, 2026").
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Calculates drop-off urgency relative to today.
 */
export function getDropOffStatus(lastDropOffDateStr: string, referenceDateStr?: string): {
  daysRemaining: number;
  label: string;
  isUrgent: boolean;
  isExpired: boolean;
} {
  const refDate = referenceDateStr ? new Date(referenceDateStr) : new Date();
  refDate.setHours(0, 0, 0, 0);

  const [y, m, d] = lastDropOffDateStr.split('-').map(Number);
  const targetDate = new Date(y, m - 1, d);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - refDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      daysRemaining: diffDays,
      label: 'Drop-off closed',
      isUrgent: false,
      isExpired: true,
    };
  }

  if (diffDays === 0) {
    return {
      daysRemaining: 0,
      label: 'Drop-off today!',
      isUrgent: true,
      isExpired: false,
    };
  }

  if (diffDays === 1) {
    return {
      daysRemaining: 1,
      label: '1 day left to drop off',
      isUrgent: true,
      isExpired: false,
    };
  }

  return {
    daysRemaining: diffDays,
    label: `${diffDays} days left to drop off`,
    isUrgent: diffDays <= 3,
    isExpired: false,
  };
}

/**
 * Filters and sorts trip posts according to search parameters.
 */
export function filterAndSortTrips(trips: TripPost[], filters: TripFilters): TripPost[] {
  const query = (filters.query || '').trim().toLowerCase();
  const dep = (filters.departureCity || '').trim().toLowerCase();
  const arr = (filters.arrivalCity || '').trim().toLowerCase();

  const filtered = trips.filter((trip) => {
    // Text search query across cities, countries, traveler name, announcements, item tags
    if (query) {
      const matchDep = trip.departureCity.toLowerCase().includes(query) || trip.departureCountry.toLowerCase().includes(query);
      const matchArr = trip.arrivalCity.toLowerCase().includes(query) || trip.arrivalCountry.toLowerCase().includes(query);
      const matchTraveler = trip.traveler.name.toLowerCase().includes(query);
      const matchAnnouncement = trip.announcement.toLowerCase().includes(query);
      const matchItems = trip.acceptedItems.some(item => item.toLowerCase().includes(query));

      if (!matchDep && !matchArr && !matchTraveler && !matchAnnouncement && !matchItems) {
        return false;
      }
    }

    // Departure city match
    if (dep && dep !== 'all') {
      const matchDep = trip.departureCity.toLowerCase().includes(dep) || trip.departureCountry.toLowerCase().includes(dep);
      if (!matchDep) return false;
    }

    // Arrival city match
    if (arr && arr !== 'all') {
      const matchArr = trip.arrivalCity.toLowerCase().includes(arr) || trip.arrivalCountry.toLowerCase().includes(arr);
      if (!matchArr) return false;
    }

    // Weight range
    if (filters.minWeight !== undefined && trip.weightAvailableKg < filters.minWeight) {
      return false;
    }
    if (filters.maxWeight !== undefined && trip.weightAvailableKg > filters.maxWeight) {
      return false;
    }

    // Date from
    if (filters.dateFrom) {
      if (trip.departureDate < filters.dateFrom) {
        return false;
      }
    }

    return true;
  });

  // Sort
  return filtered.sort((a, b) => {
    if (filters.sortBy === 'date_asc') {
      return a.departureDate.localeCompare(b.departureDate);
    }
    if (filters.sortBy === 'weight_desc') {
      return b.weightAvailableKg - a.weightAvailableKg;
    }
    if (filters.sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });
}
