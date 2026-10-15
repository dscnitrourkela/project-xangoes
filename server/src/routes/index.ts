import { Hono } from 'hono';

import { sendSuccess } from '@/middlewares';
import { healthService } from '@/services/health.service';

import { healthRouter } from './health';
import { testRouter } from './test';
import { storageRouter } from './storage';

export const routes = new Hono();

routes.route('/health', healthRouter);
routes.route('/test', testRouter);
routes.route('/storage', storageRouter);

routes.get('/', (c) => {
    return sendSuccess(c, healthService.about());
});
