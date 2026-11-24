// Feed placement: 320x50 iframe banner
export const ADSTERRA_BANNER_KEY = 'd13f09e326ea9306377915a20333ddd5';
export const ADSTERRA_BANNER_SCRIPT_SRC =
  'https://bicea.org/22/d13f09e326ea9306377915a20333ddd5';
export const ADSTERRA_BANNER_WIDTH = 320;
export const ADSTERRA_BANNER_HEIGHT = 50;

// Trip Detail placement: Native Banner
export const ADSTERRA_NATIVE_CONTAINER_ID =
  'container-a0dcee3020828a955c6cd6883aaf9256';
export const ADSTERRA_NATIVE_SCRIPT_SRC =
  'https://bicea.org/21/a0dcee3020828a955c6cd6883aaf9256';

export type FeedAdCategory = 'partner' | 'cargo_partner';

export interface CustomFeedAd {
  id: string;
  category: FeedAdCategory;
  partnerId?: string;
  logoUrl: string;
  fallbackLogoUrl?: string;
  title: string;
  text: string;
  href: string;
  serviceCountries?: string[];
  freightBadges?: string[];
}

export const CUSTOM_FEED_ADS: readonly CustomFeedAd[] = [
  {
    id: 'custom-ad-astronerd',
    category: 'partner',
    logoUrl:
      'https://lh7-us.googleusercontent.com/sitesv-images-rt/APXyLQcCv7gv1G9NV5OU3ob4BqVdbwmxMziuJEXPAr7mk5_6Qes4w1-chKJFryoRN8oJ4kXv501gpcK-ropWDD_iepo1zdV0c3PazmrFCvVaD9OQZ3-7Yi0T6K2QqEwZ0bwclm8fxfu8HUCCtGM7XLDUDxsvJ1kxwuglf5n70Ac9KXMrzdXgsvuvp5zKik5bPi0=w16383',
    fallbackLogoUrl: '/ads/astronerd-logo.png',
    title: 'AstroNerd Inc.',
    text: 'Digital Products',
    href: 'https://www.astronerd.me',
  },
  {
    id: 'custom-ad-nxe-gadgets',
    category: 'partner',
    logoUrl: '/ads/nxe-gadgets-logo.jpg',
    fallbackLogoUrl: '/ads/nxe-gadgets-logo.jpg',
    title: 'NXE Gadgets',
    text: 'Electronics Store',
    href: 'https://web.facebook.com/nxegadgets',
  },
  {
    id: 'custom-ad-khint-power',
    category: 'cargo_partner',
    partnerId: 'khint-power',
    logoUrl: '/ads/khint-power-logo.jpg',
    fallbackLogoUrl: '/ads/khint-power-logo.jpg',
    title: 'Khint Power International Trading Co.,Ltd.',
    text: 'Cargo & E-commerence',
    href: 'https://web.facebook.com/Khintpowercargo',
    serviceCountries: ['Thailand', 'Myanmar', 'China', 'Singapore', 'Malaysia', 'Japan'],
    freightBadges: ['Air Cargo', 'Land Express', 'Sea Freight'],
  },
];

const AD_ROTATION_STORAGE_KEY = 'luukyone_partner_ad_rotation_offset';

/**
 * Returns the partner ads rotated cyclically by `rotationOffset`
 * so each partner card alternates between 1st, 2nd, 3rd ad slot positions.
 */
export function getRotatedCustomFeedAds(
  ads: readonly CustomFeedAd[] = CUSTOM_FEED_ADS,
  rotationOffset: number = 0
): CustomFeedAd[] {
  if (!Array.isArray(ads) || ads.length === 0) {
    return [];
  }
  const len = ads.length;
  const normalizedOffset = ((Math.trunc(rotationOffset) % len) + len) % len;
  if (normalizedOffset === 0) {
    return [...ads];
  }
  return [...ads.slice(normalizedOffset), ...ads.slice(0, normalizedOffset)];
}

/**
 * Reads the current rotation index and advances it in localStorage so
 * subsequent visits/reloads alternate partner ad card positions fairly.
 */
export function consumeNextAdRotationOffset(totalAds: number = CUSTOM_FEED_ADS.length): number {
  if (totalAds <= 1) return 0;
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return 0;
    }
    const raw = window.localStorage.getItem(AD_ROTATION_STORAGE_KEY);
    const parsed = raw ? parseInt(raw, 10) : 0;
    const current = Number.isFinite(parsed) && parsed >= 0 ? parsed % totalAds : 0;
    const next = (current + 1) % totalAds;
    window.localStorage.setItem(AD_ROTATION_STORAGE_KEY, String(next));
    return current;
  } catch {
    return 0;
  }
}

export function getCustomFeedAd(adSlotIndex: number, rotationOffset: number = 0): CustomFeedAd | null {
  if (adSlotIndex < 0 || adSlotIndex >= CUSTOM_FEED_ADS.length) {
    return null;
  }
  const rotatedAds = getRotatedCustomFeedAds(CUSTOM_FEED_ADS, rotationOffset);
  return rotatedAds[adSlotIndex] || null;
}

export type FeedItem<T> =
  | { type: 'trip'; trip: T; index: number }
  | {
      type: 'ad';
      id: string;
      afterIndex: number;
      adSlotIndex: number;
      customAd: CustomFeedAd | null;
    };

/**
 * Interleaves an ad slot after every `interval` trip items
 * (by default after indices 4, 9, 14, 19, etc.).
 * Slots 0, 1, 2 map to rotated custom ads (including Cargo Partners);
 * later slots fall back to the Adsterra feed ad.
 */
export function buildFeedWithAds<T>(
  trips: readonly T[],
  interval: number = 5,
  rotationOffset: number = 0
): FeedItem<T>[] {
  if (!Array.isArray(trips) || trips.length === 0) {
    return [];
  }

  const safeInterval = interval > 0 ? Math.floor(interval) : 5;
  const items: FeedItem<T>[] = [];
  let adSlotIndex = 0;

  for (let i = 0; i < trips.length; i++) {
    items.push({ type: 'trip', trip: trips[i], index: i });
    if ((i + 1) % safeInterval === 0) {
      const customAd = getCustomFeedAd(adSlotIndex, rotationOffset);
      items.push({
        type: 'ad',
        id: customAd ? `partner-slot-${adSlotIndex}-${customAd.id}` : `adsterra-feed-after-${i}`,
        afterIndex: i,
        adSlotIndex,
        customAd,
      });
      adSlotIndex += 1;
    }
  }

  return items;
}

/**
 * Generates an isolated HTML document for a 320x50 Adsterra iframe banner slot
 * so `atOptions` and `document.write` execute cleanly per slot without
 * colliding across multiple cards in the feed.
 */
export function buildAdsterraBannerSrcDoc(): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    </style>
  </head>
  <body>
    <script type="text/javascript">
      atOptions = {
        'key' : '${ADSTERRA_BANNER_KEY}',
        'format' : 'iframe',
        'height' : ${ADSTERRA_BANNER_HEIGHT},
        'width' : ${ADSTERRA_BANNER_WIDTH},
        'params' : {}
      };
    </script>
    <script type="text/javascript" src="${ADSTERRA_BANNER_SCRIPT_SRC}"></script>
  </body>
</html>`;
}
