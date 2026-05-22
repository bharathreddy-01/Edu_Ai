import { z } from "zod";
import * as schemas from "@/lib/ai/schemas";
import type { ResponseValidation } from "@/lib/ai/types";

// JSON parsing and validation utilities
export class ResponseValidator {
  /**
   * Extract and validate JSON from a response string
   */
  static extractJSON(response: string): {
    json: Record<string, unknown> | null;
    valid: boolean;
    error?: string;
  } {
    try {
      // Try to find JSON in the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { json: null, valid: false, error: "No JSON found in response" };
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return { json: parsed, valid: true };
    } catch (error) {
      return {
        json: null,
        valid: false,
        error: `JSON parsing failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Validate quiz question structure
   */
  static validateQuizQuestion(data: unknown): ResponseValidation {
    try {
      schemas.QuizQuestionSchema.parse(data);
      return {
        isValid: true,
        errors: [],
        warnings: [],
        sanitized: false,
      };
    } catch (error) {
      const errors: string[] = [];
      if (error instanceof z.ZodError) {
        errors.push(
          ...error.issues.map((e: z.ZodIssue) => `${e.path.join(".")}: ${e.message}`)
        );
      }
      return {
        isValid: false,
        errors,
        warnings: [],
        sanitized: false,
      };
    }
  }

  /**
   * Validate complete quiz
   */
  static validateQuiz(data: unknown): ResponseValidation {
    try {
      schemas.QuizSchema.parse(data);
      return {
        isValid: true,
        errors: [],
        warnings: [],
        sanitized: false,
      };
    } catch (error) {
      const errors: string[] = [];
      if (error instanceof z.ZodError) {
        errors.push(
          ...error.issues.map((e: z.ZodIssue) => `${e.path.join(".")}: ${e.message}`)
        );
      }
      return {
        isValid: false,
        errors,
        warnings: [],
        sanitized: false,
      };
    }
  }

  /**
   * Validate answer evaluation
   */
  static validateEvaluation(data: unknown): ResponseValidation {
    try {
      schemas.AnswerEvaluationSchema.parse(data);
      return {
        isValid: true,
        errors: [],
        warnings: [],
        sanitized: false,
      };
    } catch (error) {
      const errors: string[] = [];
      if (error instanceof z.ZodError) {
        errors.push(
          ...error.issues.map((e: z.ZodIssue) => `${e.path.join(".")}: ${e.message}`)
        );
      }
      return {
        isValid: false,
        errors,
        warnings: [],
        sanitized: false,
      };
    }
  }

  /**
   * Validate evaluation result
   */
  static validateEvaluationResult(data: unknown): ResponseValidation {
    try {
      schemas.EvaluationResultSchema.parse(data);
      return {
        isValid: true,
        errors: [],
        warnings: [],
        sanitized: false,
      };
    } catch (error) {
      const errors: string[] = [];
      if (error instanceof z.ZodError) {
        errors.push(
          ...error.issues.map((e: z.ZodIssue) => `${e.path.join(".")}: ${e.message}`)
        );
      }
      return {
        isValid: false,
        errors,
        warnings: [],
        sanitized: false,
      };
    }
  }

  /**
   * Validate study plan
   */
  static validateStudyPlan(data: unknown): ResponseValidation {
    try {
      schemas.StudyPlanSchema.parse(data);
      return {
        isValid: true,
        errors: [],
        warnings: [],
        sanitized: false,
      };
    } catch (error) {
      const errors: string[] = [];
      if (error instanceof z.ZodError) {
        errors.push(
          ...error.issues.map((e: z.ZodIssue) => `${e.path.join(".")}: ${e.message}`)
        );
      }
      return {
        isValid: false,
        errors,
        warnings: [],
        sanitized: false,
      };
    }
  }

  /**
   * Validate structured output
   */
  static validateStructuredOutput(data: unknown): ResponseValidation {
    try {
      schemas.StructuredOutputSchema.parse(data);
      return {
        isValid: true,
        errors: [],
        warnings: [],
        sanitized: false,
      };
    } catch (error) {
      const errors: string[] = [];
      if (error instanceof z.ZodError) {
        errors.push(
          ...error.issues.map((e: z.ZodIssue) => `${e.path.join(".")}: ${e.message}`)
        );
      }
      return {
        isValid: false,
        errors,
        warnings: [],
        sanitized: false,
      };
    }
  }

  /**
   * Sanitize response to remove harmful content
   */
  static sanitizeResponse(response: string): string {
    // Remove potentially harmful JavaScript patterns
    let sanitized = response
      .replace(/<script[^>]*>.*?<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "");

    // Remove SQL injection patterns
    sanitized = sanitized
      .replace(/(\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b)/gi, (match) =>
        match.toUpperCase()
      );

    return sanitized;
  }

  /**
   * Validate MCQ options
   */
  static validateMCQOptions(
    options: string[],
    correctAnswer: string
  ): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!Array.isArray(options)) {
      errors.push("Options must be an array");
    } else if (options.length !== 4) {
      errors.push(`MCQ must have exactly 4 options, got ${options.length}`);
    }

    if (!options.includes(correctAnswer)) {
      errors.push(
        `Correct answer must be one of the options: ${correctAnswer}`
      );
    }

    // Check for duplicate options
    const uniqueOptions = new Set(options);
    if (uniqueOptions.size !== options.length) {
      errors.push("Options must be unique (no duplicates)");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate question difficulty level
   */
  static validateDifficulty(
    difficulty: string,
    level: string
  ): {
    valid: boolean;
    warning?: string;
  } {
    const validDifficulties = ["easy", "medium", "hard", "expert"];
    if (!validDifficulties.includes(difficulty)) {
      return {
        valid: false,
      };
    }

    // Check if difficulty matches student level
    const difficultyToLevel: Record<string, string[]> = {
      easy: ["beginner", "intermediate"],
      medium: ["intermediate", "advanced"],
      hard: ["advanced"],
      expert: ["advanced"],
    };

    const recommendedLevels = difficultyToLevel[difficulty] || [];
    if (!recommendedLevels.includes(level)) {
      return {
        valid: true,
        warning: `Difficulty "${difficulty}" may not be ideal for ${level} students`,
      };
    }

    return { valid: true };
  }

  /**
   * Validate study plan duration
   */
  static validatePlanDuration(
    weeks: number,
    hoursPerWeek: number
  ): {
    valid: boolean;
    warning?: string;
  } {
    if (weeks < 1 || weeks > 52) {
      return {
        valid: false,
      };
    }

    if (hoursPerWeek < 5 || hoursPerWeek > 30) {
      return {
        valid: true,
        warning: `Study load of ${hoursPerWeek} hours/week is ${hoursPerWeek < 5 ? "very low" : "very high"} - may not be effective`,
      };
    }

    const totalHours = weeks * hoursPerWeek;
    if (totalHours < 200) {
      return {
        valid: true,
        warning: `Total of ${totalHours} hours may be insufficient for comprehensive preparation`,
      };
    }

    return { valid: true };
  }

  /**
   * Validate assessment score
   */
  static validateScore(
    score: number,
    maxScore: number
  ): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (typeof score !== "number" || typeof maxScore !== "number") {
      errors.push("Score and maxScore must be numbers");
    }

    if (maxScore <= 0) {
      errors.push("maxScore must be positive");
    }

    if (score < 0 || score > maxScore) {
      errors.push(`Score (${score}) must be between 0 and ${maxScore}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate response format
   */
  static validateResponseFormat(
    response: unknown,
    expectedFormat:
      | "quiz"
      | "evaluation"
      | "plan"
      | "question"
      | "structured"
  ): ResponseValidation {
    switch (expectedFormat) {
      case "quiz":
        return this.validateQuiz(response);
      case "evaluation":
        return this.validateEvaluation(response);
      case "plan":
        return this.validateStudyPlan(response);
      case "question":
        return this.validateQuizQuestion(response);
      case "structured":
        return this.validateStructuredOutput(response);
      default:
        return {
          isValid: false,
          errors: ["Unknown format type"],
          warnings: [],
          sanitized: false,
        };
    }
  }

  /**
   * Parse and validate AI response with best effort recovery
   */
  static parseAIResponse(
    response: string,
    expectedFormat:
      | "quiz"
      | "evaluation"
      | "plan"
      | "question"
      | "structured"
  ): {
    success: boolean;
    data?: unknown;
    validation: ResponseValidation;
    warnings?: string[];
  } {
    // Extract JSON
    const extracted = this.extractJSON(response);
    if (!extracted.valid || !extracted.json) {
      return {
        success: false,
        validation: {
          isValid: false,
          errors: [extracted.error || "Failed to extract JSON"],
          warnings: [],
          sanitized: false,
        },
      };
    }

    // Validate format
    const validation = this.validateResponseFormat(
      extracted.json,
      expectedFormat
    );

    return {
      success: validation.isValid,
      data: validation.isValid ? extracted.json : undefined,
      validation,
    };
  }
}

// Helper functions for common validations
export const validationHelpers = {
  /**
   * Check if question type is valid
   */
  isValidQuestionType(type: string): boolean {
    return ["mcq", "short-answer", "essay"].includes(type);
  },

  /**
   * Check if score is passing
   */
  isPassingScore(score: number, maxScore: number, passingPercent = 75): boolean {
    return (score / maxScore) * 100 >= passingPercent;
  },

  /**
   * Get proficiency level from score
   */
  getProficiencyLevel(
    score: number,
    maxScore: number
  ): "novice" | "emerging" | "proficient" | "expert" {
    const percent = (score / maxScore) * 100;
    if (percent >= 90) return "expert";
    if (percent >= 75) return "proficient";
    if (percent >= 50) return "emerging";
    return "novice";
  },

  /**
   * Estimate time for question based on difficulty
   */
  estimateQuestionTime(difficulty: string): number {
    const timeMap: Record<string, number> = {
      easy: 120,
      medium: 300,
      hard: 600,
      expert: 900,
    };
    return timeMap[difficulty] || 300;
  },
};
