import {
    index,
    pgEnum,
    pgTable,
    timestamp,
    uniqueIndex,
    varchar,
} from "drizzle-orm/pg-core";

import { clubs } from "./club";
import { users } from "./user";

export const clubMemberRoleEnum = pgEnum("club_member_role", [
    "MEMBER",
    "CORE",
    "COORDINATOR",
    "LEAD",
]);

export const clubMembers = pgTable(
    "club_members",
    {
        id: varchar("id", { length: 255 }).primaryKey(),
        clubID: varchar("club_id", { length: 255 })
            .notNull()
            .references(() => clubs.id, { onDelete: "restrict" }),
        userID: varchar("user_id", { length: 255 })
            .notNull()
            .references(() => users.id, { onDelete: "restrict" }),
        role: clubMemberRoleEnum("role").notNull().default("MEMBER"),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("club_members_club_user_unique").on(
            table.clubID,
            table.userID
        ),
        index("club_members_club_id_idx").on(table.clubID),
        index("club_members_user_id_idx").on(table.userID),
    ]
);

export type ClubMember = typeof clubMembers.$inferSelect;
export type NewClubMember = typeof clubMembers.$inferInsert;
