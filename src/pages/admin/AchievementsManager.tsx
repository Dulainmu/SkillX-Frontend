import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Award, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Star, 
  Target, 
  TrendingUp,
  Search,
  RefreshCw,
  Download,
  Filter,
  Gift,
  Trophy,
  Medal,
  Crown,
  Zap,
  Heart,
  BookOpen,
  Code2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAllAchievements, createAchievement, updateAchievement, deleteAchievement, assignAchievementToUsers, getAchievementStats, bulkAssignAchievements } from '@/api/adminApi';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'skill' | 'progress' | 'social' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  criteria: {
    type: 'steps_completed' | 'projects_completed' | 'score_threshold' | 'time_spent' | 'submissions_approved';
    value: number;
    career?: string;
  };
  xpReward: number;
  isActive: boolean;
  createdAt: string;
  assignedTo: number;
  unlockRate: number; // percentage of users who have this achievement
}

interface AchievementAnalytics {
  totalAchievements: number;
  activeAchievements: number;
  totalAssignments: number;
  averageUnlockRate: number;
  mostPopular: string;
  leastPopular: string;
}

const AchievementsManager: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [analytics, setAnalytics] = useState<AchievementAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [achievementDialogOpen, setAchievementDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    rarity: 'all',
    status: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [achievementForm, setAchievementForm] = useState({
    name: '',
    description: '',
    icon: 'Award',
    category: 'skill' as 'skill' | 'progress' | 'social' | 'special',
    rarity: 'common' as 'common' | 'rare' | 'epic' | 'legendary',
    criteriaType: 'steps_completed' as 'steps_completed' | 'projects_completed' | 'score_threshold' | 'time_spent' | 'submissions_approved',
    criteriaValue: 0,
    criteriaCareer: '',
    xpReward: 0,
    isActive: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const response = await getAllAchievements({
        category: filters.category === 'all' ? undefined : filters.category,
        rarity: filters.rarity === 'all' ? undefined : filters.rarity,
        status: filters.status === 'all' ? undefined : filters.status,
        search: searchTerm || undefined
      });
      
      setAchievements(response.achievements);
      setAnalytics(response.analytics);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch achievements",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAchievement = async () => {
    try {
      const achievementData = {
        name: achievementForm.name,
        description: achievementForm.description,
        icon: achievementForm.icon,
        category: achievementForm.category,
        rarity: achievementForm.rarity,
        criteria: {
          type: achievementForm.criteriaType,
          value: achievementForm.criteriaValue,
          career: achievementForm.criteriaCareer || undefined
        },
        xpReward: achievementForm.xpReward,
        isActive: achievementForm.isActive
      };

      await createAchievement(achievementData);
      setAchievementDialogOpen(false);
      resetForm();
      fetchAchievements();
      
      toast({
        title: "Success",
        description: "Achievement created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create achievement",
        variant: "destructive"
      });
    }
  };

  const handleUpdateAchievement = async () => {
    if (!selectedAchievement) return;
    
    try {
      const achievementData = {
        name: achievementForm.name,
        description: achievementForm.description,
        icon: achievementForm.icon,
        category: achievementForm.category,
        rarity: achievementForm.rarity,
        criteria: {
          type: achievementForm.criteriaType,
          value: achievementForm.criteriaValue,
          career: achievementForm.criteriaCareer || undefined
        },
        xpReward: achievementForm.xpReward,
        isActive: achievementForm.isActive
      };

      await updateAchievement(selectedAchievement.id, achievementData);
      setAchievementDialogOpen(false);
      setIsEditing(false);
      setSelectedAchievement(null);
      resetForm();
      fetchAchievements();
      
      toast({
        title: "Success",
        description: "Achievement updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update achievement",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAchievement = async (achievementId: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return;
    
    try {
      await deleteAchievement(achievementId);
      fetchAchievements();
      
      toast({
        title: "Success",
        description: "Achievement deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete achievement",
        variant: "destructive"
      });
    }
  };

  const handleEditAchievement = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setAchievementForm({
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      category: achievement.category,
      rarity: achievement.rarity,
      criteriaType: achievement.criteria.type,
      criteriaValue: achievement.criteria.value,
      criteriaCareer: achievement.criteria.career || '',
      xpReward: achievement.xpReward,
      isActive: achievement.isActive
    });
    setIsEditing(true);
    setAchievementDialogOpen(true);
  };

  const resetForm = () => {
    setAchievementForm({
      name: '',
      description: '',
      icon: 'Award',
      category: 'skill',
      rarity: 'common',
      criteriaType: 'steps_completed',
      criteriaValue: 0,
      criteriaCareer: '',
      xpReward: 0,
      isActive: true
    });
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Common</Badge>;
      case 'rare':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Rare</Badge>;
      case 'epic':
        return <Badge variant="default" className="bg-purple-100 text-purple-800">Epic</Badge>;
      case 'legendary':
        return <Badge variant="default" className="bg-orange-100 text-orange-800">Legendary</Badge>;
      default:
        return <Badge variant="outline">{rarity}</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'skill':
        return <Target className="w-4 h-4" />;
      case 'progress':
        return <TrendingUp className="w-4 h-4" />;
      case 'social':
        return <Users className="w-4 h-4" />;
      case 'special':
        return <Star className="w-4 h-4" />;
      default:
        return <Award className="w-4 h-4" />;
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      Award, Star, Trophy, Medal, Crown, Zap, Heart, BookOpen, Code2, TrendingUp, Target, Users
    };
    return iconMap[iconName] || Award;
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        achievement.name.toLowerCase().includes(searchLower) ||
        achievement.description.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Achievements Manager</h1>
          <p className="text-gray-600 mt-1">Create and manage achievements and badges for users</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchAchievements} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => {
            setIsEditing(false);
            setSelectedAchievement(null);
            resetForm();
            setAchievementDialogOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Create Achievement
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
                  <p className="text-sm font-medium text-blue-600">Total Achievements</p>
                  <p className="text-2xl font-bold text-blue-900">{analytics.totalAchievements}</p>
                </div>
                <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Active Achievements</p>
                  <p className="text-2xl font-bold text-green-900">{analytics.activeAchievements}</p>
                </div>
                <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Assignments</p>
                  <p className="text-2xl font-bold text-purple-900">{analytics.totalAssignments}</p>
                </div>
                <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Avg Unlock Rate</p>
                  <p className="text-2xl font-bold text-orange-900">{analytics.averageUnlockRate}%</p>
                </div>
                <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-700" />
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search achievements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="skill">Skill</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="special">Special</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="rarity">Rarity</Label>
              <Select value={filters.rarity} onValueChange={(value) => setFilters({...filters, rarity: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rarities</SelectItem>
                  <SelectItem value="common">Common</SelectItem>
                  <SelectItem value="rare">Rare</SelectItem>
                  <SelectItem value="epic">Epic</SelectItem>
                  <SelectItem value="legendary">Legendary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading achievements...</p>
            </div>
          ) : filteredAchievements.length === 0 ? (
            <div className="text-center py-8">
              <Award className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-900">No achievements found</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or create a new achievement</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAchievements.map((achievement) => {
                const IconComponent = getIconComponent(achievement.icon);
                
                return (
                  <Card key={achievement.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                            <p className="text-sm text-gray-600">{achievement.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getRarityBadge(achievement.rarity)}
                          <Badge variant={achievement.isActive ? "default" : "secondary"}>
                            {achievement.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Category:</span>
                          <div className="flex items-center gap-1">
                            {getCategoryIcon(achievement.category)}
                            <span className="capitalize">{achievement.category}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">XP Reward:</span>
                          <span className="font-medium">{achievement.xpReward} XP</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Assigned to:</span>
                          <span className="font-medium">{achievement.assignedTo} users</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Unlock Rate:</span>
                          <span className="font-medium">{achievement.unlockRate}%</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Criteria:</span>
                          <span className="font-medium text-xs">
                            {achievement.criteria.type.replace('_', ' ')}: {achievement.criteria.value}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAchievement(achievement)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAchievement(achievement.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievement Dialog */}
      <Dialog open={achievementDialogOpen} onOpenChange={setAchievementDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Achievement' : 'Create Achievement'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={achievementForm.name}
                  onChange={(e) => setAchievementForm({...achievementForm, name: e.target.value})}
                  placeholder="Achievement name"
                />
              </div>
              <div>
                <Label htmlFor="icon">Icon</Label>
                <Select value={achievementForm.icon} onValueChange={(value) => setAchievementForm({...achievementForm, icon: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Award">Award</SelectItem>
                    <SelectItem value="Star">Star</SelectItem>
                    <SelectItem value="Trophy">Trophy</SelectItem>
                    <SelectItem value="Medal">Medal</SelectItem>
                    <SelectItem value="Crown">Crown</SelectItem>
                    <SelectItem value="Zap">Zap</SelectItem>
                    <SelectItem value="Heart">Heart</SelectItem>
                    <SelectItem value="BookOpen">BookOpen</SelectItem>
                    <SelectItem value="Code2">Code2</SelectItem>
                    <SelectItem value="TrendingUp">TrendingUp</SelectItem>
                    <SelectItem value="Target">Target</SelectItem>
                    <SelectItem value="Users">Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={achievementForm.description}
                onChange={(e) => setAchievementForm({...achievementForm, description: e.target.value})}
                placeholder="Achievement description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={achievementForm.category} onValueChange={(value: 'skill' | 'progress' | 'social' | 'special') => setAchievementForm({...achievementForm, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skill">Skill</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rarity">Rarity</Label>
                <Select value={achievementForm.rarity} onValueChange={(value: 'common' | 'rare' | 'epic' | 'legendary') => setAchievementForm({...achievementForm, rarity: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="legendary">Legendary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="criteriaType">Criteria Type</Label>
                <Select value={achievementForm.criteriaType} onValueChange={(value: 'steps_completed' | 'projects_completed' | 'score_threshold' | 'time_spent' | 'submissions_approved') => setAchievementForm({...achievementForm, criteriaType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="steps_completed">Steps Completed</SelectItem>
                    <SelectItem value="projects_completed">Projects Completed</SelectItem>
                    <SelectItem value="score_threshold">Score Threshold</SelectItem>
                    <SelectItem value="time_spent">Time Spent</SelectItem>
                    <SelectItem value="submissions_approved">Submissions Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="criteriaValue">Criteria Value</Label>
                <Input
                  id="criteriaValue"
                  type="number"
                  value={achievementForm.criteriaValue}
                  onChange={(e) => setAchievementForm({...achievementForm, criteriaValue: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="xpReward">XP Reward</Label>
                <Input
                  id="xpReward"
                  type="number"
                  value={achievementForm.xpReward}
                  onChange={(e) => setAchievementForm({...achievementForm, xpReward: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={achievementForm.isActive}
                  onChange={(e) => setAchievementForm({...achievementForm, isActive: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAchievementDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={isEditing ? handleUpdateAchievement : handleCreateAchievement}>
                {isEditing ? 'Update' : 'Create'} Achievement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AchievementsManager;
