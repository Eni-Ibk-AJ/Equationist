import express from 'express';
import pool from './db.js';
import authRoutes from './routes/auth.js';
import questionRoutes from './routes/questions.js';
import sessionRoutes from './routes/sessions.js';
import adminRoutes from './routes/admin.js';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('Set JWT_SECRET to a random value of at least 32 characters.');
}

const app = express();
const port = Number(process.env.PORT || 4000);
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
  .split(',').map((origin) => origin.trim());

app.disable('x-powered-by');
app.use((req, res, next) => {
  const origin = req.get('origin');
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});
app.use(express.json({ limit: '32kb' }));

app.get('/api/health', async (_req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) { next(error); }
});
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => res.status(404).json({ error: 'Endpoint not found.' }));
app.use((error, _req, res, _next) => {
  console.error(error);
  if (res.headersSent) return;
  if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ECONNREFUSED') {
    return res.status(503).json({ error: 'Database unavailable. Check the MySQL service and database.sql setup.' });
  }
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

async function start() {
  await pool.query('SELECT 1');
  app.listen(port, () => console.log(`Equationist API listening on http://localhost:${port}`));
}

start().catch((error) => {
  console.error('Could not start the API:', error.message);
  process.exit(1);
});
