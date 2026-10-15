import { describe, it, expect } from 'vitest';
import app from '@/app';

describe('Test Users Routes Integration (/test & /test/users)', () => {
    it('GET /test returns documentation for test endpoints', async () => {
        const res = await app.request('/test');
        expect(res.status).toBe(200);

        const body = (await res.json()) as any;
        expect(body.success).toBe(true);
        expect(body.data).toHaveProperty('endpoints');
    });

    it('GET /test/users retrieves list of demo users with valid query', async () => {
        const res = await app.request('/test/users?page=1&limit=5');
        expect(res.status).toBe(200);

        const body = (await res.json()) as any;
        expect(body.success).toBe(true);
        expect(body.data).toHaveProperty('users');
        expect(Array.isArray(body.data.users)).toBe(true);
        expect(body.data).toHaveProperty('pagination');
        expect(body.data.pagination.page).toBe(1);
        expect(body.data.pagination.limit).toBe(5);
    });

    it('GET /test/users rejects invalid query parameters with 400', async () => {
        const res = await app.request('/test/users?page=-1');
        expect(res.status).toBe(400);

        const body = (await res.json()) as any;
        expect(body.success).toBe(false);
        expect(body.message).toBe('Validation failed');
    });

    it('POST /test/users creates a demo user with valid payload', async () => {
        const payload = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            age: 22,
        };

        const res = await app.request('/test/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        expect(res.status).toBe(201);
        const body = (await res.json()) as any;
        expect(body.success).toBe(true);
        expect(body.data.user.name).toBe('John Doe');
        expect(body.data.user.email).toBe('john.doe@example.com');
        expect(body.data.user).toHaveProperty('id');
    });

    it('POST /test/users rejects invalid email with 400', async () => {
        const payload = {
            name: 'Jane Doe',
            email: 'not-valid-email',
            age: 20,
        };

        const res = await app.request('/test/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        expect(res.status).toBe(400);
        const body = (await res.json()) as any;
        expect(body.success).toBe(false);
        expect(body.message).toBe('Validation failed');
    });

    it('GET /test/users/:id returns user when given a valid UUID', async () => {
        const validUuid = '123e4567-e89b-12d3-a456-426614174000';
        const res = await app.request(`/test/users/${validUuid}`);
        expect(res.status).toBe(200);

        const body = (await res.json()) as any;
        expect(body.success).toBe(true);
        expect(body.data.user.id).toBe(validUuid);
    });

    it('GET /test/users/:id rejects non-UUID id with 400', async () => {
        const res = await app.request('/test/users/123-not-uuid');
        expect(res.status).toBe(400);

        const body = (await res.json()) as any;
        expect(body.success).toBe(false);
        expect(body.message).toBe('Validation failed');
    });

    it('PUT /test/users/:id updates user when valid UUID and valid body are sent', async () => {
        const validUuid = '123e4567-e89b-12d3-a456-426614174000';
        const updatePayload = {
            name: 'Updated Name',
            email: 'updated@example.com',
        };

        const res = await app.request(`/test/users/${validUuid}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatePayload),
        });

        expect(res.status).toBe(200);
        const body = (await res.json()) as any;
        expect(body.success).toBe(true);
        expect(body.data.user.name).toBe('Updated Name');
    });
});

