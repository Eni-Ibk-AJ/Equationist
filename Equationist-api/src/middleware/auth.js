import jwt from 'jsonwebtoken';
import pool from '../db.js';

async function authenticate(req, res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required.' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.execute(
      'SELECT id, email, display_name, role, status FROM users WHERE id = ? LIMIT 1',
      [payload.sub],
    );
    const user = rows[0];
    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'This account is unavailable.' });
    }
    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }
    return next(error);
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }
  return next();
}

export { authenticate, requireAdmin };
