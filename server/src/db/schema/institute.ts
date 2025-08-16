import { pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const instituteCollegeStatusEnum = pgEnum("institute_college_status", [
    "BLACKLISTED",
    "ALLOWED",
    "OTHER",
]);

export const institutes = pgTable("institutes", {
    id: varchar("id", { length: 255 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description").notNull(),
    address: text("address").notNull(),
    logo: text("logo"),
    collegeStatus: instituteCollegeStatusEnum("college_status"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Institute = typeof institutes.$inferSelect;
export type NewInstitute = typeof institutes.$inferInsert;
