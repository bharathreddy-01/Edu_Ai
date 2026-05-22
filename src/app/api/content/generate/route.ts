import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateContentArtifact } from "@/lib/content/gemini-content";
import { saveContentArtifact } from "@/lib/content/store";
import type { ContentGenerationRequest } from "@/lib/content/types";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as ContentGenerationRequest;
    
    // Generate the artifact via Gemini
    const artifact = await generateContentArtifact(body);

    // Save to database
    const savedArtifact = await saveContentArtifact({
      supabase,
      userId: authData.user.id,
      artifact,
    });

    return NextResponse.json({ artifact: savedArtifact });
  } catch (error) {
    console.error("Content generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
