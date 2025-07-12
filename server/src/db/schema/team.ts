import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const teams = pgTable("teams", {
    id: varchar("id", { length: 255 }).primaryKey(),
    team: varchar("team", { length: 255 }), // Team/role name
    userID: varchar("user_id", { length: 255 }).notNull(), // References user.id
    clubID: varchar("club_id", { length: 255 }).notNull(), // References club.id
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
