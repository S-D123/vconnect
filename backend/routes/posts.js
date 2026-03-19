const express = require('express');
const router = express.Router();
const pool = require('../db');
const authorize = require('../middleware/authorize');

// GET all posts for the Home Page Feed
// GET all posts for the Home Page Feed
router.get('/', async (req, res) => {
    try {
        // We added a subquery to count the reactions for each post
        const query = `
            SELECT 
                posts.id, 
                posts.title, 
                posts.content AS description, 
                posts.image_url, 
                posts.created_at AS posted,
                clubs.name AS club_name,
                (SELECT COUNT(*) FROM reactions WHERE post_id = posts.id) AS like_count
            FROM posts
            LEFT JOIN clubs ON posts.club_id = clubs.id
            ORDER BY posts.created_at DESC;
        `;
        
        const allPosts = await pool.query(query);
        res.json(allPosts.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST: Create a new post
router.post('/', authorize, async (req, res) => {
    try {
        const { club_id, title, content, image_url } = req.body;

        const newPost = await pool.query(
            "INSERT INTO posts (club_id, title, content, image_url, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [club_id, title, content, image_url, req.user]
        );

        res.json(newPost.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;