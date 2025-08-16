import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  current: number;
  total: number;
  progress: number;
  timeRemaining: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  progress,
  timeRemaining,
}) => {
  return (
    <div className="space-y-3">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-foreground">Progress</span>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        </div>
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-muted-foreground">{timeRemaining} min remaining</span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="relative">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Progress 
              value={progress} 
              className="h-3 bg-muted/50" 
            />
            {/* Animated progress indicator */}
            <div 
              className="absolute top-0 left-0 h-3 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-0 w-1 h-3 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm font-bold text-primary">
              {Math.round(progress)}%
            </div>
            <div className="text-xs text-muted-foreground">complete</div>
          </div>
        </div>
      </div>
      
      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Step {current} of {total}
        </div>
        <div className="flex space-x-1">
          {Array.from({ length: total }, (_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index < current - 1
                  ? 'bg-success animate-pulse'
                  : index === current - 1
                  ? 'bg-primary animate-pulse'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-3 gap-4 pt-2">
        <div className="text-center">
          <div className="text-lg font-bold text-primary">{current}</div>
          <div className="text-xs text-muted-foreground">Current Step</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-success">{total - current}</div>
          <div className="text-xs text-muted-foreground">Steps Left</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-secondary">{timeRemaining}</div>
          <div className="text-xs text-muted-foreground">Minutes Left</div>
        </div>
      </div>
    </div>
  );
}; 