# AI Personalized Learning Coach - Prompt Engineering System

Production-grade prompt engineering system for JEE/NEET adaptive tutoring with comprehensive safety guardrails, anti-hallucination measures, and structured outputs.

## 📋 Overview

This system provides:
- **Adaptive System Prompts**: Tailored to subject, learning level, and mode
- **Specialized Prompt Templates**: For quiz generation, evaluation, and study planning
- **Structured Output Validation**: Using Zod schemas with JSON validation
- **Safety Guardrails**: Educational integrity and anti-hallucination checks
- **Comprehensive Documentation**: Full example usage and integration guides

## 🚀 Core Components

### 1. System Prompts (`system-prompts.ts`)

Production-grade system prompts for all tutoring scenarios.

**Key Exports:**
- `buildTutorSystemPrompt(config)` - Build customized system prompt
- `buildQuizSystemPrompt()` - Quiz generation mode
- `buildEvaluationSystemPrompt()` - Answer evaluation mode
- `buildStudyPlannerSystemPrompt()` - Study planning mode
- `contextualPrompts` - Teaching approach guides
- `knowledgeBoundaries` - Scope validation

**Example:**
```typescript
import { buildTutorSystemPrompt } from '@/lib/ai/system-prompts';

const systemPrompt = buildTutorSystemPrompt({
  subject: 'Physics',
  learningLevel: 'intermediate',
  mode: 'tutoring',
  safetyLevel: 'moderate'
});
```

### 2. Quiz Prompts (`quiz-prompts.ts`)

Quiz generation and answer evaluation templates.

**Key Functions:**
- `buildQuizGenerationPrompt()` - Generate quiz questions
- `buildAnswerEvaluationPrompt()` - Evaluate student answers
- `quizStructureTemplate` - Complete quiz JSON structure

**Example:**
```typescript
import { buildQuizGenerationPrompt } from '@/lib/ai/quiz-prompts';

const prompt = buildQuizGenerationPrompt(
  'Physics',
  'medium',
  'intermediate',
  'Mechanics - Newton\'s Laws',
  'mcq'
);
```

### 3. Evaluation Prompts (`evaluation-prompts.ts`)

Concept assessment and performance analysis templates.

**Key Functions:**
- `buildConceptAssessmentPrompt()` - Assess concept understanding
- `buildPerformanceReviewPrompt()` - Review test performance
- `buildMisconceptionCorrectionPrompt()` - Correct misconceptions
- `buildLearningStyleAssessmentPrompt()` - Identify learning style

**Example:**
```typescript
import { buildPerformanceReviewPrompt } from '@/lib/ai/evaluation-prompts';

const prompt = buildPerformanceReviewPrompt(
  'Chemistry',
  'advanced',
  'Student got 68/100 on organic chemistry test',
  68,
  100
);
```

### 4. Study Planner Prompts (`study-planner-prompts.ts`)

Comprehensive study planning and progress tracking.

**Key Functions:**
- `buildStudyPlanGenerationPrompt()` - Create personalized study plans
- `buildProgressTrackingPrompt()` - Track weekly progress
- `buildWeakAreaRecoveryPrompt()` - Intensive recovery for weak areas
- `buildExamReadinessPrompt()` - Final exam preparation

**Example:**
```typescript
import { buildStudyPlanGenerationPrompt } from '@/lib/ai/study-planner-prompts';

const prompt = buildStudyPlanGenerationPrompt(
  'Math',
  'beginner',
  12,  // hours/week
  16,  // weeks available
  ['Algebra', 'Trigonometry'],
  ['Calculus', 'Coordinate Geometry']
);
```

### 5. Response Schemas (`schemas.ts`)

Zod schemas for validating structured outputs.

**Key Schemas:**
- `QuizQuestionSchema` - Individual quiz question
- `QuizSchema` - Complete quiz with metadata
- `AnswerEvaluationSchema` - Answer evaluation results
- `EvaluationResultSchema` - Full evaluation report
- `StudyPlanSchema` - Complete study plan
- `SystemPromptConfigSchema` - Prompt configuration

**Example:**
```typescript
import { QuizQuestionSchema } from '@/lib/ai/schemas';
import { z } from 'zod';

const quizQuestion = {
  id: 'q1',
  question: 'What is Newton\'s second law?',
  type: 'short-answer',
  difficulty: 'medium',
  subject: 'Physics',
  correctAnswer: 'F = ma',
  explanation: 'Force equals mass times acceleration',
};

const validated = QuizQuestionSchema.parse(quizQuestion);
```

### 6. Safety Guardrails (`guardrails.ts`)

Educational integrity and anti-hallucination measures.

**Key Functions:**
- `checkForForbiddenContent()` - Detect academic dishonesty requests
- `validateTopic()` - Verify topic is in JEE/NEET curriculum
- `detectUncertainty()` - Flag uncertain or hallucinated content
- `assessResponseQuality()` - Quality scoring with recommendations
- `factVerificationChecklist` - Verification hints by subject

**Example:**
```typescript
import { checkForForbiddenContent, validateTopic } from '@/lib/ai/guardrails';

// Check for dishonesty
const safety = checkForForbiddenContent('Give me the exam answers');
// { isSafe: false, reason: 'Request appears to involve academic dishonesty' }

// Validate topic
const validation = validateTopic('Quantum Mechanics', 'Physics');
// May flag as not in standard JEE/NEET Physics syllabus
```

### 7. Response Validator (`response-validator.ts`)

JSON parsing and validation utilities.

**Key Methods:**
- `extractJSON()` - Extract JSON from text response
- `validateQuizQuestion()` - Validate question structure
- `validateQuiz()` - Validate complete quiz
- `validateEvaluation()` - Validate evaluation result
- `sanitizeResponse()` - Remove harmful content
- `parseAIResponse()` - Parse and validate with recovery

**Example:**
```typescript
import { ResponseValidator } from '@/lib/ai/response-validator';

const response = '{"question": "....", "type": "mcq", ...}';
const result = ResponseValidator.parseAIResponse(response, 'question');

if (result.success) {
  console.log('Validation passed:', result.data);
} else {
  console.log('Validation errors:', result.validation.errors);
}
```

### 8. Prompt Builder (`prompt-builder.ts`)

High-level builder for constructing complete prompts.

**Key Methods:**
- `buildTutoringPrompt()` - Build tutoring session prompt
- `buildQuizPrompt()` - Build quiz generation prompt
- `buildEvaluationPrompt()` - Build evaluation prompt
- `buildStudyPlanPrompt()` - Build study plan prompt
- `buildSessionPrompt()` - Build multi-topic session
- `addSafetyLayer()` - Add safety reminders
- `buildProblemSolvingPrompt()` - Step-by-step problem solving

**Example:**
```typescript
import { PromptBuilder } from '@/lib/ai/prompt-builder';

// Build complete tutoring prompt
const prompt = PromptBuilder.buildQuizPrompt(
  'Chemistry',
  'hard',
  'advanced',
  'Organic Synthesis Reactions',
  5,
  'mcq'
);

// Add safety layer
const safePrompt = PromptBuilder.addSafetyLayer(prompt, 'strict');
```

## 📊 Learning Levels

Three-tier adaptive system:

### Beginner
- Minimal prior knowledge
- Analogies and real-world examples
- Simple language, no jargon
- Foundational concepts first

### Intermediate
- Working knowledge of basics
- Standard formulas and methods
- Clear reasoning explanations
- Connections to related concepts

### Advanced
- Strong fundamentals assumed
- Rigorous mathematics
- Edge cases and advanced techniques
- Derivations and proofs included

## 🎯 Difficulty Levels

- **Easy**: Recall and basic application (1-2 minutes)
- **Medium**: Multi-concept application (3-5 minutes)
- **Hard**: Complex problem-solving (5-10 minutes)
- **Expert**: Advanced reasoning (10-15 minutes)

## 📚 Subject-Specific Guidance

### Physics
- Focus on physical intuition and equations
- Explain force diagrams and energy conservation
- Connect to JEE mechanics and electromagnetism
- Verify dimensional analysis

### Chemistry
- Prioritize NCERT terminology and clarity
- Separate organic, inorganic, and physical chemistry
- Explain mechanisms with proper arrow-pushing
- Verify oxidation states and bonding

### Math
- Show derivations and identify theorems used
- Highlight proof techniques and patterns
- Include shortcuts only after core method
- Verify logical continuity in proofs

### Biology
- Use exact NCERT terminology
- Explain biological mechanisms clearly
- Include diagram interpretation
- Follow official classification systems

## 🛡️ Safety Features

### Content Safety
- Forbids exam fraud and plagiarism
- Rejects medical/psychological advice
- Validates topics against NCERT curriculum
- Flags potential student distress

### Anti-Hallucination
- Enforces fact-checking protocols by subject
- Detects uncertainty markers
- Requires admitting knowledge gaps
- Cross-references with reliable sources

### Educational Integrity
- Maintains high learning standards
- Prevents shortcut-based learning
- Encourages active problem-solving
- Promotes conceptual understanding

## 💡 Usage Examples

### Example 1: Generate Quiz Questions

```typescript
import { PromptBuilder } from '@/lib/ai/prompt-builder';
import { ResponseValidator } from '@/lib/ai/response-validator';

// Build quiz prompt
const quizPrompt = PromptBuilder.buildQuizPrompt(
  'Physics',
  'hard',
  'advanced',
  'Electromagnetic Induction',
  5,
  'mcq'
);

// Send to AI (Gemini API example)
const response = await generateContent(quizPrompt);

// Validate response
const result = ResponseValidator.parseAIResponse(
  response.text,
  'quiz'
);

if (result.success) {
  console.log('Quiz generated successfully', result.data);
} else {
  console.log('Validation errors:', result.validation.errors);
}
```

### Example 2: Evaluate Student Answer

```typescript
import { PromptBuilder } from '@/lib/ai/prompt-builder';
import { ResponseValidator } from '@/lib/ai/response-validator';

// Build evaluation prompt
const evalPrompt = PromptBuilder.buildEvaluationPrompt(
  'Chemistry',
  'intermediate',
  'H₂O contains 2 oxygen atoms',
  'H₂O contains 1 oxygen atom and 2 hydrogen atoms',
  'What is the composition of a water molecule?'
);

// Get evaluation from AI
const response = await generateContent(evalPrompt);

// Validate evaluation
const result = ResponseValidator.parseAIResponse(
  response.text,
  'evaluation'
);

if (result.success) {
  console.log('Feedback:', result.data);
}
```

### Example 3: Generate Study Plan

```typescript
import { PromptBuilder } from '@/lib/ai/prompt-builder';
import { ResponseValidator } from '@/lib/ai/response-validator';

// Build study plan prompt
const planPrompt = PromptBuilder.buildStudyPlanPrompt(
  'Math',
  'beginner',
  10,    // 10 hours per week
  16,    // 16 weeks available
  ['Algebra', 'Trigonometry'],  // Current
  ['Calculus', 'Vectors', 'Coordinate Geometry']  // Target
);

// Get plan from AI
const response = await generateContent(planPrompt);

// Validate plan
const result = ResponseValidator.parseAIResponse(
  response.text,
  'plan'
);

if (result.success) {
  console.log('Study plan generated', result.data);
}
```

### Example 4: Multi-Topic Session

```typescript
import { PromptBuilder } from '@/lib/ai/prompt-builder';

// Build comprehensive session prompt
const sessionPrompt = PromptBuilder.buildSessionPrompt(
  'Physics',
  'advanced',
  [
    'Circular Motion Basics',
    'Centripetal Force',
    'Non-uniform Circular Motion',
    'Banking and Conical Pendulum',
    'Practice Problems'
  ],
  'Daily 10-minute quiz on each topic'
);

const safePrompt = PromptBuilder.addSafetyLayer(sessionPrompt, 'strict');
```

## 🔍 Type System

All exports are fully typed with TypeScript:

```typescript
import type {
  TutorSubject,
  LearningLevel,
  LearningMode,
  DifficultLevel,
  SystemPromptConfig,
  QuizQuestion,
  EvaluationResult,
  StudyPlan
} from '@/lib/ai/types';
```

## 📖 Integration Guide

### Step 1: Choose Operating Mode
```typescript
type LearningMode = 'tutoring' | 'quiz' | 'evaluation' | 'planning';
```

### Step 2: Build Appropriate Prompt
```typescript
const config = {
  subject: 'Physics',
  learningLevel: 'intermediate',
  mode: 'quiz' as const,
  safetyLevel: 'moderate' as const
};
```

### Step 3: Get AI Response
```typescript
const response = await aiModel.generateContent(prompt);
```

### Step 4: Validate Output
```typescript
const validated = ResponseValidator.parseAIResponse(response, 'quiz');
```

### Step 5: Use Structured Data
```typescript
if (validated.success) {
  // Use validated.data with full type safety
  const quiz = validated.data as Quiz;
}
```

## 🎓 Educational Best Practices

- **Never skip understanding** for quick answers
- **Always explain the why**, not just the how
- **Connect to real applications** when possible
- **Highlight common misconceptions**
- **Provide practice opportunities**
- **Use active recall** over passive reading
- **Space out revisions** using spaced repetition
- **Assess conceptual understanding** rigorously

## 📝 Output Formats

### Quiz Question JSON
```json
{
  "id": "q1",
  "question": "What is...",
  "type": "mcq|short-answer|essay",
  "difficulty": "easy|medium|hard|expert",
  "subject": "Physics|Chemistry|Math|Biology",
  "correctAnswer": "string or array",
  "explanation": "detailed explanation",
  "options": ["A", "B", "C", "D"],
  "hints": ["hint1"],
  "keywords": ["keyword1"]
}
```

### Evaluation Result JSON
```json
{
  "score": 85,
  "level": "good",
  "correctness": true,
  "strengths": ["clear reasoning"],
  "errors": ["minor calculation error"],
  "feedback": "Overall good response...",
  "suggestions": ["practice more problems"],
  "nextSteps": ["review chapter 3"]
}
```

## 🚀 Performance Tips

1. **Cache system prompts** - Reuse across sessions
2. **Batch validations** - Validate multiple responses together
3. **Lazy load schemas** - Import only what you need
4. **Use streaming** - For long prompts, use streaming responses
5. **Implement retry logic** - Validate with fallback options

## 📚 References

- [NCERT Curriculum](https://ncert.nic.in)
- [JEE Syllabus](https://www.nta.ac.in/index.php/webinfo/pub/category/JEE%20Main)
- [NEET Syllabus](https://www.nta.ac.in/index.php/webinfo/pub/category/NEET)
- [Zod Validation](https://zod.dev)
- [Next.js App Router](https://nextjs.org)

## 📄 License

Part of the AI Personalized Learning Coach project.

---

**Last Updated:** 2026-05-19  
**Maintained By:** Copilot Engineering
