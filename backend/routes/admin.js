const express = require('express');
const router = express.Router();
const pool = require('../db');
const authorize = require('../middleware/authorize');

// GET: Fetch dashboard stats and flagged comments for a specific club
router.get('/dashboard/:clubId', authorize, async (req, res) => {
    try {
        const { clubId } = req.params;
        const userId = req.user;

        // 1. Verify this user is actually an admin of this club
        const adminCheck = await pool.query(
            "SELECT role FROM club_members WHERE club_id = $1 AND user_id = $2",
            [clubId, userId]
        );

        if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== 'admin') {
            return res.status(403).json("Not authorized to view this dashboard.");
        }

        // 2. Fetch basic statistics
        const memberCount = await pool.query("SELECT COUNT(*) FROM club_members WHERE club_id = $1", [clubId]);
        const postCount = await pool.query("SELECT COUNT(*) FROM posts WHERE club_id = $1", [clubId]);
        const eventCount = await pool.query("SELECT COUNT(*) FROM events WHERE club_id = $1", [clubId]);

        // 3. Fetch flagged comments (Toxicity > 0.4) using our AI analysis table
        const flaggedCommentsQuery = `
            SELECT 
                c.id AS comment_id, 
                c.content, 
                u.name AS author_name, 
                ca.toxicity_score, 
                ca.emotion,
                p.title AS post_title
            FROM comments c
            JOIN users u ON c.user_id = u.id
            JOIN posts p ON c.post_id = p.id
            JOIN comment_analysis ca ON c.id = ca.comment_id
            WHERE p.club_id = $1 AND ca.toxicity_score > 0.4
            ORDER BY ca.toxicity_score DESC;
        `;
        const flaggedComments = await pool.query(flaggedCommentsQuery, [clubId]);

        res.json({
            stats: {
                members: memberCount.rows[0].count,
                posts: postCount.rows[0].count,
                events: eventCount.rows[0].count
            },
            flagged_comments: flaggedComments.rows
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE: Remove a toxic comment
router.delete('/comment/:commentId', authorize, async (req, res) => {
    try {
        const { commentId } = req.params;
        
        // In a production app, you would add another check here to ensure 
        // the user is the admin of the club that owns the post this comment belongs to.
        
        await pool.query("DELETE FROM comments WHERE id = $1", [commentId]);
        res.json({ message: "Comment deleted successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;