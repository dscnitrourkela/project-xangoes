import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateEnv } from '@/config/env';

describe('Environment validation', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        process.env = { ...originalEnv };
        process.env.NODE_ENV = 'test';
    });

    afterEach(() => {
        process.env = { ...originalEnv };
    });

    it('validates successfully when all required variables are set', () => {
        process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
        process.env.GOOGLE_CLIENT_ID = 'test-client-id';
        process.env.GOOGLE_CLIENT_SECRET = 'test-secret';
        process.env.GOOGLE_REDIRECT_URI = 'http://localhost:5000/auth/callback';

        const config = validateEnv();
        expect(config.DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/db');
        expect(config.GOOGLE_CLIENT_ID).toBe('test-client-id');
        expect(config.GOOGLE_REDIRECT_URI).toBe('http://localhost:5000/auth/callback');
    });

    it('throws descriptive validation error when DATABASE_URL is missing', () => {
        delete process.env.DATABASE_URL;
        process.env.GOOGLE_CLIENT_ID = 'test-client-id';
        process.env.GOOGLE_CLIENT_SECRET = 'test-secret';
        process.env.GOOGLE_REDIRECT_URI = 'http://localhost:5000/auth/callback';

        expect(() => validateEnv()).toThrowError(/DATABASE_URL/);
    });

    it('throws validation error when GOOGLE variables are missing', () => {
        process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
        delete process.env.GOOGLE_CLIENT_ID;

        expect(() => validateEnv()).toThrowError(/GOOGLE_CLIENT_ID/);
    });

    it('throws validation error when GOOGLE_REDIRECT_URI is not a valid URL', () => {
        process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
        process.env.GOOGLE_CLIENT_ID = 'test-client-id';
        process.env.GOOGLE_CLIENT_SECRET = 'test-secret';
        process.env.GOOGLE_REDIRECT_URI = 'not-a-url';

        expect(() => validateEnv()).toThrowError(/GOOGLE_REDIRECT_URI must be a valid URL/);
    });
});

