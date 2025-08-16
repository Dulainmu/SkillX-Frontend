import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Save, 
  X, 
  Search,
  Filter,
  BarChart3,
  Users,
  Clock,
  Target,
  TrendingUp,
  BookOpen,
  Code2,
  Database,
  Shield,
  Network,
  Smartphone,
  Palette,
  Settings,
  Star,
  Award,
  Calendar,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getAllSkills, 
  createSkill, 
  updateSkill, 
  deleteSkill, 
  getSkillAnalytics,
  getSkillCategories,
  Skill,
  SkillCreateData,
  SkillProficiencyLevel,
  SKILL_CATEGORIES,
  SKILL_DIFFICULTIES,
  MARKET_DEMAND_LEVELS,
  getDifficultyInfo,
  getMarketDemandInfo
} from '@/api/skillApi';

interface SkillAnalytics {
  skill: {
    id: string;
    name: string;
    category: string;
    difficulty: string;
  };
  totalUsers: number;
  averageProgress: number;
  levelDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
  averageTimeSpent: number;
  averageXpEarned: number;
  completionRate: number;
}

// Proficiency Level Form Component
const ProficiencyLevelForm: React.FC<{
  skill: Skill;
  proficiencyLevels: SkillProficiencyLevel[];
  onSave: (levels: SkillProficiencyLevel[]) => void;
  onCancel: () => void;
}> = ({ skill, proficiencyLevels, onSave, onCancel }) => {
  const [levels, setLevels] = useState<SkillProficiencyLevel[]>(proficiencyLevels);
  const [editingLevel, setEditingLevel] = useState<SkillProficiencyLevel | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);

  const defaultLevel: SkillProficiencyLevel = {
    level: 'Beginner',
    title: '',
    description: '',
    expectations: [''],
    projects: [''],
    timeToAchieve: 0,
    prerequisites: [''],
    resources: [{
      type: 'course',
      title: '',
      url: '',
      description: '',
      difficulty: 'Beginner',
      estimatedTime: 0,
      isRequired: false
    }]
  };

  const addLevel = () => {
    const newLevel = { ...defaultLevel };
    setLevels([...levels, newLevel]);
    setEditingLevel(newLevel);
    setEditingIndex(levels.length);
  };

  const editLevel = (index: number) => {
    setEditingLevel(levels[index]);
    setEditingIndex(index);
  };

  const saveLevel = () => {
    if (editingLevel && editingIndex >= 0) {
      const newLevels = [...levels];
      newLevels[editingIndex] = editingLevel;
      setLevels(newLevels);
      setEditingLevel(null);
      setEditingIndex(-1);
    }
  };

  const deleteLevel = (index: number) => {
    const newLevels = levels.filter((_, i) => i !== index);
    setLevels(newLevels);
  };

  const handleLevelChange = (field: keyof SkillProficiencyLevel, value: any) => {
    if (editingLevel) {
      setEditingLevel({ ...editingLevel, [field]: value });
    }
  };

  const addArrayItem = (field: 'expectations' | 'projects' | 'prerequisites', value: string) => {
    if (editingLevel && value.trim()) {
      const newArray = [...editingLevel[field], value.trim()];
      setEditingLevel({ ...editingLevel, [field]: newArray });
    }
  };

  const removeArrayItem = (field: 'expectations' | 'projects' | 'prerequisites', index: number) => {
    if (editingLevel) {
      const newArray = editingLevel[field].filter((_, i) => i !== index);
      setEditingLevel({ ...editingLevel, [field]: newArray });
    }
  };

  const addResource = () => {
    if (editingLevel) {
      const newResource = {
        type: 'course',
        title: '',
        url: '',
        description: '',
        difficulty: 'Beginner',
        estimatedTime: 0,
        isRequired: false
      };
      setEditingLevel({
        ...editingLevel,
        resources: [...editingLevel.resources, newResource]
      });
    }
  };

  const updateResource = (index: number, field: string, value: any) => {
    if (editingLevel) {
      const newResources = [...editingLevel.resources];
      newResources[index] = { ...newResources[index], [field]: value };
      setEditingLevel({ ...editingLevel, resources: newResources });
    }
  };

  const removeResource = (index: number) => {
    if (editingLevel) {
      const newResources = editingLevel.resources.filter((_, i) => i !== index);
      setEditingLevel({ ...editingLevel, resources: newResources });
    }
  };

  return (
    <div className="space-y-6">
      {/* Level List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Proficiency Levels</h3>
          <Button onClick={addLevel} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Level
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {levels.map((level, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{level.level}</Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editLevel(index)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteLevel(index)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <h4 className="font-medium text-sm mb-1">{level.title || 'Untitled Level'}</h4>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{level.description}</p>
                <div className="text-xs text-gray-500">
                  <div>Time: {level.timeToAchieve}h</div>
                  <div>Expectations: {level.expectations.length}</div>
                  <div>Projects: {level.projects.length}</div>
                  <div>Resources: {level.resources.length}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Level Editor */}
      {editingLevel && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Level {editingIndex + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Level</Label>
                <Select value={editingLevel.level} onValueChange={(value) => handleLevelChange('level', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Time to Achieve (hours)</Label>
                <Input
                  type="number"
                  value={editingLevel.timeToAchieve}
                  onChange={(e) => handleLevelChange('timeToAchieve', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div>
              <Label>Title</Label>
              <Input
                value={editingLevel.title}
                onChange={(e) => handleLevelChange('title', e.target.value)}
                placeholder="e.g., React Fundamentals"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={editingLevel.description}
                onChange={(e) => handleLevelChange('description', e.target.value)}
                placeholder="Describe what this level covers..."
                rows={3}
              />
            </div>

            {/* Expectations */}
            <div>
              <Label>Expectations</Label>
              <div className="space-y-2">
                {editingLevel.expectations.map((exp, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={exp}
                      onChange={(e) => {
                        const newExpectations = [...editingLevel.expectations];
                        newExpectations[index] = e.target.value;
                        handleLevelChange('expectations', newExpectations);
                      }}
                      placeholder="What the user will be able to do..."
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('expectations', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newExpectations = [...editingLevel.expectations, ''];
                    handleLevelChange('expectations', newExpectations);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expectation
                </Button>
              </div>
            </div>

            {/* Projects */}
            <div>
              <Label>Suggested Projects</Label>
              <div className="space-y-2">
                {editingLevel.projects.map((project, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={project}
                      onChange={(e) => {
                        const newProjects = [...editingLevel.projects];
                        newProjects[index] = e.target.value;
                        handleLevelChange('projects', newProjects);
                      }}
                      placeholder="Project name..."
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('projects', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newProjects = [...editingLevel.projects, ''];
                    handleLevelChange('projects', newProjects);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </Button>
              </div>
            </div>

            {/* Prerequisites */}
            <div>
              <Label>Prerequisites</Label>
              <div className="space-y-2">
                {editingLevel.prerequisites.map((prereq, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={prereq}
                      onChange={(e) => {
                        const newPrerequisites = [...editingLevel.prerequisites];
                        newPrerequisites[index] = e.target.value;
                        handleLevelChange('prerequisites', newPrerequisites);
                      }}
                      placeholder="Prerequisite skill or knowledge..."
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('prerequisites', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPrerequisites = [...editingLevel.prerequisites, ''];
                    handleLevelChange('prerequisites', newPrerequisites);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Prerequisite
                </Button>
              </div>
            </div>

            {/* Resources */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Learning Resources</Label>
                <Button variant="outline" size="sm" onClick={addResource}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Resource
                </Button>
              </div>
              <div className="space-y-4">
                {editingLevel.resources.map((resource, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Type</Label>
                          <Select
                            value={resource.type}
                            onValueChange={(value) => updateResource(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="course">Course</SelectItem>
                              <SelectItem value="article">Article</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="documentation">Documentation</SelectItem>
                              <SelectItem value="project">Project</SelectItem>
                              <SelectItem value="quiz">Quiz</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={resource.title}
                            onChange={(e) => updateResource(index, 'title', e.target.value)}
                            placeholder="Resource title..."
                          />
                        </div>
                        <div>
                          <Label>URL</Label>
                          <Input
                            value={resource.url}
                            onChange={(e) => updateResource(index, 'url', e.target.value)}
                            placeholder="https://..."
                          />
                        </div>
                        <div>
                          <Label>Difficulty</Label>
                          <Select
                            value={resource.difficulty}
                            onValueChange={(value) => updateResource(index, 'difficulty', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                              <SelectItem value="Expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Estimated Time (hours)</Label>
                          <Input
                            type="number"
                            value={resource.estimatedTime}
                            onChange={(e) => updateResource(index, 'estimatedTime', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={resource.isRequired}
                            onChange={(e) => updateResource(index, 'isRequired', e.target.checked)}
                            className="rounded"
                          />
                          <Label>Required Resource</Label>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Label>Description</Label>
                        <Textarea
                          value={resource.description}
                          onChange={(e) => updateResource(index, 'description', e.target.value)}
                          placeholder="Brief description of the resource..."
                          rows={2}
                        />
                      </div>
                      <div className="mt-2 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeResource(index)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Resource
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setEditingLevel(null); setEditingIndex(-1); }}>
                Cancel
              </Button>
              <Button onClick={saveLevel}>
                <Save className="w-4 h-4 mr-2" />
                Save Level
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(levels)}>
          <Save className="w-4 h-4 mr-2" />
          Save All Levels
        </Button>
      </div>
    </div>
  );
};

const SkillManager: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [deletingSkill, setDeletingSkill] = useState<Skill | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [skillAnalytics, setSkillAnalytics] = useState<SkillAnalytics | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [demandFilter, setDemandFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Real-time controls
  const [isPaused, setIsPaused] = useState(false);
  
  // Proficiency levels
  const [showProficiencyForm, setShowProficiencyForm] = useState(false);
  const [editingProficiencyLevel, setEditingProficiencyLevel] = useState<SkillProficiencyLevel | null>(null);
  const [proficiencyLevels, setProficiencyLevels] = useState<SkillProficiencyLevel[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<Partial<SkillCreateData>>({
    name: '',
    description: '',
    category: '',
    difficulty: 'Beginner',
    estimatedTimeToLearn: 40,
    xpReward: 100,
    marketDemand: 'medium',
    averageSalary: undefined,
    jobGrowth: undefined,
    tags: [],
    keywords: [],
    status: 'draft',
    isPublic: true
  });

  // Fetch skills
  const fetchSkills = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {
        page: currentPage.toString(),
        limit: '20'
      };
      
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter && categoryFilter !== 'all') params.category = categoryFilter;
      if (difficultyFilter && difficultyFilter !== 'all') params.difficulty = difficultyFilter;
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;

      const data = await getAllSkills(params);
      
      setSkills(data.skills);
      setTotalPages(data.pagination.total);
      setTotalItems(data.pagination.totalItems);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const data = await getSkillCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  // Fetch skill analytics
  const fetchSkillAnalytics = async (skillId: string) => {
    try {
      const data = await getSkillAnalytics(skillId);
      setSkillAnalytics(data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load skill analytics",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchSkills();
    fetchCategories();
  }, [currentPage, searchTerm, categoryFilter, difficultyFilter, statusFilter, demandFilter]);

  // Open form for create or edit
  const openForm = (skill?: Skill) => {
    if (skill) {
      setFormData({
        name: skill.name,
        description: skill.description,
        category: skill.category,
        subcategory: skill.subcategory,
        difficulty: skill.difficulty,
        estimatedTimeToLearn: skill.estimatedTimeToLearn,
        xpReward: skill.xpReward,
        marketDemand: skill.marketDemand,
        averageSalary: skill.averageSalary,
        jobGrowth: skill.jobGrowth,
        tags: skill.tags,
        keywords: skill.keywords,
        status: skill.status,
        isPublic: skill.isPublic
      });
      setEditingSkill(skill);
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'frontend', // Set a default category instead of empty string
        difficulty: 'Beginner',
        estimatedTimeToLearn: 40,
        xpReward: 100,
        marketDemand: 'medium',
        averageSalary: undefined,
        jobGrowth: undefined,
        tags: [],
        keywords: [],
        status: 'draft',
        isPublic: true
      });
      setEditingSkill(null);
    }
    setShowForm(true);
  };

  // Handle form input
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingSkill) {
        await updateSkill(editingSkill._id, formData);
        toast({
          title: "Success",
          description: "Skill updated successfully",
        });
      } else {
        await createSkill(formData as SkillCreateData);
        toast({
          title: "Success",
          description: "Skill created successfully",
        });
      }
      
      setShowForm(false);
      setEditingSkill(null);
      fetchSkills();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to save skill',
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle skill deletion
  const handleDelete = async (skill: Skill) => {
    if (!window.confirm(`Are you sure you want to delete "${skill.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteSkill(skill._id);
      toast({
        title: "Success",
        description: "Skill deleted successfully",
      });
      fetchSkills();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to delete skill',
        variant: "destructive"
      });
    }
  };

  // View skill details
  const viewSkill = async (skill: Skill) => {
    setSelectedSkill(skill);
    await fetchSkillAnalytics(skill._id);
  };

  // Open proficiency level form
  const openProficiencyForm = (skill: Skill) => {
    setSelectedSkill(skill);
    setProficiencyLevels(skill.proficiencyLevels || []);
    setShowProficiencyForm(true);
  };

  // Handle proficiency level save
  const handleProficiencySave = async (levels: SkillProficiencyLevel[]) => {
    if (!selectedSkill) return;

    try {
      setSubmitting(true);
      await updateSkill(selectedSkill._id, {
        ...selectedSkill,
        proficiencyLevels: levels
      });
      
      toast({
        title: "Success",
        description: "Proficiency levels updated successfully",
      });
      
      setShowProficiencyForm(false);
      fetchSkills(); // Refresh the skills list
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to update proficiency levels',
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter skills
  const filteredSkills = skills.filter(skill => {
    if (searchTerm && !skill.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !skill.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (categoryFilter && categoryFilter !== 'all' && skill.category !== categoryFilter) return false;
    if (difficultyFilter && difficultyFilter !== 'all' && skill.difficulty !== difficultyFilter) return false;
    if (statusFilter && statusFilter !== 'all' && skill.status !== statusFilter) return false;
    if (demandFilter && demandFilter !== 'all' && skill.marketDemand !== demandFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading skills...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <div className="text-red-600">{error}</div>
        <Button onClick={fetchSkills} className="mt-4">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Skill Manager</h1>
          <p className="text-gray-600 mt-1">Manage skills, track progress, and analyze performance</p>
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
              {isPaused && <span className="ml-2 text-orange-600">(Paused)</span>}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsPaused(!isPaused)} 
            variant="outline"
            className={isPaused ? 'border-orange-300 text-orange-600' : 'border-green-300 text-green-600'}
          >
            {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
            {isPaused ? 'Resume' : 'Pause'} Live
          </Button>
          <Button onClick={fetchSkills} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => openForm()} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Skill
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {Object.keys(SKILL_CATEGORIES).map(category => (
                    <SelectItem key={category} value={category}>
                      {SKILL_CATEGORIES[category as keyof typeof SKILL_CATEGORIES].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All difficulties</SelectItem>
                  {SKILL_DIFFICULTIES.map(difficulty => (
                    <SelectItem key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {['draft', 'active', 'deprecated', 'archived'].map(status => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="demand">Market Demand</Label>
              <Select value={demandFilter} onValueChange={setDemandFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All demands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All demands</SelectItem>
                  {MARKET_DEMAND_LEVELS.map(demand => (
                    <SelectItem key={demand.value} value={demand.value}>
                      {demand.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Skills ({totalItems})</span>
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredSkills.map((skill) => (
                  <div
                    key={skill._id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{skill.name}</h3>
                          <Badge variant="outline" className={getDifficultyInfo(skill.difficulty).color}>
                            {skill.difficulty}
                          </Badge>
                          <Badge variant="outline" className={getMarketDemandInfo(skill.marketDemand).color}>
                            {skill.marketDemand} demand
                          </Badge>
                          <Badge variant={skill.status === 'active' ? 'default' : 'secondary'}>
                            {skill.status}
                          </Badge>
                          {skill.proficiencyLevels && skill.proficiencyLevels.length > 0 && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Target className="w-3 h-3 mr-1" />
                              {skill.proficiencyLevels.length} levels
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{skill.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {skill.totalUsers} users
                          </span>
                          {skill.estimatedTimeToLearn && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {skill.estimatedTimeToLearn}h
                            </span>
                          )}
                          {skill.averageSalary && (
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              ${skill.averageSalary.toLocaleString()}
                            </span>
                          )}
                          {skill.rating && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {skill.rating}/5 ({skill.reviewCount} reviews)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => viewSkill(skill)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openForm(skill)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(skill)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Skill Details Sidebar */}
        <div className="lg:col-span-1">
          {selectedSkill ? (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Skill Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedSkill.name}</h3>
                    <p className="text-sm text-gray-600">{selectedSkill.description}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Category:</span>
                      <Badge variant="outline">{selectedSkill.category}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Difficulty:</span>
                      <Badge className={getDifficultyInfo(selectedSkill.difficulty).color}>
                        {selectedSkill.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Market Demand:</span>
                      <Badge className={getMarketDemandInfo(selectedSkill.marketDemand).color}>
                        {selectedSkill.marketDemand}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge variant={selectedSkill.status === 'active' ? 'default' : 'secondary'}>
                        {selectedSkill.status}
                      </Badge>
                    </div>
                    {selectedSkill.proficiencyLevels && selectedSkill.proficiencyLevels.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Proficiency Levels:</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <Target className="w-3 h-3 mr-1" />
                          {selectedSkill.proficiencyLevels.length} levels
                        </Badge>
                      </div>
                    )}
                  </div>

                  {skillAnalytics && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Analytics</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="font-semibold text-blue-600">{skillAnalytics.totalUsers}</div>
                          <div className="text-xs text-gray-600">Total Users</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-semibold text-green-600">{skillAnalytics.averageProgress.toFixed(1)}%</div>
                          <div className="text-xs text-gray-600">Avg Progress</div>
                        </div>
                        <div className="text-center p-2 bg-yellow-50 rounded">
                          <div className="font-semibold text-yellow-600">{skillAnalytics.averageTimeSpent.toFixed(1)}h</div>
                          <div className="text-xs text-gray-600">Avg Time</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <div className="font-semibold text-purple-600">{skillAnalytics.completionRate.toFixed(1)}%</div>
                          <div className="text-xs text-gray-600">Completion</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-medium">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full" onClick={() => openForm(selectedSkill)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Skill
                      </Button>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => openProficiencyForm(selectedSkill)}>
                        <Target className="w-4 h-4 mr-2" />
                        Manage Proficiency Levels
                      </Button>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => fetchSkillAnalytics(selectedSkill._id)}>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Refresh Analytics
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Select a Skill</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Click on a skill to view details and analytics</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Skill Form Dialog */}
      {showForm && (
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSkill ? 'Edit Skill' : 'Create New Skill'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Skill Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="e.g., React.js"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleFormChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(SKILL_CATEGORIES).map(category => (
                        <SelectItem key={category} value={category}>
                          {SKILL_CATEGORIES[category as keyof typeof SKILL_CATEGORIES].name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Describe this skill..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty *</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => handleFormChange('difficulty', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SKILL_DIFFICULTIES.map(difficulty => (
                        <SelectItem key={difficulty.value} value={difficulty.value}>
                          {difficulty.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="estimatedTime">Estimated Time (hours)</Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    value={formData.estimatedTimeToLearn}
                    onChange={(e) => handleFormChange('estimatedTimeToLearn', parseInt(e.target.value) || undefined)}
                    placeholder="e.g., 40"
                  />
                </div>
                <div>
                  <Label htmlFor="xpReward">XP Reward</Label>
                  <Input
                    id="xpReward"
                    type="number"
                    value={formData.xpReward}
                    onChange={(e) => handleFormChange('xpReward', parseInt(e.target.value) || 100)}
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="marketDemand">Market Demand</Label>
                  <Select value={formData.marketDemand} onValueChange={(value) => handleFormChange('marketDemand', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MARKET_DEMAND_LEVELS.map(demand => (
                        <SelectItem key={demand.value} value={demand.value}>
                          {demand.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="averageSalary">Average Salary ($)</Label>
                  <Input
                    id="averageSalary"
                    type="number"
                    value={formData.averageSalary}
                    onChange={(e) => handleFormChange('averageSalary', parseInt(e.target.value) || undefined)}
                    placeholder="e.g., 75000"
                  />
                </div>
                <div>
                  <Label htmlFor="jobGrowth">Job Growth (%)</Label>
                  <Input
                    id="jobGrowth"
                    type="number"
                    value={formData.jobGrowth}
                    onChange={(e) => handleFormChange('jobGrowth', parseInt(e.target.value) || undefined)}
                    placeholder="e.g., 15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleFormChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['draft', 'active', 'deprecated', 'archived'].map(status => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => handleFormChange('isPublic', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="isPublic">Public Skill</Label>
                </div>
              </div>



              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  <Save className="w-4 h-4 mr-2" />
                  {submitting ? 'Saving...' : (editingSkill ? 'Update Skill' : 'Create Skill')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Proficiency Level Form Dialog */}
      {showProficiencyForm && (
        <Dialog open={showProficiencyForm} onOpenChange={setShowProficiencyForm}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Manage Proficiency Levels - {selectedSkill?.name}
              </DialogTitle>
            </DialogHeader>
            <ProficiencyLevelForm
              skill={selectedSkill!}
              proficiencyLevels={proficiencyLevels}
              onSave={handleProficiencySave}
              onCancel={() => setShowProficiencyForm(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SkillManager;
