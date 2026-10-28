import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

function issueToken(user) {
  return jwt.sign({ sub: String(user.id) }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    display_name: user.display_name,
    role: user.role,
  };
}

router.post('/signup', async (req, res, next) => {
  try {
    const displayName = String(req.body.display_name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!displayName || displayName.length > 100) {
      return res.status(400).json({ error: 'Name is required (up to 100 characters).' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({ error: 'Password must contain 8 to 72 characters.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      'INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)',
      [email, passwordHash, displayName],
    );
    const user = { id: result.insertId, email, display_name: displayName, role: 'user' };
    return res.status(201).json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const [rows] = await pool.execute(
      'SELECT id, email, password_hash, display_name, role, status FROM users WHERE email = ? LIMIT 1',
      [email],
    );
    const user = rows[0];
    if (!user || user.status !== 'active' || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }
    await pool.execute('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
    return res.json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', authenticate, (req, res) => res.json({ user: publicUser(req.user) }));

export default router;
