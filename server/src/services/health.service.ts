import { checkDbConnection } from '@/db/schema';

/**
 * @description Health service to check the health of the server and database
 */
class HealthService {
    /**
     * @description Get the health status of the server
     * @returns {object} - The health status
     */
    public getHealth() {
        return {
            status: "ok",
            message: "Server is healthy and running!",
        };
    }

    public about() {
        return {
            name: "Xangoes API",
            version: "1.0.0",
            maintainer: "DSC NITR",
        };
    }

    /**
     * @description Check database connection health
     */
    public async getDatabaseHealth() {
        const check = await checkDbConnection();
        return {
            status: check.isHealthy ? "healthy" : "unhealthy",
            database: "postgresql",
            latencyMs: check.latencyMs,
            ...(check.error ? { error: check.error } : {}),
        };
    }
}

export const healthService = new HealthService();
