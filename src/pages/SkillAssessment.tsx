import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Target, 
  Clock, 
  Star,
  Award,
  BookOpen,
  Zap,
  CheckCircle,
  Circle
} from 'lucide-react';
import { SkillLevelProgress } from '@/components/SkillLevelProgress';
import { SkillProficiencyModal } from '@/components/SkillProficiencyModal';
import { searchSkills, getSkillCategories } from '@/api/skillApi';

interface SkillProficiencyLevel {
  level: string;
  title: string;
  description: string;
  expectations: string[];
  projects: string[];
  timeToAchieve: number;
  prerequisites: string[];
  resources: any[];
}

interface Skill {
  _id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  difficulty: string;
  marketDemand: string;
  averageSalary?: number;
  jobGrowth?: number;
  tags: string[];
  keywords: string[];
  proficiencyLevels?: SkillProficiencyLevel[];
}

interface SkillCategory {
  name: string;
  count: number;
}

export const SkillAssessment: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSkillForDetails, setSelectedSkillForDetails] = useState<Skill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [skillsData, categoriesData] = await Promise.all([
          searchSkills({ limit: '100' }),
          getSkillCategories()
        ]);
        setSkills(skillsData || []);
        setCategories(categoriesData || []);
      } catch (err) {
        setError('Failed to load skills');
        console.error('Error fetching skills:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const skillsWithProficiency = filteredSkills.filter(skill => skill.proficiencyLevels && skill.proficiencyLevels.length > 0);
  const skillsWithoutProficiency = filteredSkills.filter(skill => !skill.proficiencyLevels || skill.proficiencyLevels.length === 0);

  const handleSkillLevelChange = (skillName: string, level: number) => {
    setSelectedSkills(prev => ({
      ...prev,
      [skillName]: level
    }));
  };

  const getSelectedSkillsCount = () => Object.keys(selectedSkills).length;
  const getAverageSkillLevel = () => {
    const levels = Object.values(selectedSkills);
    return levels.length > 0 ? Math.round(levels.reduce((a, b) => a + b, 0) / levels.length) : 0;
  };
  const getTotalTimeToLearn = () => {
    return Object.entries(selectedSkills).reduce((total, [skillName, level]) => {
      const skill = skills.find(s => s.name === skillName);
      if (skill?.proficiencyLevels && skill.proficiencyLevels[level - 1]) {
        return total + skill.proficiencyLevels[level - 1].timeToAchieve;
      }
      return total;
    }, 0);
  };

  const getCompletionPercentage = () => {
    const totalSkills = skillsWithProficiency.length;
    return totalSkills > 0 ? Math.round((getSelectedSkillsCount() / totalSkills) * 100) : 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading skills...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <Target className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">{getSelectedSkillsCount()}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              Skill Proficiency Assessment
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Evaluate your technical skills with detailed proficiency levels, learning paths, and personalized recommendations
            </p>
          </div>

          {/* Progress Overview */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{getSelectedSkillsCount()}</div>
                <div className="text-sm text-gray-500 font-medium">Skills Selected</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{getAverageSkillLevel()}</div>
                <div className="text-sm text-gray-500 font-medium">Avg. Level</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{getCompletionPercentage()}%</div>
                <div className="text-sm text-gray-500 font-medium">Completion</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{getTotalTimeToLearn()}</div>
                <div className="text-sm text-gray-500 font-medium">Hours to Learn</div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Assessment Progress</span>
                <span>{getCompletionPercentage()}%</span>
              </div>
              <Progress value={getCompletionPercentage()} className="h-3" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.name} value={category.name}>
                    {category.name} ({category.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>{filteredSkills.length} skills found</span>
            </div>
          </div>
        </div>

        {/* Skills with Proficiency Levels */}
        {skillsWithProficiency.length > 0 && (
          <div className="space-y-6 mb-8">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Skills with Detailed Proficiency Levels
              </h2>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {skillsWithProficiency.length} skills
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {skillsWithProficiency.map((skill) => (
                <SkillLevelProgress
                  key={skill._id}
                  skillName={skill.name}
                  currentLevel={selectedSkills[skill.name] || 0}
                  proficiencyLevels={skill.proficiencyLevels || []}
                  onLevelChange={(level) => handleSkillLevelChange(skill.name, level)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Skills without Proficiency Levels */}
        {skillsWithoutProficiency.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Circle className="w-6 h-6 text-gray-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Other Skills
              </h2>
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                {skillsWithoutProficiency.length} skills
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skillsWithoutProficiency.map((skill) => (
                <Card key={skill._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{skill.name}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          skill.marketDemand === 'very-high' ? 'bg-red-50 text-red-700 border-red-200' :
                          skill.marketDemand === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {skill.marketDemand}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{skill.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{skill.category}</span>
                      <span>{skill.difficulty}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Skill Proficiency Modal */}
        {selectedSkillForDetails && (
          <SkillProficiencyModal
            isOpen={!!selectedSkillForDetails}
            onClose={() => setSelectedSkillForDetails(null)}
            skillName={selectedSkillForDetails.name}
            proficiencyLevels={selectedSkillForDetails.proficiencyLevels || []}
          />
        )}
      </div>
    </div>
  );
};
