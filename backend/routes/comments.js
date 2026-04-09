const express = require('express');
const router = express.Router();
const pool = require('../db');
const authorize = require('../middleware/authorize');
// --- IMPORT THE NEW AI SERVICE ---
const { analyzeComment } = require('../services/aiAnalysis'); 

// GET: Fetch all comments for a specific post
router.get('/:postId', async (req, res) => {
    // ... KEEP YOUR EXISTING GET ROUTE EXACTLY THE SAME ...
    try {
        const { postId } = req.params;
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

// POST: Add a new comment and trigger AI Analysis
router.post('/', authorize, async (req, res) => {
    try {
        const { post_id, content } = req.body;

        // 1. Save the comment normally
        const newComment = await pool.query(
            "INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *",
            [post_id, req.user, content]
        );
        
        const commentId = newComment.rows[0].id;

        // 2. Return success to the user immediately (so the frontend feels fast)
        res.json(newComment.rows[0]);

        // 3. RUN AI ANALYSIS IN THE BACKGROUND
        // Notice we do NOT use 'await' here because we don't want to hold up the user's request
        analyzeComment(content).then(async (analysis) => {
            if (analysis) {
                // Save the AI scores to the database
                await pool.query(
                    `INSERT INTO comment_analysis 
                    (comment_id, sentiment, sentiment_score, toxicity_score, emotion) 
                    VALUES ($1, $2, $3, $4, $5)`,
                    [commentId, analysis.sentiment, analysis.sentiment_score, analysis.toxicity_score, analysis.emotion]
                );
                console.log(`AI Analysis saved for comment ${commentId}: ${analysis.emotion}`);
            }
        }).catch(err => console.error("Background AI failed:", err));

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;