import { Hono } from 'hono';

import { authController } from '@/controllers/auth';
import { asyncHandler, authenticate } from '@/middlewares';

const authRouter = new Hono();

// POST /auth/session - Provision the user on first sign-in; returns profile + admin context
authRouter.post('/session', authenticate, asyncHandler(authController.createSession));

export { authRouter };
