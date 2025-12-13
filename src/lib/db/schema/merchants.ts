import { pgTable, text, timestamp, integer, doublePrecision, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const geoLocation = pgTable(
  "geo_location",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    type: text("type").notNull(), // 'country' | 'state' | 'city' | 'postcode'
    parentId: text("parent_id"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("geo_location_parent_id_idx").on(table.parentId),
    index("geo_location_type_idx").on(table.type),
  ]
);

export const merchant = pgTable(
  "merchant",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    merchantId: text("merchant_id").notNull().unique(), // e.g., #BND-8821
    logo: text("logo"),
    status: text("status").notNull().default("pending"), // 'live' | 'pending' | 'suspended'
    activeDeals: integer("active_deals").default(0),
    essayStatus: text("essay_status").notNull().default("none"), // 'published' | 'drafting' | 'none'
    address: text("address").notNull(),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    totalSales: doublePrecision("total_sales").default(0),
    rating: doublePrecision("rating").default(0),
    locationId: text("location_id").references(() => geoLocation.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("merchant_location_id_idx").on(table.locationId),
    index("merchant_status_idx").on(table.status),
    index("merchant_merchant_id_idx").on(table.merchantId),
  ]
);

export const ticket = pgTable(
  "ticket",
  {
    id: text("id").primaryKey(),
    merchantId: text("merchant_id")
      .notNull()
      .references(() => merchant.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    status: text("status").notNull().default("open"), // 'open' | 'resolved' | 'pending'
    type: text("type").notNull(), // e.g., 'Content Issue', 'Onboarding'
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("ticket_merchant_id_idx").on(table.merchantId),
    index("ticket_status_idx").on(table.status),
  ]
);

// Relations
export const geoLocationRelations = relations(geoLocation, ({ one, many }) => ({
  parent: one(geoLocation, {
    fields: [geoLocation.parentId],
    references: [geoLocation.id],
  }),
  children: many(geoLocation),
  merchants: many(merchant),
}));

export const merchantRelations = relations(merchant, ({ one, many }) => ({
  location: one(geoLocation, {
    fields: [merchant.locationId],
    references: [geoLocation.id],
  }),
  tickets: many(ticket),
}));

export const ticketRelations = relations(ticket, ({ one }) => ({
  merchant: one(merchant, {
    fields: [ticket.merchantId],
    references: [merchant.id],
  }),
}));

