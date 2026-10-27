import { Hono } from 'hono';

import { adminController } from '@/controllers/admin';
import {
    asyncHandler,
    authenticate,
    requireAdmin,
    requireSuperAdmin,
    validateRequest,
} from '@/middlewares';
import {
    adminIdParamsSchema,
    createAdminSchema,
    updateAdminSchema,
} from '@/middlewares/validators';

const adminsRouter = new Hono();

adminsRouter.use('*', authenticate);

// GET /admins/me - Current admin context (rejects non-admins and deleted admins)
adminsRouter.get('/me', requireAdmin, asyncHandler(adminController.getMe));

// Everything below is platform-wide admin management: super admins only
adminsRouter.get('/', requireSuperAdmin, asyncHandler(adminController.list));

adminsRouter.post(
    '/',
    requireSuperAdmin,
    validateRequest(createAdminSchema, 'body'),
    asyncHandler(adminController.create)
);

adminsRouter.get(
    '/:id',
    requireSuperAdmin,
    validateRequest(adminIdParamsSchema, 'params'),
    asyncHandler(adminController.getById)
);

adminsRouter.patch(
    '/:id',
    requireSuperAdmin,
    validateRequest(adminIdParamsSchema, 'params'),
    validateRequest(updateAdminSchema, 'body'),
    asyncHandler(adminController.update)
);

adminsRouter.delete(
    '/:id',
    requireSuperAdmin,
    validateRequest(adminIdParamsSchema, 'params'),
    asyncHandler(adminController.remove)
);

export { adminsRouter };
