import {
    index,
    pgTable,
    timestamp,
    uniqueIndex,
    varchar,
} from "drizzle-orm/pg-core";

import { events } from "./event";
import { teams } from "./team";
import { users } from "./user";

export const eventRegistrations = pgTable(
    "event_registrations",
    {
        id: varchar("id", { length: 255 }).primaryKey(),
        eventID: varchar("event_id", { length: 255 })
            .notNull()
            .references(() => events.id, { onDelete: "restrict" }),
        userID: varchar("user_id", { length: 255 })
            .notNull()
            .references(() => users.id, { onDelete: "restrict" }),
        teamID: varchar("team_id", { length: 255 }).references(() => teams.id, {
            onDelete: "set null",
        }),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("event_registrations_user_event_unique").on(
            table.userID,
            table.eventID
        ),
        index("event_registrations_event_id_idx").on(table.eventID),
        index("event_registrations_user_id_idx").on(table.userID),
        index("event_registrations_team_id_idx").on(table.teamID),
    ]
);

export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type NewEventRegistration = typeof eventRegistrations.$inferInsert;
