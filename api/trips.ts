import type { IncomingMessage, ServerResponse } from 'http';
import {
  getAllTrips,
  saveTrip,
  updateTripStatus,
  deleteTripById,
} from '../server/storage.js';

export default async function handler(req: any, res: any) {
  // Set CORS headers for Vercel deployment
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const trips = getAllTrips();
      return res.status(200).json(trips);
    }

    if (req.method === 'POST') {
      const tripData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!tripData || !tripData.departureCity || !tripData.arrivalCity) {
        return res.status(400).json({ error: 'Departure and arrival cities are required' });
      }

      const newTrip = {
        ...tripData,
        id: tripData.id || `trip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: tripData.createdAt || new Date().toISOString(),
        status: tripData.status || 'active',
      };

      const saved = saveTrip(newTrip);
      return res.status(201).json(saved);
    }

    if (req.method === 'PATCH') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const id = req.query.id || body.id;
      const status = body.status;

      if (!id || !status) {
        return res.status(400).json({ error: 'Trip id and status are required' });
      }

      const updated = updateTripStatus(id, status);
      if (!updated) {
        return res.status(404).json({ error: 'Trip not found' });
      }
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id);
      if (!id) {
        return res.status(400).json({ error: 'Trip id is required' });
      }

      const deleted = deleteTripById(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Trip not found' });
      }
      return res.status(200).json({ success: true, message: 'Trip deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('API Error in /api/trips:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
