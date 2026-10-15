import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { z } from 'zod';
import { validateRequest } from '@/middlewares/schemaValidator';

describe('schemaValidator middleware', () => {
    it('validates valid request body and calls next', async () => {
        const app = new Hono();
        const schema = z.object({
            name: z.string().min(2),
            age: z.number().positive(),
        });

        app.post('/test', validateRequest(schema, 'body'), (c) => c.json({ ok: true }));

        const res = await app.request('/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Alice', age: 25 }),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data).toEqual({ ok: true });
    });

    it('returns 400 when body is invalid', async () => {
        const app = new Hono();
        const schema = z.object({
            email: z.string().email(),
        });

        app.post('/test', validateRequest(schema, 'body'), (c) => c.json({ ok: true }));

        const res = await app.request('/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'not-an-email' }),
        });

        expect(res.status).toBe(400);
        const data = (await res.json()) as any;
        expect(data.success).toBe(false);
        expect(data.message).toBe('Validation failed');
        expect(Array.isArray(data.error)).toBe(true);
        expect(data.error[0].field).toBe('email');
    });

    it('validates query parameters correctly', async () => {
        const app = new Hono();
        const schema = z.object({
            page: z.string().regex(/^\d+$/),
        });

        app.get('/test', validateRequest(schema, 'query'), (c) => c.json({ ok: true }));

        const validRes = await app.request('/test?page=1');
        expect(validRes.status).toBe(200);

        const invalidRes = await app.request('/test?page=abc');
        expect(invalidRes.status).toBe(400);
        const data = (await invalidRes.json()) as any;
        expect(data.success).toBe(false);
    });

    it('validates route parameters correctly', async () => {
        const app = new Hono();
        const schema = z.object({
            id: z.string().uuid(),
        });

        app.get('/test/:id', validateRequest(schema, 'params'), (c) => c.json({ ok: true }));

        const validRes = await app.request('/test/123e4567-e89b-12d3-a456-426614174000');
        expect(validRes.status).toBe(200);

        const invalidRes = await app.request('/test/invalid-uuid');
        expect(invalidRes.status).toBe(400);
        const data = (await invalidRes.json()) as any;
        expect(data.success).toBe(false);
    });

    it('returns 500 when an invalid validation target is specified', async () => {
        const app = new Hono();
        const schema = z.object({ id: z.string() });

        app.get('/test', validateRequest(schema, 'headers' as any), (c) => c.json({ ok: true }));

        const res = await app.request('/test');
        expect(res.status).toBe(500);
        const data = (await res.json()) as any;
        expect(data.success).toBe(false);
        expect(data.message).toBe('Internal server error');
    });
});

