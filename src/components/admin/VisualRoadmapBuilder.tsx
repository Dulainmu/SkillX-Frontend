import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  GripVertical, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  BookOpen,
  Code2,
  FileText,
  Video,
  Link,
  Clock,
  Target,
  Star,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  type: 'step' | 'project';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: number; // in hours
  resources: Array<{
    type: 'video' | 'article' | 'document' | 'link';
    title: string;
    url: string;
  }>;
  prerequisites: string[];
  order: number;
  projects?: RoadmapProject[]; // Projects within this step
}

interface RoadmapProject {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: number; // in hours
  resources: Array<{
    type: 'video' | 'article' | 'document' | 'link';
    title: string;
    url: string;
  }>;
  requirements: string[];
  deliverables: string[];
  order: number;
}

interface NewStepData extends Omit<RoadmapStep, 'id' | 'order'> {
  newResource?: {
    type: 'video' | 'article' | 'document' | 'link';
    title: string;
    url: string;
  };
}

interface NewProjectData extends Omit<RoadmapProject, 'id' | 'order'> {
  newResource?: {
    type: 'video' | 'article' | 'document' | 'link';
    title: string;
    url: string;
  };
}

interface CareerPath {
  id: string;
  name: string;
  slug: string;
  description: string;
  skills: string[];
  averageSalary: number;
  jobGrowth: number;
  isActive: boolean;
  adminNotes?: string;
}

interface VisualRoadmapBuilderProps {
  careerId?: string; // Optional for new career paths
  initialSteps?: RoadmapStep[];
  initialCareerPath?: CareerPath;
  onSave: (careerPath: CareerPath, steps: RoadmapStep[]) => void;
  onCancel: () => void;
  isNewCareer?: boolean;
}

const VisualRoadmapBuilder: React.FC<VisualRoadmapBuilderProps> = ({
  careerId,
  initialSteps = [],
  initialCareerPath,
  onSave,
  onCancel,
  isNewCareer = false
}) => {
  const [steps, setSteps] = useState<RoadmapStep[]>(initialSteps);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<RoadmapStep | null>(null);
  const [newStep, setNewStep] = useState<NewStepData>({
    title: '',
    description: '',
    type: 'step',
    difficulty: 'Beginner',
    estimatedTime: 1,
    resources: [],
    prerequisites: [],
    newResource: { type: 'link', title: '', url: '' }
  });
  
  // Project management state
  const [selectedStepForProjects, setSelectedStepForProjects] = useState<RoadmapStep | null>(null);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<RoadmapProject | null>(null);
  const [newProject, setNewProject] = useState<NewProjectData>({
    title: '',
    description: '',
    difficulty: 'Beginner',
    estimatedTime: 1,
    resources: [],
    requirements: [],
    deliverables: [],
    newResource: { type: 'link', title: '', url: '' }
  });

  // Career path management state
  const [careerPath, setCareerPath] = useState<CareerPath>(initialCareerPath || {
    id: careerId || `career-${Date.now()}`,
    name: '',
    slug: '',
    description: '',
    skills: [],
    averageSalary: 0,
    jobGrowth: 0,
    isActive: true,
    adminNotes: ''
  });
  const [careerPathDialogOpen, setCareerPathDialogOpen] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  
  const { toast } = useToast();

  const handleDragStart = (e: React.DragEvent, stepId: string) => {
    setDraggedItem(stepId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStepId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetStepId) return;

    const draggedIndex = steps.findIndex(step => step.id === draggedItem);
    const targetIndex = steps.findIndex(step => step.id === targetStepId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newSteps = [...steps];
    const [draggedStep] = newSteps.splice(draggedIndex, 1);
    newSteps.splice(targetIndex, 0, draggedStep);

    // Update order numbers
    const updatedSteps = newSteps.map((step, index) => ({
      ...step,
      order: index + 1
    }));

    setSteps(updatedSteps);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const addStep = () => {
    const step: RoadmapStep = {
      id: `step-${Date.now()}`,
      title: newStep.title || 'New Step',
      description: newStep.description || '',
      type: newStep.type || 'step',
      difficulty: newStep.difficulty || 'Beginner',
      estimatedTime: newStep.estimatedTime || 1,
      resources: newStep.resources || [],
      prerequisites: newStep.prerequisites || [],
      projects: [],
      order: steps.length + 1
    };

    setSteps([...steps, step]);
    setNewStep({
      title: '',
      description: '',
      type: 'step',
      difficulty: 'Beginner',
      estimatedTime: 1,
      resources: [],
      prerequisites: [],
      newResource: { type: 'link', title: '', url: '' }
    });
  };

  // Project management functions
  const openProjectManager = (step: RoadmapStep) => {
    setSelectedStepForProjects(step);
    setProjectDialogOpen(true);
  };

  const addProject = () => {
    if (!selectedStepForProjects) return;

    const project: RoadmapProject = {
      id: `project-${Date.now()}`,
      title: newProject.title || 'New Project',
      description: newProject.description || '',
      difficulty: newProject.difficulty || 'Beginner',
      estimatedTime: newProject.estimatedTime || 1,
      resources: newProject.resources || [],
      requirements: newProject.requirements || [],
      deliverables: newProject.deliverables || [],
      order: (selectedStepForProjects.projects?.length || 0) + 1
    };

    const updatedSteps = steps.map(step => {
      if (step.id === selectedStepForProjects.id) {
        return {
          ...step,
          projects: [...(step.projects || []), project]
        };
      }
      return step;
    });

    setSteps(updatedSteps);
    setNewProject({
      title: '',
      description: '',
      difficulty: 'Beginner',
      estimatedTime: 1,
      resources: [],
      requirements: [],
      deliverables: [],
      newResource: { type: 'link', title: '', url: '' }
    });
  };

  const editProject = (project: RoadmapProject) => {
    setEditingProject(project);
  };

  const updateProject = (updatedProject: RoadmapProject) => {
    const updatedSteps = steps.map(step => {
      if (step.id === selectedStepForProjects?.id) {
        return {
          ...step,
          projects: step.projects?.map(project => 
            project.id === updatedProject.id ? updatedProject : project
          ) || []
        };
      }
      return step;
    });

    setSteps(updatedSteps);
    setEditingProject(null);
  };

  const deleteProject = (projectId: string) => {
    const updatedSteps = steps.map(step => {
      if (step.id === selectedStepForProjects?.id) {
        return {
          ...step,
          projects: step.projects?.filter(project => project.id !== projectId) || []
        };
      }
      return step;
    });

    setSteps(updatedSteps);
    toast({
      title: "Project deleted",
      description: "The project has been removed from the step",
    });
  };

  // Career path management functions
  const updateCareerPath = (updatedCareerPath: CareerPath) => {
    setCareerPath(updatedCareerPath);
    setCareerPathDialogOpen(false);
    toast({
      title: "Career path updated",
      description: "Career path details have been saved",
    });
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setCareerPath({
        ...careerPath,
        skills: [...careerPath.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillIndex: number) => {
    setCareerPath({
      ...careerPath,
      skills: careerPath.skills.filter((_, index) => index !== skillIndex)
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSave = () => {
    if (!careerPath.name.trim()) {
      toast({
        title: "Error",
        description: "Career path name is required",
        variant: "destructive"
      });
      return;
    }

    if (!careerPath.slug.trim()) {
      setCareerPath({
        ...careerPath,
        slug: generateSlug(careerPath.name)
      });
    }

    onSave(careerPath, steps);
  };

  const editStep = (step: RoadmapStep) => {
    setEditingStep(step);
    setEditDialogOpen(true);
  };

  const updateStep = (updatedStep: RoadmapStep) => {
    setSteps(steps.map(step => step.id === updatedStep.id ? updatedStep : step));
    setEditDialogOpen(false);
    setEditingStep(null);
  };

  const deleteStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId));
    toast({
      title: "Step deleted",
      description: "The step has been removed from the roadmap",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'project' ? <Code2 className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />;
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-red-500" />;
      case 'article': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'document': return <FileText className="w-4 h-4 text-green-500" />;
      case 'link': return <Link className="w-4 h-4 text-purple-500" />;
      default: return <Link className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isNewCareer ? 'Create New Career Path' : 'Visual Roadmap Builder'}
          </h2>
          <p className="text-gray-600">
            {isNewCareer 
              ? 'Create a new career path with detailed roadmap' 
              : 'Drag and drop to reorder steps and projects'
            }
          </p>
          {careerPath.name && (
            <p className="text-sm text-blue-600 font-medium mt-1">
              Career Path: {careerPath.name}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCareerPathDialogOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Career Settings
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            {isNewCareer ? 'Create Career Path' : 'Save Roadmap'}
          </Button>
        </div>
      </div>

      {/* Add New Step */}
      <Card className="border-2 border-dashed border-gray-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Step/Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newStep.title}
                onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
                placeholder="Enter step title"
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={newStep.type} onValueChange={(value) => setNewStep({ ...newStep, type: value as 'step' | 'project' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="step">Learning Step</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={newStep.difficulty} onValueChange={(value) => setNewStep({ ...newStep, difficulty: value as 'Beginner' | 'Intermediate' | 'Advanced' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newStep.description}
              onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
              placeholder="Enter step description"
              rows={2}
            />
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimated-time">Estimated Time (hours)</Label>
              <Input
                id="estimated-time"
                type="number"
                value={newStep.estimatedTime}
                onChange={(e) => setNewStep({ ...newStep, estimatedTime: parseInt(e.target.value) || 1 })}
                min="1"
                placeholder="1"
              />
            </div>
            <div>
              <Label>Resources ({newStep.resources?.length || 0})</Label>
              <div className="text-sm text-gray-500">
                {newStep.resources?.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {newStep.resources.map((resource, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {resource.type}: {resource.title}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  "No resources added yet"
                )}
              </div>
            </div>
          </div>
          
          {/* Resource Management Section */}
          <div className="mt-4">
            <Label className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              Add Resources
            </Label>
            <div className="space-y-2">
              {newStep.resources?.map((resource, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded bg-gray-50">
                  <div className="flex items-center gap-2 flex-1">
                    {getResourceIcon(resource.type)}
                    <span className="text-sm font-medium">{resource.title}</span>
                    <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setNewStep({
                      ...newStep,
                      resources: newStep.resources?.filter((_, i) => i !== index) || []
                    })}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Select 
                  value={newStep.newResource?.type || 'link'} 
                  onValueChange={(value) => setNewStep({
                    ...newStep,
                    newResource: { ...newStep.newResource, type: value as any }
                  })}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Resource title"
                  value={newStep.newResource?.title || ''}
                  onChange={(e) => setNewStep({
                    ...newStep,
                    newResource: { ...newStep.newResource, title: e.target.value }
                  })}
                  className="flex-1"
                />
                <Input
                  placeholder="URL"
                  value={newStep.newResource?.url || ''}
                  onChange={(e) => setNewStep({
                    ...newStep,
                    newResource: { ...newStep.newResource, url: e.target.value }
                  })}
                  className="flex-1"
                />
                <Button 
                  onClick={() => {
                    if (newStep.newResource?.title && newStep.newResource?.url) {
                      setNewStep({
                        ...newStep,
                        resources: [...(newStep.resources || []), newStep.newResource],
                        newResource: { type: 'link', title: '', url: '' }
                      });
                    }
                  }}
                  size="sm"
                  disabled={!newStep.newResource?.title || !newStep.newResource?.url}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button onClick={addStep} disabled={!newStep.title}>
              <Plus className="w-4 h-4 mr-2" />
              Add Step
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Roadmap Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            draggable
            onDragStart={(e) => handleDragStart(e, step.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, step.id)}
            onDragEnd={handleDragEnd}
            className={`p-4 border rounded-lg bg-white shadow-sm transition-all duration-200 ${
              draggedItem === step.id ? 'opacity-50 scale-95' : 'hover:shadow-md'
            } ${draggedItem && draggedItem !== step.id ? 'hover:border-blue-300' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                <div className="flex items-center gap-2">
                  {getTypeIcon(step.type)}
                  <span className="font-medium">{step.title}</span>
                  <Badge variant="outline" className={getDifficultyColor(step.difficulty)}>
                    {step.difficulty}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {step.estimatedTime}h
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => openProjectManager(step)}>
                  <Target className="w-4 h-4" />
                  Projects ({step.projects?.length || 0})
                </Button>
                <Button variant="outline" size="sm" onClick={() => editStep(step)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => deleteStep(step.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {step.description && (
              <p className="mt-2 text-sm text-gray-600 ml-8">{step.description}</p>
            )}
            {step.resources.length > 0 && (
              <div className="mt-2 ml-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Link className="w-4 h-4" />
                  {step.resources.length} resource{step.resources.length !== 1 ? 's' : ''}
                </div>
                <div className="flex flex-wrap gap-1">
                  {step.resources.map((resource, index) => (
                    <Badge key={index} variant="outline" className="text-xs flex items-center gap-1">
                      {getResourceIcon(resource.type)}
                      {resource.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Step Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Step</DialogTitle>
          </DialogHeader>
          {editingStep && (
            <EditStepForm
              step={editingStep}
              onSave={updateStep}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Project Management Dialog */}
      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Manage Projects - {selectedStepForProjects?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedStepForProjects && (
            <ProjectManager
              step={selectedStepForProjects}
              projects={selectedStepForProjects.projects || []}
              newProject={newProject}
              setNewProject={setNewProject}
              editingProject={editingProject}
              onAddProject={addProject}
              onEditProject={editProject}
              onUpdateProject={updateProject}
              onDeleteProject={deleteProject}
              onClose={() => setProjectDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Career Path Settings Dialog */}
      <Dialog open={careerPathDialogOpen} onOpenChange={setCareerPathDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Career Path Settings
            </DialogTitle>
          </DialogHeader>
          <CareerPathSettings
            careerPath={careerPath}
            newSkill={newSkill}
            setNewSkill={setNewSkill}
            onSave={updateCareerPath}
            onCancel={() => setCareerPathDialogOpen(false)}
            onAddSkill={addSkill}
            onRemoveSkill={removeSkill}
            generateSlug={generateSlug}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Edit Step Form Component
interface EditStepFormProps {
  step: RoadmapStep;
  onSave: (step: RoadmapStep) => void;
  onCancel: () => void;
}

const EditStepForm: React.FC<EditStepFormProps> = ({ step, onSave, onCancel }) => {
  const [formData, setFormData] = useState<RoadmapStep>(step);
  const [newResource, setNewResource] = useState({ type: 'link', title: '', url: '' });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-red-500" />;
      case 'article': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'document': return <FileText className="w-4 h-4 text-green-500" />;
      case 'link': return <Link className="w-4 h-4 text-purple-500" />;
      default: return <Link className="w-4 h-4 text-gray-500" />;
    }
  };

  const addResource = () => {
    if (newResource.title && newResource.url) {
      setFormData({
        ...formData,
        resources: [...formData.resources, newResource]
      });
      setNewResource({ type: 'link', title: '', url: '' });
    }
  };

  const removeResource = (index: number) => {
    setFormData({
      ...formData,
      resources: formData.resources.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-title">Title</Label>
          <Input
            id="edit-title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="edit-type">Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as 'step' | 'project' })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="step">Learning Step</SelectItem>
              <SelectItem value="project">Project</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="edit-description">Description</Label>
        <Textarea
          id="edit-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-difficulty">Difficulty</Label>
          <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value as 'Beginner' | 'Intermediate' | 'Advanced' })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="edit-time">Estimated Time (hours)</Label>
          <Input
            id="edit-time"
            type="number"
            value={formData.estimatedTime}
            onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) || 1 })}
            min="1"
          />
        </div>
      </div>

      {/* Resources Section */}
      <div>
        <Label className="flex items-center gap-2">
          <Link className="w-4 h-4" />
          Resources ({formData.resources.length})
        </Label>
        <div className="space-y-2">
          {formData.resources.map((resource, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border rounded bg-gray-50">
              <div className="flex items-center gap-2 flex-1">
                {getResourceIcon(resource.type)}
                <span className="text-sm font-medium">{resource.title}</span>
                <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  View
                </a>
              </div>
              <Button variant="outline" size="sm" onClick={() => removeResource(index)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Select value={newResource.type} onValueChange={(value) => setNewResource({ ...newResource, type: value as any })}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="article">Article</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="link">Link</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Resource title"
              value={newResource.title}
              onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
              className="flex-1"
            />
            <Input
              placeholder="URL"
              value={newResource.url}
              onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
              className="flex-1"
            />
            <Button 
              onClick={addResource} 
              size="sm"
              disabled={!newResource.title || !newResource.url}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

// Project Manager Component
interface ProjectManagerProps {
  step: RoadmapStep;
  projects: RoadmapProject[];
  newProject: NewProjectData;
  setNewProject: (project: NewProjectData) => void;
  editingProject: RoadmapProject | null;
  onAddProject: () => void;
  onEditProject: (project: RoadmapProject) => void;
  onUpdateProject: (project: RoadmapProject) => void;
  onDeleteProject: (projectId: string) => void;
  onClose: () => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({
  step,
  projects,
  newProject,
  setNewProject,
  editingProject,
  onAddProject,
  onEditProject,
  onUpdateProject,
  onDeleteProject,
  onClose
}) => {
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-red-500" />;
      case 'article': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'document': return <FileText className="w-4 h-4 text-green-500" />;
      case 'link': return <Link className="w-4 h-4 text-purple-500" />;
      default: return <Link className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Project */}
      <Card className="border-2 border-dashed border-blue-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Plus className="w-5 h-5" />
            Add New Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="project-title">Project Title</Label>
              <Input
                id="project-title"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                placeholder="Enter project title"
              />
            </div>
            <div>
              <Label htmlFor="project-difficulty">Difficulty</Label>
              <Select value={newProject.difficulty} onValueChange={(value) => setNewProject({ ...newProject, difficulty: value as 'Beginner' | 'Intermediate' | 'Advanced' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="project-time">Estimated Time (hours)</Label>
              <Input
                id="project-time"
                type="number"
                value={newProject.estimatedTime}
                onChange={(e) => setNewProject({ ...newProject, estimatedTime: parseInt(e.target.value) || 1 })}
                min="1"
                placeholder="1"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="Enter project description"
              rows={2}
            />
          </div>

          {/* Requirements and Deliverables */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Requirements</Label>
              <div className="space-y-2">
                {newProject.requirements?.map((req, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={req}
                      onChange={(e) => {
                        const updatedReqs = [...(newProject.requirements || [])];
                        updatedReqs[index] = e.target.value;
                        setNewProject({ ...newProject, requirements: updatedReqs });
                      }}
                      placeholder="Requirement"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updatedReqs = newProject.requirements?.filter((_, i) => i !== index) || [];
                        setNewProject({ ...newProject, requirements: updatedReqs });
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const updatedReqs = [...(newProject.requirements || []), ''];
                    setNewProject({ ...newProject, requirements: updatedReqs });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Requirement
                </Button>
              </div>
            </div>
            
            <div>
              <Label>Deliverables</Label>
              <div className="space-y-2">
                {newProject.deliverables?.map((del, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={del}
                      onChange={(e) => {
                        const updatedDels = [...(newProject.deliverables || [])];
                        updatedDels[index] = e.target.value;
                        setNewProject({ ...newProject, deliverables: updatedDels });
                      }}
                      placeholder="Deliverable"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updatedDels = newProject.deliverables?.filter((_, i) => i !== index) || [];
                        setNewProject({ ...newProject, deliverables: updatedDels });
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const updatedDels = [...(newProject.deliverables || []), ''];
                    setNewProject({ ...newProject, deliverables: updatedDels });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Deliverable
                </Button>
              </div>
            </div>
          </div>

          {/* Project Resources */}
          <div className="mt-4">
            <Label className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              Project Resources ({newProject.resources?.length || 0})
            </Label>
            <div className="space-y-2">
              {newProject.resources?.map((resource, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded bg-gray-50">
                  <div className="flex items-center gap-2 flex-1">
                    {getResourceIcon(resource.type)}
                    <span className="text-sm font-medium">{resource.title}</span>
                    <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setNewProject({
                      ...newProject,
                      resources: newProject.resources?.filter((_, i) => i !== index) || []
                    })}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Select 
                  value={newProject.newResource?.type || 'link'} 
                  onValueChange={(value) => setNewProject({
                    ...newProject,
                    newResource: { ...newProject.newResource, type: value as any }
                  })}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Resource title"
                  value={newProject.newResource?.title || ''}
                  onChange={(e) => setNewProject({
                    ...newProject,
                    newResource: { ...newProject.newResource, title: e.target.value }
                  })}
                  className="flex-1"
                />
                <Input
                  placeholder="URL"
                  value={newProject.newResource?.url || ''}
                  onChange={(e) => setNewProject({
                    ...newProject,
                    newResource: { ...newProject.newResource, url: e.target.value }
                  })}
                  className="flex-1"
                />
                <Button 
                  onClick={() => {
                    if (newProject.newResource?.title && newProject.newResource?.url) {
                      setNewProject({
                        ...newProject,
                        resources: [...(newProject.resources || []), newProject.newResource],
                        newResource: { type: 'link', title: '', url: '' }
                      });
                    }
                  }}
                  size="sm"
                  disabled={!newProject.newResource?.title || !newProject.newResource?.url}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button onClick={onAddProject} disabled={!newProject.title}>
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Projects ({projects.length})</h3>
        {projects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No projects added yet</p>
          </div>
        ) : (
          projects.map((project, index) => (
            <div key={project.id} className="p-4 border rounded-lg bg-white shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">{project.title}</span>
                    <Badge variant="outline" className={getDifficultyColor(project.difficulty)}>
                      {project.difficulty}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {project.estimatedTime}h
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEditProject(project)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDeleteProject(project.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {project.description && (
                <p className="mt-2 text-sm text-gray-600">{project.description}</p>
              )}
              
              {(project.requirements?.length > 0 || project.deliverables?.length > 0) && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.requirements?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Requirements:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {project.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {project.deliverables?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Deliverables:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {project.deliverables.map((del, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-500 mt-1">✓</span>
                            {del}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {project.resources.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Link className="w-4 h-4" />
                    {project.resources.length} resource{project.resources.length !== 1 ? 's' : ''}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {project.resources.map((resource, index) => (
                      <Badge key={index} variant="outline" className="text-xs flex items-center gap-1">
                        {getResourceIcon(resource.type)}
                        {resource.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Edit Project Dialog */}
      {editingProject && (
        <Dialog open={!!editingProject} onOpenChange={() => onUpdateProject(editingProject)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
            </DialogHeader>
            <EditProjectForm
              project={editingProject}
              onSave={onUpdateProject}
              onCancel={() => onEditProject(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};

// Edit Project Form Component
interface EditProjectFormProps {
  project: RoadmapProject;
  onSave: (project: RoadmapProject) => void;
  onCancel: () => void;
}

const EditProjectForm: React.FC<EditProjectFormProps> = ({ project, onSave, onCancel }) => {
  const [formData, setFormData] = useState<RoadmapProject>(project);
  const [newResource, setNewResource] = useState({ type: 'link', title: '', url: '' });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-red-500" />;
      case 'article': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'document': return <FileText className="w-4 h-4 text-green-500" />;
      case 'link': return <Link className="w-4 h-4 text-purple-500" />;
      default: return <Link className="w-4 h-4 text-gray-500" />;
    }
  };

  const addResource = () => {
    if (newResource.title && newResource.url) {
      setFormData({
        ...formData,
        resources: [...formData.resources, newResource]
      });
      setNewResource({ type: 'link', title: '', url: '' });
    }
  };

  const removeResource = (index: number) => {
    setFormData({
      ...formData,
      resources: formData.resources.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-project-title">Title</Label>
          <Input
            id="edit-project-title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="edit-project-difficulty">Difficulty</Label>
          <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value as 'Beginner' | 'Intermediate' | 'Advanced' })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="edit-project-description">Description</Label>
        <Textarea
          id="edit-project-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-project-time">Estimated Time (hours)</Label>
          <Input
            id="edit-project-time"
            type="number"
            value={formData.estimatedTime}
            onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) || 1 })}
            min="1"
          />
        </div>
      </div>

      {/* Requirements and Deliverables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Requirements</Label>
          <div className="space-y-2">
            {formData.requirements?.map((req, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={req}
                  onChange={(e) => {
                    const updatedReqs = [...(formData.requirements || [])];
                    updatedReqs[index] = e.target.value;
                    setFormData({ ...formData, requirements: updatedReqs });
                  }}
                  placeholder="Requirement"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const updatedReqs = formData.requirements?.filter((_, i) => i !== index) || [];
                    setFormData({ ...formData, requirements: updatedReqs });
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const updatedReqs = [...(formData.requirements || []), ''];
                setFormData({ ...formData, requirements: updatedReqs });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Requirement
            </Button>
          </div>
        </div>
        
        <div>
          <Label>Deliverables</Label>
          <div className="space-y-2">
            {formData.deliverables?.map((del, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={del}
                  onChange={(e) => {
                    const updatedDels = [...(formData.deliverables || [])];
                    updatedDels[index] = e.target.value;
                    setFormData({ ...formData, deliverables: updatedDels });
                  }}
                  placeholder="Deliverable"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const updatedDels = formData.deliverables?.filter((_, i) => i !== index) || [];
                    setFormData({ ...formData, deliverables: updatedDels });
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const updatedDels = [...(formData.deliverables || []), ''];
                setFormData({ ...formData, deliverables: updatedDels });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Deliverable
            </Button>
          </div>
        </div>
      </div>

      {/* Resources Section */}
      <div>
        <Label className="flex items-center gap-2">
          <Link className="w-4 h-4" />
          Resources ({formData.resources.length})
        </Label>
        <div className="space-y-2">
          {formData.resources.map((resource, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border rounded bg-gray-50">
              <div className="flex items-center gap-2 flex-1">
                {getResourceIcon(resource.type)}
                <span className="text-sm font-medium">{resource.title}</span>
                <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  View
                </a>
              </div>
              <Button variant="outline" size="sm" onClick={() => removeResource(index)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Select value={newResource.type} onValueChange={(value) => setNewResource({ ...newResource, type: value as any })}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="article">Article</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="link">Link</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Resource title"
              value={newResource.title}
              onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
              className="flex-1"
            />
            <Input
              placeholder="URL"
              value={newResource.url}
              onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
              className="flex-1"
            />
            <Button 
              onClick={addResource} 
              size="sm"
              disabled={!newResource.title || !newResource.url}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

// Career Path Settings Component
interface CareerPathSettingsProps {
  careerPath: CareerPath;
  newSkill: string;
  setNewSkill: (skill: string) => void;
  onSave: (careerPath: CareerPath) => void;
  onCancel: () => void;
  onAddSkill: () => void;
  onRemoveSkill: (index: number) => void;
  generateSlug: (name: string) => string;
}

const CareerPathSettings: React.FC<CareerPathSettingsProps> = ({
  careerPath,
  newSkill,
  setNewSkill,
  onSave,
  onCancel,
  onAddSkill,
  onRemoveSkill,
  generateSlug
}) => {
  const [formData, setFormData] = useState<CareerPath>(careerPath);

  const handleSave = () => {
    if (!formData.name.trim()) {
      return;
    }

    // Auto-generate slug if empty
    if (!formData.slug.trim()) {
      formData.slug = generateSlug(formData.name);
    }

    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="career-name">Career Path Name *</Label>
          <Input
            id="career-name"
            value={formData.name}
            onChange={(e) => {
              const name = e.target.value;
              setFormData({
                ...formData,
                name,
                slug: generateSlug(name)
              });
            }}
            placeholder="e.g., Full Stack Developer"
          />
        </div>
        <div>
          <Label htmlFor="career-slug">URL Slug</Label>
          <Input
            id="career-slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="full-stack-developer"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="career-description">Description</Label>
        <Textarea
          id="career-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe this career path..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="career-salary">Average Salary ($)</Label>
          <Input
            id="career-salary"
            type="number"
            value={formData.averageSalary}
            onChange={(e) => setFormData({ ...formData, averageSalary: parseInt(e.target.value) || 0 })}
            placeholder="75000"
          />
        </div>
        <div>
          <Label htmlFor="career-growth">Job Growth (%)</Label>
          <Input
            id="career-growth"
            type="number"
            value={formData.jobGrowth}
            onChange={(e) => setFormData({ ...formData, jobGrowth: parseInt(e.target.value) || 0 })}
            placeholder="15"
          />
        </div>
      </div>

      {/* Skills Management */}
      <div>
        <Label>Skills ({formData.skills.length})</Label>
        <div className="space-y-2">
          {formData.skills.map((skill, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border rounded bg-gray-50">
              <span className="text-sm font-medium flex-1">{skill}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemoveSkill(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onAddSkill();
                }
              }}
              className="flex-1"
            />
            <Button onClick={onAddSkill} size="sm" disabled={!newSkill.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="career-notes">Admin Notes</Label>
        <Textarea
          id="career-notes"
          value={formData.adminNotes || ''}
          onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
          placeholder="Internal notes about this career path..."
          rows={2}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="career-active"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="career-active">Active Career Path</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!formData.name.trim()}>
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default VisualRoadmapBuilder;
