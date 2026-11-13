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
 * Formats Facebook profile URL.
 * Accepts full URL (https://facebook.com/user), username with/without @, or profile ID.
 */
export function formatFacebookUrl(input?: string): string {
  if (!input) return '';
  const clean = input.trim();
  if (!clean) return '';
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }
  const handle = clean
    .replace(/^@+/, '')
    .replace(/^https?:\/\/(www\.)?facebook\.com\//, '')
    .replace(/^https?:\/\/(www\.)?fb\.com\//, '')
    .replace(/^facebook\.com\//, '')
    .replace(/^fb\.com\//, '');
  return `https://facebook.com/${handle}`;
}

/**
 * Extracts clean readable display label for a Facebook link or handle.
 */
export function getFacebookDisplay(input?: string): string {
  if (!input) return '';
  const clean = input.trim();
  if (!clean) return '';
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    try {
      const url = new URL(clean);
      const path = url.pathname.replace(/^\//, '').replace(/\/$/, '');
      if (path && !path.includes('profile.php')) return path;
      return url.hostname + url.pathname;
    } catch {
      return clean;
    }
  }
  return clean.replace(/^@+/, '');
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
export function getDropOffStatus(lastDropOffDateStr?: string, referenceDateStr?: string): {
  daysRemaining: number;
  label: string;
  isUrgent: boolean;
  isExpired: boolean;
} {
  if (!lastDropOffDateStr || typeof lastDropOffDateStr !== 'string') {
    return {
      daysRemaining: 0,
      label: 'Drop-off date TBD',
      isUrgent: false,
      isExpired: false,
    };
  }

  const refDate = referenceDateStr ? new Date(referenceDateStr) : new Date();
  refDate.setHours(0, 0, 0, 0);

  const parts = lastDropOffDateStr.split('-').map(Number);
  const targetDate =
    parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])
      ? new Date(parts[0], parts[1] - 1, parts[2])
      : new Date(lastDropOffDateStr);

  if (isNaN(targetDate.getTime())) {
    return {
      daysRemaining: 0,
      label: 'Drop-off date TBD',
      isUrgent: false,
      isExpired: false,
    };
  }

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
 * Checks if a trip has expired based on its delivery date (checkOutDate or arrivalDate).
 * If delivery date is strictly earlier than today, returns true.
 */
export function isTripExpired(
  trip: { checkOutDate?: string; arrivalDate?: string; departureDate?: string },
  referenceDate?: Date
): boolean {
  const deliveryDateStr = trip.checkOutDate || trip.arrivalDate || trip.departureDate;
  if (!deliveryDateStr) return false;

  const today = referenceDate ? new Date(referenceDate) : new Date();
  today.setHours(0, 0, 0, 0);

  const parts = deliveryDateStr.split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    const deliveryDate = new Date(parts[0], parts[1] - 1, parts[2]);
    deliveryDate.setHours(0, 0, 0, 0);
    return deliveryDate.getTime() < today.getTime();
  }

  const d = new Date(deliveryDateStr);
  if (isNaN(d.getTime())) return false;
  d.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime();
}

/**
 * Checks if a trip's last drop-off date has passed (strictly earlier than today).
 * Used for traveler profile trip history to auto-expire trips once drop-off passes.
 */
export function isDropOffDatePassed(dropOffDateStr: string, referenceDate?: Date): boolean {
  if (!dropOffDateStr) return false;
  const today = referenceDate ? new Date(referenceDate) : new Date();
  today.setHours(0, 0, 0, 0);

  const parts = dropOffDateStr.split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setHours(0, 0, 0, 0);
    return d.getTime() < today.getTime();
  }
  const d = new Date(dropOffDateStr);
  if (isNaN(d.getTime())) return false;
  d.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime();
}

export interface FilterOptions {
  hideExpired?: boolean;
  hideFullyBooked?: boolean;
  referenceDate?: Date;
}

/**
 * Filters and sorts trip posts according to search parameters.
 * Automatically excludes expired trips and fully booked trips from the public list by default.
 */
export function filterAndSortTrips(
  trips: TripPost[],
  filters: TripFilters,
  options: FilterOptions = { hideExpired: true, hideFullyBooked: true }
): TripPost[] {
  const query = (filters.query || '').trim().toLowerCase();
  const dep = (filters.departureCity || '').trim().toLowerCase();
  const arr = (filters.arrivalCity || '').trim().toLowerCase();
  const { hideExpired = true, hideFullyBooked = true, referenceDate } = options;

  const filtered = trips.filter((trip) => {
    // 1. Fully Booked Status: hide from public home list
    if (hideFullyBooked && trip.status === 'fully_booked') {
      return false;
    }

    // 2. Auto-expire: hide from public home list once Drop-off date is over
    if (hideExpired && (isDropOffDatePassed(trip.lastDropOffDate, referenceDate) || isTripExpired(trip, referenceDate))) {
      return false;
    }

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
      const tripDate = trip.departureDate || trip.lastDropOffDate || '';
      if (tripDate < filters.dateFrom) {
        return false;
      }
    }

    return true;
  });

  // Sort
  return filtered.sort((a, b) => {
    if (filters.sortBy === 'date_asc') {
      const dateA = a.departureDate || a.lastDropOffDate || '';
      const dateB = b.departureDate || b.lastDropOffDate || '';
      return dateA.localeCompare(dateB);
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

/**
 * Formats account creation date for "Member since" display (e.g. "Nov 9, 2026").
 * Formats clean human dates from ISO dates, creation timestamps, or date strings.
 */
export function formatMemberSince(dateInput?: string): string {
  if (!dateInput) {
    return '2026';
  }

  const trimmed = dateInput.trim();
  if (!trimmed || trimmed.toLowerCase() === 'today') {
    return '2026';
  }

  // Preserve 4-digit year like "2026" or "2025"
  if (/^\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  // Already formatted like "Nov 9, 2026", "Nov 2026", or "Jan 2025"
  if (/^[A-Za-z]{3,9}\s+(\d{1,2},\s+)?\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  } catch {
    // fallback
  }

  return trimmed;
}

/**
 * Calculates completed trips count for a given traveler.
 * A trip is counted as completed when its drop-off date has passed (it disappears from active board)
 * or its status is marked completed.
 */
export function countCompletedTripsForTraveler(
  trips: TripPost[],
  traveler: { name?: string; userId?: string }
): number {
  if (!traveler || !Array.isArray(trips)) return 0;
  const name = traveler.name?.trim().toLowerCase();
  const uid = traveler.userId;

  return trips.filter((trip) => {
    const matchUser = Boolean(uid && trip.userId && trip.userId === uid);
    const matchName = Boolean(name && trip.traveler?.name && trip.traveler.name.trim().toLowerCase() === name);
    if (!matchUser && !matchName) return false;
    return isDropOffDatePassed(trip.lastDropOffDate) || trip.status === 'completed';
  }).length;
}

