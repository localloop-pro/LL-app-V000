# Structured Data Responses

> **Stack:** Next.js 14+ + Vercel AI SDK + Zod
> **Purpose:** Get structured JSON responses from AI for UI rendering

---

## Overview

When building UI components that need structured data from AI (like offer cards, product listings, or analytics summaries), use structured output instead of plain text streaming.

---

## Basic Structured Output

### Route Handler

```typescript
// app/api/ai/generate-offer/route.ts
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { z } from "zod";

const offerSchema = z.object({
  title: z.string().describe("Catchy offer title, max 10 words"),
  description: z.string().describe("Engaging description, 50-100 words"),
  discount: z.number().describe("Discount percentage"),
  conditions: z.string().optional().describe("Any conditions or restrictions"),
  socialCaption: z.string().describe("Instagram/Facebook caption with emojis"),
  seoKeywords: z.array(z.string()).describe("3-5 SEO keywords"),
  urgencyText: z.string().describe("Urgency message like 'Today only!'"),
});

export type GeneratedOffer = z.infer<typeof offerSchema>;

export async function POST(req: Request) {
  const { businessName, offerType, discountValue, products } = await req.json();

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  const result = await generateObject({
    model: openrouter("anthropic/claude-3.5-sonnet"),
    schema: offerSchema,
    prompt: `Generate marketing content for this offer:
    
Business: ${businessName}
Offer Type: ${offerType}
Discount: ${discountValue}%
Products: ${products.join(", ")}

Create engaging, professional content that drives conversions.`,
  });

  return Response.json(result.object);
}
```

### Client Usage

```tsx
// components/offer-generator.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Copy, Check } from "lucide-react";
import type { GeneratedOffer } from "@/app/api/ai/generate-offer/route";

export function OfferGenerator({ businessName }: { businessName: string }) {
  const [loading, setLoading] = useState(false);
  const [offer, setOffer] = useState<GeneratedOffer | null>(null);
  const [discountValue, setDiscountValue] = useState("20");
  const [copied, setCopied] = useState<string | null>(null);

  const generateOffer = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          offerType: "percentage",
          discountValue: parseInt(discountValue),
          products: ["all items"],
        }),
      });
      const data = await res.json();
      setOffer(data);
    } catch (error) {
      console.error("Failed to generate offer:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Offer Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="discount">Discount Percentage</Label>
            <Input
              id="discount"
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder="20"
            />
          </div>
          <Button onClick={generateOffer} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Offer Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {offer && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">TITLE</Label>
              <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                <span className="font-semibold">{offer.title}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copyToClipboard(offer.title, "title")}
                >
                  {copied === "title" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">DESCRIPTION</Label>
              <div className="flex items-start justify-between bg-muted p-3 rounded-lg">
                <p className="text-sm">{offer.description}</p>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copyToClipboard(offer.description, "desc")}
                >
                  {copied === "desc" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Social Caption */}
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">SOCIAL CAPTION</Label>
              <div className="flex items-start justify-between bg-muted p-3 rounded-lg">
                <p className="text-sm">{offer.socialCaption}</p>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copyToClipboard(offer.socialCaption, "social")}
                >
                  {copied === "social" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Urgency */}
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">URGENCY TEXT</Label>
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg font-semibold">
                {offer.urgencyText}
              </div>
            </div>

            {/* SEO Keywords */}
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">SEO KEYWORDS</Label>
              <div className="flex flex-wrap gap-2">
                {offer.seoKeywords.map((keyword, i) => (
                  <span
                    key={i}
                    className="bg-primary/10 text-primary px-2 py-1 rounded text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

---

## Complex Nested Schemas

### Business Profile Generator

```typescript
// app/api/ai/generate-profile/route.ts
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { z } from "zod";

const businessProfileSchema = z.object({
  tagline: z.string().describe("Catchy business tagline, max 10 words"),
  description: z.object({
    short: z.string().describe("One sentence description"),
    medium: z.string().describe("2-3 sentence description"),
    full: z.string().describe("Full paragraph description for website"),
  }),
  personality: z.object({
    tone: z.enum(["professional", "friendly", "quirky", "luxury", "casual"]),
    traits: z.array(z.string()).describe("3-5 personality traits"),
    voiceStyle: z.string().describe("How the Digital Twin should speak"),
  }),
  seo: z.object({
    metaTitle: z.string().max(60),
    metaDescription: z.string().max(160),
    keywords: z.array(z.string()),
  }),
  socialBios: z.object({
    twitter: z.string().max(160),
    instagram: z.string().max(150),
    linkedin: z.string().max(200),
  }),
});

export type GeneratedProfile = z.infer<typeof businessProfileSchema>;

export async function POST(req: Request) {
  const { businessName, industry, location, uniquePoints } = await req.json();

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  const result = await generateObject({
    model: openrouter("anthropic/claude-3.5-sonnet"),
    schema: businessProfileSchema,
    prompt: `Generate a complete business profile for:

Business Name: ${businessName}
Industry: ${industry}
Location: ${location}
Unique Selling Points: ${uniquePoints.join(", ")}

Create professional, engaging content that will attract local customers.`,
  });

  return Response.json(result.object);
}
```

---

## Streaming Structured Data

For large objects, stream the generation:

```typescript
// app/api/ai/analyze-reviews/route.ts
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamObject } from "ai";
import { z } from "zod";

const reviewAnalysisSchema = z.object({
  summary: z.string().describe("Overall summary of reviews"),
  sentiment: z.object({
    overall: z.enum(["positive", "neutral", "negative"]),
    score: z.number().min(0).max(100),
  }),
  themes: z.array(
    z.object({
      topic: z.string(),
      sentiment: z.enum(["positive", "neutral", "negative"]),
      mentions: z.number(),
      examples: z.array(z.string()),
    })
  ),
  recommendations: z.array(z.string()).describe("Actionable recommendations"),
  responseTemplates: z.array(
    z.object({
      forSentiment: z.enum(["positive", "negative"]),
      template: z.string(),
    })
  ),
});

export async function POST(req: Request) {
  const { reviews } = await req.json();

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  const result = streamObject({
    model: openrouter("anthropic/claude-3.5-sonnet"),
    schema: reviewAnalysisSchema,
    prompt: `Analyze these customer reviews and provide insights:

${reviews.map((r: any, i: number) => `Review ${i + 1}: "${r.text}" (${r.rating}/5 stars)`).join("\n")}

Provide a comprehensive analysis with actionable recommendations.`,
  });

  return result.toTextStreamResponse();
}
```

### Client with Streaming

```tsx
// components/review-analyzer.tsx
"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { reviewAnalysisSchema } from "@/lib/schemas";

export function ReviewAnalyzer({ reviews }: { reviews: any[] }) {
  const { object, submit, isLoading } = useObject({
    api: "/api/ai/analyze-reviews",
    schema: reviewAnalysisSchema,
  });

  return (
    <div>
      <Button onClick={() => submit({ reviews })} disabled={isLoading}>
        Analyze Reviews
      </Button>

      {/* Results stream in as they're generated */}
      {object && (
        <div className="space-y-4">
          {object.summary && (
            <Card>
              <CardHeader>Summary</CardHeader>
              <CardContent>{object.summary}</CardContent>
            </Card>
          )}

          {object.sentiment && (
            <Card>
              <CardHeader>Sentiment: {object.sentiment.overall}</CardHeader>
              <CardContent>
                <Progress value={object.sentiment.score} />
              </CardContent>
            </Card>
          )}

          {object.themes?.map((theme, i) => (
            <Card key={i}>
              <CardHeader>{theme.topic}</CardHeader>
              <CardContent>
                <Badge variant={theme.sentiment === "positive" ? "default" : "destructive"}>
                  {theme.sentiment}
                </Badge>
                <p>{theme.mentions} mentions</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Enum Selections

For classification tasks:

```typescript
// app/api/ai/classify-business/route.ts
const industrySchema = z.object({
  primaryCategory: z.enum([
    "food_beverage",
    "retail",
    "health_beauty",
    "professional_services",
    "entertainment",
    "accommodation",
    "automotive",
    "home_services",
    "education",
    "other",
  ]),
  subCategories: z.array(z.string()).max(3),
  suggestedTags: z.array(z.string()).max(10),
  priceRange: z.enum(["$", "$$", "$$$", "$$$$"]),
  targetAudience: z.array(
    z.enum([
      "families",
      "young_professionals",
      "seniors",
      "tourists",
      "students",
      "businesses",
    ])
  ),
});

export async function POST(req: Request) {
  const { businessName, description } = await req.json();

  const result = await generateObject({
    model: openrouter("openai/gpt-4o-mini"), // Faster for classification
    schema: industrySchema,
    prompt: `Classify this business:
Name: ${businessName}
Description: ${description}`,
  });

  return Response.json(result.object);
}
```

---

## Array Generation

Generate multiple items:

```typescript
// app/api/ai/generate-faqs/route.ts
const faqSchema = z.object({
  faqs: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
      category: z.enum(["general", "products", "pricing", "booking", "location"]),
    })
  ).min(5).max(10),
});

export async function POST(req: Request) {
  const { businessInfo } = await req.json();

  const result = await generateObject({
    model: openrouter("anthropic/claude-3.5-sonnet"),
    schema: faqSchema,
    prompt: `Generate FAQs for this business that customers commonly ask:
${JSON.stringify(businessInfo, null, 2)}`,
  });

  return Response.json(result.object);
}
```

---

## Error Handling

```typescript
// app/api/ai/generate-offer/route.ts
import { generateObject, GenerateObjectResult } from "ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate input
    if (!body.businessName) {
      return Response.json(
        { error: "Business name is required" },
        { status: 400 }
      );
    }

    const result = await generateObject({
      model: openrouter("anthropic/claude-3.5-sonnet"),
      schema: offerSchema,
      prompt: `...`,
    });

    // Validate output matches schema
    const parsed = offerSchema.safeParse(result.object);
    if (!parsed.success) {
      console.error("Schema validation failed:", parsed.error);
      return Response.json(
        { error: "Generated content failed validation" },
        { status: 500 }
      );
    }

    return Response.json(parsed.data);
  } catch (error) {
    console.error("AI generation error:", error);
    return Response.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
```

---

## Reusable Schema Library

```typescript
// lib/ai/schemas.ts
import { z } from "zod";

export const offerContentSchema = z.object({
  title: z.string(),
  description: z.string(),
  urgencyText: z.string(),
  socialCaption: z.string(),
  seoKeywords: z.array(z.string()),
});

export const businessDescriptionSchema = z.object({
  short: z.string().max(100),
  medium: z.string().max(300),
  full: z.string().max(1000),
});

export const personalitySchema = z.object({
  tone: z.enum(["professional", "friendly", "quirky", "luxury", "casual"]),
  traits: z.array(z.string()),
  voiceStyle: z.string(),
});

export const reviewResponseSchema = z.object({
  response: z.string(),
  sentiment: z.enum(["positive", "neutral", "negative"]),
  suggestedAction: z.string().optional(),
});

// Type exports
export type OfferContent = z.infer<typeof offerContentSchema>;
export type BusinessDescription = z.infer<typeof businessDescriptionSchema>;
export type Personality = z.infer<typeof personalitySchema>;
export type ReviewResponse = z.infer<typeof reviewResponseSchema>;
```

---

## Related Documentation

- [AI Streaming](/docs/technical/ai/streaming.md)
- [Zod Documentation](https://zod.dev)
- [Vercel AI SDK - Structured Output](https://sdk.vercel.ai/docs/ai-sdk-core/generating-structured-data)