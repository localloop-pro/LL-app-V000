# React Markdown Rendering

> **Stack:** Next.js 14+ + react-markdown + Shadcn
> **Purpose:** Render AI-generated markdown content beautifully

---

## Overview

When AI generates markdown content (Digital Twin responses, generated descriptions, etc.), we need to render it properly with consistent styling that matches the Shadcn design system.

---

## Dependencies

```bash
pnpm add react-markdown remark-gfm rehype-highlight rehype-sanitize
```

---

## Basic Markdown Component

```tsx
// components/markdown.tsx
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <ReactMarkdown
      className={cn("prose prose-sm dark:prose-invert max-w-none", className)}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight, rehypeSanitize]}
      components={{
        // Custom heading styles
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-semibold mt-5 mb-3">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-medium mt-4 mb-2">{children}</h3>
        ),
        
        // Paragraph
        p: ({ children }) => (
          <p className="mb-4 leading-relaxed">{children}</p>
        ),
        
        // Lists
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-sm">{children}</li>
        ),
        
        // Links
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        
        // Code blocks
        code: ({ inline, className, children }) => {
          if (inline) {
            return (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            );
          }
          return (
            <code className={cn("block bg-muted p-4 rounded-lg overflow-x-auto", className)}>
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="bg-muted rounded-lg overflow-x-auto mb-4">
            {children}
          </pre>
        ),
        
        // Blockquotes
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
            {children}
          </blockquote>
        ),
        
        // Tables
        table: ({ children }) => (
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full divide-y divide-border">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-muted">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2 text-left text-sm font-semibold">{children}</th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 text-sm border-t">{children}</td>
        ),
        
        // Horizontal rule
        hr: () => <hr className="my-6 border-border" />,
        
        // Strong/Bold
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),
        
        // Emphasis/Italic
        em: ({ children }) => (
          <em className="italic">{children}</em>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
```

---

## Streaming Markdown (for AI responses)

```tsx
// components/streaming-markdown.tsx
"use client";

import { useEffect, useState } from "react";
import { Markdown } from "./markdown";
import { cn } from "@/lib/utils";

interface StreamingMarkdownProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
}

export function StreamingMarkdown({ 
  content, 
  isStreaming = false,
  className 
}: StreamingMarkdownProps) {
  const [displayedContent, setDisplayedContent] = useState(content);

  useEffect(() => {
    setDisplayedContent(content);
  }, [content]);

  return (
    <div className={cn("relative", className)}>
      <Markdown content={displayedContent} />
      
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
      )}
    </div>
  );
}
```

---

## Chat Message with Markdown

```tsx
// components/chat-message.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Markdown } from "@/components/markdown";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  avatarUrl?: string;
  timestamp?: Date;
}

export function ChatMessage({ role, content, avatarUrl, timestamp }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div
        className={cn(
          "rounded-lg px-4 py-2 max-w-[80%]",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <Markdown 
            content={content} 
            className={cn(
              "prose-sm",
              "prose-p:mb-2 prose-p:last:mb-0",
              "prose-ul:my-2 prose-ol:my-2",
              "prose-li:my-0"
            )}
          />
        )}
        
        {timestamp && (
          <span className="text-xs opacity-50 mt-1 block">
            {timestamp.toLocaleTimeString()}
          </span>
        )}
      </div>
      
      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
```

---

## Code Block with Copy Button

```tsx
// components/code-block.tsx
"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative group", className)}>
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {language && (
        <div className="absolute left-2 top-2 text-xs text-muted-foreground">
          {language}
        </div>
      )}
      
      <pre className="bg-muted rounded-lg p-4 pt-8 overflow-x-auto">
        <code className="text-sm font-mono">{code}</code>
      </pre>
    </div>
  );
}
```

---

## Enhanced Markdown with Code Blocks

```tsx
// components/enhanced-markdown.tsx
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";
import { cn } from "@/lib/utils";

interface EnhancedMarkdownProps {
  content: string;
  className?: string;
}

export function EnhancedMarkdown({ content, className }: EnhancedMarkdownProps) {
  return (
    <ReactMarkdown
      className={cn("prose prose-sm dark:prose-invert max-w-none", className)}
      remarkPlugins={[remarkGfm]}
      components={{
        code: ({ inline, className, children }) => {
          const match = /language-(\w+)/.exec(className || "");
          const code = String(children).replace(/\n$/, "");
          
          if (!inline && match) {
            return <CodeBlock code={code} language={match[1]} />;
          }
          
          if (!inline) {
            return <CodeBlock code={code} />;
          }
          
          return (
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
              {children}
            </code>
          );
        },
        pre: ({ children }) => <>{children}</>,
        // ... other component overrides
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
```

---

## Usage in Digital Twin Chat

```tsx
// components/twin-chat.tsx
import { ChatMessage } from "@/components/chat-message";

export function TwinChat({ cardId, businessName, businessLogo }) {
  const { messages, sendMessage, isLoading } = useChat({
    api: "/api/twin-chat",
    body: { cardId },
  });

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          role={message.role}
          content={
            message.parts
              .filter((p) => p.type === "text")
              .map((p) => p.text)
              .join("")
          }
          avatarUrl={message.role === "assistant" ? businessLogo : undefined}
        />
      ))}
    </div>
  );
}
```

---

## Business Description Display

```tsx
// components/business-description.tsx
import { Markdown } from "@/components/markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BusinessDescriptionProps {
  description: string;
  businessName: string;
}

export function BusinessDescription({ description, businessName }: BusinessDescriptionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About {businessName}</CardTitle>
      </CardHeader>
      <CardContent>
        <Markdown 
          content={description} 
          className="prose-p:text-muted-foreground"
        />
      </CardContent>
    </Card>
  );
}
```

---

## Sanitization for User Content

Always sanitize user-generated or AI-generated content:

```tsx
// components/safe-markdown.tsx
import ReactMarkdown from "react-markdown";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

// Custom schema that allows safe elements only
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // Allow class on code for syntax highlighting
    code: ["className"],
    // Allow href on links but only http/https
    a: ["href"],
  },
  protocols: {
    href: ["http", "https", "mailto"],
  },
};

export function SafeMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
    >
      {content}
    </ReactMarkdown>
  );
}
```

---

## Syntax Highlighting Theme

Add to your global CSS:

```css
/* styles/highlight.css */
@import "highlight.js/styles/github-dark.css";

/* Or for light/dark mode support */
.dark pre code {
  /* dark theme overrides */
}

pre code {
  /* light theme */
}
```

Import in your layout:

```tsx
// app/layout.tsx
import "@/styles/highlight.css";
```

---

## Related Documentation

- [AI Streaming](/docs/technical/ai/streaming.md)
- [react-markdown](https://github.com/remarkjs/react-markdown)
- [Shadcn Typography](https://ui.shadcn.com/docs/components/typography)