import { randomUUID } from 'node:crypto';

import type { DecodedIdToken } from 'firebase-admin/auth';
import { eq } from 'drizzle-orm';

import { db, institutes, users, type User } from '@/db/schema';
import { createError } from '@/middlewares/asyncHandler';

/** Profile fields a participant must fill in before using the product. */
export const REQUIRED_PROFILE_FIELDS = ['name', 'mobile', 'college'] as const;
export type RequiredProfileField = (typeof REQUIRED_PROFILE_FIELDS)[number];

/** Fields a user may change on their own profile. Everything else is server-controlled. */
export const UPDATABLE_PROFILE_FIELDS = [
    'name',
    'photo',
    'gender',
    'dob',
    'state',
    'city',
    'college',
    'idCard',
    'mobile',
    'rollNumber',
] as const;

export type ProfileUpdate = Partial<{
    name: string;
    photo: string | null;
    gender: User['gender'];
    dob: Date | null;
    state: string | null;
    city: string | null;
    college: string;
    idCard: string | null;
    mobile: string;
    rollNumber: string | null;
}>;

const isUniqueViolation = (error: any) =>
    error?.code === '23505' || error?.cause?.code === '23505';

export function getMissingProfileFields(user: User): RequiredProfileField[] {
    return REQUIRED_PROFILE_FIELDS.filter((field) => {
        const value = user[field];
        return value === null || value === undefined || String(value).trim() === '';
    });
}

/** User record plus profile-completion status, as returned by the API. */
export function toUserProfile(user: User) {
    const missingFields = getMissingProfileFields(user);
    return {
        ...user,
        profileComplete: missingFields.length === 0,
        missingFields,
    };
}

export const userService = {
    async findByFirebaseId(firebaseId: string): Promise<User | null> {
        const [user] = await db.select().from(users).where(eq(users.firebaseId, firebaseId)).limit(1);
        return user ?? null;
    },

    async findById(id: string): Promise<User | null> {
        const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
        return user ?? null;
    },

    /**
     * Creates the user on first sign-in, or returns the existing one. Safe under
     * concurrent first requests: the unique firebase_id makes the insert a no-op for the loser.
     */
    async provisionFromToken(token: DecodedIdToken): Promise<{ user: User; created: boolean }> {
        const existing = await this.findByFirebaseId(token.uid);
        if (existing) return { user: existing, created: false };

        if (!token.email) {
            throw createError.forbidden('Account must have an email address', { code: 'EMAIL_REQUIRED' });
        }

        try {
            const [inserted] = await db
                .insert(users)
                .values({
                    id: randomUUID(),
                    firebaseId: token.uid,
                    email: token.email.toLowerCase(),
                    name: token.name ?? null,
                    photo: token.picture ?? null,
                })
                .onConflictDoNothing({ target: users.firebaseId })
                .returning();

            if (inserted) return { user: inserted, created: true };
        } catch (error) {
            if (isUniqueViolation(error)) {
                throw createError.conflict('An account with this email already exists', { code: 'EMAIL_IN_USE' });
            }
            throw error;
        }

        // Lost the race to a concurrent request
        const raced = await this.findByFirebaseId(token.uid);
        if (!raced) throw createError.internal('Failed to provision user');
        return { user: raced, created: false };
    },

    async updateProfile(userId: string, patch: ProfileUpdate): Promise<User> {
        if (patch.college) {
            const [institute] = await db
                .select({ id: institutes.id })
                .from(institutes)
                .where(eq(institutes.id, patch.college))
                .limit(1);
            if (!institute) {
                throw createError.badRequest('Unknown institution', { field: 'college' });
            }
        }

        const values: Record<string, unknown> = {};
        for (const key of UPDATABLE_PROFILE_FIELDS) {
            if (patch[key] !== undefined) values[key] = patch[key];
        }

        try {
            const [updated] = await db
                .update(users)
                .set({ ...values, updatedAt: new Date() })
                .where(eq(users.id, userId))
                .returning();
            if (!updated) throw createError.notFound('User not found');
            return updated;
        } catch (error) {
            if (isUniqueViolation(error)) {
                throw createError.conflict('Mobile number is already registered', { field: 'mobile' });
            }
            throw error;
        }
    },
};
