import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) {
      return res.json({ users: [], clubs: [] });
    }

    const pattern = `%${q}%`;

    const [users, clubs] = await Promise.all([
      pool.query(
        `SELECT id, name, email FROM users
         WHERE name ILIKE $1 OR email ILIKE $1
         ORDER BY name ASC
         LIMIT 5`,
        [pattern]
      ),
      pool.query(
        `SELECT id, name, description FROM clubs
         WHERE name ILIKE $1 OR COALESCE(description, '') ILIKE $1
         ORDER BY name ASC
         LIMIT 5`,
        [pattern]
      ),
    ]);

    res.json({
      users: users.rows,
      clubs: clubs.rows,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Search failed.' });
  }
});

export default router;
