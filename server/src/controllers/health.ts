import { Context } from 'hono';

import { sendSuccess } from '@/middlewares';
import { healthService } from '@/services/health.service';

const { getHealth } = healthService;
export const healthController = {
    getHealth: async (c: Context) => {
        return sendSuccess(c, getHealth());
    },
};
