# Gemini AI Tutor

Production architecture for the conversational AI tutor.

## Architecture

- UI: `src/components/ai/ai-tutor-chat.tsx`
- Markdown renderer: `src/components/ai/markdown-message.tsx`
- Protected route: `src/app/(protected)/ai-tutor/page.tsx`
- Streaming API route: `src/app/api/ai/tutor/route.ts`
- Gemini service: `src/lib/ai/gemini.ts`
- Prompt builder: `src/lib/ai/prompts.ts`
- Rate limiter: `src/lib/ai/rate-limit.ts`
- Supabase persistence: `src/lib/ai/chat-store.ts`

## Features

- Conversational AI tutor powered by Google Gemini.
- Streaming Server-Sent Events responses.
- Markdown rendering with GitHub-flavored markdown.
- Syntax highlighting for fenced code blocks.
- Subject-aware prompts for Physics, Chemistry, Math, Biology, and General.
- Educational tone with step-by-step explanations and practice prompts.
- Short-term context memory from recent chat turns.
- Chat session and message saving in Supabase.
- Authenticated API route and route protection.
- In-memory per-user rate limiting.

## Environment

```env
GEMINI_API_KEY="your-google-gemini-api-key"
GEMINI_MODEL="gemini-2.5-flash"
```

## Best Practices

- Keep `GEMINI_API_KEY` server-only.
- Use RLS on `ai_chat_sessions` and `ai_chat_messages`.
- Stream responses for perceived speed and better UX.
- Save the assistant message after streaming completes.
- Keep prompts subject-aware but concise.
- Replace the in-memory limiter with Redis or Upstash before multi-instance
  deployment.
