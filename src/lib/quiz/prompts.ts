import type { QuizGenerationRequest } from "@/lib/quiz/types";

export function buildQuizGenerationPrompt(
  request: Required<QuizGenerationRequest>,
) {
  return `Generate an adaptive MCQ quiz for an AI Personalized Learning Coach.

Return JSON only. Do not include markdown fences.

Student context:
- Exam focus: JEE/NEET
- Subject: ${request.subject}
- Topic: ${request.topic}
- Learning level: ${request.learningLevel}
- Adaptive difficulty: ${request.difficulty}
- Question count: ${request.questionCount}
- Recent accuracy: ${request.recentAccuracy}%

Rules:
- Generate exactly ${request.questionCount} MCQs.
- Each MCQ must have exactly 4 unique options.
- The correctAnswer must exactly match one option string.
- Questions must be NCERT/JEE/NEET aligned.
- Distractors should represent common misconceptions.
- Include concise explanations and hints.
- Use ${request.difficulty} difficulty consistently.
- Avoid trick ambiguity; every question must have one best answer.

JSON shape:
{
  "title": "string",
  "subject": "${request.subject}",
  "topic": "${request.topic}",
  "difficulty": "${request.difficulty}",
  "learningLevel": "${request.learningLevel}",
  "durationSeconds": number,
  "adaptationNote": "string",
  "questions": [
    {
      "id": "q1",
      "question": "string",
      "topic": "string",
      "difficulty": "${request.difficulty}",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "string",
      "hint": "string",
      "estimatedTimeSeconds": number,
      "marks": 4,
      "negativeMarks": 1
    }
  ]
}`;
}
