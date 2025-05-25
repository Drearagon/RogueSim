import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Lock, Mail, Upload, Eye, EyeOff, Terminal, Zap } from 'lucide-react';
import { MatrixRain } from './MatrixRain';
import { apiRequest } from '@/lib/queryClient';

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

const defaultAvatars = [
  '/avatars/hacker-1.jpg',
  '/avatars/hacker-2.jpg', 
  '/avatars/hacker-3.jpg',
  '/avatars/hacker-4.jpg',
  '/avatars/cyberpunk-1.jpg',
  '/avatars/cyberpunk-2.jpg',
  '/avatars/matrix-1.jpg',
  '/avatars/matrix-2.jpg'
];

const specializations = [
  { id: 'network', name: 'Network Infiltration', icon: '🌐', description: 'WiFi and network security expert' },
  { id: 'social', name: 'Social Engineering', icon: '🎭', description: 'Human psychology manipulation specialist' },
  { id: 'crypto', name: 'Cryptography', icon: '🔐', description: 'Encryption and decryption master' },
  { id: 'hardware', name: 'Hardware Hacking', icon: '⚡', description: 'Physical device exploitation expert' },
  { id: 'stealth', name: 'Stealth Operations', icon: '👻', description: 'Invisible penetration specialist' },
  { id: 'data', name: 'Data Extraction', icon: '💾', description: 'Information gathering and analysis expert' }
];

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState<'auth' | 'profile' | 'customization'>('auth');
  const [loading, setLoading] = useState(false);
  
  // Auth form data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Profile data
  const [profile, setProfile] = useState<UserProfile>({
    hackerName: '',
    email: '',
    profilePicture: defaultAvatars[0],
    reputation: 'UNKNOWN',
    specialization: 'network',
    bio: '',
    favoriteCommands: [],
    achievements: []
  });

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login logic
        const response = await apiRequest({
          url: '/api/auth/login',
          method: 'POST',
          body: { email, password }
        });
        
        if (response.user) {
          onAuthSuccess(response.user);
        }
      } else {
        // Registration - move to profile setup
        if (password !== confirmPassword) {
          alert('Passwords do not match');
          setLoading(false);
          return;
        }
        
        setProfile(prev => ({ ...prev, email }));
        setCurrentStep('profile');
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.hackerName.trim()) {
      alert('Please enter a hacker name');
      return;
    }
    setCurrentStep('customization');
  };

  const handleComplete = async () => {
    setLoading(true);
    
    try {
      const response = await apiRequest({
        url: '/api/auth/register',
        method: 'POST',
        body: {
          email,
          password,
          profile
        }
      });
      
      onAuthSuccess(response.user);
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedSpecialization = specializations.find(s => s.id === profile.specialization);

  if (currentStep === 'auth') {
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
              {isLogin ? 'ACCESS TERMINAL' : 'CREATE ACCOUNT'}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <Tabs value={isLogin ? 'login' : 'register'} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-black border border-green-400">
                <TabsTrigger 
                  value="login" 
                  onClick={() => setIsLogin(true)}
                  className="data-[state=active]:bg-green-400 data-[state=active]:text-black"
                >
                  LOGIN
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  onClick={() => setIsLogin(false)}
                  className="data-[state=active]:bg-green-400 data-[state=active]:text-black"
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
                      className="pl-10 bg-black border-green-400 text-green-400 font-mono"
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
                      className="pl-10 pr-10 bg-black border-green-400 text-green-400 font-mono"
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
                        className="pl-10 bg-black border-green-400 text-green-400 font-mono"
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

  if (currentStep === 'profile') {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
        <MatrixRain />
        
        <Card className="w-full max-w-2xl bg-black/90 border-green-400 backdrop-blur-sm relative z-10">
          <CardHeader className="text-center">
            <CardTitle className="text-green-400 font-mono">HACKER PROFILE SETUP</CardTitle>
            <p className="text-green-400/70 font-mono text-sm">Configure your digital identity</p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-green-400 font-mono text-sm">HACKER NAME</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-green-400" />
                    <Input
                      placeholder="Enter your hacker alias"
                      value={profile.hackerName}
                      onChange={(e) => setProfile(prev => ({ ...prev, hackerName: e.target.value }))}
                      className="pl-10 bg-black border-green-400 text-green-400 font-mono"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-green-400 font-mono text-sm">SPECIALIZATION</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {specializations.map((spec) => (
                      <button
                        key={spec.id}
                        type="button"
                        onClick={() => setProfile(prev => ({ ...prev, specialization: spec.id }))}
                        className={`p-3 border rounded text-left transition-colors ${
                          profile.specialization === spec.id
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
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full p-3 bg-black border border-green-400 text-green-400 font-mono text-sm rounded resize-none"
                    rows={3}
                  />
                </div>
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
                  type="submit"
                  className="flex-1 bg-green-400 text-black hover:bg-green-500 font-mono"
                >
                  CONTINUE
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'customization') {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
        <MatrixRain />
        
        <Card className="w-full max-w-2xl bg-black/90 border-green-400 backdrop-blur-sm relative z-10">
          <CardHeader className="text-center">
            <CardTitle className="text-green-400 font-mono">AVATAR CUSTOMIZATION</CardTitle>
            <p className="text-green-400/70 font-mono text-sm">Choose your digital appearance</p>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-center">
                <Avatar className="w-24 h-24 border-2 border-green-400">
                  <AvatarImage src={profile.profilePicture} />
                  <AvatarFallback className="bg-green-400 text-black font-mono">
                    {profile.hackerName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="space-y-2">
                <label className="text-green-400 font-mono text-sm">PROFILE PICTURE</label>
                <div className="grid grid-cols-4 gap-3">
                  {defaultAvatars.map((avatar, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setProfile(prev => ({ ...prev, profilePicture: avatar }))}
                      className={`relative aspect-square rounded border-2 overflow-hidden transition-all ${
                        profile.profilePicture === avatar
                          ? 'border-green-400 ring-2 ring-green-400/50'
                          : 'border-green-400/30 hover:border-green-400/60'
                      }`}
                    >
                      <div className="w-full h-full bg-green-400/20 flex items-center justify-center text-green-400 font-mono">
                        #{index + 1}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-green-400 font-mono text-sm">PROFILE SUMMARY</label>
                <div className="bg-green-400/5 border border-green-400/30 rounded p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border border-green-400">
                      <AvatarImage src={profile.profilePicture} />
                      <AvatarFallback className="bg-green-400 text-black font-mono text-xs">
                        {profile.hackerName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-green-400 font-mono font-bold">{profile.hackerName || 'Unknown_Hacker'}</h3>
                      <p className="text-green-400/70 font-mono text-xs">{profile.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-green-400 text-green-400">
                      {selectedSpecialization?.icon} {selectedSpecialization?.name}
                    </Badge>
                    <Badge variant="outline" className="border-blue-400 text-blue-400">
                      ROOKIE
                    </Badge>
                  </div>
                  
                  {profile.bio && (
                    <p className="text-green-400/80 font-mono text-sm italic">{profile.bio}</p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep('profile')}
                  className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                >
                  BACK
                </Button>
                <Button 
                  onClick={handleComplete}
                  className="flex-1 bg-green-400 text-black hover:bg-green-500 font-mono"
                  disabled={loading}
                >
                  {loading ? 'CREATING ACCOUNT...' : 'COMPLETE SETUP'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}