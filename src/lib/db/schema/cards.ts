import { pgTable, text, timestamp, boolean, numeric, index, jsonb } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const cards = pgTable(
  "cards",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    businessName: text("business_name").notNull(),
    industryType: text("industry_type").notNull(), // food_beverage, retail, health_beauty, etc.
    description: text("description"),
    address: jsonb("address"), // { street, city, state, zip, country, lat, lng }
    logoUrl: text("logo_url"),
    coverImageUrl: text("cover_image_url"),
    website: text("website"),
    phone: text("phone"),
    email: text("email"),
    socialLinks: jsonb("social_links"), // { instagram, facebook, twitter, etc. }
    isVerified: boolean("is_verified").default(false).notNull(),
    verifiedAt: timestamp("verified_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("cards_owner_id_idx").on(table.ownerId),
    index("cards_industry_type_idx").on(table.industryType),
    index("cards_is_verified_idx").on(table.isVerified),
  ]
);

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    cardId: text("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }),
    description: text("description"),
    category: text("category"),
    imageUrl: text("image_url"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("products_card_id_idx").on(table.cardId),
    index("products_category_idx").on(table.category),
    index("products_is_active_idx").on(table.isActive),
  ]
);

export const promotions = pgTable(
  "promotions",
  {
    id: text("id").primaryKey(),
    cardId: text("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    promotionType: text("promotion_type").notNull(), // percentage, fixed, bogo, vip, community
    discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull(),
    conditions: text("conditions"), // e.g., "Orders over $50", "First-time customers only"
    title: text("title").notNull(),
    description: text("description"),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("promotions_card_id_idx").on(table.cardId),
    index("promotions_promotion_type_idx").on(table.promotionType),
    index("promotions_start_date_idx").on(table.startDate),
    index("promotions_end_date_idx").on(table.endDate),
    index("promotions_is_active_idx").on(table.isActive),
  ]
);


