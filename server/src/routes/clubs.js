import { Router } from 'express';
import { pool } from '../db.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

function parseClubDescription(description) {
  const parts = String(description || '')
    .split('|')
    .map((part) => part.trim());
  return {
    department: parts[0] || 'Campus',
    category: parts[1] || 'Social',
    president: parts[2] || 'Not specified',
  };
}

router.post('/', authorize, async (req, res) => {
  try {
    const { clubName, departmentName, collegeName } = req.body || {};
    if (!clubName || !departmentName || !collegeName) {
      return res.status(400).json({ error: 'clubName, departmentName, and collegeName are required.' });
    }

    const description = `${departmentName} — ${collegeName}`;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const club = await client.query(
        `INSERT INTO clubs (name, description, logo, created_by)
         VALUES ($1, $2, NULL, $3)
         RETURNING id, name, description, logo, created_by`,
        [clubName, description, req.user.id]
      );
      const row = club.rows[0];
      await client.query(
        `INSERT INTO club_members (club_id, user_id, role) VALUES ($1, $2, 'admin')`,
        [row.id, req.user.id]
      );
      await client.query('COMMIT');
      res.status(201).json(row);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not create club.' });
  }
});

router.get('/:id', authorize, async (req, res) => {
  try {
    const clubId = Number(req.params.id);
    if (!Number.isInteger(clubId)) {
      return res.status(400).json({ error: 'Invalid club id.' });
    }

    const result = await pool.query(
      `SELECT c.id, c.name, c.description, c.logo,
              owner.name AS owner_name, owner.email AS owner_email,
              (SELECT COUNT(*)::int FROM club_members m WHERE m.club_id = c.id) AS member_count,
              EXISTS (
                SELECT 1 FROM club_members m2
                WHERE m2.club_id = c.id AND m2.user_id = $2
              ) AS is_followed,
              EXISTS (
                SELECT 1 FROM club_members m3
                WHERE m3.club_id = c.id AND m3.user_id = $2 AND m3.role = 'admin'
              ) AS is_owner
       FROM clubs c
       LEFT JOIN users owner ON owner.id = c.created_by
       WHERE c.id = $1`,
      [clubId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Club not found.' });
    }

    const row = result.rows[0];
    const parsed = parseClubDescription(row.description);
    res.json({
      id: row.id,
      name: row.name,
      description: row.description ?? 'Club on campus.',
      logo: row.logo,
      department: parsed.department,
      category: parsed.category,
      president: parsed.president,
      email: row.owner_email ?? '',
      followers_count: row.member_count ?? 0,
      member_count: row.member_count ?? 0,
      founded_year: new Date().getFullYear(),
      is_followed: row.is_followed,
      is_owner: row.is_owner,
      faculty_coordinator: row.owner_name ?? 'Not available',
      faculty_email: row.owner_email ?? '',
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not load club details.' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.description, c.logo,
        (SELECT COUNT(*)::int FROM club_members m WHERE m.club_id = c.id) AS member_count
       FROM clubs c
       ORDER BY c.name ASC`
    );
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not load clubs.' });
  }
});

export default router;
