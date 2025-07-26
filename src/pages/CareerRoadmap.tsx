import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/quiz/LoadingSpinner';
import { CareerRecommendation, RoadmapStep, Project } from '@/types/recommendations';
import { recommendationsApi } from '@/services/recommendationsApi';
import { useToast } from '@/hooks/use-toast';
import { getApiUrl, getAuthToken } from '@/config/api';
import { 
  ArrowLeft, 
  Trophy, 
  Star, 
  CheckCircle2, 
  Clock, 
  Target, 
  Zap,
  Award,
  BookOpen,
  Code2,
  Rocket,
  Medal
} from 'lucide-react';

const CareerRoadmap = () => {
  const { careerId } = useParams();
  const navigate = useNavigate();
  const [career, setCareer] = useState<CareerRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<{[key: string]: boolean}>({});
  const [totalXp, setTotalXp] = useState(0);
  const [progressId, setProgressId] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch user progress from backend
  const fetchUserProgress = useCallback(async (careerRoleId: string) => {
    const token = getAuthToken();
    if (!token) return;
    try {
          const response = await fetch(getApiUrl(`/api/progress/${careerRoleId}`), {
      headers: { 'Authorization': `Bearer ${token}` }
    });
      if (response.ok) {
        const data = await response.json();
        setProgressId(data._id);
        // Map backend progress to project IDs
        const roadmap = career?.detailedRoadmap || [];
        const progressMap: { [key: string]: boolean } = {};
        data.steps.forEach((step: any) => {
          const stepProjects = roadmap[step.stepIndex]?.projects || [];
          stepProjects.forEach((project: any) => {
            progressMap[project.id] = step.completed;
          });
        });
        setUserProgress(progressMap);
      } else if (response.status === 404) {
        // No progress yet, initialize
        await startCareerProgress(careerRoleId);
      }
    } catch (err) {
      // Optionally handle error
    }
  }, [career]);

  // Start progress for a career
  const startCareerProgress = async (careerRoleId: string) => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const response = await fetch(getApiUrl('/api/progress/start'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ careerRoleId })
      });
      if (response.ok) {
        await fetchUserProgress(careerRoleId);
      }
    } catch (err) {
      // Optionally handle error
    }
  };

  // Update a step's completion status
  const updateStepProgress = async (careerRoleId: string, stepIndex: number, completed: boolean) => {
    const token = getAuthToken();
    if (!token) return;
    try {
      await fetch(getApiUrl(`/api/progress/${careerRoleId}/step/${stepIndex}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ completed })
      });
      await fetchUserProgress(careerRoleId);
    } catch (err) {
      // Optionally handle error
    }
  };

  useEffect(() => {
    const fetchCareerDetails = async () => {
      try {
        setIsLoading(true);
        console.log('Looking for career with ID:', careerId);
        
        // Fetch specific career details from the server
        const token = getAuthToken();
        if (!token) {
          toast({
            title: "Authentication Error",
            description: "Please log in to view career details.",
            variant: "destructive",
          });
          return;
        }

        // Try to fetch detailed career roadmap from server
        const careerData = await recommendationsApi.getCareerById(careerId!);
        
        if (careerData) {
          console.log('Career data from server:', careerData);
          
          // If the career doesn't have detailed roadmap, generate mock data
          if (!careerData.detailedRoadmap) {
            careerData.detailedRoadmap = generateDetailedRoadmap(careerData.name);
          }
          
          setCareer(careerData);
        } else {
          console.error('Career not found for ID:', careerId);
          toast({
            title: "Career Not Found",
            description: "The requested career path could not be found.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Failed to load career details:', error);
        toast({
          title: "Error",
          description: "Failed to load career details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (careerId) {
      fetchCareerDetails();
    }
  }, [careerId, toast]);

  useEffect(() => {
    if (careerId && career) {
      fetchUserProgress(careerId);
    }
  }, [careerId, career, fetchUserProgress]);

  const generateDetailedRoadmap = (careerName: string): RoadmapStep[] => {
    // Mock detailed roadmap - in real app, this would come from API
    return [
      {
        id: '1',
        title: 'Foundation Phase',
        description: 'Master the fundamentals and build your knowledge base',
        skills: ['Problem Solving', 'Basic Programming', 'Mathematics'],
        estimatedTime: '2-3 months',
        xpReward: 500,
        projects: [
          {
            id: 'p1',
            title: 'Personal Portfolio Website',
            description: 'Create a professional portfolio showcasing your skills',
            difficulty: 'Beginner',
            estimatedTime: '1 week',
            skills: ['HTML', 'CSS', 'JavaScript'],
            xpReward: 100
          },
          {
            id: 'p2',
            title: 'Calculator App',
            description: 'Build a functional calculator with advanced operations',
            difficulty: 'Beginner',
            estimatedTime: '3 days',
            skills: ['JavaScript', 'DOM Manipulation'],
            xpReward: 75
          }
        ]
      },
      {
        id: '2',
        title: 'Intermediate Development',
        description: 'Build complex applications and learn frameworks',
        skills: ['React', 'Node.js', 'Database Design'],
        estimatedTime: '4-6 months',
        xpReward: 800,
        projects: [
          {
            id: 'p3',
            title: 'E-commerce Platform',
            description: 'Full-stack e-commerce app with payment integration',
            difficulty: 'Intermediate',
            estimatedTime: '1 month',
            skills: ['React', 'Node.js', 'MongoDB', 'Stripe API'],
            xpReward: 300
          },
          {
            id: 'p4',
            title: 'Real-time Chat Application',
            description: 'Build a chat app with real-time messaging',
            difficulty: 'Intermediate',
            estimatedTime: '2 weeks',
            skills: ['Socket.io', 'Express', 'React'],
            xpReward: 200
          }
        ]
      },
      {
        id: '3',
        title: 'Advanced Specialization',
        description: 'Master advanced concepts and industry best practices',
        skills: ['System Design', 'DevOps', 'Advanced Frameworks'],
        estimatedTime: '6+ months',
        xpReward: 1200,
        projects: [
          {
            id: 'p5',
            title: 'Microservices Architecture',
            description: 'Design and implement a scalable microservices system',
            difficulty: 'Advanced',
            estimatedTime: '2 months',
            skills: ['Docker', 'Kubernetes', 'API Gateway'],
            xpReward: 500
          }
        ]
      }
    ];
  };

  const toggleProjectComplete = (projectId: string) => {
    setUserProgress(prev => {
      const newProgress = { ...prev, [projectId]: !prev[projectId] };
      
      // Calculate XP gained
      if (newProgress[projectId] && !prev[projectId]) {
        const project = career?.detailedRoadmap
          ?.flatMap(step => step.projects)
          ?.find(p => p.id === projectId);
        if (project) {
          setTotalXp(prev => prev + project.xpReward);
          toast({
            title: "🎉 Project Completed!",
            description: `You earned ${project.xpReward} XP!`,
          });
        }
      }
      
      return newProgress;
    });
  };

  const completedProjects = Object.values(userProgress).filter(Boolean).length;
  const totalProjects = career?.detailedRoadmap?.reduce((acc, step) => acc + step.projects.length, 0) || 0;
  const progressPercentage = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

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

  if (!career) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/10">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Career Not Found</h1>
            <Button onClick={() => navigate('/recommendations')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Recommendations
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
                onClick={() => navigate('/recommendations')}
                className="mb-6 hover:bg-muted/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Recommendations
              </Button>

              <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-xl border border-border/50 p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center">
                        <Rocket className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          {career.name}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{career.matchPercentage}% Match</Badge>
                          <Badge variant="outline">{career.difficulty}</Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {career.description}
                    </p>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:w-64">
                    <div className="bg-muted/30 rounded-2xl p-4 text-center">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full mx-auto mb-2">
                        <Trophy className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-2xl font-bold text-foreground">{totalXp}</div>
                      <div className="text-xs text-muted-foreground">Total XP</div>
                    </div>
                    <div className="bg-muted/30 rounded-2xl p-4 text-center">
                      <div className="flex items-center justify-center w-10 h-10 bg-secondary/10 rounded-full mx-auto mb-2">
                        <Target className="w-5 h-5 text-secondary" />
                      </div>
                      <div className="text-2xl font-bold text-foreground">{completedProjects}/{totalProjects}</div>
                      <div className="text-xs text-muted-foreground">Projects</div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              </div>
            </div>

            {/* Roadmap Steps */}
            <div className="space-y-8">
              {career.detailedRoadmap?.map((step, stepIndex) => {
                const stepProjects = step.projects;
                const completedStepProjects = stepProjects.filter(p => userProgress[p.id]).length;
                const stepProgress = stepProjects.length > 0 ? (completedStepProjects / stepProjects.length) * 100 : 0;

                return (
                  <Card key={step.id} className="bg-card/80 backdrop-blur-sm border border-border/50 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                            {stepIndex + 1}
                          </div>
                          <div>
                            <CardTitle className="text-xl text-foreground">{step.title}</CardTitle>
                            <CardDescription className="flex items-center gap-4 mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {step.estimatedTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <Zap className="w-4 h-4" />
                                {step.xpReward} XP
                              </span>
                            </CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-foreground mb-1">
                            {completedStepProjects}/{stepProjects.length} Projects
                          </div>
                          <Progress value={stepProgress} className="w-24 h-1" />
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      <p className="text-muted-foreground mb-6">{step.description}</p>

                      {/* Skills */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-foreground mb-3 flex items-center">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Skills to Learn
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {step.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="bg-muted/30">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Projects */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-4 flex items-center">
                          <Code2 className="w-4 h-4 mr-2" />
                          Practice Projects
                        </h4>
                        <div className="grid gap-4">
                          {step.projects.map((project) => {
                            const isCompleted = userProgress[project.id];
                            return (
                              <div 
                                key={project.id}
                                className={`border rounded-xl p-4 transition-all duration-300 ${
                                  isCompleted 
                                    ? 'bg-primary/5 border-primary/20' 
                                    : 'bg-muted/20 border-border/50 hover:bg-muted/30'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h5 className="font-semibold text-foreground">{project.title}</h5>
                                      <Badge 
                                        variant={project.difficulty === 'Beginner' ? 'secondary' : 
                                               project.difficulty === 'Intermediate' ? 'default' : 'destructive'}
                                        className="text-xs"
                                      >
                                        {project.difficulty}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                                    
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {project.estimatedTime}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Star className="w-3 h-3" />
                                        {project.xpReward} XP
                                      </span>
                                    </div>

                                    <div className="flex flex-wrap gap-1">
                                      {project.skills.map((skill, index) => (
                                        <Badge key={index} variant="outline" className="text-xs bg-background">
                                          {skill}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>

                                  <Button
                                    variant={isCompleted ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleProjectComplete(project.id)}
                                    className={`ml-4 ${isCompleted ? 'bg-primary hover:bg-primary/90' : ''}`}
                                  >
                                    {isCompleted ? (
                                      <>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Completed
                                      </>
                                    ) : (
                                      <>
                                        <Target className="w-4 h-4 mr-2" />
                                        Start Project
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Achievement Section */}
            <Card className="mt-8 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Medal className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Ready to Start Your Journey?</h3>
                <p className="text-muted-foreground mb-6">
                  Complete projects, earn XP, and track your progress as you become a {career.name}
                </p>
                <div className="flex justify-center">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
                    <Award className="w-5 h-5 mr-2" />
                    Start First Project
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