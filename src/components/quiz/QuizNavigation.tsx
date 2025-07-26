import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';

interface QuizNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  canProceed: boolean;
  isLoading: boolean;
}

export const QuizNavigation = ({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
  onSubmit,
  canProceed,
  isLoading
}: QuizNavigationProps) => {
  const isFirstQuestion = currentQuestion === 1;
  const isLastQuestion = currentQuestion === totalQuestions;

  return (
    <div className="flex justify-between items-center w-full max-w-lg mx-auto gap-4">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstQuestion || isLoading}
        className={`${isFirstQuestion ? 'invisible' : 'visible'} h-12 px-6 hover:scale-105 transition-all duration-200 border-2 hover:border-primary/50`}
      >
        <ChevronLeft className="w-5 h-5 mr-2" />
        Previous
      </Button>

      {isLastQuestion ? (
        <Button
          variant="default"
          onClick={onSubmit}
          disabled={!canProceed || isLoading}
          className="min-w-[140px] h-12 px-8 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Submit Quiz
            </>
          )}
        </Button>
      ) : (
        <Button
          variant="default"
          onClick={onNext}
          disabled={!canProceed || isLoading}
          className="min-w-[120px] h-12 px-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          Next Question
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      )}
    </div>
  );
};