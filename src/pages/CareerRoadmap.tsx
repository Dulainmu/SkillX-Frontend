import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/assessment/LoadingSpinner';
import { BriefRoadmap } from '@/types/recommendations';
import { recommendationsApi } from '@/services/recommendationsApi';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Trophy, 
  Clock, 
  Target, 
  Zap,
  BookOpen,
  Code2,
  Rocket,
  Star,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  Play,
  ExternalLink
} from 'lucide-react';

const CareerRoadmap = () => {
  const { careerId } = useParams();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState<BriefRoadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBriefRoadmap = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching brief roadmap for:', careerId);
        
        const data = await recommendationsApi.getBriefRoadmap(careerId!);
        console.log('Brief roadmap data:', data);
        setRoadmap(data);
      } catch (error) {
        console.error('Failed to load brief roadmap:', error);
        toast({
          title: "Error",
          description: "Failed to load career roadmap. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (careerId) {
      fetchBriefRoadmap();
    }
  }, [careerId, toast, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/10">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/10">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Roadmap Not Found</h1>
            <Button onClick={() => navigate('/career-assessment')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Career Assessment
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

        <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/career-assessment')}
                className="mb-6 hover:bg-muted/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Career Assessment
              </Button>

              {/* Career Header Card */}
              <Card className="bg-card/80 backdrop-blur-sm border border-border/50 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center">
                          <Rocket className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            {roadmap.name}
                          </CardTitle>
                          <p className="text-muted-foreground mt-2 text-lg">
                            {roadmap.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:w-auto">
                      <div className="bg-muted/30 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full mx-auto mb-2">
                          <Target className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-xl font-bold text-foreground">{roadmap.overview.totalSteps}</div>
                        <div className="text-xs text-muted-foreground">Steps</div>
                      </div>
                      <div className="bg-muted/30 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-secondary/10 rounded-full mx-auto mb-2">
                          <Code2 className="w-5 h-5 text-secondary" />
                        </div>
                        <div className="text-xl font-bold text-foreground">{roadmap.overview.totalProjects}</div>
                        <div className="text-xs text-muted-foreground">Projects</div>
                      </div>
                      <div className="bg-muted/30 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-full mx-auto mb-2">
                          <Clock className="w-5 h-5 text-accent" />
                        </div>
                        <div className="text-xl font-bold text-foreground">{roadmap.overview.estimatedDuration}</div>
                        <div className="text-xs text-muted-foreground">Months</div>
                      </div>
                      <div className="bg-muted/30 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-green-500/10 rounded-full mx-auto mb-2">
                          <Trophy className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="text-xl font-bold text-foreground">{roadmap.overview.totalXp}</div>
                        <div className="text-xs text-muted-foreground">XP</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Career Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {roadmap.averageSalary && (
                      <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-xl">
                        <DollarSign className="w-6 h-6 text-green-500" />
                        <div>
                          <div className="font-semibold text-foreground">Average Salary</div>
                          <div className="text-sm text-muted-foreground">{roadmap.averageSalary}</div>
                        </div>
                      </div>
                    )}
                    {roadmap.jobGrowth && (
                      <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-xl">
                        <TrendingUp className="w-6 h-6 text-blue-500" />
                        <div>
                          <div className="font-semibold text-foreground">Job Growth</div>
                          <div className="text-sm text-muted-foreground">{roadmap.jobGrowth}</div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-xl">
                      <Users className="w-6 h-6 text-purple-500" />
                      <div>
                        <div className="font-semibold text-foreground">Skills to Learn</div>
                        <div className="text-sm text-muted-foreground">{roadmap.skills.length} skills</div>
                      </div>
                    </div>
                  </div>

                  {/* Key Skills */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Key Skills You'll Master
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {roadmap.skills.slice(0, 8).map((skill, index) => (
                        <Badge key={index} variant="outline" className="bg-muted/30 text-sm">
                          {skill}
                        </Badge>
                      ))}
                      {roadmap.skills.length > 8 && (
                        <Badge variant="outline" className="bg-muted/30 text-sm">
                          +{roadmap.skills.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Roadmap Steps Overview */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Your Learning Journey</h2>
              <div className="grid gap-6">
                {roadmap.steps.map((step, index) => (
                  <Card key={step.id} className="bg-card/80 backdrop-blur-sm border border-border/50 overflow-hidden hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                              <p className="text-muted-foreground mb-4">{step.description}</p>
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {step.estimatedTime}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Code2 className="w-4 h-4" />
                                  {step.projectCount} projects
                                </span>
                                <span className="flex items-center gap-1">
                                  <Zap className="w-4 h-4" />
                                  {step.xpReward} XP
                                </span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getDifficultyColor(step.difficulty)}`}
                                >
                                  {step.difficulty}
                                </Badge>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {step.skills.map((skill, skillIndex) => (
                                  <Badge key={skillIndex} variant="outline" className="text-xs bg-background">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 lg:w-48">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => {
                              toast({
                                title: "Coming Soon!",
                                description: "Detailed step view will be available soon.",
                              });
                            }}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="w-full"
                            onClick={() => {
                              toast({
                                title: "Coming Soon!",
                                description: "Project preview will be available soon.",
                              });
                            }}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Preview Projects
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Start Your Journey?</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Begin your path to becoming a {roadmap.name}. This roadmap will guide you through {roadmap.overview.totalSteps} steps, 
                  {roadmap.overview.totalProjects} hands-on projects, and help you earn {roadmap.overview.totalXp} XP along the way.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                    onClick={() => navigate(`/learning-journey/${careerId}`)}
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    Start Learning Journey
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => navigate('/career-assessment')}
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Explore Other Careers
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CareerRoadmap;