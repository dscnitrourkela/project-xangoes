/**
 * @description Health service to check the health of the server
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
}

export const healthService = new HealthService();
