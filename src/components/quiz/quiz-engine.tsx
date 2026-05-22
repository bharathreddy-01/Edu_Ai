"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Keyboard,
  Loader2,
  Medal,
  Sparkles,
  Trophy,
  X,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type {
  GeneratedQuiz,
  QuizDifficulty,
  QuizSubject,
  QuizSubmissionResult,
} from "@/lib/quiz/types";
import { cn } from "@/lib/utils";
import type { LearningLevel } from "@/types";

const subjects: QuizSubject[] = ["Physics", "Chemistry", "Math", "Biology"];
const levels: LearningLevel[] = ["beginner", "intermediate", "advanced"];
const difficulties: Array<QuizDifficulty | "adaptive"> = [
  "adaptive",
  "easy",
  "medium",
  "hard",
  "expert",
];

const optionLabels = ["A", "B", "C", "D"];
const leaderboardRows = [
  { rank: 1, name: "Ishita", points: 9840, accuracy: 91 },
  { rank: 2, name: "Aarav", points: 9320, accuracy: 88 },
  { rank: 3, name: "You", points: 9140, accuracy: 86, current: true },
  { rank: 4, name: "Rohan", points: 8820, accuracy: 82 },
];

export function QuizEngine() {
  const [subject, setSubject] = useState<QuizSubject>("Physics");
  const [topic, setTopic] = useState("Rotational dynamics");
  const [learningLevel, setLearningLevel] =
    useState<LearningLevel>("intermediate");
  const [difficulty, setDifficulty] = useState<QuizDifficulty | "adaptive">(
    "adaptive",
  );
  const [questionCount, setQuestionCount] = useState(5);
  const [recentAccuracy, setRecentAccuracy] = useState(72);
  const [quiz, setQuiz] = useState<GeneratedQuiz>();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizSubmissionResult>();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReviewing, setIsReviewing] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const currentQuestion = quiz?.questions[currentIndex];
  const remainingSeconds = Math.max(
    (quiz?.durationSeconds ?? 0) - elapsedSeconds,
    0,
  );
  const answeredCount = Object.keys(answers).length;
  const canSubmit = Boolean(quiz) && answeredCount === quiz?.questions.length;
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : "";
  const currentInstantFeedback =
    currentQuestion && selectedAnswer
      ? selectedAnswer === currentQuestion.correctAnswer
      : undefined;

  const answerProgress = useMemo(() => {
    if (!quiz) return 0;
    return Math.round((answeredCount / quiz.questions.length) * 100);
  }, [answeredCount, quiz]);

  const timeProgress = useMemo(() => {
    if (!quiz?.durationSeconds) return 0;
    return Math.round((remainingSeconds / quiz.durationSeconds) * 100);
  }, [quiz, remainingSeconds]);

  useEffect(() => {
    if (!quiz || result) return;

    const interval = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [quiz, result]);

  useEffect(() => {
    if (quiz && remainingSeconds === 0 && !result && canSubmit) {
      void submitQuiz();
    }
  }, [remainingSeconds, quiz, result, canSubmit]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!quiz || !currentQuestion) return;

      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT";

      if (isTyping) return;

      if (event.key >= "1" && event.key <= "4") {
        const option = currentQuestion.options[Number(event.key) - 1];
        if (option && !result) {
          chooseAnswer(currentQuestion.id, option);
        }
      }

      if (event.key === "ArrowRight") {
        setCurrentIndex((index) =>
          Math.min(index + 1, quiz.questions.length - 1),
        );
      }

      if (event.key === "ArrowLeft") {
        setCurrentIndex((index) => Math.max(index - 1, 0));
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [quiz, currentQuestion, result]);

  async function generateQuiz(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsGenerating(true);
    setError(undefined);
    setResult(undefined);
    setQuiz(undefined);
    setAnswers({});
    setElapsedSeconds(0);
    setCurrentIndex(0);
    setIsReviewing(false);

    try {
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          topic,
          learningLevel,
          questionCount,
          recentAccuracy,
          difficulty: difficulty === "adaptive" ? undefined : difficulty,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not generate quiz.");
      }

      setQuiz(payload.quiz);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not generate quiz.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function submitQuiz() {
    if (!quiz?.id) {
      setError("Quiz must be saved before it can be submitted.");
      return;
    }

    setIsSubmitting(true);
    setError(undefined);

    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          timeSpentSeconds: elapsedSeconds,
          answers: Object.entries(answers).map(([questionId, selectedAnswer]) => ({
            questionId,
            selectedAnswer,
          })),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not submit quiz.");
      }

      setResult(payload.result);
      setRecentAccuracy(payload.result.accuracy);
      setIsReviewing(true);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not submit quiz.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function chooseAnswer(questionId: string, option: string) {
    setAnswers((current) => ({
      ...current,
      [questionId]: option,
    }));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <aside className="grid content-start gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Generate adaptive quiz</CardTitle>
            <CardDescription>
              Gemini creates MCQs using subject, topic, level, and recent
              accuracy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={generateQuiz} className="grid gap-4">
              <label className="grid gap-2 text-sm font-medium">
                Subject
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value as QuizSubject)}
                >
                  {subjects.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Topic
                <input
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-2 text-sm font-medium">
                  Level
                  <select
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                    value={learningLevel}
                    onChange={(event) =>
                      setLearningLevel(event.target.value as LearningLevel)
                    }
                  >
                    {levels.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Difficulty
                  <select
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                    value={difficulty}
                    onChange={(event) =>
                      setDifficulty(event.target.value as QuizDifficulty | "adaptive")
                    }
                  >
                    {difficulties.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="grid gap-2 text-sm font-medium">
                Questions: {questionCount}
                <input
                  type="range"
                  min={3}
                  max={10}
                  value={questionCount}
                  onChange={(event) => setQuestionCount(Number(event.target.value))}
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Recent accuracy: {recentAccuracy}%
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={recentAccuracy}
                  onChange={(event) => setRecentAccuracy(Number(event.target.value))}
                />
              </label>
              <Button type="submit" disabled={isGenerating}>
                {isGenerating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                Generate quiz
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Quiz controls</CardTitle>
            <CardDescription>
              Built for keyboard-first practice and fast review.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <Keyboard className="size-4 text-primary" />
              Press 1-4 to choose options.
            </div>
            <div className="flex items-center gap-3">
              <ArrowLeft className="size-4 text-primary" />
              Use arrow keys for navigation.
            </div>
            <div className="flex items-center gap-3">
              <Trophy className="size-4 text-primary" />
              Review answers and open leaderboard after submit.
            </div>
          </CardContent>
        </Card>
      </aside>

      <section className="grid content-start gap-6">
        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {!quiz || !currentQuestion ? (
          <EmptyQuizState />
        ) : (
          <>
            <Card className="overflow-hidden shadow-sm">
              <CardHeader className="border-b">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="glass">{quiz.subject}</Badge>
                      <Badge variant="outline">{quiz.difficulty}</Badge>
                      {isReviewing ? <Badge variant="success">Review mode</Badge> : null}
                    </div>
                    <CardTitle className="mt-3">{quiz.title}</CardTitle>
                    <CardDescription>{quiz.adaptationNote}</CardDescription>
                  </div>
                  <div className="grid min-w-52 gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Clock3 className="size-4" />
                        Time left
                      </span>
                      <span
                        className={cn(
                          "font-semibold",
                          remainingSeconds < 60 && "text-destructive",
                        )}
                      >
                        {formatTime(remainingSeconds)}
                      </span>
                    </div>
                    <Progress
                      value={timeProgress}
                      label="Quiz time remaining"
                      indicatorClassName={
                        remainingSeconds < 60 ? "bg-destructive" : undefined
                      }
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border-b p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {answeredCount}/{quiz.questions.length} answered
                    </span>
                  </div>
                  <Progress value={answerProgress} label="Quiz answer progress" />
                  <QuestionNavigator
                    quiz={quiz}
                    answers={answers}
                    currentIndex={currentIndex}
                    result={result}
                    onSelect={setCurrentIndex}
                  />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -18 }}
                    transition={{ duration: 0.22 }}
                    className="p-4 sm:p-6"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Question {currentIndex + 1} of {quiz.questions.length}
                        </p>
                        <h2 className="mt-2 max-w-3xl text-xl font-semibold leading-8">
                          {currentQuestion.question}
                        </h2>
                      </div>
                      <Badge variant="secondary">{currentQuestion.topic}</Badge>
                    </div>

                    <div className="mt-6 grid gap-3">
                      {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedAnswer === option;
                        const isCorrect = currentQuestion.correctAnswer === option;
                        const reveal = Boolean(selectedAnswer) || Boolean(result);

                        return (
                          <button
                            key={option}
                            type="button"
                            disabled={Boolean(result)}
                            className={cn(
                              "group flex items-start gap-3 rounded-lg border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              isSelected && "border-primary bg-primary/10",
                              reveal && isCorrect && "border-success bg-success/15",
                              reveal &&
                                isSelected &&
                                !isCorrect &&
                                "border-destructive bg-destructive/10",
                            )}
                            onClick={() => chooseAnswer(currentQuestion.id, option)}
                          >
                            <span
                              className={cn(
                                "flex size-7 shrink-0 items-center justify-center rounded-md border text-xs font-semibold",
                                isSelected &&
                                  "border-primary bg-primary text-primary-foreground",
                                reveal &&
                                  isCorrect &&
                                  "border-success bg-success text-success-foreground",
                              )}
                            >
                              {optionLabels[index]}
                            </span>
                            <span className="text-sm leading-6">{option}</span>
                          </button>
                        );
                      })}
                    </div>

                    {selectedAnswer ? (
                      <InstantFeedback
                        isCorrect={Boolean(currentInstantFeedback)}
                        explanation={currentQuestion.explanation}
                      />
                    ) : (
                      <p className="mt-4 rounded-md border bg-background/55 p-3 text-sm text-muted-foreground">
                        Hint: {currentQuestion.hint}
                      </p>
                    )}

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            setCurrentIndex((index) => Math.max(index - 1, 0))
                          }
                          disabled={currentIndex === 0}
                        >
                          <ChevronLeft className="size-4" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            setCurrentIndex((index) =>
                              Math.min(index + 1, quiz.questions.length - 1),
                            )
                          }
                          disabled={currentIndex === quiz.questions.length - 1}
                        >
                          Next
                          <ChevronRight className="size-4" />
                        </Button>
                      </div>

                      {!result ? (
                        <Button
                          disabled={!canSubmit || isSubmitting}
                          onClick={() => void submitQuiz()}
                        >
                          {isSubmitting ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="size-4" />
                          )}
                          Submit quiz
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => setIsReviewing((value) => !value)}
                          >
                            <Eye className="size-4" />
                            Review answers
                          </Button>
                          <Button onClick={() => setShowLeaderboard(true)}>
                            <Trophy className="size-4" />
                            Leaderboard
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>

            {result ? <ResultPanel result={result} /> : null}
          </>
        )}
      </section>

      {showLeaderboard && result ? (
        <LeaderboardModal
          points={result.leaderboardPoints}
          accuracy={result.accuracy}
          onClose={() => setShowLeaderboard(false)}
        />
      ) : null}
    </div>
  );
}

function EmptyQuizState() {
  return (
    <Card className="min-h-[520px] shadow-sm">
      <CardContent className="flex min-h-[520px] flex-col items-center justify-center text-center">
        <Sparkles className="size-10 text-primary" />
        <h2 className="mt-5 text-2xl font-semibold">
          Generate your first adaptive quiz
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          Choose a subject and topic. Gemini will generate MCQs, save them to
          Supabase, and the engine will score your answers.
        </p>
      </CardContent>
    </Card>
  );
}

function QuestionNavigator({
  quiz,
  answers,
  currentIndex,
  result,
  onSelect,
}: {
  quiz: GeneratedQuiz;
  answers: Record<string, string>;
  currentIndex: number;
  result?: QuizSubmissionResult;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2" aria-label="Question navigation">
      {quiz.questions.map((question, index) => {
        const selected = answers[question.id];
        const resultForQuestion = result?.results.find(
          (item) => item.questionId === question.id,
        );

        return (
          <button
            key={question.id}
            type="button"
            className={cn(
              "flex size-10 items-center justify-center rounded-md border text-sm font-medium transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              currentIndex === index && "border-primary bg-primary text-primary-foreground",
              selected && currentIndex !== index && "bg-secondary",
              resultForQuestion?.isCorrect && "border-success bg-success/20",
              resultForQuestion &&
                !resultForQuestion.isCorrect &&
                "border-destructive bg-destructive/15",
            )}
            aria-current={currentIndex === index ? "true" : undefined}
            aria-label={`Go to question ${index + 1}`}
            onClick={() => onSelect(index)}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
}

function InstantFeedback({
  isCorrect,
  explanation,
}: {
  isCorrect: boolean;
  explanation: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "mt-4 rounded-md border p-3 text-sm leading-6",
        isCorrect
          ? "border-success bg-success/15 text-foreground"
          : "border-destructive bg-destructive/10 text-foreground",
      )}
    >
      <div className="mb-1 flex items-center gap-2 font-medium">
        {isCorrect ? (
          <CheckCircle2 className="size-4 text-success-foreground dark:text-success" />
        ) : (
          <XCircle className="size-4 text-destructive" />
        )}
        {isCorrect ? "Correct" : "Not quite"}
      </div>
      {explanation}
    </motion.div>
  );
}

function ResultPanel({ result }: { result: QuizSubmissionResult }) {
  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle>Quiz result</CardTitle>
        <CardDescription>{result.feedback}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-4">
          <ResultStat label="Score" value={`${result.score}/${result.totalMarks}`} />
          <ResultStat label="Accuracy" value={`${result.accuracy}%`} />
          <ResultStat
            label="Correct"
            value={`${result.correctCount}/${result.totalQuestions}`}
          />
          <ResultStat label="Next" value={result.nextDifficulty} />
        </div>
        <div className="mt-5 rounded-md border bg-card p-4 text-sm">
          Leaderboard points earned: <strong>{result.leaderboardPoints}</strong>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold capitalize">{value}</p>
    </div>
  );
}

function LeaderboardModal({
  points,
  accuracy,
  onClose,
}: {
  points: number;
  accuracy: number;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leaderboard-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg rounded-lg border bg-card shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b p-5">
          <div>
            <Badge variant="glass">
              <Medal className="mr-1 size-3.5" />
              Weekly leaderboard
            </Badge>
            <h2 id="leaderboard-title" className="mt-3 text-xl font-semibold">
              You earned {points} points
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Accuracy this attempt: {accuracy}%
            </p>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </Button>
        </div>
        <div className="grid gap-2 p-5">
          {leaderboardRows.map((row) => (
            <div
              key={row.rank}
              className={cn(
                "flex items-center justify-between rounded-md border p-3",
                row.current && "border-primary bg-primary/10",
              )}
            >
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-md bg-secondary text-sm font-semibold text-secondary-foreground">
                  {row.rank}
                </span>
                <div>
                  <p className="text-sm font-medium">{row.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.accuracy}% accuracy
                  </p>
                </div>
              </div>
              <p className="font-semibold">{row.points.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
