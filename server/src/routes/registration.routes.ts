import { Hono } from "hono";
import { registrationController } from "@/controllers/registration.controller";
import { asyncHandler, requireAuth, validateRequest } from "@/middlewares";
import {
    createRegistrationSchema,
    cancelRegistrationSchema,
    getRegistrationsQuerySchema,
    registrationParamsSchema,
} from "@/middlewares/validators";

export const registrationRouter = new Hono();

// POST /registrations - Create registration
registrationRouter.post(
    "/",
    validateRequest(createRegistrationSchema, "body"),
    requireAuth,
    asyncHandler(registrationController.createRegistration)
);

// GET /registrations - List participant's registrations
registrationRouter.get(
    "/",
    validateRequest(getRegistrationsQuerySchema, "query"),
    requireAuth,
    asyncHandler(registrationController.getMyRegistrations)
);

// GET /registrations/:id - Retrieve registration details
registrationRouter.get(
    "/:id",
    validateRequest(registrationParamsSchema, "params"),
    requireAuth,
    asyncHandler(registrationController.getRegistrationById)
);

// POST /registrations/:id/cancel - Cancel registration
registrationRouter.post(
    "/:id/cancel",
    validateRequest(registrationParamsSchema, "params"),
    validateRequest(cancelRegistrationSchema, "body"),
    requireAuth,
    asyncHandler(registrationController.cancelRegistration)
);
