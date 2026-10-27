import { createError } from '@/middlewares/asyncHandler';
import type { AuthContext } from '@/types';

/**
 * Central authorization rules. Routes and middleware call these helpers
 * instead of re-implementing permission checks.
 *
 *  - participant:    any request with a provisioned user record
 *  - fest admin:     active admin whose festID matches (any fest for super admins)
 *  - content editor: fest admin with allowedToModifyContent (or super admin)
 *  - super admin:    active admin with isSuperAdmin
 */

/** Active (not soft-deleted) admin record, or a 403. */
export function requireAdmin(auth: AuthContext) {
    const { admin } = auth;
    if (!admin) {
        throw createError.forbidden('Administrator access required', { code: 'ADMIN_REQUIRED' });
    }
    if (admin.isDeleted) {
        throw createError.forbidden('Administrator account has been removed', { code: 'ADMIN_REMOVED' });
    }
    return admin;
}

export function requireParticipant(auth: AuthContext) {
    if (!auth.user) {
        throw createError.forbidden('Profile not set up. Sign in via POST /auth/session first', {
            code: 'USER_NOT_PROVISIONED',
        });
    }
    return auth.user;
}

export function requireSuperAdmin(auth: AuthContext) {
    const admin = requireAdmin(auth);
    if (!admin.isSuperAdmin) {
        throw createError.forbidden('Super administrator access required', { code: 'SUPER_ADMIN_REQUIRED' });
    }
    return admin;
}

export function canAccessFest(auth: AuthContext, festId: string): boolean {
    const admin = auth.admin;
    if (!admin || admin.isDeleted) return false;
    return !!admin.isSuperAdmin || admin.festID === festId;
}

export function requireFestAdmin(auth: AuthContext, festId: string) {
    const admin = requireAdmin(auth);
    if (!canAccessFest(auth, festId)) {
        throw createError.forbidden('You do not have access to this fest', { code: 'FEST_SCOPE_FORBIDDEN' });
    }
    return admin;
}

export function requireContentEditor(auth: AuthContext, festId: string) {
    const admin = requireFestAdmin(auth, festId);
    if (!admin.isSuperAdmin && !admin.allowedToModifyContent) {
        throw createError.forbidden('You are not allowed to modify content', { code: 'CONTENT_EDIT_FORBIDDEN' });
    }
    return admin;
}

/** Users may only act on their own record. */
export function requireSelf(auth: AuthContext, userId: string) {
    const user = requireParticipant(auth);
    if (user.id !== userId) {
        throw createError.forbidden('You can only modify your own profile', { code: 'NOT_OWNER' });
    }
    return user;
}

/** Read access to a profile: the owner or a super admin. */
export function requireSelfOrSuperAdmin(auth: AuthContext, userId: string) {
    if (auth.user?.id === userId) return;
    requireSuperAdmin(auth);
}
