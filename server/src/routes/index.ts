import { Hono } from "hono";

import { sendSuccess } from "@/middlewares";
import { healthService } from "@/services/health.service";

import { healthRouter } from "./health";
import { testRouter } from "./test";
import { storageRouter } from "./storage";
import { registrationRouter } from "./registration.routes";
import { teamRouter } from "./team.routes";
import { transactionRouter } from "./transaction.routes";
import { adminTransactionRouter } from "./adminTransaction.routes";
import { participantRouter } from "./participant.routes";

export const routes = new Hono();

// Core & Health routes
routes.route("/health", healthRouter);
routes.route("/test", testRouter);
routes.route("/storage", storageRouter);

// Participant Operations & Management routes (Puneet)
routes.route("/registrations", registrationRouter);
routes.route("/teams", teamRouter);
routes.route("/transactions", transactionRouter);
routes.route("/admin/transactions", adminTransactionRouter);
routes.route("/participant", participantRouter);

routes.get("/", (c) => {
    return sendSuccess(c, healthService.about());
});
