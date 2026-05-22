import { NextResponse, type NextRequest } from "next/server";

import { quizSubmissionRequestSchema } from "@/lib/quiz/schema";
import { scoreQuiz } from "@/lib/quiz/scoring";
import { loadQuizForScoring, saveQuizAttempt } from "@/lib/quiz/store";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = quizSubmissionRequestSchema.parse(await request.json());
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quiz = await loadQuizForScoring({
      supabase,
      quizId: body.quizId,
    });
    const result = scoreQuiz({
      questions: quiz.questions,
      answers: body.answers,
      difficulty: quiz.difficulty,
    });
    const attemptId = await saveQuizAttempt({
      supabase,
      userId: user.id,
      quizId: body.quizId,
      result,
      timeSpentSeconds: body.timeSpentSeconds,
    });

    return NextResponse.json({ result: { ...result, attemptId } });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not submit quiz.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
