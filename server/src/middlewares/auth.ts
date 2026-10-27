import type { Context, Next } from 'hono';

import { adminService } from '@/services/admin.service';
import {
    canAccessFest,
    requireAdmin as assertAdmin,
    requireContentEditor as assertContentEditor,
    requireFestAdmin as assertFestAdmin,
    requireParticipant as assertParticipant,
    requireSuperAdmin as assertSuperAdmin,
} from '@/services/authorization';
import { verifyIdToken } from '@/services/firebase';
import { userService } from '@/services/user.service';
import type { AuthContext } from '@/types';

import { createError } from './asyncHandler';
import { getParam } from './params';

const AUTH_KEY = 'auth';

/** Returns the identity attached by `authenticate`. Throws 401 if the middleware did not run. */
export function getAuth(c: Context): AuthContext {
    const auth = c.get(AUTH_KEY) as AuthContext | undefined;
    if (!auth) throw createError.unauthorized('Authentication required', { code: 'AUTH_REQUIRED' });
    return auth;
}

function extractBearerToken(c: Context): string {
    const header = c.req.header('authorization');
    if (!header) {
        throw createError.unauthorized('Authentication required', { code: 'AUTH_REQUIRED' });
    }
    const [scheme, token, ...rest] = header.trim().split(/\s+/);
    if (scheme?.toLowerCase() !== 'bearer' || !token || rest.length > 0) {
        throw createError.unauthorized('Authorization header must be "Bearer <token>"', {
            code: 'TOKEN_MALFORMED',
        });
    }
    return token;
}

/**
 * Verifies the Firebase ID token and attaches `{ firebase, user, admin }` to the request.
 * `user` / `admin` are null when no matching record exists; use the guards below to require them.
 */
export async function authenticate(c: Context, next: Next) {
    const firebase = await verifyIdToken(extractBearerToken(c));
    const [user, admin] = await Promise.all([
        userService.findByFirebaseId(firebase.uid),
        adminService.findByFirebaseId(firebase.uid),
    ]);
    c.set(AUTH_KEY, { firebase, user, admin } satisfies AuthContext);
    await next();
}

/** Requires a provisioned participant record. Place after `authenticate`. */
export async function requireParticipant(c: Context, next: Next) {
    assertParticipant(getAuth(c));
    await next();
}

/** Requires an active admin (deleted admins are rejected). Place after `authenticate`. */
export async function requireAdmin(c: Context, next: Next) {
    assertAdmin(getAuth(c));
    await next();
}

/** Requires an active super admin. Place after `authenticate`. */
export async function requireSuperAdmin(c: Context, next: Next) {
    assertSuperAdmin(getAuth(c));
    await next();
}

/** Requires an admin scoped to the fest in route param `param` (default `festId`). */
export function requireFestAdmin(param = 'festId') {
    return async (c: Context, next: Next) => {
        assertFestAdmin(getAuth(c), getParam(c, param));
        await next();
    };
}

/** Requires a fest-scoped admin with content-edit permission for the fest in route param `param`. */
export function requireContentEditor(param = 'festId') {
    return async (c: Context, next: Next) => {
        assertContentEditor(getAuth(c), getParam(c, param));
        await next();
    };
}

export { canAccessFest };
