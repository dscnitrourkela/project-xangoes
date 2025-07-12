import { Hono } from 'hono';

import { testController } from '@/controllers/test';
import {
  asyncHandler,
  validateRequest,
} from '@/middlewares';
import {
  createUserSchema,
  getUserQuerySchema,
  updateUserSchema,
  userParamsSchema,
} from '@/middlewares/validators';

const testRouter = new Hono();

// GET /test - Get test information (no validation needed)
testRouter.get("/", asyncHandler(testController.getTestInfo));

// POST /test/users - Create user with body validation
testRouter.post(
    "/users",
    validateRequest(createUserSchema, "body"),
    asyncHandler(testController.createUser)
);

// GET /test/users - Get users with query parameter validation
testRouter.get(
    "/users",
    validateRequest(getUserQuerySchema, "query"),
    asyncHandler(testController.getUsers)
);

// GET /test/users/:id - Get user by ID with params validation
testRouter.get(
    "/users/:id",
    validateRequest(userParamsSchema, "params"),
    asyncHandler(testController.getUserById)
);

// PUT /test/users/:id - Update user with both params and body validation
testRouter.put(
    "/users/:id",
    validateRequest(userParamsSchema, "params"),
    validateRequest(updateUserSchema, "body"),
    asyncHandler(testController.updateUser)
);

export { testRouter };
