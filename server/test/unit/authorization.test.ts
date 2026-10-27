import { describe, it, expect } from 'vitest';

import {
    canAccessFest,
    requireAdmin,
    requireContentEditor,
    requireFestAdmin,
    requireParticipant,
    requireSelf,
    requireSuperAdmin,
} from '@/services/authorization';
import { getMissingProfileFields } from '@/services/user.service';
import type { AuthContext } from '@/types';

const admin = (over: Record<string, unknown> = {}) =>
    ({
        id: 'a1',
        email: 'a@x.com',
        firebaseId: 'fb-a',
        isSuperAdmin: false,
        festID: 'fest-1',
        isDeleted: false,
        allowedToModifyContent: false,
        ...over,
    }) as any;

const ctx = (over: Partial<AuthContext> = {}): AuthContext => ({
    firebase: { uid: 'fb-u' } as any,
    user: { id: 'u1' } as any,
    admin: null,
    ...over,
});

const code = (fn: () => unknown) => {
    try {
        fn();
    } catch (e: any) {
        return { status: e.statusCode, code: e.details?.code };
    }
    return null;
};

describe('authorization helpers', () => {
    it('requireParticipant rejects identities without a user record', () => {
        expect(code(() => requireParticipant(ctx({ user: null })))).toEqual({
            status: 403,
            code: 'USER_NOT_PROVISIONED',
        });
        expect(code(() => requireParticipant(ctx()))).toBeNull();
    });

    it('requireAdmin rejects missing and soft-deleted admins', () => {
        expect(code(() => requireAdmin(ctx()))?.code).toBe('ADMIN_REQUIRED');
        expect(code(() => requireAdmin(ctx({ admin: admin({ isDeleted: true }) })))?.code).toBe('ADMIN_REMOVED');
        expect(code(() => requireAdmin(ctx({ admin: admin() })))).toBeNull();
    });

    it('requireSuperAdmin only allows active super admins', () => {
        expect(code(() => requireSuperAdmin(ctx({ admin: admin() })))?.code).toBe('SUPER_ADMIN_REQUIRED');
        expect(code(() => requireSuperAdmin(ctx({ admin: admin({ isSuperAdmin: true, isDeleted: true }) })))?.code).toBe(
            'ADMIN_REMOVED'
        );
        expect(code(() => requireSuperAdmin(ctx({ admin: admin({ isSuperAdmin: true }) })))).toBeNull();
    });

    it('fest admins are limited to their assigned fest; super admins reach any fest', () => {
        const fest = ctx({ admin: admin() });
        expect(canAccessFest(fest, 'fest-1')).toBe(true);
        expect(canAccessFest(fest, 'fest-2')).toBe(false);
        expect(code(() => requireFestAdmin(fest, 'fest-2'))?.code).toBe('FEST_SCOPE_FORBIDDEN');

        const sup = ctx({ admin: admin({ isSuperAdmin: true, festID: null }) });
        expect(canAccessFest(sup, 'anything')).toBe(true);
    });

    it('deleted admins have no fest access', () => {
        expect(canAccessFest(ctx({ admin: admin({ isDeleted: true }) }), 'fest-1')).toBe(false);
    });

    it('requireContentEditor needs the content permission unless super admin', () => {
        expect(code(() => requireContentEditor(ctx({ admin: admin() }), 'fest-1'))?.code).toBe('CONTENT_EDIT_FORBIDDEN');
        expect(code(() => requireContentEditor(ctx({ admin: admin({ allowedToModifyContent: true }) }), 'fest-1'))).toBeNull();
        expect(
            code(() => requireContentEditor(ctx({ admin: admin({ allowedToModifyContent: true }) }), 'fest-2'))?.code
        ).toBe('FEST_SCOPE_FORBIDDEN');
        expect(code(() => requireContentEditor(ctx({ admin: admin({ isSuperAdmin: true }) }), 'fest-9'))).toBeNull();
    });

    it('requireSelf blocks modifying another user', () => {
        expect(code(() => requireSelf(ctx(), 'u1'))).toBeNull();
        expect(code(() => requireSelf(ctx(), 'u2'))?.code).toBe('NOT_OWNER');
    });
});

describe('profile completion', () => {
    it('reports missing required fields', () => {
        expect(getMissingProfileFields({ name: null, mobile: null, college: null } as any)).toEqual([
            'name',
            'mobile',
            'college',
        ]);
        expect(getMissingProfileFields({ name: 'A', mobile: '9999999999', college: ' ' } as any)).toEqual(['college']);
        expect(getMissingProfileFields({ name: 'A', mobile: '9999999999', college: 'c1' } as any)).toEqual([]);
    });
});
