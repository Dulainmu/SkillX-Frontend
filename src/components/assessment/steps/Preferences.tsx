import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PreferencesProps {
  data: any;
  onNext: (data: any) => void;
  onPrevious: () => void;
  isLoading?: boolean;
  canGoBack: boolean;
}

const LEARNING_STYLES = [
  { id: 'visual', label: 'Visual Learning', icon: '👁️', description: 'Learn through diagrams, charts, and visual aids' },
  { id: 'auditory', label: 'Auditory Learning', icon: '🎧', description: 'Learn through listening, podcasts, and discussions' },
  { id: 'kinesthetic', label: 'Hands-on Learning', icon: '🛠️', description: 'Learn through doing, projects, and practice' },
  { id: 'reading', label: 'Reading/Writing', icon: '📚', description: 'Learn through books, articles, and written content' },
];

const TIME_COMMITMENTS = [
  { id: 'part-time', label: 'Part-time (10-20 hrs/week)', duration: '6-12 months' },
  { id: 'full-time', label: 'Full-time (40+ hrs/week)', duration: '3-6 months' },
  { id: 'weekends', label: 'Weekends only', duration: '8-15 months' },
  { id: 'flexible', label: 'Flexible schedule', duration: '4-10 months' },
];

const BUDGET_RANGES = [
  { id: 'free', label: 'Free resources only', description: 'YouTube, free courses, documentation' },
  { id: 'low', label: 'Low budget ($100-500)', description: 'Udemy courses, books, basic tools' },
  { id: 'medium', label: 'Medium budget ($500-2000)', description: 'Bootcamps, certifications, premium courses' },
  { id: 'high', label: 'High budget ($2000+)', description: 'University programs, private coaching, advanced tools' },
];



export const Preferences: React.FC<PreferencesProps> = ({
  data,
  onNext,
  onPrevious,
  canGoBack,
}) => {
  const [preferences, setPreferences] = useState(data.preferences || {
    learningStyle: [],
    timeCommitment: '',
    budget: '',
  });

  const toggleArrayPreference = (key: string, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: prev[key]?.includes(value)
        ? prev[key].filter((item: string) => item !== value)
        : [...(prev[key] || []), value]
    }));
  };

  const setSinglePreference = (key: string, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleContinue = () => {
    onNext({ preferences });
  };

  const renderSelectionGrid = (
    items: any[],
    selectedValue: string | string[],
    onSelect: (value: string) => void,
    multiSelect = false
  ) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item) => {
          const isSelected = multiSelect
            ? selectedValue?.includes(item.id)
            : selectedValue === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary'
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.icon && <span className="text-2xl">{item.icon}</span>}
                <div className="flex-1">
                  <div className="font-medium text-foreground">{item.label}</div>
                  {item.description && (
                    <div className="text-sm text-muted-foreground mt-1">{item.description}</div>
                  )}
                  {item.duration && (
                    <div className="text-sm text-muted-foreground mt-1">{item.duration}</div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">
          Tell us about your preferences
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Help us personalize your career recommendations
        </p>
      </div>

      <div className="space-y-8">
        {/* Learning Style */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            How do you prefer to learn?
          </h2>
          <p className="text-muted-foreground mb-4">
            Select all that apply to help us recommend the best learning resources
          </p>
          {renderSelectionGrid(
            LEARNING_STYLES,
            preferences.learningStyle,
            (value) => toggleArrayPreference('learningStyle', value),
            true
          )}
        </Card>

        {/* Time Commitment */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            How much time can you commit to learning?
          </h2>
          {renderSelectionGrid(
            TIME_COMMITMENTS,
            preferences.timeCommitment,
            (value) => setSinglePreference('timeCommitment', value)
          )}
        </Card>

        {/* Budget */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            What's your learning budget?
          </h2>
          {renderSelectionGrid(
            BUDGET_RANGES,
            preferences.budget,
            (value) => setSinglePreference('budget', value)
          )}
        </Card>


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
        >
          Continue
        </Button>
      </div>
    </div>
  );
};