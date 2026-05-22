import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listContentArtifacts, getContentArtifactById } from "@/lib/content/store";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const artifact = await getContentArtifactById({
        supabase,
        userId: authData.user.id,
        artifactId: id,
      });
      return NextResponse.json({ artifact });
    } else {
      const artifacts = await listContentArtifacts({
        supabase,
        userId: authData.user.id,
      });
      return NextResponse.json({ artifacts });
    }
  } catch (error) {
    console.error("Content retrieval error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Retrieval failed" },
      { status: 500 }
    );
  }
}
