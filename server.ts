import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getAllTrips,
  saveTrip,
  updateTripStatus,
  deleteTripById,
  findUserByEmail,
  saveUser,
  getAllUsers,
} from './server/storage.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // API Routes: Trips
  app.get('/api/trips', (req, res) => {
    try {
      const trips = getAllTrips();
      res.json(trips);
    } catch (err) {
      console.error('Error fetching trips:', err);
      res.status(500).json({ error: 'Failed to fetch trips' });
    }
  });

  app.post('/api/trips', (req, res) => {
    try {
      const tripData = req.body;
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
      res.status(201).json(saved);
    } catch (err) {
      console.error('Error saving trip:', err);
      res.status(500).json({ error: 'Failed to save trip' });
    }
  });

  app.patch('/api/trips/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      const updated = updateTripStatus(id, status);
      if (!updated) {
        return res.status(404).json({ error: 'Trip not found' });
      }
      res.json(updated);
    } catch (err) {
      console.error('Error updating trip:', err);
      res.status(500).json({ error: 'Failed to update trip' });
    }
  });

  app.delete('/api/trips/:id', (req, res) => {
    try {
      const { id } = req.params;
      const deleted = deleteTripById(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Trip not found' });
      }
      res.json({ success: true, message: 'Trip deleted' });
    } catch (err) {
      console.error('Error deleting trip:', err);
      res.status(500).json({ error: 'Failed to delete trip' });
    }
  });

  // API Routes: Users
  app.get('/api/users', (req, res) => {
    try {
      const { email } = req.query;
      if (typeof email === 'string' && email.trim()) {
        const user = findUserByEmail(email);
        if (!user) return res.status(404).json({ error: 'User not found' });
        return res.json(user);
      }
      res.json(getAllUsers());
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.post('/api/users', (req, res) => {
    try {
      const userData = req.body;
      if (!userData || !userData.email || !userData.name) {
        return res.status(400).json({ error: 'Name and email are required' });
      }

      const user = {
        ...userData,
        id: userData.id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: userData.createdAt || new Date().toISOString(),
        isVerified: userData.isVerified ?? true,
      };

      const saved = saveUser(user);
      res.status(201).json(saved);
    } catch (err) {
      console.error('Error saving user:', err);
      res.status(500).json({ error: 'Failed to save user' });
    }
  });

  app.post('/api/users/login', (req, res) => {
    try {
      const { email, name } = req.body;
      if (!email || !email.trim()) {
        return res.status(400).json({ error: 'Email is required' });
      }

      let user = findUserByEmail(email);
      if (!user) {
        // Create new account if user doesn't exist
        user = {
          id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          email: email.trim(),
          name: (name && name.trim()) || email.split('@')[0],
          isVerified: true,
          rating: 5.0,
          tripsCompleted: 0,
          memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          bio: 'Community luggage traveler',
          languages: ['English', 'Myanmar'],
          createdAt: new Date().toISOString(),
        };
        saveUser(user);
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
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
