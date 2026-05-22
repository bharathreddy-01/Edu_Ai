// Safety guardrails and anti-hallucination measures

export const safetyGuardrails = {
  // Topics that are out of scope
  forbiddenTopics: [
    "leaked exam papers",
    "direct exam answers",
    "exam solutions",
    "medical diagnosis",
    "psychological treatment",
    "legal advice",
    "financial advice",
    "personal counseling",
  ],

  // Keywords indicating academic dishonesty
  dishonestPatterns: [
    "give me the answer",
    "solve for me without explaining",
    "don't explain just give answer",
    "i need to submit this",
    "plagiarism",
    "copy paste",
    "cheat sheet",
    "exam fraud",
  ],

  // Topics JEE/NEET students ask about
  validTopics: {
    Physics: [
      "Mechanics",
      "Thermodynamics",
      "Waves and Sound",
      "Electricity",
      "Magnetism",
      "Optics",
      "Modern Physics",
      "Units and Measurements",
    ],
    Chemistry: [
      "Atomic Structure",
      "Bonding",
      "States of Matter",
      "Thermodynamics",
      "Equilibrium",
      "Electrochemistry",
      "Organic Chemistry",
      "Inorganic Chemistry",
      "Coordination Compounds",
      "Environmental Chemistry",
    ],
    Math: [
      "Sets and Relations",
      "Functions",
      "Trigonometry",
      "Sequences and Series",
      "Logarithms",
      "Complex Numbers",
      "Quadratic Equations",
      "Polynomials",
      "Inequalities",
      "Permutations and Combinations",
      "Probability",
      "Calculus",
      "Coordinate Geometry",
      "Vectors",
      "3D Geometry",
      "Matrices",
      "Determinants",
      "Linear Programming",
    ],
    Biology: [
      "Cell Biology",
      "Genetics",
      "Botany",
      "Zoology",
      "Human Physiology",
      "Ecology",
      "Evolution",
      "Biotechnology",
      "Immunology",
    ],
  },

  // NCERT curriculum boundaries (not exhaustive but key topics)
  syllabusResources: {
    Physics: [
      "NCERT Physics Class 11 & 12",
      "JEE Physics Syllabus",
      "NEET Physics Syllabus",
    ],
    Chemistry: [
      "NCERT Chemistry Class 11 & 12",
      "JEE Chemistry Syllabus",
      "NEET Chemistry Syllabus",
    ],
    Math: [
      "NCERT Mathematics Class 11 & 12",
      "JEE Mathematics Syllabus",
    ],
    Biology: [
      "NCERT Biology Class 11 & 12",
      "NEET Biology Syllabus",
    ],
  },
};

// Anti-hallucination checks
export const antiHallucinationChecks = {
  // Common hallucinated physics formulas/concepts
  physicsChecks: [
    {
      hallucination: "Invented formulas for non-existent physics laws",
      prevention:
        "Only use well-known formulas from Mechanics, E&M, Optics, Thermo",
      check: "Verify against NCERT formulas",
    },
    {
      hallucination: "Wrong units or dimensional analysis",
      prevention: "Always check SI units and dimensional consistency",
      check: "Dimensional analysis must be correct",
    },
    {
      hallucination: "Incorrect physical intuition",
      prevention:
        "Connect to real-world observations and experimental evidence",
      check: "Does the explanation match physical reality?",
    },
  ],

  // Common hallucinated chemistry facts
  chemistryChecks: [
    {
      hallucination: "Invented chemical compounds or reactions",
      prevention: "Only mention compounds in NCERT and standard textbooks",
      check: "Verify against known chemistry databases",
    },
    {
      hallucination: "Wrong oxidation states or bonding explanations",
      prevention:
        "Verify oxidation states follow standard rules and match examples",
      check: "Oxidation state calculation must be mathematically correct",
    },
    {
      hallucination: "Incorrect mechanism for organic reactions",
      prevention: "Only explain well-established reaction mechanisms",
      check: "Mechanism must follow arrow-pushing conventions",
    },
  ],

  // Common hallucinated math proofs
  mathChecks: [
    {
      hallucination: "Logical gaps in proofs",
      prevention:
        "Each step must logically follow from previous statements",
      check: "Does each line follow from previous assumptions?",
    },
    {
      hallucination: "Invalid algebraic manipulations",
      prevention: "Never divide by potentially zero quantities without note",
      check: "Check all algebraic steps are reversible and valid",
    },
    {
      hallucination: "Misapplication of theorems",
      prevention: "State theorem conditions before applying",
      check: "Are all conditions of the theorem satisfied?",
    },
  ],

  // Common hallucinated biology facts
  biologyChecks: [
    {
      hallucination: "Invented anatomical structures or processes",
      prevention: "Only reference structures and processes in NCERT",
      check: "Verify against NCERT diagrams and descriptions",
    },
    {
      hallucination: "Wrong classification or taxonomy",
      prevention: "Follow NCERT classification strictly",
      check: "Classification matches NCERT system?",
    },
    {
      hallucination: "Incorrect biological mechanisms",
      prevention: "Explain mechanisms as described in NCERT",
      check: "Mechanism matches NCERT description?",
    },
  ],
};

// Content safety filters
export function checkForForbiddenContent(input: string): {
  isSafe: boolean;
  reason?: string;
} {
  const lowerInput = input.toLowerCase();

  // Check for dishonest patterns
  for (const pattern of safetyGuardrails.dishonestPatterns) {
    if (lowerInput.includes(pattern.toLowerCase())) {
      return {
        isSafe: false,
        reason: `Request appears to involve academic dishonesty: "${pattern}"`,
      };
    }
  }

  // Check for forbidden topics
  for (const topic of safetyGuardrails.forbiddenTopics) {
    if (lowerInput.includes(topic.toLowerCase())) {
      return {
        isSafe: false,
        reason: `This topic (${topic}) is outside the scope of tutoring`,
      };
    }
  }

  return { isSafe: true };
}

// Validate topic is in JEE/NEET curriculum
export function validateTopic(
  topic: string,
  subject: string
): { isValid: boolean; reason?: string } {
  const subjectTopics =
    safetyGuardrails.validTopics[subject as keyof typeof safetyGuardrails.validTopics];

  if (!subjectTopics) {
    return { isValid: false, reason: "Unknown subject" };
  }

  const topicLower = topic.toLowerCase();
  const isValid = subjectTopics.some((t) =>
    t.toLowerCase().includes(topicLower) ||
    topicLower.includes(t.toLowerCase())
  );

  if (!isValid) {
    return {
      isValid: false,
      reason: `Topic "${topic}" may not be in the JEE/NEET ${subject} curriculum`,
    };
  }

  return { isValid: true };
}

// Check for uncertainty and hallucination patterns
export function detectUncertainty(response: string): {
  hasUncertaintyMarkers: boolean;
  markers: string[];
  shouldFlagForReview: boolean;
} {
  const uncertaintyMarkers = [
    "i think",
    "i believe",
    "possibly",
    "might be",
    "could be",
    "i'm not sure",
    "uncertain",
    "probably",
    "seems like",
    "appears to be",
    "if i remember correctly",
    "i may be wrong",
  ];

  const hallucinationMarkers = [
    "according to my knowledge",
    "in my experience",
    "i invented",
    "i created",
    "hypothetically",
    "imagine if",
  ];

  const foundUncertaintyMarkers = uncertaintyMarkers.filter((marker) =>
    response.toLowerCase().includes(marker)
  );

  const foundHallucinationMarkers = hallucinationMarkers.filter((marker) =>
    response.toLowerCase().includes(marker)
  );

  return {
    hasUncertaintyMarkers: foundUncertaintyMarkers.length > 0,
    markers: [...foundUncertaintyMarkers, ...foundHallucinationMarkers],
    shouldFlagForReview: foundHallucinationMarkers.length > 0,
  };
}

// Fact verification hints for tutors
export const factVerificationChecklist = {
  physics: [
    "All formulas match NCERT examples",
    "Units are SI and dimensionally correct",
    "Physical intuition aligns with real-world experiments",
    "No invented concepts or phenomena",
  ],
  chemistry: [
    "All compounds mentioned exist and are in NCERT",
    "Oxidation states calculated correctly",
    "Reaction mechanisms follow arrow-pushing rules",
    "No invented elements or compounds",
  ],
  math: [
    "All theorems are correctly stated",
    "Proof steps are logically sound",
    "No division by zero or undefined operations",
    "Algebra manipulations are reversible",
  ],
  biology: [
    "Anatomical structures match NCERT diagrams",
    "Biological processes match NCERT descriptions",
    "Classification follows NCERT system",
    "No invented biological entities",
  ],
};

// Response quality checks
export function assessResponseQuality(response: string): {
  score: number;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Check length (too short = potentially incomplete)
  if (response.length < 100) {
    issues.push("Response appears too brief for educational content");
    recommendations.push("Provide more detailed explanation");
    score -= 10;
  }

  // Check for uncertainty
  const uncertainty = detectUncertainty(response);
  if (uncertainty.shouldFlagForReview) {
    issues.push("Response contains potential hallucination patterns");
    recommendations.push("Verify facts against authoritative sources");
    score -= 15;
  }

  // Check for complete sentences
  const sentenceCount = (response.match(/[.!?]/g) || []).length;
  if (sentenceCount < 3) {
    issues.push("Response lacks sufficient explanation structure");
    recommendations.push("Use clear, complete sentences");
    score -= 5;
  }

  // Check for examples
  if (!response.toLowerCase().includes("example")) {
    recommendations.push("Include concrete examples to illustrate concepts");
    score -= 5;
  }

  // Check for educational structure
  if (
    !response.toLowerCase().includes("step") &&
    !response.toLowerCase().includes("reason") &&
    !response.toLowerCase().includes("because")
  ) {
    recommendations.push("Explain the reasoning behind concepts");
    score -= 5;
  }

  return {
    score: Math.max(0, score),
    issues,
    recommendations,
  };
}

// Export all safety utilities
export const safetyUtils = {
  checkForForbiddenContent,
  validateTopic,
  detectUncertainty,
  assessResponseQuality,
};
