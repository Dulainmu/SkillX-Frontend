import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/assessment/LoadingSpinner';
import ProjectSubmission from '@/components/ProjectSubmission';
import { SkillProficiencyModal } from '@/components/SkillProficiencyModal';
import { SkillLevelProgress } from '@/components/SkillLevelProgress';
import { BriefRoadmap, RoadmapStep, Project } from '@/types/recommendations';
import { 
  Skill, 
  SkillProficiencyLevel, 
  UserSkillProgress,
  searchSkills,
  getUserSkills,
  updateUserSkill
} from '@/api/skillApi';
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
  X,
  TrendingUp,
  Brain,
  Lightbulb,
  BarChart3,
  MapPin,
  Timer,
  BookOpenCheck
} from 'lucide-react';

// Enhanced interfaces for skill-integrated learning journey
interface SkillBasedStep {
  id: string;
  title: string;
  description: string;
  skill: Skill;
  targetLevel: string; // 'Beginner', 'Intermediate', 'Advanced', 'Expert'
  currentLevel: string;
  progress: number;
  estimatedTime: number;
  xpReward: number;
  projects: SkillBasedProject[];
  resources: any[];
  prerequisites: string[];
  isCompleted: boolean;
  isUnlocked: boolean;
}

interface SkillBasedProject {
  id: string;
  title: string;
  description: string;
  skillLevel: string;
  difficulty: string;
  estimatedTime: string;
  xpReward: number;
  requirements: string[];
  deliverables: string[];
  status: 'not-started' | 'in-progress' | 'completed' | 'submitted' | 'approved' | 'rejected';
  progress: number;
  submission?: {
    id: string;
    status: 'pending' | 'reviewed' | 'approved' | 'rejected';
    feedback?: string;
    score?: number;
    submittedAt: string;
  };
}

interface UserSkillAssessment {
  skillId: string;
  skillName: string;
  currentLevel: string;
  progress: number;
  selfAssessment?: number;
  mentorAssessment?: number;
  lastAssessed: string;
}

interface EnhancedLearningJourney {
  id: string;
  name: string;
  description: string;
  careerPath: string;
  skills: Skill[];
  skillSteps: SkillBasedStep[];
  userSkillAssessment: UserSkillAssessment[];
  totalSteps: number;
  completedSteps: number;
  totalXp: number;
  earnedXp: number;
  estimatedDuration: number;
  currentProgress: number;
}

const EnhancedLearningJourney: React.FC = () => {
  const { careerId } = useParams();
  const navigate = useNavigate();
  const [journey, setJourney] = useState<EnhancedLearningJourney | null>(null);
  const [userSkills, setUserSkills] = useState<UserSkillProgress[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    const initializeJourney = async () => {
      try {
        setIsLoading(true);
        
        // Fetch career roadmap
        const roadmap = await recommendationsApi.getBriefRoadmap(careerId!);
        
        // Fetch all skills
        const skills = await searchSkills({ limit: '100' });
        setAllSkills(skills);
        
        // Fetch user's skill progress
        const userSkillProgress = await getUserSkills();
        setUserSkills(userSkillProgress.skills || []);
        
        // Create enhanced journey with skill integration
        const enhancedJourney = createEnhancedJourney(roadmap, skills, userSkillProgress.skills || []);
        setJourney(enhancedJourney);
        
      } catch (error) {
        console.error('Failed to initialize journey:', error);
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
      initializeJourney();
    }
  }, [careerId, toast]);

  const createEnhancedJourney = (
    roadmap: BriefRoadmap, 
    skills: Skill[], 
    userSkills: UserSkillProgress[]
  ): EnhancedLearningJourney => {
    // Map roadmap skills to actual skill objects
    const journeySkills = skills.filter(skill => 
      roadmap.skills.includes(skill.name)
    );

    // Create skill-based steps
    const skillSteps: SkillBasedStep[] = journeySkills.map((skill, index) => {
      const userSkill = userSkills.find(us => us.skill === skill._id);
      const currentLevel = userSkill?.level || 'not-started';
      const progress = userSkill?.progress || 0;
      
      // Determine target level based on skill difficulty and position
      const targetLevel = getTargetLevel(skill, index, journeySkills.length);
      
      // Get proficiency level details
      const proficiencyLevel = skill.proficiencyLevels?.find(pl => pl.level === targetLevel);
      
      // Create projects for this skill level
      const projects = createSkillBasedProjects(skill, targetLevel, proficiencyLevel);
      
      return {
        id: skill._id,
        title: `${skill.name} - ${targetLevel} Level`,
        description: proficiencyLevel?.description || `Master ${skill.name} at ${targetLevel} level`,
        skill,
        targetLevel,
        currentLevel,
        progress,
        estimatedTime: proficiencyLevel?.timeToAchieve || skill.estimatedTimeToLearn,
        xpReward: skill.xpReward,
        projects,
        resources: proficiencyLevel?.resources || [],
        prerequisites: proficiencyLevel?.prerequisites || [],
        isCompleted: currentLevel === targetLevel || progress >= 100,
        isUnlocked: index === 0 || skillSteps[index - 1]?.isCompleted || false
      };
    });

    const completedSteps = skillSteps.filter(step => step.isCompleted).length;
    const totalXp = skillSteps.reduce((sum, step) => sum + step.xpReward, 0);
    const earnedXp = skillSteps.reduce((sum, step) => sum + (step.progress * step.xpReward / 100), 0);
    const estimatedDuration = skillSteps.reduce((sum, step) => sum + step.estimatedTime, 0);
    const currentProgress = (completedSteps / skillSteps.length) * 100;

    return {
      id: roadmap.id,
      name: roadmap.name,
      description: roadmap.description,
      careerPath: roadmap.slug,
      skills: journeySkills,
      skillSteps,
      userSkillAssessment: userSkills.map(us => ({
        skillId: us.skill,
        skillName: us.skillName,
        currentLevel: us.level,
        progress: us.progress,
        selfAssessment: us.selfAssessment,
        mentorAssessment: us.mentorAssessment,
        lastAssessed: us.lastPracticedAt || new Date().toISOString()
      })),
      totalSteps: skillSteps.length,
      completedSteps,
      totalXp,
      earnedXp,
      estimatedDuration,
      currentProgress
    };
  };

  const getTargetLevel = (skill: Skill, index: number, totalSkills: number): string => {
    // Determine target level based on skill position and difficulty
    if (index < totalSkills * 0.25) return 'Beginner';
    if (index < totalSkills * 0.5) return 'Intermediate';
    if (index < totalSkills * 0.75) return 'Advanced';
    return 'Expert';
  };

  const createSkillBasedProjects = (
    skill: Skill, 
    targetLevel: string, 
    proficiencyLevel?: SkillProficiencyLevel
  ): SkillBasedProject[] => {
    const projects = proficiencyLevel?.projects || [];
    
    return projects.map((projectTitle, index) => ({
      id: `${skill._id}-project-${index}`,
      title: projectTitle,
      description: `Apply your ${skill.name} knowledge at ${targetLevel} level by building this project.`,
      skillLevel: targetLevel,
      difficulty: targetLevel,
      estimatedTime: '1-2 weeks',
      xpReward: Math.round(skill.xpReward / projects.length),
      requirements: proficiencyLevel?.expectations.slice(0, 3) || [],
      deliverables: [
        'Source code files',
        'Documentation (README)',
        'Screenshots or demo video',
        'Project reflection write-up'
      ],
      status: 'not-started',
      progress: 0
    }));
  };

  const handleSkillClick = (skill: Skill) => {
    setSelectedSkill(skill);
    setShowSkillModal(true);
  };

  const handleLevelChange = async (skillId: string, newLevel: number) => {
    try {
      // Update user skill progress
      await updateUserSkill(skillId, {
        level: ['not-started', 'beginner', 'intermediate', 'advanced', 'expert'][newLevel - 1] as any,
        progress: (newLevel / 4) * 100
      });
      
      // Refresh journey data
      const userSkillProgress = await getUserSkills();
      setUserSkills(userSkillProgress.skills || []);
      
      if (journey) {
        const updatedJourney = createEnhancedJourney(
          { id: journey.id, name: journey.name, description: journey.description, slug: journey.careerPath, skills: journey.skills.map(s => s.name), overview: { totalSteps: journey.totalSteps, totalProjects: 0, estimatedDuration: journey.estimatedDuration, totalXp: journey.totalXp }, steps: [] },
          allSkills,
          userSkillProgress.skills || []
        );
        setJourney(updatedJourney);
      }
      
      toast({
        title: "Progress Updated",
        description: "Your skill level has been updated successfully.",
      });
    } catch (error) {
      console.error('Failed to update skill level:', error);
      toast({
        title: "Error",
        description: "Failed to update skill level. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Journey Not Found</h1>
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{journey.name}</h1>
                <p className="text-gray-600 mt-2">{journey.description}</p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="mb-2">
                  {journey.careerPath}
                </Badge>
                <div className="text-sm text-gray-600">
                  {journey.completedSteps} of {journey.totalSteps} skills completed
                </div>
              </div>
            </div>
            
            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Target className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Progress</p>
                      <p className="text-2xl font-bold">{Math.round(journey.currentProgress)}%</p>
                    </div>
                  </div>
                  <Progress value={journey.currentProgress} className="mt-2" />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Trophy className="w-8 h-8 text-yellow-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">XP Earned</p>
                      <p className="text-2xl font-bold">{Math.round(journey.earnedXp)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">of {journey.totalXp} total</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Time Estimate</p>
                      <p className="text-2xl font-bold">{Math.round(journey.estimatedDuration / 40)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">weeks (40h/week)</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Star className="w-8 h-8 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Skills</p>
                      <p className="text-2xl font-bold">{journey.skills.length}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">to master</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Learning Path Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {journey.skillSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        step.isCompleted
                          ? 'border-green-200 bg-green-50'
                          : step.isUnlocked
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step.isCompleted
                              ? 'bg-green-600 text-white'
                              : step.isUnlocked
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-400 text-white'
                          }`}>
                            {step.isCompleted ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <span className="text-sm font-bold">{index + 1}</span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{step.title}</h3>
                            <p className="text-sm text-gray-600">{step.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={step.isCompleted ? "default" : "outline"}>
                            {step.targetLevel}
                          </Badge>
                          <div className="text-sm text-gray-600 mt-1">
                            {step.estimatedTime}h • {step.xpReward} XP
                          </div>
                        </div>
                      </div>
                      {step.isUnlocked && !step.isCompleted && (
                        <div className="mt-3">
                          <Progress value={step.progress} className="h-2" />
                          <p className="text-xs text-gray-600 mt-1">
                            {Math.round(step.progress)}% complete
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {journey.skills.map((skill) => {
                const step = journey.skillSteps.find(s => s.skill._id === skill._id);
                const userSkill = userSkills.find(us => us.skill === skill._id);
                const proficiencyLevels = skill.proficiencyLevels || [];
                
                return (
                  <Card key={skill._id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Code2 className="w-5 h-5 text-blue-600" />
                          {skill.name}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSkillClick(skill)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Levels
                          </Button>
                          <Badge variant="outline">
                            {proficiencyLevels.length} levels
                          </Badge>
                        </div>
                      </div>
                      <CardDescription>{skill.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {proficiencyLevels.length > 0 ? (
                        <SkillLevelProgress
                          skillName={skill.name}
                          currentLevel={userSkill ? ['not-started', 'beginner', 'intermediate', 'advanced', 'expert'].indexOf(userSkill.level) + 1 : 0}
                          proficiencyLevels={proficiencyLevels}
                          onLevelChange={(level) => handleLevelChange(skill._id, level)}
                        />
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <BookOpenCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No proficiency levels available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {journey.skillSteps.flatMap(step => 
                step.projects.map(project => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Rocket className="w-5 h-5 text-purple-600" />
                          {project.title}
                        </CardTitle>
                        <Badge variant={project.status === 'completed' ? 'default' : 'outline'}>
                          {project.status}
                        </Badge>
                      </div>
                      <CardDescription>{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Skill Level:</span>
                          <Badge variant="outline">{project.skillLevel}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">XP Reward:</span>
                          <span className="font-medium">{project.xpReward} XP</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Time Estimate:</span>
                          <span className="font-medium">{project.estimatedTime}</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1">
                            <Play className="w-4 h-4 mr-1" />
                            Start Project
                          </Button>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Assessment Tab */}
          <TabsContent value="assessment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Skill Assessment
                </CardTitle>
                <CardDescription>
                  Track your skill progress and get personalized recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {journey.userSkillAssessment.map((assessment) => {
                    const skill = journey.skills.find(s => s._id === assessment.skillId);
                    if (!skill) return null;
                    
                    return (
                      <div key={assessment.skillId} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">{assessment.skillName}</h3>
                          <Badge variant="outline">{assessment.currentLevel}</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress:</span>
                            <span>{Math.round(assessment.progress)}%</span>
                          </div>
                          <Progress value={assessment.progress} className="h-2" />
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>Self Assessment: {assessment.selfAssessment || 'Not assessed'}</span>
                            <span>Mentor Assessment: {assessment.mentorAssessment || 'Not assessed'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button 
                  className="mt-4 w-full"
                  onClick={() => setShowAssessment(true)}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Take Skill Assessment
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Skill Proficiency Modal */}
      {selectedSkill && (
        <SkillProficiencyModal
          isOpen={showSkillModal}
          onClose={() => setShowSkillModal(false)}
          skillName={selectedSkill.name}
          proficiencyLevels={selectedSkill.proficiencyLevels || []}
        />
      )}

      <Footer />
    </div>
  );
};

export default EnhancedLearningJourney;
