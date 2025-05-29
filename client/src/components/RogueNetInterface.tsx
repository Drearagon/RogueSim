import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Globe, 
  ShoppingCart, 
  MessageSquare, 
  User, 
  Skull, 
  DollarSign,
  Eye,
  Clock,
  TrendingUp,
  Shield,
  Zap,
  X,
  Plus,
  Star,
  AlertTriangle
} from 'lucide-react';

interface RogueNetInterfaceProps {
  onClose: () => void;
  currentUser: {
    id: string;
    hackerName: string;
    credits: number;
    reputation: string;
  };
}

interface MarketItem {
  id: string;
  sellerId: string;
  sellerHandle: string;
  name: string;
  description: string;
  category: 'exploit' | 'tool' | 'script' | 'intel' | 'service';
  price: number;
  currency: 'credits' | 'bitcoin' | 'rep';
  rarity: 'common' | 'rare' | 'legendary';
  rating: number;
  reviews: number;
  inStock: number;
  tags: string[];
  lastActive: number;
}

interface MessageBoardPost {
  id: string;
  authorId: string;
  authorHandle: string;
  title: string;
  content: string;
  category: 'contract' | 'bounty' | 'intel' | 'general';
  bountyAmount?: number;
  targetHandle?: string;
  difficulty: 'novice' | 'intermediate' | 'expert' | 'elite';
  replies: number;
  likes: number;
  timestamp: number;
  isSticky: boolean;
  tags: string[];
}

interface RogueNetUser {
  id: string;
  handle: string;
  reputation: number;
  level: string;
  joinDate: number;
  lastSeen: number;
  specialties: string[];
  completedContracts: number;
  bountyValue: number;
  isOnline: boolean;
}

export function RogueNetInterface({ onClose, currentUser }: RogueNetInterfaceProps) {
  const [activeTab, setActiveTab] = useState<'market' | 'board' | 'users' | 'profile'>('market');
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [boardPosts, setBoardPosts] = useState<MessageBoardPost[]>([]);
  const [users, setUsers] = useState<RogueNetUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general' as MessageBoardPost['category'],
    bountyAmount: 0,
    targetHandle: ''
  });
  const [newListing, setNewListing] = useState({
    name: '',
    description: '',
    category: 'tool' as MarketItem['category'],
    price: 0,
    currency: 'credits' as MarketItem['currency'],
    inStock: 1,
    tags: ''
  });

  useEffect(() => {
    loadRogueNetData();
  }, []);

  const loadRogueNetData = () => {
    // Mock data - in real implementation, this would come from server
    setMarketItems([
      {
        id: 'item1',
        sellerId: 'user1',
        sellerHandle: 'CyberViper',
        name: 'Advanced Port Scanner',
        description: 'Military-grade network scanning tool with stealth capabilities',
        category: 'tool',
        price: 2500,
        currency: 'credits',
        rarity: 'rare',
        rating: 4.8,
        reviews: 24,
        inStock: 3,
        tags: ['network', 'scanning', 'stealth'],
        lastActive: Date.now() - 3600000
      },
      {
        id: 'item2',
        sellerId: 'user2',
        sellerHandle: 'GhostShell',
        name: 'Zero-Day Exploit Pack',
        description: 'Collection of 5 unpatched vulnerabilities for Windows systems',
        category: 'exploit',
        price: 0.05,
        currency: 'bitcoin',
        rarity: 'legendary',
        rating: 5.0,
        reviews: 8,
        inStock: 1,
        tags: ['windows', 'zero-day', 'privilege-escalation'],
        lastActive: Date.now() - 1800000
      },
      {
        id: 'item3',
        sellerId: 'user3',
        sellerHandle: 'DataMiner',
        name: 'Corporate Email Harvest',
        description: 'Fresh employee email list from Fortune 500 company',
        category: 'intel',
        price: 1500,
        currency: 'credits',
        rarity: 'common',
        rating: 4.2,
        reviews: 15,
        inStock: 10,
        tags: ['emails', 'corporate', 'social-engineering'],
        lastActive: Date.now() - 7200000
      }
    ]);

    setBoardPosts([
      {
        id: 'post1',
        authorId: 'user4',
        authorHandle: 'ShadowBroker',
        title: 'Contract: Penetrate Banking System',
        content: 'Seeking elite hacker to infiltrate regional bank network. Payment on completion. Serious inquiries only.',
        category: 'contract',
        bountyAmount: 50000,
        difficulty: 'elite',
        replies: 12,
        likes: 8,
        timestamp: Date.now() - 3600000,
        isSticky: true,
        tags: ['banking', 'penetration', 'high-pay']
      },
      {
        id: 'post2',
        authorId: 'user5',
        authorHandle: 'VendettaX',
        title: 'Bounty: WhiteHat_Defender',
        content: 'This script kiddie exposed one of our operations. 10K credits for teaching them a lesson.',
        category: 'bounty',
        bountyAmount: 10000,
        targetHandle: 'WhiteHat_Defender',
        difficulty: 'intermediate',
        replies: 5,
        likes: 3,
        timestamp: Date.now() - 7200000,
        isSticky: false,
        tags: ['revenge', 'ddos', 'disruption']
      },
      {
        id: 'post3',
        authorId: 'user6',
        authorHandle: 'InfoSeeker',
        title: 'Intel Sharing: New Government Protocols',
        content: 'Found some interesting documents about new cybersecurity protocols. Willing to trade for crypto exploits.',
        category: 'intel',
        difficulty: 'intermediate',
        replies: 18,
        likes: 12,
        timestamp: Date.now() - 10800000,
        isSticky: false,
        tags: ['government', 'protocols', 'trade']
      }
    ]);

    setUsers([
      {
        id: 'user1',
        handle: 'CyberViper',
        reputation: 8750,
        level: 'Elite',
        joinDate: Date.now() - 86400000 * 180,
        lastSeen: Date.now() - 3600000,
        specialties: ['Network Penetration', 'Social Engineering'],
        completedContracts: 47,
        bountyValue: 25000,
        isOnline: false
      },
      {
        id: 'user2',
        handle: 'GhostShell',
        reputation: 12340,
        level: 'Legendary',
        joinDate: Date.now() - 86400000 * 365,
        lastSeen: Date.now() - 1800000,
        specialties: ['Zero-Day Research', 'Malware Development'],
        completedContracts: 73,
        bountyValue: 50000,
        isOnline: true
      },
      {
        id: 'user3',
        handle: 'DataMiner',
        reputation: 5420,
        level: 'Expert',
        joinDate: Date.now() - 86400000 * 90,
        lastSeen: Date.now() - 7200000,
        specialties: ['Data Harvesting', 'OSINT'],
        completedContracts: 28,
        bountyValue: 8000,
        isOnline: false
      }
    ]);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400';
      case 'rare': return 'text-blue-400 border-blue-400';
      case 'legendary': return 'text-purple-400 border-purple-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'exploit': return <Zap className="w-4 h-4" />;
      case 'tool': return <Shield className="w-4 h-4" />;
      case 'script': return <MessageSquare className="w-4 h-4" />;
      case 'intel': return <Eye className="w-4 h-4" />;
      case 'service': return <User className="w-4 h-4" />;
      case 'contract': return <DollarSign className="w-4 h-4" />;
      case 'bounty': return <Skull className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Novice': return 'text-green-400';
      case 'Intermediate': return 'text-yellow-400';
      case 'Expert': return 'text-orange-400';
      case 'Elite': return 'text-red-400';
      case 'Legendary': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const handleCreatePost = () => {
    const post: MessageBoardPost = {
      id: `post_${Date.now()}`,
      authorId: currentUser.id,
      authorHandle: currentUser.hackerName,
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      bountyAmount: newPost.bountyAmount,
      targetHandle: newPost.targetHandle,
      difficulty: 'intermediate',
      replies: 0,
      likes: 0,
      timestamp: Date.now(),
      isSticky: false,
      tags: []
    };
    
    setBoardPosts(prev => [post, ...prev]);
    setNewPost({ title: '', content: '', category: 'general', bountyAmount: 0, targetHandle: '' });
    setShowCreatePost(false);
  };

  const handleCreateListing = () => {
    const listing: MarketItem = {
      id: `item_${Date.now()}`,
      sellerId: currentUser.id,
      sellerHandle: currentUser.hackerName,
      name: newListing.name,
      description: newListing.description,
      category: newListing.category,
      price: newListing.price,
      currency: newListing.currency,
      rarity: 'common',
      rating: 0,
      reviews: 0,
      inStock: newListing.inStock,
      tags: newListing.tags.split(',').map(t => t.trim()),
      lastActive: Date.now()
    };
    
    setMarketItems(prev => [listing, ...prev]);
    setNewListing({ name: '', description: '', category: 'tool', price: 0, currency: 'credits', inStock: 1, tags: '' });
    setShowCreateListing(false);
  };

  const filteredMarketItems = marketItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredBoardPosts = boardPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-purple-500/30 rounded-lg w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500/30">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-purple-400">RogueNet</h2>
            <Badge variant="outline" className="text-purple-400 border-purple-400">
              Dark Web Portal
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-400">Handle:</span>
              <span className="ml-2 text-purple-400 font-mono">{currentUser.hackerName}</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-4 w-full border-b border-purple-500/30 bg-transparent rounded-none">
            <TabsTrigger value="market" className="flex items-center gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <ShoppingCart className="w-4 h-4" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="board" className="flex items-center gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <MessageSquare className="w-4 h-4" />
              Message Board
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <User className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <Shield className="w-4 h-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 p-4 overflow-hidden">
            {/* Search and Filters */}
            <div className="flex items-center gap-4 mb-4">
              <Input
                placeholder="Search RogueNet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-gray-800 border-purple-500/30"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-purple-500/30 rounded text-white"
              >
                <option value="all">All Categories</option>
                <option value="exploit">Exploits</option>
                <option value="tool">Tools</option>
                <option value="script">Scripts</option>
                <option value="intel">Intel</option>
                <option value="service">Services</option>
                <option value="contract">Contracts</option>
                <option value="bounty">Bounties</option>
              </select>
            </div>

            {/* Marketplace Tab */}
            <TabsContent value="market" className="space-y-4 h-full overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-purple-400">Underground Marketplace</h3>
                <Button
                  onClick={() => setShowCreateListing(true)}
                  className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  List Item
                </Button>
              </div>

              {showCreateListing && (
                <Card className="bg-gray-800 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-purple-400">Create New Listing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Item name"
                        value={newListing.name}
                        onChange={(e) => setNewListing(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-gray-700 border-purple-500/30"
                      />
                      <select
                        value={newListing.category}
                        onChange={(e) => setNewListing(prev => ({ ...prev, category: e.target.value as any }))}
                        className="px-3 py-2 bg-gray-700 border border-purple-500/30 rounded text-white"
                      >
                        <option value="tool">Tool</option>
                        <option value="exploit">Exploit</option>
                        <option value="script">Script</option>
                        <option value="intel">Intel</option>
                        <option value="service">Service</option>
                      </select>
                    </div>
                    <Textarea
                      placeholder="Description"
                      value={newListing.description}
                      onChange={(e) => setNewListing(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-gray-700 border-purple-500/30"
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <Input
                        type="number"
                        placeholder="Price"
                        value={newListing.price}
                        onChange={(e) => setNewListing(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                        className="bg-gray-700 border-purple-500/30"
                      />
                      <select
                        value={newListing.currency}
                        onChange={(e) => setNewListing(prev => ({ ...prev, currency: e.target.value as any }))}
                        className="px-3 py-2 bg-gray-700 border border-purple-500/30 rounded text-white"
                      >
                        <option value="credits">Credits</option>
                        <option value="bitcoin">Bitcoin</option>
                        <option value="rep">Reputation</option>
                      </select>
                      <Input
                        type="number"
                        placeholder="Stock"
                        value={newListing.inStock}
                        onChange={(e) => setNewListing(prev => ({ ...prev, inStock: parseInt(e.target.value) || 1 }))}
                        className="bg-gray-700 border-purple-500/30"
                      />
                    </div>
                    <Input
                      placeholder="Tags (comma separated)"
                      value={newListing.tags}
                      onChange={(e) => setNewListing(prev => ({ ...prev, tags: e.target.value }))}
                      className="bg-gray-700 border-purple-500/30"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleCreateListing} className="bg-purple-500 hover:bg-purple-600">
                        Create Listing
                      </Button>
                      <Button onClick={() => setShowCreateListing(false)} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <ScrollArea className="h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMarketItems.map((item) => (
                    <Card key={item.id} className="bg-gray-800 border-purple-500/30 hover:border-purple-400/50 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg text-white">{item.name}</CardTitle>
                          <Badge className={`${getRarityColor(item.rarity)} bg-transparent`}>
                            {item.rarity}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          {getCategoryIcon(item.category)}
                          <span>by {item.sellerHandle}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-gray-300">{item.description}</p>
                        
                        <div className="flex items-center gap-2">
                          {item.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs text-purple-300 border-purple-500/30">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-green-400">
                            {item.currency === 'bitcoin' ? '₿' : item.currency === 'rep' ? 'REP' : '¢'}{item.price}
                          </div>
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm">{item.rating.toFixed(1)} ({item.reviews})</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span>Stock: {item.inStock}</span>
                          <span>{formatTime(item.lastActive)}</span>
                        </div>

                        <Button className="w-full bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30">
                          Purchase
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Message Board Tab */}
            <TabsContent value="board" className="space-y-4 h-full overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-purple-400">Underground Message Board</h3>
                <Button
                  onClick={() => setShowCreatePost(true)}
                  className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </Button>
              </div>

              {showCreatePost && (
                <Card className="bg-gray-800 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-purple-400">Create New Post</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Post title"
                        value={newPost.title}
                        onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                        className="bg-gray-700 border-purple-500/30"
                      />
                      <select
                        value={newPost.category}
                        onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value as any }))}
                        className="px-3 py-2 bg-gray-700 border border-purple-500/30 rounded text-white"
                      >
                        <option value="general">General</option>
                        <option value="contract">Contract</option>
                        <option value="bounty">Bounty</option>
                        <option value="intel">Intel</option>
                      </select>
                    </div>
                    <Textarea
                      placeholder="Post content"
                      value={newPost.content}
                      onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                      className="bg-gray-700 border-purple-500/30"
                    />
                    {newPost.category === 'bounty' && (
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          type="number"
                          placeholder="Bounty amount"
                          value={newPost.bountyAmount}
                          onChange={(e) => setNewPost(prev => ({ ...prev, bountyAmount: parseInt(e.target.value) || 0 }))}
                          className="bg-gray-700 border-purple-500/30"
                        />
                        <Input
                          placeholder="Target handle"
                          value={newPost.targetHandle}
                          onChange={(e) => setNewPost(prev => ({ ...prev, targetHandle: e.target.value }))}
                          className="bg-gray-700 border-purple-500/30"
                        />
                      </div>
                    )}
                    {newPost.category === 'contract' && (
                      <Input
                        type="number"
                        placeholder="Contract value"
                        value={newPost.bountyAmount}
                        onChange={(e) => setNewPost(prev => ({ ...prev, bountyAmount: parseInt(e.target.value) || 0 }))}
                        className="bg-gray-700 border-purple-500/30"
                      />
                    )}
                    <div className="flex gap-2">
                      <Button onClick={handleCreatePost} className="bg-purple-500 hover:bg-purple-600">
                        Post Message
                      </Button>
                      <Button onClick={() => setShowCreatePost(false)} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <ScrollArea className="h-[60vh]">
                <div className="space-y-4">
                  {filteredBoardPosts.map((post) => (
                    <Card key={post.id} className={`bg-gray-800 border-purple-500/30 hover:border-purple-400/50 transition-colors ${post.isSticky ? 'border-yellow-500/50' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {post.isSticky && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                            {getCategoryIcon(post.category)}
                            <CardTitle className="text-lg text-white">{post.title}</CardTitle>
                          </div>
                          <Badge className={`${post.category === 'bounty' ? 'bg-red-500/20 text-red-400' : post.category === 'contract' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'} border-transparent`}>
                            {post.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>by {post.authorHandle}</span>
                          <span>•</span>
                          <span>{formatTime(post.timestamp)}</span>
                          <span>•</span>
                          <span className={getLevelColor(post.difficulty)}>{post.difficulty}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-gray-300">{post.content}</p>
                        
                        {(post.bountyAmount || 0) > 0 && (
                          <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/30 rounded">
                            <DollarSign className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 font-bold">
                              {post.category === 'bounty' ? 'Bounty: ' : 'Payment: '}¢{post.bountyAmount}
                            </span>
                          </div>
                        )}

                        {post.targetHandle && (
                          <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/30 rounded">
                            <Skull className="w-4 h-4 text-red-400" />
                            <span className="text-red-400">Target: {post.targetHandle}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <div className="flex items-center gap-4">
                            <span>{post.replies} replies</span>
                            <span>{post.likes} likes</span>
                          </div>
                          <Button size="sm" variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20">
                            View Thread
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4 h-full overflow-hidden">
              <h3 className="text-lg font-semibold text-purple-400">RogueNet Users</h3>
              
              <ScrollArea className="h-[70vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((user) => (
                    <Card key={user.id} className="bg-gray-800 border-purple-500/30 hover:border-purple-400/50 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg text-white font-mono">{user.handle}</CardTitle>
                          <div className="flex items-center gap-2">
                            {user.isOnline && <div className="w-2 h-2 bg-green-400 rounded-full" />}
                            <Badge className={`${getLevelColor(user.level)} bg-transparent border-current`}>
                              {user.level}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Reputation:</span>
                            <span className="text-yellow-400 font-bold">{user.reputation.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Contracts:</span>
                            <span className="text-green-400">{user.completedContracts}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Bounty Value:</span>
                            <span className="text-red-400">¢{user.bountyValue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Last Seen:</span>
                            <span className="text-gray-300">{formatTime(user.lastSeen)}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-sm text-gray-400">Specialties:</span>
                          <div className="flex flex-wrap gap-1">
                            {user.specialties.map(specialty => (
                              <Badge key={specialty} variant="outline" className="text-xs text-purple-300 border-purple-500/30">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/20">
                            Contact
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/20">
                            Report
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4">
              <Card className="bg-gray-800 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-purple-400">Your RogueNet Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Handle</label>
                      <div className="text-lg font-mono text-purple-400">{currentUser.hackerName}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Reputation</label>
                      <div className="text-lg text-yellow-400">{currentUser.reputation}</div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Profile Description</label>
                    <Textarea 
                      placeholder="Tell other hackers about yourself..."
                      className="bg-gray-700 border-purple-500/30"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Specialties</label>
                    <Input 
                      placeholder="e.g., Social Engineering, Network Penetration"
                      className="bg-gray-700 border-purple-500/30"
                    />
                  </div>

                  <Button className="bg-purple-500 hover:bg-purple-600">
                    Update Profile
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
} 