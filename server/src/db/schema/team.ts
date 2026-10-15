import {
    index,
    pgTable,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";

import { clubs } from "./club";
import { events } from "./event";
import { fests } from "./fest";
import { users } from "./user";

export const teams = pgTable(
    "teams",
    {
        id: varchar("id", { length: 255 }).primaryKey(),
        name: varchar("name", { length: 255 }), // Team/role name
        members: text("members").array(), // Array of user IDs except team lead
        festID: varchar("fest_id", { length: 255 })
            .notNull()
            .references(() => fests.id, { onDelete: "restrict" }),
        clubID: varchar("club_id", { length: 255 })
            .notNull()
            .references(() => clubs.id, { onDelete: "restrict" }),
        eventID: varchar("event_id", { length: 255 })
            .notNull()
            .references(() => events.id, { onDelete: "restrict" }),
        teamLead: varchar("team_lead", { length: 255 }).references(
            () => users.id,
            { onDelete: "set null" }
        ),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow(),
    },
    (table) => [
        index("teams_fest_id_idx").on(table.festID),
        index("teams_club_id_idx").on(table.clubID),
        index("teams_event_id_idx").on(table.eventID),
        index("teams_team_lead_idx").on(table.teamLead),
    ]
);

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
