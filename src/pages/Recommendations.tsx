import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CareerCard } from '@/components/recommendations/CareerCard';
import { LoadingSpinner } from '@/components/quiz/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { CareerRecommendation } from '@/types/recommendations';
import { recommendationsApi } from '@/services/recommendationsApi';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ArrowLeft, Target } from 'lucide-react';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // In a real app, this would call your actual API:
      // const response = await axios.get('/api/recommendations');
      // setRecommendations(response.data.recommendations);
      
      const data = await recommendationsApi.getRecommendations();
      setRecommendations(data);
      
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      setError('Failed to load recommendations. Please try again.');
      toast({
        title: "Error Loading Recommendations",
        description: "Failed to load your career recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleRetakeQuiz = () => {
    // Clear any existing quiz data
    localStorage.removeItem('skillx-quiz-answers');
    navigate('/quiz');
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

        <div className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Header Section */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
                <Target className="w-4 h-4" />
                Personalized Results
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent mb-8">
                Your Career Recommendations
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Based on your personality quiz results, here are the careers that best match your 
                <span className="text-foreground font-medium"> interests and strengths</span>
              </p>
            </div>

            {/* Loading State with Enhanced Design */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-border/50 p-12 max-w-md mx-auto">
                  <LoadingSpinner size="lg" className="mb-6" />
                  <div className="text-center">
                    <p className="text-foreground font-semibold text-lg mb-2">Generating your recommendations...</p>
                    <p className="text-muted-foreground text-sm">Analyzing your responses to find perfect career matches</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error State with Enhanced Design */}
            {error && !isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-border/50 p-12 max-w-md mx-auto text-center">
                  <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <RefreshCw className="w-8 h-8 text-destructive" />
                  </div>
                  <p className="text-destructive mb-8 text-lg font-medium" role="alert">
                    {error}
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={fetchRecommendations} 
                      variant="outline"
                      className="w-full h-12"
                    >
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Try Again
                    </Button>
                    <Button 
                      onClick={handleRetakeQuiz} 
                      variant="default"
                      className="w-full h-12"
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Retake Quiz
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Recommendations Grid */}
            {!isLoading && !error && recommendations.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
                  {recommendations.map((recommendation, index) => (
                    <div 
                      key={recommendation.id}
                      className="group transform hover:-translate-y-2 transition-all duration-500"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CareerCard
                        recommendation={recommendation}
                        rank={index + 1}
                      />
                    </div>
                  ))}
                </div>

                {/* Enhanced Action Buttons */}
                <div className="text-center">
                  <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-xl border border-border/50 p-8 max-w-md mx-auto">
                    <p className="text-muted-foreground mb-6">Want different results?</p>
                    <div className="flex flex-col gap-3">
                      <Button 
                        onClick={handleRetakeQuiz} 
                        variant="outline"
                        className="w-full h-12 hover:scale-105 transition-transform duration-200"
                      >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Retake Quiz
                      </Button>
                      <Button 
                        onClick={fetchRecommendations} 
                        variant="secondary"
                        className="w-full h-12 hover:scale-105 transition-transform duration-200"
                      >
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Refresh Recommendations
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Enhanced No Recommendations State */}
            {!isLoading && !error && recommendations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-border/50 p-12 max-w-md mx-auto text-center">
                  <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Target className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">No Recommendations Found</h3>
                  <p className="text-muted-foreground mb-8">
                    Please take the quiz to get your personalized career suggestions.
                  </p>
                  <Button 
                    onClick={handleRetakeQuiz} 
                    variant="default"
                    className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Take Quiz
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Recommendations;