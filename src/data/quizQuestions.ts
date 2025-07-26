export interface QuizQuestion {
  id: number;
  question: string;
  category: string;
}

export const quizQuestions: QuizQuestion[] = [
  // Personality (60% weight)
  {
    id: 1,
    question: "I like solving challenging technical problems.",
    category: "personality"
  },
  {
    id: 2,
    question: "I notice small details in complex systems.",
    category: "personality"
  },
  {
    id: 3,
    question: "I prefer working in a team.",
    category: "personality"
  },
  {
    id: 4,
    question: "I naturally take the lead in group projects.",
    category: "personality"
  },
  {
    id: 5,
    question: "I adapt well to new tools or changes.",
    category: "personality"
  },
  {
    id: 6,
    question: "I stay calm under pressure.",
    category: "personality"
  },
  {
    id: 7,
    question: "I come up with creative solutions.",
    category: "personality"
  },
  // Interests (40% weight)
  {
    id: 8,
    question: "I enjoy building or fixing hardware/software.",
    category: "interest"
  },
  {
    id: 9,
    question: "I like analyzing data or code behavior.",
    category: "interest"
  },
  {
    id: 10,
    question: "I'm interested in design and UI/UX.",
    category: "interest"
  },
  {
    id: 11,
    question: "I enjoy managing tech projects or pitching ideas.",
    category: "interest"
  },
  {
    id: 12,
    question: "I like organizing, documenting, and improving systems.",
    category: "interest"
  }
];

export interface QuizAnswer {
  questionId: number;
  score: number;
}

export interface QuizSubmission {
  answers: QuizAnswer[];
  timestamp: string;
}