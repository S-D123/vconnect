import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import clubsRoutes from './routes/clubs.js';
import postsRoutes from './routes/posts.js';
import reactionsRoutes from './routes/reactions.js';
import eventsRoutes from './routes/events.js';
import commentsRoutes from './routes/comments.js';
import adminRoutes from './routes/admin.js';
import searchRoutes from './routes/search.js';
import uploadRoutes from './routes/upload.js';

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/clubs', clubsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/reactions', reactionsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/upload', uploadRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
