import crypto from "crypto";
import { and, count, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db/schema";
import { eventRegistrations, EventRegistration } from "@/db/schema/eventRegistration";
import { events } from "@/db/schema/event";
import { fests } from "@/db/schema/fest";
import { institutes } from "@/db/schema/institute";
import { teams } from "@/db/schema/team";
import { transactions } from "@/db/schema/transaction";
import { users } from "@/db/schema/user";
import { AuthUser, RegistrationStatus } from "@/types";
import { createError } from "@/middlewares";

export interface CreateRegistrationInput {
    eventID: string;
    teamID?: string;
    transactionID?: string;
}

export interface GetRegistrationsFilter {
    page?: number;
    limit?: number;
    status?: RegistrationStatus;
    eventID?: string;
}

export class RegistrationService {
    /**
     * Create a new registration or return existing (idempotency)
     */
    public async createRegistration(user: AuthUser, input: CreateRegistrationInput) {
        const { eventID, teamID, transactionID } = input;

        // 1. Enforce Profile Requirements
        const missingFields: string[] = [];
        if (!user.name || user.name.trim() === "") missingFields.push("name");
        if (!user.mobile || user.mobile.trim() === "") missingFields.push("mobile");
        if (!user.college || user.college.trim() === "") missingFields.push("college");

        if (missingFields.length > 0) {
            throw createError.badRequest(
                `Incomplete profile. Please complete the following required fields before registering: ${missingFields.join(", ")}`,
                { missingFields }
            );
        }

        // 2. Fetch and Validate Event
        const [targetEvent] = await db
            .select()
            .from(events)
            .where(eq(events.id, eventID))
            .limit(1);

        if (!targetEvent) {
            throw createError.notFound(`Event with ID '${eventID}' not found.`);
        }

        // 3. Enforce Event Status
        if (targetEvent.status !== "ACTIVE") {
            throw createError.badRequest(
                `Registration unavailable. Event status is ${targetEvent.status || "INACTIVE"}. Only ACTIVE events accept registrations.`
            );
        }

        // 4. Enforce Registration Window
        const now = new Date();
        if (targetEvent.endDate && new Date(targetEvent.endDate) < now) {
            throw createError.badRequest("Registration closed. The event has already concluded.");
        }

        // 5. Enforce Institution Eligibility
        if (user.college) {
            const [institute] = await db
                .select()
                .from(institutes)
                .where(or(eq(institutes.id, user.college), eq(institutes.name, user.college)))
                .limit(1);

            if (institute && institute.collegeStatus === "BLACKLISTED") {
                throw createError.forbidden(
                    `Registration blocked: Institution '${institute.name}' is blacklisted from participation.`
                );
            }
        }

        // 6. Check Fest Fee and Status Requirements
        let festRecord: any = null;
        let requiresFee = false;
        let hasValidPayment = Boolean(user.hasPaid);

        if (user.festID) {
            const [foundFest] = await db
                .select()
                .from(fests)
                .where(eq(fests.id, user.festID))
                .limit(1);

            if (foundFest) {
                festRecord = foundFest;
                if (foundFest.collegeStatus === "BLACKLISTED") {
                    throw createError.forbidden(
                        `Participation not permitted for fest '${foundFest.name}' due to college restriction.`
                    );
                }

                if (foundFest.registrationFee && foundFest.registrationFee > 0) {
                    requiresFee = true;
                }
            }
        }

        // If not already marked as hasPaid, check if a verified transaction exists
        if (requiresFee && !hasValidPayment) {
            const verifiedTx = await db
                .select()
                .from(transactions)
                .where(
                    and(
                        eq(transactions.userID, user.id),
                        eq(transactions.isVerified, true),
                        inArray(transactions.type, ["REGISTRATION", "EVENT"])
                    )
                )
                .limit(1);

            if (verifiedTx.length > 0) {
                hasValidPayment = true;
            } else if (transactionID) {
                // If client provided a specific transaction ID, inspect it
                const [specificTx] = await db
                    .select()
                    .from(transactions)
                    .where(
                        and(
                            eq(transactions.id, transactionID),
                            eq(transactions.userID, user.id)
                        )
                    )
                    .limit(1);

                if (specificTx && specificTx.isVerified) {
                    hasValidPayment = true;
                }
            }
        }

        // 7. Validate Team Scope if registering as part of a team
        if (teamID) {
            const [team] = await db
                .select()
                .from(teams)
                .where(eq(teams.id, teamID))
                .limit(1);

            if (!team) {
                throw createError.notFound(`Team with ID '${teamID}' not found.`);
            }

            if (team.eventID !== eventID) {
                throw createError.badRequest(
                    `Team '${team.name}' is registered for a different event (${team.eventID}), not '${eventID}'.`
                );
            }

            const isLead = team.teamLead === user.id;
            const isMember = Array.isArray(team.members) && team.members.includes(user.id);
            if (!isLead && !isMember) {
                throw createError.forbidden(
                    `You are not a member of team '${team.name}'. Join the team before linking it to your registration.`
                );
            }
        }

        // 8. Enforce Capacity Limits
        // Check current registration count for this event
        const [{ count: regCount }] = await db
            .select({ count: count() })
            .from(eventRegistrations)
            .where(
                and(
                    eq(eventRegistrations.eventID, eventID),
                    or(
                        eq(eventRegistrations.status, "CONFIRMED"),
                        eq(eventRegistrations.status, "PENDING_PAYMENT")
                    )
                )
            );

        // Max capacity check (can be configured in event prizeMoney/metadata or default 500)
        const eventMeta = (targetEvent.prizeMoney as any) || {};
        const maxCapacity = eventMeta.maxCapacity || 500;
        if (Number(regCount) >= maxCapacity) {
            throw createError.badRequest(
                `Registration limit reached. This event has reached maximum capacity of ${maxCapacity} participants.`
            );
        }

        // 9. Prevent Duplicate Registrations / Safe Handling of Repeated Requests (Idempotency)
        const [existingRegistration] = await db
            .select()
            .from(eventRegistrations)
            .where(
                and(
                    eq(eventRegistrations.eventID, eventID),
                    eq(eventRegistrations.userID, user.id)
                )
            )
            .limit(1);

        const targetStatus: RegistrationStatus = requiresFee && !hasValidPayment ? "PENDING_PAYMENT" : "CONFIRMED";

        if (existingRegistration) {
            // If already active or pending payment, return existing registration safely without erroring or duplicating
            if (
                existingRegistration.status === "CONFIRMED" ||
                existingRegistration.status === "PENDING_PAYMENT"
            ) {
                return {
                    registration: existingRegistration,
                    isDuplicate: true,
                    message: "You are already registered for this event.",
                };
            }

            // If previously CANCELLED or REJECTED, reactivate registration inside transaction
            return await db.transaction(async (tx) => {
                const [updated] = await tx
                    .update(eventRegistrations)
                    .set({
                        status: targetStatus,
                        teamID: teamID || existingRegistration.teamID,
                        cancellationReason: null,
                        updatedAt: new Date(),
                    })
                    .where(eq(eventRegistrations.id, existingRegistration.id))
                    .returning();

                return {
                    registration: updated,
                    isReactivated: true,
                    message: "Registration reactivated successfully.",
                };
            });
        }

        // 10. Create New Registration in a Database Transaction
        const registrationId = crypto.randomUUID();

        return await db.transaction(async (tx) => {
            const [newRegistration] = await tx
                .insert(eventRegistrations)
                .values({
                    id: registrationId,
                    eventID,
                    userID: user.id,
                    teamID: teamID || null,
                    status: targetStatus,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .returning();

            return {
                registration: newRegistration,
                isNew: true,
                message:
                    targetStatus === "PENDING_PAYMENT"
                        ? "Registration created in PENDING_PAYMENT status. Please submit payment or evidence to confirm."
                        : "Registration confirmed successfully.",
            };
        });
    }

    /**
     * List registrations for a participant with pagination and filters
     */
    public async getUserRegistrations(userId: string, filter: GetRegistrationsFilter = {}) {
        const page = filter.page || 1;
        const limit = filter.limit || 10;
        const offset = (page - 1) * limit;

        const conditions = [eq(eventRegistrations.userID, userId)];
        if (filter.status) {
            conditions.push(eq(eventRegistrations.status, filter.status));
        }
        if (filter.eventID) {
            conditions.push(eq(eventRegistrations.eventID, filter.eventID));
        }

        const combinedCondition = and(...conditions);

        const [{ total }] = await db
            .select({ total: count() })
            .from(eventRegistrations)
            .where(combinedCondition);

        const registrations = await db
            .select({
                id: eventRegistrations.id,
                eventID: eventRegistrations.eventID,
                userID: eventRegistrations.userID,
                teamID: eventRegistrations.teamID,
                status: eventRegistrations.status,
                cancellationReason: eventRegistrations.cancellationReason,
                createdAt: eventRegistrations.createdAt,
                updatedAt: eventRegistrations.updatedAt,
                eventName: events.name,
                eventDescription: events.description,
                eventPoster: events.poster,
                startDate: events.startDate,
                endDate: events.endDate,
                location: events.location,
            })
            .from(eventRegistrations)
            .leftJoin(events, eq(eventRegistrations.eventID, events.id))
            .where(combinedCondition)
            .limit(limit)
            .offset(offset);

        return {
            items: registrations,
            total: Number(total),
            page,
            limit,
        };
    }

    /**
     * Retrieve registration details by ID
     */
    public async getRegistrationById(registrationId: string, userId?: string) {
        const [registration] = await db
            .select({
                id: eventRegistrations.id,
                eventID: eventRegistrations.eventID,
                userID: eventRegistrations.userID,
                teamID: eventRegistrations.teamID,
                status: eventRegistrations.status,
                cancellationReason: eventRegistrations.cancellationReason,
                createdAt: eventRegistrations.createdAt,
                updatedAt: eventRegistrations.updatedAt,
                event: {
                    id: events.id,
                    name: events.name,
                    subHeading: events.subHeading,
                    type: events.type,
                    poster: events.poster,
                    startDate: events.startDate,
                    endDate: events.endDate,
                    location: events.location,
                    status: events.status,
                },
                team: {
                    id: teams.id,
                    name: teams.name,
                    teamLead: teams.teamLead,
                    members: teams.members,
                },
            })
            .from(eventRegistrations)
            .leftJoin(events, eq(eventRegistrations.eventID, events.id))
            .leftJoin(teams, eq(eventRegistrations.teamID, teams.id))
            .where(eq(eventRegistrations.id, registrationId))
            .limit(1);

        if (!registration) {
            throw createError.notFound(`Registration with ID '${registrationId}' not found.`);
        }

        // If requested by participant, ensure they own this registration
        if (userId && registration.userID !== userId) {
            throw createError.forbidden("You do not have permission to view this registration.");
        }

        return registration;
    }

    /**
     * Cancel a registration where policy allows
     */
    public async cancelRegistration(registrationId: string, userId: string, reason?: string) {
        const [registration] = await db
            .select()
            .from(eventRegistrations)
            .where(eq(eventRegistrations.id, registrationId))
            .limit(1);

        if (!registration) {
            throw createError.notFound(`Registration with ID '${registrationId}' not found.`);
        }

        if (registration.userID !== userId) {
            throw createError.forbidden("You can only cancel your own registrations.");
        }

        if (registration.status === "CANCELLED") {
            throw createError.badRequest("This registration is already cancelled.");
        }

        // Enforce policy: cannot cancel if event has started
        const [event] = await db
            .select()
            .from(events)
            .where(eq(events.id, registration.eventID))
            .limit(1);

        if (event && event.startDate && new Date(event.startDate) <= new Date()) {
            throw createError.badRequest(
                "Cannot cancel registration: The event has already commenced or concluded."
            );
        }

        return await db.transaction(async (tx) => {
            // Update registration status
            const [cancelled] = await tx
                .update(eventRegistrations)
                .set({
                    status: "CANCELLED",
                    cancellationReason: reason || "Cancelled by participant",
                    updatedAt: new Date(),
                })
                .where(eq(eventRegistrations.id, registrationId))
                .returning();

            // If registered under a team, remove member from team
            if (registration.teamID) {
                const [team] = await tx
                    .select()
                    .from(teams)
                    .where(eq(teams.id, registration.teamID))
                    .limit(1);

                if (team) {
                    if (team.teamLead === userId) {
                        // Team lead cancelled - if there are other members, they cannot remain leadless without transfer
                        // Unlink team from this registration
                    } else if (Array.isArray(team.members)) {
                        const updatedMembers = team.members.filter((m) => m !== userId);
                        await tx
                            .update(teams)
                            .set({
                                members: updatedMembers,
                                updatedAt: new Date(),
                            })
                            .where(eq(teams.id, team.id));
                    }
                }
            }

            return {
                registration: cancelled,
                message: "Registration cancelled successfully.",
            };
        });
    }
}

export const registrationService = new RegistrationService();
