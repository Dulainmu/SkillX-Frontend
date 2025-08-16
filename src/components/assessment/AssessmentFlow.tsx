// src/components/assessment/AssessmentFlow.tsx
import React, { useState, useEffect } from 'react';
import { EnhancedProgress } from '@/components/assessment/EnhancedProgress';
import { GoalSelection } from './steps/GoalSelection';
import { SkillsAssessment } from './steps/SkillsAssessment';
import { PersonalityQuiz } from './steps/PersonalityQuiz';
import { Preferences } from './steps/Preferences';
import { Results } from './steps/Results';
import { useQuiz } from '@/contexts/QuizContext';
import { assessmentApi } from '@/services/assessmentApi';
import type { BackendRecommendationsResponse } from '@/types/backendRecommendations';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, LogIn, UserPlus } from 'lucide-react';

interface AssessmentData {
  goals: string | null;
  skills: Record<string, { selected: boolean; level: number }>;
  personality: Record<string, any>;
  personalityType: string;
  personalityData: any;
  preferences: {
    learningStyle: string[];
    timeCommitment: string;
    budget: string;
  };
  portfolio: File | null;

  // NEW: store backend recommendations payload
  backend?: BackendRecommendationsResponse;
}

const STORAGE_KEY = 'skillx-assessment-state-v1';

const STEPS = [
  { id: 1, name: 'Goal Setting', component: GoalSelection, estimatedTime: 1, icon: '🎯' },
  { id: 2, name: 'Skills Assessment', component: SkillsAssessment, estimatedTime: 4, icon: '⚡' },
  { id: 3, name: 'Personality Quiz', component: PersonalityQuiz, estimatedTime: 3, icon: '🧠' },
  { id: 4, name: 'Learning Preferences', component: Preferences, estimatedTime: 2, icon: '📚' },
  { id: 5, name: 'Your Results', component: Results, estimatedTime: 0, icon: '🎉' },
];

// Validation rules for each step
const VALIDATION_RULES = {
  1: (data: AssessmentData) => {
    if (!data.goals || data.goals.trim() === '') {
      return { isValid: false, message: 'Please select a career goal to continue' };
    }
    return { isValid: true, message: '' };
  },
  2: (data: AssessmentData) => {
    const selectedSkills = Object.values(data.skills).filter(s => s.selected && s.level > 0);
    if (selectedSkills.length === 0) {
      return { isValid: false, message: 'Please select at least one skill and set its level' };
    }
    if (selectedSkills.length < 3) {
      return { isValid: false, message: 'Selecting 3+ skills will give you better career matches' };
    }
    return { isValid: true, message: '' };
  },
  3: (data: AssessmentData) => {
    const answers = Object.keys(data.personality || {});
    if (answers.length < 20) {
      return { isValid: false, message: 'Please complete all personality questions for accurate results' };
    }
    return { isValid: true, message: '' };
  },
  4: (data: AssessmentData) => {
    if (!data.preferences.learningStyle || data.preferences.learningStyle.length === 0) {
      return { isValid: false, message: 'Please select your preferred learning styles' };
    }
    if (!data.preferences.timeCommitment) {
      return { isValid: false, message: 'Please select your time commitment preference' };
    }
    return { isValid: true, message: '' };
  }
};

export const AssessmentFlow = () => {
  const navigate = useNavigate();
  const { answers, setIsLoading } = useQuiz();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<AssessmentData>({
    goals: null,
    skills: {},
    personality: {},
    personalityType: '',
    personalityData: null,
    preferences: {
      learningStyle: [],
      timeCommitment: '',
      budget: '',
    },
    portfolio: null,
  });
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // restore saved progress on mount (local first, then server if logged in)
  useEffect(() => {
    (async () => {
      try {
        // Check for pending assessment data from authentication redirect
        const pendingAssessment = localStorage.getItem('skillx-pending-assessment');
        if (pendingAssessment) {
          const parsed = JSON.parse(pendingAssessment);
          setCurrentStep(parsed.currentStep || 1);
          setData(parsed.data || {
            goals: null,
            skills: {},
            personality: {},
            personalityType: '',
            personalityData: null,
            preferences: {
              learningStyle: [],
              timeCommitment: '',
              budget: '',
            },
            portfolio: null,
          });
          console.log('Pending assessment restored:', {
            currentStep: parsed.currentStep,
            dataKeys: Object.keys(parsed.data || {})
          });
          return; // Don't restore other data if we have pending assessment
        }

        // Local restore
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as { currentStep?: number; data?: AssessmentData };
          if (saved?.currentStep && saved?.data) {
            setCurrentStep(Math.min(Math.max(saved.currentStep, 1), STEPS.length));
            setData({ ...saved.data, portfolio: null });
          }
        }
        
        // Server restore (if user is logged in)
        if (user) {
          try {
            const server = await assessmentApi.getProgress();
            if (server) {
              if (server.currentStep) setCurrentStep(Math.min(Math.max(server.currentStep, 1), STEPS.length));
              if (server.data) setData(prev => ({ ...prev, ...server.data, portfolio: null }));
              if (server.answers && Object.keys(server.answers).length) {
                localStorage.setItem('skillx-quiz-answers', JSON.stringify(server.answers));
              }
            }
          } catch (err) {
            console.log('No server progress found or error:', err);
          }
        }
      } catch (error) {
        console.error('Failed to restore progress:', error);
      }
    })();
  }, [user]);

  // persist progress whenever step or data changes (local + server if logged in)
  useEffect(() => {
    try {
      const sanitized: AssessmentData = { ...data, portfolio: null };
      
      // Save to localStorage
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ currentStep, data: sanitized })
      );
      
      // Best-effort sync to server (only if user is authenticated)
      if (user) {
        const answersRaw = localStorage.getItem('skillx-quiz-answers');
        const answersMap = answersRaw ? JSON.parse(answersRaw) : {};
        
        console.log('Saving assessment progress:', {
          currentStep,
          dataKeys: Object.keys(sanitized),
          answerCount: Object.keys(answersMap).length
        });
        
        assessmentApi.saveProgress({ 
          currentStep, 
          data: sanitized, 
          answers: answersMap 
        })
          .then((result) => {
            console.log('Progress saved successfully:', result);
          })
          .catch((err) => {
            console.error('Progress save failed:', err);
            // Don't show error toast for unauthenticated users
            if (user) {
              toast({
                title: 'Progress Save Failed',
                description: 'Could not save your assessment progress to the server. Please check your connection or login status.',
                variant: 'destructive',
              });
            }
          });
      }
    } catch (error) {
      console.error('Error in progress save effect:', error);
    }
  }, [currentStep, data, user, toast]);

  const currentStepData = STEPS.find(step => step.id === currentStep);
  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;
  const totalTime = STEPS.slice(currentStep - 1).reduce((sum, step) => sum + step.estimatedTime, 0);

  // Validate current step before allowing progression
  const validateCurrentStep = (): { isValid: boolean; message: string } => {
    const rule = VALIDATION_RULES[currentStep as keyof typeof VALIDATION_RULES];
    if (!rule) return { isValid: true, message: '' };
    return rule(data);
  };

  // When step 4 (Preferences) completes, submit the whole payload to backend,
  // save the backend recommendations into `data.backend`, then go to Results.
  const handleNext = async (stepData: any) => {
    setData(prev => ({ ...prev, ...stepData }));

    // Validate current step before proceeding
    const validation = validateCurrentStep();
    if (!validation.isValid) {
      setValidationErrors(prev => ({ ...prev, [currentStep]: validation.message }));
      return;
    }

    // Clear validation error for this step
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[currentStep];
      return newErrors;
    });

    // If we're finishing step 4 and moving to Results, submit now
    if (currentStep === 4) {
      await handleSubmitToBackend();
    }

    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSubmitToBackend = async () => {
    // Check if user is authenticated
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        answers,                    // from QuizContext (1..32 Likert)
        skills: { ...data.skills },
        preferences: { ...data.preferences },
      };

      const backend: BackendRecommendationsResponse = await assessmentApi.submitQuiz(payload);

      setData(prev => ({ ...prev, backend }));
    } catch (err) {
      console.error('submitQuiz failed:', err);
      // still proceed to Results; Results.tsx can fetch fallback if needed
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSaveAndExit = async () => {
    try {
      const sanitized: AssessmentData = { ...data, portfolio: null };
      
      // Save to localStorage
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ currentStep, data: sanitized })
      );
      
      // Save to server
      const answersRaw = localStorage.getItem('skillx-quiz-answers');
      const answersMap = answersRaw ? JSON.parse(answersRaw) : {};
      
      console.log('Saving progress before exit:', {
        currentStep,
        dataKeys: Object.keys(sanitized),
        answerCount: Object.keys(answersMap).length
      });
      
      await assessmentApi.saveProgress({ 
        currentStep, 
        data: sanitized, 
        answers: answersMap 
      });
      
      console.log('Progress saved successfully before exit');
      toast({
        title: "Progress Saved",
        description: "Your assessment progress has been saved. You can continue later.",
      });
    } catch (error) {
      console.error('Failed to save progress before exit:', error);
      toast({
        title: "Save Failed",
        description: "Could not save progress to server, but it's saved locally.",
        variant: "destructive",
      });
    }
    
    navigate('/dashboard');
  };

  const handleResetProgress = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('skillx-quiz-answers');
      
      // Clear server progress
      await assessmentApi.clearProgress();
      
      console.log('Progress reset successfully');
      toast({
        title: "Progress Reset",
        description: "Your assessment progress has been cleared.",
      });
    } catch (error) {
      console.error('Failed to clear progress:', error);
      toast({
        title: "Reset Failed",
        description: "Could not clear server progress, but local progress is cleared.",
        variant: "destructive",
      });
    }
    
    // Reset local state
    setCurrentStep(1);
    setData({
      goals: null,
      skills: {},
      personality: {},
      personalityType: '',
      personalityData: null,
      preferences: {
        learningStyle: [],
        timeCommitment: '',
        budget: '',
      },
      portfolio: null,
      backend: undefined,
    });
    setValidationErrors({});
  };

  const handleLoginRedirect = () => {
    // Save current assessment data to localStorage before redirecting
    const assessmentData = {
      currentStep,
      data,
      answers: answers || {}
    };
    localStorage.setItem('skillx-pending-assessment', JSON.stringify(assessmentData));
    navigate('/login?redirect=/career-assessment');
  };

  const handleSignupRedirect = () => {
    // Save current assessment data to localStorage before redirecting
    const assessmentData = {
      currentStep,
      data,
      answers: answers || {}
    };
    localStorage.setItem('skillx-pending-assessment', JSON.stringify(assessmentData));
    navigate('/signup?redirect=/career-assessment');
  };

  const handleContinueWithoutAuth = () => {
    setShowAuthPrompt(false);
    // Continue to results without backend submission
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const CurrentStepComponent = currentStepData?.component;

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-100/30 to-pink-100/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-50/20 to-purple-50/20 rounded-full blur-3xl"></div>
        </div>

        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-border/50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="w-10"></div>
              <div className="flex-1 max-w-lg mx-8">
                <EnhancedProgress
                    current={currentStep}
                    total={STEPS.length}
                    progress={progress}
                    timeRemaining={totalTime}
                    stepName={currentStepData?.name}
                    stepIcon={currentStepData?.icon}
                />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveAndExit}
                  className="px-3 py-2 text-xs md:text-sm rounded-md border border-border/60 hover:border-primary/50 hover:text-primary transition-colors"
                >
                  Save & Exit
                </button>
                <button
                  onClick={handleResetProgress}
                  className="px-3 py-2 text-xs md:text-sm rounded-md border border-border/60 hover:border-destructive/50 hover:text-destructive transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 max-w-6xl mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Step Guidance */}
            {currentStep < 5 && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <span className="text-lg">ℹ️</span>
                  <span className="font-medium">Step {currentStep}: {currentStepData?.name}</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  {currentStepData?.estimatedTime} minute(s) estimated for this step.
                </p>
              </div>
            )}

            {/* Validation Error Display */}
            {validationErrors[currentStep] && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <span className="text-lg">⚠️</span>
                  <span className="font-medium">{validationErrors[currentStep]}</span>
                </div>
                <p className="text-sm text-red-600 mt-1">
                  Please complete this step before continuing to get the best results.
                </p>
              </div>
            )}

            {CurrentStepComponent && (
                <div className="animate-fade-in">
                  <CurrentStepComponent
                      data={data}
                      onNext={handleNext}
                      onPrevious={handlePrevious}
                      canGoBack={currentStep > 1}
                  />
                </div>
            )}
          </div>
        </main>

        {currentStep > 1 && (
            <div className="fixed bottom-6 right-6 z-30">
              <button
                  onClick={handlePrevious}
                  className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-border/50 flex items-center justify-center hover:shadow-xl transition-all duration-300 hover:scale-110"
              >
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
        )}

        {/* Auth Prompt Modal */}
        {showAuthPrompt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <AlertCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Save Your Results</CardTitle>
                <CardDescription>
                  To save your assessment results and get personalized recommendations, please sign in or create an account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleLoginRedirect} 
                  className="w-full"
                  size="lg"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
                <Button 
                  onClick={handleSignupRedirect} 
                  variant="outline" 
                  className="w-full"
                  size="lg"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </Button>
                <Button 
                  onClick={handleContinueWithoutAuth} 
                  variant="ghost" 
                  className="w-full"
                >
                  Continue Without Saving
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
  );
};
