import { Router } from 'express';
import { pool } from '../db.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.post('/toggle', authorize, async (req, res) => {
  try {
    const { post_id } = req.body || {};
    if (!post_id) {
      return res.status(400).json({ error: 'post_id is required.' });
    }

    const existing = await pool.query(
      `SELECT 1 FROM reactions WHERE post_id = $1 AND user_id = $2 AND reaction_type = 'like'`,
      [post_id, req.user.id]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        `DELETE FROM reactions WHERE post_id = $1 AND user_id = $2 AND reaction_type = 'like'`,
        [post_id, req.user.id]
      );
      return res.json({ liked: false });
    }

    await pool.query(
      `INSERT INTO reactions (post_id, user_id, reaction_type) VALUES ($1, $2, 'like')`,
      [post_id, req.user.id]
    );
    res.json({ liked: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not toggle reaction.' });
  }
});

export default router;
