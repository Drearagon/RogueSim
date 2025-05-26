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
      if (!isLogin && formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          hackerName: formData.hackerName,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Trigger auth success callback to update UI
        onAuthSuccess(data.user || {});
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (error) {
      setError('Connection error. Please try again.');
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
                <Label htmlFor="hackerName" className="text-green-400 font-mono">
                  <User className="h-4 w-4 inline mr-2" />
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
                  />
                  {!isLogin && (
                    <Button
                      type="button"
                      onClick={generateHackerName}
                      variant="outline"
                      size="sm"
                      className="border-green-400/50 text-green-400 hover:bg-green-400/10 font-mono"
                    >
                      GEN
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-green-400 font-mono">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="bg-black border-green-400/50 text-green-400 font-mono focus:border-green-400"
                  placeholder="hacker@secure.net"
                />
              </div>

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