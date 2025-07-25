import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MatrixRain } from './MatrixRain';
import { Terminal, User, Mail, Lock, UserPlus } from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (user: any) => void;
}

interface UserProfile {
  hackerName: string;
  email: string;
  profilePicture: string;
  reputation: string;
  specialization: string;
  bio: string;
  favoriteCommands: string[];
  achievements: string[];
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [formData, setFormData] = useState({
    hackerName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate email format if provided
      if (!isLogin && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      // Check password match for registration
      if (!isLogin && formData.password !== formData.confirmPassword) {
        setError('Passwords do not match. Please ensure both password fields are identical.');
        setIsLoading(false);
        return;
      }

      // Validate password strength for registration
      if (!isLogin && formData.password.length < 6) {
        setError('Password must be at least 6 characters long for security.');
        setIsLoading(false);
        return;
      }

      // Validate hacker name for registration
      if (!isLogin) {
        if (!formData.hackerName || formData.hackerName.trim().length < 3) {
          setError('Hacker name must be at least 3 characters long.');
          setIsLoading(false);
          return;
        }
        if (formData.hackerName.length > 20) {
          setError('Hacker name must be no more than 20 characters.');
          setIsLoading(false);
          return;
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(formData.hackerName)) {
          setError('Hacker name can only contain letters, numbers, hyphens, and underscores.');
          setIsLoading(false);
          return;
        }
      }

      // Use localStorage-based authentication for independent deployment
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
      
      if (isLogin) {
        // Login logic - allow login with either hacker name OR email
        let storedUser = null;
        
        // Check if input is email format
        const isEmailInput = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.hackerName || formData.email);
        
        if (isEmailInput) {
          // Login with email - search all users for matching email
          const inputEmail = formData.hackerName || formData.email;
          storedUser = Object.values(existingUsers).find((user: any) => 
            user.email === inputEmail && user.password === formData.password
          );
        } else {
          // Login with hacker name - need both hacker name and email
          const userKey = `${formData.hackerName}_${formData.email}`;
          storedUser = existingUsers[userKey];
          if (storedUser && storedUser.password !== formData.password) {
            storedUser = null;
          }
        }
        
        if (!storedUser) {
          setError('Invalid credentials. Please check your username/email and password.');
          setIsLoading(false);
          return;
        }
        
        // Successful login
        const userData = {
          id: storedUser.id,
          hackerName: storedUser.hackerName,
          email: storedUser.email,
          profileImageUrl: `https://api.dicebear.com/7.x/cyberpunk/svg?seed=${storedUser.hackerName}`,
          createdAt: storedUser.createdAt
        };
        
        localStorage.setItem('authenticated', 'true');
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Trigger auth success callback immediately
        onAuthSuccess(userData);
      } else {
        // Registration logic
        const userKey = `${formData.hackerName}_${formData.email}`;
        
        // Check if user already exists
        if (existingUsers[userKey]) {
          setError('Account already exists with this hacker name and email combination.');
          setIsLoading(false);
          return;
        }
        
        // Create new user
        const newUser = {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          hackerName: formData.hackerName,
          email: formData.email,
          password: formData.password,
          createdAt: new Date().toISOString()
        };
        
        // Store user in localStorage
        existingUsers[userKey] = newUser;
        localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
        
        // Create user data for session
        const userData = {
          id: newUser.id,
          hackerName: newUser.hackerName,
          email: newUser.email,
          profileImageUrl: `https://api.dicebear.com/7.x/cyberpunk/svg?seed=${newUser.hackerName}`,
          createdAt: newUser.createdAt
        };
        
        localStorage.setItem('authenticated', 'true');
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Trigger auth success callback
        onAuthSuccess(userData);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('Authentication failed. Please try again.');
    }

    setIsLoading(false);
  };

  const generateHackerName = () => {
    const prefixes = ['Cyber', 'Neo', 'Dark', 'Ghost', 'Shadow', 'Binary', 'Quantum', 'Void', 'Neon', 'Crypto'];
    const suffixes = ['Phantom', 'Walker', 'Runner', 'Hacker', 'Coder', 'Agent', 'Ninja', 'Wolf', 'Fox', 'Raven'];
    const numbers = Math.floor(Math.random() * 999) + 1;
    
    const name = `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}${numbers}`;
    setFormData(prev => ({ ...prev, hackerName: name }));
  };

  return (
    <div className="min-h-screen bg-black text-green-400 relative overflow-hidden">
      <MatrixRain />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-black/90 border-green-400 backdrop-blur">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Terminal className="h-8 w-8 text-green-400" />
              <CardTitle className="text-2xl font-mono text-green-400">
                {isLogin ? 'ACCESS TERMINAL' : 'CREATE PROFILE'}
              </CardTitle>
            </div>
            <p className="text-green-400/70 font-mono text-sm">
              {isLogin ? 'Enter your credentials to access the network' : 'Join the elite hacker collective'}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                  <p className="text-red-400 font-mono text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-green-400 font-mono">
                  <User className="h-4 w-4 inline mr-2" />
                  {isLogin ? 'Username / Email' : 'Email'}
                </Label>
                <Input
                  id="username"
                  type={isLogin ? "text" : "email"}
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="bg-black border-green-400/50 text-green-400 font-mono focus:border-green-400"
                  placeholder={isLogin ? "Enter hacker name or email" : "hacker@secure.net"}
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="hackerName" className="text-green-400 font-mono">
                    <Terminal className="h-4 w-4 inline mr-2" />
                    Hacker Name
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="hackerName"
                      type="text"
                      value={formData.hackerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, hackerName: e.target.value }))}
                      required
                      className="bg-black border-green-400/50 text-green-400 font-mono focus:border-green-400"
                      placeholder="Enter your hacker alias"
                      maxLength={20}
                    />
                    <Button
                      type="button"
                      onClick={generateHackerName}
                      variant="outline"
                      size="sm"
                      className="border-green-400/50 text-green-400 hover:bg-green-400/10 font-mono"
                    >
                      GEN
                    </Button>
                  </div>
                  <p className="text-xs text-green-400/60 font-mono">
                    3-20 characters, letters, numbers, hyphens, and underscores only
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-green-400 font-mono">
                  <Lock className="h-4 w-4 inline mr-2" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  className="bg-black border-green-400/50 text-green-400 font-mono focus:border-green-400"
                  placeholder="Enter secure password"
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-green-400 font-mono">
                    <Lock className="h-4 w-4 inline mr-2" />
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    className="bg-black border-green-400/50 text-green-400 font-mono focus:border-green-400"
                    placeholder="Confirm your password"
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-400 text-black hover:bg-green-500 font-mono"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
                    {isLogin ? 'ACCESSING...' : 'CREATING...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {isLogin ? <Terminal className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                    {isLogin ? 'ACCESS NETWORK' : 'JOIN COLLECTIVE'}
                  </div>
                )}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-green-400/70 hover:text-green-400 font-mono text-sm"
                >
                  {isLogin 
                    ? "Need access? Create new profile" 
                    : "Already have access? Login here"
                  }
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}