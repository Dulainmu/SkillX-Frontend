import { useState, useEffect } from 'react';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getApiUrl, getAuthToken } from '@/config/api';
import { 
  Users, 
  FileText, 
  Star, 
  Clock, 
  CheckCircle2,
  MessageSquare,
  Download,
  Award,
  BrainCircuit,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProjectSubmission {
  id: string;
  user?: { name: string; email: string };
  studentName?: string;
  studentEmail?: string;
  title: string;
  description: string;
  skills: string[];
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'approved';
  fileUrl?: string;
  feedback?: string;
  score?: number;
}

const MentorDashboard = () => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<ProjectSubmission | null>(null);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const token = getAuthToken();
      if (!token) return;
      try {
        const response = await fetch(getApiUrl('/api/submissions/all/mentor'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          // Map _id to id for frontend compatibility, and extract student details
          setSubmissions(data.map((s: any) => ({
            ...s,
            id: s._id,
            studentName: s.user?.name || '',
            studentEmail: s.user?.email || ''
          })));
        }
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to load submissions', variant: 'destructive' });
      }
    };
    fetchSubmissions();
  }, [toast]);

  const handleReviewSubmission = async (submissionId: string, newFeedback: string, newScore: number) => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const response = await fetch(getApiUrl(`/api/submissions/${submissionId}/review`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'reviewed', feedback: newFeedback, score: newScore })
      });
      if (response.ok) {
        toast({ title: 'Review Submitted', description: 'Student has been notified of your feedback.' });
        setSelectedSubmission(null);
        setFeedback('');
        setScore(0);
        // Refresh submissions
        const updated = await response.json();
        setSubmissions(prev => prev.map(s => s.id === updated._id ? { ...updated, id: updated._id } : s));
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to submit review', variant: 'destructive' });
    }
  };

  const handleApproveSubmission = async (submissionId: string) => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const response = await fetch(getApiUrl(`/api/submissions/${submissionId}/review`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'approved' })
      });
      if (response.ok) {
        toast({ title: 'Project Approved', description: 'Project has been approved and student notified.' });
        const updated = await response.json();
        setSubmissions(prev => prev.map(s => s.id === updated._id ? { ...updated, id: updated._id } : s));
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to approve project', variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const reviewedCount = submissions.filter(s => s.status === 'reviewed').length;
  const approvedCount = submissions.filter(s => s.status === 'approved').length;

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('skillx-token');
    sessionStorage.removeItem('skillx-token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/10">
      {/* Custom Mentor Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                SkillX Mentor
              </span>
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-xl border border-border/50 p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                    Mentor Dashboard
                  </h1>
                  <p className="text-muted-foreground">
                    Review student projects and provide feedback
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-200">
                    <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-yellow-800">{pendingCount}</div>
                    <div className="text-xs text-yellow-600">Pending Review</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
                    <MessageSquare className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-blue-800">{reviewedCount}</div>
                    <div className="text-xs text-blue-600">Reviewed</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
                    <Award className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-green-800">{approvedCount}</div>
                    <div className="text-xs text-green-600">Approved</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="submissions" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="submissions">Project Submissions</TabsTrigger>
              <TabsTrigger value="students">Students Overview</TabsTrigger>
            </TabsList>

            {/* Submissions Tab */}
            <TabsContent value="submissions">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Submissions List */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Recent Submissions</h2>
                  {submissions.map((submission) => (
                    <Card 
                      key={submission.id} 
                      className={`bg-card/80 backdrop-blur-sm border border-border/50 cursor-pointer transition-all hover:shadow-lg ${
                        selectedSubmission?.id === submission.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg text-foreground">{submission.title}</CardTitle>
                          <Badge className={getStatusColor(submission.status)}>
                            {submission.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          By {submission.studentName} • {formatDate(submission.submittedAt)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {submission.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(submission.skills || []).slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {submission.skills && submission.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{submission.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Review Panel */}
                <div className="space-y-4">
                  {selectedSubmission ? (
                    <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Review Project</span>
                          <Button variant="outline" size="sm" onClick={() => {
                            if (selectedSubmission?.fileUrl) {
                              // If fileUrl is a download endpoint, use it directly
                              window.open(`${getApiUrl('')}${selectedSubmission.fileUrl}`, '_blank');
                            } else {
                              toast({ title: 'No file uploaded', description: 'This submission does not have a file to download.', variant: 'destructive' });
                            }
                          }}>
                            <Download className="w-4 h-4 mr-2" />
                            Download Files
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">{selectedSubmission.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {selectedSubmission.description}
                          </p>
                          
                          <div className="space-y-2 mb-4">
                            <Label className="text-sm font-medium">Student Details</Label>
                            <div className="text-sm">
                              <div>{selectedSubmission.studentName}</div>
                              <div className="text-muted-foreground">{selectedSubmission.studentEmail}</div>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <Label className="text-sm font-medium">Skills Demonstrated</Label>
                            <div className="flex flex-wrap gap-1">
                              {(selectedSubmission.skills || []).map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {selectedSubmission.status === 'pending' && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="score">Score (0-100)</Label>
                              <Input
                                id="score"
                                type="number"
                                min="0"
                                max="100"
                                value={score}
                                onChange={(e) => setScore(parseInt(e.target.value) || 0)}
                                placeholder="Enter score"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="feedback">Feedback</Label>
                              <Textarea
                                id="feedback"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Provide detailed feedback for the student..."
                                rows={4}
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button 
                                onClick={() => handleReviewSubmission(selectedSubmission.id, feedback, score)}
                                disabled={!feedback.trim() || score === 0}
                              >
                                Submit Review
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => setSelectedSubmission(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        {selectedSubmission.status === 'reviewed' && (
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">Your Review</Label>
                              <div className="mt-2 p-3 bg-muted/20 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  <span className="font-medium">Score: {selectedSubmission.score}/100</span>
                                </div>
                                <p className="text-sm">{selectedSubmission.feedback}</p>
                              </div>
                            </div>
                            <Button 
                              onClick={() => handleApproveSubmission(selectedSubmission.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Approve Project
                            </Button>
                          </div>
                        )}

                        {selectedSubmission.status === 'approved' && (
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 text-green-800">
                              <CheckCircle2 className="w-5 h-5" />
                              <span className="font-medium">Project Approved</span>
                            </div>
                            <p className="text-green-700 text-sm mt-2">
                              This project has been approved and the student has been notified.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                      <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            Select a submission to review
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Students Tab */}
            <TabsContent value="students">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Active Students
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">127</div>
                    <p className="text-sm text-muted-foreground">Currently enrolled</p>
                  </CardContent>
                </Card>

                <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Avg Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">84.2</div>
                    <p className="text-sm text-muted-foreground">Out of 100</p>
                  </CardContent>
                </Card>

                <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Completion Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">92%</div>
                    <p className="text-sm text-muted-foreground">Projects completed</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MentorDashboard;