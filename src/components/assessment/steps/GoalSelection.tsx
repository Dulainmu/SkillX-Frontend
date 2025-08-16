import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface GoalSelectionProps {
  data: any;
  onNext: (data: any) => void;
  onPrevious: () => void;
  isLoading?: boolean;
  canGoBack: boolean;
}

const GOALS = [
  {
    id: 'career-change',
    title: 'Career Change',
    description: 'Transition to a new field',
    icon: '🎯',
  },
  {
    id: 'skill-improvement',
    title: 'Skill Improvement',
    description: 'Enhance existing abilities',
    icon: '📈',
  },
  {
    id: 'job-seeking',
    title: 'Job Seeking',
    description: 'Find new opportunities',
    icon: '💼',
  },
  {
    id: 'career-exploration',
    title: 'Career Exploration',
    description: 'Discover new possibilities',
    icon: '🔍',
  },
];

export const GoalSelection: React.FC<GoalSelectionProps> = ({
  data,
  onNext,
  onPrevious,
  canGoBack,
}) => {
  const [selectedGoal, setSelectedGoal] = useState<string>(data.goals || '');

  const handleContinue = () => {
    if (selectedGoal) {
      onNext({ goals: selectedGoal });
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">
          Let's find your perfect career path
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get personalized career recommendations in just 10 minutes
        </p>
      </div>

      {/* Goal Selection with enhanced cards */}
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">
            What's your primary goal?
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the option that best describes your current situation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {GOALS.map((goal) => (
            <Card
              key={goal.id}
              className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedGoal === goal.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary'
              }`}
              onClick={() => setSelectedGoal(goal.id)}
            >
              <div className="text-center space-y-3">
                <div className="text-2xl">{goal.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {goal.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {goal.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8">
        <div>
          {canGoBack && (
            <Button
              variant="outline"
              onClick={onPrevious}
            >
              Back
            </Button>
          )}
        </div>
        
        <Button
          onClick={handleContinue}
          disabled={!selectedGoal}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};