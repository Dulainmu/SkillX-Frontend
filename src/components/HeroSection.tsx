import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Brain, Search, Target, Zap, Sparkles, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-secondary/5 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-accent/5 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Welcome Header with Enhanced Styling */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Career Discovery
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent mb-8 leading-tight">
            Welcome to SkillX
          </h1>
          
          <p className="text-xl sm:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-4xl mx-auto">
            Discover your ideal career path through our AI-powered platform. 
            <span className="text-foreground font-medium"> Choose how you'd like to begin your journey.</span>
          </p>

          {/* Stats Section */}
        </div>

        {/* Enhanced Two Options Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Option 1: Take Quiz - Enhanced */}
          <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 hover:border-primary/50 hover:-translate-y-2 bg-gradient-to-br from-card to-card/50" 
                onClick={() => navigate('/career-assessment')}>
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardHeader className="text-center pb-6 relative z-10">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                <Brain className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold text-primary mb-3">Take Personality Quiz</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Answer 12 expertly designed questions to discover careers that perfectly match your unique personality and strengths
              </CardDescription>
            </CardHeader>
            
            <CardContent className="text-center relative z-10">
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <Zap className="w-5 h-5 mr-3 text-primary" />
                  <span className="font-medium">AI-powered personality analysis</span>
                </div>
                <div className="flex items-center justify-center text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <Target className="w-5 h-5 mr-3 text-primary" />
                  <span className="font-medium">Personalized career recommendations</span>
                </div>
                <div className="flex items-center justify-center text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <TrendingUp className="w-5 h-5 mr-3 text-primary" />
                  <span className="font-medium">Detailed career roadmaps & growth paths</span>
                </div>
              </div>
              
              <Button 
                variant="default" 
                size="lg" 
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary group-hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Start Your Journey
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
              </Button>
            </CardContent>
          </Card>

          {/* Option 2: Browse Careers - Enhanced */}
          <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 hover:border-secondary/50 hover:-translate-y-2 bg-gradient-to-br from-card to-card/50" 
                onClick={() => navigate('/browse-careers')}>
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardHeader className="text-center pb-6 relative z-10">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                <Search className="w-10 h-10 text-secondary" />
              </div>
              <CardTitle className="text-3xl font-bold text-primary mb-3">Browse Career Paths</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Explore our comprehensive database of 100+ careers and choose the ones that spark your interest and passion
              </CardDescription>
            </CardHeader>
            
            <CardContent className="text-center relative z-10">
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <Search className="w-5 h-5 mr-3 text-secondary" />
                  <span className="font-medium">Browse 100+ career options</span>
                </div>
                <div className="flex items-center justify-center text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <Target className="w-5 h-5 mr-3 text-secondary" />
                  <span className="font-medium">Filter by industry & interests</span>
                </div>
                <div className="flex items-center justify-center text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <Users className="w-5 h-5 mr-3 text-secondary" />
                  <span className="font-medium">Real industry insights & salary data</span>
                </div>
              </div>
              
              <Button 
                variant="secondary" 
                size="lg" 
                className="w-full h-14 text-lg font-semibold group-hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Explore Careers
                <Search className="ml-3 h-6 w-6 group-hover:scale-125 transition-transform duration-300" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action Section */}
        <div className="text-center mt-20">
          <p className="text-lg text-muted-foreground mb-6">
            Join thousands of professionals who found their perfect career match
          </p>
          <div className="flex justify-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: `${i * 200}ms` }}></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};