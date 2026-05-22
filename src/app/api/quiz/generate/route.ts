import { NextResponse, type NextRequest } from "next/server";

import { checkRateLimit } from "@/lib/ai/rate-limit";
import { generateAdaptiveQuiz } from "@/lib/quiz/gemini-quiz";
import { quizGenerationRequestSchema } from "@/lib/quiz/schema";
import { saveGeneratedQuiz } from "@/lib/quiz/store";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = quizGenerationRequestSchema.parse(await request.json());
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await checkRateLimit(`quiz:${user.id}`, 8, 60_000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many quiz generations. Try again shortly." },
        { status: 429 },
      );
    }

    const quiz = await generateAdaptiveQuiz(body);
    const savedQuiz = await saveGeneratedQuiz({
      supabase,
      userId: user.id,
      quiz,
    });

    return NextResponse.json({ quiz: savedQuiz });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not generate quiz.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
