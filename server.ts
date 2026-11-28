import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import zlib from 'zlib';
import { fileURLToPath } from 'url';
import {
  getAllTrips,
  getTripById,
  saveTrip,
  updateTripStatus,
  deleteTripById,
  findUserById,
  findUserByEmail,
  saveUser,
} from './server/storage.ts';
import {
  verifyFirebaseIdToken,
  sanitizeTripInput,
  sanitizeUserInput,
  isValidTripStatus,
  isValidTripId,
  isTripOwner,
  applyCorsHeaders,
  applySecurityHeaders,
  checkRateLimit,
} from './server/security.ts';
import { generateSitemapXml, SITE_URL } from './src/utils/seoUtils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // Global security headers
  app.use((req, res, next) => {
    applySecurityHeaders(req, res);
    next();
  });

  // Zero-dependency gzip compression for JSON APIs and text assets
  app.use((req, res, next) => {
    const acceptEncoding = String(req.headers['accept-encoding'] || '');
    if (!/\bgzip\b/i.test(acceptEncoding)) {
      return next();
    }

    const origSend = res.send.bind(res);
    res.send = ((body?: any) => {
      if (
        res.headersSent ||
        res.getHeader('Content-Encoding') ||
        res.statusCode < 200 ||
        res.statusCode >= 300 ||
        res.statusCode === 204
      ) {
        return origSend(body);
      }

      const contentType = String(res.getHeader('Content-Type') || '');
      const isCompressible =
        !contentType ||
        /^(text\/|application\/(json|javascript|xml)|image\/svg\+xml)/i.test(contentType);

      if (!isCompressible || body === undefined || body === null) {
        return origSend(body);
      }

      const buffer = Buffer.isBuffer(body)
        ? body
        : typeof body === 'string'
        ? Buffer.from(body)
        : Buffer.from(JSON.stringify(body));

      if (buffer.length < 1024) {
        return origSend(body);
      }

      if (!contentType && typeof body === 'object' && !Buffer.isBuffer(body)) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      }
      res.removeHeader('Content-Length');
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Vary', 'Accept-Encoding');
      const compressed = zlib.gzipSync(buffer, { level: 6 });
      return res.end(compressed);
    }) as typeof res.send;

    next();
  });

  // Strict JSON body size limit
  app.use(express.json({ limit: '32kb' }));

  // Clean JSON syntax error handler (no stack trace exposure)
  app.use((err: any, _req: any, res: any, next: any) => {
    if (err instanceof SyntaxError && 'body' in err) {
      return res.status(400).json({ error: 'Invalid JSON request body' });
    }
    next(err);
  });

  // Allowlisted CORS for /api/*
  app.use('/api', (req, res, next) => {
    applyCorsHeaders(req, res, 'GET, POST, PATCH, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    next();
  });

  // SEO Routes: Robots.txt & Dynamic Sitemap.xml
  app.get('/robots.txt', (req, res) => {
    const robotsPath = path.resolve(__dirname, 'public/robots.txt');
    if (fs.existsSync(robotsPath)) {
      res.type('text/plain').sendFile(robotsPath);
    } else {
      res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /api/\nHost: ${SITE_URL}\nSitemap: ${SITE_URL}/sitemap.xml\n`);
    }
  });

  app.get('/sitemap.xml', async (req, res) => {
    try {
      const trips = await getAllTrips();
      const xml = generateSitemapXml(trips, SITE_URL);
      res.type('application/xml').send(xml);
    } catch (err) {
      console.error('Error generating live sitemap:', err);
      const fallbackPath = path.resolve(__dirname, 'public/sitemap.xml');
      if (fs.existsSync(fallbackPath)) {
        res.type('application/xml').sendFile(fallbackPath);
      } else {
        res.status(500).send('Error generating sitemap');
      }
    }
  });

  // API Routes: Trips
  app.get('/api/trips', async (req, res) => {
    if (!checkRateLimit(req, 'trips-read', 120)) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    try {
      const trips = await getAllTrips();
      res.json(trips);
    } catch (err) {
      console.error('Error fetching trips:', err);
      res.status(500).json({ error: 'Failed to fetch trips' });
    }
  });

  app.post('/api/trips', async (req, res) => {
    if (!checkRateLimit(req, 'trips-write', 30)) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    try {
      const authUser = await verifyFirebaseIdToken(req.headers.authorization);
      if (!authUser) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { trip, error } = sanitizeTripInput(req.body, authUser);
      if (error || !trip) {
        return res.status(400).json({ error: error || 'Invalid trip payload' });
      }

      // If replacing an existing trip ID, verify ownership first
      const existing = await getTripById(trip.id);
      if (existing && !isTripOwner(existing, authUser.uid)) {
        return res.status(403).json({ error: 'Forbidden: you do not own this trip' });
      }

      const saved = await saveTrip(trip);
      res.status(201).json(saved);
    } catch (err) {
      console.error('Error saving trip:', err);
      res.status(500).json({ error: 'Failed to save trip' });
    }
  });

  const handlePatchTrip = async (req: any, res: any) => {
    if (!checkRateLimit(req, 'trips-write', 30)) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    try {
      const authUser = await verifyFirebaseIdToken(req.headers.authorization);
      if (!authUser) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const id = req.params.id || req.query.id || req.body?.id;
      const { status } = req.body || {};
      if (!isValidTripId(id) || !isValidTripStatus(status)) {
        return res.status(400).json({ error: 'Valid trip ID and status are required' });
      }

      const existing = await getTripById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Trip not found' });
      }

      if (!isTripOwner(existing, authUser.uid)) {
        return res.status(403).json({ error: 'Forbidden: you can only modify your own trip listings' });
      }

      const updated = await updateTripStatus(id, status);
      res.json(updated);
    } catch (err) {
      console.error('Error updating trip:', err);
      res.status(500).json({ error: 'Failed to update trip' });
    }
  };

  app.patch('/api/trips/:id', handlePatchTrip);
  app.patch('/api/trips', handlePatchTrip);

  const handleDeleteTrip = async (req: any, res: any) => {
    if (!checkRateLimit(req, 'trips-write', 30)) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    try {
      const authUser = await verifyFirebaseIdToken(req.headers.authorization);
      if (!authUser) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const id = req.params.id || req.query.id || req.body?.id;
      if (!isValidTripId(id)) {
        return res.status(400).json({ error: 'Valid trip id is required' });
      }

      const existing = await getTripById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Trip not found' });
      }

      if (!isTripOwner(existing, authUser.uid)) {
        return res.status(403).json({ error: 'Forbidden: you can only delete your own trip listings' });
      }

      await deleteTripById(id);
      res.json({ success: true, message: 'Trip deleted' });
    } catch (err) {
      console.error('Error deleting trip:', err);
      res.status(500).json({ error: 'Failed to delete trip' });
    }
  };

  app.delete('/api/trips/:id', handleDeleteTrip);
  app.delete('/api/trips', handleDeleteTrip);

  // API Routes: Users (Strictly authenticated, self-only access)
  app.get('/api/users', async (req, res) => {
    if (!checkRateLimit(req, 'users-read', 60)) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    try {
      const authUser = await verifyFirebaseIdToken(req.headers.authorization);
      if (!authUser) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const profile =
        (await findUserById(authUser.uid)) ||
        (authUser.email ? await findUserByEmail(authUser.email) : null);

      if (!profile || profile.id !== authUser.uid) {
        return res.status(404).json({ error: 'User profile not found' });
      }
      return res.json(profile);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  });

  app.post('/api/users', async (req, res) => {
    if (!checkRateLimit(req, 'users-write', 30)) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    try {
      const authUser = await verifyFirebaseIdToken(req.headers.authorization);
      if (!authUser) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { user, error } = sanitizeUserInput(req.body, authUser);
      if (error || !user) {
        return res.status(400).json({ error: error || 'Invalid user data' });
      }

      const saved = await saveUser(user);
      res.status(201).json(saved);
    } catch (err) {
      console.error('Error saving user:', err);
      res.status(500).json({ error: 'Failed to save user' });
    }
  });

  app.post('/api/users/login', async (req, res) => {
    if (!checkRateLimit(req, 'users-write', 30)) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    try {
      const authUser = await verifyFirebaseIdToken(req.headers.authorization);
      if (!authUser) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      let user = await findUserById(authUser.uid);
      if (!user) {
        const sanitized = sanitizeUserInput(req.body || {}, authUser);
        if (sanitized.error || !sanitized.user) {
          return res.status(400).json({ error: sanitized.error || 'Invalid user profile' });
        }
        user = await saveUser(sanitized.user);
      }

      res.json(user);
    } catch (err) {
      console.error('Error logging in user:', err);
      res.status(500).json({ error: 'Failed to login' });
    }
  });

  // Mount Vite or static files
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    const assetsPrefix = `${path.resolve(distPath, 'assets')}${path.sep}`;
    app.use(
      express.static(distPath, {
        setHeaders(res, filePath) {
          const base = path.basename(filePath);
          if (
            base === 'index.html' ||
            base === 'sw.js' ||
            base === 'registerSW.js' ||
            base === 'manifest.webmanifest'
          ) {
            res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
          } else if (filePath.startsWith(assetsPrefix)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      })
    );
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
