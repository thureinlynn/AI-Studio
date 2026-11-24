export interface PartnerBranchAddress {
  id: string;
  country: string;
  city: string;
  branchName: string;
  addressLine: string;
  postalCode?: string;
  receivingCodeHint?: string;
  hoursNote?: string;
}

export interface PartnerPhoneContact {
  id: string;
  label: string;
  country?: string;
  number: string;
}

export interface PartnerMessagingContact {
  id: string;
  label: string;
  value: string;
}

export interface PartnerServiceRegion {
  country: string;
  corridorLabel?: string;
  transitEstimate?: string;
}

export interface PartnerFreightMode {
  mode: 'air' | 'sea' | 'land' | 'express' | 'ecommerce';
  title: string;
  transitTime: string;
  cutOffSchedule: string;
  minWeight?: string;
  rateNote: string;
  highlights: string[];
}

export interface PartnerAnnouncement {
  id: string;
  title: string;
  date: string;
  pinned?: boolean;
  category: 'rate_update' | 'schedule' | 'notice' | 'promotion';
  content: string;
}

export interface PartnerBusinessHours {
  timezone: string;
  summary: string;
  schedule: { days: string; hours: string; note?: string }[];
}

export interface CargoPartner {
  id: string;
  name: string;
  shortName?: string;
  categoryLabel: string;
  tagline: string;
  description: string;
  logoUrl: string;
  fallbackLogoUrl?: string;
  websiteUrl?: string;
  establishedYear?: string;
  servicesOffered: string[];
  serviceRegions: PartnerServiceRegion[];
  freightModes: PartnerFreightMode[];
  addresses: PartnerBranchAddress[];
  businessHours: PartnerBusinessHours;
  announcements: PartnerAnnouncement[];
  contacts: {
    phones: PartnerPhoneContact[];
    whatsapp: PartnerMessagingContact[];
    viber: PartnerMessagingContact[];
    facebook: { label: string; url: string }[];
    email?: string;
  };
  volumetricRule: string;
  warehouseLabelingSteps: string[];
  acceptedCargo: string[];
  restrictedCargo: string[];
}
