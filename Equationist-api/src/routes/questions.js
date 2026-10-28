import express from 'express';
import pool from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { matchesAnswer } from '../utils/math.js';

const router = express.Router();
const difficulties = new Set(['easy', 'medium', 'hard']);

router.get('/counts', async (_req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT difficulty, COUNT(*) AS count FROM questions WHERE is_active = TRUE GROUP BY difficulty',
    );
    res.json({ counts: Object.fromEntries(rows.map((row) => [row.difficulty, Number(row.count)])) });
  } catch (error) { next(error); }
});

router.get('/', async (req, res, next) => {
  try {
    const { difficulty, mode } = req.query;
    if (!difficulties.has(difficulty)) return res.status(400).json({ error: 'Choose a valid difficulty.' });
    const [rows] = await pool.execute(
      `SELECT id, difficulty, prompt, hint, variable, sort_order${mode === 'build' ? ', answer' : ''}
       FROM questions WHERE difficulty = ? AND is_active = TRUE ORDER BY sort_order, id`,
      [difficulty],
    );
    res.json({ questions: rows });
  } catch (error) { next(error); }
});

router.post('/:id/check', authenticate, async (req, res, next) => {
  try {
    const questionId = Number(req.params.id);
    const mode = String(req.body.mode || 'practice');
    if (!Number.isSafeInteger(questionId) || !['practice', 'build', 'timed'].includes(mode)) {
      return res.status(400).json({ error: 'Invalid answer submission.' });
    }
    const [rows] = await pool.execute(
      'SELECT answer FROM questions WHERE id = ? AND is_active = TRUE LIMIT 1',
      [questionId],
    );
    if (!rows[0]) return res.status(404).json({ error: 'Question is no longer available.' });
    try {
      return res.json({ correct: matchesAnswer(req.body.answer, rows[0].answer, mode) });
    } catch (error) {
      return res.status(400).json({ error: error.message || 'Enter a valid answer.' });
    }
  } catch (error) { next(error); }
});

router.get('/admin', authenticate, requireAdmin, async (_req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, difficulty, prompt, answer, hint, variable, sort_order, is_active, created_at, updated_at FROM questions ORDER BY difficulty, sort_order, id',
    );
    res.json({ questions: rows });
  } catch (error) { next(error); }
});

function validateQuestion(body) {
  const difficulty = String(body.difficulty || '');
  const prompt = String(body.prompt || '').trim();
  const hint = body.hint == null ? null : String(body.hint).trim();
  const variable = body.variable == null ? null : String(body.variable).trim();
  const answer = Number(body.answer);
  const sortOrder = Number(body.sort_order ?? 0);
  if (!difficulties.has(difficulty) || !prompt || prompt.length > 1000) {
    return { error: 'Provide a valid difficulty and a prompt up to 1,000 characters.' };
  }
  if (!Number.isFinite(answer) || Math.abs(answer) > 1e12) return { error: 'Provide a valid numeric answer.' };
  if (!Number.isSafeInteger(sortOrder) || sortOrder < 0) return { error: 'Sort order must be a non-negative integer.' };
  if (hint?.length > 2000 || variable?.length > 32) return { error: 'Hint or variable is too long.' };
  return { value: { difficulty, prompt, answer, hint: hint || null, variable: variable || null, sort_order: sortOrder, is_active: body.is_active === false || body.is_active === 0 ? 0 : 1 } };
}

router.post('/admin', authenticate, requireAdmin, async (req, res, next) => {
  const parsed = validateQuestion(req.body);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  try {
    const q = parsed.value;
    const [result] = await pool.execute(
      'INSERT INTO questions (difficulty, prompt, answer, hint, variable, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [q.difficulty, q.prompt, q.answer, q.hint, q.variable, q.sort_order, q.is_active],
    );
    res.status(201).json({ id: result.insertId, ...q });
  } catch (error) { next(error); }
});

router.patch('/admin/:id', authenticate, requireAdmin, async (req, res, next) => {
  const id = Number(req.params.id);
  const parsed = validateQuestion(req.body);
  if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid question id.' });
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  try {
    const q = parsed.value;
    const [result] = await pool.execute(
      `UPDATE questions SET difficulty = ?, prompt = ?, answer = ?, hint = ?, variable = ?,
       sort_order = ?, is_active = ? WHERE id = ?`,
      [q.difficulty, q.prompt, q.answer, q.hint, q.variable, q.sort_order, q.is_active, id],
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Question not found.' });
    res.json({ id, ...q });
  } catch (error) { next(error); }
});

router.delete('/admin/:id', authenticate, requireAdmin, async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid question id.' });
  try {
    const [result] = await pool.execute('DELETE FROM questions WHERE id = ?', [id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Question not found.' });
    res.status(204).end();
  } catch (error) { next(error); }
});

export default router;
