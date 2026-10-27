import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import {
  errorHandler,
  notFoundHandler,
  rateLimit,
  requestIdMiddleware,
} from './middlewares';
import { env } from './config/env';
import { routes } from './routes';

const app = new Hono();

// CORS: allow the web client to call the API with a Bearer token
app.use(
  '*',
  cors({
    origin: (env.CLIENT_ORIGIN || 'http://localhost:3000').split(',').map((o) => o.trim()),
    allowHeaders: ['Authorization', 'Content-Type', 'X-Request-Id'],
    allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

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
