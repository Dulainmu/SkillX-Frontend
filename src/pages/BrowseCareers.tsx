import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Briefcase, TrendingUp, DollarSign, Clock, ArrowRight, Rocket, Brain, Target } from 'lucide-react';
import { CareerRecommendation } from '@/types/recommendations';
import { getApiUrl } from '@/config/api';
import type { BackendRecommendationsResponse } from '@/types/backendRecommendations';

const BrowseCareers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [careers, setCareers] = useState<CareerRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Assessment integration
  const fromAssessment = location.state?.fromAssessment;
  const assessmentData = location.state?.assessmentData;
  const recommendations = location.state?.recommendations as BackendRecommendationsResponse;

  useEffect(() => {
    const fetchCareers = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(getApiUrl('/api/recommendations/careers'));
        if (!response.ok) throw new Error('Failed to fetch careers');
        const data = await response.json();
        
        // Map backend fields to frontend expectations
        const mappedCareers = data.careers.map((career: any) => ({
          id: career._id || career.id,
          name: career.name,
          description: career.description,
          skills: career.skills || [],
          roadmap: career.roadmap || [],
          averageSalary: career.averageSalary || 'N/A',
          jobGrowth: career.jobGrowth || 'N/A',
          difficulty: career.difficulty || 'Intermediate',
          totalXp: career.totalXp || 0,
          matchPercentage: career.matchPercentage || 80,
        }));
        
        // If coming from assessment, prioritize recommended careers
        if (fromAssessment && recommendations?.topMatches) {
          const recommendedIds = new Set(recommendations.topMatches.map(m => m.pathId));
          const sortedCareers = mappedCareers.sort((a, b) => {
            const aRecommended = recommendedIds.has(a.id);
            const bRecommended = recommendedIds.has(b.id);
            if (aRecommended && !bRecommended) return -1;
            if (!aRecommended && bRecommended) return 1;
            return 0;
          });
          setCareers(sortedCareers);
        } else {
          setCareers(mappedCareers);
        }
      } catch (err: any) {
        setError('Failed to load careers.');
      } finally {
        setLoading(false);
      }
    };
    fetchCareers();
  }, [fromAssessment, recommendations]);

  const industries = ["All", "Technology", "Design", "Marketing", "Business", "Healthcare", "Finance"];

  const filteredCareers = careers.filter(career => {
    const matchesSearch = career.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         career.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         career.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Map career types to industries for filtering
    const getIndustry = (name: string) => {
      if (name.includes('Engineer') || name.includes('Data') || name.includes('Cybersecurity')) return 'Technology';
      if (name.includes('Designer')) return 'Design';
      if (name.includes('Marketing')) return 'Marketing';
      if (name.includes('Manager')) return 'Business';
      return 'Technology';
    };
    
    const matchesIndustry = selectedIndustry === '' || selectedIndustry === 'All' || getIndustry(career.name) === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const handleStartCareerPath = (career: CareerRecommendation) => {
    navigate(`/career/${career.id}`);
  };

  const handleTakeAssessment = () => {
    navigate('/career-assessment');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/10">
      <Header />
      
      <main className="flex-1 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-secondary/3 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/3 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/3 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Header Section */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-8">
                <Search className="w-4 h-4" />
                Career Explorer
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-secondary via-secondary to-primary bg-clip-text text-transparent mb-8">
                Explore Career Paths
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Browse our comprehensive database of careers. Find detailed information about 
                <span className="text-foreground font-medium"> roles, skills required, and growth opportunities</span>
              </p>
              
              {/* Assessment Integration Banner */}
              {fromAssessment && (
                <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-primary/20">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Brain className="w-6 h-6 text-primary" />
                    <span className="text-lg font-semibold text-primary">Personalized Recommendations</span>
                  </div>
                  <p className="text-muted-foreground">
                    Based on your assessment results, we've highlighted careers that best match your profile. 
                    Your top matches appear first in the list below.
                  </p>
                </div>
              )}
              
              {/* Take Assessment CTA */}
              {!fromAssessment && (
                <div className="mt-8">
                  <Button 
                    onClick={handleTakeAssessment}
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-3 rounded-xl"
                  >
                    <Target className="w-5 h-5 mr-2" />
                    Take Career Assessment
                  </Button>
                  <p className="text-sm text-muted-foreground mt-3">
                    Get personalized career recommendations based on your skills and personality
                  </p>
                </div>
              )}
            </div>

            {/* Enhanced Search and Filter Section */}
            <div className="mb-12">
              <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-xl border border-border/50 p-8">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search careers, skills, or keywords..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-14 text-lg bg-background/50 border-2 hover:border-primary/50 focus:border-primary transition-all duration-300"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Filter className="h-5 w-5 text-muted-foreground" />
                    <select
                      value={selectedIndustry}
                      onChange={(e) => setSelectedIndustry(e.target.value)}
                      className="h-14 px-4 rounded-xl border-2 border-border bg-background/50 text-foreground hover:border-primary/50 focus:border-primary focus:outline-none transition-all duration-300 min-w-[180px]"
                    >
                      {industries.map(industry => (
                        <option key={industry} value={industry}>
                          {industry} Industry
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Results Count */}
                <div className="mt-6 pt-6 border-t border-border/50">
                  <p className="text-muted-foreground text-center">
                    <span className="font-semibold text-foreground">{filteredCareers.length}</span> career{filteredCareers.length !== 1 ? 's' : ''} found
                    {searchTerm && <span> for "<span className="text-primary font-medium">{searchTerm}</span>"</span>}
                    {selectedIndustry && selectedIndustry !== 'All' && <span> in <span className="text-secondary font-medium">{selectedIndustry}</span></span>}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredCareers.map((career, index) => {
                const isRecommended = fromAssessment && recommendations?.topMatches?.some(m => m.pathId === career.id);
                
                return (
                  <Card 
                    key={career.id} 
                    className={`group hover:shadow-2xl transition-all duration-500 border-2 hover:border-secondary/50 hover:-translate-y-2 bg-card/80 backdrop-blur-sm relative overflow-hidden ${
                      isRecommended ? 'ring-2 ring-primary/30 border-primary/20' : ''
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Recommended Badge */}
                    {isRecommended && (
                      <div className="absolute top-4 left-4 z-20">
                        <Badge className="bg-primary text-primary-foreground border-primary">
                          <Target className="w-3 h-3 mr-1" />
                          Recommended
                        </Badge>
                      </div>
                    )}
                    
                    {/* Decorative Elements */}
                    <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <CardHeader className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <CardTitle className="text-xl group-hover:text-secondary transition-colors duration-300">
                              {career.name}
                            </CardTitle>
                            <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
                              {career.matchPercentage}% Match
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className={`text-xs ${
                              career.difficulty === 'Beginner-Friendly' ? 'border-green-500/30 text-green-600 bg-green-50/50' :
                              career.difficulty === 'Intermediate' ? 'border-yellow-500/30 text-yellow-600 bg-yellow-50/50' :
                              'border-red-500/30 text-red-600 bg-red-50/50'
                            }`}>
                              {career.difficulty}
                            </Badge>
                            {career.totalXp && (
                              <Badge variant="outline" className="text-xs border-primary/20 text-primary bg-primary/5">
                                {career.totalXp} XP
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-r from-secondary/10 to-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-secondary/20">
                          <Rocket className="h-6 w-6 text-secondary" />
                        </div>
                      </div>
                      <CardDescription className="text-sm leading-relaxed">
                        {career.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6 relative z-10">
                      {/* Enhanced Key Metrics */}
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center text-sm bg-muted/50 p-3 rounded-lg">
                          <DollarSign className="h-5 w-5 mr-3 text-success" />
                          <span className="font-semibold">{career.averageSalary}</span>
                        </div>
                        <div className="flex items-center text-sm bg-muted/50 p-3 rounded-lg">
                          <TrendingUp className="h-5 w-5 mr-3 text-success" />
                          <span className="font-medium">{career.jobGrowth} growth rate</span>
                        </div>
                      </div>

                      {/* Enhanced Skills */}
                      <div>
                        <h4 className="font-semibold text-sm mb-3 text-foreground">Key Skills:</h4>
                        <div className="flex flex-wrap gap-2">
                          {career.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs border-primary/20 hover:bg-primary/10 transition-colors duration-200">
                              {skill}
                            </Badge>
                          ))}
                          {career.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs border-muted-foreground/20">
                              +{career.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Roadmap Preview */}
                      <div>
                        <h4 className="font-semibold text-sm mb-3 text-foreground">Learning Path:</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {career.roadmap.slice(0, 2).map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-center">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0"></div>
                              {step}
                            </li>
                          ))}
                          {career.roadmap.length > 2 && (
                            <li className="text-primary font-medium">
                              + {career.roadmap.length - 2} more steps...
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Enhanced Action Button */}
                      <Button 
                        className="w-full h-12 mt-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 group-hover:scale-105 transition-all duration-300 shadow-lg" 
                        onClick={() => handleStartCareerPath(career)}
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Start Career Path
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Enhanced Empty State */}
            {filteredCareers.length === 0 && (
              <div className="text-center py-20">
                <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-border/50 p-12 max-w-md mx-auto">
                  <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">No careers found</h3>
                  <p className="text-muted-foreground mb-8">
                    Try adjusting your search terms or filters to find more careers.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedIndustry('All'); // Fix: reset to 'All'
                    }}
                    className="w-full h-12 hover:scale-105 transition-transform duration-200"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BrowseCareers;