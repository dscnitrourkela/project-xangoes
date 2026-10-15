import { describe, it, expect } from 'vitest';
import app from '@/app';

describe('Storage Routes Integration (/storage/upload-url)', () => {
    it('POST /storage/upload-url generates signed upload URL for valid request', async () => {
        const payload = {
            fileName: 'student_id.png',
            contentType: 'image/png',
            fileSize: 1024 * 1024,
            purpose: 'id_card',
        };

        const res = await app.request('/storage/upload-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        expect(res.status).toBe(201);
        const body = (await res.json()) as any;
        expect(body.success).toBe(true);
        expect(body.data).toHaveProperty('uploadUrl');
        expect(body.data).toHaveProperty('fileUrl');
        expect(body.data).toHaveProperty('key');
        expect(body.data.uploadUrl).toContain('signature');
        expect(res.headers.get('x-request-id')).toBeDefined();
    });

    it('POST /storage/upload-url rejects missing contentType with 400', async () => {
        const payload = {
            fileName: 'student_id.png',
        };

        const res = await app.request('/storage/upload-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        expect(res.status).toBe(400);
        const body = (await res.json()) as any;
        expect(body.success).toBe(false);
        expect(body.message).toBe('Validation failed');
    });

    it('GET /storage/url/:key returns the file URL', async () => {
        const res = await app.request('/storage/url/id_card/test-file.png');
        expect(res.status).toBe(200);

        const body = (await res.json()) as any;
        expect(body.success).toBe(true);
        expect(body.data.fileUrl).toContain('test-file.png');
    });
});

