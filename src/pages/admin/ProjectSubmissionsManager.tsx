import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Filter, 
  Download, 
  User, 
  BookOpen,
  Star,
  MessageSquare,
  Calendar,
  Search,
  RefreshCw,
  Users,
  Award,
  TrendingUp
} from 'lucide-react';
import { getAllSubmissions, reviewSubmission, bulkReviewSubmissions, assignMentor, deleteSubmission, getMentorWorkload, getSubmissionsByCareer, getSubmissionsByUser } from '@/api/adminApi';
import { useToast } from '@/hooks/use-toast';

interface Submission {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  career: {
    id: string;
    name: string;
  };
  step: {
    id: string;
    title: string;
  };
  project: {
    id: string;
    title: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  score?: number;
  submittedAt: string;
  reviewedAt?: string;
  mentor?: {
    id: string;
    name: string;
  };
  attachments: string[];
}

interface SubmissionsAnalytics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  approvalRate: number;
  avgReviewTime: number;
}

const ProjectSubmissionsManager: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [analytics, setAnalytics] = useState<SubmissionsAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    career: 'all',
    mentor: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [reviewForm, setReviewForm] = useState({
    status: 'approved' as 'approved' | 'rejected',
    feedback: '',
    score: 0
  });
  const [bulkReviewForm, setBulkReviewForm] = useState({
    status: 'approved' as 'approved' | 'rejected',
    feedback: '',
    score: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, [filters, currentPage]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      // Build query parameters, excluding undefined values
      const params: Record<string, string> = {
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      };
      
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.career !== 'all') params.career = filters.career;
      if (filters.mentor !== 'all') params.mentor = filters.mentor;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      if (searchTerm) params.search = searchTerm;
      
      const response = await getAllSubmissions(params);
      
      setSubmissions(response.submissions);
      setAnalytics(response.analytics);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch submissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmission = async () => {
    if (!selectedSubmission) return;
    
    try {
      await reviewSubmission(selectedSubmission.id, {
        status: reviewForm.status,
        feedback: reviewForm.feedback,
        score: reviewForm.score
      });
      
      toast({
        title: "Success",
        description: `Submission ${reviewForm.status}`,
      });
      
      setReviewDialogOpen(false);
      setSelectedSubmission(null);
      setReviewForm({ status: 'approved', feedback: '', score: 0 });
      fetchSubmissions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to review submission",
        variant: "destructive"
      });
    }
  };

  const handleBulkReview = async () => {
    if (selectedSubmissions.length === 0) return;
    
    try {
      await bulkReviewSubmissions({
        submissionIds: selectedSubmissions,
        status: bulkReviewForm.status,
        feedback: bulkReviewForm.feedback,
        score: bulkReviewForm.score
      });
      
      toast({
        title: "Success",
        description: `${selectedSubmissions.length} submissions ${bulkReviewForm.status}`,
      });
      
      setBulkDialogOpen(false);
      setSelectedSubmissions([]);
      setBulkReviewForm({ status: 'approved', feedback: '', score: 0 });
      fetchSubmissions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to bulk review submissions",
        variant: "destructive"
      });
    }
  };

  const handleAssignMentor = async (submissionId: string, mentorId: string) => {
    try {
      await assignMentor(submissionId, mentorId);
      toast({
        title: "Success",
        description: "Mentor assigned successfully",
      });
      fetchSubmissions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign mentor",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;
    
    try {
      await deleteSubmission(submissionId);
      toast({
        title: "Success",
        description: "Submission deleted successfully",
      });
      fetchSubmissions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete submission",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        submission.user.name.toLowerCase().includes(searchLower) ||
        submission.user.email.toLowerCase().includes(searchLower) ||
        (submission.career?.name || '').toLowerCase().includes(searchLower) ||
        submission.project.title.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const totalPages = Math.ceil((analytics?.total || 0) / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Submissions Manager</h1>
          <p className="text-gray-600 mt-1">Review and manage user project submissions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchSubmissions} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {selectedSubmissions.length > 0 && (
            <Button onClick={() => setBulkDialogOpen(true)} variant="default">
              <CheckCircle className="w-4 h-4 mr-2" />
              Bulk Review ({selectedSubmissions.length})
            </Button>
          )}
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Submissions</p>
                  <p className="text-2xl font-bold text-blue-900">{analytics.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-yellow-50 to-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-900">{analytics.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-200 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Approval Rate</p>
                  <p className="text-2xl font-bold text-green-900">{analytics.approvalRate}%</p>
                </div>
                <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Avg Review Time</p>
                  <p className="text-2xl font-bold text-purple-900">{analytics.avgReviewTime}h</p>
                </div>
                <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by user, project, or career..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="career">Career</Label>
              <Select value={filters.career} onValueChange={(value) => setFilters({...filters, career: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Careers</SelectItem>
                  <SelectItem value="frontend">Frontend Development</SelectItem>
                  <SelectItem value="backend">Backend Development</SelectItem>
                  <SelectItem value="fullstack">Full Stack Development</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle>Project Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading submissions...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-900">No submissions found</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{submission.user.name}</span>
                          <span className="text-sm text-gray-500">({submission.user.email})</span>
                        </div>
                        {getStatusBadge(submission.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Career:</span>
                          <span className="ml-2 font-medium">{submission.career?.name || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Project:</span>
                          <span className="ml-2 font-medium">{submission.project.title}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Submitted:</span>
                          <span className="ml-2">{new Date(submission.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {submission.feedback && (
                        <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                          <span className="text-gray-500">Feedback:</span>
                          <span className="ml-2">{submission.feedback}</span>
                        </div>
                      )}

                      {submission.score !== undefined && (
                        <div className="mt-2 flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">Score: {submission.score}/100</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedSubmissions.includes(submission.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSubmissions([...selectedSubmissions, submission.id]);
                          } else {
                            setSelectedSubmissions(selectedSubmissions.filter(id => id !== submission.id));
                          }
                        }}
                        className="rounded"
                      />
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setReviewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSubmission(submission.id)}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, analytics?.total || 0)} of {analytics?.total || 0} submissions
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Submission</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>User</Label>
                  <p className="font-medium">{selectedSubmission.user.name}</p>
                </div>
                <div>
                  <Label>Project</Label>
                  <p className="font-medium">{selectedSubmission.project.title}</p>
                </div>
                <div>
                  <Label>Career</Label>
                                          <p className="font-medium">{selectedSubmission.career?.name || 'Not specified'}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  {getStatusBadge(selectedSubmission.status)}
                </div>
              </div>

              <div>
                <Label htmlFor="reviewStatus">Decision</Label>
                <Select value={reviewForm.status} onValueChange={(value: 'approved' | 'rejected') => setReviewForm({...reviewForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approve</SelectItem>
                    <SelectItem value="rejected">Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reviewScore">Score (0-100)</Label>
                <Input
                  id="reviewScore"
                  type="number"
                  min="0"
                  max="100"
                  value={reviewForm.score}
                  onChange={(e) => setReviewForm({...reviewForm, score: parseInt(e.target.value) || 0})}
                />
              </div>

              <div>
                <Label htmlFor="reviewFeedback">Feedback</Label>
                <Textarea
                  id="reviewFeedback"
                  placeholder="Provide detailed feedback..."
                  value={reviewForm.feedback}
                  onChange={(e) => setReviewForm({...reviewForm, feedback: e.target.value})}
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleReviewSubmission}>
                  Submit Review
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Review Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Review Submissions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Decision for {selectedSubmissions.length} submissions</Label>
              <Select value={bulkReviewForm.status} onValueChange={(value: 'approved' | 'rejected') => setBulkReviewForm({...bulkReviewForm, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approve All</SelectItem>
                  <SelectItem value="rejected">Reject All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Score (0-100)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={bulkReviewForm.score}
                onChange={(e) => setBulkReviewForm({...bulkReviewForm, score: parseInt(e.target.value) || 0})}
              />
            </div>

            <div>
              <Label>Feedback (optional)</Label>
              <Textarea
                placeholder="Feedback for all selected submissions..."
                value={bulkReviewForm.feedback}
                onChange={(e) => setBulkReviewForm({...bulkReviewForm, feedback: e.target.value})}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkReview}>
                Apply to All
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectSubmissionsManager;
