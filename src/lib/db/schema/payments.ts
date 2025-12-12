import { pgTable, text, timestamp, numeric, integer, jsonb, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const wallets = pgTable(
  "wallets",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .unique(),
    balance: numeric("balance", { precision: 10, scale: 2 }).default("0").notNull(), // USD balance
    tokenBalance: integer("token_balance").default(0).notNull(), // Loyalty tokens
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("wallets_user_id_idx").on(table.userId),
  ]
);

export const transactions = pgTable(
  "transactions",
  {
    id: text("id").primaryKey(),
    walletId: text("wallet_id")
      .notNull()
      .references(() => wallets.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // deposit, withdrawal, purchase, reward, refund
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    tokenAmount: integer("token_amount").default(0).notNull(), // Tokens earned/spent
    description: text("description"),
    metadata: jsonb("metadata"), // Additional transaction data
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("transactions_wallet_id_idx").on(table.walletId),
    index("transactions_type_idx").on(table.type),
    index("transactions_created_at_idx").on(table.createdAt),
  ]
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .unique(),
    polarSubscriptionId: text("polar_subscription_id").unique(),
    productId: text("product_id").notNull(), // free, business_basic, business_pro, enterprise
    status: text("status").default("active").notNull(), // active, canceled, past_due
    currentPeriodEnd: timestamp("current_period_end"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("subscriptions_user_id_idx").on(table.userId),
    index("subscriptions_status_idx").on(table.status),
    index("subscriptions_product_id_idx").on(table.productId),
  ]
);



