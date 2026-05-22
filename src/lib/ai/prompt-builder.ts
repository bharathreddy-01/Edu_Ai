import type {
  TutorSubject,
  SystemPromptConfig,
  TutorRequest,
  QuizQuestion,
} from "@/lib/ai/types";
import type { LearningLevel, DifficultLevel } from "@/types";
import {
  buildTutorSystemPrompt,
  buildQuizSystemPrompt,
  buildEvaluationSystemPrompt,
  buildStudyPlannerSystemPrompt,
  contextualPrompts,
  knowledgeBoundaries,
} from "@/lib/ai/system-prompts";
import {
  buildQuizGenerationPrompt,
  buildAnswerEvaluationPrompt,
} from "@/lib/ai/quiz-prompts";
import {
  buildConceptAssessmentPrompt,
  buildPerformanceReviewPrompt,
  buildMisconceptionCorrectionPrompt,
} from "@/lib/ai/evaluation-prompts";
import {
  buildStudyPlanGenerationPrompt,
  buildProgressTrackingPrompt,
  buildWeakAreaRecoveryPrompt,
  buildExamReadinessPrompt,
} from "@/lib/ai/study-planner-prompts";

/**
 * Comprehensive prompt builder for all tutoring scenarios
 */
export class PromptBuilder {
  /**
   * Build complete tutoring system prompt with context
   */
  static buildTutoringPrompt(
    request: TutorRequest,
    additionalContext?: string
  ): string {
    const config: SystemPromptConfig = {
      subject: request.subject,
      learningLevel: request.learningLevel || "intermediate",
      mode: request.mode || "tutoring",
      context: additionalContext,
      safetyLevel: "moderate",
    };

    return buildTutorSystemPrompt(config);
  }

  /**
   * Build quiz generation prompt with full context
   */
  static buildQuizPrompt(
    subject: TutorSubject,
    difficulty: DifficultLevel,
    level: LearningLevel,
    topic: string,
    numberOfQuestions = 5,
    questionType: "mcq" | "short-answer" | "essay" = "mcq"
  ): string {
    const systemPrompt = buildQuizSystemPrompt(subject, level);

    return [
      systemPrompt,
      "",
      `QUIZ GENERATION REQUEST:
- Number of Questions: ${numberOfQuestions}
- Topic: ${topic}
- Question Type: ${questionType}
- Difficulty Level: ${difficulty}`,
      "",
      buildQuizGenerationPrompt(subject, difficulty, level, topic, questionType),
    ].join("\n");
  }

  /**
   * Build answer evaluation prompt
   */
  static buildEvaluationPrompt(
    subject: TutorSubject,
    level: LearningLevel,
    studentAnswer: string,
    correctAnswer: string,
    questionContext: string
  ): string {
    const systemPrompt = buildEvaluationSystemPrompt(subject, level);

    return [
      systemPrompt,
      "",
      buildAnswerEvaluationPrompt(
        subject,
        studentAnswer,
        correctAnswer,
        questionContext
      ),
    ].join("\n");
  }

  /**
   * Build study plan generation prompt
   */
  static buildStudyPlanPrompt(
    subject: TutorSubject,
    level: LearningLevel,
    availableHoursPerWeek: number,
    totalWeeks: number,
    currentTopics?: string[],
    targetTopics?: string[]
  ): string {
    const systemPrompt = buildStudyPlannerSystemPrompt(subject, level);

    return [
      systemPrompt,
      "",
      buildStudyPlanGenerationPrompt(
        subject,
        level,
        availableHoursPerWeek,
        totalWeeks,
        currentTopics,
        targetTopics
      ),
    ].join("\n");
  }

  /**
   * Build concept assessment prompt
   */
  static buildConceptAssessmentPrompt(
    subject: TutorSubject,
    level: LearningLevel,
    concept: string,
    studentResponse: string
  ): string {
    return buildConceptAssessmentPrompt(subject, level, concept, studentResponse);
  }

  /**
   * Build misconception correction prompt
   */
  static buildMisconceptionCorrectionPrompt(
    concept: string,
    studentMisconception: string,
    subject: TutorSubject
  ): string {
    return buildMisconceptionCorrectionPrompt(
      concept,
      studentMisconception,
      subject
    );
  }

  /**
   * Build progress tracking and adjustment prompt
   */
  static buildProgressTrackingPrompt(
    subject: TutorSubject,
    weekNumber: number,
    plannedTopics: string[],
    completedTopics: string[],
    assessmentScores: number[]
  ): string {
    return buildProgressTrackingPrompt(
      subject,
      weekNumber,
      plannedTopics,
      completedTopics,
      assessmentScores
    );
  }

  /**
   * Build weak area recovery prompt
   */
  static buildWeakAreaRecoveryPrompt(
    subject: TutorSubject,
    weakTopic: string,
    level: LearningLevel,
    diagnosticResults: string
  ): string {
    return buildWeakAreaRecoveryPrompt(
      subject,
      weakTopic,
      level,
      diagnosticResults
    );
  }

  /**
   * Build exam readiness prompt
   */
  static buildExamReadinessPrompt(
    subject: TutorSubject,
    weeksToExam: number,
    studentProfile: string
  ): string {
    return buildExamReadinessPrompt(subject, weeksToExam, studentProfile);
  }

  /**
   * Build contextual teaching prompt
   */
  static buildContextualPrompt(
    context: "conceptExplainer" | "problemSolver" | "examPrepper" | "conceptCorrector",
    basePrompt: string
  ): string {
    const contextGuidance =
      contextualPrompts[
        context as keyof typeof contextualPrompts
      ];
    return [basePrompt, "", contextGuidance].join("\n");
  }

  /**
   * Build performance review prompt
   */
  static buildPerformanceReviewPrompt(
    subject: TutorSubject,
    level: LearningLevel,
    testResults: string,
    totalScore: number,
    maxScore: number
  ): string {
    return buildPerformanceReviewPrompt(
      subject,
      level,
      testResults,
      totalScore,
      maxScore
    );
  }

  /**
   * Get subject-specific safety guidelines
   */
  static getSafetyGuidelines(subject: TutorSubject): string {
    const guidelines: Record<TutorSubject, string> = {
      Physics:
        "Verify all formulas and physical constants. Ensure dimensional analysis is correct. Connect to real-world physics principles.",
      Chemistry:
        "Verify all compounds and reactions are from NCERT. Check oxidation states and bonding explanations. Follow standard reaction mechanisms.",
      Math: "Ensure all proofs have logical continuity. Verify algebraic steps don't have division by zero. Check theorem conditions are met.",
      Biology:
        "Use exact NCERT terminology. Verify anatomical structures and processes match NCERT. Follow official classification systems.",
      General:
        "Maintain educational integrity. Focus on learning outcomes. Avoid shortcuts that skip understanding.",
    };

    return guidelines[subject];
  }

  /**
   * Build multi-part tutoring session prompt
   */
  static buildSessionPrompt(
    subject: TutorSubject,
    level: LearningLevel,
    topicProgression: string[],
    assessmentStrategy?: string
  ): string {
    const systemPrompt = buildTutorSystemPrompt({
      subject,
      learningLevel: level,
      mode: "tutoring",
    });

    return [
      systemPrompt,
      "",
      `SESSION PLAN:
Topics to cover (in progression):
${topicProgression.map((t, i) => `${i + 1}. ${t}`).join("\n")}`,
      "",
      assessmentStrategy
        ? `Assessment Strategy: ${assessmentStrategy}`
        : "Assessment: Use formative assessments after each major topic",
    ].join("\n");
  }

  /**
   * Add safety layer to any prompt
   */
  static addSafetyLayer(prompt: string, safetyLevel: "strict" | "moderate" | "flexible" = "moderate"): string {
    const safetyMessages = {
      strict: `IMPORTANT SAFETY REMINDERS:
1. Refuse any requests for exam answers or leaked papers
2. Do not help with academic dishonesty
3. Verify all facts against NCERT curriculum
4. Admit uncertainty rather than guess
5. If student seems distressed, suggest professional help`,
      moderate: `SAFETY REMINDERS:
1. Maintain academic integrity
2. Verify key facts are correct
3. Acknowledge knowledge limitations
4. Keep responses educationally appropriate`,
      flexible: `REMEMBER:
1. Maintain educational standards
2. Acknowledge uncertainty
3. Prioritize learning outcomes`,
    };

    return [prompt, "", "---", safetyMessages[safetyLevel]].join("\n");
  }

  /**
   * Build step-by-step problem-solving prompt
   */
  static buildProblemSolvingPrompt(
    subject: TutorSubject,
    problem: string,
    level: LearningLevel
  ): string {
    const systemPrompt = buildTutorSystemPrompt({
      subject,
      learningLevel: level,
      mode: "tutoring",
    });

    return [
      systemPrompt,
      "",
      `PROBLEM TO SOLVE:
${problem}`,
      "",
      `TEACHING APPROACH:
1. First, ask if the student needs clarification
2. Help identify what concepts are involved
3. Guide through each step without giving answers
4. Check understanding at each step
5. Provide a similar practice problem`,
      "",
      contextualPrompts.problemSolver,
    ].join("\n");
  }

  /**
   * Get all boundary information
   */
  static getKnowledgeBoundaries(): typeof knowledgeBoundaries {
    return knowledgeBoundaries;
  }

  /**
   * Create prompt for multi-subject integration
   */
  static buildIntegrationPrompt(
    subjects: TutorSubject[],
    level: LearningLevel,
    topic: string
  ): string {
    const systemPrompt = buildTutorSystemPrompt({
      subject: "General",
      learningLevel: level,
      mode: "tutoring",
    });

    return [
      systemPrompt,
      "",
      `MULTI-SUBJECT INTEGRATION:
Topic: ${topic}
Related Subjects: ${subjects.join(", ")}`,
      "",
      "Help student understand how these subjects interconnect around this topic.",
      "Show examples from each subject where relevant.",
      "Highlight common principles that apply across subjects.",
    ].join("\n");
  }

  /**
   * Build adaptive difficulty prompt
   */
  static buildAdaptiveDifficultyPrompt(
    subject: TutorSubject,
    currentLevel: LearningLevel,
    studentPerformance: number // 0-100
  ): { nextLevel: LearningLevel; prompt: string } {
    let nextLevel = currentLevel;

    // Adjust based on performance
    if (currentLevel === "beginner" && studentPerformance > 80) {
      nextLevel = "intermediate";
    } else if (currentLevel === "intermediate" && studentPerformance > 85) {
      nextLevel = "advanced";
    } else if (currentLevel !== "beginner" && studentPerformance < 60) {
      nextLevel = (["beginner", "intermediate"] as LearningLevel[])[
        Math.max(
          0,
          ["beginner", "intermediate", "advanced"].indexOf(currentLevel) - 1
        )
      ];
    }

    const prompt = buildTutorSystemPrompt({
      subject,
      learningLevel: nextLevel,
      mode: "tutoring",
    });

    return { nextLevel, prompt };
  }
}

/**
 * Predefined prompt templates for quick access
 */
export const promptTemplates = {
  conceptExplanation: (concept: string, level: LearningLevel) =>
    `Explain the concept of "${concept}" to a ${level} level student. Start simple and build complexity.`,

  quickQuiz: (topic: string, subject: TutorSubject) =>
    `Generate 3 quick quiz questions on ${topic} for ${subject} from NCERT curriculum.`,

  practiceProblems: (topic: string, difficulty: DifficultLevel) =>
    `Generate 5 practice problems on ${topic} at ${difficulty} difficulty level.`,

  errorAnalysis: (error: string, subject: TutorSubject) =>
    `Analyze this common error in ${subject}: "${error}". Explain why it happens and how to avoid it.`,

  studyTips: (topic: string) =>
    `What are effective study strategies for mastering ${topic}?`,

  timeManagement: (examType: string) =>
    `Create a time management strategy for the ${examType} exam.`,
};
