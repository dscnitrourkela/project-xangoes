import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { errorHandler, notFoundHandler } from '@/middlewares/errorHandler';
import { CustomError } from '@/middlewares/asyncHandler';

describe('errorHandler middleware', () => {
    // Suppress console.error in test runs
    vi.spyOn(console, 'error').mockImplementation(() => {});

    it('handles HTTPException properly with accurate status and message', async () => {
        const app = new Hono();
        app.get('/test', () => {
            throw new HTTPException(401, { message: 'Unauthorized access token' });
        });
        app.onError(errorHandler);

        const res = await app.request('/test');
        expect(res.status).toBe(401);

        const body = (await res.json()) as any;
        expect(body.success).toBe(false);
        expect(body.message).toBe('Unauthorized access token');
        expect(typeof body.timestamp).toBe('string');
    });

    it('handles CustomError with custom status and error details', async () => {
        const app = new Hono();
        app.get('/test', () => {
            throw new CustomError('Duplicate team name', 409, { conflictField: 'name' });
        });
        app.onError(errorHandler);

        const res = await app.request('/test');
        expect(res.status).toBe(409);

        const body = (await res.json()) as any;
        expect(body.success).toBe(false);
        expect(body.message).toBe('Duplicate team name');
        expect(body.error).toEqual({ conflictField: 'name' });
    });

    it('handles ValidationError correctly with 400 status', async () => {
        const app = new Hono();
        app.get('/test', () => {
            const err = new Error('Field required');
            err.name = 'ValidationError';
            throw err;
        });
        app.onError(errorHandler);

        const res = await app.request('/test');
        expect(res.status).toBe(400);

        const body = (await res.json()) as any;
        expect(body.success).toBe(false);
        expect(body.message).toBe('Validation failed');
    });

    it('handles SyntaxError (invalid JSON) with 400 status', async () => {
        const app = new Hono();
        app.get('/test', () => {
            throw new SyntaxError('Unexpected token in JSON');
        });
        app.onError(errorHandler);

        const res = await app.request('/test');
        expect(res.status).toBe(400);

        const body = (await res.json()) as any;
        expect(body.success).toBe(false);
        expect(body.message).toBe('Invalid JSON format');
    });

    it('handles unhandled generic errors with 500 status', async () => {
        const app = new Hono();
        app.get('/test', () => {
            throw new Error('Database unexpected failure');
        });
        app.onError(errorHandler);

        const res = await app.request('/test');
        expect(res.status).toBe(500);

        const body = (await res.json()) as any;
        expect(body.success).toBe(false);
        expect(body.message).toBe('Internal server error');
    });

    it('handles unmatched routes using notFoundHandler with 404 status', async () => {
        const app = new Hono();
        app.notFound(notFoundHandler);

        const res = await app.request('/non-existent-route');
        expect(res.status).toBe(404);

        const body = (await res.json()) as any;
        expect(body.success).toBe(false);
        expect(body.message).toBe('Route not found');
        expect(body.error).toContain('non-existent-route');
    });
});

