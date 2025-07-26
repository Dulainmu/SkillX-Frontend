import { Card, CardContent } from '@/components/ui/card';
import { Target, Brain, Map, Users } from 'lucide-react';

export const ContentSection = () => {
  const features = [
    {
      icon: Target,
      title: 'Personalized Recommendations',
      description: 'Get career suggestions based on your unique personality profile and interests.',
    },
    {
      icon: Brain,
      title: 'Interactive Quiz',
      description: 'Answer 12 carefully crafted questions designed by career experts.',
    },
    {
      icon: Map,
      title: 'Career Roadmaps',
      description: 'Receive detailed pathways showing how to reach your ideal career.',
    },
    {
      icon: Users,
      title: 'AI-Powered Matching',
      description: 'Our advanced algorithms analyze thousands of career profiles for accurate matches.',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Overview Text */}
        <div className="text-center mb-16">
          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-muted-foreground leading-relaxed">
              SkillX uses AI to match your personality and interests to career paths, 
              providing personalized roadmaps to help you achieve your professional goals.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-0 bg-gradient-card shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};