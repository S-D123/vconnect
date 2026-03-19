const express = require('express');
const router = express.Router();
const pool = require('../db');
const authorize = require('../middleware/authorize');

// GET: Fetch current user's profile data, their posts, and their RSVP'd events
router.get('/me', authorize, async (req, res) => {
    try {
        const userId = req.user;

        // 1. Get user details
        const userQuery = await pool.query(
            "SELECT id, name, email, role, bio, profile_image, created_at FROM users WHERE id = $1",
            [userId]
        );
        const userInfo = userQuery.rows[0];

        // 2. Get posts created by this user
        const postsQuery = await pool.query(
            `SELECT p.id, p.title, p.content, p.created_at, c.name AS club_name 
             FROM posts p
             LEFT JOIN clubs c ON p.club_id = c.id
             WHERE p.created_by = $1 
             ORDER BY p.created_at DESC`,
            [userId]
        );

        // 3. Get events this user is attending
        const eventsQuery = await pool.query(
            `SELECT e.id, e.title, e.event_date, e.location 
             FROM events e
             JOIN event_participants ep ON e.id = ep.event_id
             WHERE ep.user_id = $1 AND ep.status = 'going'
             ORDER BY e.event_date ASC`,
            [userId]
        );

        // Send it all back as a single compiled object
        res.json({
            user: userInfo,
            posts: postsQuery.rows,
            attending_events: eventsQuery.rows
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;