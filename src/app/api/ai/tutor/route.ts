import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { streamTutorResponse } from "@/lib/ai/gemini";
import { getOrCreateChatSession, saveChatMessage } from "@/lib/ai/chat-store";
import type { TutorRequest } from "@/lib/ai/types";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = authData.user.id;
    const body = (await request.json()) as TutorRequest;

    const sessionId = await getOrCreateChatSession({
      supabase,
      userId,
      sessionId: body.sessionId,
      subject: body.subject,
    });

    // Save user's incoming message
    await saveChatMessage({
      supabase,
      userId,
      sessionId,
      message: { role: "user", content: body.message },
    });

    const { stream, model } = await streamTutorResponse(body);

    const readable = new ReadableStream({
      async start(controller) {
        // Send meta with session ID
        controller.enqueue(
          new TextEncoder().encode(
            `event: meta\ndata: ${JSON.stringify({ sessionId })}\n\n`
          )
        );

        let fullAssistantMessage = "";

        try {
          for await (const chunk of stream) {
            fullAssistantMessage += chunk;
            // Send token chunk
            controller.enqueue(
              new TextEncoder().encode(
                `event: token\ndata: ${JSON.stringify({ token: chunk })}\n\n`
              )
            );
          }

          // Save assistant's full response when stream finishes
          await saveChatMessage({
            supabase,
            userId,
            sessionId,
            message: { role: "assistant", content: fullAssistantMessage },
            model,
          });
        } catch (streamErr) {
          console.error("Stream error:", streamErr);
          controller.enqueue(
            new TextEncoder().encode(
              `event: error\ndata: ${JSON.stringify({ error: "Stream interrupted." })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Tutor API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Tutor unavailable" },
      { status: 500 }
    );
  }
}
