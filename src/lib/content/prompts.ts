import type { ContentGenerationRequest } from "@/lib/content/types";

const artifactInstructions: Record<
  ContentGenerationRequest["artifactType"],
  string
> = {
  notes:
    "Create premium, exam-ready notes with concept flow, examples, common traps, and compact recap blocks.",
  summary:
    "Create a chapter summary that compresses the highest-yield ideas into scannable explanations and final revision checkpoints.",
  flashcards:
    "Create active-recall flashcards with concise answers, mixed difficulty, and JEE/NEET style conceptual traps.",
  revision_sheet:
    "Create a one-session revision sheet with must-know concepts, question patterns, quick checks, and a time-boxed plan.",
  formula_sheet:
    "Create a formula sheet with variables, use cases, exception notes, and problem-solving cues.",
  mind_map:
    "Create a hierarchical mind map plus a readable markdown outline that connects prerequisites, core ideas, and applications.",
};

export function buildContentGenerationPrompt(request: ContentGenerationRequest) {
  const sourceContext = request.sourceText
    ? `Use this source material as the primary reference:\n${request.sourceText}`
    : "Use standard JEE/NEET preparation knowledge for this chapter. Do not invent niche facts.";

  return `
You are an expert AI content intelligence engine for an Indian exam-prep learning platform.
Generate a structured artifact for a student.

Artifact type: ${request.artifactType}
Subject: ${request.subject}
Chapter: ${request.chapter}
Learning level: ${request.learningLevel}
Student focus: ${request.focus || "Balanced concept clarity and exam readiness"}

Specific instruction:
${artifactInstructions[request.artifactType]}

${sourceContext}

Return valid JSON only. No markdown fences.
The JSON must match this shape:
{
  "artifactType": "${request.artifactType}",
  "subject": "${request.subject}",
  "chapter": "${request.chapter}",
  "title": "string",
  "markdown": "string with markdown headings, lists, tables where useful, and math-friendly notation",
  "structured": {
    "sections": [{ "heading": "string", "bullets": ["string"] }],
    "flashcards": [{ "front": "string", "back": "string", "difficulty": "easy|medium|hard" }],
    "formulas": [{ "name": "string", "formula": "string", "useCase": "string" }],
    "mindMap": { "label": "string", "children": [{ "label": "string" }] },
    "examTips": ["string"],
    "revisionPlan": ["string"]
  },
  "metadata": {
    "estimatedRevisionMinutes": 30,
    "keyTerms": ["string"],
    "generatedAt": "${new Date().toISOString()}"
  }
}

Quality rules:
- Keep explanations student-friendly, direct, and accurate.
- Prefer exam-useful depth over generic textbook narration.
- Include enough flashcards even when the requested artifact is not flashcards.
- Include formulas only when relevant; otherwise return an empty array.
- The markdown must be immediately renderable in a learning dashboard.
- Avoid unsafe certainty; say "commonly tested" instead of guaranteeing exam appearance.
`.trim();
}
