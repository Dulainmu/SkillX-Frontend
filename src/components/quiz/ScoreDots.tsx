interface ScoreDotsProps {
  questionId: number;
  selectedScore?: number;
  onScoreSelect: (score: number) => void;
  className?: string;
}

export const ScoreDots = ({ questionId, selectedScore, onScoreSelect, className = "" }: ScoreDotsProps) => {
  const scores = [1, 2, 3, 4, 5];
  const labels = {
    1: "Strongly Disagree",
    2: "Disagree", 
    3: "Neutral",
    4: "Agree",
    5: "Strongly Agree"
  };

  return (
    <div className={`flex flex-col items-center space-y-8 ${className}`}>
      {/* Labels */}
      <div className="flex justify-between w-full max-w-lg text-sm font-medium text-muted-foreground">
        <span className="bg-muted/50 px-3 py-1 rounded-full">Strongly Disagree</span>
        <span className="bg-muted/50 px-3 py-1 rounded-full">Strongly Agree</span>
      </div>
      
      {/* Enhanced Dots */}
      <div className="flex items-center space-x-8">
        {scores.map((score) => (
          <button
            key={score}
            onClick={() => onScoreSelect(score)}
            aria-label={`Score ${score} for question ${questionId}: ${labels[score as keyof typeof labels]}`}
            className={`
              relative w-8 h-8 rounded-full border-3 transition-all duration-300 
              hover:scale-125 focus:outline-none focus:ring-4 focus:ring-primary/30 focus:ring-offset-2
              transform hover:-translate-y-1 active:scale-110
              ${selectedScore === score 
                ? 'bg-gradient-to-br from-primary to-primary/80 border-primary shadow-xl shadow-primary/25 scale-110' 
                : 'bg-gradient-to-br from-muted to-card border-border hover:border-primary/50 hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5'
              }
            `}
          >
            {selectedScore === score && (
              <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
            )}
            <span className="sr-only">{labels[score as keyof typeof labels]}</span>
          </button>
        ))}
      </div>
      
      {/* Enhanced Score numbers with animations */}
      <div className="flex items-center space-x-8">
        {scores.map((score) => (
          <span 
            key={score} 
            className={`text-sm font-bold transition-all duration-300 ${
              selectedScore === score 
                ? 'text-primary scale-125 bg-primary/10 px-2 py-1 rounded-full' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {score}
          </span>
        ))}
      </div>

      {/* Selected label feedback */}
      {selectedScore && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium animate-fade-in">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            {labels[selectedScore as keyof typeof labels]}
          </div>
        </div>
      )}
    </div>
  );
};