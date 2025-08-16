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
  Play, 
  BookOpen, 
  Video, 
  FileText, 
  Globe, 
  ExternalLink,
  Bookmark,
  Share2,
  Download,
  Clock,
  Star,
  Users,
  Calendar,
  CheckCircle2,
  Eye,
  ThumbsUp,
  MessageCircle,
  Filter,
  Search,
  SortAsc,
  SortDesc
} from 'lucide-react';

interface LearningResource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'course' | 'documentation' | 'interactive';
  url?: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  reviews: number;
  provider: string;
  tags: string[];
  isCompleted?: boolean;
  isBookmarked?: boolean;
}

const LearningResources = () => {
  const { careerId, stepId, skillId } = useParams();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState<BriefRoadmap | null>(null);
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [filteredResources, setFilteredResources] = useState<LearningResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'duration' | 'reviews'>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch roadmap data
        const roadmapData = await recommendationsApi.getBriefRoadmap(careerId!);
        setRoadmap(roadmapData);
        
        // Generate mock resources based on the skill
        const mockResources: LearningResource[] = [
          {
            id: '1',
            title: `${skillId} Fundamentals Course`,
            description: `A comprehensive introduction to ${skillId} covering all the basics you need to know. Perfect for beginners starting their journey.`,
            type: 'course',
            url: 'https://example.com/course',
            duration: '4 hours',
            difficulty: 'Beginner',
            rating: 4.8,
            reviews: 1247,
            provider: 'SkillX Academy',
            tags: ['fundamentals', 'beginner', 'comprehensive'],
            isCompleted: false,
            isBookmarked: false
          },
          {
            id: '2',
            title: `${skillId} Crash Course`,
            description: `Quick and intensive overview of ${skillId} concepts. Get up to speed in just 2 hours.`,
            type: 'video',
            url: 'https://example.com/video',
            duration: '2 hours',
            difficulty: 'Beginner',
            rating: 4.5,
            reviews: 892,
            provider: 'TechTube',
            tags: ['crash-course', 'quick-start', 'overview'],
            isCompleted: false,
            isBookmarked: true
          },
          {
            id: '3',
            title: `${skillId} Best Practices`,
            description: `Learn industry best practices and advanced techniques for ${skillId}. Essential for professional development.`,
            type: 'article',
            url: 'https://example.com/article',
            duration: '30 min read',
            difficulty: 'Intermediate',
            rating: 4.7,
            reviews: 567,
            provider: 'DevBlog',
            tags: ['best-practices', 'intermediate', 'professional'],
            isCompleted: true,
            isBookmarked: false
          },
          {
            id: '4',
            title: `${skillId} Official Documentation`,
            description: `Complete official documentation and API reference for ${skillId}. The definitive source.`,
            type: 'documentation',
            url: 'https://example.com/docs',
            duration: 'Reference',
            difficulty: 'Advanced',
            rating: 4.9,
            reviews: 2341,
            provider: 'Official',
            tags: ['documentation', 'reference', 'official'],
            isCompleted: false,
            isBookmarked: true
          },
          {
            id: '5',
            title: `${skillId} Interactive Tutorial`,
            description: `Hands-on interactive tutorial where you learn ${skillId} by doing. Practice in real-time.`,
            type: 'interactive',
            url: 'https://example.com/tutorial',
            duration: '3 hours',
            difficulty: 'Beginner',
            rating: 4.6,
            reviews: 743,
            provider: 'CodeLab',
            tags: ['interactive', 'hands-on', 'practice'],
            isCompleted: false,
            isBookmarked: false
          },
          {
            id: '6',
            title: `${skillId} Advanced Concepts`,
            description: `Deep dive into advanced ${skillId} concepts and techniques for experienced developers.`,
            type: 'video',
            url: 'https://example.com/advanced',
            duration: '6 hours',
            difficulty: 'Advanced',
            rating: 4.4,
            reviews: 234,
            provider: 'ExpertTech',
            tags: ['advanced', 'deep-dive', 'expert'],
            isCompleted: false,
            isBookmarked: false
          }
        ];
        
        setResources(mockResources);
        setFilteredResources(mockResources);
      } catch (error) {
        console.error('Failed to load resources:', error);
        toast({
          title: "Error",
          description: "Failed to load learning resources. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (careerId && stepId && skillId) {
      fetchData();
    }
  }, [careerId, stepId, skillId, toast]);

  useEffect(() => {
    // Filter and sort resources
    let filtered = resources.filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = selectedType === 'all' || resource.type === selectedType;
      const matchesDifficulty = selectedDifficulty === 'all' || resource.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesType && matchesDifficulty;
    });

    // Sort resources
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'duration':
          aValue = parseFloat(a.duration.split(' ')[0]);
          bValue = parseFloat(b.duration.split(' ')[0]);
          break;
        case 'reviews':
          aValue = a.reviews;
          bValue = b.reviews;
          break;
        default:
          aValue = a.rating;
          bValue = b.rating;
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    setFilteredResources(filtered);
  }, [resources, searchTerm, selectedType, selectedDifficulty, sortBy, sortOrder]);

  const toggleBookmark = (resourceId: string) => {
    setResources(prev => prev.map(resource => 
      resource.id === resourceId 
        ? { ...resource, isBookmarked: !resource.isBookmarked }
        : resource
    ));
    
    toast({
      title: "Bookmark Updated",
      description: "Resource bookmark status updated.",
    });
  };

  const markAsCompleted = (resourceId: string) => {
    setResources(prev => prev.map(resource => 
      resource.id === resourceId 
        ? { ...resource, isCompleted: !resource.isCompleted }
        : resource
    ));
    
    toast({
      title: "Progress Updated",
      description: "Resource completion status updated.",
    });
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5" />;
      case 'article': return <FileText className="w-5 h-5" />;
      case 'course': return <BookOpen className="w-5 h-5" />;
      case 'documentation': return <Globe className="w-5 h-5" />;
      case 'interactive': return <Play className="w-5 h-5" />;
      default: return <ExternalLink className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  if (!roadmap || !skillId) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/10">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Resources Not Found</h1>
            <Button onClick={() => navigate(`/learning-journey/${careerId}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Learning Journey
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentStep = roadmap.steps[parseInt(stepId || '0')];
  const skill = skillId;

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
                onClick={() => navigate(`/learning-journey/${careerId}`)}
                className="mb-6 hover:bg-muted/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Learning Journey
              </Button>

              {/* Page Header */}
              <Card className="bg-card/80 backdrop-blur-sm border border-border/50 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {skill} Learning Resources
                      </CardTitle>
                      <CardDescription className="text-lg mt-2">
                        Step {parseInt(stepId || '0') + 1}: {currentStep?.title} • {filteredResources.length} resources available
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Filters and Search */}
            <div className="mb-8">
              <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search resources..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* Type Filter */}
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">All Types</option>
                      <option value="video">Videos</option>
                      <option value="article">Articles</option>
                      <option value="course">Courses</option>
                      <option value="documentation">Documentation</option>
                      <option value="interactive">Interactive</option>
                    </select>

                    {/* Difficulty Filter */}
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">All Difficulties</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>

                    {/* Sort */}
                    <div className="flex gap-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'rating' | 'duration' | 'reviews')}
                        className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="rating">Sort by Rating</option>
                        <option value="duration">Sort by Duration</option>
                        <option value="reviews">Sort by Reviews</option>
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="px-3"
                      >
                        {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resources Grid */}
            <div className="grid gap-6">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="bg-card/80 backdrop-blur-sm border border-border/50 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      {/* Resource Icon and Type */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center">
                          {getResourceIcon(resource.type)}
                        </div>
                      </div>

                      {/* Resource Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-foreground mb-2">{resource.title}</h3>
                            <p className="text-muted-foreground mb-3">{resource.description}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleBookmark(resource.id)}
                              className={resource.isBookmarked ? 'text-primary' : ''}
                            >
                              <Bookmark className={`w-4 h-4 ${resource.isBookmarked ? 'fill-current' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsCompleted(resource.id)}
                              className={resource.isCompleted ? 'text-green-600' : ''}
                            >
                              <CheckCircle2 className={`w-4 h-4 ${resource.isCompleted ? 'fill-current' : ''}`} />
                            </Button>
                          </div>
                        </div>

                        {/* Resource Meta */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {resource.duration}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {resource.rating} ({resource.reviews} reviews)
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {resource.provider}
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getDifficultyColor(resource.difficulty)}`}
                          >
                            {resource.difficulty}
                          </Badge>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {resource.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-muted/30">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                          <Button 
                            onClick={() => {
                              if (resource.url) {
                                window.open(resource.url, '_blank');
                              } else {
                                toast({
                                  title: "Resource Unavailable",
                                  description: "This resource is not yet available.",
                                });
                              }
                            }}
                            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start Learning
                          </Button>
                          <Button variant="outline">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                          <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No Results */}
            {filteredResources.length === 0 && (
              <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Resources Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search terms to find more learning resources.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedType('all');
                      setSelectedDifficulty('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LearningResources;
