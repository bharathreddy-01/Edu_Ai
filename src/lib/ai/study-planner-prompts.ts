import type { TutorSubject, StudyPlan } from "@/lib/ai/types";
import type { LearningLevel, DifficultLevel } from "@/types";

export const studyPlannerPromptTemplates = {
  generatePlan: `You are an expert study planner for JEE/NEET preparation.

PLANNING PRINCIPLES:
1. REALISTIC: Plans must fit student's actual available time
2. PROGRESSIVE: Build from fundamentals to advanced topics
3. BALANCED: Mix conceptual learning with practice
4. CHECKPOINT-DRIVEN: Include regular assessments
5. FLEXIBLE: Include buffer time and adjustment strategies
6. MOTIVATING: Celebrate milestones and progress

PLANNING FRAMEWORK:
- Assess current level and target goals
- Identify knowledge gaps
- Sequence topics for optimal learning
- Allocate time based on difficulty and importance
- Include review and revision cycles
- Plan for practice and assessment`,

  topicPrioritization: `TOPIC PRIORITIZATION MATRIX:
Rank topics by:
1. FREQUENCY: How often they appear in exams
2. DIFFICULTY: Conceptual or computational complexity  
3. PREREQUISITES: What must be learned first
4. WEIGHTAGE: Point value in actual exams
5. STUDENT_READINESS: Current preparation level

FREQUENCY DATA (JEE/NEET):
Physics: Mechanics (high), Thermodynamics (high), Modern Physics (medium)
Chemistry: Organic (very high), Inorganic (high), Physical (high)
Math: Calculus (very high), Algebra (high), Coordinate Geometry (medium)
Biology: Genetics (high), Ecology (high), Physiology (high)`,

  dailyStructure: `OPTIMAL DAILY STUDY STRUCTURE:
- WARM-UP (5-10 min): Review previous concepts
- NEW CONCEPT (40-50 min): Learn new topic with examples
- PRACTICE (30-40 min): Apply concepts with problems
- REVIEW (10-15 min): Summarize and connect ideas
- ASSESSMENT (15-20 min): Quiz or practice test
- REFLECTION (5 min): Note down learnings and questions

WEEKLY RHYTHM:
- Mon-Fri: Follow daily structure with new learning
- Weekend: Deep dives, practice tests, weak area review`,

  revisionStrategy: `SPACED REPETITION & REVISION:
- First review: Same day (consolidation)
- Second review: After 3 days
- Third review: After 1 week
- Fourth review: After 2 weeks
- Fifth review: Before exam

ACTIVE RECALL TECHNIQUES:
- Practice problems without notes
- Create concept maps from memory
- Teach concepts to imaginary student
- Solve past papers timed
- Review mistake patterns`,

  generateStudyPlanTemplate: `Generate a comprehensive study plan:

STUDENT PROFILE:
- Current Level: {level}
- Target Exam: {exam} (JEE/NEET)
- Available Hours/Week: {hoursPerWeek}
- Total Weeks Available: {weeksAvailable}
- Weak Areas: {weakAreas}
- Strong Areas: {strongAreas}

GENERATE PLAN:
{
  "plan_metadata": {
    "created_at": "ISO-8601",
    "student_level": "{level}",
    "total_duration_weeks": {weeksAvailable},
    "total_planned_hours": number,
    "exam_target": "{exam}",
    "customization_factors": ["factor1", "factor2"]
  },
  
  "weekly_plans": [
    {
      "week_number": 1,
      "theme": "Foundation Building: Fundamentals",
      "daily_schedule": [
        {
          "day": "Monday",
          "topics": ["topic1", "topic2"],
          "hours": 2.5,
          "activities": ["conceptual learning", "example problems"],
          "assessment": "short quiz"
        }
      ],
      "weekly_objectives": ["objective1", "objective2"],
      "practice_problems": 15,
      "revision_focus": "topics from last week",
      "checkpoint": "practice test"
    }
  ],
  
  "milestones": [
    {
      "week": 4,
      "milestone": "Complete Foundation Unit",
      "assessment": "unit test",
      "target_score": "80%"
    }
  ],
  
  "resource_recommendations": {
    "textbooks": ["NCERT", "..."],
    "practice_sources": ["PYQs", "..."],
    "video_resources": ["channel1", "..."],
    "tools": ["graphing calculator", "..."]
  },
  
  "adjustment_protocols": {
    "if_behind_schedule": "catch-up strategy",
    "if_ahead_of_schedule": "enrichment options",
    "if_weak_area": "intensive revision plan"
  }
}`,
};

export function buildStudyPlanGenerationPrompt(
  subject: TutorSubject,
  level: LearningLevel,
  availableHoursPerWeek: number,
  totalWeeks: number,
  currentTopics?: string[],
  targetTopics?: string[]
): string {
  return [
    studyPlannerPromptTemplates.generatePlan,
    "",
    studyPlannerPromptTemplates.topicPrioritization,
    "",
    studyPlannerPromptTemplates.dailyStructure,
    "",
    studyPlannerPromptTemplates.revisionStrategy,
    "",
    `CREATE PERSONALIZED STUDY PLAN:
- Subject: ${subject}
- Student Level: ${level}
- Available: ${availableHoursPerWeek} hours/week for ${totalWeeks} weeks
- Current Topics Covered: ${currentTopics?.join(", ") || "Foundation level"}
- Target Topics: ${targetTopics?.join(", ") || "Complete ${subject} syllabus"}`,
    "",
    "Generate week-by-week breakdown with daily tasks, checkpoints, and contingency plans.",
  ].join("\n");
}

export function buildProgressTrackingPrompt(
  subject: TutorSubject,
  weekNumber: number,
  plannedTopics: string[],
  completedTopics: string[],
  assessmentScores: number[]
): string {
  const completionRate = (completedTopics.length / plannedTopics.length) * 100;
  const averageScore =
    assessmentScores.length > 0
      ? (assessmentScores.reduce((a, b) => a + b) / assessmentScores.length)
          .toFixed(1)
      : "N/A";

  return [
    `You are tracking study plan progress and providing adjustments.`,
    "",
    `PROGRESS TRACKING FOR WEEK ${weekNumber}`,
    `Subject: ${subject}`,
    "",
    `PLANNED TOPICS (${plannedTopics.length}):`,
    plannedTopics.map((t) => `- ${t}`).join("\n"),
    "",
    `COMPLETED TOPICS (${completedTopics.length}):`,
    completedTopics.map((t) => `✓ ${t}`).join("\n"),
    "",
    `COMPLETION RATE: ${completionRate.toFixed(1)}%`,
    `AVERAGE ASSESSMENT SCORE: ${averageScore}%`,
    "",
    `ANALYSIS & RECOMMENDATIONS:
{
  "progress_summary": {
    "topics_completed": ${completedTopics.length},
    "topics_pending": ${plannedTopics.length - completedTopics.length},
    "completion_rate_percent": ${completionRate.toFixed(1)},
    "assessment_average": ${averageScore},
    "on_track": boolean,
    "adjustment_needed": boolean
  },
  
  "analysis": {
    "what_went_well": ["achievement1", "achievement2"],
    "challenges_faced": ["challenge1", "challenge2"],
    "learning_velocity": "exceeding|meeting|below expectations",
    "focus_areas_mastered": ["area1"],
    "focus_areas_struggling": ["area1"]
  },
  
  "adjustments_for_next_week": {
    "pacing": "speed up|maintain|slow down",
    "topic_adjustments": ["adjustment1"],
    "practice_intensity": "increase|maintain|decrease",
    "revision_needed": ["topic1"],
    "new_strategy": "if struggling"
  },
  
  "motivation_checkpoint": "progress acknowledgement"
}`,
  ].join("\n");
}

export function buildWeakAreaRecoveryPrompt(
  subject: TutorSubject,
  weakTopic: string,
  level: LearningLevel,
  diagnosticResults: string
): string {
  return [
    `Create an intensive recovery plan for a weak area.`,
    "",
    `WEAK AREA: ${weakTopic}`,
    `Subject: ${subject}`,
    `Student Level: ${level}`,
    "",
    `DIAGNOSTIC: ${diagnosticResults}`,
    "",
    `RECOVERY PLAN STRUCTURE:
{
  "problem_analysis": {
    "root_cause": "why student is struggling",
    "prerequisite_gaps": ["gap1", "gap2"],
    "common_misconceptions": ["misconception1"],
    "emotional_factors": "confidence, anxiety, etc."
  },
  
  "recovery_approach": {
    "phase_1_foundation": {
      "duration_days": 2-3,
      "focus": "rebuild prerequisite concepts",
      "resources": ["resource1"],
      "activities": ["activity1"]
    },
    "phase_2_relearning": {
      "duration_days": 3-4,
      "focus": "relearn weak topic with different approach",
      "resources": ["resource1"],
      "activities": ["activity1"]
    },
    "phase_3_practice": {
      "duration_days": 3-5,
      "focus": "intensive practice with scaffolding",
      "progression": "easy -> medium -> hard",
      "target_mastery": "80%"
    },
    "phase_4_integration": {
      "duration_days": 2-3,
      "focus": "connect to other topics",
      "activities": ["multi-topic problems"]
    }
  },
  
  "daily_schedule": [
    {
      "day": 1,
      "tasks": ["task1", "task2"],
      "duration_minutes": 90,
      "checkpoint": "mini-quiz"
    }
  ],
  
  "success_criteria": {
    "target_score": "85%",
    "consistency": "3 consecutive correct attempts",
    "speed": "solve within expected time"
  },
  
  "motivation": "encouraging message"
}`,
  ].join("\n");
}

export function buildExamReadinessPrompt(
  subject: TutorSubject,
  weeksToExam: number,
  studentProfile: string
): string {
  return [
    `Create final exam preparation strategy.`,
    "",
    `Subject: ${subject}`,
    `Weeks Until Exam: ${weeksToExam}`,
    `Student Profile: ${studentProfile}`,
    "",
    `FINAL EXAM READINESS PLAN:
{
  "timeline_overview": {
    "weeks_remaining": ${weeksToExam},
    "phase_breakdown": [
      {
        "phase_name": "Revision & Consolidation",
        "duration_weeks": Math.floor(${weeksToExam} * 0.4),
        "focus": "review all topics systematically"
      },
      {
        "phase_name": "Intensive Practice",
        "duration_weeks": Math.floor(${weeksToExam} * 0.35),
        "focus": "practice problems and past papers"
      },
      {
        "phase_name": "Mock Exams & Fine-tuning",
        "duration_weeks": Math.floor(${weeksToExam} * 0.2),
        "focus": "simulate exam conditions"
      },
      {
        "phase_name": "Final Review",
        "duration_weeks": 1,
        "focus": "quick review and confidence building"
      }
    ]
  },
  
  "topic_prioritization": {
    "must_master": ["high frequency, high weightage topics"],
    "important": ["medium frequency topics"],
    "bonus": ["niche or low-frequency topics"]
  },
  
  "practice_schedule": {
    "daily_practice_hours": number,
    "weekly_full_mock_exams": 2,
    "topic_wise_tests": 3,
    "previous_year_papers": "solve all available"
  },
  
  "exam_day_strategy": {
    "time_management": "suggested time per section",
    "question_selection": "which to attempt first",
    "risk_management": "when to skip or guess",
    "stress_management": "calming techniques"
  },
  
  "readiness_checklist": [
    "complete concept revision",
    "practice 100+ problems per chapter",
    "attempt 5+ mock exams",
    "review mistakes systematically",
    "achieve 80%+ on practice tests"
  ]
}`,
  ].join("\n");
}

export const studyPlanSchema = `STUDY PLAN JSON SCHEMA:
{
  "plan_id": "string",
  "created_at": "ISO-8601",
  "student_level": "beginner|intermediate|advanced",
  "subject": "string",
  "total_duration_weeks": number,
  "total_allocated_hours": number,
  
  "plan_overview": {
    "goal": "clear learning objective",
    "scope": "topics covered",
    "success_criteria": "measurable outcomes"
  },
  
  "weekly_breakdown": [
    {
      "week_number": 1,
      "week_title": "string",
      "learning_outcomes": ["outcome1"],
      "topics": ["topic1"],
      "daily_schedule": [
        {
          "day": "Monday",
          "focus_topic": "string",
          "learning_activities": ["activity1"],
          "practice_problems": 10,
          "estimated_hours": 2.5,
          "assessment": "type of check",
          "resources": ["resource1"]
        }
      ],
      "weekly_checkpoint": {
        "type": "quiz|test|project",
        "target_score": 80,
        "topics_covered": ["topic1"]
      }
    }
  ],
  
  "revision_schedule": [
    {
      "revision_cycle": 1,
      "topics": ["topic1"],
      "timing": "after week X",
      "duration_hours": 3,
      "method": "active recall|spaced repetition"
    }
  ],
  
  "resources": {
    "primary": ["NCERT", "standard textbooks"],
    "practice": ["problem banks", "past papers"],
    "supplementary": ["videos", "articles"],
    "tools": ["calculator", "software"]
  },
  
  "progress_tracking": {
    "frequency": "weekly",
    "metrics": ["completion_rate", "assessment_score", "confidence_level"],
    "adjustment_triggers": "conditions for plan modification"
  },
  
  "flexibility": {
    "catch_up_strategies": "if behind schedule",
    "enrichment_options": "if ahead of schedule",
    "support_resources": "if struggling"
  }
}`;
