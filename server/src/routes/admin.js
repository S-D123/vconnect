import { Router } from 'express';
import { pool } from '../db.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

async function assertClubAdmin(userId, clubId) {
  const r = await pool.query(
    `SELECT 1 FROM club_members WHERE club_id = $1 AND user_id = $2 AND role = 'admin'`,
    [clubId, userId]
  );
  return r.rows.length > 0;
}

router.get('/dashboard/:clubId', authorize, async (req, res) => {
  try {
    const clubId = Number(req.params.clubId);
    if (Number.isNaN(clubId)) {
      return res.status(400).json({ error: 'Invalid club id.' });
    }

    const ok = await assertClubAdmin(req.user.id, clubId);
    if (!ok) {
      return res.status(403).json({ error: 'You must be a club admin to view this dashboard.' });
    }

    const [members, posts, events] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS n FROM club_members WHERE club_id = $1`, [clubId]),
      pool.query(`SELECT COUNT(*)::int AS n FROM posts WHERE club_id = $1`, [clubId]),
      pool.query(`SELECT COUNT(*)::int AS n FROM events WHERE club_id = $1`, [clubId]),
    ]);

    const flagged = await pool.query(
      `SELECT c.id, c.content, c.created_at, u.name AS author_name, p.title AS post_title, ca.toxicity_score
       FROM comments c
       JOIN users u ON u.id = c.user_id
       JOIN posts p ON p.id = c.post_id
       JOIN comment_analysis ca ON ca.comment_id = c.id
       WHERE p.club_id = $1
         AND ca.toxicity_score IS NOT NULL
         AND ca.toxicity_score > 0.4
       ORDER BY ca.toxicity_score DESC, c.created_at DESC`,
      [clubId]
    );

    res.json({
      club_id: clubId,
      counts: {
        members: members.rows[0].n,
        posts: posts.rows[0].n,
        events: events.rows[0].n,
      },
      flagged_comments: flagged.rows,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not load dashboard.' });
  }
});

router.delete('/comment/:commentId', authorize, async (req, res) => {
  try {
    const commentId = Number(req.params.commentId);
    if (Number.isNaN(commentId)) {
      return res.status(400).json({ error: 'Invalid comment id.' });
    }

    const meta = await pool.query(
      `SELECT p.club_id FROM comments c JOIN posts p ON p.id = c.post_id WHERE c.id = $1`,
      [commentId]
    );
    if (meta.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    const clubId = meta.rows[0].club_id;
    const ok = await assertClubAdmin(req.user.id, clubId);
    if (!ok) {
      return res.status(403).json({ error: 'You must be a club admin to delete this comment.' });
    }

    await pool.query(`DELETE FROM comments WHERE id = $1`, [commentId]);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not delete comment.' });
  }
});

export default router;
