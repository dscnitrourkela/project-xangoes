import {
  boolean,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const genderEnum = pgEnum("gender", ["MALE", "FEMALE", "OTHERS"]);

export const admins = pgTable("admins", {
    id: varchar("id", { length: 255 }).primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    firebaseId: varchar("firebase_id", { length: 255 }).notNull().unique(), // Firebase auth ID
    isSuperAdmin: boolean("is_super_admin").default(false), // if the admin is a super admin
    festID: varchar("fest_id", { length: 255 }), // References fest.id
    isDeleted: boolean("is_deleted").default(false), // if the admin is deleted
    allowedToModifyContent: boolean("allowed_to_modify_content").default(false), // if the admin is allowed to modify the content of the fest
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;
