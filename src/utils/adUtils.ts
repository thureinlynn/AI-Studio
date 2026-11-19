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

export interface CustomFeedAd {
  id: string;
  logoUrl: string;
  fallbackLogoUrl?: string;
  title: string;
  text: string;
  href: string;
}

export const CUSTOM_FEED_ADS: readonly CustomFeedAd[] = [
  {
    id: 'custom-ad-astronerd',
    logoUrl:
      'https://lh7-us.googleusercontent.com/sitesv-images-rt/APXyLQcCv7gv1G9NV5OU3ob4BqVdbwmxMziuJEXPAr7mk5_6Qes4w1-chKJFryoRN8oJ4kXv501gpcK-ropWDD_iepo1zdV0c3PazmrFCvVaD9OQZ3-7Yi0T6K2QqEwZ0bwclm8fxfu8HUCCtGM7XLDUDxsvJ1kxwuglf5n70Ac9KXMrzdXgsvuvp5zKik5bPi0=w16383',
    fallbackLogoUrl: '/ads/astronerd-logo.png',
    title: 'AstroNerd Inc.',
    text: 'Digital Products',
    href: 'https://www.astronerd.me',
  },
  {
    id: 'custom-ad-nxe-gadgets',
    logoUrl:
      'https://scontent.fbkk33-3.fna.fbcdn.net/v/t39.30808-6/668831614_122189178782759077_293872300741641685_n.jpg?stp=dst-jpg_tt6&cstp=mx1080x1080&ctp=s1080x1080&_nc_cat=106&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeF3GfsNHjjJ3Bjx7elItY6tytK0KomyKLzK0rQqibIovJF2Y8Ha0zYzq3T_ljO5T3462Lq4DrOlZ61mrBjoorJy&_nc_ohc=pK2c0mXJJPQQ7kNvwGj8roJ&_nc_oc=AdqzYtxkxwQH3Bx_EyUgk81Glv4-9kTSpQvd2d-ZZH3ROHw1KxCBW1jVFsQnTkliAu4&_nc_zt=23&_nc_ht=scontent.fbkk33-3.fna&_nc_gid=dLjXBkHvgKjy2ZzLzcIfYA&_nc_ss=7b2a8&oh=00_AQQpf4dQOgQEcO0wv3CpeD-gKUC8UcvcjsmqpE0i2mGGag&oe=6B02568B',
    fallbackLogoUrl: '/ads/nxe-gadgets-logo.jpg',
    title: 'NXE Gadgets',
    text: 'Electronics Store',
    href: 'https://web.facebook.com/nxegadgets',
  },
  {
    id: 'custom-ad-khint-power',
    logoUrl:
      'https://scontent.fbkk4-4.fna.fbcdn.net/v/t39.30808-1/481205225_643774498200913_6210346320837345925_n.jpg?stp=dst-jpg_tt6&cstp=mx1500x1500&ctp=s480x480&_nc_cat=107&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=2d3e12&_nc_eui2=AeF_TyNKUWZXZJYpBxsCfbidWSaUezzb0AZZJpR7PNvQBnQsiuj8wYfW06lAnXk04VwzgT56J1WpwM-_7pUIik6j&_nc_ohc=wK7OTa_PCm8Q7kNvwFPgTcO&_nc_oc=Adr5aUhZm90yI-J4wIkm0-_U6qteOxKVNWXWUnBd_XuUuuQudo1QFCEUpxoFEXDoK08&_nc_zt=24&_nc_ht=scontent.fbkk4-4.fna&_nc_gid=Oss3oMsGI3nRAju9fzCwWA&_nc_ss=7b2a8&oh=00_AQSc-LYGm668tiGzc7yl6MHo8Fw0cPJrmYowfzJcjDY4Kg&oe=6B015CC7',
    fallbackLogoUrl: '/ads/khint-power-logo.jpg',
    title: 'Khint Power International Trading Co.,Ltd.',
    text: 'Cargo & E-commerence',
    href: 'https://web.facebook.com/Khintpowercargo',
  },
];

export function getCustomFeedAd(adSlotIndex: number): CustomFeedAd | null {
  if (adSlotIndex < 0 || adSlotIndex >= CUSTOM_FEED_ADS.length) {
    return null;
  }
  return CUSTOM_FEED_ADS[adSlotIndex];
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
 * Slots 0 (6th card), 1 (12th card), and 2 (18th card) map to configured custom ads;
 * later slots fall back to the Adsterra feed ad.
 */
export function buildFeedWithAds<T>(
  trips: readonly T[],
  interval: number = 5
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
      items.push({
        type: 'ad',
        id: `adsterra-feed-after-${i}`,
        afterIndex: i,
        adSlotIndex,
        customAd: getCustomFeedAd(adSlotIndex),
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
