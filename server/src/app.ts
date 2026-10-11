import { Hono } from 'hono';
import { logger } from 'hono/logger';

import {
  errorHandler,
  notFoundHandler,
  rateLimit,
  requestIdMiddleware,
} from './middlewares';
import { routes } from './routes';

const app = new Hono();

// Request ID middleware (first to ensure requestId is present for logs and all handlers)
app.use('*', requestIdMiddleware);

// Middleware
app.use('*', logger());

// Rate limiting middleware
app.use('*', rateLimit);

// Routes
app.route('/', routes);

// 404 handler for unmatched routes
app.notFound(notFoundHandler);

// Global error handler
app.onError(errorHandler);

export default app;
