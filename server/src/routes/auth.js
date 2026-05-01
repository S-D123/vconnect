import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const router = Router();
const SALT_ROUNDS = 10;

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  return jwt.sign({ user }, secret, { expiresIn: '1h' });
}

function publicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    club_id: row.club_id ?? null,
    club_name: row.club_name ?? null,
    bio: row.bio,
    profile_image: row.profile_image,
    created_at: row.created_at,
  };
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required.' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const insert = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'user')
       RETURNING id, name, email, role, bio, profile_image, created_at, NULL::int AS club_id, NULL::text AS club_name`,
      [name, email, hash]
    );

    const user = publicUser(insert.rows[0]);
    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    res.status(201).json({ token, user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required.' });
    }

    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.password, u.role, u.bio, u.profile_image, u.created_at,
              c.id AS club_id, c.name AS club_name
       FROM users u
       LEFT JOIN clubs c ON c.created_by = u.id
       WHERE LOWER(u.email) = LOWER($1)
       ORDER BY c.id ASC
       LIMIT 1`,
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const row = result.rows[0];
    const ok = await bcrypt.compare(password, row.password);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = publicUser(row);
    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    res.json({ token, user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Login failed.' });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      isClub,
      clubName,
      department,
      year,
      category,
      president,
    } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    // Check if the user already exists
    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const role = isClub ? 'club' : 'student';
    const client = await pool.connect();
    let user;
    try {
      await client.query('BEGIN');
      const insert = await client.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role, bio, profile_image, created_at`,
        [name, email, hash, role]
      );

      const insertedUser = insert.rows[0];
      let clubId = null;
      let savedClubName = null;

      if (isClub) {
        const finalClubName = String(clubName || name).trim();
        const descParts = [department, year || category, president]
          .filter(Boolean)
          .map((part) => String(part).trim())
          .filter((part) => part.length > 0);
        const description = descParts.join(' | ');

        const clubResult = await client.query(
          `INSERT INTO clubs (name, description, logo, created_by)
           VALUES ($1, $2, NULL, $3)
           RETURNING id, name`,
          [finalClubName, description || null, insertedUser.id]
        );
        clubId = clubResult.rows[0].id;
        savedClubName = clubResult.rows[0].name;

        await client.query(
          `INSERT INTO club_members (club_id, user_id, role) VALUES ($1, $2, 'admin')`,
          [clubId, insertedUser.id]
        );
      }

      await client.query('COMMIT');
      user = publicUser({
        ...insertedUser,
        club_id: clubId,
        club_name: savedClubName,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      club_id: user.club_id ?? undefined,
    });

    res.status(201).json({ token, user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
});

export default router;
