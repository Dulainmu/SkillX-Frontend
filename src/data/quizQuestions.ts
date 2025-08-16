// data/quizQuestions.ts
export interface QuizQuestion {
  id: number;
  question: string;
  category: "BigFive" | "RIASEC" | "WorkValues";
  facet: string;
  reverse?: boolean;
}

/**
 * Likert: 1..5 (Strongly Disagree .. Strongly Agree)
 * Mini-IPIP-20 (4 items/trait, 2 reversed each)
 * + RIASEC 6
 * + O*NET Work Values 6
 */
export const quizQuestions: QuizQuestion[] = [
  // ---------- MINI-IPIP-20 (PUBLIC DOMAIN) ----------
  // EXTRAVERSION (E)
  { id: 1,  question: "I am the life of the party.", category: "BigFive", facet: "Extraversion" },
  { id: 2,  question: "I feel comfortable around people.", category: "BigFive", facet: "Extraversion" },
  { id: 3,  question: "I don't talk a lot.", category: "BigFive", facet: "Extraversion", reverse: true },
  { id: 4,  question: "I keep in the background.", category: "BigFive", facet: "Extraversion", reverse: true },

  // AGREEABLENESS (A)
  { id: 5,  question: "I sympathize with others’ feelings.", category: "BigFive", facet: "Agreeableness" },
  { id: 6,  question: "I take time out for others.", category: "BigFive", facet: "Agreeableness" },
  { id: 7,  question: "I am not interested in other people's problems.", category: "BigFive", facet: "Agreeableness", reverse: true },
  { id: 8,  question: "I feel little concern for others.", category: "BigFive", facet: "Agreeableness", reverse: true },

  // CONSCIENTIOUSNESS (C)
  { id: 9,  question: "I am always prepared.", category: "BigFive", facet: "Conscientiousness" },
  { id: 10, question: "I pay attention to details.", category: "BigFive", facet: "Conscientiousness" },
  { id: 11, question: "I leave my belongings around.", category: "BigFive", facet: "Conscientiousness", reverse: true },
  { id: 12, question: "I make a mess of things.", category: "BigFive", facet: "Conscientiousness", reverse: true },

  // NEUROTICISM (N)
  { id: 13, question: "I get stressed out easily.", category: "BigFive", facet: "Neuroticism" },
  { id: 14, question: "I worry about things.", category: "BigFive", facet: "Neuroticism" },
  { id: 15, question: "I am relaxed most of the time.", category: "BigFive", facet: "Neuroticism", reverse: true },
  { id: 16, question: "I seldom feel blue.", category: "BigFive", facet: "Neuroticism", reverse: true },

  // OPENNESS (O)
  { id: 17, question: "I have a rich vocabulary.", category: "BigFive", facet: "Openness" },
  { id: 18, question: "I have a vivid imagination.", category: "BigFive", facet: "Openness" },
  { id: 19, question: "I have difficulty understanding abstract ideas.", category: "BigFive", facet: "Openness", reverse: true },
  { id: 20, question: "I am not interested in abstract ideas.", category: "BigFive", facet: "Openness", reverse: true },

  // ---------- RIASEC (Holland themes; 1 item each) ----------
  { id: 21, question: "I enjoy practical, hands-on tasks.", category: "RIASEC", facet: "Realistic" },
  { id: 22, question: "I like analyzing and solving abstract problems.", category: "RIASEC", facet: "Investigative" },
  { id: 23, question: "I enjoy creating or designing things.", category: "RIASEC", facet: "Artistic" },
  { id: 24, question: "I like helping or teaching people.", category: "RIASEC", facet: "Social" },
  { id: 25, question: "I like leading initiatives or persuading others.", category: "RIASEC", facet: "Enterprising" },
  { id: 26, question: "I prefer organized systems and clear procedures.", category: "RIASEC", facet: "Conventional" },

  // ---------- Work Values (O*NET families; 1 item each) ----------
  { id: 27, question: "Achievement: Doing important, high-quality work matters to me.", category: "WorkValues", facet: "Achievement" },
  { id: 28, question: "Independence: I value autonomy in how I work.", category: "WorkValues", facet: "Independence" },
  { id: 29, question: "Recognition: I value advancement and being recognized for results.", category: "WorkValues", facet: "Recognition" },
  { id: 30, question: "Relationships: I value cooperation and service to others.", category: "WorkValues", facet: "Relationships" },
  { id: 31, question: "Support: I value supportive management and policies.", category: "WorkValues", facet: "Support" },
  { id: 32, question: "Working Conditions: I value stability, compensation, and good conditions.", category: "WorkValues", facet: "WorkingConditions" }
];

export interface QuizAnswer {
  questionId: number;  // 1..32
  score: number;       // 1..5 Likert
}

export interface QuizSubmission {
  answers: QuizAnswer[] | Record<number, number>;
  timestamp: string;
}



/*
export interface QuizQuestion {
  id: number;
  question: string;
  category: "RIASEC" | "BigFive" | "WorkValues";
  facet: string;          // RIASEC: Realistic/Investigative/Artistic/Social/Enterprising/Conventional
                          // BigFive: Openness/Conscientiousness/Extraversion/Agreeableness/Neuroticism
                          // WorkValues: Autonomy/Structure/Impact/Collaboration/Leadership/Precision/Learning
  reverse?: boolean;      // reverse-scored for Neuroticism calmness item
}

// Likert answers from UI: 1..5 (Strongly Disagree .. Strongly Agree)
export const quizQuestions: QuizQuestion[] = [
  // ---- RIASEC (6) ----
  { id: 1, question: "I enjoy solving abstract or analytical problems.", category: "RIASEC", facet: "Investigative" },
  { id: 2, question: "I like practical, hands-on tasks with clear steps.", category: "RIASEC", facet: "Realistic" },
  { id: 3, question: "I’m drawn to creating original concepts or visuals.", category: "RIASEC", facet: "Artistic" },
  { id: 4, question: "I enjoy helping or guiding others to learn.", category: "RIASEC", facet: "Social" },
  { id: 5, question: "I’m comfortable taking the lead to drive outcomes.", category: "RIASEC", facet: "Enterprising" },
  { id: 6, question: "I prefer organized processes and consistent routines.", category: "RIASEC", facet: "Conventional" },

  // ---- Big Five (5) ----
  { id: 7,  question: "I’m curious and enjoy exploring new ideas.", category: "BigFive", facet: "Openness" },
  { id: 8,  question: "I’m organized and follow through on commitments.", category: "BigFive", facet: "Conscientiousness" },
  { id: 9,  question: "I feel energized by group discussions.", category: "BigFive", facet: "Extraversion" },
  { id: 10, question: "I consider others’ needs and cooperate well.", category: "BigFive", facet: "Agreeableness" },
  { id: 11, question: "I stay calm under pressure.", category: "BigFive", facet: "Neuroticism", reverse: true },

  // ---- Work Values (7) ----
  { id: 12, question: "I value autonomy and flexible ways of working.", category: "WorkValues", facet: "Autonomy" },
  { id: 13, question: "Clear structure and expectations help me do my best.", category: "WorkValues", facet: "Structure" },
  { id: 14, question: "I want my work to have visible impact on users/customers.", category: "WorkValues", facet: "Impact" },
  { id: 15, question: "I enjoy close collaboration across functions.", category: "WorkValues", facet: "Collaboration" },
  { id: 16, question: "I like taking responsibility and guiding decisions.", category: "WorkValues", facet: "Leadership" },
  { id: 17, question: "I prefer accuracy and precision over speed.", category: "WorkValues", facet: "Precision" },
  { id: 18, question: "I actively seek time to learn and improve at work.", category: "WorkValues", facet: "Learning" }
];

export interface QuizAnswer {
  questionId: number; // 1..18
  score: 1|2|3|4|5;   // Likert
}

export interface QuizSubmission {
  answers: QuizAnswer[];
  timestamp: string;
}
*/