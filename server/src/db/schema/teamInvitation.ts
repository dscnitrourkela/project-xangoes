import { index, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { teams } from "./team";
import { users } from "./user";

export const teamInvitations = pgTable(
    "team_invitations",
    {
        id: varchar("id", { length: 255 }).primaryKey(),
        teamID: varchar("team_id", { length: 255 })
            .notNull()
            .references(() => teams.id, { onDelete: "cascade" }),
        userID: varchar("user_id", { length: 255 })
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        invitedBy: varchar("invited_by", { length: 255 })
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: varchar("type", { length: 50 }).notNull(), // 'INVITATION' | 'JOIN_REQUEST'
        status: varchar("status", { length: 50 }).default("PENDING").notNull(), // 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
        message: text("message"),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow(),
    },
    (table) => [
        index("team_invitations_team_id_idx").on(table.teamID),
        index("team_invitations_user_id_idx").on(table.userID),
        index("team_invitations_invited_by_idx").on(table.invitedBy),
        index("team_invitations_status_idx").on(table.status),
    ]
);

export type TeamInvitation = typeof teamInvitations.$inferSelect;
export type NewTeamInvitation = typeof teamInvitations.$inferInsert;
