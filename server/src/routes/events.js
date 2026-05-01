import { Router } from 'express';
import { pool } from '../db.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.id, e.club_id, e.title, e.description, e.event_date, e.location, e.poster_url,
        c.name AS club_name,
        (SELECT COUNT(*)::int FROM event_participants ep WHERE ep.event_id = e.id AND ep.status = 'going') AS rsvp_count
       FROM events e
       JOIN clubs c ON c.id = e.club_id
       ORDER BY e.event_date ASC NULLS LAST, e.id ASC`
    );
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not load events.' });
  }
});

router.post('/', authorize, async (req, res) => {
  try {
    const { club_id, title, description, event_date, location, poster_url } = req.body || {};
    if (!club_id || !title) {
      return res.status(400).json({ error: 'club_id and title are required.' });
    }

    const result = await pool.query(
      `INSERT INTO events (club_id, title, description, event_date, location, poster_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, club_id, title, description, event_date, location, poster_url`,
      [club_id, title, description || null, event_date || null, location || null, poster_url || null]
    );

    const row = result.rows[0];
    const club = await pool.query('SELECT name AS club_name FROM clubs WHERE id = $1', [row.club_id]);
    res.status(201).json({
      ...row,
      club_name: club.rows[0]?.club_name ?? null,
      rsvp_count: 0,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not create event.' });
  }
});

router.post('/rsvp', authorize, async (req, res) => {
  try {
    const { event_id, status } = req.body || {};
    if (!event_id || !status) {
      return res.status(400).json({ error: 'event_id and status are required.' });
    }
    if (!['going', 'maybe', 'declined'].includes(status)) {
      return res.status(400).json({ error: "status must be 'going', 'maybe', or 'declined'." });
    }

    await pool.query(
      `INSERT INTO event_participants (event_id, user_id, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (event_id, user_id) DO UPDATE SET status = EXCLUDED.status`,
      [event_id, req.user.id, status]
    );

    res.json({ success: true, event_id, status });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not save RSVP.' });
  }
});

export default router;
