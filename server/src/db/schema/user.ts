import {
    boolean,
    index,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";

import { fests } from "./fest";
import { institutes } from "./institute";
import type { UserExtraDetails } from "./userExtraDetails";

export const genderEnum = pgEnum("gender", ["MALE", "FEMALE", "OTHERS"]);

export const users = pgTable(
    "users",
    {
        id: varchar("id", { length: 255 }).primaryKey(),
        email: varchar("email", { length: 255 }).notNull().unique(),
        name: varchar("name", { length: 255 }),
        photo: text("photo"),
        gender: genderEnum("gender"),
        dob: timestamp("dob"),
        state: varchar("state", { length: 100 }), // lowercase
        city: varchar("city", { length: 100 }), // lowercase
        college: varchar("college", { length: 255 }).references(
            () => institutes.id,
            { onDelete: "set null" }
        ),
        idCard: text("id_card"), // photo url id uploaded from frontend via cloudinary uploader
        mobile: varchar("mobile", { length: 20 }).notNull().unique(),
        festID: varchar("fest_id", { length: 255 }).references(() => fests.id, {
            onDelete: "set null",
        }),
        rollNumber: varchar("roll_number", { length: 50 }),
        firebaseId: varchar("firebase_id", { length: 255 }).notNull().unique(), // Firebase auth ID
        hasPaid: boolean("has_paid").default(false),
        receipt: text("receipt"),
        transactionID: varchar("transaction_id", { length: 255 }),
        hall: varchar("hall", { length: 100 }), // hall of residence alloted
        extraDetails: jsonb("extra_details").$type<UserExtraDetails>(),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow(),
    },
    (table) => [
        index("users_college_idx").on(table.college),
        index("users_fest_id_idx").on(table.festID),
        index("users_transaction_id_idx").on(table.transactionID),
    ]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
