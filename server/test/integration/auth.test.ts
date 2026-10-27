import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from '@/app';
import { createError } from '@/middlewares/asyncHandler';

const mocks = vi.hoisted(() => ({
    verifyIdToken: vi.fn(),
    findUserByFirebaseId: vi.fn(),
    findAdminByFirebaseId: vi.fn(),
    provisionFromToken: vi.fn(),
    updateProfile: vi.fn(),
    findUserById: vi.fn(),
    listAdmins: vi.fn(),
    removeAdmin: vi.fn(),
}));

vi.mock('@/services/firebase', () => ({
    verifyIdToken: mocks.verifyIdToken,
    getFirebaseUidByEmail: vi.fn(),
}));

vi.mock('@/services/user.service', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/services/user.service')>();
    return {
        ...actual,
        userService: {
            findByFirebaseId: mocks.findUserByFirebaseId,
            findById: mocks.findUserById,
            provisionFromToken: mocks.provisionFromToken,
            updateProfile: mocks.updateProfile,
        },
    };
});

vi.mock('@/services/admin.service', () => ({
    adminService: {
        findByFirebaseId: mocks.findAdminByFirebaseId,
        list: mocks.listAdmins,
        remove: mocks.removeAdmin,
    },
}));

const user = (over: Record<string, unknown> = {}) => ({
    id: 'u1',
    email: 'u@x.com',
    firebaseId: 'fb-u1',
    name: 'U',
    mobile: null,
    college: null,
    ...over,
});
const admin = (over: Record<string, unknown> = {}) => ({
    id: 'a1',
    email: 'a@x.com',
    firebaseId: 'fb-a1',
    isSuperAdmin: false,
    festID: 'fest-1',
    isDeleted: false,
    allowedToModifyContent: false,
    ...over,
});

const call = (path: string, init: RequestInit & { token?: string } = {}) => {
    const { token = 'good', headers, ...rest } = init;
    return app.request(path, {
        ...rest,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...headers },
    });
};

/** Signs in as the given records. */
function signIn(u: unknown, a: unknown = null, uid = 'fb-u1') {
    mocks.verifyIdToken.mockResolvedValue({ uid, email: 'u@x.com' });
    mocks.findUserByFirebaseId.mockResolvedValue(u);
    mocks.findAdminByFirebaseId.mockResolvedValue(a);
}

beforeEach(() => {
    vi.resetAllMocks();
});

describe('authentication', () => {
    it('rejects requests without a token (401)', async () => {
        const res = await app.request('/users/me');
        expect(res.status).toBe(401);
        expect(((await res.json()) as any).error.code).toBe('AUTH_REQUIRED');
    });

    it('rejects malformed Authorization headers (401)', async () => {
        const res = await app.request('/users/me', { headers: { Authorization: 'Token abc' } });
        expect(res.status).toBe(401);
        expect(((await res.json()) as any).error.code).toBe('TOKEN_MALFORMED');
    });

    it.each(['TOKEN_EXPIRED', 'TOKEN_REVOKED', 'TOKEN_INVALID'])('propagates %s as 401', async (code) => {
        mocks.verifyIdToken.mockRejectedValue(createError.unauthorized('nope', { code }));
        const res = await call('/users/me');
        expect(res.status).toBe(401);
        expect(((await res.json()) as any).error.code).toBe(code);
    });
});

describe('POST /auth/session', () => {
    it('provisions a new user with 201 and reports missing profile fields', async () => {
        signIn(null);
        mocks.provisionFromToken.mockResolvedValue({ user: user(), created: true });

        const res = await call('/auth/session', { method: 'POST' });
        expect(res.status).toBe(201);
        const body = (await res.json()) as any;
        expect(body.data.user.profileComplete).toBe(false);
        expect(body.data.user.missingFields).toEqual(['mobile', 'college']);
        expect(body.data.admin).toBeNull();
    });

    it('returns 200 for an existing user and includes admin context', async () => {
        signIn(user(), admin({ allowedToModifyContent: true }));
        mocks.provisionFromToken.mockResolvedValue({ user: user(), created: false });

        const res = await call('/auth/session', { method: 'POST' });
        expect(res.status).toBe(200);
        expect(((await res.json()) as any).data.admin).toMatchObject({ festID: 'fest-1', allowedToModifyContent: true });
    });

    it('omits admin context for deleted admins', async () => {
        signIn(user(), admin({ isDeleted: true }));
        mocks.provisionFromToken.mockResolvedValue({ user: user(), created: false });

        const res = await call('/auth/session', { method: 'POST' });
        expect(((await res.json()) as any).data.admin).toBeNull();
    });
});

describe('/users', () => {
    it('GET /users/me requires a provisioned user (403)', async () => {
        signIn(null);
        const res = await call('/users/me');
        expect(res.status).toBe(403);
        expect(((await res.json()) as any).error.code).toBe('USER_NOT_PROVISIONED');
    });

    it('PATCH /users/me updates allowed fields', async () => {
        signIn(user());
        mocks.updateProfile.mockResolvedValue(user({ mobile: '9999999999' }));

        const res = await call('/users/me', { method: 'PATCH', body: JSON.stringify({ mobile: '9999999999' }) });
        expect(res.status).toBe(200);
        expect(mocks.updateProfile).toHaveBeenCalledWith('u1', { mobile: '9999999999' });
    });

    it('PATCH /users/me rejects server-controlled fields (400)', async () => {
        signIn(user());
        const res = await call('/users/me', { method: 'PATCH', body: JSON.stringify({ hasPaid: true }) });
        expect(res.status).toBe(400);
        expect(mocks.updateProfile).not.toHaveBeenCalled();
    });

    it('PATCH /users/:id forbids editing another user (403)', async () => {
        signIn(user());
        const res = await call('/users/someone-else', { method: 'PATCH', body: JSON.stringify({ name: 'x' }) });
        expect(res.status).toBe(403);
        expect(mocks.updateProfile).not.toHaveBeenCalled();
    });

    it('PATCH /users/:id forbids even super admins from editing others', async () => {
        signIn(user(), admin({ isSuperAdmin: true }));
        const res = await call('/users/someone-else', { method: 'PATCH', body: JSON.stringify({ name: 'x' }) });
        expect(res.status).toBe(403);
    });

    it('GET /users/:id is limited to self or super admin', async () => {
        signIn(user(), admin());
        expect((await call('/users/other')).status).toBe(403);

        signIn(user(), admin({ isSuperAdmin: true }));
        mocks.findUserById.mockResolvedValue(user({ id: 'other' }));
        expect((await call('/users/other')).status).toBe(200);
    });
});

describe('/admins and /fests', () => {
    it('GET /admins/me rejects deleted admins (403)', async () => {
        signIn(user(), admin({ isDeleted: true }));
        const res = await call('/admins/me');
        expect(res.status).toBe(403);
        expect(((await res.json()) as any).error.code).toBe('ADMIN_REMOVED');
    });

    it('GET /admins/me rejects non-admins (403)', async () => {
        signIn(user());
        expect((await call('/admins/me')).status).toBe(403);
    });

    it('GET /admins is super-admin only', async () => {
        signIn(user(), admin());
        expect((await call('/admins')).status).toBe(403);

        signIn(user(), admin({ isSuperAdmin: true }));
        mocks.listAdmins.mockResolvedValue([]);
        expect((await call('/admins')).status).toBe(200);
    });

    it('DELETE /admins/:id cannot remove yourself', async () => {
        signIn(user(), admin({ isSuperAdmin: true }));
        const res = await call('/admins/a1', { method: 'DELETE' });
        expect(res.status).toBe(400);
        expect(mocks.removeAdmin).not.toHaveBeenCalled();
    });

    it('fest admins cannot access another fest (403, not 500)', async () => {
        signIn(user(), admin());
        mocks.listAdmins.mockResolvedValue([]);

        expect((await call('/fests/fest-1/admins')).status).toBe(200);
        const res = await call('/fests/fest-2/admins');
        expect(res.status).toBe(403);
        expect(((await res.json()) as any).error.code).toBe('FEST_SCOPE_FORBIDDEN');
    });
});
