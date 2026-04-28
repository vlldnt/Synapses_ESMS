import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Token manquant.' });
  try {
    req.auth = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré.' });
  }
}

export function globalAuthGuard(req, res, next) {
  const p = req.path;
  const m = req.method;
  const isPublic =
    (m === 'POST' && p === '/login') ||
    (m === 'POST' && p === '/organization-requests') ||
    (m === 'GET' && p === '/structure-types') ||
    (m === 'GET' && p.startsWith('/organization-requests/info/')) ||
    (m === 'POST' && p.startsWith('/organization-requests/complete/')) ||
    (m === 'GET' && p.startsWith('/user-requests/info/')) ||
    (m === 'POST' && p.startsWith('/user-requests/complete/'));
  if (isPublic) return next();
  requireAuth(req, res, next);
}
