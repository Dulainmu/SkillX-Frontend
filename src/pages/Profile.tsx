import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useCareer } from '@/contexts/CareerContext';
import { getApiUrl, getAuthToken } from '@/config/api';
import { 
  User, 
  Mail, 
  Calendar,
  Trophy,
  Star,
  Target,
  BookOpen,
  Settings,
  Edit3,
  Save,
  X,
  Medal,
  Zap,
  Award,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { toast } = useToast();
  const { currentCareer } = useCareer();
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    joinDate: '',
    bio: 'Passionate about technology and career development. Currently exploring UX Design and Software Engineering paths.',
    totalXp: 0,
    level: 1,
    avatar: ''
  });

  const fileInputRef = useRef(null);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [achievementsError, setAchievementsError] = useState('');
  const [careerProgress, setCareerProgress] = useState([]);
  const [careerProgressLoading, setCareerProgressLoading] = useState(true);
  const [careerProgressError, setCareerProgressError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const [profileErrors, setProfileErrors] = useState({ name: '' });
  const [notificationSettings, setNotificationSettings] = useState({ email: true, achievement: true });
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    dayStreak: 0
  });
  const [passwordError, setPasswordError] = useState('');

  const validateName = (name: string) => /^[A-Za-z\s'-]+$/.test(name);

  // Mock user progress data
  const currentCareers = [
    { name: 'UX Designer', progress: 65, xp: 850, status: 'In Progress' },
    { name: 'Software Engineer', progress: 30, xp: 400, status: 'In Progress' },
    { name: 'Data Scientist', progress: 15, xp: 200, status: 'Started' }
  ];

  const fetchUserStats = async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      // Fetch projects count
      const projectsRes = await fetch(getApiUrl('/api/submissions'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let projectsCount = 0;
      if (projectsRes.ok) {
        const projects = await projectsRes.json();
        projectsCount = projects.length;
      }

      // Fetch skills count (from completed modules)
      const progressRes = await fetch(getApiUrl('/api/progress/all'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let skillsCount = 0;
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        // Count completed steps as skills
        skillsCount = progressData.reduce((total, career) => {
          const completedSteps = (career.steps || []).filter(step => step.completed).length;
          return total + completedSteps;
        }, 0);
      }

      // Calculate day streak based on join date
      let dayStreak = 0;
      if (userInfo.joinDate) {
        const joinDate = new Date(userInfo.joinDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - joinDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        dayStreak = Math.min(diffDays, 30); // Cap at 30 days
      }

      setStats({
        projects: projectsCount,
        skills: skillsCount,
        dayStreak: dayStreak
      });
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const fetchProfile = async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const response = await fetch(getApiUrl('/api/users/profile'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUserInfo({
          name: data.name || '',
          email: data.email || '',
          joinDate: data.joinDate || '',
          bio: data.bio || '',
          totalXp: data.totalXp || 0,
          level: data.level || 1,
          avatar: data.avatar || ''
        });
        // Set notification settings from backend
        if (data.notificationSettings) {
          setNotificationSettings({
            email: data.notificationSettings.email ?? true,
            achievement: data.notificationSettings.achievement ?? true
          });
        }
      } else {
        console.error('Profile fetch failed:', response.status, response.statusText);
        // Set default values if profile fetch fails
        setUserInfo(prev => ({
          ...prev,
          name: 'User',
          email: 'user@example.com',
          totalXp: 0,
          level: 1
        }));
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast({ title: 'Error', description: 'Failed to load profile', variant: 'destructive' });
    }
  };

  // Update notification settings
  const updateNotificationSettings = async (newSettings) => {
    const token = getAuthToken();
    if (!token) return;
    setNotificationLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/users/notification-settings'), {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSettings)
      });
      if (response.ok) {
        const data = await response.json();
        setNotificationSettings(data.notificationSettings);
        toast({ title: 'Success', description: 'Notification settings updated successfully' });
      } else {
        const errorData = await response.json();
        toast({ title: 'Error', description: errorData.message || 'Failed to update notification settings', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update notification settings', variant: 'destructive' });
    } finally {
      setNotificationLoading(false);
    }
  };

  const fetchCareerProgress = async () => {
    setCareerProgressLoading(true);
    setCareerProgressError('');
    const token = getAuthToken();
    if (!token) {
      setCareerProgressError('No authentication token found');
      setCareerProgressLoading(false);
      return;
    }
    try {
      // Fetch all user progress
      const progressRes = await fetch(getApiUrl('/api/progress/all'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let progressData = [];
      if (progressRes.ok) {
        progressData = await progressRes.json();
        console.log('Progress data:', progressData);
      } else {
        console.error('Failed to fetch progress:', progressRes.status);
        // Continue with empty progress data instead of failing completely
        progressData = [];
      }
      
      // Fetch all careers
      const careersRes = await fetch(getApiUrl('/api/recommendations/careers'));
      let careersData = [];
      if (careersRes.ok) {
        const data = await careersRes.json();
        careersData = data.careers;
        console.log('Careers data:', careersData);
      } else {
        console.error('Failed to fetch careers:', careersRes.status);
        // Continue with empty careers data instead of failing completely
        careersData = [];
      }
      
      // Map progress to career details
      const mapped = progressData.map((progress) => {
        const career = careersData.find(c => c._id === progress.careerRole);
        const completedSteps = (progress.steps || []).filter(s => s.completed).length;
        const totalSteps = (progress.steps || []).length;
        console.log(`Career ${progress.careerRole}: ${completedSteps}/${totalSteps} steps completed`);
        return {
          name: career ? career.name : `Career ${progress.careerRole}`,
          progress: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
          xp: career ? career.totalXp || 0 : 0,
          status: progress.completedAt ? 'Completed' : 'In Progress',
        };
      });
      console.log('Mapped career progress:', mapped);
      setCareerProgress(mapped);
    } catch (err) {
      console.error('Error fetching career progress:', err);
      setCareerProgressError('Failed to load career progress');
    }
    setCareerProgressLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch user stats after profile is loaded
  useEffect(() => {
    if (userInfo.joinDate) {
      fetchUserStats();
    }
  }, [userInfo.joinDate]);

  useEffect(() => {
    const fetchAchievements = async () => {
      setAchievementsLoading(true);
      setAchievementsError('');
      const token = getAuthToken();
      if (!token) return;
      try {
        const response = await fetch(getApiUrl('/api/users/my-achievements'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setAchievements(data);
        } else {
          setAchievementsError('Failed to load achievements');
        }
      } catch (error) {
        setAchievementsError('Failed to load achievements');
      }
      setAchievementsLoading(false);
    };
    fetchAchievements();
  }, []);

  useEffect(() => {
    fetchCareerProgress();
  }, []);

  const handleSave = async () => {
    setIsEditing(false);
    if (!validateName(userInfo.name)) {
      setProfileErrors({ name: 'Name can only contain letters, spaces, hyphens, and apostrophes.' });
      setIsEditing(true);
      return;
    }
    setProfileErrors({ name: '' });
    const token = getAuthToken();
    if (!token) return;
    try {
      const response = await fetch(getApiUrl('/api/users/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: userInfo.name,
          bio: userInfo.bio
        })
      });
      if (response.ok) {
        toast({ title: 'Profile Updated', description: 'Your profile information has been saved successfully.' });
      } else {
        const data = await response.json();
        toast({ title: 'Update Failed', description: data.message || 'Failed to update profile', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Update Failed', description: 'Failed to update profile', variant: 'destructive' });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data here if needed
  };

  const handleResetAccount = async () => {
    if (!window.confirm('Are you sure you want to reset your account? This will delete all your progress, submissions, and quiz results. This action cannot be undone.')) {
      return;
    }
    const token = getAuthToken();
    if (!token) return;
    try {
      const response = await fetch(getApiUrl('/api/users/reset-account'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast({ title: 'Account Reset', description: 'All your progress and data have been deleted. You can start fresh!', variant: 'destructive' });
        setTimeout(() => { window.location.href = '/'; }, 1500);
      } else {
        const data = await response.json();
        toast({ title: 'Reset Failed', description: data.message || 'Failed to reset account', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Reset Failed', description: 'Failed to reset account', variant: 'destructive' });
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const response = await fetch(getApiUrl('/api/users/avatar'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (response.ok) {
        const data = await response.json();
        setUserInfo((prev) => ({ ...prev, avatar: data.avatar }));
        toast({ title: 'Avatar Updated', description: 'Your profile picture has been updated.' });
      } else {
        toast({ title: 'Upload Failed', description: 'Failed to upload avatar', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Upload Failed', description: 'Failed to upload avatar', variant: 'destructive' });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setPasswordError('');
    if (passwordForm.newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      setIsChangingPassword(false);
      return;
    }
    const token = getAuthToken();
    try {
      const response = await fetch(getApiUrl('/api/users/change-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordForm)
      });
      if (response.ok) {
        toast({ title: 'Password Changed', description: 'Your password has been updated.' });
        setPasswordForm({ currentPassword: '', newPassword: '' });
        setConfirmNewPassword('');
      } else {
        const data = await response.json();
        setPasswordError(data.message || 'Failed to change password');
        toast({ title: 'Change Failed', description: data.message || 'Failed to change password', variant: 'destructive' });
      }
    } catch (error) {
      setPasswordError('Failed to change password');
      toast({ title: 'Change Failed', description: 'Failed to change password', variant: 'destructive' });
    }
    setIsChangingPassword(false);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    const token = getAuthToken();
    try {
      const response = await fetch(getApiUrl('/api/users/delete-account'), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast({ title: 'Account Deleted', description: 'Your account has been deleted.' });
        setTimeout(() => window.location.href = '/login', 2000);
      } else {
        toast({ title: 'Delete Failed', description: 'Failed to delete account.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Delete Failed', description: 'Failed to delete account.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/10">
      <Header />
      
      <main className="flex-1 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary/3 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/3 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/3 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Profile Header */}
            <Card className="mb-8 bg-card/80 backdrop-blur-sm border border-border/50 overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <Avatar className="w-24 h-24 border-4 border-white/20">
                    <AvatarImage src={userInfo.avatar || "/placeholder-avatar.jpg"} alt="Profile" />
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-primary to-secondary text-white">
                      {userInfo.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                    {isEditing && (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          onChange={handleAvatarChange}
                        />
                        <Button
                          size="sm"
                          className="absolute bottom-2 right-2 z-10 bg-white/80 hover:bg-white"
                          onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        >
                          Change
                        </Button>
                      </>
                    )}
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <h1 className="text-3xl font-bold text-foreground">{userInfo.name}</h1>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        Level {userInfo.level}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{userInfo.bio}</p>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{userInfo.totalXp}</div>
                        <div className="text-xs text-muted-foreground">Total XP</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-secondary">{stats.projects}</div>
                        <div className="text-xs text-muted-foreground">Projects</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-black">{stats.skills}</div>
                        <div className="text-xs text-muted-foreground">Skills</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-500">{stats.dayStreak}</div>
                        <div className="text-xs text-muted-foreground">Day Streak</div>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant={isEditing ? "destructive" : "outline"}
                    onClick={isEditing ? handleCancel : () => setIsEditing(true)}
                    className="bg-background/80 hover:bg-background"
                  >
                    {isEditing ? (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Main Content Tabs */}
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-card/80 backdrop-blur-sm">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="careers">Career Progress</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isEditing ? (
                        <>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                            <Input 
                              value={userInfo.name}
                              onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                              className="mt-1"
                            />
                            {isEditing && profileErrors.name && (
                              <div className="text-destructive text-xs mt-1">{profileErrors.name}</div>
                            )}
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Bio</label>
                            <Input 
                              value={userInfo.bio}
                              onChange={(e) => setUserInfo({...userInfo, bio: e.target.value})}
                              className="mt-1"
                            />
                          </div>
                          <Button onClick={handleSave} className="w-full">
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{userInfo.email}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">Joined {userInfo.joinDate}</span>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full justify-start" variant="outline" onClick={() => {
                        if (currentCareer) {
                          navigate('/dashboard');
                        } else {
                          toast({
                            title: "No Career Selected",
                            description: "Please choose a career path to start learning.",
                            variant: "destructive"
                          });
                          navigate('/browse-careers');
                        }
                      }}>
                        <BookOpen className="w-4 h-4 mr-2" />
                        Continue Learning
                      </Button>
                      <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/quiz')}>
                        <Target className="w-4 h-4 mr-2" />
                        Take Career Quiz
                      </Button>
                      <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('achievements')}>
                        <Trophy className="w-4 h-4 mr-2" />
                        View All Achievements
                      </Button>
                      <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('settings')}>
                        <Settings className="w-4 h-4 mr-2" />
                        Account Settings
                      </Button>
                      <Button className="w-full justify-start" variant="destructive" onClick={handleResetAccount}>
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Reset Account (Start Over)
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Career Progress Tab */}
              <TabsContent value="careers" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Career Progress</h2>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setCareerProgressLoading(true);
                      setCareerProgressError('');
                      fetchCareerProgress();
                    }}
                    disabled={careerProgressLoading}
                  >
                    {careerProgressLoading ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </div>
                {careerProgressLoading ? (
                  <div className="text-center text-muted-foreground">Loading career progress...</div>
                ) : careerProgressError ? (
                  <div className="text-center text-destructive">{careerProgressError}</div>
                ) : careerProgress.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    <p className="mb-4">No career progress yet.</p>
                    <Button onClick={() => navigate('/browse-careers')} variant="outline">
                      Start a Career Path
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {careerProgress.map((career, index) => (
                      <Card key={index} className="bg-card/80 backdrop-blur-sm border border-border/50">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{career.name}</CardTitle>
                            <Badge variant={career.status === 'In Progress' ? 'default' : 'secondary'}>
                              {career.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span>Progress</span>
                              <span>{career.progress}%</span>
                            </div>
                            <Progress value={career.progress} className="h-2" />
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">XP Earned: {career.xp}</span>
                              <Button size="sm" variant="outline" onClick={() => navigate('/dashboard')}>Continue Learning</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="space-y-6">
                {achievementsLoading ? (
                  <div className="text-center text-muted-foreground">Loading achievements...</div>
                ) : achievementsError ? (
                  <div className="text-center text-destructive">{achievementsError}</div>
                ) : achievements.length === 0 ? (
                  <div className="text-center text-muted-foreground">No achievements earned yet.</div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {achievements.map((achievement) => {
                      const Icon = {
                        Trophy,
                        Star,
                        Medal,
                        Target,
                        Award
                      }[achievement.icon] || Trophy;
                      return (
                        <Card 
                          key={achievement.key}
                          className="bg-card/80 backdrop-blur-sm border border-border/50 ring-2 ring-primary/20"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-primary to-secondary">
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground">{achievement.title}</h3>
                                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                              </div>
                              <Badge className="ml-auto bg-primary/10 text-primary border-primary/20">Earned</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account preferences and privacy settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Change Password */}
                    <div>
                      <h4 className="font-medium mb-4">Change Password</h4>
                      <form onSubmit={handlePasswordChange} className="space-y-3 max-w-md">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Current Password</label>
                          <Input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">New Password</label>
                          <Input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Re-type New Password</label>
                          <Input
                            type={showConfirmNewPassword ? 'text' : 'password'}
                            value={confirmNewPassword}
                            onChange={e => { setConfirmNewPassword(e.target.value); setPasswordError(''); }}
                            required
                            className="mt-1"
                          />
                          <Button type="button" size="sm" variant="ghost" onClick={() => setShowConfirmNewPassword(v => !v)}>
                            {showConfirmNewPassword ? 'Hide' : 'Show'}
                          </Button>
                          {passwordError && <div className="text-red-500 text-xs mt-1">{passwordError}</div>}
                        </div>
                        <Button type="submit" disabled={isChangingPassword} className="w-full">
                          {isChangingPassword ? 'Changing...' : 'Change Password'}
                        </Button>
                      </form>
                    </div>
                    {/* Notifications */}
                    <div>
                      <h4 className="font-medium mb-4">Notifications</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Email notifications</span>
                          <Button 
                            size="sm" 
                            variant={notificationSettings.email ? 'success' : 'outline'} 
                            onClick={() => updateNotificationSettings({ email: !notificationSettings.email, achievement: notificationSettings.achievement })}
                            disabled={notificationLoading}
                          >
                            {notificationLoading ? 'Updating...' : notificationSettings.email ? 'On' : 'Off'}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Achievement alerts</span>
                          <Button 
                            size="sm" 
                            variant={notificationSettings.achievement ? 'success' : 'outline'} 
                            onClick={() => updateNotificationSettings({ email: notificationSettings.email, achievement: !notificationSettings.achievement })}
                            disabled={notificationLoading}
                          >
                            {notificationLoading ? 'Updating...' : notificationSettings.achievement ? 'On' : 'Off'}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-4">Privacy</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Public profile</span>
                          <Button size="sm" variant="outline">Toggle</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Show achievements</span>
                          <Button size="sm" variant="outline">Toggle</Button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border/50">
                      <Button type="button" variant="destructive" onClick={handleDeleteAccount}>
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;