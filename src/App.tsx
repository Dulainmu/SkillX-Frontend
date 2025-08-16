import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { CareerProvider } from '@/contexts/CareerContext';
import { QuizProvider } from '@/contexts/QuizContext';
import { AuthWrapper } from '@/components/AuthWrapper';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import ResetPassword from '@/pages/ResetPassword';
import CareerAssessment from '@/pages/CareerAssessment';
import CareerRoadmap from '@/pages/CareerRoadmap';
import LearningJourney from '@/pages/LearningJourney';
import EnhancedLearningJourney from '@/pages/EnhancedLearningJourney';
import LearningResources from './pages/LearningResources';
import BrowseCareers from '@/pages/BrowseCareers';
import MentorDashboard from '@/pages/MentorDashboard';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import CareerPaths from '@/pages/admin/CareerPaths';
import Skills from '@/pages/admin/Skills';
import LearningMaterials from '@/pages/admin/Materials';
import Quizzes from '@/pages/admin/Quizzes';
import Projects from '@/pages/admin/Projects';
import Users from '@/pages/admin/Users';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CareerProvider>
          <QuizProvider>
            <AuthWrapper>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/career-assessment" element={<CareerAssessment />} />
                <Route path="/career-roadmap/:careerId" element={<CareerRoadmap />} />
                <Route path="/learning-journey/:careerId" element={<LearningJourney />} />
                <Route path="/enhanced-learning-journey/:careerId" element={<EnhancedLearningJourney />} />
                <Route path="/learning-resources/:careerId/:stepId/:skillId" element={<LearningResources />} />
                <Route path="/browse-careers" element={<BrowseCareers />} />
                <Route path="/mentor-dashboard" element={<MentorDashboard />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthWrapper>
            <Toaster />
          </QuizProvider>
        </CareerProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;


