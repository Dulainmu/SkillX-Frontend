import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Quiz from "./pages/Quiz";
import Recommendations from "./pages/Recommendations";
import CareerRoadmap from "./pages/CareerRoadmap";
import CareerStart from "./pages/CareerStart";
import Dashboard from "./pages/Dashboard";
import MentorDashboard from "./pages/MentorDashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { QuizProvider } from "./contexts/QuizContext";
import { useCareer } from "./contexts/CareerContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import BrowseCareers from "./pages/BrowseCareers";


const queryClient = new QueryClient();

const AppRoutes = () => {
  const { hasStartedCareer } = useCareer();

  return (
    <Routes>
      <Route path="/" element={hasStartedCareer ? <Dashboard /> : <Login />} />
      <Route path="/home" element={hasStartedCareer ? <Dashboard /> : <Index />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/quiz" element={hasStartedCareer ? <Dashboard /> : <Quiz />} />
      <Route path="/recommendations" element={hasStartedCareer ? <Dashboard /> : <Recommendations />} />
      <Route path="/career/:careerId" element={<CareerStart />} />
      <Route path="/career-roadmap/:careerId" element={<CareerRoadmap />} />
      <Route path="/browse-careers" element={hasStartedCareer ? <Dashboard /> : <BrowseCareers />} />
      <Route path="/mentor-dashboard" element={<MentorDashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <QuizProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QuizProvider>
  </QueryClientProvider>
);

export default App;


