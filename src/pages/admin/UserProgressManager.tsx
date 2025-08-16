import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Award, 
  Clock, 
  Search, 
  RefreshCw,
  BarChart3,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Filter,
  Users,
  Star,
  Activity
} from 'lucide-react';
import { getAllUserProgress, getUserProgress, resetUserProgress, getUserProgressAnalytics, getUserAchievements, exportUserProgress } from '@/api/adminApi';
import { useToast } from '@/hooks/use-toast';

interface UserProgress {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
  career: {
    id: string;
    name: string;
    description: string;
  };
  progress: {
    completedSteps: number;
    totalSteps: number;
    completedProjects: number;
    totalProjects: number;
    averageScore: number;
    totalXP: number;
    lastActivity: string;
  };
  submissions: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  achievements: string[];
  timeSpent: number; // in hours
}

interface ProgressAnalytics {
  totalUsers: number;
  activeUsers: number;
  averageProgress: number;
  topPerformers: number;
  completionRate: number;
  averageTimeToComplete: number;
}

const UserProgressManager: React.FC = () => {
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [analytics, setAnalytics] = useState<ProgressAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProgress | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    career: 'all',
    progress: 'all',
    role: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProgress();
  }, [filters, currentPage]);

  const fetchUserProgress = async () => {
    setLoading(true);
    try {
      // Build query parameters, excluding undefined values
      const params: Record<string, string> = {
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      };
      
      if (filters.career !== 'all') params.career = filters.career;
      if (filters.progress !== 'all') params.progress = filters.progress;
      if (filters.role !== 'all') params.role = filters.role;
      if (searchTerm) params.search = searchTerm;
      
      const response = await getAllUserProgress(params);
      
      setUserProgress(response.userProgress);
      setAnalytics(response.analytics);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user progress",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetProgress = async (userId: string, careerId: string) => {
    if (!confirm('Are you sure you want to reset this user\'s progress? This action cannot be undone.')) return;
    
    try {
      await resetUserProgress(userId, careerId);
      toast({
        title: "Success",
        description: "User progress reset successfully",
      });
      fetchUserProgress();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset user progress",
        variant: "destructive"
      });
    }
  };

  const getProgressBadge = (progress: number) => {
    if (progress >= 80) {
      return <Badge variant="default" className="bg-green-100 text-green-800"><TrendingUp className="w-3 h-3 mr-1" />Excellent</Badge>;
    } else if (progress >= 60) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800"><Activity className="w-3 h-3 mr-1" />Good</Badge>;
    } else if (progress >= 40) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
    } else {
      return <Badge variant="outline" className="bg-gray-100 text-gray-800"><User className="w-3 h-3 mr-1" />Beginner</Badge>;
    }
  };

  const filteredProgress = userProgress.filter(progress => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        progress.user.name.toLowerCase().includes(searchLower) ||
        progress.user.email.toLowerCase().includes(searchLower) ||
        progress.career.name.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredProgress.length / itemsPerPage);
  const paginatedProgress = filteredProgress.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Progress Manager</h1>
          <p className="text-gray-600 mt-1">Monitor and manage user progress across career paths</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchUserProgress} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Users</p>
                  <p className="text-2xl font-bold text-blue-900">{analytics.totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Active Users</p>
                  <p className="text-2xl font-bold text-green-900">{analytics.activeUsers}</p>
                </div>
                <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Avg Progress</p>
                  <p className="text-2xl font-bold text-purple-900">{analytics.averageProgress}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-orange-900">{analytics.completionRate}%</p>
                </div>
                <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-orange-700" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by user name, email, or career..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
              <Label htmlFor="progress">Progress Level</Label>
              <Select value={filters.progress} onValueChange={(value) => setFilters({...filters, progress: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner (0-40%)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (40-80%)</SelectItem>
                  <SelectItem value="advanced">Advanced (80-100%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="role">User Role</Label>
              <Select value={filters.role} onValueChange={(value) => setFilters({...filters, role: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Progress Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle>User Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading user progress...</p>
            </div>
          ) : paginatedProgress.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-900">No user progress found</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedProgress.map((progress) => {
                const stepProgress = (progress.progress.completedSteps / progress.progress.totalSteps) * 100;
                const projectProgress = (progress.progress.completedProjects / progress.progress.totalProjects) * 100;
                
                return (
                  <div
                    key={progress.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{progress.user.name}</span>
                          <span className="text-sm text-gray-500">({progress.user.email})</span>
                        </div>
                        {getProgressBadge(stepProgress)}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(progress);
                            setDetailDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetProgress(progress.user.id, progress.career.id)}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label className="text-sm text-gray-500">Career Path</Label>
                        <p className="font-medium">{progress.career.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Total XP</Label>
                        <p className="font-medium">{progress.progress.totalXP} XP</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Average Score</Label>
                        <p className="font-medium">{progress.progress.averageScore}%</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Time Spent</Label>
                        <p className="font-medium">{progress.timeSpent}h</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Steps Progress</span>
                          <span>{progress.progress.completedSteps}/{progress.progress.totalSteps}</span>
                        </div>
                        <Progress value={stepProgress} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Projects Progress</span>
                          <span>{progress.progress.completedProjects}/{progress.progress.totalProjects}</span>
                        </div>
                        <Progress value={projectProgress} className="h-2" />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{progress.submissions.approved} Approved</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-yellow-500" />
                          <span>{progress.submissions.pending} Pending</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span>{progress.submissions.rejected} Rejected</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        Last active: {new Date(progress.progress.lastActivity).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProgress.length)} of {filteredProgress.length} users
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

      {/* User Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Progress Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>User Name</Label>
                  <p className="font-medium">{selectedUser.user.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedUser.user.email}</p>
                </div>
                <div>
                  <Label>Career Path</Label>
                  <p className="font-medium">{selectedUser.career.name}</p>
                </div>
                <div>
                  <Label>Member Since</Label>
                  <p className="font-medium">{new Date(selectedUser.user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <Tabs defaultValue="progress" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                  <TabsTrigger value="submissions">Submissions</TabsTrigger>
                  <TabsTrigger value="achievements">Achievements</TabsTrigger>
                </TabsList>
                
                <TabsContent value="progress" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{selectedUser.progress.totalXP}</p>
                          <p className="text-sm text-gray-600">Total XP Earned</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{selectedUser.progress.averageScore}%</p>
                          <p className="text-sm text-gray-600">Average Score</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <Label>Steps Progress</Label>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Completed: {selectedUser.progress.completedSteps}/{selectedUser.progress.totalSteps}</span>
                      <span>{Math.round((selectedUser.progress.completedSteps / selectedUser.progress.totalSteps) * 100)}%</span>
                    </div>
                    <Progress value={(selectedUser.progress.completedSteps / selectedUser.progress.totalSteps) * 100} className="h-3" />
                  </div>
                  
                  <div>
                    <Label>Projects Progress</Label>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Completed: {selectedUser.progress.completedProjects}/{selectedUser.progress.totalProjects}</span>
                      <span>{Math.round((selectedUser.progress.completedProjects / selectedUser.progress.totalProjects) * 100)}%</span>
                    </div>
                    <Progress value={(selectedUser.progress.completedProjects / selectedUser.progress.totalProjects) * 100} className="h-3" />
                  </div>
                </TabsContent>
                
                <TabsContent value="submissions" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{selectedUser.submissions.total}</div>
                        <div className="text-sm text-gray-600">Total Submissions</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{selectedUser.submissions.approved}</div>
                        <div className="text-sm text-gray-600">Approved</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{selectedUser.submissions.rejected}</div>
                        <div className="text-sm text-gray-600">Rejected</div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="achievements" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {selectedUser.achievements.map((achievement, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-yellow-500" />
                            <span className="font-medium">{achievement}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProgressManager;
