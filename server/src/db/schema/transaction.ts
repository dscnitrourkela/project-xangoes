import {
    index,
    integer,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    varchar,
} from "drizzle-orm/pg-core";

import { fests } from "./fest";
import { users } from "./user";

export const transactionTypeEnum = pgEnum("transaction_type", [
    "REGISTRATION",
    "MERCH",
    "EVENT",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
    "PENDING",
    "VERIFIED",
    "REJECTED",
]);

export const transactions = pgTable(
    "transactions",
    {
        id: varchar("id", { length: 255 }).primaryKey(),
        amount: integer("amount"),
        userID: varchar("user_id", { length: 255 })
            .notNull()
            .references(() => users.id, { onDelete: "restrict" }),
        transactionID: varchar("transaction_id", { length: 255 }), // External gateway payment id
        type: transactionTypeEnum("type").notNull(),
        status: transactionStatusEnum("status").notNull().default("PENDING"),
        timestamp: timestamp("timestamp").notNull().defaultNow(),
        festID: varchar("fest_id", { length: 255 }).references(() => fests.id, {
            onDelete: "set null",
        }),
        comment: text("comment"),
        screenshot: text("screenshot"), // optional if payment gateway is used
        provider: varchar("provider", { length: 50 })
            .notNull()
            .default("RAZORPAY"),
        providerOrderID: varchar("provider_order_id", { length: 255 }),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("transactions_provider_order_unique").on(
            table.provider,
            table.providerOrderID
        ),
        index("transactions_user_id_idx").on(table.userID),
        index("transactions_fest_id_idx").on(table.festID),
        index("transactions_transaction_id_idx").on(table.transactionID),
        index("transactions_provider_order_id_idx").on(table.providerOrderID),
    ]
);

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
