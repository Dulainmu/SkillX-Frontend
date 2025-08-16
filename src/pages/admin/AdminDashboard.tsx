import React, { useEffect, useState } from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import CareerPaths from './CareerPaths';
import Quizzes from './Quizzes';
import LearningJourneyManager from './LearningJourneyManager';
import ProjectSubmissionsManager from './ProjectSubmissionsManager';
import UserProgressManager from './UserProgressManager';
import Users from './Users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getApiUrl } from '@/config/api';
import { 
  BookOpen, 
  FileText, 
  HelpCircle, 
  Users as UsersIcon, 
  Target, 
  TrendingUp,
  BarChart3,
  Settings,
  LogOut,
  Home,
  Activity
} from 'lucide-react';

const isAdmin = () => {
  return localStorage.getItem('skillx-role') === 'admin';
};

const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState({
    users: 0,
    completions: 0,
    avgQuizScore: 0,
    avgProjectScore: 0,
    activeToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('skillx-token');
        const res = await fetch(getApiUrl('/api/users/admin/analytics'), {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error(`Failed to fetch analytics (${res.status})`);
        const data = await res.json();
        setAnalytics(data);
      } catch (e: any) {
        setError(e.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('skillx-token');
    localStorage.removeItem('skillx-role');
    localStorage.removeItem('skillx-user');
    window.location.href = '/';
  };

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md p-8 shadow-xl border-0">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">You need admin privileges to access this dashboard.</p>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const navigationItems = [
    {
      path: '/admin',
      label: 'Overview',
      icon: Home,
      exact: true
    },
    {
      path: '/admin/career-paths',
      label: 'Career Paths',
      icon: Target
    },
    {
      path: '/admin/learning-journeys',
      label: 'Learning Journeys',
      icon: BookOpen
    },
    {
      path: '/admin/project-submissions',
      label: 'Project Submissions',
      icon: FileText
    },
    {
      path: '/admin/user-progress',
      label: 'User Progress',
      icon: TrendingUp
    },
    {
      path: '/admin/quizzes',
      label: 'Quizzes',
      icon: HelpCircle
    },
    {
      path: '/admin/users',
      label: 'Users',
      icon: UsersIcon
    }
  ];

  const isActiveRoute = (path: string, exact: boolean = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">Skill-X Admin</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Activity className="w-3 h-3 mr-1" />
                Admin
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="mt-8 px-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.path, item.exact);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={
                <div className="space-y-8">
                  {/* Welcome Section */}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600">Manage your learning platform and monitor user progress.</p>
                  </div>

                  {/* Analytics Cards */}
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[...Array(4)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                          <CardContent className="p-6">
                            <div className="h-8 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : error ? (
                    <Card className="border-red-200 bg-red-50">
                      <CardContent className="p-6 text-center">
                        <div className="text-red-600 mb-2">Failed to load analytics</div>
                        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                          Retry
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-blue-100">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-600">Total Users</p>
                              <p className="text-2xl font-bold text-blue-900">{analytics.users}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                              <UsersIcon className="w-6 h-6 text-blue-700" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-green-100">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-green-600">Completions</p>
                              <p className="text-2xl font-bold text-green-900">{analytics.completions}</p>
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
                              <p className="text-sm font-medium text-purple-600">Avg Quiz Score</p>
                              <p className="text-2xl font-bold text-purple-900">{analytics.avgQuizScore}%</p>
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
                              <p className="text-sm font-medium text-orange-600">Active Today</p>
                              <p className="text-2xl font-bold text-orange-900">{analytics.activeToday}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">
                              <TrendingUp className="w-6 h-6 text-orange-700" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <Link to="/admin/learning-journeys">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Learning Journeys</h3>
                              <p className="text-sm text-gray-600">Manage roadmap steps and projects</p>
                            </div>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>

                    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <Link to="/admin/project-submissions">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Project Submissions</h3>
                              <p className="text-sm text-gray-600">Review and manage submissions</p>
                            </div>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>

                    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <Link to="/admin/user-progress">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                              <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">User Progress</h3>
                              <p className="text-sm text-gray-600">Monitor user progress and analytics</p>
                            </div>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>

                    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <Link to="/admin/users">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <UsersIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">User Management</h3>
                              <p className="text-sm text-gray-600">View and manage user accounts</p>
                            </div>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  </div>
                </div>
              } />
              <Route path="career-paths" element={<CareerPaths />} />
              <Route path="learning-journeys" element={<LearningJourneyManager />} />
              <Route path="project-submissions" element={<ProjectSubmissionsManager />} />
              <Route path="user-progress" element={<UserProgressManager />} />
              <Route path="quizzes" element={<Quizzes />} />
              <Route path="users" element={<Users />} />
              <Route path="*" element={
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
                    <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
                    <Link to="/admin" className="text-blue-600 hover:text-blue-700 font-medium">
                      ← Back to Dashboard
                    </Link>
                  </div>
                </div>
              } />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
