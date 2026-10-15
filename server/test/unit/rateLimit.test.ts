import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Hono } from 'hono';
import { rateLimit, clearRateLimitLogs } from '@/middlewares/rateLimit';
import { env } from '@/config/env';

describe('rateLimit middleware', () => {
    beforeEach(() => {
        clearRateLimitLogs();
    });

    afterEach(() => {
        clearRateLimitLogs();
    });

    it('allows requests within rate limit and attaches X-RateLimit headers', async () => {
        const app = new Hono();
        app.use('*', rateLimit);
        app.get('/test', (c) => c.text('OK'));

        const res = await app.request('/test', {
            headers: { 'x-forwarded-for': '192.168.1.1' },
        });

        expect(res.status).toBe(200);
        expect(res.headers.get('X-RateLimit-Limit')).toBe(String(env.RATE_LIMIT));
        expect(res.headers.get('X-RateLimit-Remaining')).toBe(String(env.RATE_LIMIT - 1));
        expect(res.headers.get('X-RateLimit-Reset')).toBeDefined();
    });

    it('blocks requests exceeding limit and returns 429 Too Many Requests', async () => {
        const app = new Hono();
        app.use('*', rateLimit);
        app.get('/test', (c) => c.text('OK'));

        const ip = '10.0.0.5';

        // Rapid fire requests equal to rate limit
        for (let i = 0; i < env.RATE_LIMIT; i++) {
            const okRes = await app.request('/test', {
                headers: { 'x-forwarded-for': ip },
            });
            expect(okRes.status).toBe(200);
        }

        // Next request must be rate limited
        const blockedRes = await app.request('/test', {
            headers: { 'x-forwarded-for': ip },
        });

        expect(blockedRes.status).toBe(429);
        expect(await blockedRes.text()).toBe('Too Many Requests');
        expect(blockedRes.headers.get('X-RateLimit-Remaining')).toBe('0');
    });

    it('differentiates between distinct IP addresses', async () => {
        const app = new Hono();
        app.use('*', rateLimit);
        app.get('/test', (c) => c.text('OK'));

        const ip1 = '1.1.1.1';
        const ip2 = '2.2.2.2';

        // Exhaust IP 1
        for (let i = 0; i < env.RATE_LIMIT; i++) {
            await app.request('/test', { headers: { 'x-forwarded-for': ip1 } });
        }

        const blockedIp1 = await app.request('/test', { headers: { 'x-forwarded-for': ip1 } });
        expect(blockedIp1.status).toBe(429);

        // IP 2 must still be allowed
        const allowedIp2 = await app.request('/test', { headers: { 'x-forwarded-for': ip2 } });
        expect(allowedIp2.status).toBe(200);
    });
});

