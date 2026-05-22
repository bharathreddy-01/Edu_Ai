import type { AdaptiveSnapshot } from "@/lib/adaptive/types";

export function buildLearningPathPrompt(snapshot: AdaptiveSnapshot) {
  return `You are an adaptive learning planner for JEE/NEET students.

Create a personalized roadmap using this snapshot:
${JSON.stringify(snapshot, null, 2)}

Return JSON only:
{
  "summary": "short learner state summary",
  "roadmap": [
    {
      "week": 1,
      "focus": "topic or skill",
      "why": "reason from mastery data",
      "tasks": ["task 1", "task 2"],
      "successMetric": "measurable target"
    }
  ],
  "revisionSchedule": [
    {
      "topicId": "string",
      "topic": "string",
      "date": "ISO date",
      "method": "active_recall|spaced_quiz|mock_review"
    }
  ],
  "recommendations": ["actionable recommendation"]
}`;
}

export function buildWeakTopicCoachPrompt(snapshot: AdaptiveSnapshot) {
  return `Explain the learner's weakest topics in a motivating educational tone.

Weak topics:
${JSON.stringify(snapshot.weakTopics, null, 2)}

Output:
- one paragraph diagnosis
- top 3 causes
- next 3 actions
- one warning about common exam mistakes`;
}
