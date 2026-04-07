const express = require('express');
const router = express.Router();
const pool = require('../db');
const authorize = require('../middleware/authorize');

// POST: Create a new club
router.post('/', authorize, async (req, res) => {
    try {
        const { clubName, departmentName, collegeName } = req.body;
        
        // Combine extra fields into the description
        const description = `Department: ${departmentName} | College: ${collegeName}`;

        // Insert into database, using req.user (from middleware) as the created_by ID
        const newClub = await pool.query(
            "INSERT INTO clubs (name, description, created_by) VALUES ($1, $2, $3) RETURNING *",
            [clubName, description, req.user]
        );

        // Automatically add the creator as a club member with 'admin' role
        await pool.query(
            "INSERT INTO club_members (club_id, user_id, role) VALUES ($1, $2, $3)",
            [newClub.rows[0].id, req.user, 'admin']
        );

        res.json(newClub.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// GET: Fetch all clubs (for the create post dropdown)
router.get('/', async (req, res) => {
    try {
        const allClubs = await pool.query("SELECT id, name FROM clubs ORDER BY name ASC");
        res.json(allClubs.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;