"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  Sliders,
  History,
  FileText,
  Clock,
  ArrowRight,
  Brain,
  ChevronRight,
  RefreshCw,
  ListRestart,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

import { ArtifactViewer } from "@/components/content/artifact-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type {
  ContentArtifact,
  ContentArtifactType,
  ContentSubject,
  LearningLevel,
} from "@/lib/content/types";

const loadingSteps = [
  "Structuring curriculum alignment...",
  "Querying Gemini Content Intelligence Engine...",
  "Formatting structured schema outputs...",
  "Applying JEE/NEET pedagogical guardrails...",
  "Polishing active recall structures...",
  "Writing study resources to secure store...",
];

const subjectColors: Record<
  ContentSubject,
  { bg: string; text: string; border: string; accent: string }
> = {
  Physics: {
    bg: "bg-chart-physics/10 dark:bg-chart-physics/18",
    text: "text-chart-physics",
    border: "border-chart-physics/25",
    accent: "bg-chart-physics",
  },
  Chemistry: {
    bg: "bg-chart-chemistry/10 dark:bg-chart-chemistry/18",
    text: "text-chart-chemistry",
    border: "border-chart-chemistry/25",
    accent: "bg-chart-chemistry",
  },
  Math: {
    bg: "bg-chart-math/10 dark:bg-chart-math/18",
    text: "text-chart-math",
    border: "border-chart-math/25",
    accent: "bg-chart-math",
  },
  Biology: {
    bg: "bg-chart-biology/10 dark:bg-chart-biology/18",
    text: "text-chart-biology",
    border: "border-chart-biology/25",
    accent: "bg-chart-biology",
  },
  General: {
    bg: "bg-primary/10 dark:bg-primary/18",
    text: "text-primary",
    border: "border-primary/25",
    accent: "bg-primary",
  },
};

const artifactDetails: Record<
  ContentArtifactType,
  { label: string; desc: string }
> = {
  notes: {
    label: "Premium Notes",
    desc: "Structured conceptual summaries with solved exam cases",
  },
  summary: {
    label: "Chapter Summary",
    desc: "Dense, scannable final-revision worksheets",
  },
  flashcards: {
    label: "Active Flashcards",
    desc: "Mixed-difficulty active-recall front/back sets",
  },
  revision_sheet: {
    label: "Revision Sheet",
    desc: "One-session revision paths with exam traps",
  },
  formula_sheet: {
    label: "Formula Sheet",
    desc: "Variable logs, exception boundaries & conditions",
  },
  mind_map: {
    label: "Mind Map Outline",
    desc: "Hierarchical conceptual relationship pathways",
  },
};

export function ContentIntelligenceWorkspace() {
  // Form State
  const [subject, setSubject] = useState<ContentSubject>("Physics");
  const [artifactType, setArtifactType] =
    useState<ContentArtifactType>("notes");
  const [chapter, setChapter] = useState("");
  const [learningLevel, setLearningLevel] = useState<LearningLevel>("JEE Main");
  const [focus, setFocus] = useState("");
  const [sourceText, setSourceText] = useState("");

  // UI State
  const [loading, setLoading] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ContentArtifact[]>([]);
  const [currentArtifact, setCurrentArtifact] =
    useState<ContentArtifact | null>(null);
  const [activeTab, setActiveTab] = useState<"generate" | "history">(
    "generate",
  );

  // Fetch past artifacts on mount
  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/content");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.artifacts || []);
      }
    } catch (e) {
      console.error("Could not fetch generation history", e);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Loading Step Animation Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingStepIdx(0);
      interval = setInterval(() => {
        setLoadingStepIdx((prev) =>
          prev < loadingSteps.length - 1 ? prev + 1 : prev,
        );
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Handle Form Submission
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapter.trim()) {
      setError("Please specify a chapter title.");
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentArtifact(null);

    try {
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          artifactType,
          chapter: chapter.trim(),
          learningLevel,
          focus: focus.trim() || undefined,
          sourceText: sourceText.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Generation failed.");
      }

      setCurrentArtifact(data.artifact);
      fetchHistory(); // Refresh history log
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred during synthesis.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Load artifact from history
  const loadArtifact = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/content?id=${id}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not retrieve artifact.");
      }
      setCurrentArtifact(data.artifact);
      setActiveTab("generate"); // Go back to workspace view to see details
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Error loading saved artifact.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative grid gap-8 lg:grid-cols-12">
      {/* Configuration & Sidebar Panel: 4 Columns on large displays */}
      <div className="space-y-6 lg:col-span-4">
        {/* Tab Selection */}
        <div className="bg-secondary/40 flex rounded-lg p-1">
          <button
            onClick={() => setActiveTab("generate")}
            className={`flex-1 rounded-md py-2.5 text-center text-sm font-medium transition-all ${
              activeTab === "generate"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="mr-2 inline size-4" />
            Synthesizer
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 rounded-md py-2.5 text-center text-sm font-medium transition-all ${
              activeTab === "history"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="mr-2 inline size-4" />
            Archive ({history.length})
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "generate" ? (
            <motion.div
              key="generate-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="glass-panel border shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <Sliders className="text-primary size-5" />
                    AI Artifact Setup
                  </CardTitle>
                  <CardDescription>
                    Configure settings to synthesize specialized revision
                    assets.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleGenerate} className="space-y-5">
                    {/* Subject Row */}
                    <div className="space-y-2.5">
                      <label className="text-sm font-semibold tracking-wide">
                        Subject
                      </label>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
                        {(
                          [
                            "Physics",
                            "Chemistry",
                            "Math",
                            "Biology",
                            "General",
                          ] as ContentSubject[]
                        ).map((subj) => {
                          const active = subject === subj;
                          const theme = subjectColors[subj];
                          return (
                            <button
                              key={subj}
                              type="button"
                              onClick={() => setSubject(subj)}
                              className={`flex items-center justify-center rounded-md border px-3 py-2 text-xs font-semibold transition-all ${
                                active
                                  ? `${theme.bg} ${theme.text} ${theme.border} ring-offset-background ring-2 ring-offset-2`
                                  : "bg-background/40 hover:bg-secondary text-muted-foreground border-border/60"
                              }`}
                            >
                              {subj}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Artifact Type Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold tracking-wide">
                        Artifact Goal
                      </label>
                      <select
                        value={artifactType}
                        onChange={(e) =>
                          setArtifactType(e.target.value as ContentArtifactType)
                        }
                        className="focus-ring border-input bg-background/50 focus:border-primary w-full rounded-md border p-2.5 text-sm transition-all"
                      >
                        {Object.entries(artifactDetails).map(
                          ([key, details]) => (
                            <option key={key} value={key}>
                              {details.label}
                            </option>
                          ),
                        )}
                      </select>
                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                        {artifactDetails[artifactType].desc}
                      </p>
                    </div>

                    {/* Chapter Input */}
                    <div className="space-y-2">
                      <label
                        htmlFor="chapter-input"
                        className="text-sm font-semibold tracking-wide"
                      >
                        Chapter / Topic Name
                      </label>
                      <input
                        id="chapter-input"
                        type="text"
                        required
                        value={chapter}
                        onChange={(e) => setChapter(e.target.value)}
                        placeholder="e.g. Electric Charges and Fields"
                        className="focus-ring border-input bg-background/50 focus:border-primary w-full rounded-md border p-2.5 text-sm transition-all"
                      />
                    </div>

                    {/* Target level */}
                    <div className="space-y-2">
                      <label
                        htmlFor="level-select"
                        className="text-sm font-semibold tracking-wide"
                      >
                        Target Learning Level
                      </label>
                      <select
                        id="level-select"
                        value={learningLevel}
                        onChange={(e) =>
                          setLearningLevel(e.target.value as LearningLevel)
                        }
                        className="focus-ring border-input bg-background/50 focus:border-primary w-full rounded-md border p-2.5 text-sm transition-all"
                      >
                        <option value="Foundation">
                          Foundation (CBSE / Boards)
                        </option>
                        <option value="JEE Main">
                          JEE Main / NEET Standard
                        </option>
                        <option value="JEE Advanced">
                          JEE Advanced (Conceptual Rigor)
                        </option>
                        <option value="NEET">
                          NEET Focused (In-Depth Biology/Physics)
                        </option>
                      </select>
                    </div>

                    {/* Focus Custom Area */}
                    <div className="space-y-2">
                      <label
                        htmlFor="focus-input"
                        className="text-sm font-semibold tracking-wide"
                      >
                        Custom Focus Points (Optional)
                      </label>
                      <textarea
                        id="focus-input"
                        value={focus}
                        onChange={(e) => setFocus(e.target.value)}
                        placeholder="e.g. Prioritize Gauss Law applications, omit history, detail numerical problem-solving steps."
                        rows={2}
                        className="focus-ring border-input bg-background/50 focus:border-primary w-full resize-none rounded-md border p-2.5 text-sm transition-all"
                      />
                    </div>

                    {/* Pasted text context */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="source-input"
                          className="text-sm font-semibold tracking-wide"
                        >
                          Reference Text (Optional)
                        </label>
                        <span className="text-muted-foreground text-[10px]">
                          {sourceText.length}/12k chars
                        </span>
                      </div>
                      <textarea
                        id="source-input"
                        value={sourceText}
                        onChange={(e) =>
                          setSourceText(e.target.value.slice(0, 12000))
                        }
                        placeholder="Paste paragraphs from your textbooks, study packages, or handwritten class notes to heavily guide the AI generation..."
                        rows={3}
                        className="focus-ring border-input bg-background/50 focus:border-primary w-full resize-none rounded-md border p-2.5 text-sm transition-all"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full py-6 font-semibold"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="mr-2 size-4 animate-spin" />
                          Synthesizing...
                        </>
                      ) : (
                        <>
                          Generate Custom Assets
                          <ArrowRight className="ml-2 size-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="history-sidebar"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <Card className="glass-panel max-h-[700px] overflow-y-auto border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    Generated Archive
                  </CardTitle>
                  <CardDescription>
                    Browse and load previously synthesized study resources.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {history.length === 0 ? (
                    <div className="text-muted-foreground py-8 text-center text-sm">
                      <HelpCircle className="mx-auto mb-2 size-8 opacity-40" />
                      No artifacts generated yet. Configure options in the
                      Synthesizer tab!
                    </div>
                  ) : (
                    history.map((item) => {
                      const theme =
                        subjectColors[item.subject as ContentSubject] ||
                        subjectColors.General;
                      return (
                        <div
                          key={item.id}
                          onClick={() => item.id && loadArtifact(item.id)}
                          className="hover:border-primary hover:bg-secondary/40 group bg-background/45 flex cursor-pointer items-start justify-between rounded-lg border p-3.5 transition-all"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Badge
                                variant="outline"
                                className={`${theme.bg} ${theme.text} ${theme.border} text-[10px] font-bold`}
                              >
                                {item.subject}
                              </Badge>
                              <Badge className="bg-secondary text-secondary-foreground text-[10px]">
                                {item.artifactType}
                              </Badge>
                            </div>
                            <h4 className="group-hover:text-primary text-foreground mt-2 truncate text-sm font-semibold">
                              {item.title}
                            </h4>
                            <div className="text-muted-foreground mt-1 flex items-center gap-1 text-[11px]">
                              <Clock className="size-3" />
                              <span>
                                {new Date(item.metadata?.generatedAt || Date.now()).toLocaleDateString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                  },
                                )}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="text-muted-foreground group-hover:text-primary mt-3 size-4 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail Display Panel: 8 Columns on large displays */}
      <div className="lg:col-span-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-card/75 border-border/80 border-surface-glass flex min-h-[580px] flex-col items-center justify-center rounded-lg border p-8 shadow-sm backdrop-blur-md"
            >
              <div className="relative flex size-28 items-center justify-center">
                <div className="bg-primary/20 absolute size-full animate-ping rounded-full opacity-75" />
                <div className="border-primary absolute size-20 animate-spin rounded-full border-4 border-t-transparent" />
                <div className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-2xl shadow-lg">
                  <Brain className="size-6 animate-pulse" />
                </div>
              </div>
              <h3 className="mt-8 text-xl font-bold tracking-tight">
                Synthesizing Course Materials
              </h3>
              <p className="text-muted-foreground mt-2 max-w-sm text-center text-sm leading-6">
                Gemini is preparing detailed, pedagogical study aids tailored to
                your focus bounds.
              </p>

              {/* Progress Stepper indicator */}
              <div className="mt-8 w-full max-w-md space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-primary tracking-wider uppercase">
                    Status Update
                  </span>
                  <span className="text-muted-foreground">
                    {loadingStepIdx + 1} of {loadingSteps.length}
                  </span>
                </div>
                <div className="bg-secondary h-1.5 w-full overflow-hidden rounded-full">
                  <motion.div
                    className="bg-primary h-full"
                    initial={{ width: "0%" }}
                    animate={{
                      width: `${((loadingStepIdx + 1) / loadingSteps.length) * 100}%`,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingStepIdx}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="text-muted-foreground mt-2 text-center text-xs font-medium italic"
                  >
                    {loadingSteps[loadingStepIdx]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error-panel"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-destructive/6 border-destructive/20 flex min-h-[580px] flex-col items-center justify-center rounded-lg border p-8 text-center shadow-sm"
            >
              <div className="bg-destructive/10 text-destructive flex size-14 items-center justify-center rounded-full">
                <AlertCircle className="size-7" />
              </div>
              <h3 className="mt-5 text-lg font-bold">Synthesis Blocked</h3>
              <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
                The content intelligence pipeline could not finalize this
                generation request.
              </p>
              <div className="bg-background/60 border-destructive/10 text-destructive mt-6 max-w-lg rounded-md border p-4 text-left font-mono text-xs dark:text-red-400">
                Error: {error}
              </div>
              <Button
                onClick={() => setError(null)}
                variant="outline"
                className="mt-8"
              >
                <ListRestart className="mr-2 size-4" />
                Reset Parameters
              </Button>
            </motion.div>
          ) : currentArtifact ? (
            <motion.div
              key="viewer-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ArtifactViewer artifact={currentArtifact} />
            </motion.div>
          ) : (
            <motion.div
              key="empty-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-panel flex min-h-[580px] flex-col items-center justify-center rounded-lg border p-8 text-center shadow-inner"
            >
              <div className="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-2xl shadow-sm">
                <BookOpen className="size-8 animate-pulse" />
              </div>
              <h3 className="text-foreground mt-6 text-xl font-bold tracking-tight">
                AI Content Intelligence Workspace
              </h3>
              <p className="text-muted-foreground mt-3 max-w-md text-sm leading-relaxed">
                Select your subject, adjust the learning level, enter your
                target chapter, and start generating premium notes, revision
                guides, mind maps, or active recall cards.
              </p>
              <div className="text-muted-foreground mt-8 grid max-w-lg grid-cols-2 gap-4 text-left text-xs">
                <div className="bg-background/30 flex gap-2 rounded-md border p-3">
                  <div className="bg-primary/12 text-primary flex size-6 shrink-0 items-center justify-center rounded">
                    1
                  </div>
                  <p>
                    Choose high-yield artifact formats like Must-Know Formula
                    sheets or Mind Map outlines.
                  </p>
                </div>
                <div className="bg-background/30 flex gap-2 rounded-md border p-3">
                  <div className="bg-primary/12 text-primary flex size-6 shrink-0 items-center justify-center rounded">
                    2
                  </div>
                  <p>
                    Optionally paste syllabus excerpts or textbook pages to
                    guide content synthesis.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
