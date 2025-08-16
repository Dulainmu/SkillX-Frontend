import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCareer } from '@/contexts/CareerContext';
import { useToast } from '@/hooks/use-toast';
import ProjectSubmission from '@/components/ProjectSubmission';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Clock, 
  Star,
  CheckCircle2,
  PlayCircle,
  Award,
  TrendingUp,
  Calendar,
  Zap,
  Video,
  FileText,
  ExternalLink,
  Users
} from 'lucide-react';
import { recommendationsApi } from '@/services/recommendationsApi';
import { getApiUrl, getAuthToken } from '@/config/api';

interface Course {
  id: string;
  title: string;
  type: 'video' | 'article' | 'quiz' | 'hands-on';
  duration: string;
  completed: boolean;
}

interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  completed: boolean;
  progress: number;
  xpReward: number;
  courses: Course[];
  skillsLearned: string[];
  resources: any[]; // Added resources to LearningModule
}

interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'not-started' | 'in-progress' | 'completed' | 'submitted' | 'approved';
  progress: number;
  estimatedTime: string;
  xpReward: number;
  skills: string[];
  brief?: string;
  requirements?: string[];
  deliverables?: string[];
  submission?: any;
}

// Mock roadmap data
const mockRoadmap = [
  { id: 'react', name: 'React', status: 'completed' },
  { id: 'node', name: 'Node.js', status: 'in-progress' },
  { id: 'sql', name: 'SQL', status: 'not-started' },
];

// Mock badges data
const mockBadges = [
  { id: 'badge1', name: 'React Pro', skill: 'React', icon: '🏅' },
  { id: 'badge2', name: 'Node Novice', skill: 'Node.js', icon: '🎖️' },
];

// Mock achievements and leaderboard
const mockAchievements = [
  { id: 'ach1', label: '7-Day Streak', icon: '🔥' },
  { id: 'ach2', label: 'First Project', icon: '🏆' },
];
const mockLeaderboard = [
  { id: 'u1', name: 'Alice', xp: 3200 },
  { id: 'u2', name: 'Bob', xp: 2900 },
  { id: 'u3', name: 'You', xp: 2500 },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { hasStartedCareer, currentCareer, resetCareer } = useCareer();
  const { toast } = useToast();
  const [userInfo, setUserInfo] = useState({ totalXp: 0, level: 1 });
  // Remove totalXp and level state
  const [learningModules, setLearningModules] = useState<LearningModule[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [completedResources, setCompletedResources] = useState<{ [key: string]: boolean }>({});

  // Move fetchRoadmapAndProgress out of useEffect
  const fetchRoadmapAndProgress = async () => {
    const token = getAuthToken();
    if (!token || !currentCareer) return;
    try {
      // Fetch all recommendations and find the current career
      const recommendations = await recommendationsApi.getRecommendations();
      const foundCareer = recommendations.find(c => c.id === currentCareer);
      if (!foundCareer || !foundCareer.detailedRoadmap) return;
      // Fetch user progress for this career
      const progressRes = await fetch(getApiUrl(`/api/progress/${currentCareer}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let progressData = null;
      if (progressRes.ok) {
        progressData = await progressRes.json();
      }
      // Fetch user submissions
      const submissionsRes = await fetch(getApiUrl('/api/submissions'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let submissions = [];
      if (submissionsRes.ok) {
        submissions = await submissionsRes.json();
      }
      // Map progress to modules and projects
      const modules: LearningModule[] = foundCareer.detailedRoadmap.map((step, idx) => {
        const completed = progressData && progressData.steps[idx]?.completed;
        const progress = completed ? 100 : 0;
        return {
          id: step.id,
          title: step.title,
          description: step.description,
          duration: step.estimatedTime,
          difficulty: (step as any).difficulty || 'Beginner',
          completed,
          progress,
          xpReward: step.xpReward,
          skillsLearned: step.skills,
          courses: [],
          resources: (step as any).resources || []
        };
      });
      // Merge submission data into projects
      const allProjects: Project[] = foundCareer.detailedRoadmap.flatMap((step, stepIdx) =>
        (step.projects || []).map(project => {
          const submission = submissions.find((s: any) => s.projectId === project.id);
          const stepProgress = progressData && progressData.steps[stepIdx]?.completed;
          return {
            ...project,
            status: submission
              ? (submission.status === 'approved'
                  ? 'approved'
                  : submission.status === 'reviewed'
                  ? 'submitted' // or 'reviewed' if you want a separate badge
                  : 'submitted')
              : (stepProgress ? 'completed' : 'not-started'),
            progress: stepProgress ? 100 : 0,
            submission: submission || null
          };
        })
      );
      setLearningModules(modules);
      setProjects(allProjects);
    } catch (err) {
      // Optionally handle error
    }
  };

  useEffect(() => {
    if (!hasStartedCareer || !currentCareer) {
      navigate('/');
      return;
    }

    // Fetch user profile for XP/level
    const fetchUserProfile = async () => {
      const token = getAuthToken();
      if (!token) return;
      try {
        const response = await fetch(getApiUrl('/api/users/profile'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUserInfo({ totalXp: data.totalXp || 0, level: data.level || 1 });
        }
      } catch {}
    };
    fetchUserProfile();

    // Fetch roadmap and progress for current career
    fetchRoadmapAndProgress();
  }, [hasStartedCareer, currentCareer, navigate]);

  // Calculate module progress and completion
  const getModuleResourceProgress = (module: LearningModule, idx: number) => {
    if (!module.resources || module.resources.length === 0) return 0;
    const completedCount = module.resources.filter(r => completedResources[`${idx}|${r.url}`]).length;
    return Math.round((completedCount / module.resources.length) * 100);
  };

  // Mark module as completed if all resources are complete
  useEffect(() => {
    learningModules.forEach((module, idx) => {
      if (module.resources && module.resources.length > 0) {
        const allComplete = module.resources.every(r => completedResources[`${idx}|${r.url}`]);
        if (allComplete && !module.completed) {
          updateModuleProgress(module.id, 100);
        } else if (!allComplete && module.completed) {
          updateModuleProgress(module.id, 0);
        }
      }
    });
    // eslint-disable-next-line
  }, [completedResources]);

  const completedModules = learningModules.filter(m => m.completed).length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const overallProgress = ((completedModules + completedProjects) / (learningModules.length + projects.length)) * 100;

  const updateModuleProgress = (moduleId: string, newProgress: number) => {
    setLearningModules(prev => prev.map(module => 
      module.id === moduleId 
        ? { ...module, progress: newProgress, completed: newProgress === 100 }
        : module
    ));

    if (newProgress === 100) {
      const module = learningModules.find(m => m.id === moduleId);
      if (module && !module.completed) {
        setUserInfo(prev => ({ ...prev, totalXp: prev.totalXp + module.xpReward }));
        toast({
          title: "🎉 Module Completed!",
          description: `You earned ${module.xpReward} XP!`,
        });
      }
    }
  };

  const updateProjectStatus = (projectId: string, status: Project['status']) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, status, progress: status === 'completed' ? 100 : project.progress }
        : project
    ));

    if (status === 'completed') {
      const project = projects.find(p => p.id === projectId);
      if (project && project.status !== 'completed') {
        setUserInfo(prev => ({ ...prev, totalXp: prev.totalXp + project.xpReward }));
        toast({
          title: "🚀 Project Completed!",
          description: `You earned ${project.xpReward} XP!`,
        });
      }
    }
  };

  const handleProjectSubmission = (projectId: string, submission: any) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, status: 'submitted', submission, progress: 100 }
        : project
    ));

    toast({
      title: "🎯 Project Submitted!",
      description: "Your project has been sent to mentors for review.",
    });
  };

  const completeCourse = (moduleId: string, courseId: string) => {
    setLearningModules(prev => prev.map(module => {
      if (module.id === moduleId) {
        const updatedCourses = module.courses.map(course => 
          course.id === courseId ? { ...course, completed: true } : course
        );
        const completedCount = updatedCourses.filter(c => c.completed).length;
        const newProgress = Math.round((completedCount / updatedCourses.length) * 100);
        
        return {
          ...module,
          courses: updatedCourses,
          progress: newProgress,
          completed: newProgress === 100
        };
      }
      return module;
    }));

    toast({
      title: "📚 Course Completed!",
      description: "Great job! Keep up the momentum.",
    });
  };

  // Add function to update step progress in backend
  const updateStepProgress = async (stepIndex: number, completed: boolean) => {
    const token = getAuthToken();
    if (!token || !currentCareer) return;
    try {
      await fetch(getApiUrl(`/api/progress/${currentCareer}/step/${stepIndex}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ completed })
      });
      // Refetch roadmap and progress after update
      await fetchRoadmapAndProgress();
      toast({ title: completed ? 'Module Completed!' : 'Module Marked Incomplete', description: completed ? 'Great job!' : 'You can revisit this module anytime.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update progress', variant: 'destructive' });
    }
  };

  const markResourceComplete = async (stepIndex: number, resourceUrl: string) => {
    const token = getAuthToken();
    if (!token || !currentCareer) return;
    await fetch(getApiUrl(`/api/progress/${currentCareer}/step/${stepIndex}/resource/complete`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ resourceUrl })
    });
    setCompletedResources(prev => ({ ...prev, [`${stepIndex}|${resourceUrl}`]: true }));
  };
  const markResourceIncomplete = async (stepIndex: number, resourceUrl: string) => {
    const token = getAuthToken();
    if (!token || !currentCareer) return;
    await fetch(getApiUrl(`/api/progress/${currentCareer}/step/${stepIndex}/resource/incomplete`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ resourceUrl })
    });
    setCompletedResources(prev => {
      const copy = { ...prev };
      delete copy[`${stepIndex}|${resourceUrl}`];
      return copy;
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'secondary';
      case 'Intermediate': return 'default';
      case 'Advanced': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'approved': return 'text-green-600';
      case 'submitted': return 'text-blue-600';
      case 'in-progress': return 'text-yellow-600';
      case 'not-started': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getCourseIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'article': return FileText;
      case 'quiz': return Target;
      case 'hands-on': return PlayCircle;
      default: return BookOpen;
    }
  };

  // Add a placeholder for careerRoleId (replace with real value as needed)
  const careerRoleId = currentCareer || '';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/10">
      <Header />
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-xl border border-border/50 p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                    Your Learning Dashboard
                  </h1>
                  <p className="text-muted-foreground">
                    Track your progress on your {currentCareer} journey
                  </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-muted/30 rounded-xl p-4 text-center">
                    <Trophy className="w-6 h-6 text-primary mx-auto mb-2" />
                    <div className="text-xl font-bold text-foreground">{userInfo.totalXp}</div>
                    <div className="text-xs text-muted-foreground">Total XP</div>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4 text-center">
                    <Award className="w-6 h-6 text-secondary mx-auto mb-2" />
                    <div className="text-xl font-bold text-foreground">Level {userInfo.level}</div>
                    <div className="text-xs text-muted-foreground">Current Level</div>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4 text-center">
                    <BookOpen className="w-6 h-6 text-accent mx-auto mb-2" />
                    <div className="text-xl font-bold text-foreground">{completedModules}/{learningModules.length}</div>
                    <div className="text-xs text-muted-foreground">Modules</div>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4 text-center">
                    <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-foreground">{completedProjects}/{projects.length}</div>
                    <div className="text-xs text-muted-foreground">Projects</div>
                  </div>
                </div>
              </div>

              {/* Overall Progress */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-3" />
              </div>
            </div>
          </div>

          {/* Skill Roadmap */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Skill Roadmap</h2>
              <Button 
                onClick={() => navigate(`/enhanced-learning-journey/${currentCareer}`)}
                className="flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Enhanced Journey
              </Button>
            </div>
            <div className="flex gap-6 items-center">
              {mockRoadmap.map((step, idx) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mb-2
                    ${step.status === 'completed' ? 'bg-green-500 text-white' : step.status === 'in-progress' ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-500'}`}
                  >
                    {step.name[0]}
                  </div>
                  <span className="text-sm font-medium mb-1">{step.name}</span>
                  <span className={`text-xs ${step.status === 'completed' ? 'text-green-600' : step.status === 'in-progress' ? 'text-yellow-600' : 'text-gray-400'}`}>{step.status.replace('-', ' ')}</span>
                  {idx < mockRoadmap.length - 1 && <div className="w-8 h-1 bg-gray-300 mx-2" />}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Progress value={Math.round((mockRoadmap.filter(s => s.status === 'completed').length / mockRoadmap.length) * 100)} className="h-3" />
            </div>
          </div>

          {/* Your Badges */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Your Badges</h2>
            <div className="flex gap-4">
              {mockBadges.map(badge => (
                <div key={badge.id} className="flex flex-col items-center bg-gray-50 border rounded-lg px-4 py-3">
                  <span className="text-3xl mb-1">{badge.icon}</span>
                  <span className="font-semibold text-blue-700">{badge.name}</span>
                  <span className="text-xs text-gray-500">{badge.skill}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Achievements</h2>
            <div className="flex gap-4 mb-4">
              {mockAchievements.map(ach => (
                <div key={ach.id} className="flex flex-col items-center bg-yellow-50 border rounded-lg px-4 py-3">
                  <span className="text-3xl mb-1">{ach.icon}</span>
                  <span className="font-semibold text-yellow-700">{ach.label}</span>
                </div>
              ))}
            </div>
            <h2 className="text-xl font-bold mb-2">Leaderboard</h2>
            <table className="min-w-[300px] bg-white border rounded-lg">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs text-gray-500">User</th>
                  <th className="px-4 py-2 text-left text-xs text-gray-500">XP</th>
                </tr>
              </thead>
              <tbody>
                {mockLeaderboard.map(user => (
                  <tr key={user.id} className={user.name === 'You' ? 'bg-blue-50 font-bold' : ''}>
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.xp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="learning" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="learning">Skill Development</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="resources">Learning Resources</TabsTrigger>
            </TabsList>

            {/* Learning Modules Tab */}
            <TabsContent value="learning">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Skill Development</h2>
                {learningModules.map((module, idx) => (
                  <Card key={module.id} className="bg-card/80 backdrop-blur-sm border border-border/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg text-foreground flex items-center gap-2">
                            {module.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <PlayCircle className="w-5 h-5 text-primary" />
                            )}
                            {module.title}
                          </CardTitle>
                          <p className="text-muted-foreground mt-1">{module.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getDifficultyColor(module.difficulty)}>
                            {module.difficulty}
                          </Badge>
                          <Badge variant="outline">
                            <Zap className="w-3 h-3 mr-1" />
                            {module.xpReward} XP
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {module.duration}
                        </span>
                        <span className="text-sm text-muted-foreground">{getModuleResourceProgress(module, idx)}%</span>
                      </div>
                      <Progress value={getModuleResourceProgress(module, idx)} className="h-3 mb-4" />

                      {/* Skills Learned */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Skills You'll Master</h4>
                        <div className="flex flex-wrap gap-1">
                          {module.skillsLearned.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Course List */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Courses</h4>
                        <div className="space-y-2">
                          {module.courses.map((course) => {
                            const CourseIcon = getCourseIcon(course.type);
                            return (
                              <div 
                                key={course.id} 
                                className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <CourseIcon className={`w-4 h-4 ${course.completed ? 'text-green-600' : 'text-primary'}`} />
                                  <div>
                                    <div className={`text-sm font-medium ${course.completed ? 'line-through text-muted-foreground' : ''}`}>
                                      {course.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                      <span>{course.duration}</span>
                                      <Badge variant="outline" className="text-xs capitalize">
                                        {course.type}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {course.completed ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => completeCourse(module.id, course.id)}
                                    >
                                      Start
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {module.resources && module.resources.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-2">Learning Resources</h4>
                          <div className="space-y-2">
                            {module.resources.map((resource, rIdx) => {
                              const isCompleted = completedResources[`${idx}|${resource.url}`];
                              const ResourceIcon = getCourseIcon(resource.type);
                              return (
                                <div key={resource.url} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <ResourceIcon className={`w-4 h-4 ${isCompleted ? 'text-green-600' : 'text-primary'}`} />
                                    <div>
                                      <div className={`text-sm font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>{resource.title}</div>
                                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs capitalize">{resource.type}</Badge>
                                        <span>{resource.description}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button asChild variant="ghost" size="sm">
                                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-4 h-4" />
                                      </a>
                                    </Button>
                                    {isCompleted ? (
                                      <Button size="sm" variant="outline" onClick={() => markResourceIncomplete(idx, resource.url)}>
                                        <CheckCircle2 className="w-4 h-4 text-green-600 mr-1" />
                                        Completed
                                      </Button>
                                    ) : (
                                      <Button size="sm" variant="outline" onClick={() => markResourceComplete(idx, resource.url)}>
                                        Mark Complete
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {!module.completed ? (
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateModuleProgress(module.id, Math.min(100, getModuleResourceProgress(module, idx) + 25))}
                          >
                            Continue Learning
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateStepProgress(learningModules.findIndex(m => m.id === module.id), false)}
                          >
                            Mark Incomplete
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground mb-4">Practice Projects</h2>
                {projects.map((project, idx) => (
                  <Card key={project.id} className="bg-card/80 backdrop-blur-sm border border-border/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg text-foreground">{project.title}</CardTitle>
                          <p className="text-muted-foreground mt-1">{project.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getDifficultyColor(project.difficulty)}>
                            {project.difficulty}
                          </Badge>
                          <Badge variant="outline">
                            <Star className="w-3 h-3 mr-1" />
                            {project.xpReward} XP
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {project.estimatedTime}
                        </span>
                        <span className={`text-sm font-medium ${getStatusColor(project.status)}`}>
                          {project.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      {project.status !== 'not-started' && (
                        <>
                          <Progress value={project.progress} className="h-2 mb-3" />
                          <div className="text-sm text-muted-foreground mb-3">{project.progress}% Complete</div>
                        </>
                      )}
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {project.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <ProjectSubmission 
                          project={project} 
                          careerRoleId={careerRoleId}
                          stepIndex={0} // Replace with real step index if available
                          onSubmit={handleProjectSubmission}
                        />
                        {project.status === 'not-started' && (
                          <Button 
                            size="sm"
                            onClick={() => updateProjectStatus(project.id, 'in-progress')}
                          >
                            Start Project
                          </Button>
                        )}
                        {project.status === 'in-progress' && (
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => updateProjectStatus(project.id, 'completed')}
                          >
                            Mark Complete
                          </Button>
                        )}
                        {project.status === 'completed' && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                        {project.status === 'submitted' && (
                          <Badge variant="default" className="bg-blue-600">
                            <Clock className="w-3 h-3 mr-1" />
                            Under Review
                          </Badge>
                        )}
                        {project.status === 'approved' && (
                          <Badge 
                            variant="default" 
                            className="bg-green-600 cursor-pointer"
                            onClick={() => setSelectedProject(project)}
                          >
                            <Award className="w-3 h-3 mr-1" />
                            Approved
                          </Badge>
                        )}
                      </div>
                      {/* Feedback Modal/Section */}
                      {selectedProject && selectedProject.id === project.id && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 text-green-800 mb-2">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-medium">Project Approved</span>
                          </div>
                          {selectedProject.submission && (
                            <>
                              {selectedProject.submission.feedback && (
                                <div className="mb-2">
                                  <span className="font-semibold">Feedback:</span> {selectedProject.submission.feedback}
                                </div>
                              )}
                              {selectedProject.submission.score !== undefined && (
                                <div>
                                  <span className="font-semibold">Score:</span> {selectedProject.submission.score}/100
                                </div>
                              )}
                            </>
                          )}
                          <Button variant="outline" size="sm" className="mt-2" onClick={() => setSelectedProject(null)}>
                            Close
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Recommended Books
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <div className="font-medium">Python for Data Analysis</div>
                      <div className="text-sm text-muted-foreground">by Wes McKinney</div>
                    </div>
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <div className="font-medium">Hands-On Machine Learning</div>
                      <div className="text-sm text-muted-foreground">by Aurélien Géron</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Industry Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <div className="font-medium">Jupyter Notebooks</div>
                      <div className="text-sm text-muted-foreground">Interactive development environment</div>
                    </div>
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <div className="font-medium">Docker</div>
                      <div className="text-sm text-muted-foreground">Containerization platform</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Reset Career Button */}
          <div className="mt-8 text-center">
            <Button 
              variant="outline" 
              onClick={() => {
                resetCareer();
                navigate('/');
                toast({
                  title: "Career Reset",
                  description: "You can now choose a different career path.",
                });
              }}
            >
              Choose Different Career
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;