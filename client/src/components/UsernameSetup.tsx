import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UsernameSetupProps {
  onUsernameSet: (username: string) => void;
}

export function UsernameSetup({ onUsernameSet }: UsernameSetupProps) {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setError('Username can only contain letters, numbers, underscores, and hyphens');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/user/set-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim() }),
      });

      if (response.ok) {
        onUsernameSet(username.trim());
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to set username');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Matrix rain background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-black/60" />
      </div>

      <Card className="w-full max-w-md bg-gray-900/95 border-green-500/30 relative z-10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-mono text-green-400">
            Welcome to RogueSim
          </CardTitle>
          <p className="text-green-300/70 mt-2">
            Choose your hacker alias to begin your cybersecurity journey
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-mono text-green-400 mb-2">
                Hacker Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username..."
                className="bg-black/60 border-green-500/50 text-green-300 placeholder-green-600/50 font-mono focus:border-green-400"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm font-mono bg-red-900/20 border border-red-500/30 p-2 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-500 text-black font-mono font-bold py-2 px-4 rounded transition-colors"
            >
              {isSubmitting ? 'Setting Username...' : 'Enter the Matrix'}
            </Button>
          </form>

          <div className="mt-6 text-xs text-green-600/60 font-mono space-y-1">
            <p>• Username must be 3+ characters</p>
            <p>• Only letters, numbers, _ and - allowed</p>
            <p>• This will be your permanent identity</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}