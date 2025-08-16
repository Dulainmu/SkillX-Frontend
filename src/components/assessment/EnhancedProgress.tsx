//EnhancedProgress.tsx
import React from 'react';

interface EnhancedProgressProps {
  current: number;
  total: number;
  progress: number;
  timeRemaining: number;
  stepName?: string;
  stepIcon?: string;
}

export const EnhancedProgress: React.FC<EnhancedProgressProps> = ({
  current,
  total,
  progress,
  timeRemaining,
  stepName,
  stepIcon
}) => {
  const getProgressColor = (progress: number) => {
    if (progress < 25) return 'from-red-500 to-red-600';
    if (progress < 50) return 'from-yellow-500 to-yellow-600';
    if (progress < 75) return 'from-blue-500 to-blue-600';
    return 'from-green-500 to-green-600';
  };

  return (
    <div className="space-y-3">
      {/* Modern Progress Bar */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Assessment Progress</span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        
        {/* Main Progress Bar */}
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getProgressColor(progress)} rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-0 w-1 h-full bg-white/30 rounded-full"></div>
          </div>
        </div>
        
        {/* Step Indicators */}
        <div className="flex justify-between items-center mt-3">
          <div className="flex space-x-1">
            {Array.from({ length: total }, (_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index < current - 1
                    ? 'bg-success'
                    : index === current - 1
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <div className="text-xs text-muted-foreground">
            {current}/{total}
          </div>
        </div>
      </div>

      {/* Time Remaining */}
      <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{timeRemaining} min remaining</span>
      </div>
    </div>
  );
}; 