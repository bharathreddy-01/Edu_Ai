export const contentArtifactTypes = [
  "notes",
  "summary",
  "flashcards",
  "revision_sheet",
  "formula_sheet",
  "mind_map",
] as const;

export const contentSubjects = [
  "Physics",
  "Chemistry",
  "Math",
  "Biology",
  "General",
] as const;

export const learningLevels = [
  "Foundation",
  "JEE Main",
  "JEE Advanced",
  "NEET",
] as const;

export type ContentArtifactType = (typeof contentArtifactTypes)[number];
export type ContentSubject = (typeof contentSubjects)[number];
export type LearningLevel = (typeof learningLevels)[number];

export type ContentGenerationRequest = {
  artifactType: ContentArtifactType;
  subject: ContentSubject;
  chapter: string;
  learningLevel: LearningLevel;
  focus?: string;
  sourceText?: string;
};

export type Flashcard = {
  front: string;
  back: string;
  difficulty: "easy" | "medium" | "hard";
};

export type FormulaItem = {
  name: string;
  formula: string;
  useCase: string;
};

export type MindMapNode = {
  label: string;
  children?: MindMapNode[];
};

export type ContentArtifact = {
  id?: string;
  artifactType: ContentArtifactType;
  subject: ContentSubject;
  chapter: string;
  title: string;
  markdown: string;
  structured: {
    sections: Array<{
      heading: string;
      bullets: string[];
    }>;
    flashcards: Flashcard[];
    formulas: FormulaItem[];
    mindMap: MindMapNode;
    examTips: string[];
    revisionPlan: string[];
  };
  metadata: {
    estimatedRevisionMinutes: number;
    keyTerms: string[];
    generatedAt: string;
    model?: string;
  };
};
