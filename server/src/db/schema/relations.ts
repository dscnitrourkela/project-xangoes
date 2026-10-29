import { relations } from 'drizzle-orm';

import { clubs } from './club';
import { clubMembers } from './clubMember';
import { events } from './event';
import { eventRegistrations } from './eventRegistration';
import { fests } from './fest';
import { institutes } from './institute';
import { teams } from './team';
import { teamInvitations } from './teamInvitation';
import { transactions } from './transaction';
import { users } from './user';

export const userRelations = relations(users, ({ one, many }) => ({
    institute: one(institutes, {
        fields: [users.college],
        references: [institutes.id],
    }),
    fest: one(fests, {
        fields: [users.festID],
        references: [fests.id],
    }),
    transactions: many(transactions),
    eventRegistrations: many(eventRegistrations),
    leadTeams: many(teams),
    clubMemberships: many(clubMembers),
    sentInvitations: many(teamInvitations, { relationName: "invitedBy" }),
    receivedInvitations: many(teamInvitations, { relationName: "targetUser" }),
}));

export const festRelations = relations(fests, ({ many }) => ({
    transactions: many(transactions),
    teams: many(teams),
    users: many(users),
}));

export const clubRelations = relations(clubs, ({ many }) => ({
    events: many(events),
    teams: many(teams),
    members: many(clubMembers),
}));

export const eventRelations = relations(events, ({ one, many }) => ({
    club: one(clubs, {
        fields: [events.clubId],
        references: [clubs.id],
    }),
    registrations: many(eventRegistrations),
    teams: many(teams),
}));

export const instituteRelations = relations(institutes, ({ many }) => ({
    users: many(users),
}));

export const transactionRelations = relations(transactions, ({ one }) => ({
    user: one(users, {
        fields: [transactions.userID],
        references: [users.id],
    }),
    fest: one(fests, {
        fields: [transactions.festID],
        references: [fests.id],
    }),
}));

export const eventRegistrationRelations = relations(
    eventRegistrations,
    ({ one }) => ({
        user: one(users, {
            fields: [eventRegistrations.userID],
            references: [users.id],
        }),
        event: one(events, {
            fields: [eventRegistrations.eventID],
            references: [events.id],
        }),
        team: one(teams, {
            fields: [eventRegistrations.teamID],
            references: [teams.id],
        }),
    })
);

export const teamRelations = relations(teams, ({ one, many }) => ({
    teamLeadUser: one(users, {
        fields: [teams.teamLead],
        references: [users.id],
    }),
    lead: one(users, {
        fields: [teams.teamLead],
        references: [users.id],
    }),
    club: one(clubs, {
        fields: [teams.clubID],
        references: [clubs.id],
    }),
    fest: one(fests, {
        fields: [teams.festID],
        references: [fests.id],
    }),
    event: one(events, {
        fields: [teams.eventID],
        references: [events.id],
    }),
    registrations: many(eventRegistrations),
    invitations: many(teamInvitations),
}));

export const teamInvitationRelations = relations(teamInvitations, ({ one }) => ({
    team: one(teams, {
        fields: [teamInvitations.teamID],
        references: [teams.id],
    }),
    user: one(users, {
        fields: [teamInvitations.userID],
        references: [users.id],
        relationName: "targetUser",
    }),
    inviter: one(users, {
        fields: [teamInvitations.invitedBy],
        references: [users.id],
        relationName: "invitedBy",
    }),
}));

export const clubMemberRelations = relations(clubMembers, ({ one }) => ({
    club: one(clubs, {
        fields: [clubMembers.clubID],
        references: [clubs.id],
    }),
    user: one(users, {
        fields: [clubMembers.userID],
        references: [users.id],
    }),
}));
