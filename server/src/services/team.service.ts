import crypto from "crypto";
import { and, eq, inArray, or, sql } from "drizzle-orm";
import { db } from "@/db/schema";
import { teams, Team } from "@/db/schema/team";
import { teamInvitations, TeamInvitation } from "@/db/schema/teamInvitation";
import { eventRegistrations } from "@/db/schema/eventRegistration";
import { events } from "@/db/schema/event";
import { users } from "@/db/schema/user";
import { AuthUser } from "@/types";
import { createError } from "@/middlewares";

export interface CreateTeamInput {
    name: string;
    eventID: string;
}

export class TeamService {
    private readonly DEFAULT_MAX_TEAM_SIZE = 5;

    /**
     * Helper to verify if user is already in a team for this event
     */
    private async checkUserAlreadyInTeam(userId: string, eventId: string): Promise<Team | null> {
        // Find if user is team lead or member of any team for this event
        const existingTeams = await db
            .select()
            .from(teams)
            .where(
                and(
                    eq(teams.eventID, eventId),
                    or(
                        eq(teams.teamLead, userId),
                        sql`${userId} = ANY(${teams.members})`
                    )
                )
            )
            .limit(1);

        return existingTeams.length > 0 ? existingTeams[0] : null;
    }

    /**
     * Create a new team for an event
     */
    public async createTeam(user: AuthUser, input: CreateTeamInput) {
        const { name, eventID } = input;

        // 1. Validate event exists and is ACTIVE
        const [targetEvent] = await db
            .select()
            .from(events)
            .where(eq(events.id, eventID))
            .limit(1);

        if (!targetEvent) {
            throw createError.notFound(`Event with ID '${eventID}' not found.`);
        }

        if (targetEvent.status !== "ACTIVE") {
            throw createError.badRequest("Cannot create a team: The event is not active.");
        }

        // 2. Prevent user from joining or creating multiple teams for the same event
        const existingTeam = await this.checkUserAlreadyInTeam(user.id, eventID);
        if (existingTeam) {
            throw createError.conflict(
                `You are already a member or leader of team '${existingTeam.name}' for this event.`
            );
        }

        const teamId = crypto.randomUUID();
        const clubID = targetEvent.clubId || "default_club";
        const festID = user.festID || "default_fest";

        // 3. Atomically create team and link/create event registration for team lead
        return await db.transaction(async (tx) => {
            const [newTeam] = await tx
                .insert(teams)
                .values({
                    id: teamId,
                    name: name.trim(),
                    members: [],
                    festID,
                    clubID,
                    eventID,
                    teamLead: user.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .returning();

            // Check if team lead already had an event registration
            const [existingReg] = await tx
                .select()
                .from(eventRegistrations)
                .where(
                    and(
                        eq(eventRegistrations.eventID, eventID),
                        eq(eventRegistrations.userID, user.id)
                    )
                )
                .limit(1);

            if (existingReg) {
                await tx
                    .update(eventRegistrations)
                    .set({
                        teamID: teamId,
                        status: "CONFIRMED",
                        updatedAt: new Date(),
                    })
                    .where(eq(eventRegistrations.id, existingReg.id));
            } else {
                await tx.insert(eventRegistrations).values({
                    id: crypto.randomUUID(),
                    eventID,
                    userID: user.id,
                    teamID: teamId,
                    status: "CONFIRMED",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }

            return {
                team: newTeam,
                message: `Team '${newTeam.name}' created successfully.`,
            };
        });
    }

    /**
     * Get team details with lead and member user profiles
     */
    public async getTeamById(teamId: string) {
        const [team] = await db
            .select()
            .from(teams)
            .where(eq(teams.id, teamId))
            .limit(1);

        if (!team) {
            throw createError.notFound(`Team with ID '${teamId}' not found.`);
        }

        // Fetch team lead details
        let teamLeadUser: any = null;
        if (team.teamLead) {
            const [lead] = await db
                .select({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    college: users.college,
                    photo: users.photo,
                })
                .from(users)
                .where(eq(users.id, team.teamLead))
                .limit(1);
            teamLeadUser = lead || null;
        }

        // Fetch member details
        let memberUsers: any[] = [];
        if (Array.isArray(team.members) && team.members.length > 0) {
            memberUsers = await db
                .select({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    college: users.college,
                    photo: users.photo,
                })
                .from(users)
                .where(inArray(users.id, team.members));
        }

        // Fetch event info
        const [event] = await db
            .select({
                id: events.id,
                name: events.name,
                type: events.type,
                poster: events.poster,
                startDate: events.startDate,
                endDate: events.endDate,
                status: events.status,
            })
            .from(events)
            .where(eq(events.id, team.eventID))
            .limit(1);

        return {
            ...team,
            teamLeadUser,
            memberUsers,
            totalMembers: (team.members?.length || 0) + (team.teamLead ? 1 : 0),
            event: event || null,
        };
    }

    /**
     * List all teams for a user (as lead or member)
     */
    public async getUserTeams(userId: string) {
        const userTeams = await db
            .select()
            .from(teams)
            .where(
                or(
                    eq(teams.teamLead, userId),
                    sql`${userId} = ANY(${teams.members})`
                )
            );

        return userTeams.map((team) => ({
            ...team,
            isLead: team.teamLead === userId,
            memberCount: (team.members?.length || 0) + (team.teamLead ? 1 : 0),
        }));
    }

    /**
     * List teams for a specific event
     */
    public async getTeamsByEvent(eventId: string) {
        return await db
            .select()
            .from(teams)
            .where(eq(teams.eventID, eventId));
    }

    /**
     * Team Lead invites a participant to join the team
     */
    public async inviteMember(teamId: string, leadUser: AuthUser, targetUserId: string, message?: string) {
        const [team] = await db
            .select()
            .from(teams)
            .where(eq(teams.id, teamId))
            .limit(1);

        if (!team) {
            throw createError.notFound(`Team with ID '${teamId}' not found.`);
        }

        // Only team lead can invite
        if (team.teamLead !== leadUser.id) {
            throw createError.forbidden("Only the team lead can invite new members.");
        }

        // Target cannot be lead or already a member
        if (targetUserId === team.teamLead || (team.members && team.members.includes(targetUserId))) {
            throw createError.badRequest("This user is already part of the team.");
        }

        // Verify target user exists
        const [targetUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, targetUserId))
            .limit(1);

        if (!targetUser) {
            throw createError.notFound(`Target user with ID '${targetUserId}' not found.`);
        }

        // Prevent target user from joining multiple teams for the same event
        const targetExistingTeam = await this.checkUserAlreadyInTeam(targetUserId, team.eventID);
        if (targetExistingTeam) {
            throw createError.conflict(
                `User '${targetUser.name || targetUserId}' is already part of another team ('${targetExistingTeam.name}') for this event.`
            );
        }

        // Team capacity check
        const currentSize = (team.members?.length || 0) + 1;
        if (currentSize >= this.DEFAULT_MAX_TEAM_SIZE) {
            throw createError.badRequest(
                `Team has reached maximum capacity of ${this.DEFAULT_MAX_TEAM_SIZE} members.`
            );
        }

        // Check for existing pending invitation
        const [existingInvite] = await db
            .select()
            .from(teamInvitations)
            .where(
                and(
                    eq(teamInvitations.teamID, teamId),
                    eq(teamInvitations.userID, targetUserId),
                    eq(teamInvitations.status, "PENDING")
                )
            )
            .limit(1);

        if (existingInvite) {
            throw createError.conflict("A pending invitation has already been sent to this user.");
        }

        const invitationId = crypto.randomUUID();
        const [invitation] = await db
            .insert(teamInvitations)
            .values({
                id: invitationId,
                teamID: teamId,
                userID: targetUserId,
                invitedBy: leadUser.id,
                type: "INVITATION",
                status: "PENDING",
                message: message || `Invitation from ${leadUser.name || "Team Lead"} to join ${team.name}`,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        return {
            invitation,
            message: `Invitation sent to ${targetUser.name || targetUser.email}.`,
        };
    }

    /**
     * Participant sends a join-request to a team
     */
    public async requestToJoinTeam(teamId: string, user: AuthUser, message?: string) {
        const [team] = await db
            .select()
            .from(teams)
            .where(eq(teams.id, teamId))
            .limit(1);

        if (!team) {
            throw createError.notFound(`Team with ID '${teamId}' not found.`);
        }

        // Check if already in this team
        if (team.teamLead === user.id || (team.members && team.members.includes(user.id))) {
            throw createError.badRequest("You are already part of this team.");
        }

        // Check if user is already in another team for this event
        const existingTeam = await this.checkUserAlreadyInTeam(user.id, team.eventID);
        if (existingTeam) {
            throw createError.conflict(
                `You are already a member of team '${existingTeam.name}' for this event.`
            );
        }

        // Team capacity check
        const currentSize = (team.members?.length || 0) + 1;
        if (currentSize >= this.DEFAULT_MAX_TEAM_SIZE) {
            throw createError.badRequest(`This team has reached maximum capacity.`);
        }

        // Check for existing pending request
        const [existingRequest] = await db
            .select()
            .from(teamInvitations)
            .where(
                and(
                    eq(teamInvitations.teamID, teamId),
                    eq(teamInvitations.userID, user.id),
                    eq(teamInvitations.status, "PENDING")
                )
            )
            .limit(1);

        if (existingRequest) {
            throw createError.conflict("You have already sent a pending request to this team.");
        }

        const requestId = crypto.randomUUID();
        const [joinRequest] = await db
            .insert(teamInvitations)
            .values({
                id: requestId,
                teamID: teamId,
                userID: user.id,
                invitedBy: user.id,
                type: "JOIN_REQUEST",
                status: "PENDING",
                message: message || `${user.name || user.email} requested to join the team`,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        return {
            joinRequest,
            message: `Join request submitted to team '${team.name}'.`,
        };
    }

    /**
     * Respond to a team invitation (Called by invited participant)
     */
    public async respondToInvitation(invitationId: string, user: AuthUser, action: "ACCEPT" | "REJECT") {
        const [invitation] = await db
            .select()
            .from(teamInvitations)
            .where(eq(teamInvitations.id, invitationId))
            .limit(1);

        if (!invitation) {
            throw createError.notFound(`Invitation with ID '${invitationId}' not found.`);
        }

        if (invitation.userID !== user.id) {
            throw createError.forbidden("You can only respond to invitations sent directly to you.");
        }

        if (invitation.type !== "INVITATION") {
            throw createError.badRequest("This record is a join request, not an invitation.");
        }

        if (invitation.status !== "PENDING") {
            throw createError.badRequest(`Invitation has already been ${invitation.status.toLowerCase()}.`);
        }

        if (action === "REJECT") {
            const [updated] = await db
                .update(teamInvitations)
                .set({ status: "REJECTED", updatedAt: new Date() })
                .where(eq(teamInvitations.id, invitationId))
                .returning();

            return { invitation: updated, message: "Invitation declined." };
        }

        // ACCEPT workflow in a database transaction
        return await db.transaction(async (tx) => {
            const [team] = await tx
                .select()
                .from(teams)
                .where(eq(teams.id, invitation.teamID))
                .limit(1);

            if (!team) {
                throw createError.notFound("The team no longer exists.");
            }

            // Verify team capacity
            const currentMembers = Array.isArray(team.members) ? team.members : [];
            if (currentMembers.length + 1 >= this.DEFAULT_MAX_TEAM_SIZE) {
                throw createError.badRequest("The team has reached its maximum member limit.");
            }

            // Verify user is not in another team for this event
            const existingTeam = await this.checkUserAlreadyInTeam(user.id, team.eventID);
            if (existingTeam && existingTeam.id !== team.id) {
                throw createError.conflict(
                    `You are already in team '${existingTeam.name}' for this event. Leave that team first.`
                );
            }

            // Add user to team members
            const updatedMembers = [...currentMembers, user.id];
            await tx
                .update(teams)
                .set({ members: updatedMembers, updatedAt: new Date() })
                .where(eq(teams.id, team.id));

            // Mark invitation accepted
            const [acceptedInvite] = await tx
                .update(teamInvitations)
                .set({ status: "ACCEPTED", updatedAt: new Date() })
                .where(eq(teamInvitations.id, invitationId))
                .returning();

            // Link or create event registration
            const [existingReg] = await tx
                .select()
                .from(eventRegistrations)
                .where(
                    and(
                        eq(eventRegistrations.eventID, team.eventID),
                        eq(eventRegistrations.userID, user.id)
                    )
                )
                .limit(1);

            if (existingReg) {
                await tx
                    .update(eventRegistrations)
                    .set({
                        teamID: team.id,
                        status: "CONFIRMED",
                        updatedAt: new Date(),
                    })
                    .where(eq(eventRegistrations.id, existingReg.id));
            } else {
                await tx.insert(eventRegistrations).values({
                    id: crypto.randomUUID(),
                    eventID: team.eventID,
                    userID: user.id,
                    teamID: team.id,
                    status: "CONFIRMED",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }

            return {
                invitation: acceptedInvite,
                message: `You have successfully joined team '${team.name}'.`,
            };
        });
    }

    /**
     * Respond to a join request (Called by team lead)
     */
    public async respondToJoinRequest(requestId: string, leadUser: AuthUser, action: "ACCEPT" | "REJECT") {
        const [joinRequest] = await db
            .select()
            .from(teamInvitations)
            .where(eq(teamInvitations.id, requestId))
            .limit(1);

        if (!joinRequest) {
            throw createError.notFound(`Join request with ID '${requestId}' not found.`);
        }

        if (joinRequest.type !== "JOIN_REQUEST") {
            throw createError.badRequest("This record is an invitation, not a join request.");
        }

        if (joinRequest.status !== "PENDING") {
            throw createError.badRequest(`Join request has already been ${joinRequest.status.toLowerCase()}.`);
        }

        const [team] = await db
            .select()
            .from(teams)
            .where(eq(teams.id, joinRequest.teamID))
            .limit(1);

        if (!team) {
            throw createError.notFound("The team no longer exists.");
        }

        if (team.teamLead !== leadUser.id) {
            throw createError.forbidden("Only the team lead can accept or reject join requests.");
        }

        if (action === "REJECT") {
            const [updated] = await db
                .update(teamInvitations)
                .set({ status: "REJECTED", updatedAt: new Date() })
                .where(eq(teamInvitations.id, requestId))
                .returning();

            return { joinRequest: updated, message: "Join request rejected." };
        }

        // ACCEPT workflow in a database transaction
        return await db.transaction(async (tx) => {
            const currentMembers = Array.isArray(team.members) ? team.members : [];
            if (currentMembers.length + 1 >= this.DEFAULT_MAX_TEAM_SIZE) {
                throw createError.badRequest("The team has reached maximum capacity.");
            }

            // Verify user hasn't joined another team
            const existingTeam = await this.checkUserAlreadyInTeam(joinRequest.userID, team.eventID);
            if (existingTeam && existingTeam.id !== team.id) {
                throw createError.conflict("User is already in another team for this event.");
            }

            const updatedMembers = [...currentMembers, joinRequest.userID];
            await tx
                .update(teams)
                .set({ members: updatedMembers, updatedAt: new Date() })
                .where(eq(teams.id, team.id));

            const [acceptedRequest] = await tx
                .update(teamInvitations)
                .set({ status: "ACCEPTED", updatedAt: new Date() })
                .where(eq(teamInvitations.id, requestId))
                .returning();

            // Link or create event registration for the user
            const [existingReg] = await tx
                .select()
                .from(eventRegistrations)
                .where(
                    and(
                        eq(eventRegistrations.eventID, team.eventID),
                        eq(eventRegistrations.userID, joinRequest.userID)
                    )
                )
                .limit(1);

            if (existingReg) {
                await tx
                    .update(eventRegistrations)
                    .set({
                        teamID: team.id,
                        status: "CONFIRMED",
                        updatedAt: new Date(),
                    })
                    .where(eq(eventRegistrations.id, existingReg.id));
            } else {
                await tx.insert(eventRegistrations).values({
                    id: crypto.randomUUID(),
                    eventID: team.eventID,
                    userID: joinRequest.userID,
                    teamID: team.id,
                    status: "CONFIRMED",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }

            return {
                joinRequest: acceptedRequest,
                message: "Join request accepted and member added to team.",
            };
        });
    }

    /**
     * Team Lead removes a member from the team
     */
    public async removeMember(teamId: string, leadUser: AuthUser, memberIdToRemove: string) {
        const [team] = await db
            .select()
            .from(teams)
            .where(eq(teams.id, teamId))
            .limit(1);

        if (!team) {
            throw createError.notFound(`Team with ID '${teamId}' not found.`);
        }

        if (team.teamLead !== leadUser.id) {
            throw createError.forbidden("Only the team lead can remove members from the team.");
        }

        if (team.teamLead === memberIdToRemove) {
            throw createError.badRequest(
                "Team lead cannot be removed as a member. Transfer leadership or disband the team."
            );
        }

        const members = Array.isArray(team.members) ? team.members : [];
        if (!members.includes(memberIdToRemove)) {
            throw createError.notFound("The specified user is not a member of this team.");
        }

        return await db.transaction(async (tx) => {
            const updatedMembers = members.filter((m) => m !== memberIdToRemove);
            const [updatedTeam] = await tx
                .update(teams)
                .set({ members: updatedMembers, updatedAt: new Date() })
                .where(eq(teams.id, teamId))
                .returning();

            // Unlink registration teamID
            await tx
                .update(eventRegistrations)
                .set({ teamID: null, updatedAt: new Date() })
                .where(
                    and(
                        eq(eventRegistrations.eventID, team.eventID),
                        eq(eventRegistrations.userID, memberIdToRemove)
                    )
                );

            return {
                team: updatedTeam,
                message: "Member removed from team successfully.",
            };
        });
    }

    /**
     * Member voluntarily leaves the team
     */
    public async leaveTeam(teamId: string, user: AuthUser) {
        const [team] = await db
            .select()
            .from(teams)
            .where(eq(teams.id, teamId))
            .limit(1);

        if (!team) {
            throw createError.notFound(`Team with ID '${teamId}' not found.`);
        }

        if (team.teamLead === user.id) {
            throw createError.badRequest(
                "Team lead cannot leave the team. Transfer leadership first or disband the team."
            );
        }

        const members = Array.isArray(team.members) ? team.members : [];
        if (!members.includes(user.id)) {
            throw createError.badRequest("You are not a member of this team.");
        }

        return await db.transaction(async (tx) => {
            const updatedMembers = members.filter((m) => m !== user.id);
            const [updatedTeam] = await tx
                .update(teams)
                .set({ members: updatedMembers, updatedAt: new Date() })
                .where(eq(teams.id, teamId))
                .returning();

            // Unlink registration teamID
            await tx
                .update(eventRegistrations)
                .set({ teamID: null, updatedAt: new Date() })
                .where(
                    and(
                        eq(eventRegistrations.eventID, team.eventID),
                        eq(eventRegistrations.userID, user.id)
                    )
                );

            return {
                team: updatedTeam,
                message: `You have left team '${team.name}'.`,
            };
        });
    }

    /**
     * Team Lead transfers leadership to an existing member
     */
    public async transferLeadership(teamId: string, currentLead: AuthUser, newLeadId: string) {
        const [team] = await db
            .select()
            .from(teams)
            .where(eq(teams.id, teamId))
            .limit(1);

        if (!team) {
            throw createError.notFound(`Team with ID '${teamId}' not found.`);
        }

        if (team.teamLead !== currentLead.id) {
            throw createError.forbidden("Only the current team lead can transfer leadership.");
        }

        if (team.teamLead === newLeadId) {
            throw createError.badRequest("User is already the team lead.");
        }

        const members = Array.isArray(team.members) ? team.members : [];
        if (!members.includes(newLeadId)) {
            throw createError.badRequest("New lead must already be an existing member of the team.");
        }

        return await db.transaction(async (tx) => {
            // New members list: remove new lead, add former lead
            const updatedMembers = members.filter((m) => m !== newLeadId);
            updatedMembers.push(currentLead.id);

            const [updatedTeam] = await tx
                .update(teams)
                .set({
                    teamLead: newLeadId,
                    members: updatedMembers,
                    updatedAt: new Date(),
                })
                .where(eq(teams.id, teamId))
                .returning();

            return {
                team: updatedTeam,
                message: "Team leadership transferred successfully.",
            };
        });
    }

    /**
     * Update team name
     */
    public async updateTeam(teamId: string, leadUser: AuthUser, name: string) {
        const [team] = await db
            .select()
            .from(teams)
            .where(eq(teams.id, teamId))
            .limit(1);

        if (!team) {
            throw createError.notFound(`Team with ID '${teamId}' not found.`);
        }

        if (team.teamLead !== leadUser.id) {
            throw createError.forbidden("Only the team lead can edit the team details.");
        }

        const [updatedTeam] = await db
            .update(teams)
            .set({ name: name.trim(), updatedAt: new Date() })
            .where(eq(teams.id, teamId))
            .returning();

        return {
            team: updatedTeam,
            message: "Team name updated successfully.",
        };
    }

    /**
     * Disband and delete team
     */
    public async disbandTeam(teamId: string, leadUser: AuthUser) {
        const [team] = await db
            .select()
            .from(teams)
            .where(eq(teams.id, teamId))
            .limit(1);

        if (!team) {
            throw createError.notFound(`Team with ID '${teamId}' not found.`);
        }

        if (team.teamLead !== leadUser.id) {
            throw createError.forbidden("Only the team lead can disband the team.");
        }

        return await db.transaction(async (tx) => {
            // Unlink all team members' registrations
            await tx
                .update(eventRegistrations)
                .set({ teamID: null, updatedAt: new Date() })
                .where(eq(eventRegistrations.teamID, teamId));

            // Cancel any pending invitations/requests
            await tx
                .update(teamInvitations)
                .set({ status: "CANCELLED", updatedAt: new Date() })
                .where(eq(teamInvitations.teamID, teamId));

            // Delete the team
            await tx.delete(teams).where(eq(teams.id, teamId));

            return {
                message: `Team '${team.name}' has been disbanded.`,
            };
        });
    }

    /**
     * List user's pending invitations and join requests
     */
    public async getUserInvitations(userId: string) {
        const invitations = await db
            .select({
                id: teamInvitations.id,
                teamID: teamInvitations.teamID,
                userID: teamInvitations.userID,
                invitedBy: teamInvitations.invitedBy,
                type: teamInvitations.type,
                status: teamInvitations.status,
                message: teamInvitations.message,
                createdAt: teamInvitations.createdAt,
                teamName: teams.name,
                teamEventId: teams.eventID,
            })
            .from(teamInvitations)
            .leftJoin(teams, eq(teamInvitations.teamID, teams.id))
            .where(
                and(
                    eq(teamInvitations.userID, userId),
                    eq(teamInvitations.status, "PENDING")
                )
            );

        return invitations;
    }
}

export const teamService = new TeamService();
