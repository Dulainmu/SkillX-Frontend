//contexts/QuizContex.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import { QuizAnswer } from '@/data/quizQuestions';

interface QuizContextType {
  answers: Record<number, number>;
  setAnswer: (questionId: number, score: number) => void;
  getAnswer: (questionId: number) => number | undefined;
  clearAnswers: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

interface QuizProviderProps {
  children: ReactNode;
}

export const QuizProvider = ({ children }: QuizProviderProps) => {
  const [answers, setAnswers] = useState<Record<number, number>>(() => {
    // Load from localStorage on initialization
    const saved = localStorage.getItem('skillx-quiz-answers');
    return saved ? JSON.parse(saved) : {};
  });
  const [isLoading, setIsLoading] = useState(false);

  const setAnswer = (questionId: number, score: number) => {
    const newAnswers = { ...answers, [questionId]: score };
    setAnswers(newAnswers);
    // Save to localStorage
    localStorage.setItem('skillx-quiz-answers', JSON.stringify(newAnswers));
  };

  const getAnswer = (questionId: number): number | undefined => {
    return answers[questionId];
  };

  const clearAnswers = () => {
    setAnswers({});
    localStorage.removeItem('skillx-quiz-answers');
  };

  return (
    <QuizContext.Provider value={{
      answers,
      setAnswer,
      getAnswer,
      clearAnswers,
      isLoading,
      setIsLoading
    }}>
      {children}
    </QuizContext.Provider>
  );
};