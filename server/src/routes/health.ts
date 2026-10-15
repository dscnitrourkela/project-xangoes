import { Hono } from "hono";

import { healthController } from "@/controllers";
import { asyncHandler } from "@/middlewares";

const healthRouter = new Hono();

// GET /health - General application health
healthRouter.get("/", asyncHandler(healthController.getHealth));
healthRouter.get("/db", asyncHandler(healthController.getDbHealth));

// GET /health/db - Database connectivity health
healthRouter.get("/db", asyncHandler(healthController.getDbHealth));

export { healthRouter };
