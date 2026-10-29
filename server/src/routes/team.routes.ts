import { Hono } from "hono";
import { teamController } from "@/controllers/team.controller";
import { asyncHandler, requireAuth, validateRequest } from "@/middlewares";
import {
    createTeamSchema,
    updateTeamSchema,
    inviteMemberSchema,
    joinRequestSchema,
    respondInvitationSchema,
    transferLeadSchema,
    teamParamsSchema,
    teamMemberParamsSchema,
    invitationParamsSchema,
} from "@/middlewares/validators";

export const teamRouter = new Hono();

// POST /teams - Create team
teamRouter.post(
    "/",
    validateRequest(createTeamSchema, "body"),
    requireAuth,
    asyncHandler(teamController.createTeam)
);

// GET /teams/me - List user's teams
teamRouter.get(
    "/me",
    requireAuth,
    asyncHandler(teamController.getMyTeams)
);

// GET /teams/invitations/me - List user's pending invitations
teamRouter.get(
    "/invitations/me",
    requireAuth,
    asyncHandler(teamController.getMyInvitations)
);

// GET /teams/event/:eventId - List teams for an event
teamRouter.get(
    "/event/:eventId",
    requireAuth,
    asyncHandler(teamController.getTeamsByEvent)
);

// GET /teams/:id - Get team details
teamRouter.get(
    "/:id",
    validateRequest(teamParamsSchema, "params"),
    requireAuth,
    asyncHandler(teamController.getTeamById)
);

// PUT /teams/:id - Update team name
teamRouter.put(
    "/:id",
    validateRequest(teamParamsSchema, "params"),
    validateRequest(updateTeamSchema, "body"),
    requireAuth,
    asyncHandler(teamController.updateTeam)
);

// DELETE /teams/:id - Disband team
teamRouter.delete(
    "/:id",
    validateRequest(teamParamsSchema, "params"),
    requireAuth,
    asyncHandler(teamController.disbandTeam)
);

// POST /teams/:id/invite - Invite member
teamRouter.post(
    "/:id/invite",
    validateRequest(teamParamsSchema, "params"),
    validateRequest(inviteMemberSchema, "body"),
    requireAuth,
    asyncHandler(teamController.inviteMember)
);

// POST /teams/:id/join - Request to join team
teamRouter.post(
    "/:id/join",
    validateRequest(teamParamsSchema, "params"),
    validateRequest(joinRequestSchema, "body"),
    requireAuth,
    asyncHandler(teamController.requestToJoin)
);

// POST /teams/invitations/:id/respond - Accept/Reject invitation
teamRouter.post(
    "/invitations/:id/respond",
    validateRequest(invitationParamsSchema, "params"),
    validateRequest(respondInvitationSchema, "body"),
    requireAuth,
    asyncHandler(teamController.respondToInvitation)
);

// POST /teams/join-requests/:id/respond - Accept/Reject join request
teamRouter.post(
    "/join-requests/:id/respond",
    validateRequest(invitationParamsSchema, "params"),
    validateRequest(respondInvitationSchema, "body"),
    requireAuth,
    asyncHandler(teamController.respondToJoinRequest)
);

// DELETE /teams/:id/members/:userId - Remove member
teamRouter.delete(
    "/:id/members/:userId",
    validateRequest(teamMemberParamsSchema, "params"),
    requireAuth,
    asyncHandler(teamController.removeMember)
);

// POST /teams/:id/leave - Leave team
teamRouter.post(
    "/:id/leave",
    validateRequest(teamParamsSchema, "params"),
    requireAuth,
    asyncHandler(teamController.leaveTeam)
);

// POST /teams/:id/transfer-lead - Transfer leadership
teamRouter.post(
    "/:id/transfer-lead",
    validateRequest(teamParamsSchema, "params"),
    validateRequest(transferLeadSchema, "body"),
    requireAuth,
    asyncHandler(teamController.transferLeadership)
);
