import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Lock, Mail, Eye, EyeOff, Terminal, Shield } from 'lucide-react';
import { MatrixRain } from './MatrixRain';
import { loginUser, registerUser } from '@/lib/userStorage';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

const specializations = [
  { id: 'network', name: 'Network Infiltration', icon: '🌐', description: 'WiFi and network security expert' },
  { id: 'social', name: 'Social Engineering', icon: '🎭', description: 'Human psychology manipulation specialist' },
  { id: 'crypto', name: 'Cryptography', icon: '🔐', description: 'Encryption and decryption master' },
  { id: 'hardware', name: 'Hardware Hacking', icon: '⚡', description: 'Physical device exploitation expert' },
  { id: 'stealth', name: 'Stealth Operations', icon: '👻', description: 'Invisible penetration specialist' },
  { id: 'data', name: 'Data Extraction', icon: '💾', description: 'Information gathering and analysis expert' }
];

const avatarOptions = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=hacker1&backgroundColor=00ff00',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=hacker2&backgroundColor=00ffff',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=hacker3&backgroundColor=ff00ff',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=hacker4&backgroundColor=ff8800',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=hacker5&backgroundColor=8800ff',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=hacker6&backgroundColor=ff0080'
];

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState<'auth' | 'setup'>('auth');
  const [loading, setLoading] = useState(false);
  
  // Auth form data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Profile setup data
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('network');
  const [bio, setBio] = useState('');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Attempt to login with backend API
        const user = await loginUser(email, password);
        if (user) {
          onLoginSuccess(user);
        } else {
          alert('Invalid credentials. Please check your email and password.');
        }
        setLoading(false);
      } else {
        // Proceed to setup for new users
        if (password !== confirmPassword) {
          alert('Passwords do not match');
          setLoading(false);
          return;
        }
        setCurrentStep('setup');
        setLoading(false);
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Authentication failed. Please try again.');
      setLoading(false);
    }
  };

  const handleSetupComplete = async () => {
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }

    setLoading(true);
    
    try {
      // Register user with backend API
      const user = await registerUser({
        hackerName: username,
        email: email,
        password: password
      });
      
      if (user) {
        onLoginSuccess(user);
      } else {
        alert('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (currentStep === 'setup') {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <MatrixRain />
        
        <Card className="w-full max-w-2xl bg-black/90 border-green-400 backdrop-blur-sm relative z-10">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-green-400" />
              <h1 className="text-2xl font-mono font-bold text-green-400">PROFILE SETUP</h1>
            </div>
            <CardTitle className="text-green-400 font-mono">Configure Your Hacker Identity</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <Avatar className="w-24 h-24 border-2 border-green-400">
                <AvatarImage src={selectedAvatar} />
                <AvatarFallback className="bg-green-400 text-black font-mono">
                  {username.slice(0, 2).toUpperCase() || 'HK'}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-2">
              <label className="text-green-400 font-mono text-sm">USERNAME</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-green-400" />
                <Input
                  placeholder="Enter your hacker alias"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-black border-green-400 text-green-400 font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-green-400 font-mono text-sm">AVATAR</label>
              <div className="grid grid-cols-3 gap-3">
                {avatarOptions.map((avatar, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`relative aspect-square rounded border-2 overflow-hidden transition-all ${
                      selectedAvatar === avatar
                        ? 'border-green-400 ring-2 ring-green-400/50'
                        : 'border-green-400/30 hover:border-green-400/60'
                    }`}
                  >
                    <Avatar className="w-full h-full">
                      <AvatarImage src={avatar} />
                      <AvatarFallback className="bg-green-400/20 text-green-400 font-mono">
                        #{index + 1}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-green-400 font-mono text-sm">SPECIALIZATION</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {specializations.map((spec) => (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => setSelectedSpecialization(spec.id)}
                    className={`p-3 border rounded text-left transition-colors ${
                      selectedSpecialization === spec.id
                        ? 'border-green-400 bg-green-400/10'
                        : 'border-green-400/30 hover:border-green-400/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{spec.icon}</span>
                      <span className="text-green-400 font-mono text-sm font-bold">{spec.name}</span>
                    </div>
                    <p className="text-green-400/70 text-xs font-mono">{spec.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-green-400 font-mono text-sm">BIO (OPTIONAL)</label>
              <textarea
                placeholder="Brief description of your hacking philosophy..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 bg-black border border-green-400 text-green-400 font-mono text-sm rounded resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button 
                type="button"
                variant="outline"
                onClick={() => setCurrentStep('auth')}
                className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
              >
                BACK
              </Button>
              <Button 
                onClick={handleSetupComplete}
                className="flex-1 bg-green-400 text-black hover:bg-green-500 font-mono"
                disabled={loading}
              >
                {loading ? 'CREATING ACCOUNT...' : 'ENTER THE MATRIX'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      <MatrixRain />
      
      <Card className="w-full max-w-md bg-black/90 border-green-400 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Terminal className="h-8 w-8 text-green-400" />
            <h1 className="text-2xl font-mono font-bold text-green-400">RogueSim</h1>
          </div>
          <CardTitle className="text-green-400 font-mono">
            ACCESS TERMINAL
          </CardTitle>
          <p className="text-green-400/70 font-mono text-sm">
            Enter the digital underworld
          </p>
        </CardHeader>
        
        <CardContent>
          <Tabs value={isLogin ? 'login' : 'register'} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-black border border-green-400">
              <TabsTrigger 
                value="login" 
                onClick={() => setIsLogin(true)}
                className="data-[state=active]:bg-green-400 data-[state=active]:text-black font-mono"
              >
                LOGIN
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                onClick={() => setIsLogin(false)}
                className="data-[state=active]:bg-green-400 data-[state=active]:text-black font-mono"
              >
                REGISTER
              </TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleAuthSubmit} className="space-y-4 mt-6">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-green-400" />
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-black border-green-400 text-green-400 font-mono placeholder:text-green-400/50"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-green-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-black border-green-400 text-green-400 font-mono placeholder:text-green-400/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-green-400 hover:text-green-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              {!isLogin && (
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-green-400" />
                    <Input
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 bg-black border-green-400 text-green-400 font-mono placeholder:text-green-400/50"
                      required
                    />
                  </div>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-green-400 text-black hover:bg-green-500 font-mono"
                disabled={loading}
              >
                {loading ? 'PROCESSING...' : (isLogin ? 'ACCESS GRANTED' : 'CREATE ACCOUNT')}
              </Button>
            </form>
          </Tabs>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-green-400/70 font-mono">
              SECURE CONNECTION • ENCRYPTED TRANSMISSION
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}