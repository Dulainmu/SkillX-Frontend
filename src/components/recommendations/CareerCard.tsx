import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CareerRecommendation } from '@/types/recommendations';
import { TrendingUp, DollarSign, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CareerCardProps {
  recommendation: CareerRecommendation;
  rank: number;
}

export const CareerCard = ({ recommendation, rank }: CareerCardProps) => {
  const navigate = useNavigate();

  const handleViewRoadmap = () => {
    navigate(`/career/${recommendation.id}`);
  };

  return (
    <Card 
      className="bg-background shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 h-full"
      aria-label={`Career recommendation ${rank}: ${recommendation.name}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-foreground mb-2">
              #{rank} {recommendation.name}
            </CardTitle>
            <Badge variant="secondary" className="mb-3">
              {recommendation.matchPercentage}% Match
            </Badge>
          </div>
        </div>
        <CardDescription className="text-md text-foreground leading-relaxed">
          {recommendation.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Skills */}
        <div>
          <h4 className="font-semibold text-foreground mb-2 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-success" />
            Key Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {recommendation.skills.map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Salary & Growth */}
        {(recommendation.averageSalary || recommendation.jobGrowth) && (
          <div className="grid grid-cols-1 gap-3">
            {recommendation.averageSalary && (
              <div className="flex items-center text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4 mr-2 text-success" />
                <span><strong>Salary:</strong> {recommendation.averageSalary}</span>
              </div>
            )}
            {recommendation.jobGrowth && (
              <div className="flex items-center text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4 mr-2 text-success" />
                <span><strong>Job Growth:</strong> {recommendation.jobGrowth}</span>
              </div>
            )}
          </div>
        )}

        {/* Roadmap Preview */}
        <div>
          <h4 className="font-semibold text-foreground mb-3">Roadmap Preview</h4>
          <ul className="list-disc pl-5 text-muted-foreground space-y-1 mb-4">
            {recommendation.roadmap.slice(0, 3).map((step, index) => (
              <li key={index} className="text-sm leading-relaxed">
                {step}
              </li>
            ))}
            {recommendation.roadmap.length > 3 && (
              <li className="text-sm text-primary font-medium">
                + {recommendation.roadmap.length - 3} more steps...
              </li>
            )}
          </ul>
          
          <Button 
            onClick={handleViewRoadmap}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Start Career Path
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};