const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Neon requires SSL connections
    ssl: {
        rejectUnauthorized: false,
    },
});

// Test the connection immediately
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Successfully connected to the Neon PostgreSQL database');
    release();
});

module.exports = pool;