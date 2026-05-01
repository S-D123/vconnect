-- PostgreSQL schema (Neon). Run once after creating the database.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  bio TEXT,
  profile_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clubs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo TEXT,
  created_by INTEGER REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS club_members (
  club_id INTEGER NOT NULL REFERENCES clubs (id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  PRIMARY KEY (club_id, user_id)
);

CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  club_id INTEGER NOT NULL REFERENCES clubs (id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_by INTEGER REFERENCES users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reactions (
  post_id INTEGER NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  reaction_type VARCHAR(50) NOT NULL DEFAULT 'like',
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comment_analysis (
  comment_id INTEGER PRIMARY KEY REFERENCES comments (id) ON DELETE CASCADE,
  sentiment VARCHAR(100),
  sentiment_score REAL,
  toxicity_score REAL,
  emotion VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  club_id INTEGER NOT NULL REFERENCES clubs (id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ,
  location TEXT,
  poster_url TEXT
);

CREATE TABLE IF NOT EXISTS event_participants (
  event_id INTEGER NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('going', 'maybe', 'declined')),
  PRIMARY KEY (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_posts_club ON posts (club_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments (post_id);
CREATE INDEX IF NOT EXISTS idx_events_club ON events (club_id);
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));
