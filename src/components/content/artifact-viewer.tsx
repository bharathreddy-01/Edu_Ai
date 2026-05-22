"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Layers,
  Copy,
  Printer,
  Download,
  Check,
  HelpCircle,
  TrendingUp,
  Brain,
  ListTodo,
  AlertTriangle,
  Flame,
  ArrowLeft,
  ArrowRight,
  BookOpen,
} from "lucide-react";

import { MarkdownMessage } from "@/components/ai/markdown-message";
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
  Flashcard,
  FormulaItem,
  MindMapNode,
} from "@/lib/content/types";

// Recursive Mind Map Tree Node Component
function MindMapTreeView({
  node,
  isRoot = false,
}: {
  node: MindMapNode;
  isRoot?: boolean;
}) {
  if (!node) return null;
  return (
    <div
      className={`relative ${isRoot ? "" : "border-primary/20 my-3.5 ml-2 border-l-2 pl-6"}`}
    >
      {/* Node label */}
      <div className="flex items-center gap-3">
        <div
          className={`flex shrink-0 items-center justify-center rounded-full ${
            isRoot
              ? "bg-primary text-primary-foreground size-5 animate-pulse font-bold shadow-md"
              : "bg-accent text-accent-foreground size-3 shadow-sm"
          }`}
        >
          {isRoot && <Brain className="size-3" />}
        </div>
        <div
          className={`rounded-lg border px-3 py-1.5 text-sm font-semibold shadow-sm transition-all hover:scale-[1.01] ${
            isRoot
              ? "bg-primary/10 border-primary text-foreground text-base font-bold"
              : "bg-card border-border/80 text-foreground/90"
          }`}
        >
          {node.label}
        </div>
      </div>
      {/* Children nodes */}
      {node.children && node.children.length > 0 && (
        <div className="space-y-1">
          {node.children.map((child, idx) => (
            <MindMapTreeView key={idx} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ArtifactViewer({ artifact }: { artifact: ContentArtifact }) {
  // Tabs State
  const tabs = [
    { id: "markdown", label: "Read Notes", icon: FileText },
    { id: "structured", label: "Key Concepts", icon: Layers },
    { id: "flashcards", label: "Active Cards", icon: Flame },
    { id: "formulas", label: "Formula Bank", icon: BookOpen },
    { id: "mindmap", label: "Mind Map", icon: Brain },
    { id: "revision", label: "Revision Plan", icon: ListTodo },
  ] as const;

  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]["id"]>("markdown");

  // Flashcards state
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Copy success states
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyFormulaIdx, setCopyFormulaIdx] = useState<number | null>(null);

  // Handlers
  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(artifact.markdown);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (e) {
      console.error("Failed to copy markdown text", e);
    }
  };

  const handleCopyFormula = async (formula: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(formula);
      setCopyFormulaIdx(idx);
      setTimeout(() => setCopyFormulaIdx(null), 1500);
    } catch (e) {
      console.error("Failed to copy formula", e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(artifact, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `${artifact.chapter.toLowerCase().replace(/\s+/g, "_")}_${artifact.artifactType}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Safe structured getters
  const sections = artifact.structured?.sections || [];
  const flashcards = artifact.structured?.flashcards || [];
  const formulas = artifact.structured?.formulas || [];
  const mindMap = artifact.structured?.mindMap;
  const examTips = artifact.structured?.examTips || [];
  const revisionPlan = artifact.structured?.revisionPlan || [];

  return (
    <div className="space-y-6">
      {/* Title & Metadata Top Card */}
      <Card className="glass-panel border shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="glass">{artifact.subject}</Badge>
                <Badge className="bg-primary/10 text-primary text-[10px] font-bold tracking-wider uppercase">
                  {artifact.artifactType.replace("_", " ")}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  Est: {artifact.metadata?.estimatedRevisionMinutes || 30} mins
                </Badge>
              </div>
              <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                {artifact.title}
              </h2>
              <p className="text-muted-foreground text-sm font-medium">
                Chapter: {artifact.chapter}
              </p>
            </div>

            {/* Export controls */}
            <div className="flex flex-wrap items-center gap-2 self-start">
              <Button onClick={handleCopyMarkdown} size="sm" variant="outline">
                {copySuccess ? (
                  <>
                    <Check className="text-success mr-1.5 size-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 size-4" />
                    Copy MD
                  </>
                )}
              </Button>
              <Button onClick={handlePrint} size="sm" variant="outline">
                <Printer className="mr-1.5 size-4" />
                Print PDF
              </Button>
              <Button onClick={handleDownloadJson} size="sm" variant="outline">
                <Download className="mr-1.5 size-4" />
                JSON
              </Button>
            </div>
          </div>

          {/* Key terms list */}
          {artifact.metadata?.keyTerms &&
            artifact.metadata.keyTerms.length > 0 && (
              <div className="mt-5 border-t pt-4">
                <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  Key Concepts Covered
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {artifact.metadata.keyTerms.map((term, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="bg-background/40 hover:bg-secondary text-[11px]"
                    >
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Tab Navigation links */}
      <div className="flex scrollbar-none overflow-x-auto border-b pb-px">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all ${
                  active
                    ? "border-primary text-primary font-semibold"
                    : "text-muted-foreground hover:border-border hover:text-foreground border-transparent"
                }`}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="min-h-[380px]">
        <AnimatePresence mode="wait">
          {activeTab === "markdown" && (
            <motion.div
              key="markdown-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <FileText className="text-primary size-5" />
                    High-Yield Revision Notes
                  </CardTitle>
                  <CardDescription>
                    Fully rendered, detailed exam preparation workspace.
                  </CardDescription>
                </CardHeader>
                <CardContent className="prose prose-slate dark:prose-invert max-w-none pb-8">
                  <MarkdownMessage content={artifact.markdown} />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "structured" && (
            <motion.div
              key="structured-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {sections.length === 0 ? (
                <Card className="text-muted-foreground p-8 text-center text-sm">
                  No sections structure available for this artifact.
                </Card>
              ) : (
                sections.map((sect, i) => (
                  <Card key={i} className="shadow-sm">
                    <CardHeader className="bg-secondary/20 py-4">
                      <CardTitle className="flex items-center gap-2.5 text-base font-bold">
                        <Badge className="bg-primary/20 text-primary-foreground flex size-6 items-center justify-center rounded-full font-semibold">
                          {i + 1}
                        </Badge>
                        {sect.heading}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ul className="text-foreground/90 grid list-disc gap-3 pl-3 text-sm">
                        {sect.bullets.map((bullet, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))
              )}
            </motion.div>
          )}

          {activeTab === "flashcards" && (
            <motion.div
              key="flashcards-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center space-y-6 py-6"
            >
              {flashcards.length === 0 ? (
                <Card className="text-muted-foreground w-full p-8 text-center text-sm">
                  No active recall flashcards mapped for this subject.
                </Card>
              ) : (
                <div className="w-full max-w-lg space-y-6">
                  {/* Card Deck Controls Top */}
                  <div className="flex items-center justify-between px-2 text-sm font-semibold">
                    <span className="text-muted-foreground">
                      Card {currentCardIdx + 1} of {flashcards.length}
                    </span>
                    <Badge
                      variant={
                        flashcards[currentCardIdx].difficulty === "hard"
                          ? "default"
                          : flashcards[currentCardIdx].difficulty === "medium"
                            ? "warning"
                            : "success"
                      }
                    >
                      {flashcards[currentCardIdx].difficulty}
                    </Badge>
                  </div>

                  {/* 3D Flippable Card Frame */}
                  <div
                    onClick={() => setIsCardFlipped(!isCardFlipped)}
                    className="relative h-80 w-full cursor-pointer"
                    style={{ perspective: "1000px" }}
                  >
                    <motion.div
                      className="transform-style-3d relative h-full w-full shadow-md"
                      animate={{ rotateY: isCardFlipped ? 180 : 0 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {/* Front: Question */}
                      <div
                        className="bg-card absolute inset-0 flex flex-col justify-between rounded-2xl border p-8"
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        <div className="text-primary flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                          <HelpCircle className="size-4 animate-bounce" />
                          Active Recall Question
                        </div>
                        <div className="text-foreground my-auto px-4 text-center text-lg leading-relaxed font-bold">
                          {flashcards[currentCardIdx].front}
                        </div>
                        <div className="text-muted-foreground text-center text-xs italic opacity-75">
                          Tap card to reveal explanation
                        </div>
                      </div>

                      {/* Back: Explanation */}
                      <div
                        className="bg-primary/8 border-primary/20 absolute inset-0 flex flex-col justify-between rounded-2xl border p-8"
                        style={{
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                        }}
                      >
                        <div className="text-accent flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                          <TrendingUp className="size-4" />
                          Explanation
                        </div>
                        <div className="text-foreground my-auto max-h-[160px] overflow-y-auto px-4 text-center text-base leading-relaxed font-semibold">
                          {flashcards[currentCardIdx].back}
                        </div>
                        <div className="text-muted-foreground text-center text-xs italic opacity-75">
                          Tap card to flip back to question
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Navigation controls */}
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      disabled={currentCardIdx === 0}
                      onClick={() => {
                        setIsCardFlipped(false);
                        setTimeout(
                          () => setCurrentCardIdx((prev) => prev - 1),
                          150,
                        );
                      }}
                      className="px-6"
                    >
                      <ArrowLeft className="mr-2 size-4" />
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      disabled={currentCardIdx === flashcards.length - 1}
                      onClick={() => {
                        setIsCardFlipped(false);
                        setTimeout(
                          () => setCurrentCardIdx((prev) => prev + 1),
                          150,
                        );
                      }}
                      className="px-6"
                    >
                      Next
                      <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "formulas" && (
            <motion.div
              key="formulas-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <BookOpen className="text-primary size-5" />
                    Formula Cheat Sheet
                  </CardTitle>
                  <CardDescription>
                    Variables, exceptional bounds, and exam problem cues.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  {formulas.length === 0 ? (
                    <div className="text-muted-foreground col-span-full py-8 text-center text-sm">
                      No mathematical formulas identified in this chapter.
                    </div>
                  ) : (
                    formulas.map((item, idx) => (
                      <div
                        key={idx}
                        className="group bg-background/50 hover:border-primary/40 hover:bg-secondary/20 relative rounded-xl border p-4 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="text-foreground text-sm font-bold">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => handleCopyFormula(item.formula, idx)}
                            className="text-muted-foreground hover:text-primary rounded p-1 opacity-60 transition-colors group-hover:opacity-100"
                            title="Copy formula LaTeX"
                          >
                            {copyFormulaIdx === idx ? (
                              <Check className="text-success size-3.5" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </button>
                        </div>
                        {/* Centered equation block */}
                        <div className="bg-card border-border/60 text-primary my-3 rounded-lg border px-4 py-3 text-center font-mono text-base font-semibold shadow-inner select-all">
                          {item.formula}
                        </div>
                        <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                          <span className="text-foreground font-semibold">
                            Usage:
                          </span>{" "}
                          {item.useCase}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "mindmap" && (
            <motion.div
              key="mindmap-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <Brain className="text-primary size-5" />
                    Conceptual Mind Map Outline
                  </CardTitle>
                  <CardDescription>
                    Prerequisites, core theorems, and analytical applications
                    path.
                  </CardDescription>
                </CardHeader>
                <CardContent className="bg-background/45 max-h-[600px] overflow-x-auto rounded-lg border p-6 shadow-inner">
                  {mindMap ? (
                    <MindMapTreeView node={mindMap} isRoot={true} />
                  ) : (
                    <div className="text-muted-foreground py-8 text-center text-sm">
                      No hierarchical mind map mapped for this topic.
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "revision" && (
            <motion.div
              key="revision-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid gap-6 md:grid-cols-12"
            >
              {/* Left checklist column: 7 cols */}
              <div className="space-y-4 md:col-span-7">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                      <ListTodo className="text-primary size-5" />
                      Structured Revision Steps
                    </CardTitle>
                    <CardDescription>
                      Check off revision goals as you complete focused
                      iterations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3.5">
                    {revisionPlan.length === 0 ? (
                      <p className="text-muted-foreground py-6 text-center text-sm">
                        No custom revision timeline computed.
                      </p>
                    ) : (
                      revisionPlan.map((step, idx) => (
                        <div
                          key={idx}
                          className="bg-background/50 flex items-start gap-3 rounded-lg border p-3"
                        >
                          <input
                            type="checkbox"
                            id={`rev-step-${idx}`}
                            className="focus-ring border-border bg-background text-primary mt-1 size-4 shrink-0 rounded"
                          />
                          <label
                            htmlFor={`rev-step-${idx}`}
                            className="text-foreground/90 cursor-pointer text-sm leading-relaxed font-medium select-none"
                          >
                            {step}
                          </label>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right callouts column: 5 cols */}
              <div className="space-y-4 md:col-span-5">
                <Card className="border-warning/25 bg-warning/6 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-warning-foreground dark:text-warning flex items-center gap-2 text-lg font-bold">
                      <AlertTriangle className="size-5" />
                      High-Weightage Exam Tips
                    </CardTitle>
                    <CardDescription className="text-warning-foreground/70 dark:text-warning/70">
                      Crucial guidelines based on recurring JEE/NEET patterns.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {examTips.length === 0 ? (
                      <p className="text-muted-foreground py-6 text-center text-sm">
                        No critical focus warnings generated.
                      </p>
                    ) : (
                      examTips.map((tip, idx) => (
                        <div
                          key={idx}
                          className="text-warning-foreground/90 dark:text-foreground/90 flex gap-2.5 text-sm"
                        >
                          <div className="bg-warning mt-2 size-1.5 shrink-0 rounded-full" />
                          <p className="leading-relaxed">{tip}</p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
