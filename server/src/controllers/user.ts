import { Context } from 'hono';

import { createError, getAuth, getParam, sendSuccess } from '@/middlewares';
import { updateProfileSchema } from '@/middlewares/validators/user';
import { requireParticipant, requireSelf, requireSelfOrSuperAdmin } from '@/services/authorization';
import { toUserProfile, userService } from '@/services/user.service';

import { toAdminContext } from './admin';

async function updateProfile(c: Context, userId: string) {
    const patch = updateProfileSchema.parse(await c.req.json());
    const updated = await userService.updateProfile(userId, patch);
    return sendSuccess(c, { user: toUserProfile(updated) }, 'Profile updated successfully');
}

export const userController = {
    getMe: async (c: Context) => {
        const auth = getAuth(c);
        const user = requireParticipant(auth);
        return sendSuccess(c, { user: toUserProfile(user), admin: toAdminContext(auth.admin) });
    },

    updateMe: async (c: Context) => {
        const user = requireParticipant(getAuth(c));
        return updateProfile(c, user.id);
    },

    getById: async (c: Context) => {
        const id = getParam(c, 'id');
        requireSelfOrSuperAdmin(getAuth(c), id);

        const user = await userService.findById(id);
        if (!user) throw createError.notFound('User not found');
        return sendSuccess(c, { user: toUserProfile(user) });
    },

    /** Users can only update their own record; any other id is rejected before touching the DB. */
    updateById: async (c: Context) => {
        const id = getParam(c, 'id');
        requireSelf(getAuth(c), id);
        return updateProfile(c, id);
    },
};
