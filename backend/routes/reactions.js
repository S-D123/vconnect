const express = require('express');
const router = express.Router();
const pool = require('../db');
const authorize = require('../middleware/authorize');

// POST: Toggle a reaction (Like / Unlike)
router.post('/toggle', authorize, async (req, res) => {
    try {
        const { post_id } = req.body;
        const user_id = req.user;

        // Check if the user has already liked this post
        const existingReaction = await pool.query(
            "SELECT * FROM reactions WHERE post_id = $1 AND user_id = $2",
            [post_id, user_id]
        );

        if (existingReaction.rows.length > 0) {
            // If they already liked it, UNLIKE it (delete the reaction)
            await pool.query(
                "DELETE FROM reactions WHERE post_id = $1 AND user_id = $2",
                [post_id, user_id]
            );
            return res.json({ message: "Unliked", liked: false });
        } else {
            // If they haven't liked it, LIKE it (insert the reaction)
            await pool.query(
                "INSERT INTO reactions (post_id, user_id, reaction_type) VALUES ($1, $2, $3)",
                [post_id, user_id, 'like']
            );
            return res.json({ message: "Liked", liked: true });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;