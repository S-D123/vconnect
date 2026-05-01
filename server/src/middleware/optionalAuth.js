import jwt from 'jsonwebtoken';

/**
 * If a valid Bearer / token is present, sets req.user from payload.user.
 * Otherwise req.user is undefined.
 */
export function optionalAuth(req, _res, next) {
  req.user = undefined;
  const secret = process.env.JWT_SECRET;
  if (!secret) return next();

  let token =
    req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;
  if (!token && req.headers.token) {
    token = req.headers.token;
  }
  if (!token) return next();

  try {
    const payload = jwt.verify(token, secret);
    if (payload.user && typeof payload.user.id === 'number') {
      req.user = payload.user;
    }
  } catch {
    /* ignore invalid token for optional auth */
  }
  next();
}
