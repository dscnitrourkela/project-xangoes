import { Context } from 'hono';

import { getAuth, sendCreated, sendSuccess } from '@/middlewares';
import { userService, toUserProfile } from '@/services/user.service';

import { toAdminContext } from './admin';

export const authController = {
    /**
     * Called by the client after every successful Firebase sign-in. Creates the user
     * record on first sign-in and reports profile completion and admin context.
     */
    createSession: async (c: Context) => {
        const auth = getAuth(c);
        const { user, created } = await userService.provisionFromToken(auth.firebase);
        const data = {
            user: toUserProfile(user),
            admin: toAdminContext(auth.admin),
        };

        return created
            ? sendCreated(c, data, 'Account created successfully')
            : sendSuccess(c, data, 'Signed in successfully');
    },
};
