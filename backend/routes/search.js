const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET: Search users and clubs
router.get('/', async (req, res) => {
    try {
        const { q } = req.query; // Get the search query from the URL (e.g., /api/search?q=tech)
        
        if (!q) {
            return res.json({ users: [], clubs: [] });
        }

        // Use ILIKE for case-insensitive searching in PostgreSQL
        const searchQuery = `%${q}%`;

        // 1. Search Users (matching name or email)
        const usersResult = await pool.query(
            "SELECT id, name, email, profile_image, role FROM users WHERE name ILIKE $1 OR email ILIKE $1 LIMIT 5",
            [searchQuery]
        );

        // 2. Search Clubs (matching name or description)
        const clubsResult = await pool.query(
            "SELECT id, name, description, logo FROM clubs WHERE name ILIKE $1 OR description ILIKE $1 LIMIT 5",
            [searchQuery]
        );

        res.json({
            users: usersResult.rows,
            clubs: clubsResult.rows
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;