import { Context } from "hono";
import { sendSuccess } from "@/middlewares";
import { registrationService } from "@/services/registration.service";
import { teamService } from "@/services/team.service";
import { transactionService } from "@/services/transaction.service";
import { AuthUser } from "@/types";

export const participantController = {
    /**
     * GET /participant/status
     * Consolidated overview of participant's registrations, team memberships, and transaction statuses
     */
    getStatus: async (c: Context) => {
        const user = c.get("user") as AuthUser;

        const [registrationsResult, teams, transactions] = await Promise.all([
            registrationService.getUserRegistrations(user.id, { limit: 50 }),
            teamService.getUserTeams(user.id),
            transactionService.getUserTransactions(user.id),
        ]);

        return sendSuccess(
            c,
            {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    mobile: user.mobile,
                    college: user.college,
                    hasPaid: user.hasPaid,
                },
                registrations: registrationsResult.items,
                teams,
                transactions,
                summary: {
                    totalRegistrations: registrationsResult.total,
                    activeTeamsCount: teams.length,
                    totalTransactions: transactions.length,
                    hasVerifiedPayment: transactions.some((t) => t.isVerified),
                },
            },
            "Participant status retrieved successfully"
        );
    },
};
