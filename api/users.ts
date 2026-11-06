import {
  findUserByEmail,
  saveUser,
  getAllUsers,
} from '../server/storage.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { email } = req.query;
      if (typeof email === 'string' && email.trim()) {
        const user = findUserByEmail(email);
        if (!user) return res.status(404).json({ error: 'User not found' });
        return res.status(200).json(user);
      }
      return res.status(200).json(getAllUsers());
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const isLoginAction = req.query.action === 'login' || body.action === 'login';

      if (isLoginAction) {
        const { email, name } = body;
        if (!email || !email.trim()) {
          return res.status(400).json({ error: 'Email is required' });
        }

        let user = findUserByEmail(email);
        if (!user) {
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
        return res.status(200).json(user);
      }

      // Normal user registration / save
      if (!body || !body.email || !body.name) {
        return res.status(400).json({ error: 'Name and email are required' });
      }

      const user = {
        ...body,
        id: body.id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: body.createdAt || new Date().toISOString(),
        isVerified: body.isVerified ?? true,
      };

      const saved = saveUser(user);
      return res.status(201).json(saved);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('API Error in /api/users:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
