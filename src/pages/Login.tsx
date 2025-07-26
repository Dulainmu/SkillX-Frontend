import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/api/users/login', {
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
        if (data.role === 'mentor') {
          navigate('/mentor-dashboard');
        } else {
          navigate('/home');
        }
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      alert('Login failed. Please try again.');
    }
  };

  const handleMentorLogin = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok && data.role === 'mentor') {
        localStorage.setItem('skillx-token', data.token);
        localStorage.setItem('skillx-role', data.role);
        navigate('/mentor-dashboard');
      } else if (response.ok) {
        alert('You are not a mentor.');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      alert('Login failed. Please try again.');
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
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
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
                  />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-primary hover:underline bg-transparent border-0 p-0 m-0"
                  onClick={() => setShowForgot(true)}
                >
                  Forgot password?
                </button>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-medium"
                variant="default"
              >
                <Lock className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button 
                type="button" 
                className="w-full h-11 text-base font-medium"
                variant="outline"
                onClick={handleMentorLogin}
              >
                <User className="w-4 h-4 mr-2" />
                Sign In as Mentor
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
              />
            </div>
            <DialogFooter>
              <Button
                onClick={async () => {
                  if (!forgotEmail) {
                    toast({ title: 'Error', description: 'Please enter your email address.', variant: 'destructive' });
                    return;
                  }
                  
                  try {
                    const response = await fetch('http://localhost:4000/api/users/forgot-password', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: forgotEmail })
                    });
                    
                    const data = await response.json();
                    setShowForgot(false);
                    setForgotEmail('');
                    toast({ title: 'Reset Link Sent', description: data.message || 'If this email is registered, a reset link has been sent.' });
                  } catch (error) {
                    toast({ title: 'Error', description: 'Failed to send reset link. Please try again.', variant: 'destructive' });
                  }
                }}
                className="w-full"
              >
                Send Reset Link
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Login;
