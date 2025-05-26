import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MatrixRain } from '@/components/MatrixRain';
import { Terminal, Users, Zap, Shield, Brain, Trophy } from 'lucide-react';

export function Landing() {
  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-black text-green-400 relative overflow-hidden">
      <MatrixRain />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 border-b border-green-400/20">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Terminal className="h-8 w-8 text-green-400" />
              <h1 className="text-2xl font-mono font-bold text-green-400">RogueSim</h1>
            </div>
            <Button 
              onClick={handleLogin}
              className="bg-green-400 text-black hover:bg-green-500 font-mono"
            >
              LOGIN / REGISTER
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl md:text-6xl font-mono font-bold text-green-400 leading-tight">
                THE ESP32 HACKER
                <br />
                <span className="text-green-300">TERMINAL GAME</span>
              </h2>
              <p className="text-xl text-green-400/80 font-mono max-w-2xl mx-auto">
                Enter the cyberpunk world of elite hacking. Master realistic terminal commands, 
                complete AI-generated missions, and compete with hackers worldwide.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 my-12">
              <Card className="bg-black/50 border-green-400/30 backdrop-blur">
                <CardHeader>
                  <Brain className="h-8 w-8 text-green-400 mx-auto" />
                  <CardTitle className="text-green-400 font-mono">AI-Powered Missions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-400/70 font-mono text-sm">
                    Procedurally generated hacking challenges that adapt to your skill level
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/50 border-green-400/30 backdrop-blur">
                <CardHeader>
                  <Users className="h-8 w-8 text-green-400 mx-auto" />
                  <CardTitle className="text-green-400 font-mono">Multiplayer Rooms</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-400/70 font-mono text-sm">
                    Team up with other hackers for cooperative missions and competitions
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/50 border-green-400/30 backdrop-blur">
                <CardHeader>
                  <Trophy className="h-8 w-8 text-green-400 mx-auto" />
                  <CardTitle className="text-green-400 font-mono">Global Leaderboards</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-400/70 font-mono text-sm">
                    Compete for the top spot in missions, speed runs, and credit earnings
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <div className="bg-black/70 border border-green-400/30 rounded-lg p-6 font-mono text-left max-w-2xl mx-auto">
                <div className="text-green-400/60 text-sm mb-2">guest@roguesim:~$</div>
                <div className="text-green-400">
                  <span className="text-green-300">scan</span> --target corporate_network
                  <br />
                  <span className="text-green-400/70">› Found 3 vulnerabilities</span>
                  <br />
                  <span className="text-green-300">inject</span> --payload v4_advanced
                  <br />
                  <span className="text-green-400/70">› Access granted. Credits: +2,500₡</span>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={handleLogin}
                  size="lg"
                  className="bg-green-400 text-black hover:bg-green-500 font-mono text-lg px-8 py-3"
                >
                  START HACKING
                </Button>
                <p className="text-green-400/60 font-mono text-sm">
                  Create your hacker profile and begin your journey
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Features */}
        <section className="border-t border-green-400/20 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div className="space-y-2">
                <Terminal className="h-6 w-6 text-green-400 mx-auto" />
                <h3 className="font-mono text-green-400 font-bold">Authentic Commands</h3>
                <p className="text-green-400/60 font-mono text-xs">Real hacking terminal experience</p>
              </div>
              <div className="space-y-2">
                <Zap className="h-6 w-6 text-green-400 mx-auto" />
                <h3 className="font-mono text-green-400 font-bold">Progressive Difficulty</h3>
                <p className="text-green-400/60 font-mono text-xs">Challenges that grow with you</p>
              </div>
              <div className="space-y-2">
                <Shield className="h-6 w-6 text-green-400 mx-auto" />
                <h3 className="font-mono text-green-400 font-bold">Persistent Progress</h3>
                <p className="text-green-400/60 font-mono text-xs">Your achievements are saved</p>
              </div>
              <div className="space-y-2">
                <Users className="h-6 w-6 text-green-400 mx-auto" />
                <h3 className="font-mono text-green-400 font-bold">Global Community</h3>
                <p className="text-green-400/60 font-mono text-xs">Connect with elite hackers</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}