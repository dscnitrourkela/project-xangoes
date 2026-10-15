import { serve } from '@hono/node-server';
import app from './app';
import {
  env,
  validateEnv,
} from './config/env';

// Validate environment variables on startup
validateEnv();

const port = env.PORT || 5000;

console.log(`🚀 Server starting on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port: port,
}, (info) => {
  console.log(`✅ Server is live at http://localhost:${info.port}`);
});

export default app;
