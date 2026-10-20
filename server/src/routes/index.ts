import { Hono } from 'hono';

import { sendSuccess } from '@/middlewares';
import { healthService } from '@/services/health.service';

import { healthRouter } from './health';
import { testRouter } from './test';

export const routes = new Hono();

routes.route("/health", healthRouter);
routes.route("/test", testRouter);

routes.get("/", (c) => {
    return sendSuccess(c, healthService.about());
});
