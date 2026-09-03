import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import errorHandler from './middleware/errorHandler';
import NotFoundError from './errors/NotFoundError';

const app = express();

// `credentials: true` is what allows the refresh cookie to cross origins.
// `origin: true` reflects the caller — fine for dev, tighten to an allowlist in prod.
app.use(cors({ origin: true, credentials: true }));

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'ok' });
});

// Must match the `path` in auth.controller's cookie options.
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

app.use((_req, _res, next) => {
  next(new NotFoundError('Route not found'));
});

app.use(errorHandler);

export default app;