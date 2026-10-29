import { Context } from "hono";
import { sendCreated, sendSuccess } from "@/middlewares";
import { teamService } from "@/services/team.service";
import { AuthUser } from "@/types";

export const teamController = {
    /**
     * POST /teams
     * Create a new team for an event
     */
    createTeam: async (c: Context) => {
        const user = c.get("user") as AuthUser;
        const body = await c.req.json();

        const result = await teamService.createTeam(user, body);
        return sendCreated(c, result, result.message);
    },

    /**
     * GET /teams/me
     * List all teams the current user belongs to (as lead or member)
     */
    getMyTeams: async (c: Context) => {
        const user = c.get("user") as AuthUser;
        const teams = await teamService.getUserTeams(user.id);
        return sendSuccess(c, teams, "User teams retrieved successfully");
    },

    /**
     * GET /teams/invitations/me
     * List pending invitations and join requests for current user
     */
    getMyInvitations: async (c: Context) => {
        const user = c.get("user") as AuthUser;
        const invitations = await teamService.getUserInvitations(user.id);
        return sendSuccess(c, invitations, "Invitations retrieved successfully");
    },

    /**
     * GET /teams/:id
     * Get team details with lead and member information
     */
    getTeamById: async (c: Context) => {
        const { id } = c.req.param();
        const team = await teamService.getTeamById(id);
        return sendSuccess(c, team, "Team details retrieved successfully");
    },

    /**
     * GET /teams/event/:eventId
     * List all teams registered for an event
     */
    getTeamsByEvent: async (c: Context) => {
        const { eventId } = c.req.param();
        const teams = await teamService.getTeamsByEvent(eventId);
        return sendSuccess(c, teams, "Event teams retrieved successfully");
    },

    /**
     * PUT /teams/:id
     * Update team name
     */
    updateTeam: async (c: Context) => {
        const user = c.get("user") as AuthUser;
        const { id } = c.req.param();
        const body = await c.req.json();

        const result = await teamService.updateTeam(id, user, body.name);
        return sendSuccess(c, result, result.message);
    },

    /**
     * POST /teams/:id/invite
     * Team lead invites a participant
     */
    inviteMember: async (c: Context) => {
        const user = c.get("user") as AuthUser;
        const { id } = c.req.param();
        const body = await c.req.json();

        const result = await teamService.inviteMember(id, user, body.userID, body.message);
        return sendCreated(c, result, result.message);
    },

    /**
     * POST /teams/:id/join
     * Participant sends a join-request
     */
    requestToJoin: async (c: Context) => {
        const user = c.get("user") as AuthUser;
        const { id } = c.req.param();
        const body = await c.req.json().catch(() => ({}));

        const result = await teamService.requestToJoinTeam(id, user, body.message);
        return sendCreated(c, result, result.message);
    },

    /**
     * POST /teams/invitations/:id/respond
     * Participant accepts or declines team invitation
     */
    respondToInvitation: async (c: Context) => {
        const user = c.get("user") as AuthUser;
        const { id } = c.req.param();
        const body = await c.req.json();

        const result = await teamService.respondToInvitation(id, user, body.action);
        return sendSuccess(c, result, result.message);
    },

    /**
     * POST /teams/join-requests/:id/respond
     * Team lead accepts or declines a participant's join request
     */
    respondToJoinRequest: async (c: Context) => {
        const user = c.get("user") as AuthUser;
        const { id } = c.req.param();
        const body = await c.req.json();

        const result = await teamService.respondToJoinRequest(id, user, body.action);
        return sendSuccess(c, result, result.message);
    },

    /**
     * DELETE /teams/:id/members/:userId
     * Team lead removes a member
     */
    removeMember: async (c: Context) => {
        const user = c.get("user") as AuthUser;
        const { id, userId } = c.req.param();

        const result = await teamService.removeMember(id, user, userId);
        return sendSuccess(c, result, result.message);
    },

    /**
     * POST /teams/:id/leave
     * Member voluntarily leaves team
     */
    leaveTeam: async (c: Context) => {
        const user = c.get("user") as AuthUser;
        const { id } = c.req.param();

        const result = await teamService.leaveTeam(id, user);
        return sendSuccess(c, result, result.message);
    },

    /**
     * POST /teams/:id/transfer-lead
     * Team lead transfers leadership to an existing member
     */
    transferLeadership: async (c: Context) => {
        const user = c.get("user") as AuthUser;
        const { id } = c.req.param();
        const body = await c.req.json();

        const result = await teamService.transferLeadership(id, user, body.newLeadId);
        return sendSuccess(c, result, result.message);
    },

    /**
     * DELETE /teams/:id
     * Team lead disbands the team
     */
    disbandTeam: async (c: Context) => {
        const user = c.get("user") as AuthUser;
        const { id } = c.req.param();

        const result = await teamService.disbandTeam(id, user);
        return sendSuccess(c, result, result.message);
    },
};
