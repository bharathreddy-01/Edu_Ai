import type { TutorSubject } from "@/lib/ai/types";
import type { LearningLevel, DifficultLevel } from "@/types";

export const quizPromptTemplates = {
  generate: {
    base: `You are a JEE/NEET quiz generator. Generate educational quiz questions that test deep understanding, not just recall.

GUIDELINES:
- Each question must have a single, unambiguous correct answer
- For MCQs, create 4 distractors that test common misconceptions
- Include a brief explanation for why the correct answer is right
- Ensure questions align with NCERT and JEE/NEET syllabus
- Vary question types: conceptual, numerical, application-based`,

    byDifficulty: {
      easy: `Generate foundational questions that:
- Test core concept understanding
- Require basic calculations
- Are direct applications of formulas
- Should take 1-2 minutes to solve`,

      medium: `Generate intermediate questions that:
- Require combining 2-3 concepts
- Involve multi-step calculations
- Test conceptual application
- Should take 3-5 minutes to solve`,

      hard: `Generate challenging questions that:
- Require integrating multiple topics
- Test edge cases and exceptions
- Are typical JEE Advanced questions
- Should take 5-10 minutes to solve`,

      expert: `Generate expert-level questions that:
- Require innovative problem-solving approaches
- Test deep conceptual mastery
- May have non-obvious solutions
- Are typical JEE Advanced final questions
- Should take 10-15 minutes to solve`,
    },

    bySubject: {
      Physics: `Physics-specific guidelines:
- Include proper SI units in all quantities
- Show force diagrams conceptually if relevant
- Test understanding of physical intuition
- Include common numerical mistakes students make
- Connect to experimental verification when relevant`,

      Chemistry: `Chemistry-specific guidelines:
- For organic chemistry: test mechanism understanding
- For inorganic: test structure-property relationships
- For physical: balance concept and calculation
- Include NCERT-aligned terminology
- Test periodic trends and exceptions`,

      Math: `Math-specific guidelines:
- Test proof techniques and logical reasoning
- Include questions with multiple valid approaches
- For calculus: test conceptual understanding of limits
- For algebra: test pattern recognition
- Include "which statement is false" style questions`,

      Biology: `Biology-specific guidelines:
- Use exact NCERT terminology
- Test diagram interpretation skills
- Include questions on mechanisms and processes
- Test recall of sequences and hierarchies
- Include health and disease application questions`,
    },
  },

  evaluateAnswer: {
    base: `You are an expert educator evaluating student answers.

EVALUATION CRITERIA:
1. Correctness: Is the final answer right?
2. Methodology: Is the approach sound?
3. Reasoning: Are intermediate steps justified?
4. Completeness: Are all steps shown?
5. Clarity: Is the answer clearly expressed?

PROVIDE:
- Correctness assessment (% score if applicable)
- Explanation of the correct approach
- Identification of any errors or misconceptions
- Specific feedback on reasoning quality
- Suggestions for improvement`,

    rubric: {
      perfect: "Student demonstrates complete understanding with correct answer and clear reasoning",
      good: "Student shows good understanding with minor gaps or presentation issues",
      partial: "Student shows partial understanding with some correct elements and some errors",
      weak: "Student shows limited understanding with significant conceptual errors",
      incorrect: "Student's answer is incorrect with fundamental misunderstandings",
    },
  },

  quizGenerationTemplate: `Generate a quiz question for {subject} at {difficulty} level, targeting {learningLevel} students.

TOPIC: {topic}
FORMAT: {format}
TIME LIMIT: {timeLimit} minutes

Requirements:
- Single correct answer (unless explicitly multiple choice)
- Tests {testType} understanding
- Aligned with NCERT syllabus
- Includes common misconception distractors
- Explanation provided

Output as JSON:
{
  "question": "...",
  "type": "mcq|short-answer|essay",
  "options": ["...", "...", "...", "..."] // for MCQ
  "correct_answer": "...",
  "explanation": "...",
  "difficulty": "{difficulty}",
  "estimated_time": {timeLimit},
  "keywords": ["...", "..."],
  "hint": "...",
  "follow_up": "..."
}`,
};

export function buildQuizGenerationPrompt(
  subject: TutorSubject,
  difficulty: DifficultLevel,
  level: LearningLevel,
  topic: string,
  questionType: "mcq" | "short-answer" | "essay" = "mcq"
): string {
  const template = quizPromptTemplates.generate.base;
  const difficultyGuide = quizPromptTemplates.generate.byDifficulty[difficulty];
  const subjectGuide =
    subject in quizPromptTemplates.generate.bySubject
      ? quizPromptTemplates.generate.bySubject[
          subject as keyof typeof quizPromptTemplates.generate.bySubject
        ]
      : "General guidelines:\n- Balance concept and application\n- Encourage logical step-by-step reasoning";

  return [
    template,
    "",
    difficultyGuide,
    "",
    subjectGuide,
    "",
    `Generate a ${difficulty} ${questionType} question on "${topic}" for ${level} level students`,
  ].join("\n");
}

export function buildAnswerEvaluationPrompt(
  subject: TutorSubject,
  studentAnswer: string,
  correctAnswer: string,
  questionContext: string
): string {
  return [
    quizPromptTemplates.evaluateAnswer.base,
    "",
    "RUBRIC CRITERIA:",
    Object.entries(quizPromptTemplates.evaluateAnswer.rubric)
      .map(([level, desc]) => `- ${level}: ${desc}`)
      .join("\n"),
    "",
    `SUBJECT: ${subject}`,
    "",
    `QUESTION: ${questionContext}`,
    "",
    `CORRECT ANSWER: ${correctAnswer}`,
    "",
    `STUDENT ANSWER: ${studentAnswer}`,
    "",
    'PROVIDE EVALUATION IN JSON FORMAT:',
    `{
  "score": 0-100,
  "level": "perfect|good|partial|weak|incorrect",
  "correctness": true|false,
  "strengths": ["..."],
  "errors": ["..."],
  "misconceptions": ["..."],
  "feedback": "...",
  "suggestions": ["..."],
  "next_steps": ["..."]
}`,
  ].join("\n");
}

export const quizStructureTemplate = `QUIZ STRUCTURE - Generate a complete quiz with this format:

{
  "quiz_metadata": {
    "title": "string",
    "subject": "Physics|Chemistry|Math|Biology",
    "difficulty": "easy|medium|hard|expert",
    "learning_level": "beginner|intermediate|advanced",
    "total_questions": number,
    "estimated_duration_minutes": number,
    "topics_covered": ["string"],
    "created_at": "ISO-8601"
  },
  "questions": [
    {
      "id": "q1",
      "question": "string",
      "type": "mcq|short-answer|essay",
      "difficulty": "easy|medium|hard|expert",
      "topic": "string",
      "options": ["Option A", "Option B", "Option C", "Option D"], // MCQ only
      "correct_answer": "string",
      "explanation": "string",
      "keywords": ["keyword1", "keyword2"],
      "hints": ["hint1", "hint2"],
      "estimated_time_seconds": 120,
      "common_mistakes": ["mistake1", "mistake2"]
    }
  ],
  "answer_key": {
    "passing_score_percent": 75,
    "total_points": 100,
    "distribution": {
      "recall": "20%",
      "application": "50%",
      "analysis": "30%"
    }
  }
}`;
