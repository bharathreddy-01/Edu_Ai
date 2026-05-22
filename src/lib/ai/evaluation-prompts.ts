import type { TutorSubject, EvaluationResult } from "@/lib/ai/types";
import type { LearningLevel } from "@/types";

export const evaluationPromptTemplates = {
  conceptAssessment: `You are an expert JEE/NEET tutor evaluating a student's conceptual understanding.

ASSESSMENT FRAMEWORK:
1. Knowledge: Can student recall key facts and definitions?
2. Comprehension: Does student understand what the concepts mean?
3. Application: Can student apply concepts to solve problems?
4. Analysis: Can student break down complex problems and identify key elements?
5. Synthesis: Can student combine multiple concepts to solve novel problems?
6. Evaluation: Can student judge the validity of solutions and approaches?

EVALUATION PROCESS:
- Ask targeted follow-up questions if needed
- Assess depth of understanding, not just correctness
- Identify conceptual gaps and misconceptions
- Provide evidence-based feedback
- Suggest specific review areas`,

  performanceAnalysis: `PERFORMANCE ANALYSIS CRITERIA:
- Accuracy: Percentage of correct answers
- Speed: Time taken vs. expected time
- Consistency: Performance across question types
- Pattern Recognition: Ability to identify solution patterns
- Error Analysis: Types of mistakes made

COMMON ERROR PATTERNS:
- Computational errors (arithmetic, algebraic manipulation)
- Conceptual errors (misunderstanding of principle)
- Careless errors (skipped steps, misread questions)
- Strategic errors (wrong approach chosen)
- Knowledge gaps (missing prerequisite concepts)`,

  feedbackStructure: `FEEDBACK STRUCTURE:
1. STRENGTHS (specific achievements)
2. AREAS FOR GROWTH (constructive, non-judgmental)
3. SPECIFIC GAPS (exactly what to review)
4. ACTION ITEMS (concrete next steps)
5. ENCOURAGEMENT (motivational close)`,

  studentPerformanceTemplate: `Evaluate student performance and generate a detailed report:

STUDENT ANSWERS TO EVALUATE:
- {answers_json}

EVALUATION CRITERIA:
1. Correctness of final answer
2. Quality of reasoning and methodology
3. Completeness of explanation
4. Adherence to problem-solving framework
5. Conceptual understanding demonstrated

GENERATE ASSESSMENT:
{
  "overall_assessment": {
    "score_percent": 0-100,
    "proficiency_level": "novice|emerging|proficient|expert",
    "trend": "improving|stable|declining"
  },
  "detailed_analysis": {
    "strengths": ["strength1", "strength2"],
    "areas_for_improvement": ["area1", "area2"],
    "conceptual_gaps": ["gap1", "gap2"],
    "skills_demonstrated": ["skill1", "skill2"]
  },
  "misconceptions": {
    "identified": ["misconception1"],
    "correction": "explanation",
    "prevention_strategy": "how to avoid"
  },
  "recommendations": {
    "immediate_focus": "topic to focus on",
    "practice_suggestions": ["suggestion1", "suggestion2"],
    "resource_links": ["resource1"],
    "study_plan_adjustment": "recommended changes"
  },
  "encouragement": "personalized motivational message"
}`,
};

export function buildConceptAssessmentPrompt(
  subject: TutorSubject,
  level: LearningLevel,
  concept: string,
  studentResponse: string
): string {
  return [
    evaluationPromptTemplates.conceptAssessment,
    "",
    `SUBJECT: ${subject}`,
    `STUDENT LEVEL: ${level}`,
    `CONCEPT BEING ASSESSED: ${concept}`,
    "",
    `STUDENT'S UNDERSTANDING: ${studentResponse}`,
    "",
    "ASSESS THE STUDENT'S:",
    "1. Depth of conceptual understanding",
    "2. Ability to explain the concept",
    "3. Connection to related concepts",
    "4. Common misconceptions or errors",
    "",
    "PROVIDE JSON RESPONSE:",
    `{
  "understanding_level": "superficial|basic|solid|deep",
  "assessment": "...",
  "strengths": ["..."],
  "gaps": ["..."],
  "misconceptions": ["..."],
  "clarifications_needed": ["..."],
  "next_learning_step": "..."
}`,
  ].join("\n");
}

export function buildPerformanceReviewPrompt(
  subject: TutorSubject,
  level: LearningLevel,
  testResults: string,
  totalScore: number,
  maxScore: number
): string {
  const percentage = (totalScore / maxScore) * 100;

  return [
    evaluationPromptTemplates.performanceAnalysis,
    "",
    evaluationPromptTemplates.feedbackStructure,
    "",
    `SUBJECT: ${subject}`,
    `STUDENT LEVEL: ${level}`,
    `SCORE: ${totalScore}/${maxScore} (${percentage.toFixed(1)}%)`,
    "",
    "TEST RESULTS TO ANALYZE:",
    testResults,
    "",
    "GENERATE DETAILED PERFORMANCE REPORT:",
    `{
  "performance_summary": {
    "score": ${totalScore},
    "max_score": ${maxScore},
    "percentage": ${percentage.toFixed(1)},
    "performance_level": "excellent|good|satisfactory|needs_improvement",
    "progress_indicator": "On track|Needs attention|Excellent progress"
  },
  "analysis": {
    "strengths": ["specific strength..."],
    "weaknesses": ["specific weakness..."],
    "error_patterns": ["pattern1", "pattern2"],
    "time_management": "assessment..."
  },
  "recommendations": {
    "topics_to_review": ["topic1", "topic2"],
    "practice_focus": "...",
    "study_adjustments": "...",
    "next_assessment": "suggestion..."
  },
  "encouragement": "personalized message..."
}`,
  ].join("\n");
}

export function buildMisconceptionCorrectionPrompt(
  concept: string,
  studentMisconception: string,
  subject: TutorSubject
): string {
  return [
    `You are correcting a misconception about a JEE/NEET concept.`,
    "",
    `SUBJECT: ${subject}`,
    `CONCEPT: ${concept}`,
    `MISCONCEPTION: ${studentMisconception}`,
    "",
    "CORRECTION APPROACH:",
    "1. Acknowledge what's right about their thinking",
    "2. Identify where it breaks down",
    "3. Explain the correct understanding",
    "4. Provide contrasting examples",
    "5. Give practice to reinforce",
    "",
    "STRUCTURE RESPONSE AS:",
    `{
  "acknowledgement": "...",
  "error_identified": "...",
  "correct_understanding": "...",
  "explanation": "detailed explanation...",
  "examples": {
    "correct_case": "example showing correct application",
    "incorrect_case": "example showing misconception",
    "edge_case": "boundary condition or exception"
  },
  "practice_problem": "similar problem to practice",
  "check_understanding": "question to verify correction"
}`,
  ].join("\n");
}

export function buildLearningStyleAssessmentPrompt(
  studentResponses: string[]
): string {
  return [
    `Assess student's learning style based on their responses and study patterns.`,
    "",
    "STUDENT LEARNING INDICATORS:",
    studentResponses.map((r, i) => `${i + 1}. ${r}`).join("\n"),
    "",
    `ASSESS LEARNING STYLE PROFILE:
{
  "learning_modalities": {
    "visual": "percentage",
    "auditory": "percentage", 
    "kinesthetic": "percentage",
    "reading_writing": "percentage"
  },
  "learning_pace": "fast|moderate|slow",
  "preferred_formats": ["format1", "format2"],
  "strength_areas": ["area1", "area2"],
  "challenge_areas": ["area1", "area2"],
  "customized_recommendations": {
    "study_methods": ["method1"],
    "resource_types": ["type1"],
    "practice_approach": "...",
    "assessment_format": "..."
  }
}`,
  ].join("\n");
}

export const evaluationResultSchema = `EVALUATION RESULT JSON SCHEMA:
{
  "evaluation_id": "string",
  "timestamp": "ISO-8601",
  "student_level": "beginner|intermediate|advanced",
  "subject": "Physics|Chemistry|Math|Biology",
  
  "performance_metrics": {
    "score": 0-100,
    "max_score": 100,
    "accuracy_percent": 0-100,
    "speed_rating": "fast|normal|slow",
    "completion_status": "completed|incomplete|abandoned"
  },
  
  "assessment_breakdown": {
    "conceptual_understanding": 0-100,
    "application_ability": 0-100,
    "problem_solving": 0-100,
    "communication": 0-100
  },
  
  "strengths": [
    {
      "area": "string",
      "evidence": "specific example",
      "development_level": "emerging|developing|proficient|expert"
    }
  ],
  
  "areas_for_improvement": [
    {
      "area": "string",
      "specific_gap": "detailed description",
      "impact_on_learning": "how this affects progress",
      "remediation_strategy": "how to address"
    }
  ],
  
  "misconceptions": [
    {
      "misconception": "what student believes",
      "correct_understanding": "what is actually true",
      "why_it_happens": "root cause",
      "correction_resource": "recommendation"
    }
  ],
  
  "next_steps": [
    {
      "priority": "high|medium|low",
      "action": "specific recommendation",
      "resources": ["resource1", "resource2"],
      "timeline": "when to do this"
    }
  ],
  
  "motivation_note": "string"
}`;
