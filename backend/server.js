const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import the database pool
const pool = require('./db');

const app = express();

// Middleware
app.use(cors()); // Allows requests from your React frontend
app.use(express.json()); // Parses incoming JSON payloads

app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/clubs', require('./routes/clubs'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/reactions', require('./routes/reactions'));
app.use('/api/events', require('./routes/events'));
app.use('/api/users', require('./routes/users'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/search', require('./routes/search'));
app.use('/api/admin', require('./routes/admin'));

// A simple test route to verify the server is running
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', database: 'Connected' });
});

// A quick test route to verify database querying works
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ currentTime: result.rows[0].now });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});