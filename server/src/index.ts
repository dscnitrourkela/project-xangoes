import app from './app';
import {
  env,
  validateEnv,
} from './config/env';

// Validate environment variables on startup
validateEnv();

const server = {
    port: env.PORT,
    fetch: app.fetch,
};

export default server;
