import jwt from 'jsonwebtoken';

/**
 * Verifies JWT from Authorization: Bearer <token> or header "token".
 * Attaches req.user from payload.user.
 */
export function authorize(req, res, next) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET missing.' });
  }

  let token =
    req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;
  if (!token && req.headers.token) {
    token = req.headers.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const payload = jwt.verify(token, secret);
    if (!payload.user || typeof payload.user.id !== 'number') {
      return res.status(401).json({ error: 'Invalid token payload.' });
    }
    req.user = payload.user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
