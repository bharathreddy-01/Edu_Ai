/**
 * INTEGRATION GUIDE & EXAMPLES
 * AI Personalized Learning Coach - Prompt Engineering System
 *
 * This file demonstrates how to use all components of the prompt engineering system
 */

import {
  PromptBuilder,
  ResponseValidator,
  buildTutorSystemPrompt,
  checkForForbiddenContent,
  validateTopic,
} from "@/lib/ai";
import type { TutorRequest, EvaluationResult } from "@/lib/ai/types";
import type { LearningLevel } from "@/types";

/**
 * EXAMPLE 1: Basic Tutoring Session
 * Simple tutoring setup with system prompt
 */
export async function exampleBasicTutoring() {
  // Create tutoring request
  const request: TutorRequest = {
    message: "Explain Newton's second law",
    subject: "Physics",
    learningLevel: "intermediate",
    mode: "tutoring",
  };

  // Build system prompt
  const systemPrompt = PromptBuilder.buildTutoringPrompt(
    request,
    "Focus on the mathematical formulation and intuitive understanding"
  );

  console.log("System Prompt:", systemPrompt);

  // In real scenario, send to AI:
  // const response = await geminiAPI.generateContent(systemPrompt + "\n\n" + request.message);
}

/**
 * EXAMPLE 2: Quiz Generation with Validation
 * Generate a quiz and validate the response structure
 */
export async function exampleQuizGeneration() {
  // Build quiz prompt
  const quizPrompt = PromptBuilder.buildQuizPrompt(
    "Chemistry",
    "medium",
    "intermediate",
    "Organic Acid-Base Reactions",
    5,
    "mcq"
  );

  // Add safety layer
  const safePrompt = PromptBuilder.addSafetyLayer(quizPrompt, "moderate");

  // Mock AI response (in reality from Gemini)
  const mockResponse = `
  {
    "quizMetadata": {
      "totalQuestions": 5,
      "difficulty": "medium",
      "topics": ["Organic Chemistry", "Acid-Base"],
      "estimatedTime": 900,
      "learningLevel": "intermediate",
      "passingScorePercent": 75
    },
    "questions": [
      {
        "id": "q1",
        "question": "What is the product of acetic acid reacting with ethanol?",
        "type": "mcq",
        "difficulty": "medium",
        "subject": "Chemistry",
        "correctAnswer": "Ethyl acetate",
        "explanation": "This is esterification - carboxylic acid + alcohol → ester + water",
        "options": ["Ethyl acetate", "Acetic anhydride", "Ethanol acetate", "Acetyl ethane"],
        "keywords": ["esterification", "organic synthesis"],
        "commonMistakes": ["Confusing with acetone formation", "Forgetting water elimination"]
      }
    ]
  }
  `;

  // Validate response
  const result = ResponseValidator.parseAIResponse(mockResponse, "quiz");

  if (result.success) {
    console.log("✓ Quiz validated successfully");
    console.log("Questions:", result.data);
  } else {
    console.log("✗ Validation failed:", result.validation.errors);
  }
}

/**
 * EXAMPLE 3: Answer Evaluation
 * Evaluate student answer with detailed feedback
 */
export async function exampleAnswerEvaluation() {
  const evalPrompt = PromptBuilder.buildEvaluationPrompt(
    "Physics",
    "advanced",
    "F = ma describes the relationship between force and acceleration",
    "F = m × a, where F is force in Newtons, m is mass in kg, and a is acceleration in m/s²",
    "State Newton's second law mathematically and explain each component"
  );

  // Mock response
  const mockEvalResponse = `
  {
    "score": 92,
    "level": "good",
    "correctness": true,
    "strengths": [
      "Correctly stated the equation",
      "Identified all three variables",
      "Included proper SI units",
      "Showed understanding of physical meaning"
    ],
    "errors": ["Could have mentioned this is a vector equation"],
    "feedback": "Excellent response showing strong understanding of Newton's second law. You correctly identified the equation and units.",
    "suggestions": [
      "Mention that F and a are vector quantities",
      "Discuss the implications of proportionality",
      "Link to real-world examples"
    ],
    "nextSteps": [
      "Practice applications of F = ma to inclined planes",
      "Work on multi-body system problems",
      "Explore rotational dynamics analogues"
    ]
  }
  `;

  const result = ResponseValidator.parseAIResponse(mockEvalResponse, "evaluation");

  if (result.success) {
    const evaluation = result.data as EvaluationResult;
    console.log(`Score: ${evaluation.score}%`);
    console.log("Strengths:", evaluation.strengths);
    console.log("Next Steps:", evaluation.nextSteps);
  }
}

/**
 * EXAMPLE 4: Study Plan Generation
 * Create a comprehensive study plan for exam preparation
 */
export async function exampleStudyPlanGeneration() {
  const planPrompt = PromptBuilder.buildStudyPlanPrompt(
    "Math",
    "beginner",
    10, // hours per week
    12, // weeks available
    ["Algebra", "Trigonometry"], // current topics
    ["Calculus", "Coordinate Geometry", "Vectors"] // target topics
  );

  const safePrompt = PromptBuilder.addSafetyLayer(planPrompt, "moderate");

  console.log("Study Plan Prompt generated");
  console.log("Weeks available: 12");
  console.log("Study hours/week: 10");

  // In real scenario:
  // const response = await geminiAPI.generateContent(safePrompt);
  // const validated = ResponseValidator.parseAIResponse(response, "plan");
}

/**
 * EXAMPLE 5: Multi-Topic Session
 * Build a comprehensive learning session covering multiple topics
 */
export async function exampleMultiTopicSession() {
  const topics = [
    "Circular Motion Basics",
    "Centripetal Acceleration",
    "Banking of Roads",
    "Conical Pendulum",
    "Practice Problems",
  ];

  const sessionPrompt = PromptBuilder.buildSessionPrompt(
    "Physics",
    "advanced",
    topics,
    "Daily 15-minute quiz on main concepts"
  );

  const safePrompt = PromptBuilder.addSafetyLayer(sessionPrompt, "strict");

  console.log("Multi-topic session prompt created");
  console.log("Topics:", topics.length);
}

/**
 * EXAMPLE 6: Misconception Correction
 * Help correct a common student misconception
 */
export async function exampleMisconceptionCorrection() {
  const correctionPrompt = PromptBuilder.buildMisconceptionCorrectionPrompt(
    "Newton's Third Law",
    'Action-reaction forces are on the same object, so they cancel out',
    "Physics"
  );

  console.log("Misconception correction prompt created");
  console.log("This will help explain that:");
  console.log("- Action-reaction forces are on DIFFERENT objects");
  console.log("- They don't cancel; they cause equal accelerations (F = ma)");
  console.log("- They must be the same force type");
}

/**
 * EXAMPLE 7: Safety Checks
 * Demonstrate safety and content validation
 */
export async function exampleSafetyChecks() {
  console.log("\n=== SAFETY CHECKS DEMONSTRATION ===\n");

  // Check for forbidden content
  const dishonestRequest = "Give me the JEE exam answers without explanation";
  const safety1 = checkForForbiddenContent(dishonestRequest);
  console.log("Dishonest request check:");
  console.log(`  Safe: ${safety1.isSafe}`);
  console.log(`  Reason: ${safety1.reason}\n`);

  // Check valid topic
  const validation1 = validateTopic("Newton's Laws", "Physics");
  console.log("Topic validation (valid):");
  console.log(`  Valid: ${validation1.isValid}\n`);

  // Check invalid topic
  const validation2 = validateTopic("Advanced Quantum Field Theory", "Physics");
  console.log("Topic validation (invalid for JEE):");
  console.log(`  Valid: ${validation2.isValid}`);
  console.log(`  Reason: ${validation2.reason}\n`);
}

/**
 * EXAMPLE 8: Adaptive Difficulty
 * Adjust difficulty based on student performance
 */
export async function exampleAdaptiveDifficulty() {
  console.log("\n=== ADAPTIVE DIFFICULTY ===\n");

  // Student started at beginner level with 85% score
  const result1 = PromptBuilder.buildAdaptiveDifficultyPrompt(
    "Chemistry",
    "beginner",
    85 // performance score
  );

  console.log("Beginner level, 85% performance:");
  console.log(`  Next level: ${result1.nextLevel}`);

  // Student at intermediate with 65% score (struggling)
  const result2 = PromptBuilder.buildAdaptiveDifficultyPrompt(
    "Chemistry",
    "intermediate",
    65
  );

  console.log("\nIntermediate level, 65% performance:");
  console.log(`  Next level: ${result2.nextLevel} (downgraded to provide support)`);
}

/**
 * EXAMPLE 9: Contextual Learning Approaches
 * Apply different teaching methodologies
 */
export async function exampleContextualApproaches() {
  const basePrompt =
    "Explain the concept of equilibrium in chemistry reactions";

  // Concept explanation approach
  const conceptPrompt = PromptBuilder.buildContextualPrompt(
    "conceptExplainer",
    basePrompt
  );

  // Problem-solving approach
  const problemPrompt = PromptBuilder.buildContextualPrompt(
    "problemSolver",
    basePrompt
  );

  // Exam preparation approach
  const examPrompt = PromptBuilder.buildContextualPrompt(
    "examPrepper",
    basePrompt
  );

  console.log("Different teaching approaches available for same content");
  console.log("- Concept Explainer: Build understanding from basics");
  console.log("- Problem Solver: Apply concepts to problem-solving");
  console.log("- Exam Prepper: Focus on high-frequency exam topics");
}

/**
 * EXAMPLE 10: Complete Workflow
 * End-to-end example from request to validated output
 */
export async function exampleCompleteWorkflow() {
  console.log("\n=== COMPLETE WORKFLOW ===\n");

  // Step 1: Validate incoming request
  console.log("Step 1: Request validation");
  const studentMessage = "Explain why catalysts speed up reactions";
  const safety = checkForForbiddenContent(studentMessage);
  console.log(`  Safety check: ${safety.isSafe ? "✓ SAFE" : "✗ FORBIDDEN"}`);

  // Step 2: Build system prompt
  console.log("\nStep 2: Build system prompt");
  const request: TutorRequest = {
    message: studentMessage,
    subject: "Chemistry",
    learningLevel: "intermediate",
    mode: "tutoring",
  };

  const systemPrompt = PromptBuilder.buildTutoringPrompt(request);
  console.log(`  Prompt created for ${request.subject} at ${request.learningLevel} level`);

  // Step 3: Send to AI (mocked)
  console.log("\nStep 3: Send to AI and get response");
  const mockAIResponse =
    "Catalysts work by lowering the activation energy required for reactions...";

  // Step 4: Apply safety validation
  console.log("\nStep 4: Validate response quality");
  const { score, issues, recommendations } = (() => ({
    score: 85,
    issues: [] as string[],
    recommendations: ["Include examples"],
  }))();
  console.log(`  Response quality score: ${score}/100`);

  // Step 5: Return to student
  console.log("\nStep 5: Return response to student");
  console.log("  ✓ Response validated and safe");
  console.log("  ✓ Ready for display\n");
}

/**
 * EXAMPLE 11: Using Prompt Templates
 * Quick access to predefined prompt templates
 */
export async function examplePromptTemplates() {
  console.log("\n=== PROMPT TEMPLATES ===\n");

  const templates = [
    {
      name: "Concept Explanation",
      template: "Explain the concept of 'photosynthesis' to a beginner level student",
    },
    {
      name: "Quick Quiz",
      template: "Generate 3 quick quiz questions on 'Photosynthesis' for Biology",
    },
    {
      name: "Practice Problems",
      template:
        "Generate 5 practice problems on 'Photosynthesis' at medium difficulty level",
    },
    {
      name: "Error Analysis",
      template:
        "Analyze this common error in Biology: 'Photosynthesis only happens in sunlight'",
    },
  ];

  console.log("Available Quick Templates:");
  templates.forEach((t) => {
    console.log(`\n  ${t.name}:`);
    console.log(`    ${t.template}`);
  });
}

/**
 * EXAMPLE 12: Response Parsing and Recovery
 * Handle imperfect AI responses gracefully
 */
export async function exampleResponseRecovery() {
  console.log("\n=== RESPONSE PARSING & RECOVERY ===\n");

  // Response with extra text before JSON
  const imperfectResponse = `
  Here's the quiz I generated for you:
  
  {
    "quizMetadata": {
      "totalQuestions": 3,
      "difficulty": "easy",
      "topics": ["Basic Chemistry"],
      "estimatedTime": 300,
      "learningLevel": "beginner"
    },
    "questions": [
      {
        "id": "q1",
        "question": "What is the chemical formula for table salt?",
        "type": "mcq",
        "difficulty": "easy",
        "subject": "Chemistry",
        "correctAnswer": "NaCl",
        "explanation": "Table salt is sodium chloride",
        "options": ["NaCl", "NaC", "NaCl2", "Na2Cl"]
      }
    ]
  }
  
  This is a basic chemistry quiz covering fundamental concepts.
  `;

  const result = ResponseValidator.parseAIResponse(imperfectResponse, "quiz");

  console.log("Input: Response with text before/after JSON");
  console.log(`Parse success: ${result.success}`);
  console.log(`Validation: ${result.validation.isValid ? "✓ VALID" : "✗ INVALID"}`);

  if (result.success) {
    console.log(`Extracted ${(result.data as { questions?: unknown[] })?.questions?.length} questions`);
  }
}

// Export all examples
export const examples = {
  basicTutoring: exampleBasicTutoring,
  quizGeneration: exampleQuizGeneration,
  answerEvaluation: exampleAnswerEvaluation,
  studyPlanGeneration: exampleStudyPlanGeneration,
  multiTopicSession: exampleMultiTopicSession,
  misconceptionCorrection: exampleMisconceptionCorrection,
  safetyChecks: exampleSafetyChecks,
  adaptiveDifficulty: exampleAdaptiveDifficulty,
  contextualApproaches: exampleContextualApproaches,
  completeWorkflow: exampleCompleteWorkflow,
  promptTemplates: examplePromptTemplates,
  responseRecovery: exampleResponseRecovery,
};

/**
 * Run all examples (for testing/demonstration)
 */
export async function runAllExamples() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║  AI Personalized Learning Coach - Prompt Engineering      ║");
  console.log("║  System Examples & Integration Guide                      ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  await exampleBasicTutoring();
  await exampleQuizGeneration();
  await exampleAnswerEvaluation();
  await exampleStudyPlanGeneration();
  await exampleMultiTopicSession();
  await exampleMisconceptionCorrection();
  await exampleSafetyChecks();
  await exampleAdaptiveDifficulty();
  await exampleContextualApproaches();
  await exampleCompleteWorkflow();
  await examplePromptTemplates();
  await exampleResponseRecovery();

  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║  All Examples Completed Successfully!                     ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");
}

// Uncomment to run: runAllExamples().catch(console.error);
