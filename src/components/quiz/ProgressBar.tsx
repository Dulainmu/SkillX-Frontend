interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export const ProgressBar = ({ current, total, className = "" }: ProgressBarProps) => {
  const percentage = (current / total) * 100;

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-semibold text-foreground bg-muted/50 px-3 py-1 rounded-full">
          Question {current} of {total}
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          {Math.round(percentage)}% Complete
        </span>
      </div>
      <div className="relative">
        <div className="w-full bg-muted/60 h-4 rounded-full overflow-hidden shadow-inner border border-border/50">
          <div 
            className="h-full bg-gradient-to-r from-primary via-primary to-secondary transition-all duration-700 ease-out rounded-full relative overflow-hidden"
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={current}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-label={`Progress: ${current} of ${total} questions completed`}
          >
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>
        </div>
        {/* Progress glow effect */}
        <div 
          className="absolute top-0 h-4 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full blur-sm transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};