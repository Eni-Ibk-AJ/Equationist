import express from 'express';
import pool from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, mode, difficulty, score, attempts, best_streak, duration_seconds,
       time_limit_seconds, started_at, completed_at FROM game_sessions
       WHERE user_id = ? ORDER BY completed_at DESC LIMIT 30`,
      [req.user.id],
    );
    res.json({ sessions: rows });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  const { mode, difficulty } = req.body;
  const score = Number(req.body.score);
  const attempts = Number(req.body.attempts);
  const bestStreak = Number(req.body.best_streak);
  const duration = Number(req.body.duration_seconds);
  const validMode = ['practice', 'build', 'timed'].includes(mode);
  const validDifficulty = ['easy', 'medium', 'hard'].includes(difficulty);
  if (!validMode || !validDifficulty || ![score, attempts, bestStreak, duration].every(Number.isSafeInteger) ||
      score < 0 || attempts < score || bestStreak < 0 || bestStreak > score || duration < 0 || duration > 86400) {
    return res.status(400).json({ error: 'Invalid round summary.' });
  }
  const timeLimit = mode === 'timed' ? 60 : null;
  try {
    const [result] = await pool.execute(
      `INSERT INTO game_sessions
       (user_id, mode, difficulty, score, attempts, best_streak, duration_seconds, time_limit_seconds)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, mode, difficulty, score, attempts, bestStreak, duration, timeLimit],
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) { next(error); }
});

router.get('/dashboard', async (req, res, next) => {
  try {
    const [statsRows] = await pool.execute(
      `SELECT COUNT(*) AS rounds_played, COALESCE(SUM(score), 0) AS total_correct,
       COALESCE(MAX(score), 0) AS personal_best, COALESCE(MAX(best_streak), 0) AS longest_streak,
       COALESCE(SUM(attempts), 0) AS total_attempts FROM game_sessions WHERE user_id = ?`,
      [req.user.id],
    );
    const [recent] = await pool.execute(
      `SELECT id, mode, difficulty, score, attempts, best_streak, duration_seconds, completed_at
       FROM game_sessions WHERE user_id = ? ORDER BY completed_at DESC LIMIT 5`,
      [req.user.id],
    );
    res.json({ stats: statsRows[0], recent_sessions: recent });
  } catch (error) { next(error); }
});

export default router;
