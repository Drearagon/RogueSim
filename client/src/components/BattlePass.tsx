import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Unlock, Star, Trophy, Zap, Crown } from 'lucide-react';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface BattlePass {
  id: number;
  name: string;
  description: string;
  seasonNumber: number;
  startDate: string;
  endDate: string;
  freeTierRewards: any[];
  premiumTierRewards: any[];
  maxLevel: number;
  premiumPrice: number;
  isActive: boolean;
}

interface UserBattlePass {
  id: number;
  userId: string;
  battlePassId: number;
  currentLevel: number;
  experience: number;
  hasPremium: boolean;
  purchaseDate?: string;
  claimedRewards: number[];
}

interface Cosmetic {
  id: number;
  name: string;
  description: string;
  type: string;
  rarity: string;
  data: any;
  isPremiumOnly: boolean;
  unlockLevel?: number;
}

interface BattlePassCommand {
  id: number;
  commandName: string;
  displayName: string;
  description: string;
  unlockLevel: number;
  isPremiumOnly: boolean;
}

const CheckoutForm: React.FC<{ battlePass: BattlePass; onSuccess: () => void }> = ({ battlePass, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent
      const response = await apiRequest('POST', '/api/battlepass/create-payment-intent', {
        battlePassId: battlePass.id
      });
      
      const data = await response.json();
      const { clientSecret, paymentIntentId } = data;

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        }
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm purchase on backend
        await apiRequest('POST', '/api/battlepass/confirm-purchase', {
          paymentIntentId,
          battlePassId: battlePass.id
        });

        toast({
          title: "Premium Battle Pass Unlocked!",
          description: "You now have access to premium rewards and commands.",
        });
        
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-zinc-700 rounded-lg bg-zinc-900/50">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#ffffff',
                '::placeholder': {
                  color: '#a1a1aa',
                },
              },
            },
          }}
        />
      </div>
      
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full"
      >
        {isProcessing ? 'Processing...' : `Purchase Premium - $${(battlePass.premiumPrice / 100).toFixed(2)}`}
      </Button>
    </form>
  );
};

const BattlePassTier: React.FC<{
  level: number;
  freeReward?: any;
  premiumReward?: any;
  isUnlocked: boolean;
  isPremium: boolean;
  onClaimReward: (level: number, isPremium: boolean) => void;
}> = ({ level, freeReward, premiumReward, isUnlocked, isPremium, onClaimReward }) => {
  return (
    <div className="flex items-center space-x-4 p-4 border border-zinc-700 rounded-lg bg-zinc-900/30">
      <div className="text-lg font-bold text-green-400 min-w-[3rem]">
        {level}
      </div>
      
      {/* Free Tier */}
      <div className="flex-1">
        <div className="text-sm text-zinc-400 mb-1">Free</div>
        {freeReward ? (
          <div className="flex items-center space-x-2">
            <Badge variant={isUnlocked ? "default" : "secondary"}>
              {freeReward.type}
            </Badge>
            <span className="text-sm">{freeReward.name}</span>
            {isUnlocked && (
              <Button 
                size="sm" 
                onClick={() => onClaimReward(level, false)}
                className="ml-auto"
              >
                Claim
              </Button>
            )}
          </div>
        ) : (
          <span className="text-zinc-500">No reward</span>
        )}
      </div>

      {/* Premium Tier */}
      <div className="flex-1">
        <div className="text-sm text-yellow-400 mb-1 flex items-center">
          <Crown className="w-4 h-4 mr-1" />
          Premium
        </div>
        {premiumReward ? (
          <div className="flex items-center space-x-2">
            <Badge variant={isUnlocked && isPremium ? "default" : "secondary"}>
              {premiumReward.type}
            </Badge>
            <span className="text-sm">{premiumReward.name}</span>
            {!isPremium && <Lock className="w-4 h-4 text-zinc-500" />}
            {isUnlocked && isPremium && (
              <Button 
                size="sm" 
                onClick={() => onClaimReward(level, true)}
                className="ml-auto"
              >
                Claim
              </Button>
            )}
          </div>
        ) : (
          <span className="text-zinc-500">No reward</span>
        )}
      </div>
    </div>
  );
};

export const BattlePass: React.FC = () => {
  const [battlePass, setBattlePass] = useState<BattlePass | null>(null);
  const [userBattlePass, setUserBattlePass] = useState<UserBattlePass | null>(null);
  const [cosmetics, setCosmetics] = useState<Cosmetic[]>([]);
  const [commands, setCommands] = useState<BattlePassCommand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPurchase, setShowPurchase] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBattlePassData();
  }, []);

  const loadBattlePassData = async () => {
    try {
      setLoading(true);
      
      // Load active battle pass
      const battlePassResponse = await apiRequest('GET', '/api/battlepass/active');
      const battlePassData = await battlePassResponse.json();
      setBattlePass(battlePassData);

      if (battlePassData?.id) {
        // Load user progress
        const progressResponse = await apiRequest('GET', `/api/battlepass/progress?battlePassId=${battlePassData.id}`);
        const progressData = await progressResponse.json();
        setUserBattlePass(progressData.battlePass);
        setCosmetics(progressData.cosmetics || []);
        setCommands(progressData.commands || []);
      }
    } catch (error) {
      console.error('Error loading battle pass data:', error);
      toast({
        title: "Error",
        description: "Failed to load battle pass data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseSuccess = () => {
    setShowPurchase(false);
    loadBattlePassData();
  };

  const handleClaimReward = async (level: number, isPremium: boolean) => {
    try {
      // Implementation for claiming rewards
      toast({
        title: "Reward Claimed!",
        description: `Successfully claimed ${isPremium ? 'premium' : 'free'} reward for level ${level}`,
      });
      
      loadBattlePassData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim reward",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!battlePass) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 mx-auto text-zinc-500 mb-4" />
        <h3 className="text-xl font-semibold text-zinc-300 mb-2">No Active Battle Pass</h3>
        <p className="text-zinc-500">Check back soon for the next season!</p>
      </div>
    );
  }

  const experienceProgress = userBattlePass ? (userBattlePass.experience % 1000) : 0;
  const experienceNeeded = 1000;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-zinc-900 border-zinc-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-green-400 flex items-center">
                <Trophy className="w-6 h-6 mr-2" />
                {battlePass.name}
              </CardTitle>
              <CardDescription>
                Season {battlePass.seasonNumber} • {battlePass.description}
              </CardDescription>
            </div>
            
            {!userBattlePass?.hasPremium && (
              <Button
                onClick={() => setShowPurchase(true)}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Level and Experience */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-green-400">
                  Level {userBattlePass?.currentLevel || 1}
                </div>
                {userBattlePass?.hasPremium && (
                  <Badge className="bg-yellow-600">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
              
              <div className="text-sm text-zinc-400">
                {userBattlePass?.experience || 0} / {(userBattlePass?.currentLevel || 1) * 1000} XP
              </div>
            </div>
            
            <Progress 
              value={(experienceProgress / experienceNeeded) * 100} 
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Purchase Modal */}
      {showPurchase && (
        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-yellow-400">
              <Crown className="w-5 h-5 inline mr-2" />
              Upgrade to Premium
            </CardTitle>
            <CardDescription>
              Unlock exclusive rewards, cosmetics, and premium commands
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise}>
              <CheckoutForm 
                battlePass={battlePass} 
                onSuccess={handlePurchaseSuccess} 
              />
            </Elements>
            
            <Button 
              variant="outline" 
              onClick={() => setShowPurchase(false)}
              className="w-full mt-4"
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Battle Pass Tiers */}
      <Tabs defaultValue="rewards" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="cosmetics">Cosmetics</TabsTrigger>
          <TabsTrigger value="commands">Premium Commands</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rewards" className="space-y-4">
          <div className="space-y-2">
            {Array.from({ length: battlePass.maxLevel }, (_, i) => {
              const level = i + 1;
              const freeReward = battlePass.freeTierRewards[i];
              const premiumReward = battlePass.premiumTierRewards[i];
              const isUnlocked = (userBattlePass?.currentLevel || 1) >= level;
              
              return (
                <BattlePassTier
                  key={level}
                  level={level}
                  freeReward={freeReward}
                  premiumReward={premiumReward}
                  isUnlocked={isUnlocked}
                  isPremium={userBattlePass?.hasPremium || false}
                  onClaimReward={handleClaimReward}
                />
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="cosmetics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cosmetics.map((cosmetic) => (
              <Card key={cosmetic.id} className="bg-zinc-900 border-zinc-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{cosmetic.name}</h4>
                    <Badge variant={cosmetic.rarity === 'legendary' ? 'default' : 'secondary'}>
                      {cosmetic.rarity}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-400 mb-2">{cosmetic.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">{cosmetic.type}</span>
                    {cosmetic.isPremiumOnly && (
                      <Crown className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="commands" className="space-y-4">
          <div className="space-y-2">
            {commands.map((command) => (
              <Card key={command.id} className="bg-zinc-900 border-zinc-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-green-400">
                        {command.displayName}
                      </h4>
                      <p className="text-sm text-zinc-400">{command.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline">Level {command.unlockLevel}</Badge>
                        {command.isPremiumOnly && (
                          <Badge className="bg-yellow-600">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <code className="text-sm bg-zinc-800 px-2 py-1 rounded">
                        {command.commandName}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BattlePass;