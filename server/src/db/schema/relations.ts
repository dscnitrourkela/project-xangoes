import { relations } from "drizzle-orm";

import { clubs } from "./club";
import { events } from "./event";
import { eventRegistrations } from "./eventRegistration";
import { fests } from "./fest";
import { institutes } from "./institute";
import { teams } from "./team";
import { transactions } from "./transaction";
import { users } from "./user";

// User relations
export const userRelations = relations(users, ({ one, many }) => ({
    institute: one(institutes, {
        fields: [users.college],
        references: [institutes.id],
    }),
    referrer: one(users, {
        fields: [users.referredBy],
        references: [users.id],
    }),
    transactions: many(transactions),
    eventRegistrations: many(eventRegistrations),
    teamMemberships: many(teams),
}));

// Fest relations
export const festRelations = relations(fests, ({ many }) => ({
    transactions: many(transactions),
}));

// Club relations
export const clubRelations = relations(clubs, ({ many }) => ({
    events: many(events),
    teams: many(teams),
}));

// Event relations
export const eventRelations = relations(events, ({ one, many }) => ({
    club: one(clubs, {
        fields: [events.clubId],
        references: [clubs.id],
    }),
    registrations: many(eventRegistrations),
}));

// Institute relations
export const instituteRelations = relations(institutes, ({ many }) => ({
    users: many(users),
}));

// Transaction relations
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

// EventRegistration relations
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
    })
);

// Team relations
export const teamRelations = relations(teams, ({ one }) => ({
    user: one(users, {
        fields: [teams.userID],
        references: [users.id],
    }),
    club: one(clubs, {
        fields: [teams.clubID],
        references: [clubs.id],
    }),
}));
