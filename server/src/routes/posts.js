import { Router } from 'express';
import { pool } from '../db.js';
import { authorize } from '../middleware/authorize.js';
import { optionalAuth } from '../middleware/optionalAuth.js';

const router = Router();

function isValidIsoDate(value) {
  if (typeof value !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function parseCreatePostPayload(body = {}) {
  const clubId = Number(body.club_id);
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  const imageUrl = typeof body.image_url === 'string' ? body.image_url.trim() : '';
  const eventDate = typeof body.event_date === 'string' ? body.event_date.trim() : '';
  const eventTime = typeof body.event_time === 'string' ? body.event_time.trim() : '';
  const venue = typeof body.venue === 'string' ? body.venue.trim() : '';
  const tags = typeof body.tags === 'string' ? body.tags.trim() : '';

  if (!Number.isInteger(clubId) || clubId <= 0) {
    return { ok: false, error: 'A valid club_id is required.' };
  }
  if (!title || title.length < 5 || title.length > 150) {
    return { ok: false, error: 'title must be between 5 and 150 characters.' };
  }
  if (!content || content.length < 20 || content.length > 3000) {
    return { ok: false, error: 'content must be between 20 and 3000 characters.' };
  }
  if (imageUrl && imageUrl.length > 2000) {
    return { ok: false, error: 'image_url is too long.' };
  }
  if (eventDate && !isValidIsoDate(eventDate)) {
    return { ok: false, error: 'event_date must be in YYYY-MM-DD format.' };
  }
  if (eventTime && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(eventTime)) {
    return { ok: false, error: 'event_time must be in HH:mm format.' };
  }
  if (venue && venue.length > 255) {
    return { ok: false, error: 'venue cannot exceed 255 characters.' };
  }
  if (tags && tags.length > 255) {
    return { ok: false, error: 'tags cannot exceed 255 characters.' };
  }

  return {
    ok: true,
    value: {
      clubId,
      title,
      content,
      imageUrl: imageUrl || null,
      eventDate: eventDate || null,
      eventTime: eventTime || null,
      venue: venue || null,
      tags: tags || null,
    },
  };
}

function buildPostContent(content, { eventDate, eventTime, venue, tags }) {
  const extras = [];
  if (eventDate) extras.push(`Event Date: ${eventDate}`);
  if (eventTime) extras.push(`Event Time: ${eventTime}`);
  if (venue) extras.push(`Venue: ${venue}`);
  if (tags) extras.push(`Tags: ${tags}`);

  if (extras.length === 0) return content;
  return `${content}\n\n---\n${extras.join('\n')}`;
}

async function insertPost({ clubId, title, content, imageUrl, userId }) {
  const result = await pool.query(
    `INSERT INTO posts (club_id, title, content, image_url, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, club_id, title, content, image_url, created_by, created_at`,
    [clubId, title, content, imageUrl, userId]
  );
  return result.rows[0];
}

async function ensureCanCreate(clubId, user) {
  const isGlobalAdmin = String(user?.role || '').toLowerCase() === 'admin';
  if (isGlobalAdmin) {
    return true;
  }
  const ownership = await pool.query(
    `SELECT 1
     FROM club_members
     WHERE club_id = $1 AND user_id = $2 AND role = 'admin'`,
    [clubId, user.id]
  );
  return ownership.rows.length > 0;
}

router.get('/', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id ?? null;
    const clubId = req.query.club_id ? Number(req.query.club_id) : null;
    if (req.query.club_id && !Number.isInteger(clubId)) {
      return res.status(400).json({ error: 'Invalid club_id.' });
    }
    const result = await pool.query(
      `SELECT p.id, p.club_id, p.title, p.content, p.image_url, p.created_by, p.created_at,
        c.name AS club_name,
        (SELECT COUNT(*)::int FROM reactions r WHERE r.post_id = p.id AND r.reaction_type = 'like') AS like_count,
        (SELECT COUNT(*)::int FROM comments cm WHERE cm.post_id = p.id) AS comment_count,
        CASE
          WHEN $1::integer IS NULL THEN FALSE
          ELSE EXISTS (
            SELECT 1 FROM reactions r2
            WHERE r2.post_id = p.id AND r2.user_id = $1::integer AND r2.reaction_type = 'like'
          )
        END AS is_liked
       FROM posts p
       JOIN clubs c ON c.id = p.club_id
       WHERE ($2::integer IS NULL OR p.club_id = $2::integer)
       ORDER BY p.created_at DESC`,
      [userId, clubId]
    );
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not load feed.' });
  }
});

router.post('/', authorize, async (req, res) => {
  try {
    const parsed = parseCreatePostPayload(req.body || {});
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.error });
    }

  const { clubId, title, content, imageUrl, eventDate, eventTime, venue, tags } = parsed.value;
  const contentForStorage = buildPostContent(content, { eventDate, eventTime, venue, tags });

    const canCreate = await ensureCanCreate(clubId, req.user);
    if (!canCreate) {
      return res.status(403).json({ error: 'Only club owners/admins can create posts for this club.' });
    }

    const club = await pool.query('SELECT id, name AS club_name FROM clubs WHERE id = $1', [clubId]);
    if (club.rows.length === 0) {
      return res.status(404).json({ error: 'Club not found.' });
    }

    const row = await insertPost({
      clubId,
      title,
      content: contentForStorage,
      imageUrl,
      userId: req.user.id,
    });

    res.status(201).json({
      ...row,
      club_name: club.rows[0].club_name,
      like_count: 0,
      comment_count: 0,
      is_liked: false,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not create post.' });
  }
});

router.post('/club/:clubId', authorize, async (req, res) => {
  try {
    const clubId = Number(req.params.clubId);
    if (!Number.isInteger(clubId) || clubId <= 0) {
      return res.status(400).json({ error: 'Invalid clubId in route param.' });
    }

    const parsed = parseCreatePostPayload({ ...req.body, club_id: clubId });
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.error });
    }

  const { title, content, imageUrl, eventDate, eventTime, venue, tags } = parsed.value;
  const contentForStorage = buildPostContent(content, { eventDate, eventTime, venue, tags });

    const canCreate = await ensureCanCreate(clubId, req.user);
    if (!canCreate) {
      return res.status(403).json({ error: 'Only club owners/admins can create posts for this club.' });
    }

    const club = await pool.query('SELECT id, name AS club_name FROM clubs WHERE id = $1', [clubId]);
    if (club.rows.length === 0) {
      return res.status(404).json({ error: 'Club not found.' });
    }

    const row = await insertPost({
      clubId,
      title,
      content: contentForStorage,
      imageUrl,
      userId: req.user.id,
    });

    res.status(201).json({
      ...row,
      club_name: club.rows[0].club_name,
      like_count: 0,
      comment_count: 0,
      is_liked: false,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not create post.' });
  }
});

export default router;
