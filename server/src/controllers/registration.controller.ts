import { Context } from "hono";
import { sendCreated, sendPaginated, sendSuccess } from "@/middlewares";
import { registrationService } from "@/services/registration.service";
import { AuthUser } from "@/types";

export const registrationController = {
    /**
     * POST /registrations
     * Create a registration for an event (with optional team or payment reference)
     */
    createRegistration: async (c: Context) => {
        const user = c.get("user") as AuthUser;
        const body = await c.req.json();

        const result = await registrationService.createRegistration(user, body);

        if ("isDuplicate" in result && result.isDuplicate) {
            return sendSuccess(c, result, result.message, 200);
        }

        return sendCreated(c, result, result.message);
    },

    /**
     * GET /registrations
     * List current participant's registrations with pagination and filters
     */
    getMyRegistrations: async (c: Context) => {
        const user = c.get("user") as AuthUser;
        const query = c.req.query();

        const page = query.page ? parseInt(query.page, 10) : 1;
        const limit = query.limit ? parseInt(query.limit, 10) : 10;
        const status = query.status as any;
        const eventID = query.eventID;

        const result = await registrationService.getUserRegistrations(user.id, {
            page,
            limit,
            status,
            eventID,
        });

        return sendPaginated(
            c,
            result.items,
            result.page,
            result.limit,
            result.total,
            "Registrations retrieved successfully"
        );
    },

    /**
     * GET /registrations/:id
     * Retrieve registration details by ID
     */
    getRegistrationById: async (c: Context) => {
        const user = c.get("user") as AuthUser;
        const { id } = c.req.param();

        const registration = await registrationService.getRegistrationById(id, user.id);
        return sendSuccess(c, registration, "Registration retrieved successfully");
    },

    /**
     * POST /registrations/:id/cancel
     * Cancel an existing registration
     */
    cancelRegistration: async (c: Context) => {
        const user = c.get("user") as AuthUser;
        const { id } = c.req.param();
        const body = await c.req.json().catch(() => ({}));

        const result = await registrationService.cancelRegistration(id, user.id, body.reason);
        return sendSuccess(c, result, result.message);
    },
};
