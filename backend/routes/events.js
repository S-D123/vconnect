const express = require('express');
const router = express.Router();
const pool = require('../db');
const authorize = require('../middleware/authorize');

// GET: Fetch all upcoming events
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                events.id, 
                events.title, 
                events.description, 
                events.event_date, 
                events.location, 
                events.poster_url,
                clubs.name AS club_name,
                (SELECT COUNT(*) FROM event_participants WHERE event_id = events.id AND status = 'going') AS rsvp_count
            FROM events
            LEFT JOIN clubs ON events.club_id = clubs.id
            ORDER BY events.event_date ASC;
        `;
        const allEvents = await pool.query(query);
        res.json(allEvents.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST: Create a new event
router.post('/', authorize, async (req, res) => {
    try {
        const { club_id, title, description, event_date, location, poster_url } = req.body;

        const newEvent = await pool.query(
            "INSERT INTO events (club_id, title, description, event_date, location, poster_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [club_id, title, description, event_date, location, poster_url]
        );

        res.json(newEvent.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST: RSVP to an event
router.post('/rsvp', authorize, async (req, res) => {
    try {
        const { event_id, status } = req.body; // status should be 'going', 'maybe', or 'declined'
        const user_id = req.user;

        // Check if the user already RSVP'd
        const existingRsvp = await pool.query(
            "SELECT * FROM event_participants WHERE event_id = $1 AND user_id = $2",
            [event_id, user_id]
        );

        if (existingRsvp.rows.length > 0) {
            // Update their RSVP status
            const updatedRsvp = await pool.query(
                "UPDATE event_participants SET status = $1 WHERE event_id = $2 AND user_id = $3 RETURNING *",
                [status, event_id, user_id]
            );
            return res.json(updatedRsvp.rows[0]);
        } else {
            // Create a new RSVP entry
            const newRsvp = await pool.query(
                "INSERT INTO event_participants (event_id, user_id, status) VALUES ($1, $2, $3) RETURNING *",
                [event_id, user_id, status]
            );
            return res.json(newRsvp.rows[0]);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;