import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';

import { env } from '@/config/env';
import { createError } from '@/middlewares/asyncHandler';

let app: App | undefined;

function getFirebaseApp(): App {
    if (app) return app;

    const existing = getApps()[0];
    if (existing) {
        app = existing;
        return app;
    }

    const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = env;
    if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
        throw createError.custom(
            'Authentication is not configured',
            503,
            { code: 'AUTH_NOT_CONFIGURED' }
        );
    }

    app = initializeApp({
        credential: cert({
            projectId: FIREBASE_PROJECT_ID,
            clientEmail: FIREBASE_CLIENT_EMAIL,
            // Env files store the key with escaped newlines
            privateKey: FIREBASE_PRIVATE_KEY.replace(/\n/g, '\n'),
        }),
    });
    return app;
}

/** Maps Firebase Admin error codes to a stable client-facing code. */
const TOKEN_ERROR_CODES: Record<string, { code: string; message: string }> = {
    'auth/id-token-expired': { code: 'TOKEN_EXPIRED', message: 'Authentication token has expired' },
    'auth/id-token-revoked': { code: 'TOKEN_REVOKED', message: 'Authentication token has been revoked' },
    'auth/user-disabled': { code: 'USER_DISABLED', message: 'This account has been disabled' },
    'auth/user-not-found': { code: 'USER_NOT_FOUND', message: 'Account no longer exists' },
};

/**
 * Verifies a Firebase ID token with the Admin SDK, including a revocation check.
 * Throws 401 for any invalid / expired / revoked / disabled identity.
 */
export async function verifyIdToken(idToken: string): Promise<DecodedIdToken> {
    const firebaseApp = getFirebaseApp();
    try {
        return await getAuth(firebaseApp).verifyIdToken(idToken, true);
    } catch (error: any) {
        const mapped = TOKEN_ERROR_CODES[error?.code];
        if (mapped) {
            throw createError.unauthorized(mapped.message, { code: mapped.code });
        }
        // Firebase outage / network problems are not the caller's fault
        if (typeof error?.code === 'string' && error.code.startsWith('app/')) {
            throw createError.custom('Authentication service unavailable', 503, { code: 'AUTH_UNAVAILABLE' });
        }
        throw createError.unauthorized('Invalid authentication token', { code: 'TOKEN_INVALID' });
    }
}

/** Resolves a Firebase uid from an email address, or null if no such account exists. */
export async function getFirebaseUidByEmail(email: string): Promise<string | null> {
    try {
        const record = await getAuth(getFirebaseApp()).getUserByEmail(email);
        return record.uid;
    } catch (error: any) {
        if (error?.code === 'auth/user-not-found') return null;
        throw error;
    }
}
