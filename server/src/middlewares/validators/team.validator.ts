import { z } from "zod";

export const createTeamSchema = z.object({
    name: z.string().min(2, "Team name must be at least 2 characters").max(100, "Team name too long"),
    eventID: z.string().min(1, "Event ID is required"),
});

export const updateTeamSchema = z.object({
    name: z.string().min(2, "Team name must be at least 2 characters").max(100, "Team name too long"),
});

export const inviteMemberSchema = z.object({
    userID: z.string().min(1, "User ID is required"),
    message: z.string().max(255).optional(),
});

export const joinRequestSchema = z.object({
    message: z.string().max(255).optional(),
});

export const respondInvitationSchema = z.object({
    action: z.enum(["ACCEPT", "REJECT"], {
        error: "Action must be ACCEPT or REJECT",
    }),
});

export const transferLeadSchema = z.object({
    newLeadId: z.string().min(1, "New team lead user ID is required"),
});

export const teamParamsSchema = z.object({
    id: z.string().min(1, "Team ID is required"),
});

export const teamMemberParamsSchema = z.object({
    id: z.string().min(1, "Team ID is required"),
    userId: z.string().min(1, "User ID is required"),
});

export const invitationParamsSchema = z.object({
    id: z.string().min(1, "Invitation ID is required"),
});
