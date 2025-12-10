# BetterAuth + Polar Integration

> **Stack:** Next.js 14+ + BetterAuth + Polar (Payments) + Drizzle ORM
> **Purpose:** Authentication and subscription/payment management

---

## Overview

LocalLoop uses **BetterAuth** for authentication and **Polar** for payment processing and subscriptions. This provides a modern, type-safe auth system with built-in support for social providers and subscription management.

---

## Dependencies

```bash
pnpm add better-auth @polar-sh/sdk @polar-sh/nextjs
```

---

## BetterAuth Configuration

### Server Setup

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    },
  },
  
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
      businessId: {
        type: "string",
        required: false,
      },
    },
  },
  
  callbacks: {
    async onUserCreated({ user }) {
      // Create wallet for new user
      await db.insert(schema.wallets).values({
        userId: user.id,
        balance: 0,
        tokenBalance: 0,
      });
    },
  },
});

export type Session = typeof auth.$Infer.Session;
```

### Auth Route Handler

```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

### Client Setup

```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export const {
  useSession,
  signIn,
  signUp,
  signOut,
  useUser,
} = authClient;
```

---

## Database Schema (Drizzle)

```typescript
// lib/db/schema/auth.ts
import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  emailVerified: boolean("email_verified").default(false),
  name: text("name"),
  image: text("image"),
  role: text("role").default("user"), // user, business_owner, admin
  businessId: uuid("business_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const verifications = pgTable("verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

---

## Auth Components (Shadcn)

### Sign In Form

```tsx
// components/auth/sign-in-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/icons";
import { useToast } from "@/components/ui/use-toast";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        toast({
          title: "Sign in failed",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "google" | "apple") => {
    setLoading(true);
    try {
      await signIn.social({ provider, callbackURL: "/dashboard" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in with " + provider,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
        <CardDescription>
          Choose your preferred sign in method
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => handleSocialSignIn("google")}
            disabled={loading}
          >
            <Icons.google className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSocialSignIn("apple")}
            disabled={loading}
          >
            <Icons.apple className="mr-2 h-4 w-4" />
            Apple
          </Button>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Sign in
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button variant="link" className="text-sm" asChild>
          <a href="/auth/forgot-password">Forgot password?</a>
        </Button>
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <a href="/auth/sign-up" className="text-primary hover:underline">
            Sign up
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}
```

### Session Provider

```tsx
// components/providers/session-provider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession as useBetterAuthSession } from "@/lib/auth-client";
import type { Session } from "@/lib/auth";

interface SessionContextValue {
  session: Session | null;
  loading: boolean;
  user: Session["user"] | null;
}

const SessionContext = createContext<SessionContextValue>({
  session: null,
  loading: true,
  user: null,
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useBetterAuthSession();

  return (
    <SessionContext.Provider
      value={{
        session: session ?? null,
        loading: isPending,
        user: session?.user ?? null,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useAuth() {
  return useContext(SessionContext);
}
```

---

## Polar Payment Integration

### Polar Setup

```typescript
// lib/polar.ts
import { Polar } from "@polar-sh/sdk";

export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
});

// Product IDs for your subscription tiers
export const PRODUCTS = {
  FREE: "free",
  BUSINESS_BASIC: process.env.POLAR_BUSINESS_BASIC_ID!,
  BUSINESS_PRO: process.env.POLAR_BUSINESS_PRO_ID!,
  ENTERPRISE: process.env.POLAR_ENTERPRISE_ID!,
};
```

### Checkout Route

```typescript
// app/api/checkout/route.ts
import { NextRequest } from "next/server";
import { polar } from "@/lib/polar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: headers(),
  });

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId, successUrl, cancelUrl } = await req.json();

  try {
    const checkout = await polar.checkouts.create({
      productId,
      successUrl: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      customerEmail: session.user.email,
      metadata: {
        userId: session.user.id,
      },
    });

    return Response.json({ checkoutUrl: checkout.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return Response.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
```

### Webhook Handler

```typescript
// app/api/webhooks/polar/route.ts
import { NextRequest } from "next/server";
import { Webhooks } from "@polar-sh/nextjs";
import { db } from "@/lib/db";
import { users, subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const webhooks = new Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("polar-signature");

  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const event = webhooks.verify(body, signature);

    switch (event.type) {
      case "subscription.created":
      case "subscription.updated":
        await handleSubscriptionUpdate(event.data);
        break;
      case "subscription.canceled":
        await handleSubscriptionCanceled(event.data);
        break;
      case "order.created":
        await handleOrderCreated(event.data);
        break;
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json({ error: "Webhook verification failed" }, { status: 400 });
  }
}

async function handleSubscriptionUpdate(data: any) {
  const userId = data.metadata?.userId;
  if (!userId) return;

  await db
    .update(users)
    .set({
      role: data.productId === process.env.POLAR_BUSINESS_PRO_ID 
        ? "business_pro" 
        : "business_owner",
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  // Upsert subscription record
  await db
    .insert(subscriptions)
    .values({
      userId,
      polarSubscriptionId: data.id,
      productId: data.productId,
      status: data.status,
      currentPeriodEnd: new Date(data.currentPeriodEnd),
    })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        status: data.status,
        currentPeriodEnd: new Date(data.currentPeriodEnd),
        updatedAt: new Date(),
      },
    });
}

async function handleSubscriptionCanceled(data: any) {
  const userId = data.metadata?.userId;
  if (!userId) return;

  await db
    .update(users)
    .set({ role: "user", updatedAt: new Date() })
    .where(eq(users.id, userId));

  await db
    .update(subscriptions)
    .set({ status: "canceled", updatedAt: new Date() })
    .where(eq(subscriptions.polarSubscriptionId, data.id));
}

async function handleOrderCreated(data: any) {
  // Handle one-time purchases if needed
  console.log("Order created:", data.id);
}
```

### Subscription Schema

```typescript
// lib/db/schema/subscriptions.ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).unique(),
  polarSubscriptionId: text("polar_subscription_id").unique(),
  productId: text("product_id"),
  status: text("status").default("active"), // active, canceled, past_due
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### Pricing Component

```tsx
// components/pricing.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/session-provider";
import { PRODUCTS } from "@/lib/polar";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For individuals exploring LocalLoop",
    features: [
      "View business cards",
      "Follow up to 10 businesses",
      "Basic search",
      "Community deals access",
    ],
    productId: PRODUCTS.FREE,
    popular: false,
  },
  {
    name: "Business Basic",
    price: "$19",
    period: "/month",
    description: "For small businesses getting started",
    features: [
      "Claim 1 business",
      "Digital business card",
      "Up to 5 active offers",
      "Basic analytics",
      "Email support",
    ],
    productId: PRODUCTS.BUSINESS_BASIC,
    popular: true,
  },
  {
    name: "Business Pro",
    price: "$49",
    period: "/month",
    description: "For growing businesses",
    features: [
      "Everything in Basic",
      "Unlimited offers",
      "Digital Twin AI",
      "Advanced analytics",
      "Priority support",
      "API access",
    ],
    productId: PRODUCTS.BUSINESS_PRO,
    popular: false,
  },
];

export function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const handleCheckout = async (productId: string) => {
    if (!user) {
      router.push("/auth/sign-in?redirect=/pricing");
      return;
    }

    if (productId === PRODUCTS.FREE) return;

    setLoading(productId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {plans.map((plan) => (
        <Card
          key={plan.name}
          className={plan.popular ? "border-primary shadow-lg relative" : ""}
        >
          {plan.popular && (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
              Most Popular
            </Badge>
          )}
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">{plan.price}</span>
              {plan.period && (
                <span className="text-muted-foreground">{plan.period}</span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={plan.popular ? "default" : "outline"}
              onClick={() => handleCheckout(plan.productId)}
              disabled={loading === plan.productId}
            >
              {loading === plan.productId && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {plan.productId === PRODUCTS.FREE ? "Get Started" : "Subscribe"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
```

---

## Environment Variables

```env
# .env.local

# BetterAuth
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# OAuth Providers
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
APPLE_CLIENT_ID=xxx
APPLE_CLIENT_SECRET=xxx

# Polar
POLAR_ACCESS_TOKEN=xxx
POLAR_WEBHOOK_SECRET=xxx
POLAR_BUSINESS_BASIC_ID=xxx
POLAR_BUSINESS_PRO_ID=xxx
POLAR_ENTERPRISE_ID=xxx
```

---

## Middleware Protection

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = [
  "/",
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/forgot-password",
  "/api/auth",
  "/api/webhooks",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get("better-auth.session_token");
  
  if (!sessionCookie && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

---

## Related Documentation

- [BetterAuth Docs](https://better-auth.com)
- [Polar Docs](https://docs.polar.sh)
- [Drizzle ORM](https://orm.drizzle.team)