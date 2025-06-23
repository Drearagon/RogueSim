import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Lock, Mail, Eye, EyeOff, Terminal, Shield, Key, CheckCircle } from 'lucide-react';
import { MatrixRain } from './MatrixRain';
import { loginUser, registerUser, /*sendVerificationCode*/ verifyEmail } from '@/lib/userStorage';

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
  const [currentStep, setCurrentStep] = useState<'auth' | 'setup' | 'verification'>('auth');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Auth form data
  const [identifier, setIdentifier] = useState(''); // Can be email or hackername
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Profile setup data
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('network');
  const [bio, setBio] = useState('');
  const [requireVerification, setRequireVerification] = useState(true);
  
  // Verification data
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        // Support login with either email or hackername
        const user = await loginUser(identifier, password);
        if (user) {
          onLoginSuccess(user);
        } else {
          setMessage('Invalid credentials. Check your email/hackername and password.');
        }
      } else {
        // Registration flow
        if (password !== confirmPassword) {
          setMessage('Passwords do not match');
          setLoading(false);
          return;
        }
        
        if (password.length < 8) {
          setMessage('Password must be at least 8 characters long');
          setLoading(false);
          return;
        }
        
        // Move to setup step for registration
        // Auto-fill email if identifier was an email
        if (identifier.includes('@')) {
          setEmail(identifier);
        }
        setCurrentStep('setup');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setMessage('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupComplete = async () => {
    if (!username.trim()) {
      setMessage('Please enter a hackername');
      return;
    }
    
    if (!email.trim()) {
      setMessage('Please enter your email address');
      return;
    }

    if (username.length < 3) {
      setMessage('Hackername must be at least 3 characters long');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setMessage('Hackername can only contain letters, numbers, underscores, and hyphens');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      if (requireVerification) {
        // Use full registration with verification flow
        const user = await registerUser({
          hackerName: username,
          email: email,
          password: password,
          requireVerification: true
        });
        
        if (user === null) {
          // Registration successful, need verification
          setVerificationSent(true);
          setCurrentStep('verification');
          setMessage('Registration successful! Check your email for verification code.');
        } else {
          // Should not happen with requireVerification: true
          onLoginSuccess(user);
        }
      } else {
        // Register without verification
        const user = await registerUser({
          hackerName: username,
          email: email,
          password: password,
          requireVerification: false
        });
        
        if (user) {
          onLoginSuccess(user);
        } else {
          setMessage('Registration failed. Hackername or email may already be taken.');
        }
      }
    } catch (error) {
      console.error('Setup error:', error);
      setMessage('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!verificationCode.trim()) {
      setMessage('Please enter the verification code');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const user = await verifyEmail(email, verificationCode);
      if (user) {
        onLoginSuccess(user);
      } else {
        setMessage('Invalid or expired verification code. Please try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setMessage('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationCode = async () => {
    setLoading(true);
    try {
      // Use the same registration flow as initial registration
      const result = await registerUser({
        hackerName: username,
        email: email,
        password: password,
        requireVerification: true
      });
      
      if (result === null) {
        setMessage('New verification code sent to your email.');
      } else {
        setMessage('Failed to resend verification code.');
      }
    } catch (error) {
      setMessage('Failed to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  if (currentStep === 'verification') {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <MatrixRain />
        
        <Card className="w-full max-w-md bg-black/90 border-green-400 backdrop-blur-sm relative z-10">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Key className="h-8 w-8 text-green-400" />
              <h1 className="text-2xl font-mono font-bold text-green-400">EMAIL VERIFICATION</h1>
            </div>
            <CardTitle className="text-green-400 font-mono">Enter Verification Code</CardTitle>
            <p className="text-green-400/70 font-mono text-sm">
              Check your email for the 6-digit verification code
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {message && (
              <div className={`text-center text-sm font-mono p-2 border rounded ${
                message.includes('sent') ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'
              }`}>
                {message}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-green-400 font-mono text-sm">VERIFICATION CODE</label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-green-400" />
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="pl-10 bg-black border-green-400 text-green-400 font-mono text-center text-lg"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                type="button"
                variant="outline"
                onClick={() => setCurrentStep('setup')}
                className="flex-1 border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                disabled={loading}
              >
                BACK
              </Button>
              <Button 
                onClick={handleVerification}
                className="flex-1 bg-green-400 text-black hover:bg-green-500 font-mono"
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? 'VERIFYING...' : 'VERIFY'}
              </Button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={resendVerificationCode}
                className="text-green-400 hover:text-green-300 text-sm font-mono underline"
                disabled={loading}
              >
                Didn't receive code? Resend
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            {message && (
              <div className="text-center text-red-400 text-sm font-mono p-2 border border-red-400 rounded">
                {message}
              </div>
            )}

            <div className="flex justify-center">
              <Avatar className="w-24 h-24 border-2 border-green-400">
                <AvatarImage src={selectedAvatar} />
                <AvatarFallback className="bg-green-400 text-black font-mono">
                  {username.slice(0, 2).toUpperCase() || 'HK'}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-green-400 font-mono text-sm">HACKERNAME *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-green-400" />
                  <Input
                    placeholder="Enter your hacker alias"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                    className="pl-10 bg-black border-green-400 text-green-400 font-mono"
                    required
                  />
                </div>
                <p className="text-green-400/60 text-xs font-mono">
                  3+ chars, letters, numbers, _ and - only
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-green-400 font-mono text-sm">EMAIL ADDRESS *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-green-400" />
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-black border-green-400 text-green-400 font-mono"
                    required
                  />
                </div>
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

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-green-400 font-mono text-sm">
                <input
                  type="checkbox"
                  checked={requireVerification}
                  onChange={(e) => setRequireVerification(e.target.checked)}
                  className="rounded border-green-400"
                />
                EMAIL VERIFICATION (RECOMMENDED)
              </label>
              <p className="text-green-400/60 text-xs font-mono ml-6">
                Verify your email to secure your account and enable password recovery
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                type="button"
                variant="outline"
                onClick={() => setCurrentStep('auth')}
                className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                disabled={loading}
              >
                BACK
              </Button>
              <Button 
                onClick={handleSetupComplete}
                className="flex-1 bg-green-400 text-black hover:bg-green-500 font-mono"
                disabled={loading || !username.trim() || !email.trim()}
              >
                {loading ? 'CREATING...' : requireVerification ? 'SEND VERIFICATION' : 'CREATE ACCOUNT'}
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
              {message && (
                <div className="text-center text-red-400 text-sm font-mono p-2 border border-red-400 rounded">
                  {message}
                </div>
              )}

              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-green-400" />
                  <Input
                    type="text"
                    placeholder={isLogin ? "Email or Hackername" : "Email address"}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-10 bg-black border-green-400 text-green-400 font-mono placeholder:text-green-400/50"
                    required
                  />
                </div>
                {isLogin && (
                  <p className="text-green-400/60 text-xs font-mono">
                    You can login with either your email or hackername
                  </p>
                )}
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
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 bg-black border-green-400 text-green-400 font-mono placeholder:text-green-400/50"
                      required
                    />
                  </div>
                  <p className="text-green-400/60 text-xs font-mono">
                    Password must be at least 8 characters long
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-green-400 text-black hover:bg-green-500 font-mono font-bold"
                disabled={loading}
              >
                {loading ? (isLogin ? 'ACCESSING...' : 'VALIDATING...') : (isLogin ? 'ACCESS NETWORK' : 'NEXT STEP')}
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