import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  getAllCareerPaths,
  createCareerPath,
  updateCareerPath,
  deleteCareerPath
} from '@/api/adminApi';
import { SKILL_CATALOG } from '@/data/skillsCatalog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Users, 
  Target, 
  Clock, 
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  Code2,
  BookOpen,
  Palette,
  DollarSign,
  TrendingUp as TrendingUpIcon,
  Settings,
  Plus as PlusIcon,
  Minus as MinusIcon
} from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface RequiredSkill {
  skillId: string;
  skillName: string;
  requiredLevel: number; // 1-5 scale
  importance: 'essential' | 'important' | 'nice-to-have';
}

interface CareerPath {
  id?: string;
  _id?: string; // Add _id field for MongoDB compatibility
  name: string;
  slug?: string;
  industry?: string;
  description?: string;
  requiredSkills: RequiredSkill[]; // Updated to use skill levels
  roadmap: string[];
  detailedRoadmap: RoadmapStep[];
  averageSalary?: string;
  jobGrowth?: string;
  // Personality data for unified system
  desiredRIASEC?: {
    R: number;
    I: number;
    A: number;
    S: number;
    E: number;
    C: number;
  };
  desiredBigFive?: {
    Openness: number;
    Conscientiousness: number;
    Extraversion: number;
    Agreeableness: number;
    Neuroticism: number;
  };
  workValues?: string[];
  isActive?: boolean;
  adminNotes?: string;
  updatedAt?: string;
}

interface RoadmapStep {
  id: string;
  title: string;
  description?: string;
  skills?: string[];
  estimatedTime?: string;
  xpReward?: number;
  resources?: Resource[];
  projects?: Project[];
}

interface Project {
  id: string;
  title: string;
  description?: string;
  difficulty?: string;
  estimatedTime?: string;
  skills?: string[];
  xpReward?: number;
  resources?: Resource[];
}

interface Resource {
  title: string;
  type: string;
  url: string;
  description?: string;
}

const emptyForm: CareerPath = {
  name: '',
  industry: 'Technology',
  description: '',
  requiredSkills: [],
  roadmap: [],
  detailedRoadmap: [],
  averageSalary: '',
  jobGrowth: '',
  desiredRIASEC: {
    R: 0.5, I: 0.5, A: 0.5, S: 0.5, E: 0.5, C: 0.5
  },
  desiredBigFive: {
    Openness: 0.5, Conscientiousness: 0.5, Extraversion: 0.5, Agreeableness: 0.5, Neuroticism: 0.5
  },
  workValues: ['Achievement', 'Independence', 'Working Conditions'],
  isActive: true
};

interface Resource {
  title: string;
  type: string;
  url: string;
  description?: string;
}

const emptyRoadmapStep: RoadmapStep = {
  id: '',
  title: '',
  description: '',
  skills: [],
  estimatedTime: '2-3 weeks',
  xpReward: 100,
  resources: [],
  projects: [],
};

const emptyProject: Project = {
  id: '',
  title: '',
  description: '',
  difficulty: 'Beginner',
  estimatedTime: '1 week',
  skills: [],
  xpReward: 50,
  resources: [],
};

// Helper to slugify a string
function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper to sanitize form data before sending to backend
function sanitizeCareerPath(form: CareerPath): any {
  const slug = slugify(form.name || '');
  return {
    ...form,
    name: form.name || '',
    slug,
    description: form.description || '',
    requiredSkills: Array.isArray(form.requiredSkills) ? form.requiredSkills : [],
    roadmap: Array.isArray(form.roadmap) ? form.roadmap : [],
    detailedRoadmap: Array.isArray(form.detailedRoadmap)
      ? form.detailedRoadmap.map((step, idx) => ({
          id: step.id || `step-${Date.now()}-${idx}`,
          title: step.title || '',
          description: step.description || '',
          skills: Array.isArray(step.skills) ? step.skills : [],
          estimatedTime: step.estimatedTime || '2-3 weeks',
          xpReward: typeof step.xpReward === 'number' ? step.xpReward : 100,
          projects: Array.isArray(step.projects)
            ? step.projects.map((proj, pIdx) => ({
                id: proj.id || `proj-${Date.now()}-${pIdx}`,
                title: proj.title || '',
                description: proj.description || '',
                difficulty: proj.difficulty || 'Beginner',
                estimatedTime: proj.estimatedTime || '1 week',
                skills: Array.isArray(proj.skills) ? proj.skills : [],
                xpReward: typeof proj.xpReward === 'number' ? proj.xpReward : 50,
                resources: Array.isArray(proj.resources)
                  ? proj.resources.map((res) => ({
                      title: res.title || '',
                      type: res.type || 'article',
                      url: res.url || '',
                      description: res.description || '',
                    }))
                  : [],
              }))
            : [],
          resources: Array.isArray(step.resources)
            ? step.resources.map((res) => ({
                title: res.title || '',
                type: res.type || 'article',
                url: res.url || '',
                description: res.description || '',
              }))
            : [],
        }))
      : [],
    averageSalary: form.averageSalary || '',
    jobGrowth: form.jobGrowth || '',
    desiredRIASEC: form.desiredRIASEC || {
      R: 0.5, I: 0.5, A: 0.5, S: 0.5, E: 0.5, C: 0.5
    },
    desiredBigFive: form.desiredBigFive || {
      Openness: 0.5, Conscientiousness: 0.5, Extraversion: 0.5, Agreeableness: 0.5, Neuroticism: 0.5
    },
    workValues: Array.isArray(form.workValues) ? form.workValues : ['Achievement', 'Independence', 'Working Conditions'],
    isActive: form.isActive !== undefined ? form.isActive : true
  };
}

const CareerPaths: React.FC = () => {
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CareerPath>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<number>(3);
  const [selectedSkillImportance, setSelectedSkillImportance] = useState<'essential' | 'important' | 'nice-to-have'>('important');
  const [newRoadmapStep, setNewRoadmapStep] = useState('');
  const [newWorkValue, setNewWorkValue] = useState('');

  // Fetch all career paths
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllCareerPaths();
      setCareerPaths(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load career paths');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open form for create or edit
  const openForm = (cp?: CareerPath) => {
    setForm(cp ? { ...cp } : emptyForm);
    // Use _id if id is null, or use the slug as a fallback
    const editingId = cp ? (cp.id || cp._id || cp.slug) : null;
    setEditingId(editingId);
    setShowForm(true);
  };

  // Handle form input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Load skills from catalog
  const loadSkills = () => {
    setSkillsLoading(true);
    try {
      // Convert skills catalog to the format we need
      const skillsData: Skill[] = SKILL_CATALOG.map((skillName, index) => ({
        id: skillName.toLowerCase().replace(/\s+/g, '-'),
        name: skillName,
        category: getSkillCategory(skillName)
      }));
      setSkills(skillsData);
    } catch (error) {
      console.error('Failed to load skills:', error);
      setSkills([]);
    } finally {
      setSkillsLoading(false);
    }
  };

  // Helper function to categorize skills
  const getSkillCategory = (skillName: string): string => {
    if (['Accessibility', 'Testing', 'Performance', 'DesignSystems', 'Architecture', 'UI'].includes(skillName)) {
      return 'Frontend/UI';
    } else if (['APIs', 'Caching', 'NoSQL', 'DistributedSystems', 'Security', 'Go', 'Observability', 'DevOps'].includes(skillName)) {
      return 'Backend/Dev';
    } else if (['Linux', 'Git', 'CI/CD', 'Docker', 'Kubernetes', 'Terraform', 'Monitoring', 'Networking', 'Scripting', 'SRE', 'IncidentResponse', 'CapacityPlanning', 'Automation', 'CostOptimization', 'MultiCloud', 'IAM', 'CloudSecurity', 'ChaosEngineering', 'CloudNetworking'].includes(skillName)) {
      return 'DevOps/Cloud';
    } else if (['DataViz', 'Statistics', 'Dashboards', 'Modeling', 'DBT', 'CloudData', 'ML', 'MLOps', 'Experimentation', 'DataPipelines', 'DeepLearning'].includes(skillName)) {
      return 'Data/Analytics';
    } else if (['SIEM', 'ThreatHunting', 'IR', 'ThreatModeling', 'VulnAssessment', 'WebSecurity', 'Exploitation', 'ADSecurity', 'Reporting', 'RedTeamOps', 'Evasion', 'ToolingDev', 'ThreatIntel', 'PurpleTeam', 'GRC'].includes(skillName)) {
      return 'Cybersecurity';
    } else if (['RoutingSwitching', 'Firewalls', 'SDWAN'].includes(skillName)) {
      return 'Networking';
    } else if (['BackupRecovery', 'PerformanceTuning', 'Governance'].includes(skillName)) {
      return 'Database';
    } else if (['TestCases', 'BugReporting', 'Selenium', 'API-Testing', 'Cypress', 'Strategy', 'PerformanceTesting', 'SecurityTesting'].includes(skillName)) {
      return 'QA/Testing';
    } else if (['CustomerService', 'Troubleshooting', 'Windows', 'MacOS', 'MDM', 'SLA', 'Virtualization'].includes(skillName)) {
      return 'IT Support';
    } else {
      return 'Other';
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  // Add required skill
  const addRequiredSkill = () => {
    if (selectedSkill && Array.isArray(skills) && !form.requiredSkills.find(rs => rs.skillId === selectedSkill)) {
      const skill = skills.find(s => s.id === selectedSkill);
      if (skill) {
        const newRequiredSkill: RequiredSkill = {
          skillId: selectedSkill,
          skillName: skill.name,
          requiredLevel: selectedSkillLevel,
          importance: selectedSkillImportance
        };
        setForm({ ...form, requiredSkills: [...form.requiredSkills, newRequiredSkill] });
        setSelectedSkill('');
        setSelectedSkillLevel(3);
        setSelectedSkillImportance('important');
      }
    }
  };

  // Remove required skill
  const removeRequiredSkill = (skillId: string) => {
    setForm({ ...form, requiredSkills: form.requiredSkills.filter(rs => rs.skillId !== skillId) });
  };

  // Add roadmap step
  const addRoadmapStep = () => {
    if (newRoadmapStep.trim()) {
      setForm({ ...form, roadmap: [...form.roadmap, newRoadmapStep.trim()] });
      setNewRoadmapStep('');
    }
  };

  // Remove roadmap step
  const removeRoadmapStep = (step: string) => {
    setForm({ ...form, roadmap: form.roadmap.filter(s => s !== step) });
  };

  // Add work value
  const addWorkValue = () => {
    if (newWorkValue.trim() && !form.workValues?.includes(newWorkValue.trim())) {
      setForm({ ...form, workValues: [...(form.workValues || []), newWorkValue.trim()] });
      setNewWorkValue('');
    }
  };

  // Remove work value
  const removeWorkValue = (value: string) => {
    setForm({ ...form, workValues: form.workValues?.filter(v => v !== value) || [] });
  };

  // Add detailed roadmap step
  const addDetailedStep = () => {
    const newStep = {
      ...emptyRoadmapStep,
      id: `step-${Date.now()}`,
      title: `Step ${form.detailedRoadmap.length + 1}`
    };
    setForm({ ...form, detailedRoadmap: [...form.detailedRoadmap, newStep] });
  };

  // Update detailed step
  const updateDetailedStep = (index: number, field: keyof RoadmapStep, value: any) => {
    const updatedSteps = [...form.detailedRoadmap];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setForm({ ...form, detailedRoadmap: updatedSteps });
  };

  // Remove detailed step
  const removeDetailedStep = (index: number) => {
    setForm({ ...form, detailedRoadmap: form.detailedRoadmap.filter((_, i) => i !== index) });
  };

  // Add project to step
  const addProjectToStep = (stepIndex: number) => {
    const newProject = {
      ...emptyProject,
      id: `proj-${Date.now()}`,
      title: `Project ${form.detailedRoadmap[stepIndex].projects?.length + 1}`
    };
    const updatedSteps = [...form.detailedRoadmap];
    updatedSteps[stepIndex].projects = [...(updatedSteps[stepIndex].projects || []), newProject];
    setForm({ ...form, detailedRoadmap: updatedSteps });
  };

  // Update project
  const updateProject = (stepIndex: number, projectIndex: number, field: keyof Project, value: any) => {
    const updatedSteps = [...form.detailedRoadmap];
    updatedSteps[stepIndex].projects![projectIndex] = { 
      ...updatedSteps[stepIndex].projects![projectIndex], 
      [field]: value 
    };
    setForm({ ...form, detailedRoadmap: updatedSteps });
  };

  // Remove project
  const removeProject = (stepIndex: number, projectIndex: number) => {
    const updatedSteps = [...form.detailedRoadmap];
    updatedSteps[stepIndex].projects = updatedSteps[stepIndex].projects?.filter((_, i) => i !== projectIndex);
    setForm({ ...form, detailedRoadmap: updatedSteps });
  };

  // Add resource to step
  const addResourceToStep = (stepIndex: number) => {
    const newResource = {
      title: `Material ${(form.detailedRoadmap[stepIndex].resources?.length || 0) + 1}`,
      type: 'article',
      url: '',
      description: ''
    };
    const updatedSteps = [...form.detailedRoadmap];
    updatedSteps[stepIndex].resources = [...(updatedSteps[stepIndex].resources || []), newResource];
    setForm({ ...form, detailedRoadmap: updatedSteps });
  };

  // Update resource
  const updateResource = (stepIndex: number, resourceIndex: number, field: keyof Resource, value: string) => {
    const updatedSteps = [...form.detailedRoadmap];
    updatedSteps[stepIndex].resources![resourceIndex] = { 
      ...updatedSteps[stepIndex].resources![resourceIndex], 
      [field]: value 
    };
    setForm({ ...form, detailedRoadmap: updatedSteps });
  };

  // Remove resource
  const removeResource = (stepIndex: number, resourceIndex: number) => {
    const updatedSteps = [...form.detailedRoadmap];
    updatedSteps[stepIndex].resources = updatedSteps[stepIndex].resources?.filter((_, i) => i !== resourceIndex);
    setForm({ ...form, detailedRoadmap: updatedSteps });
  };

  // Add resource to project
  const addResourceToProject = (stepIndex: number, projectIndex: number) => {
    const newResource = {
      title: `Material ${(form.detailedRoadmap[stepIndex].projects![projectIndex].resources?.length || 0) + 1}`,
      type: 'article',
      url: '',
      description: ''
    };
    const updatedSteps = [...form.detailedRoadmap];
    updatedSteps[stepIndex].projects![projectIndex].resources = [...(updatedSteps[stepIndex].projects![projectIndex].resources || []), newResource];
    setForm({ ...form, detailedRoadmap: updatedSteps });
  };

  // Update project resource
  const updateProjectResource = (stepIndex: number, projectIndex: number, resourceIndex: number, field: keyof Resource, value: string) => {
    const updatedSteps = [...form.detailedRoadmap];
    updatedSteps[stepIndex].projects![projectIndex].resources![resourceIndex] = { 
      ...updatedSteps[stepIndex].projects![projectIndex].resources![resourceIndex], 
      [field]: value 
    };
    setForm({ ...form, detailedRoadmap: updatedSteps });
  };

  // Remove project resource
  const removeProjectResource = (stepIndex: number, projectIndex: number, resourceIndex: number) => {
    const updatedSteps = [...form.detailedRoadmap];
    updatedSteps[stepIndex].projects![projectIndex].resources = updatedSteps[stepIndex].projects![projectIndex].resources?.filter((_, i) => i !== resourceIndex);
    setForm({ ...form, detailedRoadmap: updatedSteps });
  };

  // Submit create or edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const sanitizedData = sanitizeCareerPath(form);
      
      if (editingId) {
        // If editingId is a slug, we need to find the career first
        if (editingId.includes('-')) {
          // This looks like a slug, try to update by slug
          await updateCareerPath(editingId, sanitizedData);
        } else {
          // This looks like an ObjectId, update normally
          await updateCareerPath(editingId, sanitizedData);
        }
      } else {
        await createCareerPath(sanitizedData);
      }
      
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save career path');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this career path?')) return;
    
    setDeletingId(id);
    try {
      await deleteCareerPath(id);
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete career path');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading career paths...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Career Paths</h1>
          <p className="text-gray-600 mt-2">Manage career paths and learning journeys</p>
        </div>
        <Button onClick={() => openForm()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New Career Path
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Career Paths List */}
      {!showForm && (
        <div className="grid gap-6">
          {careerPaths.map((path) => (
            <Card key={path.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">{path.name}</h3>
                      <Badge variant={path.isActive ? "default" : "secondary"}>
                        {path.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{path.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Target className="w-4 h-4" />
                        <span>{path.industry || 'Technology'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Code2 className="w-4 h-4" />
                        <span>{path.requiredSkills?.length || 0} skills</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="w-4 h-4" />
                        <span>{path.detailedRoadmap?.length || 0} steps</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span>{path.detailedRoadmap?.reduce((total, step) => total + (step.resources?.length || 0), 0) || 0} materials</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>{path.averageSalary || 'Not set'}</span>
                      </div>
                    </div>

                    {path.requiredSkills && path.requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {path.requiredSkills.slice(0, 5).map((requiredSkill) => (
                          <Badge key={requiredSkill.skillId} variant="outline" className="text-xs">
                            {requiredSkill.skillName} (L{requiredSkill.requiredLevel})
                          </Badge>
                        ))}
                        {path.requiredSkills.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{path.requiredSkills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => openForm(path)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(path.id!)} 
                      disabled={deletingId === path.id}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      {deletingId === path.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {careerPaths.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No career paths yet</h3>
                <p className="text-gray-600 mb-4">Create your first career path to get started</p>
                <Button onClick={() => openForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Career Path
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{editingId ? 'Edit Career Path' : 'Create New Career Path'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Career Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g., Frontend Developer"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      name="industry"
                      value={form.industry}
                      onChange={handleChange}
                      placeholder="e.g., Technology"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe this career path..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="averageSalary">Average Salary</Label>
                    <Input
                      id="averageSalary"
                      name="averageSalary"
                      value={form.averageSalary}
                      onChange={handleChange}
                      placeholder="e.g., $80,000 - $130,000"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="jobGrowth">Job Growth</Label>
                    <Input
                      id="jobGrowth"
                      name="jobGrowth"
                      value={form.jobGrowth}
                      onChange={handleChange}
                      placeholder="e.g., 15%"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Required Skills */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Code2 className="w-5 h-5" />
                  Required Skills
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium">Select Skill</Label>
                    <select
                      value={selectedSkill}
                      onChange={(e) => setSelectedSkill(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      disabled={skillsLoading}
                    >
                      <option value="">
                        {skillsLoading ? 'Loading skills catalog...' : 'Choose a skill...'}
                      </option>
                      {Array.isArray(skills) && skills.length > 0 ? (
                        skills.map((skill) => (
                          <option key={skill.id} value={skill.id}>
                            {skill.name} ({skill.category})
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          {skillsLoading ? 'Loading...' : 'No skills available'}
                        </option>
                      )}
                    </select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Required Level</Label>
                    <select
                      value={selectedSkillLevel}
                      onChange={(e) => setSelectedSkillLevel(Number(e.target.value))}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value={1}>Level 1 - Beginner</option>
                      <option value={2}>Level 2 - Basic</option>
                      <option value={3}>Level 3 - Intermediate</option>
                      <option value={4}>Level 4 - Advanced</option>
                      <option value={5}>Level 5 - Expert</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Importance</Label>
                    <select
                      value={selectedSkillImportance}
                      onChange={(e) => setSelectedSkillImportance(e.target.value as 'essential' | 'important' | 'nice-to-have')}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="essential">Essential</option>
                      <option value="important">Important</option>
                      <option value="nice-to-have">Nice to Have</option>
                    </select>
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  onClick={addRequiredSkill} 
                  variant="outline" 
                  disabled={!selectedSkill || skillsLoading}
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  {skillsLoading ? 'Loading Catalog...' : 'Add Required Skill'}
                </Button>
                
                {form.requiredSkills.length > 0 && (
                  <div className="space-y-2">
                    {form.requiredSkills.map((requiredSkill) => (
                      <div key={requiredSkill.skillId} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={requiredSkill.importance === 'essential' ? 'destructive' : requiredSkill.importance === 'important' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {requiredSkill.importance}
                          </Badge>
                          <span className="font-medium">{requiredSkill.skillName}</span>
                          <Badge variant="outline" className="text-xs">
                            Level {requiredSkill.requiredLevel}
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRequiredSkill(requiredSkill.skillId)}
                        >
                          <MinusIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Personality Data */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Personality Preferences
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* RIASEC */}
                  <div>
                    <Label className="text-sm font-medium">RIASEC Preferences</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {Object.entries(form.desiredRIASEC || {}).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <Label className="text-xs text-gray-600">{key}</Label>
                          <Input
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            value={value}
                            onChange={(e) => setForm({
                              ...form,
                              desiredRIASEC: {
                                ...form.desiredRIASEC,
                                [key]: Number(e.target.value)
                              }
                            })}
                            className="h-8 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Big Five */}
                  <div>
                    <Label className="text-sm font-medium">Big Five Preferences</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {Object.entries(form.desiredBigFive || {}).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <Label className="text-xs text-gray-600">{key}</Label>
                          <Input
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            value={value}
                            onChange={(e) => setForm({
                              ...form,
                              desiredBigFive: {
                                ...form.desiredBigFive,
                                [key]: Number(e.target.value)
                              }
                            })}
                            className="h-8 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Work Values */}
                <div>
                  <Label className="text-sm font-medium">Work Values</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newWorkValue}
                      onChange={(e) => setNewWorkValue(e.target.value)}
                      placeholder="Add work value..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addWorkValue())}
                    />
                    <Button type="button" onClick={addWorkValue} variant="outline">
                      <PlusIcon className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {form.workValues && form.workValues.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.workValues.map((value) => (
                        <Badge key={value} variant="outline" className="flex items-center gap-1">
                          {value}
                          <button
                            type="button"
                            onClick={() => removeWorkValue(value)}
                            className="ml-1 hover:text-red-600"
                          >
                            <MinusIcon className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Basic Roadmap */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Basic Roadmap Steps
                </h3>
                
                <div className="flex gap-2">
                  <Input
                    value={newRoadmapStep}
                    onChange={(e) => setNewRoadmapStep(e.target.value)}
                    placeholder="Add a roadmap step..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRoadmapStep())}
                  />
                  <Button type="button" onClick={addRoadmapStep} variant="outline">
                    <PlusIcon className="w-4 h-4" />
                  </Button>
                </div>
                
                {form.roadmap.length > 0 && (
                  <div className="space-y-2">
                    {form.roadmap.map((step, index) => (
                      <div key={`roadmap-step-${index}`} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-600">{index + 1}.</span>
                        <span className="flex-1 text-sm">{step}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRoadmapStep(step)}
                        >
                          <MinusIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Detailed Roadmap */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUpIcon className="w-5 h-5" />
                    Detailed Learning Path
                  </h3>
                  <Button type="button" onClick={addDetailedStep} variant="outline">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Step
                  </Button>
                </div>
                
                {form.detailedRoadmap.length > 0 && (
                  <div className="space-y-6">
                    {form.detailedRoadmap.map((step, stepIndex) => (
                      <Card key={`detailed-step-${stepIndex}`} className="border-2">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <Input
                                value={step.title}
                                onChange={(e) => updateDetailedStep(stepIndex, 'title', e.target.value)}
                                placeholder="Step title"
                                className="text-lg font-semibold border-none p-0 h-auto"
                              />
                              <Textarea
                                value={step.description}
                                onChange={(e) => updateDetailedStep(stepIndex, 'description', e.target.value)}
                                placeholder="Step description"
                                className="mt-2 border-none p-0 resize-none"
                                rows={2}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDetailedStep(stepIndex)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Estimated Time</Label>
                              <Input
                                value={step.estimatedTime}
                                onChange={(e) => updateDetailedStep(stepIndex, 'estimatedTime', e.target.value)}
                                placeholder="e.g., 2-3 weeks"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">XP Reward</Label>
                              <Input
                                type="number"
                                value={step.xpReward}
                                onChange={(e) => updateDetailedStep(stepIndex, 'xpReward', Number(e.target.value))}
                                placeholder="100"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Skills</Label>
                              <Input
                                value={step.skills?.join(', ')}
                                onChange={(e) => updateDetailedStep(stepIndex, 'skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                placeholder="skill1, skill2, skill3"
                              />
                            </div>
                          </div>
                          
                          {/* Projects */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <Label className="text-sm font-medium">Projects</Label>
                              <Button
                                type="button"
                                onClick={() => addProjectToStep(stepIndex)}
                                variant="outline"
                                size="sm"
                              >
                                <PlusIcon className="w-4 h-4 mr-1" />
                                Add Project
                              </Button>
                            </div>
                            
                            {step.projects && step.projects.length > 0 && (
                              <div className="space-y-3">
                                {step.projects.map((project, projectIndex) => (
                                  <div key={`project-${stepIndex}-${projectIndex}`} className="p-3 bg-gray-50 rounded border">
                                    <div className="flex justify-between items-start mb-2">
                                      <Input
                                        value={project.title}
                                        onChange={(e) => updateProject(stepIndex, projectIndex, 'title', e.target.value)}
                                        placeholder="Project title"
                                        className="font-medium border-none p-0 h-auto"
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeProject(stepIndex, projectIndex)}
                                      >
                                        <MinusIcon className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    
                                    <Textarea
                                      value={project.description}
                                      onChange={(e) => updateProject(stepIndex, projectIndex, 'description', e.target.value)}
                                      placeholder="Project description"
                                      className="mb-2 border-none p-0 resize-none"
                                      rows={2}
                                    />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                      <Input
                                        value={project.difficulty}
                                        onChange={(e) => updateProject(stepIndex, projectIndex, 'difficulty', e.target.value)}
                                        placeholder="Difficulty"
                                      />
                                      <Input
                                        value={project.estimatedTime}
                                        onChange={(e) => updateProject(stepIndex, projectIndex, 'estimatedTime', e.target.value)}
                                        placeholder="Estimated time"
                                      />
                                      <Input
                                        type="number"
                                        value={project.xpReward}
                                        onChange={(e) => updateProject(stepIndex, projectIndex, 'xpReward', Number(e.target.value))}
                                        placeholder="XP reward"
                                      />
                                    </div>
                                    
                                    {/* Project Learning Materials */}
                                    <div className="mt-3">
                                      <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                          <FileText className="w-3 h-3 text-gray-500" />
                                          <Label className="text-xs font-medium text-gray-600">Project Materials</Label>
                                          <Badge variant="outline" className="text-xs">
                                            {project.resources?.length || 0}
                                          </Badge>
                                        </div>
                                        <Button
                                          type="button"
                                          onClick={() => addResourceToProject(stepIndex, projectIndex)}
                                          variant="outline"
                                          size="sm"
                                          className="h-6 text-xs bg-green-50 hover:bg-green-100 border-green-200"
                                        >
                                          <PlusIcon className="w-3 h-3 mr-1" />
                                          Add
                                        </Button>
                                      </div>
                                      
                                      {project.resources && project.resources.length > 0 && (
                                        <div className="space-y-2">
                                          {project.resources.map((resource, resourceIndex) => (
                                            <div key={`project-resource-${stepIndex}-${projectIndex}-${resourceIndex}`} className="p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded border border-green-200 text-xs">
                                              <div className="flex justify-between items-start mb-1">
                                                <Input
                                                  value={resource.title}
                                                  onChange={(e) => updateProjectResource(stepIndex, projectIndex, resourceIndex, 'title', e.target.value)}
                                                  placeholder="📚 Material title"
                                                  className="font-medium border-none p-0 h-auto text-xs bg-transparent"
                                                />
                                                <div className="flex items-center gap-1">
                                                  <Badge variant="secondary" className="text-xs">
                                                    {resource.type || 'article'}
                                                  </Badge>
                                                  <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeProjectResource(stepIndex, projectIndex, resourceIndex)}
                                                    className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
                                                  >
                                                    <Trash2 className="w-3 h-3" />
                                                  </Button>
                                                </div>
                                              </div>
                                              
                                              <div className="grid grid-cols-2 gap-1 mb-1">
                                                <select
                                                  value={resource.type}
                                                  onChange={(e) => updateProjectResource(stepIndex, projectIndex, resourceIndex, 'type', e.target.value)}
                                                  className="w-full p-1 text-xs border border-gray-200 rounded bg-white"
                                                >
                                                  <option value="video">🎥 Video</option>
                                                  <option value="article">📄 Article</option>
                                                  <option value="course">🎓 Course</option>
                                                  <option value="tutorial">📖 Tutorial</option>
                                                  <option value="documentation">📚 Docs</option>
                                                  <option value="tool">🛠️ Tool</option>
                                                  <option value="other">📌 Other</option>
                                                </select>
                                                <Input
                                                  value={resource.url}
                                                  onChange={(e) => updateProjectResource(stepIndex, projectIndex, resourceIndex, 'url', e.target.value)}
                                                  placeholder="URL"
                                                  className="text-xs"
                                                />
                                              </div>
                                              
                                              <Textarea
                                                value={resource.description}
                                                onChange={(e) => updateProjectResource(stepIndex, projectIndex, resourceIndex, 'description', e.target.value)}
                                                placeholder="Brief description..."
                                                className="border-gray-200 resize-none text-xs"
                                                rows={1}
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      
                                      {(!project.resources || project.resources.length === 0) && (
                                        <div className="text-center py-3 border border-dashed border-gray-200 rounded bg-gray-50">
                                          <p className="text-xs text-gray-500 mb-1">No project materials</p>
                                          <Button
                                            type="button"
                                            onClick={() => addResourceToProject(stepIndex, projectIndex)}
                                            variant="outline"
                                            size="sm"
                                            className="h-5 text-xs"
                                          >
                                            <PlusIcon className="w-3 h-3 mr-1" />
                                            Add Material
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Learning Materials */}
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-blue-600" />
                                <Label className="text-sm font-medium">Learning Materials</Label>
                                <Badge variant="outline" className="text-xs">
                                  {step.resources?.length || 0} materials
                                </Badge>
                              </div>
                              <Button
                                type="button"
                                onClick={() => addResourceToStep(stepIndex)}
                                variant="outline"
                                size="sm"
                                className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                              >
                                <PlusIcon className="w-4 h-4 mr-1" />
                                Add Material
                              </Button>
                            </div>
                            
                            {step.resources && step.resources.length > 0 && (
                              <div className="space-y-3">
                                {step.resources.map((resource, resourceIndex) => (
                                  <div key={`step-resource-${stepIndex}-${resourceIndex}`} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="flex-1">
                                        <Input
                                          value={resource.title}
                                          onChange={(e) => updateResource(stepIndex, resourceIndex, 'title', e.target.value)}
                                          placeholder="📚 Material title"
                                          className="font-semibold border-none p-0 h-auto bg-transparent text-gray-800"
                                        />
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs">
                                          {resource.type || 'article'}
                                        </Badge>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeResource(stepIndex, resourceIndex)}
                                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                      <div>
                                        <Label className="text-xs font-medium text-gray-600 mb-1 block">Type</Label>
                                        <select
                                          value={resource.type}
                                          onChange={(e) => updateResource(stepIndex, resourceIndex, 'type', e.target.value)}
                                          className="w-full p-2 text-sm border border-gray-200 rounded-md bg-white"
                                        >
                                          <option value="video">🎥 Video</option>
                                          <option value="article">📄 Article</option>
                                          <option value="course">🎓 Course</option>
                                          <option value="tutorial">📖 Tutorial</option>
                                          <option value="documentation">📚 Documentation</option>
                                          <option value="tool">🛠️ Tool</option>
                                          <option value="book">📖 Book</option>
                                          <option value="podcast">🎧 Podcast</option>
                                          <option value="workshop">🔧 Workshop</option>
                                          <option value="other">📌 Other</option>
                                        </select>
                                      </div>
                                      <div className="md:col-span-2">
                                        <Label className="text-xs font-medium text-gray-600 mb-1 block">URL</Label>
                                        <Input
                                          value={resource.url}
                                          onChange={(e) => updateResource(stepIndex, resourceIndex, 'url', e.target.value)}
                                          placeholder="https://example.com/resource"
                                          className="text-sm"
                                        />
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <Label className="text-xs font-medium text-gray-600 mb-1 block">Description</Label>
                                      <Textarea
                                        value={resource.description}
                                        onChange={(e) => updateResource(stepIndex, resourceIndex, 'description', e.target.value)}
                                        placeholder="Brief description of this learning material..."
                                        className="border-gray-200 resize-none text-sm"
                                        rows={2}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {(!step.resources || step.resources.length === 0) && (
                              <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                                <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500 mb-2">No learning materials added yet</p>
                                <Button
                                  type="button"
                                  onClick={() => addResourceToStep(stepIndex)}
                                  variant="outline"
                                  size="sm"
                                >
                                  <PlusIcon className="w-4 h-4 mr-1" />
                                  Add First Material
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                />
                <Label htmlFor="isActive">Active Career Path</Label>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingId ? 'Update Career Path' : 'Create Career Path'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CareerPaths;
