import { pgTable, text, timestamp, boolean, integer, jsonb, index } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { cards } from "./cards";

export const followers = pgTable(
  "followers",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    cardId: text("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("followers_user_id_idx").on(table.userId),
    index("followers_card_id_idx").on(table.cardId),
    index("followers_user_card_idx").on(table.userId, table.cardId), // Unique constraint via application logic
  ]
);

export const reviews = pgTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    cardId: text("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(), // 1-5 stars
    content: text("content"),
    isVerified: boolean("is_verified").default(false).notNull(), // Verified purchase/review
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("reviews_user_id_idx").on(table.userId),
    index("reviews_card_id_idx").on(table.cardId),
    index("reviews_rating_idx").on(table.rating),
    index("reviews_is_verified_idx").on(table.isVerified),
  ]
);

export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // offer, review, follower, message, etc.
    title: text("title").notNull(),
    content: text("content"),
    metadata: jsonb("metadata"), // Additional data like cardId, offerId, etc.
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("notifications_user_id_idx").on(table.userId),
    index("notifications_type_idx").on(table.type),
    index("notifications_is_read_idx").on(table.isRead),
    index("notifications_created_at_idx").on(table.createdAt),
  ]
);

export const bucketListItems = pgTable(
  "bucket_list_items",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    cardId: text("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    notes: text("notes"), // User's personal notes about this place
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("bucket_list_items_user_id_idx").on(table.userId),
    index("bucket_list_items_card_id_idx").on(table.cardId),
    index("bucket_list_items_user_card_idx").on(table.userId, table.cardId), // Unique constraint via application logic
  ]
);



