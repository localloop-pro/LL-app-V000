# Drizzle ORM Schema

> **Stack:** Drizzle ORM + PostgreSQL (Supabase)
> **Purpose:** Type-safe database schema and queries

---

## Overview

LocalLoop uses Drizzle ORM for type-safe database operations with PostgreSQL. The schema is organized into logical modules for maintainability.

---

## Project Structure

```
lib/db/
├── index.ts          # Database client
├── schema/
│   ├── index.ts      # Schema exports
│   ├── auth.ts       # Users, sessions, accounts
│   ├── cards.ts      # Business cards, products, offers
│   ├── twins.ts      # Digital Twin tables
│   ├── social.ts     # Followers, reviews, notifications
│   ├── payments.ts   # Wallets, transactions, subscriptions
│   └── kyc.ts        # Claims, KYC documents
└── migrations/       # Generated migrations
```

---

## Database Client

```typescript
// lib/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// For query purposes
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });

// For migrations
export const migrationClient = postgres(connectionString, { max: 1 });
```

---

## Drizzle Configuration

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema/index.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

---

## Schema Index

```typescript
// lib/db/schema/index.ts
export * from "./auth";
export * from "./cards";
export * from "./twins";
export * from "./social";
export * from "./payments";
export * from "./kyc";
```

---

## Package.json Scripts

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

## Usage Examples

### Basic Queries

```typescript
import { db } from "@/lib/db";
import { cards, products } from "@/lib/db/schema";
import { eq, and, gt, desc } from "drizzle-orm";

// Select all verified cards
const verifiedCards = await db
  .select()
  .from(cards)
  .where(eq(cards.isVerified, true));

// Select card with products
const cardWithProducts = await db
  .select()
  .from(cards)
  .leftJoin(products, eq(cards.id, products.cardId))
  .where(eq(cards.id, cardId));

// Insert new card
const [newCard] = await db
  .insert(cards)
  .values({
    ownerId: userId,
    businessName: "My Business",
    industryType: "food_beverage",
  })
  .returning();

// Update card
await db
  .update(cards)
  .set({ businessName: "New Name" })
  .where(eq(cards.id, cardId));

// Delete card
await db.delete(cards).where(eq(cards.id, cardId));
```

### Transactions

```typescript
import { db } from "@/lib/db";

await db.transaction(async (tx) => {
  const [card] = await tx
    .insert(cards)
    .values({ businessName: "New Business" })
    .returning();

  await tx.insert(cardDigitalTwins).values({
    cardId: card.id,
    personalityTraits: { tone: "friendly" },
  });
});
```

### Relations Query

```typescript
import { db } from "@/lib/db";

// With Drizzle relations defined
const cardWithRelations = await db.query.cards.findFirst({
  where: eq(cards.id, cardId),
  with: {
    products: true,
    promotions: {
      where: gt(promotions.endDate, new Date()),
    },
    digitalTwin: true,
    owner: {
      columns: {
        id: true,
        name: true,
        email: true,
      },
    },
  },
});
```

---

## Related Files

- [Auth Schema](/docs/drizzle/auth.ts)
- [Cards Schema](/docs/drizzle/cards.ts)
- [Twins Schema](/docs/drizzle/twins.ts)
- [Social Schema](/docs/drizzle/social.ts)
- [Payments Schema](/docs/drizzle/payments.ts)
- [KYC Schema](/docs/drizzle/kyc.ts)

---

## Environment Variables

```env
# .env.local
DATABASE_URL=postgresql://postgres:password@localhost:5432/localloop
```

---

## Commands Reference

```bash
# Generate migrations from schema changes
pnpm db:generate

# Apply migrations to database
pnpm db:migrate

# Push schema directly (dev only)
pnpm db:push

# Open Drizzle Studio
pnpm db:studio
```
