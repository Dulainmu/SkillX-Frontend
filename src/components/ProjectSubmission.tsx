import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Send, X } from 'lucide-react';
import { getApiUrl, getAuthToken } from '@/config/api';

interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'not-started' | 'in-progress' | 'completed' | 'submitted' | 'approved';
  progress: number;
  estimatedTime: string;
  xpReward: number;
  skills: string[];
  brief?: string;
  requirements?: string[];
  deliverables?: string[];
  submission?: any;
}

interface ProjectSubmissionProps {
  project: Project;
  careerRoleId: string;
  stepIndex: number;
  onSubmit: (projectId: string, submission: any) => void;
}

const ProjectSubmission = ({ project, careerRoleId, stepIndex, onSubmit }: ProjectSubmissionProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [description, setDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please provide a project description",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');
      const formData = new FormData();
      formData.append('careerRoleId', careerRoleId);
      formData.append('stepIndex', String(stepIndex));
      formData.append('projectId', project.id);
      formData.append('title', project.title);
      formData.append('description', description.trim());
      if (githubUrl.trim()) formData.append('submissionUrl', githubUrl.trim());
      else if (demoUrl.trim()) formData.append('submissionUrl', demoUrl.trim());
      if (files && files.length > 0) {
        formData.append('file', files[0]);
      }
      const response = await fetch(getApiUrl('/api/submissions'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (!response.ok) throw new Error('Failed to submit project');
      toast({
        title: "Project Submitted!",
        description: "Your project has been submitted for mentor review.",
      });
      setIsOpen(false);
      setDescription('');
      setGithubUrl('');
      setDemoUrl('');
      setFiles(null);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit project. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Enhanced project details with brief and requirements
  const projectBrief = project.brief || `
    ${project.description}
    
    This project will help you apply the skills you've learned in a practical, real-world scenario. 
    You'll work through the entire development lifecycle from planning to deployment.
  `;

  const requirements = project.requirements || [
    'Complete all core functionality',
    'Implement proper error handling',
    'Write clean, documented code',
    'Include a README with setup instructions',
    'Test your implementation thoroughly'
  ];

  const deliverables = project.deliverables || [
    'Source code files',
    'Documentation (README)',
    'Screenshots or demo video',
    'Project reflection write-up'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <FileText className="w-4 h-4" />
          View Project Brief
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{project.title}</DialogTitle>
          <DialogDescription>
            Project brief and submission portal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Brief */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Brief</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Overview</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {projectBrief}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Skills You'll Practice</h4>
                <div className="flex flex-wrap gap-1">
                  {project.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Requirements</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Deliverables</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {deliverables.map((deliverable, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {deliverable}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
                <div>
                  <div className="text-sm font-medium">Difficulty</div>
                  <Badge variant={
                    project.difficulty === 'Beginner' ? 'secondary' :
                    project.difficulty === 'Intermediate' ? 'default' : 'destructive'
                  }>
                    {project.difficulty}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm font-medium">Estimated Time</div>
                  <div className="text-sm text-muted-foreground">{project.estimatedTime}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Send className="w-5 h-5" />
                Submit Your Project
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="files">Project Files</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <input
                      id="files"
                      type="file"
                      multiple
                      accept=".zip,.rar,.7z,.tar.gz,.py,.js,.html,.css,.md,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="files" className="cursor-pointer">
                      <span className="text-sm text-muted-foreground">
                        Click to upload files or drag and drop
                      </span>
                      <br />
                      <span className="text-xs text-muted-foreground">
                        Supported formats: ZIP, Python, JavaScript, Documents
                      </span>
                    </label>
                    {files && files.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {Array.from(files).map((file, index) => (
                          <div key={index} className="text-sm text-primary">
                            📎 {file.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what you built, challenges you faced, and what you learned..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub Repository (Optional)</Label>
                    <Input
                      id="github"
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username/repo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="demo">Live Demo URL (Optional)</Label>
                    <Input
                      id="demo"
                      type="url"
                      value={demoUrl}
                      onChange={(e) => setDemoUrl(e.target.value)}
                      placeholder="https://your-demo.com"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Send className="w-4 h-4 mr-2" />
                    Submit Project
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectSubmission;