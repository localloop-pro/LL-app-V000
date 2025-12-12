import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { cards } from "./cards";

export const businessClaims = pgTable(
  "business_claims",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    cardId: text("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    status: text("status").default("pending").notNull(), // pending, approved, rejected
    phoneNumber: text("phone_number").notNull(), // For OTP verification
    phoneVerified: boolean("phone_verified").default(false).notNull(),
    verifiedAt: timestamp("verified_at"),
    rejectedReason: text("rejected_reason"), // If status is rejected
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("business_claims_user_id_idx").on(table.userId),
    index("business_claims_card_id_idx").on(table.cardId),
    index("business_claims_status_idx").on(table.status),
  ]
);

export const kycDocuments = pgTable(
  "kyc_documents",
  {
    id: text("id").primaryKey(),
    claimId: text("claim_id")
      .notNull()
      .references(() => businessClaims.id, { onDelete: "cascade" }),
    documentType: text("document_type").notNull(), // business_license, id_card, tax_id, etc.
    documentUrl: text("document_url").notNull(), // URL to stored document
    status: text("status").default("pending").notNull(), // pending, verified, rejected
    verifiedAt: timestamp("verified_at"),
    verifiedBy: text("verified_by"), // Admin user ID who verified
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("kyc_documents_claim_id_idx").on(table.claimId),
    index("kyc_documents_document_type_idx").on(table.documentType),
    index("kyc_documents_status_idx").on(table.status),
  ]
);



