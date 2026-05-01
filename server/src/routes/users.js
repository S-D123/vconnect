import { Router } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();
const SALT_ROUNDS = 10;

router.get('/me', authorize, async (req, res) => {
  try {
    const userId = req.user.id;

    const userResult = await pool.query(
      `SELECT id, name, email, role, bio, profile_image, created_at
       FROM users WHERE id = $1`,
      [userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const posts = await pool.query(
      `SELECT p.*, c.name AS club_name,
        (SELECT COUNT(*)::int FROM reactions r WHERE r.post_id = p.id AND r.reaction_type = 'like') AS like_count,
        (SELECT COUNT(*)::int FROM comments cm WHERE cm.post_id = p.id) AS comment_count,
        FALSE AS is_liked
       FROM posts p
       JOIN clubs c ON c.id = p.club_id
       WHERE p.created_by = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );

    const attending = await pool.query(
      `SELECT e.*, cl.name AS club_name,
        (SELECT COUNT(*)::int FROM event_participants ep2 WHERE ep2.event_id = e.id AND ep2.status = 'going') AS rsvp_count
       FROM events e
       JOIN event_participants ep ON ep.event_id = e.id AND ep.user_id = $1 AND ep.status = 'going'
       JOIN clubs cl ON cl.id = e.club_id
       ORDER BY e.event_date ASC NULLS LAST`,
      [userId]
    );

    const myComments = await pool.query(
      `SELECT c.id, c.content, c.created_at, p.id AS post_id, p.title AS post_title, cl.name AS club_name
       FROM comments c
       JOIN posts p ON p.id = c.post_id
       JOIN clubs cl ON cl.id = p.club_id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [userId]
    );

    const followed = await pool.query(
      `SELECT COUNT(*)::int AS n FROM club_members WHERE user_id = $1`,
      [userId]
    );

    res.json({
      user: userResult.rows[0],
      posts: posts.rows,
      events_attending: attending.rows,
      my_comments: myComments.rows,
      followed_clubs_count: followed.rows[0]?.n ?? 0,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not load profile.' });
  }
});

router.patch('/me', authorize, async (req, res) => {
  try {
    const { name, bio } = req.body || {};
    const updates = [];
    const values = [];
    let i = 1;
    if (name != null && String(name).trim()) {
      updates.push(`name = $${i++}`);
      values.push(String(name).trim());
    }
    if (bio != null) {
      updates.push(`bio = $${i++}`);
      values.push(String(bio));
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update (name, bio).' });
    }
    values.push(req.user.id);
    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${i}
       RETURNING id, name, email, role, bio, profile_image, created_at`,
      values
    );
    res.json({ user: result.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not update profile.' });
  }
});

router.patch('/me/password', authorize, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ error: 'New password must differ from the current one.' });
    }

    const row = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    if (row.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const ok = await bcrypt.compare(currentPassword, row.rows[0].password);
    if (!ok) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hash, req.user.id]);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not update password.' });
  }
});

export default router;
