import { Hono } from 'hono';

import { userController } from '@/controllers/user';
import { asyncHandler, authenticate, validateRequest } from '@/middlewares';
import { updateProfileSchema, userIdParamsSchema } from '@/middlewares/validators';

const usersRouter = new Hono();

usersRouter.use('*', authenticate);

// GET /users/me - Current user, profile completion status and admin context
usersRouter.get('/me', asyncHandler(userController.getMe));

// PATCH /users/me - Update own profile
usersRouter.patch(
    '/me',
    validateRequest(updateProfileSchema, 'body'),
    asyncHandler(userController.updateMe)
);

// GET /users/:id - Own profile or super admin
usersRouter.get(
    '/:id',
    validateRequest(userIdParamsSchema, 'params'),
    asyncHandler(userController.getById)
);

// PATCH /users/:id - Only the owner may update
usersRouter.patch(
    '/:id',
    validateRequest(userIdParamsSchema, 'params'),
    validateRequest(updateProfileSchema, 'body'),
    asyncHandler(userController.updateById)
);

export { usersRouter };
