import { Hono } from 'hono';

import { sendSuccess } from '@/middlewares';
import { healthService } from '@/services/health.service';

import { healthRouter } from './health';
import { testRouter } from './test';
import { storageRouter } from './storage';
import { authRouter } from './auth';
import { usersRouter } from './users';
import { adminsRouter } from './admins';
import { festsRouter } from './fests';

export const routes = new Hono();

routes.route('/health', healthRouter);
routes.route('/test', testRouter);
routes.route('/storage', storageRouter);
routes.route('/auth', authRouter);
routes.route('/users', usersRouter);
routes.route('/admins', adminsRouter);
routes.route('/fests', festsRouter);

routes.get('/', (c) => {
    return sendSuccess(c, healthService.about());
});
