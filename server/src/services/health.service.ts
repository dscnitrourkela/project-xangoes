
import {checkDbConnection} from '@/db/schema';
import {CustomError} from '@/middlewares';

/**
 * @description Health service to check the health of the server and database
 */
class HealthService {
  public getHealth() {
    return {
      status: 'ok',
      message: 'Server is healthy and running!',
    };
  }

  public async getDbHealth() {
    const check = await checkDbConnection();

    if (!check.isHealthy) {
      throw new CustomError('Database is unavailable', 503, check.error);
    }

    return {
      status: 'ok',
      database: 'connected',
      latencyMs: check.latencyMs,
    };
  }

  public about() {
    return {
      name: 'Xangoes API',
      version: '1.0.0',
      maintainer: 'DSC NITR',
    };
  }

  public async getDatabaseHealth() {
    const check = await checkDbConnection();

    return {
      status: check.isHealthy ? 'healthy' : 'unhealthy',
      database: 'postgresql',
      latencyMs: check.latencyMs,
      ...(check.error ? {error: check.error} : {}),
    };
  }
}

export const healthService = new HealthService();
