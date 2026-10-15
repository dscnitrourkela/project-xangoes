import {sql} from 'drizzle-orm';
import {drizzle} from 'drizzle-orm/node-postgres';
import {Pool} from 'pg';

import {env} from '../config/env';

import * as schema from './schema/index';

let pool = new Pool({
  connectionString: env.DATABASE_URL,
  connectionTimeoutMillis: 3000,
});

export let db = drizzle(pool, {schema});

export const resetDbConnection = async () => {
  await pool.end();
  pool = new Pool({
    connectionString: env.DATABASE_URL,
    connectionTimeoutMillis: 3000,
  });
  db = drizzle(pool, {schema});
};

/**
 * Health check helper to verify database connectivity.
 * Executes a light ping query `SELECT 1`.
 */
export const checkDbConnection = async():
    Promise<{isHealthy: boolean; latencyMs: number; error?: string}> => {
      const start = Date.now();
      try {
        await db.execute(sql`SELECT 1`);
        const latencyMs = Date.now() - start;
        return {isHealthy: true, latencyMs};
      } catch (err: any) {
        const latencyMs = Date.now() - start;
        return {
          isHealthy: false,
          latencyMs,
          error: err?.message || 'Database connection error'
        };
      }
    };
