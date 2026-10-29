import { Hono } from "hono";
import { participantController } from "@/controllers/participant.controller";
import { asyncHandler, requireAuth } from "@/middlewares";

export const participantRouter = new Hono();

// GET /participant/status - Consolidated participant status overview
participantRouter.get(
    "/status",
    requireAuth,
    asyncHandler(participantController.getStatus)
);
