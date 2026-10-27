import { Context } from 'hono';

import type { Admin } from '@/db/schema';
import { createError, getAuth, getParam, sendCreated, sendNoContent, sendSuccess } from '@/middlewares';
import { createAdminSchema, updateAdminSchema } from '@/middlewares/validators/admin';
import { adminService } from '@/services/admin.service';
import { requireAdmin } from '@/services/authorization';

/** Admin context exposed to clients; null when the identity has no active admin record. */
export function toAdminContext(admin: Admin | null) {
    if (!admin || admin.isDeleted) return null;
    return {
        id: admin.id,
        email: admin.email,
        isSuperAdmin: !!admin.isSuperAdmin,
        festID: admin.festID,
        allowedToModifyContent: !!admin.isSuperAdmin || !!admin.allowedToModifyContent,
    };
}

export const adminController = {
    getMe: async (c: Context) => {
        const admin = requireAdmin(getAuth(c));
        return sendSuccess(c, { admin: toAdminContext(admin) });
    },

    list: async (c: Context) => {
        const festID = c.req.query('festID') || undefined;
        const admins = await adminService.list({ festID });
        return sendSuccess(c, { admins });
    },

    getById: async (c: Context) => {
        const admin = await adminService.findById(getParam(c, 'id'));
        if (!admin) throw createError.notFound('Admin not found');
        return sendSuccess(c, { admin });
    },

    create: async (c: Context) => {
        const input = createAdminSchema.parse(await c.req.json());
        const admin = await adminService.provision(input);
        return sendCreated(c, { admin }, 'Admin provisioned successfully');
    },

    update: async (c: Context) => {
        const id = getParam(c, 'id');
        const patch = updateAdminSchema.parse(await c.req.json());

        const self = requireAdmin(getAuth(c));
        if (self.id === id && (patch.isSuperAdmin === false || patch.festID !== undefined)) {
            throw createError.badRequest('You cannot reduce your own super admin access');
        }

        const admin = await adminService.update(id, patch);
        return sendSuccess(c, { admin }, 'Admin updated successfully');
    },

    remove: async (c: Context) => {
        const id = getParam(c, 'id');
        const self = requireAdmin(getAuth(c));
        if (self.id === id) throw createError.badRequest('You cannot remove your own admin access');

        await adminService.remove(id);
        return sendNoContent(c);
    },

    /** Admins of one fest. Access is enforced by the `requireFestAdmin` route middleware. */
    listByFest: async (c: Context) => {
        const admins = await adminService.list({ festID: getParam(c, 'festId') });
        return sendSuccess(c, { admins });
    },
};
