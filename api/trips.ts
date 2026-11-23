import {
  getAllTrips,
  getTripById,
  saveTrip,
  updateTripStatus,
  deleteTripById,
} from '../server/storage.ts';
import {
  verifyFirebaseIdToken,
  sanitizeTripInput,
  isValidTripStatus,
  isValidTripId,
  isTripOwner,
  applyCorsHeaders,
  applySecurityHeaders,
  checkRateLimit,
} from '../server/security.ts';

function parseBody(body: any) {
  if (!body) return {};
  if (typeof body === 'string') {
    if (Buffer.byteLength(body, 'utf8') > 32768) {
      throw new Error('PAYLOAD_TOO_LARGE');
    }
    return JSON.parse(body);
  }
  return body;
}

export default async function handler(req: any, res: any) {
  applySecurityHeaders(req, res);
  applyCorsHeaders(req, res, 'GET, POST, PATCH, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    if (req.method === 'GET') {
      if (!checkRateLimit(req, 'trips-read', 120)) {
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
      }
      const trips = await getAllTrips();
      return res.status(200).json(trips);
    }

    if (!checkRateLimit(req, 'trips-write', 30)) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    const authUser = await verifyFirebaseIdToken(req.headers?.authorization);
    if (!authUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.method === 'POST') {
      const tripData = parseBody(req.body);
      const { trip, error } = sanitizeTripInput(tripData, authUser);
      if (error || !trip) {
        return res.status(400).json({ error: error || 'Invalid trip payload' });
      }

      const existing = await getTripById(trip.id);
      if (existing && !isTripOwner(existing, authUser.uid)) {
        return res.status(403).json({ error: 'Forbidden: you do not own this trip' });
      }

      const saved = await saveTrip(trip);
      return res.status(201).json(saved);
    }

    if (req.method === 'PATCH') {
      const body = parseBody(req.body);
      const id = req.query?.id || body?.id;
      const status = body?.status;

      if (!isValidTripId(id) || !isValidTripStatus(status)) {
        return res.status(400).json({ error: 'Valid trip id and status are required' });
      }

      const existing = await getTripById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Trip not found' });
      }

      if (!isTripOwner(existing, authUser.uid)) {
        return res.status(403).json({ error: 'Forbidden: you can only modify your own trip listings' });
      }

      const updated = await updateTripStatus(id, status);
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      const body = parseBody(req.body);
      const id = req.query?.id || body?.id;
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
      return res.status(200).json({ success: true, message: 'Trip deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    if (err instanceof SyntaxError) {
      return res.status(400).json({ error: 'Invalid JSON request body' });
    }
    if (err?.message === 'PAYLOAD_TOO_LARGE') {
      return res.status(413).json({ error: 'Payload too large' });
    }
    console.error('API Error in /api/trips:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
