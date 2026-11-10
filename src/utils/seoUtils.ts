import type { TripPost } from '../types/trip';

export const SITE_URL = 'https://luukyone.astronerd.me';
export const SITE_NAME = 'LuuKyone';
export const SITE_TITLE = 'LuuKyone - Traveler Extra Space Classifieds | Peer Baggage Sharing';
export const DEFAULT_DESCRIPTION =
  'Free peer-to-peer baggage space classifieds connecting international travelers with extra luggage allowance to senders needing parcels, documents, and gifts delivered.';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/aistudio/1793174899099_3f8af047.png`;
export const DEFAULT_KEYWORDS =
  'LuuKyone, traveler classifieds, luggage space sharing, extra baggage allowance, peer-to-peer package delivery, send parcel overseas, Bangkok to Yangon luggage, travel baggage space, international parcel courier alternative';

/**
 * Returns a standardized canonical URL for search engines
 */
export function formatCanonicalUrl(tripId?: string | null, tab?: string | null): string {
  if (tripId && tripId.trim()) {
    return `${SITE_URL}/?trip=${encodeURIComponent(tripId.trim())}`;
  }
  if (tab && tab.trim() && tab !== 'browse') {
    return `${SITE_URL}/?tab=${encodeURIComponent(tab.trim())}`;
  }
  return `${SITE_URL}/`;
}

/**
 * Generates Schema.org WebSite JSON-LD
 */
export function generateWebSiteSchema(siteUrl: string = SITE_URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: `${siteUrl}/`,
    name: 'LuuKyone',
    alternateName: 'LuuKyone - Traveler Classifieds',
    description: DEFAULT_DESCRIPTION,
    inLanguage: ['en', 'my'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generates Schema.org Organization JSON-LD
 */
export function generateOrganizationSchema(siteUrl: string = SITE_URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: 'LuuKyone',
    url: `${siteUrl}/`,
    logo: DEFAULT_OG_IMAGE,
    description: 'Community platform connecting verified travelers and senders for mutual baggage allowance sharing.',
    sameAs: [],
  };
}

/**
 * Generates rich Schema.org structured data for an individual trip listing
 * Combines TravelAction, Service, and Offer for rich Google Search indexing
 */
export function generateTripJsonLd(trip: TripPost, siteUrl: string = SITE_URL) {
  const tripUrl = `${siteUrl}/?trip=${encodeURIComponent(trip.id)}`;
  const tripTitle = `${trip.departureCity} to ${trip.arrivalCity} (${trip.weightAvailableKg}kg Luggage Space)`;
  const description =
    trip.announcement ||
    `Traveler ${trip.traveler.name} is offering ${trip.weightAvailableKg}kg spare baggage capacity from ${trip.departureCity}, ${trip.departureCountry} to ${trip.arrivalCity}, ${trip.arrivalCountry}. Drop-off deadline: ${trip.lastDropOffDate}.`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. TravelAction schema
      {
        '@type': 'TravelAction',
        '@id': `${tripUrl}#travelaction`,
        name: tripTitle,
        description,
        fromLocation: {
          '@type': 'Place',
          name: `${trip.departureCity}, ${trip.departureCountry}`,
          address: {
            '@type': 'PostalAddress',
            addressLocality: trip.departureCity,
            addressCountry: trip.departureCountry,
          },
        },
        toLocation: {
          '@type': 'Place',
          name: `${trip.arrivalCity}, ${trip.arrivalCountry}`,
          address: {
            '@type': 'PostalAddress',
            addressLocality: trip.arrivalCity,
            addressCountry: trip.arrivalCountry,
          },
        },
        agent: {
          '@type': 'Person',
          name: trip.traveler.name,
          description: trip.traveler.bio || 'Verified Community Traveler',
        },
        startTime: trip.lastDropOffDate,
        endTime: trip.checkOutDate,
      },
      // 2. Service & Offer schema for search snippet enhancement
      {
        '@type': 'Service',
        '@id': `${tripUrl}#service`,
        name: `Luggage Space Delivery: ${trip.departureCity} to ${trip.arrivalCity}`,
        serviceType: 'Luggage Transport & Parcel Courier Peer Service',
        provider: {
          '@type': 'Person',
          name: trip.traveler.name,
        },
        areaServed: [
          {
            '@type': 'AdministrativeArea',
            name: trip.departureCity,
          },
          {
            '@type': 'AdministrativeArea',
            name: trip.arrivalCity,
          },
        ],
        offers: {
          '@type': 'Offer',
          url: tripUrl,
          price: trip.serviceFeeType === 'free' ? '0' : '1',
          priceCurrency: 'USD',
          description:
            trip.feeDescription ||
            (trip.serviceFeeType === 'free' ? 'Free voluntary space sharing' : 'Traveler expense contribution'),
          availability: trip.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
          validFrom: trip.createdAt || new Date().toISOString(),
        },
      },
      // 3. BreadcrumbList schema
      {
        '@type': 'BreadcrumbList',
        '@id': `${tripUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${siteUrl}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: `${trip.departureCity} to ${trip.arrivalCity}`,
            item: tripUrl,
          },
        ],
      },
    ],
  };
}

/**
 * Generates Schema.org BreadcrumbList for static views
 */
export function generateBreadcrumbJsonLd(items: Array<{ name: string; url: string }>, siteUrl: string = SITE_URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url.startsWith('/') ? '' : '/'}${item.url}`,
    })),
  };
}

/**
 * Generates standard XML sitemap
 */
export function generateSitemapXml(trips: TripPost[] = [], siteUrl: string = SITE_URL): string {
  const today = new Date().toISOString().split('T')[0];

  const staticUrls = [
    { loc: `${siteUrl}/`, priority: '1.0', changefreq: 'daily', lastmod: today },
    { loc: `${siteUrl}/?tab=how_it_works`, priority: '0.8', changefreq: 'weekly', lastmod: today },
    { loc: `${siteUrl}/?tab=safety`, priority: '0.8', changefreq: 'weekly', lastmod: today },
    { loc: `${siteUrl}/?tab=my_trips`, priority: '0.5', changefreq: 'monthly', lastmod: today },
  ];

  const tripUrls = trips.map((trip) => {
    let lastmod = today;
    if (trip.createdAt) {
      try {
        lastmod = new Date(trip.createdAt).toISOString().split('T')[0];
      } catch {
        lastmod = today;
      }
    }
    return {
      loc: `${siteUrl}/?trip=${encodeURIComponent(trip.id)}`,
      priority: trip.status === 'active' ? '0.9' : '0.6',
      changefreq: 'daily',
      lastmod,
    };
  });

  const allUrls = [...staticUrls, ...tripUrls];

  const urlElements = allUrls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlElements}
</urlset>
`;
}
