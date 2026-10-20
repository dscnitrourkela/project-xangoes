import {
    boolean,
    integer,
    json,
    pgEnum,
    pgTable,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";

export const eventStatusEnum = pgEnum("event_status", [
    "ACTIVE",
    "DRAFT",
    "EXPIRED",
]);
export const repeatDayEnum = pgEnum("repeat_day", [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
]);

export const events = pgTable("events", {
    id: varchar("id", { length: 255 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    subHeading: varchar("sub_heading", { length: 500 }),
    prizeMoney: json("prize_money"), // JSON object for prize structure
    type: varchar("type", { length: 100 }),
    description: text("description").notNull(),
    poster: text("poster").notNull(),
    rules: text("rules").array().notNull(), // Array of rule strings
    location: varchar("location", { length: 255 }),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),
    clubId: varchar("club_id", { length: 255 }), // References club.id
    contact: text("contact").array().notNull(), // Array of contact phone numbers
    pocID: text("poc_id").array().notNull(), // Array of point of contact user IDs
    weekly: boolean("weekly").default(false),
    repeatDay: repeatDayEnum("repeat_day"),
    priority: integer("priority").default(1),
    status: eventStatusEnum("status").default("DRAFT"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
