"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { BookOpenCheck, Brain, Loader2, Send, Sparkles } from "lucide-react";

import { MarkdownMessage } from "@/components/ai/markdown-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TutorMessage, TutorSubject } from "@/lib/ai/types";
import { cn } from "@/lib/utils";

const subjects: TutorSubject[] = [
  "Physics",
  "Chemistry",
  "Math",
  "Biology",
  "General",
];

const starterPrompts = [
  "Explain rotational dynamics with one JEE-style example.",
  "Create a 25-minute revision plan for coordination compounds.",
  "Find my weak areas from the last mock and suggest next steps.",
];

function parseSseEvents(buffer: string) {
  const events = buffer.split("\n\n");
  return {
    complete: events.slice(0, -1),
    rest: events.at(-1) ?? "",
  };
}

export function AiTutorChat({
  initialMessages = [],
}: {
  initialMessages?: TutorMessage[];
}) {
  const [messages, setMessages] = useState<TutorMessage[]>(
    initialMessages.length
      ? initialMessages
      : [
          {
            role: "assistant",
            content:
              "Hi. I am your AI tutor. Pick a subject and ask me a doubt, request a practice plan, or paste a question you want solved step by step.",
          },
        ],
  );
  const [subject, setSubject] = useState<TutorSubject>("Physics");
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string>();
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string>();
  const abortRef = useRef<AbortController | null>(null);

  const recentHistory = useMemo(
    () =>
      messages
        .filter((message) => message.role !== "system")
        .slice(-8)
        .map(({ role, content }) => ({ role, content })),
    [messages],
  );

  async function submitMessage(messageText: string) {
    const trimmed = messageText.trim();

    if (!trimmed || isStreaming) {
      return;
    }

    const userMessage: TutorMessage = { role: "user", content: trimmed };
    const assistantIndex = messages.length + 1;

    setMessages((current) => [
      ...current,
      userMessage,
      { role: "assistant", content: "" },
    ]);
    setInput("");
    setError(undefined);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          subject,
          sessionId,
          history: recentHistory,
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "The AI tutor is unavailable.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const parsed = parseSseEvents(buffer);
        buffer = parsed.rest;

        for (const eventBlock of parsed.complete) {
          const lines = eventBlock.split("\n");
          const eventName =
            lines.find((line) => line.startsWith("event: "))?.slice(7) ??
            "message";
          const dataLine = lines.find((line) => line.startsWith("data: "));
          const data = dataLine ? JSON.parse(dataLine.slice(6)) : {};

          if (eventName === "meta" && data.sessionId) {
            setSessionId(data.sessionId);
          }

          if (eventName === "token" && data.token) {
            setMessages((current) =>
              current.map((message, index) =>
                index === assistantIndex
                  ? { ...message, content: message.content + data.token }
                  : message,
              ),
            );
          }

          if (eventName === "error") {
            throw new Error(data.error ?? "The AI tutor stopped responding.");
          }
        }
      }
    } catch (caughtError) {
      if (
        caughtError instanceof DOMException &&
        caughtError.name === "AbortError"
      ) {
        setError("Response stopped.");
      } else {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "The AI tutor could not respond.",
        );
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitMessage(input);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <Card className="min-h-[680px] shadow-sm">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="text-primary size-5" aria-hidden="true" />
                AI Tutor
              </CardTitle>
              <CardDescription>
                Streaming Gemini responses with subject-aware teaching.
              </CardDescription>
            </div>
            <Badge variant="glass">
              <Sparkles className="mr-1 size-3.5" aria-hidden="true" />
              {subject}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex min-h-[600px] flex-col p-0">
          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[min(760px,92%)] rounded-lg border p-4",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card",
                  )}
                >
                  {message.content ? (
                    <MarkdownMessage
                      content={message.content}
                      className={
                        message.role === "user"
                          ? "text-primary-foreground [&_code]:bg-primary-foreground/15"
                          : undefined
                      }
                    />
                  ) : (
                    <div className="grid gap-2">
                      <Skeleton className="h-4 w-44" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {error ? (
            <div className="border-destructive/40 bg-destructive/10 text-destructive mx-4 mb-3 rounded-md border p-3 text-sm sm:mx-5">
              {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="border-t p-4 sm:p-5">
            <div className="flex flex-wrap gap-2 pb-3">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="bg-background text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md border px-3 py-1.5 text-left text-xs transition-colors"
                  onClick={() => setInput(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <textarea
                className="bg-background focus:border-ring min-h-14 flex-1 resize-none rounded-md border px-3 py-2 text-sm transition-colors outline-none"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask a doubt, paste a question, or request a study plan..."
                disabled={isStreaming}
              />
              <Button
                type={isStreaming ? "button" : "submit"}
                size="icon"
                className="h-14 w-14"
                onClick={
                  isStreaming
                    ? () => {
                        abortRef.current?.abort();
                      }
                    : undefined
                }
                aria-label={isStreaming ? "Stop response" : "Send message"}
              >
                {isStreaming ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Send className="size-5" />
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <aside className="grid content-start gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Subject mode</CardTitle>
            <CardDescription>
              Prompts adapt tone, examples, and exam strategy.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {subjects.map((item) => (
              <button
                key={item}
                type="button"
                className={cn(
                  "hover:bg-secondary rounded-md border px-3 py-2 text-left text-sm transition-colors",
                  subject === item && "border-primary bg-primary/10",
                )}
                onClick={() => setSubject(item)}
              >
                {item}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Memory and history</CardTitle>
            <CardDescription>
              The tutor uses recent messages and saves chat turns to Supabase.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground grid gap-3 text-sm">
            <div className="flex items-center gap-3">
              <BookOpenCheck className="text-primary size-4" />
              Last 8 turns are sent as context.
            </div>
            <div className="flex items-center gap-3">
              <Brain className="text-primary size-4" />
              Responses are stored after streaming completes.
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
