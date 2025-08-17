import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  Clock, 
  Target,
  BookOpen,
  Zap
} from 'lucide-react';
import { skillGapApi, SkillGapAnalysis, CareerGapAnalysis } from '../services/skillGapApi';

interface SkillGapAnalysisProps {
  careerSlug?: string;
  onCareerSelect?: (careerSlug: string) => void;
}

export const SkillGapAnalysis: React.FC<SkillGapAnalysisProps> = ({ 
  careerSlug, 
  onCareerSelect 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allCareerGaps, setAllCareerGaps] = useState<CareerGapAnalysis[]>([]);
  const [selectedCareerGap, setSelectedCareerGap] = useState<SkillGapAnalysis | null>(null);

  useEffect(() => {
    loadSkillGapData();
  }, [careerSlug]);

  const loadSkillGapData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (careerSlug) {
        // Load specific career gap analysis
        const gapAnalysis = await skillGapApi.getCareerGapAnalysis(careerSlug);
        setSelectedCareerGap(gapAnalysis);
      } else {
        // Load all career gap analysis
        const allGaps = await skillGapApi.getAllCareerGapAnalysis();
        setAllCareerGaps(allGaps.careerGaps);
      }
    } catch (err) {
      setError('Failed to load skill gap analysis');
      console.error('Error loading skill gap data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'met':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'needs_improvement':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'missing':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'focus':
        return <Target className="h-4 w-4" />;
      case 'improve':
        return <TrendingUp className="h-4 w-4" />;
      case 'priority':
        return <Zap className="h-4 w-4" />;
      case 'quick_win':
        return <BookOpen className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading skill gap analysis...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (careerSlug && selectedCareerGap) {
    return <DetailedSkillGapView gapAnalysis={selectedCareerGap} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Skill Gap Analysis</h2>
        <p className="text-sm text-gray-600">
          Compare your skills with career requirements
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allCareerGaps.map((career) => (
          <Card 
            key={career.careerId} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onCareerSelect?.(career.careerSlug)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{career.careerName}</CardTitle>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-semibold">{career.overallProgress}%</span>
              </div>
              <Progress value={career.overallProgress} className="h-2" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Skills Met:</span>
                  <span className="font-semibold text-green-600">
                    {career.skillsMet}/{career.totalSkills}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Missing:</span>
                  <span className="font-semibold text-red-600">
                    {career.skillsMissing}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Need Improvement:</span>
                  <span className="font-semibold text-yellow-600">
                    {career.skillsNeedingImprovement}
                  </span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  onCareerSelect?.(career.careerSlug);
                }}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

interface DetailedSkillGapViewProps {
  gapAnalysis: SkillGapAnalysis;
}

const DetailedSkillGapView: React.FC<DetailedSkillGapViewProps> = ({ gapAnalysis }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'met':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'needs_improvement':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'missing':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{gapAnalysis.careerName}</h2>
          <p className="text-gray-600">Skill Gap Analysis</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {gapAnalysis.overallProgress}%
          </div>
          <div className="text-sm text-gray-600">Overall Progress</div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Skills Met</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {gapAnalysis.skillsMet}
                </div>
                <p className="text-xs text-gray-600">
                  out of {gapAnalysis.totalSkills} required
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Need Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {gapAnalysis.skillsNeedingImprovement}
                </div>
                <p className="text-xs text-gray-600">
                  skills to enhance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Missing Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {gapAnalysis.skillsMissing}
                </div>
                <p className="text-xs text-gray-600">
                  skills to learn
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time to Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {gapAnalysis.estimatedTimeToComplete.description}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Based on {gapAnalysis.estimatedTimeToComplete.totalWeeks} weeks of dedicated learning
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <div className="space-y-3">
            {gapAnalysis.skillDetails.map((skill, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(skill.status)}
                      <div>
                        <div className="font-medium">{skill.skillName}</div>
                        <div className="text-sm text-gray-600">
                          Level {skill.currentLevel} → {skill.requiredLevel}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getImportanceColor(skill.importance)}>
                        {skill.importance}
                      </Badge>
                      {skill.levelsNeeded > 0 && (
                        <Badge variant="outline" className="text-red-600 border-red-200">
                          +{skill.levelsNeeded} levels
                        </Badge>
                      )}
                    </div>
                  </div>
                  {skill.levelsNeeded > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      {skill.recommendation}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-4">
          {gapAnalysis.roadmap.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Congratulations! You've mastered all required skills for this career.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              {gapAnalysis.roadmap.map((phase, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Phase {phase.phase}: {phase.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{phase.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Estimated time: {phase.estimatedWeeks} weeks
                      </span>
                    </div>
                    <div className="space-y-2">
                      {phase.skills.map((skill, skillIndex) => (
                        <div key={skillIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-medium">{skill.skillName}</span>
                          <span className="text-sm text-gray-600">
                            {skill.recommendation}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="space-y-3">
            {gapAnalysis.recommendations.map((rec, index) => (
              <Alert key={index}>
                {getRecommendationIcon(rec.type)}
                <AlertDescription className="font-medium">
                  {rec.message}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SkillGapAnalysis;
