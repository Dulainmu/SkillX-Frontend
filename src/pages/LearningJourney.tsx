import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/assessment/LoadingSpinner';
import ProjectSubmission from '@/components/ProjectSubmission';
import { BriefRoadmap, RoadmapStep, Project } from '@/types/recommendations';
import { recommendationsApi } from '@/services/recommendationsApi';
import { useToast } from '@/hooks/use-toast';
import { getApiUrl, getAuthToken } from '@/config/api';
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
  CheckCircle2,
  Play,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Bookmark,
  Share2,
  Download,
  Video,
  FileText,
  Globe,
  Users,
  Calendar,
  Award,
  MessageSquare,
  Eye,
  CheckCircle,
  X
} from 'lucide-react';

// Enhanced Project interface with submission tracking
interface EnhancedProject extends Project {
  status: 'not-started' | 'in-progress' | 'completed' | 'submitted' | 'approved' | 'rejected';
  progress: number;
  submission?: {
    id: string;
    status: 'pending' | 'reviewed' | 'approved' | 'rejected';
    feedback?: string;
    score?: number;
    submittedAt: string;
  };
  brief?: string;
  requirements?: string[];
  deliverables?: string[];
}

// User submission interface
interface UserSubmission {
  id: string;
  projectId: string;
  title: string;
  description: string;
  submissionUrl?: string;
  fileUrl?: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  feedback?: string;
  score?: number;
  submittedAt: string;
  mentor?: {
    name: string;
    email: string;
  };
}

const LearningJourney = () => {
  const { careerId } = useParams();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState<BriefRoadmap | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
  const [userProgress, setUserProgress] = useState<{[key: string]: boolean}>({});
  const [userSubmissions, setUserSubmissions] = useState<UserSubmission[]>([]);
  const [enhancedProjects, setEnhancedProjects] = useState<EnhancedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching detailed roadmap for:', careerId);
        
        const data = await recommendationsApi.getBriefRoadmap(careerId!);
        console.log('Detailed roadmap data:', data);
        setRoadmap(data);
        
        // Initialize progress from localStorage or backend
        const savedProgress = localStorage.getItem(`progress-${careerId}`);
        if (savedProgress) {
          setUserProgress(JSON.parse(savedProgress));
        }

        // Fetch user submissions
        await fetchUserSubmissions();
      } catch (error) {
        console.error('Failed to load roadmap:', error);
        toast({
          title: "Error",
          description: "Failed to load learning journey. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (careerId) {
      fetchRoadmap();
    }
  }, [careerId, toast]);

  const fetchUserSubmissions = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(getApiUrl('/api/submissions'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const submissions = await response.json();
        setUserSubmissions(submissions);
        
        // Create enhanced projects with submission status
        if (roadmap) {
          const enhanced = createEnhancedProjects(roadmap, submissions);
          setEnhancedProjects(enhanced);
        }
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    }
  };

  const createEnhancedProjects = (roadmap: BriefRoadmap, submissions: UserSubmission[]): EnhancedProject[] => {
    const projects: EnhancedProject[] = [];
    
    roadmap.steps.forEach((step, stepIndex) => {
      // Use actual projects from the step if available, otherwise create mock projects
      const stepProjects = step.projects || [];
      
      if (stepProjects.length > 0) {
        // Use actual projects from the API
        stepProjects.forEach((project, projectIndex) => {
          const projectId = project.id || `project-${stepIndex}-${projectIndex}`;
          const submission = submissions.find(s => s.projectId === projectId);
          
          const enhancedProject: EnhancedProject = {
            ...project,
            progress: submission ? (submission.status === 'approved' ? 100 : 50) : 0,
            status: submission ? 
              (submission.status === 'approved' ? 'approved' : 
               submission.status === 'rejected' ? 'rejected' : 'submitted') : 
              'not-started',
            submission: submission ? {
              id: submission.id,
              status: submission.status,
              feedback: submission.feedback,
              score: submission.score,
              submittedAt: submission.submittedAt
            } : undefined,
            brief: project.description || `Build a comprehensive ${step.title.toLowerCase()} project that demonstrates your mastery of ${step.skills.join(', ')}.`,
            requirements: project.requirements || [
              'Complete all core functionality',
              'Implement proper error handling',
              'Write clean, documented code',
              'Include a README with setup instructions',
              'Test your implementation thoroughly'
            ],
            deliverables: project.deliverables || [
              'Source code files',
              'Documentation (README)',
              'Screenshots or demo video',
              'Project reflection write-up'
            ]
          };
          
          projects.push(enhancedProject);
        });
      } else {
        // Create mock projects based on projectCount
        for (let i = 0; i < step.projectCount; i++) {
          const projectId = `project-${stepIndex}-${i}`;
          const submission = submissions.find(s => s.projectId === projectId);
          
          const project: EnhancedProject = {
            id: projectId,
            title: `${step.title} Project ${i + 1}`,
            description: `Apply your knowledge by building a real-world project using ${step.skills.join(', ')}.`,
            difficulty: step.difficulty as 'Beginner' | 'Intermediate' | 'Advanced',
            estimatedTime: '1-2 weeks',
            skills: step.skills,
            xpReward: Math.round(step.xpReward / step.projectCount),
            progress: submission ? (submission.status === 'approved' ? 100 : 50) : 0,
            status: submission ? 
              (submission.status === 'approved' ? 'approved' : 
               submission.status === 'rejected' ? 'rejected' : 'submitted') : 
              'not-started',
            submission: submission ? {
              id: submission.id,
              status: submission.status,
              feedback: submission.feedback,
              score: submission.score,
              submittedAt: submission.submittedAt
            } : undefined,
            brief: `Build a comprehensive ${step.title.toLowerCase()} project that demonstrates your mastery of ${step.skills.join(', ')}. This project will challenge you to apply theoretical knowledge in a practical setting.`,
            requirements: [
              'Complete all core functionality',
              'Implement proper error handling',
              'Write clean, documented code',
              'Include a README with setup instructions',
              'Test your implementation thoroughly'
            ],
            deliverables: [
              'Source code files',
              'Documentation (README)',
              'Screenshots or demo video',
              'Project reflection write-up'
            ]
          };
          
          projects.push(project);
        }
      }
    });
    
    return projects;
  };

  const startProject = (projectId: string) => {
    setEnhancedProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, status: 'in-progress' as const, progress: 25 }
        : project
    ));
    
    toast({
      title: "🚀 Project Started!",
      description: "You've started working on this project. Good luck!",
    });
  };

  const completeProject = (projectId: string) => {
    // Check if project has been submitted for review
    const project = enhancedProjects.find(p => p.id === projectId);
    if (!project) return;
    
    if (project.status !== 'submitted' && project.status !== 'approved') {
      toast({
        title: "⚠️ Project Not Submitted",
        description: "You must submit your project for mentor review before marking it as complete.",
        variant: "destructive",
      });
      return;
    }
    
    setEnhancedProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, status: 'completed' as const, progress: 100 }
        : project
    ));
    
    // Update local progress
    const newProgress = { ...userProgress, [projectId]: true };
    setUserProgress(newProgress);
    localStorage.setItem(`progress-${careerId}`, JSON.stringify(newProgress));
    
    toast({
      title: "🎉 Project Completed!",
      description: "Great job! You've completed this project.",
    });
  };

  const toggleProjectComplete = (projectId: string) => {
    const newProgress = { ...userProgress, [projectId]: !userProgress[projectId] };
    setUserProgress(newProgress);
    localStorage.setItem(`progress-${careerId}`, JSON.stringify(newProgress));
    
    if (newProgress[projectId]) {
      toast({
        title: "🎉 Project Completed!",
        description: "Great job! You've completed this project.",
      });
    }
  };

  const handleProjectSubmission = async (projectId: string, submission: any) => {
    // Update local state to reflect submission
    setEnhancedProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, status: 'submitted' as const, progress: 75 }
        : project
    ));
    
    // Refresh submissions
    await fetchUserSubmissions();
    
    toast({
      title: "Project Submitted!",
      description: "Your project has been submitted for mentor review. You can now mark it as complete once reviewed.",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'article': return <FileText className="w-4 h-4" />;
      case 'course': return <BookOpen className="w-4 h-4" />;
      case 'documentation': return <Globe className="w-4 h-4" />;
      default: return <ExternalLink className="w-4 h-4" />;
    }
  };

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
            <h1 className="text-2xl font-bold text-foreground mb-4">Learning Journey Not Found</h1>
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

  const completedProjects = Object.values(userProgress).filter(Boolean).length;
  const totalProjects = roadmap.overview.totalProjects;
  const progressPercentage = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

  // Get projects for current step
  const currentStepProjects = enhancedProjects.filter(project => 
    project.id.startsWith(`project-${currentStep}-`)
  );

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
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <Button 
                variant="ghost" 
                onClick={() => navigate(`/career-roadmap/${careerId}`)}
                className="mb-6 hover:bg-muted/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Roadmap Overview
              </Button>

              {/* Journey Header */}
              <Card className="bg-card/80 backdrop-blur-sm border border-border/50 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center">
                          <Rocket className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            {roadmap.name} Learning Journey
                          </CardTitle>
                          <p className="text-muted-foreground mt-2">
                            Master the skills and complete projects to become a {roadmap.name}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:w-auto">
                      <div className="bg-muted/30 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full mx-auto mb-2">
                          <Target className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-xl font-bold text-foreground">{completedProjects}/{totalProjects}</div>
                        <div className="text-xs text-muted-foreground">Projects</div>
                      </div>
                      <div className="bg-muted/30 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-secondary/10 rounded-full mx-auto mb-2">
                          <Trophy className="w-5 h-5 text-secondary" />
                        </div>
                        <div className="text-xl font-bold text-foreground">{Math.round(progressPercentage)}%</div>
                        <div className="text-xs text-muted-foreground">Complete</div>
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
                          <Zap className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="text-xl font-bold text-foreground">{roadmap.overview.totalXp}</div>
                        <div className="text-xs text-muted-foreground">Total XP</div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-foreground">Overall Progress</span>
                      <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Learning Steps */}
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Steps Navigation */}
              <div className="lg:col-span-1">
                <Card className="bg-card/80 backdrop-blur-sm border border-border/50 sticky top-8">
                  <CardHeader>
                    <CardTitle className="text-lg">Learning Steps</CardTitle>
                    <CardDescription>Your personalized learning path</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {roadmap.steps.map((step, index) => (
                      <Button
                        key={step.id}
                        variant={currentStep === index ? "default" : "ghost"}
                        className="w-full justify-start text-left h-auto p-3"
                        onClick={() => setCurrentStep(index)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            currentStep === index 
                              ? 'bg-white text-primary' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{step.title}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {step.estimatedTime} • {step.projectCount} projects
                            </div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Step Content */}
              <div className="lg:col-span-3">
                {roadmap.steps[currentStep] && (
                  <div className="space-y-6">
                    {/* Step Header */}
                    <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                                {currentStep + 1}
                              </div>
                              <div>
                                <CardTitle className="text-2xl">{roadmap.steps[currentStep].title}</CardTitle>
                                <CardDescription className="text-base">
                                  {roadmap.steps[currentStep].description}
                                </CardDescription>
                              </div>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-sm ${getDifficultyColor(roadmap.steps[currentStep].difficulty)}`}
                          >
                            {roadmap.steps[currentStep].difficulty}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-500" />
                            <div>
                              <div className="font-medium">Duration</div>
                              <div className="text-sm text-muted-foreground">{roadmap.steps[currentStep].estimatedTime}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                            <Code2 className="w-5 h-5 text-green-500" />
                            <div>
                              <div className="font-medium">Projects</div>
                              <div className="text-sm text-muted-foreground">{roadmap.steps[currentStep].projectCount} projects</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            <div>
                              <div className="font-medium">XP Reward</div>
                              <div className="text-sm text-muted-foreground">{roadmap.steps[currentStep].xpReward} XP</div>
                            </div>
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="mb-6">
                          <h4 className="font-semibold text-foreground mb-3 flex items-center">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Skills You'll Learn
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {roadmap.steps[currentStep].skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="bg-muted/30">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Learning Resources */}
                        <div className="mb-6">
                          <h4 className="font-semibold text-foreground mb-3 flex items-center">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Learning Resources
                            {roadmap.steps[currentStep].resources && roadmap.steps[currentStep].resources.length > 0 && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                {roadmap.steps[currentStep].resources.length} materials
                              </Badge>
                            )}
                          </h4>
                          
                          {roadmap.steps[currentStep].resources && roadmap.steps[currentStep].resources.length > 0 ? (
                            <div className="grid gap-3">
                              {roadmap.steps[currentStep].resources.map((resource, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors">
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                      {getResourceIcon(resource.type)}
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900">{resource.title}</div>
                                      <div className="text-sm text-gray-600 flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs">
                                          {resource.type}
                                        </Badge>
                                        {resource.description && (
                                          <span className="text-gray-500">• {resource.description}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => {
                                        toast({
                                          title: "Bookmark Added",
                                          description: `${resource.title} has been bookmarked.`,
                                        });
                                      }}
                                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    >
                                      <Bookmark className="w-4 h-4" />
                                    </Button>
                                    {resource.url && (
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => window.open(resource.url, '_blank')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                                      >
                                        <ExternalLink className="w-4 h-4 mr-1" />
                                        Open
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                              <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500 mb-2">No learning materials available for this step</p>
                              <p className="text-xs text-gray-400">Learning materials will be added by administrators</p>
                            </div>
                          )}
                        </div>

                        {/* Projects with Mentor Submission System */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-foreground flex items-center">
                              <Code2 className="w-4 h-4 mr-2" />
                              Hands-on Projects
                            </h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowSubmissions(!showSubmissions)}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              {showSubmissions ? 'Hide' : 'Show'} Submissions
                            </Button>
                          </div>
                          
                          <div className="space-y-4">
                            {currentStepProjects.map((project, index) => {
                              const isCompleted = userProgress[project.id];
                              return (
                                <div 
                                  key={index}
                                  className={`border rounded-xl p-4 transition-all duration-300 ${
                                    project.status === 'approved' 
                                      ? 'bg-green-50 border-green-200' 
                                      : project.status === 'submitted'
                                      ? 'bg-blue-50 border-blue-200'
                                      : project.status === 'rejected'
                                      ? 'bg-red-50 border-red-200'
                                      : isCompleted 
                                      ? 'bg-primary/5 border-primary/20' 
                                      : 'bg-muted/20 border-border/50 hover:bg-muted/30'
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <h5 className="font-semibold text-foreground">
                                          {project.title}
                                        </h5>
                                        <Badge 
                                          variant="outline" 
                                          className={`text-xs ${getDifficultyColor(project.difficulty)}`}
                                        >
                                          {project.difficulty}
                                        </Badge>
                                        <Badge 
                                          variant="outline" 
                                          className={`text-xs ${getStatusColor(project.status)}`}
                                        >
                                          {project.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                                          {project.status === 'submitted' && <Clock className="w-3 h-3 mr-1" />}
                                          {project.status === 'rejected' && <X className="w-3 h-3 mr-1" />}
                                          {project.status}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground mb-3">
                                        {project.description}
                                      </p>
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
                                      
                                      {/* Project Learning Materials */}
                                      {project.resources && project.resources.length > 0 && (
                                        <div className="mb-3">
                                          <div className="flex items-center gap-2 mb-2">
                                            <FileText className="w-3 h-3 text-gray-500" />
                                            <span className="text-xs font-medium text-gray-600">Project Materials</span>
                                            <Badge variant="outline" className="text-xs">
                                              {project.resources.length}
                                            </Badge>
                                          </div>
                                          <div className="space-y-2">
                                            {project.resources.map((resource, resourceIndex) => (
                                              <div key={resourceIndex} className="flex items-center justify-between p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded border border-green-200 text-xs">
                                                <div className="flex items-center gap-2 flex-1">
                                                  <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                                                    {getResourceIcon(resource.type)}
                                                  </div>
                                                  <div className="flex-1">
                                                    <div className="font-medium text-gray-900">{resource.title}</div>
                                                    <div className="text-gray-600 flex items-center gap-2">
                                                      <Badge variant="secondary" className="text-xs">
                                                        {resource.type}
                                                      </Badge>
                                                      {resource.description && (
                                                        <span className="text-gray-500">• {resource.description}</span>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                                {resource.url && (
                                                  <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => window.open(resource.url, '_blank')}
                                                    className="h-6 text-xs bg-green-600 hover:bg-green-700 text-white border-green-600"
                                                  >
                                                    <ExternalLink className="w-3 h-3 mr-1" />
                                                    Open
                                                  </Button>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Workflow guidance message */}
                                      {project.status === 'in-progress' && (
                                        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                          <div className="flex items-center gap-2 mb-2">
                                            <div className="flex items-center gap-1">
                                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                              <span className="text-xs font-medium text-green-700">Started</span>
                                            </div>
                                            <div className="flex-1 h-px bg-gray-300"></div>
                                            <div className="flex items-center gap-1">
                                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                              <span className="text-xs font-medium text-blue-700">Submit for Review</span>
                                            </div>
                                            <div className="flex-1 h-px bg-gray-300"></div>
                                            <div className="flex items-center gap-1">
                                              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                              <span className="text-xs text-gray-500">Complete</span>
                                            </div>
                                          </div>
                                          <p className="text-xs text-blue-700">
                                            💡 <strong>Next step:</strong> Submit your project for mentor review using the "View Project Brief" button above.
                                          </p>
                                        </div>
                                      )}
                                      
                                      {project.status === 'submitted' && (
                                        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                          <div className="flex items-center gap-2 mb-2">
                                            <div className="flex items-center gap-1">
                                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                              <span className="text-xs font-medium text-green-700">Started</span>
                                            </div>
                                            <div className="flex-1 h-px bg-gray-300"></div>
                                            <div className="flex items-center gap-1">
                                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                              <span className="text-xs font-medium text-green-700">Submitted</span>
                                            </div>
                                            <div className="flex-1 h-px bg-gray-300"></div>
                                            <div className="flex items-center gap-1">
                                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                              <span className="text-xs font-medium text-yellow-700">Complete</span>
                                            </div>
                                          </div>
                                          <p className="text-xs text-yellow-700">
                                            ✅ <strong>Ready to complete:</strong> Your project has been submitted. You can now mark it as complete.
                                          </p>
                                        </div>
                                      )}
                                      
                                      {/* Show submission feedback if available */}
                                      {showSubmissions && project.submission && (
                                        <div className="mt-3 p-3 bg-muted/20 rounded-lg">
                                          <div className="flex items-center gap-2 mb-2">
                                            <MessageSquare className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm font-medium">Mentor Feedback</span>
                                          </div>
                                          {project.submission.feedback && (
                                            <p className="text-sm text-muted-foreground mb-2">
                                              {project.submission.feedback}
                                            </p>
                                          )}
                                          {project.submission.score && (
                                            <div className="flex items-center gap-2">
                                              <Star className="w-3 h-3 text-yellow-500" />
                                              <span className="text-sm">Score: {project.submission.score}/100</span>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                      <ProjectSubmission 
                                        project={{
                                          id: project.id,
                                          title: project.title,
                                          description: project.description,
                                          difficulty: project.difficulty as 'Beginner' | 'Intermediate' | 'Advanced',
                                          status: project.status === 'rejected' ? 'submitted' : project.status as 'not-started' | 'in-progress' | 'completed' | 'submitted' | 'approved',
                                          progress: project.progress,
                                          estimatedTime: project.estimatedTime,
                                          xpReward: project.xpReward,
                                          skills: project.skills,
                                          brief: project.brief,
                                          requirements: project.requirements,
                                          deliverables: project.deliverables,
                                          submission: project.submission
                                        }} 
                                        careerRoleId={careerId!}
                                        stepIndex={currentStep}
                                        onSubmit={handleProjectSubmission}
                                      />
                                      {project.status === 'not-started' && (
                                        <Button 
                                          size="sm"
                                          onClick={() => startProject(project.id)}
                                        >
                                          <Play className="w-4 h-4 mr-2" />
                                          Start Project
                                        </Button>
                                      )}
                                      {project.status === 'in-progress' && (
                                        <Button 
                                          size="sm"
                                          variant="outline"
                                          disabled
                                          className="opacity-50 cursor-not-allowed"
                                        >
                                          <CheckCircle2 className="w-4 h-4 mr-2" />
                                          Submit First
                                        </Button>
                                      )}
                                      {(project.status === 'submitted' || project.status === 'approved') && (
                                        <Button 
                                          size="sm"
                                          variant="outline"
                                          onClick={() => completeProject(project.id)}
                                        >
                                          <CheckCircle2 className="w-4 h-4 mr-2" />
                                          Mark Complete
                                        </Button>
                                      )}
                                      {project.status === 'completed' && (
                                        <Button 
                                          size="sm"
                                          variant="outline"
                                          className="bg-green-50 text-green-700 border-green-200"
                                        >
                                          <CheckCircle2 className="w-4 h-4 mr-2" />
                                          Completed
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Navigation */}
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                        disabled={currentStep === 0}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous Step
                      </Button>
                      <Button
                        onClick={() => setCurrentStep(Math.min(roadmap.steps.length - 1, currentStep + 1))}
                        disabled={currentStep === roadmap.steps.length - 1}
                      >
                        Next Step
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LearningJourney;
