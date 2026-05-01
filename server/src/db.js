import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('Warning: DATABASE_URL is not set.');
}

export const pool = new Pool({
  connectionString,
  ssl: connectionString?.includes('localhost') ? false : { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL client error', err);
});
