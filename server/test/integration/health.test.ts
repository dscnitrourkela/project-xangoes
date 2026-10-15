import { describe, it, expect, vi } from 'vitest';
import app from '@/app';
import * as dbModule from '@/db/schema';

describe('Health Routes Integration (/ & /health & /health/db)', () => {
    it('GET / returns API metadata and success status', async () => {
        const res = await app.request('/');
        expect(res.status).toBe(200);

        const body = (await res.json()) as any;
        expect(body.success).toBe(true);
        expect(body.data).toHaveProperty('name', 'Xangoes API');
        expect(body.data).toHaveProperty('version');
        expect(body.data).toHaveProperty('maintainer');
        expect(res.headers.get('x-request-id')).toBeDefined();
    });

    it('GET /health returns healthy server status', async () => {
        const res = await app.request('/health');
        expect(res.status).toBe(200);

        const body = (await res.json()) as any;
        expect(body.success).toBe(true);
        expect(body.data.status).toBe('ok');
        expect(body.data.message).toBe('Server is healthy and running!');
    });

    it('GET /health/db returns 200 when database ping succeeds', async () => {
        vi.spyOn(dbModule, 'checkDbConnection').mockResolvedValueOnce({
            isHealthy: true,
            latencyMs: 5,
        });

        const res = await app.request('/health/db');
        expect(res.status).toBe(200);

        const body = (await res.json()) as any;
        expect(body.success).toBe(true);
        expect(body.data.status).toBe('healthy');
        expect(body.data.database).toBe('postgresql');
        expect(body.data.latencyMs).toBe(5);
    });

    it('GET /health/db returns 503 when database ping fails', async () => {
        vi.spyOn(dbModule, 'checkDbConnection').mockResolvedValueOnce({
            isHealthy: false,
            latencyMs: 20,
            error: 'Connection refused to postgres:5432',
        });

        const res = await app.request('/health/db');
        expect(res.status).toBe(503);

        const body = (await res.json()) as any;
        expect(body.data.status).toBe('unhealthy');
        expect(body.data.error).toBe('Connection refused to postgres:5432');
    });
});

