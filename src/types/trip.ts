export interface TravelerContact {
  whatsapp: string; // e.g. +66812345678 or +95912345678
  viber: string;    // e.g. +66812345678
  telegram: string; // e.g. @traveler_alex or traveler_alex
  facebook?: string; // e.g. https://facebook.com/alex or alex
  preferred?: 'whatsapp' | 'viber' | 'telegram' | 'facebook' | 'any';
}

export interface TravelerProfile {
  name: string;
  avatarUrl: string;
  rating: number; // e.g. 4.9
  reviewCount: number;
  tripsCompleted: number;
  isVerified: boolean;
  memberSince: string;
  bio: string;
  languages: string[];
}

export type TripStatus = 'active' | 'fully_booked' | 'completed';

export interface TripPost {
  id: string;
  userId: string;
  // Route
  departureCity: string;
  departureCountry: string;
  departureAirportCode?: string;
  arrivalCity: string;
  arrivalCountry: string;
  arrivalAirportCode?: string;
  
  // Dates (Flight departure and arrival removed per requirements)
  departureDate?: string;
  arrivalDate?: string;
  lastDropOffDate: string; // deadline to hand over item to traveler
  checkOutDate: string;    // delivery / when receiver can pick up item at destination
  
  // Capacity & specs
  weightCapacityKg: number;   // total space offered
  weightAvailableKg: number;  // remaining available
  serviceFeeType: 'free' | 'voluntary_tip' | 'shared_cost';
  feeDescription?: string;    // e.g. "Free voluntary carry" or "$7/kg handling assistance"
  
  // Items & Announcements
  announcement: string;       // The public announcement note for this specific trip
  flightNumber?: string;
  dropOffLocationNote: string; // where sender meets traveler in departure city
  pickUpLocationNote: string;  // where recipient meets traveler in arrival city
  acceptedItems: string[];
  prohibitedItems: string[];
  
  // Contact
  contacts: TravelerContact;
  
  // Traveler Info
  traveler: TravelerProfile;
  
  createdAt: string;
  status: TripStatus;
}

export interface TripFilters {
  query: string;
  departureCity: string;
  arrivalCity: string;
  minWeight?: number;
  maxWeight?: number;
  dateFrom?: string;
  sortBy: 'date_asc' | 'weight_desc' | 'newest';
}
