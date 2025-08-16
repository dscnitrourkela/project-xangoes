import {
    integer,
    pgEnum,
    pgTable,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";

export const festStatusEnum = pgEnum("fest_status", [
    "ACTIVE",
    "DRAFT",
    "EXPIRED",
]);
export const collegeStatusEnum = pgEnum("college_status", [
    "BLACKLISTED",
    "ALLOWED",
    "OTHER",
]);

export const fests = pgTable("fests", {
    id: varchar("id", { length: 255 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    tagline: varchar("tagline", { length: 500 }),
    logo: text("logo"),
    description: text("description"),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    status: festStatusEnum("status").default("ACTIVE"),
    registrationFee: integer("registration_fee"),
    collegeStatus: collegeStatusEnum("college_status").default("ALLOWED"),
    society: text("society").array(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Fest = typeof fests.$inferSelect;
export type NewFest = typeof fests.$inferInsert;
