import { Router } from 'express';
import { pool } from '../db.js';
import { authorize } from '../middleware/authorize.js';
import { analyzeCommentText } from '../services/huggingface.js';

const router = Router();

function scheduleCommentAnalysis(commentId, content) {
  setImmediate(() => {
    (async () => {
      try {
        const analysis = await analyzeCommentText(content);
        await pool.query(
          `INSERT INTO comment_analysis (comment_id, sentiment, sentiment_score, toxicity_score, emotion)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (comment_id) DO UPDATE SET
             sentiment = EXCLUDED.sentiment,
             sentiment_score = EXCLUDED.sentiment_score,
             toxicity_score = EXCLUDED.toxicity_score,
             emotion = EXCLUDED.emotion`,
          [
            commentId,
            analysis.sentiment,
            analysis.sentiment_score,
            analysis.toxicity_score,
            analysis.emotion,
          ]
        );
      } catch (e) {
        console.error('Background comment analysis failed:', e);
      }
    })();
  });
}

router.post('/', authorize, async (req, res) => {
  try {
    const { post_id, content } = req.body || {};
    if (!post_id || !content || !String(content).trim()) {
      return res.status(400).json({ error: 'post_id and content are required.' });
    }

    const insert = await pool.query(
      `INSERT INTO comments (post_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, post_id, user_id, content, created_at`,
      [post_id, req.user.id, String(content).trim()]
    );

    const row = insert.rows[0];
    const author = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.id]);

    const response = {
      id: row.id,
      post_id: row.post_id,
      user_id: row.user_id,
      author_name: author.rows[0]?.name ?? 'Unknown',
      content: row.content,
      created_at: row.created_at,
    };

    res.status(201).json(response);

    scheduleCommentAnalysis(row.id, row.content);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not post comment.' });
  }
});

router.get('/:postId', async (req, res) => {
  try {
    const postId = Number(req.params.postId);
    if (Number.isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid post id.' });
    }

    const result = await pool.query(
      `SELECT c.id, c.post_id, c.user_id, c.content, c.created_at,
        u.name AS author_name
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [postId]
    );

    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not load comments.' });
  }
});

export default router;
