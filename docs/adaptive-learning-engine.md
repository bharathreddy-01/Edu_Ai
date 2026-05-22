# Adaptive Learning Engine

## Architecture

The adaptive engine has four layers:

1. **Signal ingestion**: quiz attempts, answer correctness, time spent, subject,
   topic, difficulty, and revision history.
2. **Scoring layer**: converts raw performance into mastery, weakness, next
   difficulty, and revision date.
3. **Planning layer**: ranks topics and creates a personalized learning path.
4. **AI layer**: uses structured prompts to explain the plan and generate
   learner-friendly recommendations.

Core implementation:

- `src/lib/adaptive/types.ts`
- `src/lib/adaptive/scoring.ts`
- `src/lib/adaptive/prompts.ts`
- `src/lib/adaptive/index.ts`

## Algorithms

### Weak Topic Detection

For each topic:

```text
accuracy = correct / attempts
mastery = priorMastery * 0.35
        + accuracy * 0.45
        + speedScore * 0.10
        + difficultyWeight * 0.10

weakness = (100 - accuracy) * 0.50
         + (100 - mastery) * 0.35
         + recencyPenalty * 0.15
```

A topic is weak when:

- `weaknessScore >= 55`, or
- `masteryScore < 60`

### Difficulty Adaptation

- Accuracy `>= 85%`: move one difficulty up.
- Accuracy `< 55%`: move one difficulty down.
- Otherwise: keep current difficulty.

Difficulty order:

```text
easy -> medium -> hard -> expert
```

### Revision Scheduling

Revision interval is based on mastery:

- `85+`: 14 days
- `70-84`: 7 days
- `55-69`: 3 days
- `<55`: 1 day

### Readiness Score

```text
readiness = averageMastery - weakTopicCount * 4
```

Clamped from `0` to `100`.

## Database Flow

1. Student submits quiz.
2. `quiz_attempts` stores score, accuracy, time, and AI review.
3. `quiz_answers` stores per-question correctness.
4. Topic-level performance updates `student_topic_progress`.
5. Engine recalculates:
   - `mastery_score`
   - `accuracy`
   - `attempts_count`
   - `correct_count`
   - `last_practiced_at`
   - `next_revision_at`
6. Dashboard queries weak topics and roadmap from topic progress.
7. AI prompts produce personalized recommendations and study plan text.

Recommended tables:

- `profiles`
- `subjects`
- `topics`
- `student_topic_progress`
- `quiz_attempts`
- `quiz_answers`
- `daily_progress`
- `leaderboard_entries`

## AI Prompts

### Learning Path Prompt

Use `buildLearningPathPrompt(snapshot)` to ask the model for:

- learner summary
- weekly roadmap
- revision schedule
- actionable recommendations

### Weak Topic Coach Prompt

Use `buildWeakTopicCoachPrompt(snapshot)` to generate:

- diagnosis
- causes
- next actions
- exam mistakes warning

## Scoring Logic

The engine separates:

- **quiz score**: marks and negative marks
- **accuracy**: correct answers over total questions
- **mastery**: longer-term topic understanding
- **weakness**: urgency for intervention
- **readiness**: overall exam preparedness

This keeps short-term quiz performance from overreacting while still allowing
the roadmap to adapt quickly when repeated weakness appears.
