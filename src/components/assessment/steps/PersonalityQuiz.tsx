import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useQuiz } from '@/contexts/QuizContext';
import { quizQuestions } from '@/data/quizQuestions';
import { Sparkles, User, Brain, HeartHandshake } from 'lucide-react';

interface PersonalityQuizProps {
  data: any;
  onNext: (data: any) => void;
  onPrevious: () => void;
  isLoading?: boolean;
  canGoBack: boolean;
}

const RESPONSE_OPTIONS = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
];

export const PersonalityQuiz: React.FC<PersonalityQuizProps> = ({
  data,
  onNext,
  onPrevious,
  canGoBack,
}) => {
  const { answers, setAnswer } = useQuiz();
  const [currentIndex, setCurrentIndex] = useState(0);

  const current = quizQuestions[currentIndex];
  const currentValue = current ? answers[current.id] : undefined;

  // Progress calculation
  const totalAnswered = quizQuestions.filter(q => answers[q.id] !== undefined).length;
  const isComplete = totalAnswered === quizQuestions.length;
  const progress = Math.round((totalAnswered / quizQuestions.length) * 100);

  // Save answers in a way that matches validation in AssessmentFlow
  const handleSelect = (v: number) => {
    if (!current) return;
    setAnswer(current.id, v);
    setTimeout(() => {
      if (currentIndex < quizQuestions.length - 1) {
        setCurrentIndex(i => i + 1);
      }
    }, 150);
  };

  const onContinue = () => {
    // Save answers in the expected field for validation
    onNext({ personality: answers });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-8">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-sm font-bold">{progress}%</span>
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
            Quick Personality & Interests
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            32 questions • Mini-IPIP-20 + RIASEC + Work Values
          </p>
        </div>
        <div className="max-w-xl mx-auto mt-4">
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Question {currentIndex + 1} of {quizQuestions.length}</span>
            <span>{totalAnswered} answered</span>
          </div>
        </div>
      </div>

      {/* Question Card */}
      {current && (
        <Card className="max-w-2xl mx-auto p-8 shadow-xl border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {current.category === 'BigFive' && <User className="w-4 h-4 text-blue-600" />}
              {current.category === 'RIASEC' && <Sparkles className="w-4 h-4 text-purple-600" />}
              {current.category === 'WorkValues' && <HeartHandshake className="w-4 h-4 text-pink-600" />}
              <span>{current.category} • {current.facet}{current.reverse ? ' (reverse)' : ''}</span>
            </div>
          </CardHeader>
          <CardContent>
            <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">
              “{current.question}”
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {RESPONSE_OPTIONS.map(o => (
                <button
                  key={o.value}
                  onClick={() => handleSelect(o.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-center font-medium text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400
                    ${currentValue === o.value
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md'
                      : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'}
                  `}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <div className="flex justify-center space-x-1 pt-4">
              {quizQuestions.map((q, i) => (
                <div
                  key={q.id}
                  className={`w-2 h-2 rounded-full transition-all duration-200
                    ${answers[q.id] !== undefined
                      ? i <= currentIndex ? 'bg-blue-600' : 'bg-green-400/70'
                      : 'bg-gray-200'}
                  `}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8 pb-4">
        <div>
          {canGoBack && (
            <Button
              variant="outline"
              onClick={() => (currentIndex === 0 ? onPrevious() : setCurrentIndex(i => i - 1))}
              className="px-8 py-3 text-lg font-medium hover:shadow-lg transition-all duration-300 border-2"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {currentIndex === 0 ? 'Back' : 'Previous'}
            </Button>
          )}
        </div>
        <Button
          onClick={onContinue}
          disabled={!isComplete}
          className="px-10 py-3 text-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg hover:shadow-xl transition-all duration-300 text-white"
        >
          Continue Assessment
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
};
