import { GameState } from '../types/game';

export interface NewsArticle {
  id: string;
  headline: string;
  content: string;
  category: 'corporate' | 'government' | 'underground' | 'technology' | 'security' | 'faction';
  timestamp: number;
  source: string;
  priority: 'low' | 'medium' | 'high' | 'breaking';
  tags: string[];
  playerTriggered?: boolean;
  factionRelated?: string;
  consequences?: string[];
}

export interface NewsSource {
  id: string;
  name: string;
  bias: 'corporate' | 'government' | 'neutral' | 'underground';
  reliability: number; // 0-100
  specialization: string[];
}

const newsSources: NewsSource[] = [
  {
    id: 'cybernews_global',
    name: 'CyberNews Global',
    bias: 'corporate',
    reliability: 85,
    specialization: ['technology', 'corporate']
  },
  {
    id: 'shadow_wire',
    name: 'Shadow Wire',
    bias: 'underground',
    reliability: 70,
    specialization: ['underground', 'faction', 'security']
  },
  {
    id: 'neo_times',
    name: 'Neo Times',
    bias: 'neutral',
    reliability: 90,
    specialization: ['government', 'technology', 'security']
  },
  {
    id: 'dark_net_herald',
    name: 'DarkNet Herald',
    bias: 'underground',
    reliability: 60,
    specialization: ['underground', 'faction']
  },
  {
    id: 'corporate_insider',
    name: 'Corporate Insider',
    bias: 'corporate',
    reliability: 95,
    specialization: ['corporate', 'technology']
  },
  {
    id: 'government_gazette',
    name: 'Government Gazette',
    bias: 'government',
    reliability: 80,
    specialization: ['government', 'security']
  }
];

const corporateNames = [
  'NexaCorp', 'CyberDyne Systems', 'Quantum Industries', 'TechNova', 'DataFlow Inc',
  'NeuroLink', 'Synapse Corp', 'Helix Dynamics', 'Apex Technologies', 'Genesis Labs',
  'OmniTech', 'VirtualCore', 'MetaStream', 'CyberVault', 'DigitalFrontier'
];

const governmentAgencies = [
  'Cyber Security Division', 'Digital Intelligence Agency', 'Network Defense Bureau',
  'Information Warfare Command', 'Cyber Crimes Unit', 'Digital Surveillance Office'
];

const undergroundGroups = [
  'Digital Liberation Front', 'Cyber Resistance', 'Shadow Collective', 'Data Pirates',
  'Network Anarchists', 'Code Breakers Union', 'Digital Underground'
];

export class NewsFeedSystem {
  private articles: NewsArticle[] = [];
  private lastUpdate: number = 0;
  private updateInterval: number = 300000; // 5 minutes

  constructor() {
    this.generateInitialNews();
  }

  private generateInitialNews(): void {
    // Generate some baseline news articles
    const initialArticles = [
      this.generateCorporateNews(),
      this.generateTechnologyNews(),
      this.generateSecurityNews(),
      this.generateUndergroundNews(),
      this.generateGovernmentNews()
    ];

    this.articles = initialArticles.filter(article => article !== null) as NewsArticle[];
  }

  public getNewsFeed(gameState: GameState, category?: string, limit: number = 10): NewsArticle[] {
    this.updateNews(gameState);
    
    let filteredArticles = this.articles;
    
    if (category && category !== 'all') {
      filteredArticles = this.articles.filter(article => article.category === category);
    }

    return filteredArticles
      .sort((a, b) => {
        // Sort by priority first, then by timestamp
        const priorityOrder = { 'breaking': 4, 'high': 3, 'medium': 2, 'low': 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.timestamp - a.timestamp;
      })
      .slice(0, limit);
  }

  private updateNews(gameState: GameState): void {
    const now = Date.now();
    if (now - this.lastUpdate < this.updateInterval) return;

    // Generate new articles based on game state
    const newArticles = this.generateDynamicNews(gameState);
    this.articles = [...newArticles, ...this.articles].slice(0, 50); // Keep only latest 50 articles
    
    this.lastUpdate = now;
  }

  private generateDynamicNews(gameState: GameState): NewsArticle[] {
    const articles: NewsArticle[] = [];
    
    // Player action-triggered news
    if (gameState.completedMissions && gameState.completedMissions > 0) {
      const missionNews = this.generateMissionRelatedNews(gameState);
      if (missionNews) articles.push(missionNews);
    }

    // Faction-related news
    if (gameState.activeFaction) {
      const factionNews = this.generateFactionNews(gameState);
      if (factionNews) articles.push(factionNews);
    }

    // Random world events
    if (Math.random() < 0.3) {
      const randomNews = this.generateRandomWorldEvent();
      if (randomNews) articles.push(randomNews);
    }

    return articles;
  }

  private generateMissionRelatedNews(gameState: GameState): NewsArticle | null {
    const templates = [
      {
        category: 'security' as const,
        headlines: [
          'Security Breach Reported at Major Corporation',
          'Cyber Attack Targets Financial Institution',
          'Unknown Hackers Infiltrate Government Database',
          'Corporate Network Compromised in Sophisticated Attack'
        ],
        sources: ['cybernews_global', 'neo_times', 'corporate_insider']
      },
      {
        category: 'corporate' as const,
        headlines: [
          'Tech Giant Reports Unusual Network Activity',
          'Corporate Security Measures Enhanced Following Breach',
          'Data Theft Suspected at Technology Firm',
          'Company Implements Emergency Security Protocols'
        ],
        sources: ['corporate_insider', 'cybernews_global']
      }
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];
    const headline = template.headlines[Math.floor(Math.random() * template.headlines.length)];
    const sourceId = template.sources[Math.floor(Math.random() * template.sources.length)];
    const source = newsSources.find(s => s.id === sourceId)!;

    return {
      id: `mission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      headline,
      content: this.generateArticleContent(headline, template.category, source),
      category: template.category,
      timestamp: Date.now(),
      source: source.name,
      priority: 'medium',
      tags: ['cybersecurity', 'breach', 'investigation'],
      playerTriggered: true
    };
  }

  private generateFactionNews(gameState: GameState): NewsArticle | null {
    const factionNames = {
      'serpent_syndicate': 'Serpent Syndicate',
      'crimson_circuit': 'Crimson Circuit',
      'mirage_loop': 'Mirage Loop'
    };

    const factionName = factionNames[gameState.activeFaction as keyof typeof factionNames];
    if (!factionName) return null;

    const templates = [
      {
        headline: `Underground Sources Report Increased ${factionName} Activity`,
        category: 'underground' as const,
        source: 'shadow_wire'
      },
      {
        headline: `Security Agencies Issue Warning About ${factionName} Operations`,
        category: 'government' as const,
        source: 'government_gazette'
      },
      {
        headline: `Corporate Networks on High Alert Following ${factionName} Threats`,
        category: 'corporate' as const,
        source: 'corporate_insider'
      }
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];
    const source = newsSources.find(s => s.id === template.source)!;

    return {
      id: `faction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      headline: template.headline,
      content: this.generateArticleContent(template.headline, template.category, source),
      category: template.category,
      timestamp: Date.now(),
      source: source.name,
      priority: 'high',
      tags: ['faction', 'security', factionName.toLowerCase().replace(' ', '_')],
      factionRelated: gameState.activeFaction
    };
  }

  private generateRandomWorldEvent(): NewsArticle | null {
    const eventTypes = [
      this.generateCorporateNews,
      this.generateTechnologyNews,
      this.generateSecurityNews,
      this.generateUndergroundNews,
      this.generateGovernmentNews
    ];

    const generator = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    return generator.call(this);
  }

  private generateCorporateNews(): NewsArticle {
    const corp = corporateNames[Math.floor(Math.random() * corporateNames.length)];
    const headlines = [
      `${corp} Announces Revolutionary AI Security System`,
      `${corp} Stock Soars Following Quantum Computing Breakthrough`,
      `${corp} Faces Investigation Over Data Privacy Concerns`,
      `${corp} Merges with Rival in Billion-Dollar Deal`,
      `${corp} CEO Resigns Amid Cybersecurity Scandal`
    ];

    const headline = headlines[Math.floor(Math.random() * headlines.length)];
    const source = newsSources.find(s => s.specialization.includes('corporate'))!;

    return {
      id: `corp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      headline,
      content: this.generateArticleContent(headline, 'corporate', source),
      category: 'corporate',
      timestamp: Date.now(),
      source: source.name,
      priority: 'medium',
      tags: ['corporate', 'business', corp.toLowerCase().replace(' ', '_')]
    };
  }

  private generateTechnologyNews(): NewsArticle {
    const headlines = [
      'New Quantum Encryption Standard Adopted Globally',
      'AI-Powered Cybersecurity Reaches Human-Level Performance',
      'Breakthrough in Neural Interface Technology Announced',
      'Decentralized Internet Protocol Gains Mainstream Adoption',
      'Biometric Authentication Systems Show Critical Vulnerabilities'
    ];

    const headline = headlines[Math.floor(Math.random() * headlines.length)];
    const source = newsSources.find(s => s.specialization.includes('technology'))!;

    return {
      id: `tech_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      headline,
      content: this.generateArticleContent(headline, 'technology', source),
      category: 'technology',
      timestamp: Date.now(),
      source: source.name,
      priority: 'medium',
      tags: ['technology', 'innovation', 'cybersecurity']
    };
  }

  private generateSecurityNews(): NewsArticle {
    const headlines = [
      'Global Cyber Attack Targets Critical Infrastructure',
      'New Malware Strain Evades All Known Detection Systems',
      'Government Agencies Report Coordinated Hacking Campaign',
      'Zero-Day Vulnerability Discovered in Popular Software',
      'International Cybercrime Ring Dismantled by Joint Operation'
    ];

    const headline = headlines[Math.floor(Math.random() * headlines.length)];
    const source = newsSources.find(s => s.specialization.includes('security'))!;

    return {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      headline,
      content: this.generateArticleContent(headline, 'security', source),
      category: 'security',
      timestamp: Date.now(),
      source: source.name,
      priority: 'high',
      tags: ['security', 'cybercrime', 'investigation']
    };
  }

  private generateUndergroundNews(): NewsArticle {
    const group = undergroundGroups[Math.floor(Math.random() * undergroundGroups.length)];
    const headlines = [
      `${group} Claims Responsibility for Recent Corporate Hack`,
      `Underground Network Exposes Government Surveillance Program`,
      `Hacker Collective Releases Stolen Corporate Documents`,
      `Anonymous Group Threatens Major Technology Companies`,
      `Digital Activists Launch Campaign Against Corporate Surveillance`
    ];

    const headline = headlines[Math.floor(Math.random() * headlines.length)];
    const source = newsSources.find(s => s.bias === 'underground')!;

    return {
      id: `underground_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      headline,
      content: this.generateArticleContent(headline, 'underground', source),
      category: 'underground',
      timestamp: Date.now(),
      source: source.name,
      priority: 'medium',
      tags: ['underground', 'activism', 'hacking']
    };
  }

  private generateGovernmentNews(): NewsArticle {
    const agency = governmentAgencies[Math.floor(Math.random() * governmentAgencies.length)];
    const headlines = [
      `${agency} Announces New Cybersecurity Initiative`,
      `Government Increases Funding for Digital Defense Programs`,
      `New Legislation Targets Cybercrime Organizations`,
      `International Cooperation Agreement Signed on Cyber Warfare`,
      `${agency} Reports Success in Counter-Hacking Operations`
    ];

    const headline = headlines[Math.floor(Math.random() * headlines.length)];
    const source = newsSources.find(s => s.bias === 'government')!;

    return {
      id: `gov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      headline,
      content: this.generateArticleContent(headline, 'government', source),
      category: 'government',
      timestamp: Date.now(),
      source: source.name,
      priority: 'medium',
      tags: ['government', 'policy', 'cybersecurity']
    };
  }

  private generateArticleContent(headline: string, category: string, source: NewsSource): string {
    const templates = {
      corporate: [
        "In a move that has sent shockwaves through the technology sector, industry leaders are closely monitoring developments. Market analysts suggest this could reshape the competitive landscape significantly.",
        "The announcement comes amid growing concerns about cybersecurity and data privacy in the digital age. Stakeholders are calling for increased transparency and accountability measures.",
        "Sources close to the matter indicate that this development has been months in the making, with significant implications for the broader technology ecosystem."
      ],
      government: [
        "Government officials emphasize the critical importance of maintaining national cybersecurity infrastructure. The initiative represents a significant investment in digital defense capabilities.",
        "This action follows a series of high-profile cyber incidents that have highlighted vulnerabilities in critical systems. Experts believe this marks a turning point in cyber policy.",
        "The announcement has received bipartisan support, with lawmakers emphasizing the need for robust cybersecurity measures in an increasingly connected world."
      ],
      underground: [
        "Underground sources suggest this is part of a larger movement challenging corporate and government surveillance practices. The implications for digital privacy rights remain unclear.",
        "This development has sparked intense debate within hacker communities about the ethics and effectiveness of such actions. Some view it as necessary activism, while others question the methods.",
        "The group's manifesto calls for greater transparency and accountability from both corporate and government entities regarding data collection and surveillance practices."
      ],
      technology: [
        "Technical experts are divided on the implications of this breakthrough. While some herald it as revolutionary, others urge caution regarding potential security vulnerabilities.",
        "The technology represents years of research and development, with potential applications spanning multiple industries. Early adopters are already exploring implementation strategies.",
        "Industry standards organizations are working to establish guidelines and best practices for this emerging technology, emphasizing the need for security-first approaches."
      ],
      security: [
        "Cybersecurity professionals are working around the clock to assess the full scope and impact of this development. Initial reports suggest widespread implications for digital security.",
        "The incident highlights ongoing challenges in maintaining robust cybersecurity defenses against increasingly sophisticated threats. Organizations are urged to review their security protocols.",
        "Law enforcement agencies are coordinating with international partners to investigate and respond to this cybersecurity incident. The investigation remains ongoing."
      ],
      faction: [
        "Intelligence sources report increased activity from organized hacker groups, suggesting a coordinated campaign targeting multiple sectors. The full extent of their capabilities remains unknown.",
        "This development represents a significant escalation in cyber warfare tactics, with potential implications for both corporate and government security. Countermeasures are being implemented.",
        "The group's sophisticated methods and apparent resources suggest backing from well-funded organizations. Security agencies are treating this as a high-priority threat."
      ]
    };

    const categoryTemplates = templates[category as keyof typeof templates] || templates.technology;
    const content = categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
    
    return `${content}\n\nReporting for ${source.name}, this story continues to develop as more information becomes available.`;
  }

  public addPlayerTriggeredNews(headline: string, content: string, category: NewsArticle['category'], priority: NewsArticle['priority'] = 'medium'): void {
    const source = newsSources[Math.floor(Math.random() * newsSources.length)];
    
    const article: NewsArticle = {
      id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      headline,
      content,
      category,
      timestamp: Date.now(),
      source: source.name,
      priority,
      tags: ['player_action'],
      playerTriggered: true
    };

    this.articles.unshift(article);
  }

  public getBreakingNews(): NewsArticle[] {
    return this.articles.filter(article => article.priority === 'breaking');
  }

  public getNewsByCategory(category: string): NewsArticle[] {
    return this.articles.filter(article => article.category === category);
  }

  public getNewsByFaction(factionId: string): NewsArticle[] {
    return this.articles.filter(article => article.factionRelated === factionId);
  }
}

export const newsFeedSystem = new NewsFeedSystem(); 