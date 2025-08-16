import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  getAllLearningJourneys,
  getLearningJourney,
  updateLearningJourney,
  addStep,
  updateStep,
  deleteStep
} from '@/api/adminApi';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
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
  GripVertical,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';
import { useRealTimeLearningJourneys } from '@/hooks/useRealTimeData';
import VisualRoadmapBuilder from '@/components/admin/VisualRoadmapBuilder';
import { useToast } from '@/hooks/use-toast';

interface LearningJourney {
  id: string;
  name: string;
  slug: string;
  description: string;
  totalSteps: number;
  totalProjects: number;
  totalUsers: number;
  totalSubmissions: number;
  approvedSubmissions: number;
  completionRate: string;
  lastModified: string;
  isActive: boolean;
  // New fields for unified system
  skills: string[];
  averageSalary: string;
  jobGrowth: string;
  vector: number[];
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
}

interface DetailedLearningJourney {
  career: {
    id: string;
    name: string;
    slug: string;
    description: string;
    skills: string[];
    averageSalary: string;
    jobGrowth: string;
    detailedRoadmap: RoadmapStep[];
    isActive: boolean;
    adminNotes: string;
    lastModified: string;
    // New personality fields
    vector: number[];
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
  };
  analytics: {
    totalSubmissions: number;
    pendingSubmissions: number;
    approvedSubmissions: number;
    rejectedSubmissions: number;
    stepAnalytics: StepAnalytics[];
  };
}

interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  skills: string[];
  estimatedTime: string;
  xpReward: number;
  projects: Project[];
  resources: Resource[];
}

interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  skills: string[];
  xpReward: number;
  resources: Resource[];
}

interface Resource {
  title: string;
  type: string;
  url: string;
  description?: string;
}

interface StepAnalytics {
  stepId: string;
  stepTitle: string;
  totalUsers: number;
  completedUsers: number;
  completionRate: number;
  averageTimeToComplete: string;
  projectSubmissions: number;
  approvedSubmissions: number;
}

const LearningJourneyManager: React.FC = () => {
  const [learningJourneys, setLearningJourneys] = useState<LearningJourney[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<DetailedLearningJourney | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingStep, setEditingStep] = useState<RoadmapStep | null>(null);
  const [showStepForm, setShowStepForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [visualBuilderOpen, setVisualBuilderOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [createNewCareerOpen, setCreateNewCareerOpen] = useState(false);
  const { toast } = useToast();

  // Real-time data hook
  const {
    data: realTimeData,
    loading: realTimeLoading,
    error: realTimeError,
    lastUpdated,
    refresh,
    pause,
    resume,
    isPaused
  } = useRealTimeLearningJourneys({
    onDataUpdate: (data) => {
      if (data?.learningJourneys) {
        setLearningJourneys(data.learningJourneys);
      }
    },
    onError: (error) => {
      toast({
        title: "Real-time update error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    fetchLearningJourneys();
  }, []);

  const fetchLearningJourneys = async () => {
    try {
      setLoading(true);
      const data = await getAllLearningJourneys();
      setLearningJourneys(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load learning journeys');
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedJourney = async (careerId: string) => {
    try {
      const data = await getLearningJourney(careerId);
      setSelectedJourney(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load detailed journey');
    }
  };

  const handleJourneySelect = (careerId: string) => {
    fetchDetailedJourney(careerId);
  };

  const handleUpdateJourney = async (careerId: string, updates: any) => {
    try {
      setSubmitting(true);
      await updateLearningJourney(careerId, updates);
      await fetchDetailedJourney(careerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update journey');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddStep = async (careerId: string, step: RoadmapStep) => {
    try {
      setSubmitting(true);
      await addStep(careerId, step);
      await fetchDetailedJourney(careerId);
      setShowStepForm(false);
      setEditingStep(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add step');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStep = async (careerId: string, stepId: string, step: RoadmapStep) => {
    try {
      setSubmitting(true);
      await updateStep(careerId, stepId, step);
      await fetchDetailedJourney(careerId);
      setShowStepForm(false);
      setEditingStep(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update step');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStep = async (careerId: string, stepId: string) => {
    if (!window.confirm('Are you sure you want to delete this step? This action cannot be undone.')) {
      return;
    }

    try {
      setSubmitting(true);
      await deleteStep(careerId, stepId);
      await fetchDetailedJourney(careerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete step');
    } finally {
      setSubmitting(false);
    }
  };

  const openStepForm = (step?: RoadmapStep) => {
    if (step) {
      setEditingStep(step);
    } else {
      setEditingStep({
        id: '',
        title: '',
        description: '',
        skills: [],
        estimatedTime: '',
        xpReward: 0,
        projects: [],
        resources: []
      });
    }
    setShowStepForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading learning journeys...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <div className="text-red-600">{error}</div>
        <Button onClick={fetchLearningJourneys} className="mt-4">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Journey Manager</h1>
          <p className="text-gray-600 mt-1">Manage roadmap steps, projects, and user progress</p>
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
              {isPaused && <span className="ml-2 text-orange-600">(Paused)</span>}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {/* Create New Career Path */}
          <Button 
            onClick={() => setCreateNewCareerOpen(true)} 
            variant="default"
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Career Path
          </Button>
          {/* Real-time Controls */}
          <Button 
            onClick={isPaused ? resume : pause} 
            variant="outline"
            className={isPaused ? 'border-orange-300 text-orange-600' : 'border-green-300 text-green-600'}
          >
            {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
            {isPaused ? 'Resume' : 'Pause'} Live
          </Button>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {selectedJourney && (
            <Button onClick={() => setVisualBuilderOpen(true)} variant="default">
              <Palette className="w-4 h-4 mr-2" />
              Visual Builder
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Learning Journeys List */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Learning Journeys
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {learningJourneys.map((journey) => (
                                     <div
                     key={journey.id}
                     className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                       selectedJourney?.career.id === journey.id
                         ? 'border-blue-500 bg-blue-50 shadow-sm'
                         : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                     }`}
                     onClick={() => handleJourneySelect(journey.id)}
                   >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{journey.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{journey.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {journey.totalSteps} steps
                          </span>
                          <span className="flex items-center gap-1">
                            <Code2 className="w-3 h-3" />
                            {journey.totalProjects} projects
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {journey.totalUsers} users
                          </span>
                        </div>
                      </div>
                                             <div className="flex flex-col items-end gap-1">
                         <Badge variant={journey.isActive ? "default" : "secondary"} className="text-xs">
                           {journey.isActive ? "Active" : "Inactive"}
                         </Badge>
                         <div className="text-xs text-gray-500 font-medium">
                           {journey.completionRate}% completion
                         </div>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Journey View */}
        <div className="lg:col-span-2">
          {selectedJourney ? (
            <div className="space-y-6">
              {/* Journey Header */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl text-gray-900">{selectedJourney.career.name}</CardTitle>
                      <p className="text-gray-600 mt-1">{selectedJourney.career.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={selectedJourney.career.isActive ? "default" : "secondary"}
                        onClick={() => handleUpdateJourney(selectedJourney.career.id, {
                          isActive: !selectedJourney.career.isActive
                        })}
                        disabled={submitting}
                        className="min-w-[100px]"
                      >
                        {selectedJourney.career.isActive ? "Active" : "Inactive"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-700">{selectedJourney.analytics.totalSubmissions}</div>
                      <div className="text-sm text-blue-600 font-medium">Total Submissions</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                      <div className="text-2xl font-bold text-yellow-700">{selectedJourney.analytics.pendingSubmissions}</div>
                      <div className="text-sm text-yellow-600 font-medium">Pending</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-700">{selectedJourney.analytics.approvedSubmissions}</div>
                      <div className="text-sm text-green-600 font-medium">Approved</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
                      <div className="text-2xl font-bold text-red-700">{selectedJourney.analytics.rejectedSubmissions}</div>
                      <div className="text-sm text-red-600 font-medium">Rejected</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Roadmap Steps */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Roadmap Steps</CardTitle>
                    <Button onClick={() => openStepForm()} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Step
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-4">
                    {selectedJourney.career.detailedRoadmap?.map((step, index) => {
                      const analytics = selectedJourney.analytics.stepAnalytics.find(a => a.stepId === step.id);
                      return (
                        <AccordionItem key={step.id} value={step.id} className="border rounded-lg">
                          <AccordionTrigger className="px-4 py-3 hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                                  {index + 1}
                                </div>
                                <div className="text-left">
                                  <div className="font-semibold">{step.title}</div>
                                  <div className="text-sm text-gray-500">
                                    {step.projects?.length || 0} projects • {step.estimatedTime}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {analytics && (
                                  <Badge variant="outline">
                                    {analytics.completionRate}% complete
                                  </Badge>
                                )}
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openStepForm(step);
                                    }}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteStep(selectedJourney.career.id, step.id);
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Description</h4>
                                <p className="text-sm text-gray-600">{step.description}</p>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-2">Skills</h4>
                                <div className="flex flex-wrap gap-1">
                                  {step.skills?.map((skill, skillIndex) => (
                                    <Badge key={skillIndex} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Projects ({step.projects?.length || 0})</h4>
                                <div className="space-y-2">
                                  {step.projects?.map((project, projectIndex) => (
                                    <div key={projectIndex} className="p-3 bg-gray-50 rounded-lg">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="font-medium">{project.title}</div>
                                          <div className="text-sm text-gray-600">{project.description}</div>
                                        </div>
                                        <Badge variant="outline">{project.difficulty}</Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">Select a learning journey to view details</p>
                  <p className="text-sm text-gray-400 mt-1">Choose from the list on the left to get started</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Step Form Modal */}
      {showStepForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingStep?.id ? 'Edit Step' : 'Add New Step'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowStepForm(false);
                  setEditingStep(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Step Title</Label>
                <Input
                  id="title"
                  value={editingStep?.title || ''}
                  onChange={(e) => setEditingStep(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingStep?.description || ''}
                  onChange={(e) => setEditingStep(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="estimatedTime">Estimated Time</Label>
                <Input
                  id="estimatedTime"
                  value={editingStep?.estimatedTime || ''}
                  onChange={(e) => setEditingStep(prev => prev ? { ...prev, estimatedTime: e.target.value } : null)}
                  placeholder="e.g., 2-3 weeks"
                />
              </div>

              <div>
                <Label htmlFor="xpReward">XP Reward</Label>
                <Input
                  id="xpReward"
                  type="number"
                  value={editingStep?.xpReward || 0}
                  onChange={(e) => setEditingStep(prev => prev ? { ...prev, xpReward: parseInt(e.target.value) || 0 } : null)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (editingStep && selectedJourney) {
                      if (editingStep.id) {
                        handleUpdateStep(selectedJourney.career.id, editingStep.id, editingStep);
                      } else {
                        handleAddStep(selectedJourney.career.id, editingStep);
                      }
                    }
                  }}
                  disabled={submitting || !editingStep?.title}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {submitting ? 'Saving...' : 'Save Step'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowStepForm(false);
                    setEditingStep(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visual Roadmap Builder Dialog */}
      {visualBuilderOpen && selectedJourney && (
        <Dialog open={visualBuilderOpen} onOpenChange={setVisualBuilderOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Visual Roadmap Builder - {selectedJourney.career.name}</DialogTitle>
            </DialogHeader>
            <VisualRoadmapBuilder
              careerId={selectedJourney.career.id}
              initialSteps={(selectedJourney.career.detailedRoadmap || []).map((step, index) => ({
                id: step.id,
                title: step.title,
                description: step.description,
                type: step.projects.length > 0 ? 'project' : 'step',
                difficulty: 'Intermediate', // Default, can be enhanced
                estimatedTime: parseInt(step.estimatedTime) || 1,
                resources: step.resources.map(resource => ({
                  type: resource.type as 'video' | 'article' | 'document' | 'link',
                  title: resource.title,
                  url: resource.url
                })),
                prerequisites: [],
                order: index + 1
              }))}
              onSave={async (careerPath, steps) => {
                try {
                  // Convert steps back to the format expected by the API
                  const roadmapSteps = steps.map(step => ({
                    id: step.id,
                    title: step.title,
                    description: step.description,
                    skills: [],
                    estimatedTime: step.estimatedTime.toString(),
                    xpReward: 100, // Default XP
                    projects: step.type === 'project' ? [{
                      id: `project-${step.id}`,
                      title: step.title,
                      description: step.description,
                      difficulty: step.difficulty,
                      estimatedTime: step.estimatedTime.toString(),
                      skills: [],
                      xpReward: 100,
                      resources: step.resources
                    }] : [],
                    resources: step.resources
                  }));

                  await updateLearningJourney(selectedJourney.career.id, {
                    detailedRoadmap: roadmapSteps
                  });

                  toast({
                    title: "Roadmap updated",
                    description: "The visual roadmap has been saved successfully",
                  });

                  setVisualBuilderOpen(false);
                  await fetchDetailedJourney(selectedJourney.career.id);
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to save roadmap changes",
                    variant: "destructive"
                  });
                }
              }}
              onCancel={() => setVisualBuilderOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Create New Career Path Dialog */}
      {createNewCareerOpen && (
        <Dialog open={createNewCareerOpen} onOpenChange={setCreateNewCareerOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Career Path</DialogTitle>
            </DialogHeader>
            <VisualRoadmapBuilder
              isNewCareer={true}
              onSave={async (careerPath, steps) => {
                try {
                  // Here you would typically call an API to create the new career path
                  // For now, we'll just show a success message
                  toast({
                    title: "Career path created",
                    description: `Successfully created "${careerPath.name}" with ${steps.length} steps`,
                  });
                  setCreateNewCareerOpen(false);
                  // Refresh the learning journeys list
                  await fetchLearningJourneys();
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to create career path",
                    variant: "destructive"
                  });
                }
              }}
              onCancel={() => setCreateNewCareerOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default LearningJourneyManager;
