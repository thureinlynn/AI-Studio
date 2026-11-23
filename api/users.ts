import {
  findUserById,
  findUserByEmail,
  saveUser,
} from '../server/storage.ts';
import {
  verifyFirebaseIdToken,
  sanitizeUserInput,
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
  applyCorsHeaders(req, res, 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    if (!checkRateLimit(req, 'users-api', 45)) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    const authUser = await verifyFirebaseIdToken(req.headers?.authorization);
    if (!authUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.method === 'GET') {
      const profile =
        (await findUserById(authUser.uid)) ||
        (authUser.email ? await findUserByEmail(authUser.email) : null);

      if (!profile || profile.id !== authUser.uid) {
        return res.status(404).json({ error: 'User profile not found' });
      }
      return res.status(200).json(profile);
    }

    if (req.method === 'POST') {
      const body = parseBody(req.body);
      const isLoginAction = req.query?.action === 'login' || body?.action === 'login';

      if (isLoginAction) {
        let user = await findUserById(authUser.uid);
        if (!user) {
          const sanitized = sanitizeUserInput(body, authUser);
          if (sanitized.error || !sanitized.user) {
            return res.status(400).json({ error: sanitized.error || 'Invalid user data' });
          }
          user = await saveUser(sanitized.user);
        }
        return res.status(200).json(user);
      }

      const { user, error } = sanitizeUserInput(body, authUser);
      if (error || !user) {
        return res.status(400).json({ error: error || 'Invalid user data' });
      }

      const saved = await saveUser(user);
      return res.status(201).json(saved);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    if (err instanceof SyntaxError) {
      return res.status(400).json({ error: 'Invalid JSON request body' });
    }
    if (err?.message === 'PAYLOAD_TOO_LARGE') {
      return res.status(413).json({ error: 'Payload too large' });
    }
    console.error('API Error in /api/users:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
