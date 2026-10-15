import {sendSuccess} from '@/middlewares';
import {healthService} from '@/services/health.service';
import {Context} from 'hono';

export const healthController = {
  getHealth: async (c: Context) => {
    return sendSuccess(c, healthService.getHealth());
  },

  getDbHealth: async (c: Context) => {
    const dbHealth = await healthService.getDatabaseHealth();
    const statusCode = dbHealth.status === 'healthy' ? 200 : 503;

    return sendSuccess(
        c, dbHealth,
        dbHealth.status === 'healthy' ? 'Database is healthy' :
                                        'Database connection error',
        statusCode);
  },
};
