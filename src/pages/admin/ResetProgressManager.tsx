import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  getResetStatistics, 
  resetAllMemberProgress, 
  resetIndividualMemberProgress,
  getAllUserProgress 
} from '@/api/adminApi';
import { 
  RefreshCw, 
  Trash2, 
  AlertTriangle, 
  Users, 
  Award, 
  BookOpen, 
  FileText, 
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

interface ResetStatistics {
  totalUsers: number;
  totalCareerProgress: number;
  totalQuizResults: number;
  totalProjectSubmissions: number;
  totalAchievements: number;
}

interface UserProgress {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  career: {
    id: string;
    name: string;
  };
  progress: {
    completedSteps: number;
    totalSteps: number;
    completedProjects: number;
    totalProjects: number;
    averageScore: number;
    totalXP: number;
  };
}

const ResetProgressManager: React.FC = () => {
  const [statistics, setStatistics] = useState<ResetStatistics | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetAllDialog, setShowResetAllDialog] = useState(false);
  const [showResetUserDialog, setShowResetUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProgress | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, progressData] = await Promise.all([
        getResetStatistics(),
        getAllUserProgress()
      ]);
      
      setStatistics(statsData.statistics);
      setUserProgress(progressData.userProgress || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load reset statistics and user progress",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetAll = async () => {
    try {
      setResetLoading(true);
      const result = await resetAllMemberProgress();
      
      toast({
        title: "Success",
        description: `Successfully reset progress for ${result.resetCount} out of ${result.totalUsers} users`,
      });
      
      setShowResetAllDialog(false);
      await loadData(); // Reload data
    } catch (error) {
      console.error('Error resetting all progress:', error);
      toast({
        title: "Error",
        description: "Failed to reset all member progress",
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetUser = async (user: UserProgress) => {
    try {
      setResetLoading(true);
      await resetIndividualMemberProgress(user.user.id);
      
      toast({
        title: "Success",
        description: `Successfully reset progress for ${user.user.name}`,
      });
      
      setShowResetUserDialog(false);
      setSelectedUser(null);
      await loadData(); // Reload data
    } catch (error) {
      console.error('Error resetting user progress:', error);
      toast({
        title: "Error",
        description: "Failed to reset user progress",
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const openResetUserDialog = (user: UserProgress) => {
    setSelectedUser(user);
    setShowResetUserDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading reset statistics...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reset Progress Manager</h1>
          <p className="text-muted-foreground">
            Manage and reset user progress across the platform
          </p>
        </div>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Career Progress</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalCareerProgress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quiz Results</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalQuizResults}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Project Submissions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalProjectSubmissions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalAchievements}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reset All Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
            Reset All Member Progress
          </CardTitle>
          <CardDescription>
            This will reset ALL user progress, career assessments, XP, achievements, and project submissions. 
            Users will keep their login credentials but start fresh.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This action cannot be undone. All user progress will be permanently deleted.
            </AlertDescription>
          </Alert>
          
          <div className="mt-4">
            <Dialog open={showResetAllDialog} onOpenChange={setShowResetAllDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Reset All Member Progress
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Reset All Progress</DialogTitle>
                  <DialogDescription>
                    Are you absolutely sure you want to reset ALL member progress? This will:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Delete all career progress records</li>
                      <li>Delete all quiz results</li>
                      <li>Delete all project submissions</li>
                      <li>Delete all achievements</li>
                      <li>Reset all users to level 1 with 0 XP</li>
                      <li>Keep only login credentials (name, email, password)</li>
                    </ul>
                    <strong className="text-red-600">This action cannot be undone!</strong>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowResetAllDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleResetAll}
                    disabled={resetLoading}
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Reset All Progress
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Individual User Progress Table */}
      <Card>
        <CardHeader>
          <CardTitle>Individual User Progress</CardTitle>
          <CardDescription>
            Reset progress for individual users. Users will keep their login credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userProgress.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No user progress found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Career Path</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>XP</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userProgress.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.career.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Steps: {user.progress.completedSteps}/{user.progress.totalSteps}</div>
                        <div>Projects: {user.progress.completedProjects}/{user.progress.totalProjects}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.progress.totalXP} XP</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {user.progress.averageScore >= 80 ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        ) : user.progress.averageScore >= 60 ? (
                          <CheckCircle className="h-4 w-4 text-yellow-500 mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        {user.progress.averageScore}%
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openResetUserDialog(user)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Reset
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Reset Individual User Dialog */}
      <Dialog open={showResetUserDialog} onOpenChange={setShowResetUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset User Progress</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset progress for {selectedUser?.user.name}? This will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Delete all career progress</li>
                <li>Delete all quiz results</li>
                <li>Delete all project submissions</li>
                <li>Delete all achievements</li>
                <li>Reset user to level 1 with 0 XP</li>
                <li>Keep login credentials (name, email, password)</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetUserDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedUser && handleResetUser(selectedUser)}
              disabled={resetLoading}
            >
              {resetLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Reset User Progress
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResetProgressManager;
