import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/assessment/LoadingSpinner';
import { CareerRecommendation } from '@/types/recommendations';
import { recommendationsApi } from '@/services/recommendationsApi';
import { getApiUrl, getAuthToken } from '@/config/api';
import { useToast } from '@/hooks/use-toast';
import { useCareer } from '@/contexts/CareerContext';
import { 
  ArrowLeft, 
  BookOpen, 
  Play,
  Clock,
  Star,
  Award
} from 'lucide-react';

interface LearningResource {
  id: string;
  title: string;
  type: 'video' | 'article' | 'course' | 'documentation';
  url: string;
  duration?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface SkillData {
  name: string;
  description: string;
  importance: 'High' | 'Medium' | 'Low';
  resources: LearningResource[];
}

const CareerStart = () => {
  const { careerId } = useParams();
  const navigate = useNavigate();
  const [career, setCareer] = useState<CareerRecommendation | null>(null);
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { startCareer } = useCareer();

  useEffect(() => {
    const fetchCareerDetails = async () => {
      try {
        setIsLoading(true);
        
        // Try to fetch detailed career data with skills from server
        const skillsData = await recommendationsApi.getCareerSkills(careerId!);
        
        if (skillsData) {
          console.log('Career skills data from server:', skillsData);
          setCareer(skillsData.career);
          setSkills(skillsData.skills);
          return;
        }
        
        // Fallback to general recommendations
        const recommendations = await recommendationsApi.getRecommendations();
        const foundCareer = recommendations.find(c => c.id === careerId);
        
        if (foundCareer) {
          setCareer(foundCareer);
          setSkills(generateSkillsData(foundCareer.name));
        } else {
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

  const generateSkillsData = (careerName: string): SkillData[] => {
    // Mock skills data based on career type
    const skillsMap: { [key: string]: SkillData[] } = {
      'Data Scientist': [
        {
          name: 'Python Programming',
          description: 'Master Python for data analysis, machine learning, and automation',
          importance: 'High',
          resources: [
            { id: '1', title: 'Python for Data Science Handbook', type: 'course', url: '#', duration: '8 hours', difficulty: 'Beginner' },
            { id: '2', title: 'NumPy Documentation', type: 'documentation', url: '#', difficulty: 'Intermediate' },
            { id: '3', title: 'Pandas Tutorial Series', type: 'video', url: '#', duration: '4 hours', difficulty: 'Beginner' }
          ]
        },
        {
          name: 'Machine Learning',
          description: 'Learn supervised and unsupervised learning algorithms',
          importance: 'High',
          resources: [
            { id: '4', title: 'Machine Learning Course by Andrew Ng', type: 'course', url: '#', duration: '54 hours', difficulty: 'Intermediate' },
            { id: '5', title: 'Scikit-learn User Guide', type: 'documentation', url: '#', difficulty: 'Intermediate' },
            { id: '6', title: 'ML Algorithms Explained', type: 'article', url: '#', duration: '30 min', difficulty: 'Beginner' }
          ]
        },
        {
          name: 'Statistics & Mathematics',
          description: 'Understand statistical concepts and mathematical foundations',
          importance: 'High',
          resources: [
            { id: '7', title: 'Statistics for Data Science', type: 'course', url: '#', duration: '12 hours', difficulty: 'Intermediate' },
            { id: '8', title: 'Linear Algebra Essentials', type: 'video', url: '#', duration: '6 hours', difficulty: 'Beginner' }
          ]
        },
        {
          name: 'Data Visualization',
          description: 'Create compelling visualizations to communicate insights',
          importance: 'Medium',
          resources: [
            { id: '9', title: 'Matplotlib & Seaborn Tutorial', type: 'video', url: '#', duration: '3 hours', difficulty: 'Beginner' },
            { id: '10', title: 'Tableau Fundamentals', type: 'course', url: '#', duration: '8 hours', difficulty: 'Beginner' }
          ]
        }
      ],
      'UX Designer': [
        {
          name: 'Design Principles',
          description: 'Master fundamental design principles and visual hierarchy',
          importance: 'High',
          resources: [
            { id: '1', title: 'Design Fundamentals Course', type: 'course', url: '#', duration: '6 hours', difficulty: 'Beginner' },
            { id: '2', title: 'Color Theory Guide', type: 'article', url: '#', duration: '45 min', difficulty: 'Beginner' }
          ]
        },
        {
          name: 'User Research',
          description: 'Learn to conduct user interviews, surveys, and usability testing',
          importance: 'High',
          resources: [
            { id: '3', title: 'User Research Methods', type: 'course', url: '#', duration: '10 hours', difficulty: 'Intermediate' },
            { id: '4', title: 'Interview Techniques', type: 'video', url: '#', duration: '2 hours', difficulty: 'Beginner' }
          ]
        },
        {
          name: 'Prototyping',
          description: 'Create interactive prototypes using industry-standard tools',
          importance: 'High',
          resources: [
            { id: '5', title: 'Figma Complete Course', type: 'course', url: '#', duration: '8 hours', difficulty: 'Beginner' },
            { id: '6', title: 'Advanced Prototyping', type: 'video', url: '#', duration: '4 hours', difficulty: 'Advanced' }
          ]
        }
      ]
    };

    return skillsMap[careerName] || skillsMap['Data Scientist'];
  };

  const handleStartCareer = () => {
    if (careerId) {
      startCareer(careerId);
      navigate('/dashboard');
      toast({
        title: "🚀 Career Journey Started!",
        description: "Welcome to your personalized learning dashboard.",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'course': return '📚';
      case 'article': return '📖';
      case 'documentation': return '📋';
      default: return '📄';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'outline';
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

  if (!career) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/10">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Career Not Found</h1>
            <Button onClick={() => navigate('/browse-careers')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Browse Careers
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
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/browse-careers')}
              className="mb-6 hover:bg-muted/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Browse Careers
            </Button>

            <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-xl border border-border/50 p-8">
              <div className="text-center mb-6">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                  Ready to Start Your {career.name} Journey?
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Here's everything you need to learn and the resources to master each skill. 
                  Your personalized learning path awaits!
                </p>
              </div>

              <div className="flex justify-center gap-4 mb-8">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {career.matchPercentage}% Match
                </Badge>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {career.difficulty}
                </Badge>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-bold text-foreground flex items-center">
              <BookOpen className="w-6 h-6 mr-3" />
              Skills You'll Master
            </h2>

            <div className="grid gap-6">
              {skills.map((skill, index) => (
                <Card key={index} className="bg-card/80 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-foreground">{skill.name}</CardTitle>
                      <Badge variant={getImportanceColor(skill.importance)}>
                        {skill.importance} Priority
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{skill.description}</p>
                  </CardHeader>

                  <CardContent>
                    <h4 className="font-semibold text-foreground mb-4 flex items-center">
                      📚 Learning Resources
                    </h4>
                    <div className="grid gap-3">
                      {skill.resources.map((resource) => (
                        <div key={resource.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/30">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{getTypeIcon(resource.type)}</span>
                            <div>
                              <div className="font-medium text-foreground">{resource.title}</div>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Badge variant="outline" className="text-xs">
                                  {resource.difficulty}
                                </Badge>
                                {resource.duration && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {resource.duration}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Start Career Button */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 p-8 inline-block">
              <div className="mb-6">
                <Award className="w-16 h-16 mx-auto text-primary mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2">Ready to Begin?</h3>
                <p className="text-muted-foreground">
                  Start your personalized learning journey and track your progress
                </p>
              </div>
              <Button 
                size="lg" 
                onClick={handleStartCareer}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-3 text-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Start My Career Journey
              </Button>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CareerStart;