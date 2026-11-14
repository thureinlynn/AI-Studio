export const ADSTERRA_BANNER_KEY = 'd13f09e326ea9306377915a20333ddd5';
export const ADSTERRA_BANNER_SCRIPT_SRC =
  'https://bicea.org/22/d13f09e326ea9306377915a20333ddd5';
export const ADSTERRA_BANNER_WIDTH = 320;
export const ADSTERRA_BANNER_HEIGHT = 50;

export type FeedItem<T> =
  | { type: 'trip'; trip: T; index: number }
  | { type: 'ad'; id: string; afterIndex: number };

/**
 * Interleaves an ad slot after every `interval` trip items
 * (by default after indices 4, 9, 14, etc.).
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

  for (let i = 0; i < trips.length; i++) {
    items.push({ type: 'trip', trip: trips[i], index: i });
    if ((i + 1) % safeInterval === 0) {
      items.push({
        type: 'ad',
        id: `adsterra-feed-after-${i}`,
        afterIndex: i,
      });
    }
  }

  return items;
}

/**
 * Generates an isolated HTML document for a 320x50 Adsterra iframe banner slot
 * so `atOptions` and `document.write` execute cleanly per slot without
 * colliding across multiple cards or SPA navigation.
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
