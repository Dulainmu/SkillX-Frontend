import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ScoreDots } from '@/components/quiz/ScoreDots';
import { ProgressBar } from '@/components/quiz/ProgressBar';
import { QuizNavigation } from '@/components/quiz/QuizNavigation';
import { LoadingSpinner } from '@/components/quiz/LoadingSpinner';
import { useQuiz } from '@/contexts/QuizContext';
import { quizQuestions } from '@/data/quizQuestions';
import { useToast } from '@/hooks/use-toast';
import { getApiUrl } from '@/config/api';

const Quiz = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { answers, setAnswer, getAnswer, isLoading, setIsLoading } = useQuiz();

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const currentQuestionNumber = currentQuestionIndex + 1;
  const selectedScore = getAnswer(currentQuestion.id);
  const canProceed = selectedScore !== undefined;

  const handleScoreSelect = (score: number) => {
    setAnswer(currentQuestion.id, score);
    setError(''); // Clear any existing error
  };

  const handleNext = () => {
    if (!canProceed) {
      setError('Please select a score before continuing.');
      return;
    }
    
    setError('');
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!canProceed) {
      setError('Please select a score before submitting.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('skillx-token');
      if (!token) throw new Error('Not authenticated');
      const response = await fetch(getApiUrl('/api/quiz/submit'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, score]) => ({
            questionId: parseInt(questionId),
            score
          }))
        })
      });
      if (!response.ok) throw new Error('Failed to submit quiz');
      toast({
        title: "Quiz Submitted Successfully!",
        description: "Generating your personalized career recommendations...",
      });
      navigate('/recommendations');
    } catch (error) {
      console.error('Quiz submission error:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/10">
      <Header />
      
      <main className="flex-1 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary/3 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/3 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/3 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card/95 backdrop-blur-md p-10 rounded-2xl shadow-2xl border border-border/50 flex flex-col items-center space-y-6 max-w-sm mx-4">
              <LoadingSpinner size="lg" />
              <div className="text-center">
                <p className="text-foreground font-semibold text-lg mb-2">Submitting your quiz...</p>
                <p className="text-muted-foreground text-sm">Analyzing your responses and generating personalized recommendations</p>
              </div>
            </div>
          </div>
        )}

        <div className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Enhanced Progress Section */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                Personality Assessment
              </div>
              
              <ProgressBar 
                current={currentQuestionNumber} 
                total={quizQuestions.length}
                className="mb-8"
              />
            </div>

            {/* Question Card */}
            <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-border/50 p-8 sm:p-12 mb-8 relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-xl"></div>
              
              <div className="relative z-10">
                {/* Question Header */}
                <div className="text-center mb-12">
                  <div className="text-sm font-medium text-muted-foreground mb-4">
                    Question {currentQuestionNumber} of {quizQuestions.length}
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-8 max-w-3xl mx-auto leading-relaxed">
                    {currentQuestion.question}
                  </h1>
                </div>

                {/* Enhanced Score Dots */}
                <ScoreDots
                  questionId={currentQuestion.id}
                  selectedScore={selectedScore}
                  onScoreSelect={handleScoreSelect}
                  className="mb-12"
                />

                {/* Error Message */}
                {error && (
                  <div className="text-center mb-8">
                    <div 
                      className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-3 rounded-lg border border-destructive/20"
                      role="alert"
                      aria-live="polite"
                    >
                      <div className="w-2 h-2 bg-destructive rounded-full"></div>
                      {error}
                    </div>
                  </div>
                )}

                {/* Enhanced Navigation */}
                <div className="flex justify-center">
                  <QuizNavigation
                    currentQuestion={currentQuestionNumber}
                    totalQuestions={quizQuestions.length}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onSubmit={handleSubmit}
                    canProceed={canProceed}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Tips Section */}
            <div className="text-center">
              <p className="text-muted-foreground text-sm">
                💡 Answer honestly to get the most accurate career recommendations
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Quiz;