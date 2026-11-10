import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllTrips } from '../server/storage.ts';
import { generateSitemapXml, SITE_URL } from '../src/utils/seoUtils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log(`[Sitemap Generator] Starting sitemap build for ${SITE_URL}...`);
  try {
    const trips = await getAllTrips();
    console.log(`[Sitemap Generator] Found ${trips.length} trips in storage.`);

    const xml = generateSitemapXml(trips, SITE_URL);
    const publicDir = path.resolve(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const sitemapPath = path.resolve(publicDir, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, xml, 'utf8');
    console.log(`[Sitemap Generator] Successfully generated ${sitemapPath}`);
  } catch (error) {
    console.error('[Sitemap Generator] Error generating sitemap:', error);
    process.exit(1);
  }
}

run();
