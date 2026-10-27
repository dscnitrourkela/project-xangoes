import { randomUUID } from 'node:crypto';

import { and, eq } from 'drizzle-orm';

import { admins, db, fests, type Admin } from '@/db/schema';
import { createError } from '@/middlewares/asyncHandler';

import { getFirebaseUidByEmail } from './firebase';

export interface AdminInput {
    email: string;
    firebaseId?: string;
    festID?: string | null;
    isSuperAdmin?: boolean;
    allowedToModifyContent?: boolean;
}

export type AdminUpdate = Partial<Pick<AdminInput, 'festID' | 'isSuperAdmin' | 'allowedToModifyContent'>>;

async function assertFestExists(festID: string) {
    const [fest] = await db.select({ id: fests.id }).from(fests).where(eq(fests.id, festID)).limit(1);
    if (!fest) throw createError.badRequest('Unknown fest', { field: 'festID' });
}

export const adminService = {
    /** Looks up by Firebase uid. Returns soft-deleted admins too; callers decide how to treat them. */
    async findByFirebaseId(firebaseId: string): Promise<Admin | null> {
        const [admin] = await db.select().from(admins).where(eq(admins.firebaseId, firebaseId)).limit(1);
        return admin ?? null;
    },

    async findById(id: string): Promise<Admin | null> {
        const [admin] = await db
            .select()
            .from(admins)
            .where(and(eq(admins.id, id), eq(admins.isDeleted, false)))
            .limit(1);
        return admin ?? null;
    },

    async list(filter: { festID?: string } = {}): Promise<Admin[]> {
        const conditions = [eq(admins.isDeleted, false)];
        if (filter.festID) conditions.push(eq(admins.festID, filter.festID));
        return db.select().from(admins).where(and(...conditions));
    },

    /**
     * Grants admin access. Re-provisioning a soft-deleted admin restores the record
     * with the newly supplied scope and permissions.
     */
    async provision(input: AdminInput): Promise<Admin> {
        const email = input.email.toLowerCase();
        const isSuperAdmin = input.isSuperAdmin ?? false;
        const festID = input.festID ?? null;

        if (!isSuperAdmin && !festID) {
            throw createError.badRequest('festID is required for non-super admins', { field: 'festID' });
        }
        if (!isSuperAdmin && festID) await assertFestExists(festID);

        const firebaseId = input.firebaseId ?? (await getFirebaseUidByEmail(email));
        if (!firebaseId) {
            throw createError.notFound('No Firebase account exists for this email', {
                code: 'FIREBASE_USER_NOT_FOUND',
            });
        }

        const [byUid] = await db.select().from(admins).where(eq(admins.firebaseId, firebaseId)).limit(1);
        const [byEmail] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
        if (byUid && byEmail && byUid.id !== byEmail.id) {
            throw createError.conflict('Email and Firebase identity belong to different admins');
        }
        const existing = byUid ?? byEmail;

        const values = {
            email,
            firebaseId,
            isSuperAdmin,
            festID: isSuperAdmin ? null : festID,
            allowedToModifyContent: input.allowedToModifyContent ?? false,
            isDeleted: false,
            updatedAt: new Date(),
        };

        if (existing) {
            if (!existing.isDeleted) throw createError.conflict('Admin already exists');
            const [restored] = await db.update(admins).set(values).where(eq(admins.id, existing.id)).returning();
            return restored;
        }

        const [created] = await db.insert(admins).values({ id: randomUUID(), ...values }).returning();
        return created;
    },

    async update(id: string, patch: AdminUpdate): Promise<Admin> {
        const current = await this.findById(id);
        if (!current) throw createError.notFound('Admin not found');

        const isSuperAdmin = patch.isSuperAdmin ?? current.isSuperAdmin ?? false;
        const festID = patch.festID !== undefined ? patch.festID : current.festID;
        if (!isSuperAdmin && !festID) {
            throw createError.badRequest('festID is required for non-super admins', { field: 'festID' });
        }
        if (!isSuperAdmin && festID && festID !== current.festID) await assertFestExists(festID);

        const [updated] = await db
            .update(admins)
            .set({
                isSuperAdmin,
                festID: isSuperAdmin ? null : festID,
                allowedToModifyContent: patch.allowedToModifyContent ?? current.allowedToModifyContent,
                updatedAt: new Date(),
            })
            .where(eq(admins.id, id))
            .returning();
        return updated;
    },

    /** Soft delete: the row is kept for audit but loses all admin access. */
    async remove(id: string): Promise<void> {
        const [removed] = await db
            .update(admins)
            .set({ isDeleted: true, updatedAt: new Date() })
            .where(and(eq(admins.id, id), eq(admins.isDeleted, false)))
            .returning({ id: admins.id });
        if (!removed) throw createError.notFound('Admin not found');
    },
};
