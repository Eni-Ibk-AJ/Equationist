import express from 'express';
import pool from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate, requireAdmin);

router.get('/users', async (_req, res, next) => {
  try {
    const [users] = await pool.execute(
      `SELECT u.id, u.email, u.display_name, u.role, u.status, u.created_at, u.last_login_at,
       COUNT(g.id) AS rounds_played FROM users u LEFT JOIN game_sessions g ON g.user_id = u.id
       GROUP BY u.id ORDER BY u.created_at DESC`,
    );
    res.json({ users });
  } catch (error) { next(error); }
});

router.patch('/users/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  const { role, status } = req.body;
  if (!Number.isSafeInteger(id) || id <= 0 || !['user', 'admin'].includes(role) || !['active', 'suspended'].includes(status)) {
    return res.status(400).json({ error: 'Provide a valid role and account status.' });
  }
  if (id === Number(req.user.id) && (role !== 'admin' || status !== 'active')) {
    return res.status(400).json({ error: 'You cannot remove your own administrator access.' });
  }
  try {
    const [result] = await pool.execute('UPDATE users SET role = ?, status = ? WHERE id = ?', [role, status, id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'User not found.' });
    res.json({ id, role, status });
  } catch (error) { next(error); }
});

router.get('/overview', async (_req, res, next) => {
  try {
    const [[users]] = await pool.execute('SELECT COUNT(*) AS total_users, SUM(status = \'active\') AS active_users FROM users');
    const [[questions]] = await pool.execute('SELECT COUNT(*) AS total_questions, SUM(is_active = TRUE) AS active_questions FROM questions');
    const [[sessions]] = await pool.execute('SELECT COUNT(*) AS total_sessions FROM game_sessions');
    res.json({ users, questions, sessions });
  } catch (error) { next(error); }
});

export default router;
