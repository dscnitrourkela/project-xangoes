import { pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const clubSubTypeEnum = pgEnum("club_sub_type", [
    "TECHNICAL",
    "CULTURAL",
    "SPORTS",
    "HACKATHON",
    "LITERARY",
    "FMS",
]);

export const clubs = pgTable("clubs", {
    id: varchar("id", { length: 255 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    subType: clubSubTypeEnum("sub_type").notNull(),
    description: text("description"),
    logo: text("logo"),
    events: text("events").array(), // Array of event objects
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Club = typeof clubs.$inferSelect;
export type NewClub = typeof clubs.$inferInsert;
