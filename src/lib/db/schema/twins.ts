import { pgTable, text, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { cards } from "./cards";

export const cardDigitalTwins = pgTable(
  "card_digital_twins",
  {
    id: text("id").primaryKey(),
    cardId: text("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" })
      .unique(),
    personalityTraits: jsonb("personality_traits"), // { tone: "friendly", traits: ["helpful", "professional"], voiceStyle: "..." }
    systemPrompt: text("system_prompt"), // Custom system prompt override
    knowledgeBase: jsonb("knowledge_base"), // { faqs: [...], customInfo: {...} }
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("card_digital_twins_card_id_idx").on(table.cardId),
    index("card_digital_twins_is_active_idx").on(table.isActive),
  ]
);


