import { Context, Next } from 'hono';
import { env } from '../config/env';

interface RequestLog {
  timestamps: number[];
}

const requestLogs = new Map<string, RequestLog>();

const LIMIT = env.RATE_LIMIT;
const WINDOW = env.RATE_LIMIT_WINDOW;

export const rateLimit = async (c: Context, next: Next) => {
  const ip = c.req.header('x-forwarded-for')?.split(',')[0].trim()
            || c.req.header('cf-connecting-ip')
            || 'unknown';

  const now = Date.now();
  const windowStart = now - WINDOW * 1000;

  let log = requestLogs.get(ip);
  if (!log) {
    log = { timestamps: [] };
    requestLogs.set(ip, log);
  }

  log.timestamps = log.timestamps.filter(ts => ts > windowStart);

  if (log.timestamps.length < LIMIT) {
    log.timestamps.push(now);

    const firstTimestamp = log.timestamps[0] ?? now;

    c.header('X-RateLimit-Limit', String(LIMIT));
    c.header('X-RateLimit-Remaining', String(LIMIT - log.timestamps.length));
    c.header('X-RateLimit-Reset', String(Math.ceil((firstTimestamp + WINDOW * 1000 - now) / 1000)));

    await next();
  } else {
    const firstTimestamp = log.timestamps[0] ?? now;
    const resetTime = Math.ceil((firstTimestamp + WINDOW * 1000 - now) / 1000);

    c.header('X-RateLimit-Limit', String(LIMIT));
    c.header('X-RateLimit-Remaining', '0');
    c.header('X-RateLimit-Reset', String(resetTime));

    return c.text('Too Many Requests', 429);
  }

  if (log.timestamps.length === 0) {
    requestLogs.delete(ip);
  }
};
