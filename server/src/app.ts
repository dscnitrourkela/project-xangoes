import { Hono } from 'hono';
import { logger } from 'hono/logger';

import {
  errorHandler,
  notFoundHandler,
} from './middlewares';
import { routes } from './routes';
import { rateLimit } from './middlewares/rateLimit';

const app = new Hono();

// Middleware
app.use("*", logger());

// Rate limiting middleware
app.use('*', rateLimit);

// Routes
app.route("/", routes);

// 404 handler for unmatched routes
app.notFound(notFoundHandler);

// Global error handler
app.onError(errorHandler);

export default app;
