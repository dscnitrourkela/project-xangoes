import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const teams = pgTable("teams", {
    id: varchar("id", { length: 255 }).primaryKey(),
    name: varchar("name", { length: 255 }), // Team/role name
    members: text("members").array(), // Array of user IDs except team lead
    festID: varchar("fest_id", { length: 255 }).notNull(), // References fest.id
    clubID: varchar("club_id", { length: 255 }).notNull(), // References club.id
    eventID: varchar("event_id", { length: 255 }).notNull(), // References event.id
    teamLead: varchar("team_lead", { length: 255 }), // References user.id
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
