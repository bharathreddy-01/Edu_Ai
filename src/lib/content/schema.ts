import { z } from "zod";

import {
  contentArtifactTypes,
  contentSubjects,
  learningLevels,
} from "@/lib/content/types";

const mindMapNodeSchema: z.ZodType<{
  label: string;
  children?: Array<{ label: string; children?: unknown[] }>;
}> = z.lazy(() =>
  z.object({
    label: z.string().trim().min(1),
    children: z.array(mindMapNodeSchema).optional(),
  }),
);

export const contentGenerationRequestSchema = z.object({
  artifactType: z.enum(contentArtifactTypes),
  subject: z.enum(contentSubjects),
  chapter: z.string().trim().min(2).max(120),
  learningLevel: z.enum(learningLevels),
  focus: z.string().trim().max(500).optional().or(z.literal("")),
  sourceText: z.string().trim().max(12000).optional().or(z.literal("")),
});

export const contentArtifactSchema = z.object({
  artifactType: z.enum(contentArtifactTypes),
  subject: z.enum(contentSubjects),
  chapter: z.string().trim().min(1),
  title: z.string().trim().min(3).max(140),
  markdown: z.string().trim().min(120),
  structured: z.object({
    sections: z
      .array(
        z.object({
          heading: z.string().trim().min(1),
          bullets: z.array(z.string().trim().min(1)).min(2).max(8),
        }),
      )
      .min(2)
      .max(8),
    flashcards: z
      .array(
        z.object({
          front: z.string().trim().min(1),
          back: z.string().trim().min(1),
          difficulty: z.enum(["easy", "medium", "hard"]),
        }),
      )
      .min(3)
      .max(16),
    formulas: z
      .array(
        z.object({
          name: z.string().trim().min(1),
          formula: z.string().trim().min(1),
          useCase: z.string().trim().min(1),
        }),
      )
      .max(16),
    mindMap: mindMapNodeSchema,
    examTips: z.array(z.string().trim().min(1)).min(3).max(8),
    revisionPlan: z.array(z.string().trim().min(1)).min(3).max(8),
  }),
  metadata: z.object({
    estimatedRevisionMinutes: z.number().int().min(5).max(240),
    keyTerms: z.array(z.string().trim().min(1)).min(4).max(24),
    generatedAt: z.string().datetime(),
    model: z.string().optional(),
  }),
});

export type ContentGenerationInput = z.infer<
  typeof contentGenerationRequestSchema
>;
