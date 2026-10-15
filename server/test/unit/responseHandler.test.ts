import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import {
    ResponseHandler,
    sendSuccess,
    sendCreated,
    sendNoContent,
    sendPaginated,
    sendError,
} from '@/middlewares/responseHandler';

describe('responseHandler', () => {
    it('returns standardized success envelope', async () => {
        const app = new Hono();
        app.get('/test', (c) => sendSuccess(c, { id: 1, name: 'Item' }, 'Custom success message'));

        const res = await app.request('/test');
        expect(res.status).toBe(200);

        const body = (await res.json()) as any;
        expect(body.success).toBe(true);
        expect(body.message).toBe('Custom success message');
        expect(body.data).toEqual({ id: 1, name: 'Item' });
        expect(typeof body.timestamp).toBe('string');
        expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
    });

    it('returns standardized created envelope with 201 status', async () => {
        const app = new Hono();
        app.post('/test', (c) => sendCreated(c, { id: 101 }, 'Created entity'));

        const res = await app.request('/test', { method: 'POST' });
        expect(res.status).toBe(201);

        const body = (await res.json()) as any;
        expect(body.success).toBe(true);
        expect(body.message).toBe('Created entity');
        expect(body.data).toEqual({ id: 101 });
    });

    it('returns standardized noContent response with 204 status', async () => {
        const app = new Hono();
        app.delete('/test', (c) => sendNoContent(c));

        const res = await app.request('/test', { method: 'DELETE' });
        expect(res.status).toBe(204);
    });

    it('returns standardized paginated envelope with metadata calculation', async () => {
        const app = new Hono();
        const items = [{ id: 1 }, { id: 2 }];
        app.get('/test', (c) => sendPaginated(c, items, 2, 2, 9, 'Items page'));

        const res = await app.request('/test');
        expect(res.status).toBe(200);

        const body = (await res.json()) as any;
        expect(body.success).toBe(true);
        expect(body.message).toBe('Items page');
        expect(body.data).toEqual(items);
        expect(body.pagination).toEqual({
            page: 2,
            limit: 2,
            total: 9,
            totalPages: 5,
        });
    });

    it('returns standardized error envelope', async () => {
        const app = new Hono();
        app.get('/test', (c) => sendError(c, 'Bad request', 400, [{ field: 'email', message: 'invalid' }]));

        const res = await app.request('/test');
        expect(res.status).toBe(400);

        const body = (await res.json()) as any;
        expect(body.success).toBe(false);
        expect(body.message).toBe('Bad request');
        expect(body.error).toEqual([{ field: 'email', message: 'invalid' }]);
    });
});

