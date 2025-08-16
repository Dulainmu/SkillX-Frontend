import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, User, Lock, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/config/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMentorLoading, setIsMentorLoading] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const { toast } = useToast();
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(getApiUrl('/api/users/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (response.ok) {
        if (rememberMe) {
          localStorage.setItem('skillx-token', data.token);
          localStorage.setItem('skillx-role', data.role);
        } else {
          sessionStorage.setItem('skillx-token', data.token);
          sessionStorage.setItem('skillx-role', data.role);
        }
        setUser({ id: data.id || data._id, name: data.name, role: data.role });
        
        // Check if there's pending assessment data to restore
        const pendingAssessment = localStorage.getItem('skillx-pending-assessment');
        if (pendingAssessment) {
          localStorage.removeItem('skillx-pending-assessment');
          toast({
            title: "Assessment Restored",
            description: "Your assessment progress has been restored. You can continue where you left off.",
          });
        }
        
        toast({
          title: "Welcome back!",
          description: `Successfully logged in as ${data.name}`,
        });
        
        // Navigate based on role or redirect parameter
        if (data.role === 'mentor') {
          navigate('/mentor-dashboard');
        } else if (redirectTo) {
          navigate(redirectTo);
        } else {
          navigate('/dashboard');
        }
      } else {
        toast({
          title: "Login Failed",
          description: data.message || 'Invalid email or password. Please try again.',
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please check your internet connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMentorLogin = async () => {
    setIsMentorLoading(true);
    const mentorEmail = 'mentor1@example.com';
    const mentorPassword = 'mentor1password';
    
    try {
      const response = await fetch(getApiUrl('/api/users/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: mentorEmail, password: mentorPassword })
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('skillx-token', data.token);
        localStorage.setItem('skillx-role', data.role);
        setUser({
          id: data.id || data._id || 'mentor',
          name: data.name || 'Mentor',
          role: data.role
        });
        
        // Check if there's pending assessment data to restore
        const pendingAssessment = localStorage.getItem('skillx-pending-assessment');
        if (pendingAssessment) {
          localStorage.removeItem('skillx-pending-assessment');
          toast({
            title: "Assessment Restored",
            description: "Your assessment progress has been restored. You can continue where you left off.",
          });
        }
        
        toast({
          title: "Mentor Login Successful",
          description: `Welcome back, ${data.name || 'Mentor'}!`,
        });
        
        if (data.role === 'mentor') {
          navigate('/mentor-dashboard');
        } else {
          toast({
            title: "Role Error",
            description: "This account is not a mentor account.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Mentor Login Failed",
          description: data.message || 'Mentor login failed. Please try again.',
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please check your internet connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsMentorLoading(false);
    }
  };

  const ADMIN_EMAIL = 'admin@skillx.com';
  const ADMIN_PASS = 'SkillXAdmin!2024';

  const handleAdminLogin = async () => {
    setIsAdminLoading(true);
    const adminEmail = ADMIN_EMAIL;
    const adminPassword = ADMIN_PASS;
    
    try {
      const response = await fetch(getApiUrl('/api/users/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('skillx-token', data.token);
        localStorage.setItem('skillx-role', data.role);
        setUser({
          id: data.id || data._id || 'admin',
          name: data.name || 'Admin',
          role: data.role
        });
        
        // Check if there's pending assessment data to restore
        const pendingAssessment = localStorage.getItem('skillx-pending-assessment');
        if (pendingAssessment) {
          localStorage.removeItem('skillx-pending-assessment');
          toast({
            title: "Assessment Restored",
            description: "Your assessment progress has been restored. You can continue where you left off.",
          });
        }
        
        toast({
          title: "Admin Login Successful",
          description: `Welcome back, ${data.name || 'Admin'}!`,
        });
        
        if (data.role === 'admin') {
          navigate('/admin');
        } else {
          toast({
            title: "Role Error",
            description: "This account is not an admin account.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Admin Login Failed",
          description: data.message || 'Admin login failed. Please try again.',
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please check your internet connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold text-primary">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to your SkillX account to continue your career journey
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="h-11"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="h-11 pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                  />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-primary hover:underline bg-transparent border-0 p-0 m-0"
                  onClick={() => setShowForgot(true)}
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button 
                id="login-submit"
                type="submit" 
                className="w-full h-11 text-base font-medium"
                variant="default"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
              
              <Button 
                type="button" 
                className="w-full h-11 text-base font-medium"
                variant="outline"
                onClick={handleMentorLogin}
                disabled={isMentorLoading || isLoading}
              >
                {isMentorLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 mr-2" />
                    Sign In as Mentor
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                className="w-full h-11 text-base font-medium"
                variant="secondary"
                onClick={handleAdminLogin}
                disabled={isAdminLoading || isLoading}
              >
                {isAdminLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 mr-2" />
                    Admin Login
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Create one here
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            By signing in, you agree to our{' '}
            <Link to="#" className="text-primary hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link to="#" className="text-primary hover:underline">Privacy Policy</Link>
          </p>
        </div>
        
        <Dialog open={showForgot} onOpenChange={setShowForgot}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset your password</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label htmlFor="forgot-email">Email Address</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                required
                disabled={isForgotLoading}
              />
            </div>
            <DialogFooter>
              <Button
                onClick={async () => {
                  if (!forgotEmail) {
                    toast({ 
                      title: 'Error', 
                      description: 'Please enter your email address.', 
                      variant: 'destructive' 
                    });
                    return;
                  }
                  
                  setIsForgotLoading(true);
                  try {
                    const response = await fetch(getApiUrl('/api/users/forgot-password'), {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: forgotEmail })
                    });
                    
                    const data = await response.json();
                    setShowForgot(false);
                    setForgotEmail('');
                    toast({ 
                      title: 'Reset Link Sent', 
                      description: data.message || 'If this email is registered, a reset link has been sent.' 
                    });
                  } catch (error) {
                    toast({ 
                      title: 'Error', 
                      description: 'Failed to send reset link. Please try again.', 
                      variant: 'destructive' 
                    });
                  } finally {
                    setIsForgotLoading(false);
                  }
                }}
                className="w-full"
                disabled={isForgotLoading}
              >
                {isForgotLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <div className="text-center text-xs text-muted-foreground mt-4">
          <div className="mb-1">Admin Test Account:</div>
          <div>Email: <span className="font-mono">{ADMIN_EMAIL}</span></div>
          <div>Password: <span className="font-mono">{ADMIN_PASS}</span></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
