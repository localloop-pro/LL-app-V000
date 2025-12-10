# AI Streaming Implementation

> **Stack:** Next.js 14+ (App Router) + Vercel AI SDK + OpenRouter
> **Purpose:** Real-time AI responses for Digital Twin conversations

---

## Overview

LocalLoop uses streaming AI responses for natural, real-time conversations with Digital Twins. This document covers the implementation using the Vercel AI SDK with OpenRouter as the provider.

---

## Dependencies

```bash
pnpm add ai @ai-sdk/react @openrouter/ai-sdk-provider zod
```

---

## Environment Setup

```env
# .env.local
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxx
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet

# Alternative models available via OpenRouter:
# anthropic/claude-3.5-sonnet (recommended for quality)
# openai/gpt-4o-mini (faster, cheaper)
# meta-llama/llama-3.1-70b-instruct (open source)
```

---

## Route Handler: Basic Chat

```typescript
// app/api/chat/route.ts
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, UIMessage, convertToModelMessages } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  const result = streamText({
    model: openrouter(process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini"),
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
```

---

## Route Handler: Digital Twin Chat

```typescript
// app/api/twin-chat/route.ts
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, UIMessage, convertToModelMessages, tool } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import { cards, products, promotions, cardDigitalTwins } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, cardId }: { messages: UIMessage[]; cardId: string } = 
    await req.json();

  // Fetch business context from database
  const [card] = await db
    .select()
    .from(cards)
    .where(eq(cards.id, cardId))
    .limit(1);

  const [twin] = await db
    .select()
    .from(cardDigitalTwins)
    .where(eq(cardDigitalTwins.cardId, cardId))
    .limit(1);

  const businessProducts = await db
    .select()
    .from(products)
    .where(eq(products.cardId, cardId));

  const activeOffers = await db
    .select()
    .from(promotions)
    .where(eq(promotions.cardId, cardId));

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  const systemPrompt = `You are the Digital Twin AI for "${card.businessName}".

PERSONALITY:
${twin?.personalityTraits ? JSON.stringify(twin.personalityTraits) : "Friendly and helpful"}

BUSINESS INFO:
- Industry: ${card.industryType}
- Description: ${card.description}
- Location: ${card.address ? JSON.stringify(card.address) : "Not specified"}

PRODUCTS/SERVICES:
${businessProducts.map(p => `- ${p.name}: $${p.price} - ${p.description}`).join('\n')}

CURRENT OFFERS:
${activeOffers.map(o => `- ${o.promotionType}: ${o.discountValue}% off`).join('\n')}

GUIDELINES:
- Be friendly and represent the business authentically
- Keep responses concise (under 150 words)
- Promote current offers when relevant
- If asked something you don't know, offer to connect them with the business owner
- Never make up information about products or prices`;

  const result = streamText({
    model: openrouter(process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet"),
    system: systemPrompt,
    messages: convertToModelMessages(messages),
    tools: {
      getOffers: tool({
        description: "Get current active offers and deals for this business",
        inputSchema: z.object({}),
        execute: async () => {
          return activeOffers.map(o => ({
            type: o.promotionType,
            discount: o.discountValue,
            conditions: o.conditions,
            endsAt: o.endDate,
          }));
        },
      }),
      getProducts: tool({
        description: "Get list of products or services offered",
        inputSchema: z.object({
          category: z.string().optional().describe("Filter by category"),
        }),
        execute: async ({ category }) => {
          let filtered = businessProducts;
          if (category) {
            filtered = businessProducts.filter(p => 
              p.category?.toLowerCase().includes(category.toLowerCase())
            );
          }
          return filtered.map(p => ({
            name: p.name,
            price: p.price,
            description: p.description,
          }));
        },
      }),
      bookAppointment: tool({
        description: "Request to book an appointment or reservation",
        inputSchema: z.object({
          date: z.string().describe("Preferred date (e.g., 'tomorrow', 'next Monday')"),
          time: z.string().describe("Preferred time"),
          service: z.string().describe("Service or purpose of appointment"),
          name: z.string().describe("Customer name"),
          phone: z.string().optional().describe("Contact phone number"),
        }),
        execute: async ({ date, time, service, name, phone }) => {
          // In production, trigger N8N workflow here
          // await triggerN8NWorkflow('booking-request', { ... });
          
          return {
            status: "Booking request submitted",
            message: `We'll contact you to confirm your ${service} appointment for ${date} at ${time}`,
            reference: `BK-${Date.now()}`,
          };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
```

---

## Client Component: Chat UI with Shadcn

```tsx
// components/twin-chat.tsx
"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send, Bot, User } from "lucide-react";

interface TwinChatProps {
  cardId: string;
  businessName: string;
  businessLogo?: string;
}

export function TwinChat({ cardId, businessName, businessLogo }: TwinChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  
  const { messages, sendMessage, isLoading, error } = useChat({
    api: "/api/twin-chat",
    body: { cardId },
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <Card className="w-full max-w-md mx-auto h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={businessLogo} alt={businessName} />
            <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
          </Avatar>
          <span className="text-lg">{businessName}</span>
          <span className="text-xs text-muted-foreground ml-auto">Digital Twin</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea ref={scrollRef} className="h-full p-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Hi! I'm the Digital Twin for {businessName}.</p>
              <p className="text-sm mt-2">Ask me about our products, offers, or book an appointment!</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 mb-4 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={businessLogo} />
                  <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case "text":
                      return <p key={i} className="whitespace-pre-wrap">{part.text}</p>;
                    case "tool-getOffers":
                    case "tool-getProducts":
                    case "tool-bookAppointment":
                      return (
                        <div key={i} className="text-xs bg-background/50 rounded p-2 mt-2">
                          <span className="font-semibold">🔧 {part.type.replace('tool-', '')}</span>
                          {part.result && (
                            <pre className="mt-1 overflow-auto">
                              {JSON.stringify(part.result, null, 2)}
                            </pre>
                          )}
                        </div>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
              
              {message.role === "user" && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 mb-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <CardFooter className="border-t p-4">
        {error && (
          <p className="text-destructive text-sm mb-2 w-full">
            Error: {error.message}
          </p>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2 w-full">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about products, offers, or book..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
```

---

## Usage Example

```tsx
// app/card/[id]/page.tsx
import { TwinChat } from "@/components/twin-chat";
import { db } from "@/lib/db";
import { cards } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function CardPage({ params }: { params: { id: string } }) {
  const [card] = await db
    .select()
    .from(cards)
    .where(eq(cards.id, params.id))
    .limit(1);

  if (!card) {
    return <div>Business not found</div>;
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">{card.businessName}</h1>
      
      <TwinChat
        cardId={card.id}
        businessName={card.businessName}
        businessLogo={card.logoUrl || undefined}
      />
    </div>
  );
}
```

---

## Advanced: Multi-Step Tool Calls

Enable the AI to use multiple tools in sequence:

```typescript
// In your route handler, add:
import { stepCountIs } from "ai";

const result = streamText({
  model: openrouter(process.env.OPENROUTER_MODEL),
  system: systemPrompt,
  messages: convertToModelMessages(messages),
  stopWhen: stepCountIs(5), // Allow up to 5 tool calls per response
  tools: {
    // ... your tools
  },
});
```

---

## Streaming with Custom Events

Send custom events during streaming:

```typescript
// app/api/twin-chat/route.ts
import { createDataStreamResponse, streamText } from "ai";

export async function POST(req: Request) {
  const { messages, cardId } = await req.json();

  return createDataStreamResponse({
    execute: async (dataStream) => {
      // Send initial context
      dataStream.writeData({ type: 'business-loaded', cardId });

      const result = streamText({
        model: openrouter(process.env.OPENROUTER_MODEL),
        messages: convertToModelMessages(messages),
        onStepFinish: ({ toolResults }) => {
          if (toolResults.length > 0) {
            dataStream.writeData({ 
              type: 'tool-executed', 
              tools: toolResults.map(t => t.toolName) 
            });
          }
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}
```

---

## Error Handling

```typescript
// components/twin-chat.tsx
const { messages, sendMessage, isLoading, error, reload } = useChat({
  api: "/api/twin-chat",
  body: { cardId },
  onError: (error) => {
    console.error("Chat error:", error);
    // Show toast notification
    toast({
      title: "Connection Error",
      description: "Failed to connect to Digital Twin. Please try again.",
      variant: "destructive",
    });
  },
});

// In JSX, add retry button
{error && (
  <Button variant="outline" size="sm" onClick={() => reload()}>
    Retry
  </Button>
)}
```

---

## Performance Optimization

### 1. Response Caching (for common questions)
```typescript
// Use Next.js caching for static business info
const businessContext = await unstable_cache(
  async () => getBusinessContext(cardId),
  [`business-${cardId}`],
  { revalidate: 300 } // 5 minutes
)();
```

### 2. Streaming Indicators
```tsx
// Show typing indicator immediately
const [isTyping, setIsTyping] = useState(false);

useEffect(() => {
  setIsTyping(isLoading && messages.length > 0);
}, [isLoading, messages]);
```

### 3. Optimistic Updates
```tsx
// Show user message immediately before API response
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const userInput = input;
  setInput(""); // Clear immediately
  sendMessage({ text: userInput });
};
```

---

## Testing

```typescript
// __tests__/twin-chat.test.ts
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TwinChat } from "@/components/twin-chat";

// Mock the useChat hook
jest.mock("@ai-sdk/react", () => ({
  useChat: () => ({
    messages: [],
    sendMessage: jest.fn(),
    isLoading: false,
    error: null,
  }),
}));

describe("TwinChat", () => {
  it("renders welcome message when no messages", () => {
    render(
      <TwinChat 
        cardId="test-id" 
        businessName="Test Business" 
      />
    );
    
    expect(screen.getByText(/Digital Twin for Test Business/)).toBeInTheDocument();
  });
});
```

---

## Related Documentation

- [Structured Data Responses](/docs/technical/ai/structured-data.md)
- [OpenRouter Models](https://openrouter.ai/models)
- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)