const express = require('express');
const router = express.Router();
const pool = require('../db');
const authorize = require('../middleware/authorize');

// GET: Fetch all comments for a specific post
router.get('/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        // We JOIN with the users table to get the name of the person who commented
        const comments = await pool.query(
            `SELECT comments.id, comments.content, comments.created_at, users.name AS author_name 
             FROM comments 
             JOIN users ON comments.user_id = users.id 
             WHERE post_id = $1 
             ORDER BY comments.created_at ASC`,
            [postId]
        );
        res.json(comments.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST: Add a new comment to a post
router.post('/', authorize, async (req, res) => {
    try {
        const { post_id, content } = req.body;

        const newComment = await pool.query(
            "INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *",
            [post_id, req.user, content]
        );

        res.json(newComment.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;