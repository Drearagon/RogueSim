import { Network, Device, GameState } from '../types/game';

// Mission-specific network and device databases
const missionNetworks: Record<string, Network[]> = {
  solo_training: [
    { ssid: "TRAINING_NET", channel: 6, power: -45, security: "WEP" },
    { ssid: "TestNetwork_2G", channel: 1, power: -65, security: "WPA2" },
    { ssid: "Lab_Equipment", channel: 11, power: -55, security: "OPEN" },
    { ssid: "[HIDDEN_TEST]", channel: 8, power: -70, security: "WPA2" }
  ],
  
  corp_infiltration: [
    { ssid: "MEGACORP_SECURE", channel: 36, power: -38, security: "WPA3-Enterprise" },
    { ssid: "CORP_INTERNAL_5G", channel: 149, power: -42, security: "WPA3" },
    { ssid: "GUEST_CORPORATE", channel: 6, power: -50, security: "WPA2" },
    { ssid: "EXEC_FLOOR_NET", channel: 161, power: -35, security: "WPA3-Enterprise" },
    { ssid: "IoT_SENSORS_CORP", channel: 11, power: -48, security: "WEP" },
    { ssid: "[HIDDEN_BACKUP]", channel: 44, power: -60, security: "WPA2+AES" }
  ],
  
  bank_heist_digital: [
    { ssid: "CENTRAL_BANK_SEC", channel: 157, power: -30, security: "WPA3-Enterprise" },
    { ssid: "FINANCIAL_CORE", channel: 165, power: -28, security: "WPA3-Enterprise" },
    { ssid: "VAULT_CONTROL", channel: 149, power: -32, security: "WPA3-Enterprise" },
    { ssid: "TELLER_NETWORK", channel: 36, power: -45, security: "WPA2" },
    { ssid: "ATM_MANAGEMENT", channel: 44, power: -40, security: "WPA2" },
    { ssid: "SECURITY_CAMS", channel: 6, power: -50, security: "WEP" },
    { ssid: "[EMERGENCY_BACKUP]", channel: 161, power: -65, security: "WPA3" }
  ],
  
  government_leak: [
    { ssid: "GOV_CLASSIFIED", channel: 165, power: -25, security: "WPA3-Enterprise" },
    { ssid: "INTEL_DIVISION", channel: 157, power: -28, security: "WPA3-Enterprise" },
    { ssid: "SECURE_COMMS", channel: 149, power: -30, security: "WPA3-Enterprise" },
    { ssid: "ADMIN_NETWORK", channel: 36, power: -42, security: "WPA2" },
    { ssid: "VISITOR_ACCESS", channel: 6, power: -55, security: "WPA2" },
    { ssid: "FACILITIES_IOT", channel: 11, power: -48, security: "WEP" },
    { ssid: "[BLACKSITE_LINK]", channel: 44, power: -70, security: "WPA3" }
  ],
  
  data_center_raid: [
    { ssid: "DATACENTER_CORE", channel: 149, power: -35, security: "WPA3-Enterprise" },
    { ssid: "SERVER_MGMT", channel: 157, power: -38, security: "WPA3" },
    { ssid: "COOLING_SYSTEMS", channel: 36, power: -45, security: "WPA2" },
    { ssid: "POWER_CONTROL", channel: 44, power: -40, security: "WPA2" },
    { ssid: "SECURITY_GRID", channel: 6, power: -50, security: "WPA2" },
    { ssid: "MAINTENANCE_NET", channel: 11, power: -60, security: "WEP" },
    { ssid: "[EMERGENCY_SYS]", channel: 161, power: -55, security: "WPA3" }
  ]
};

const missionDevices: Record<string, Device[]> = {
  solo_training: [
    { name: "Training Tablet", mac: "AA:BB:CC:DD:EE:01", type: "Educational" },
    { name: "Lab Computer", mac: "AA:BB:CC:DD:EE:02", type: "Workstation" },
    { name: "Practice Router", mac: "AA:BB:CC:DD:EE:03", type: "Network" }
  ],
  
  corp_infiltration: [
    { name: "Executive Laptop", mac: "CC:OR:P1:23:45:67", type: "Executive" },
    { name: "Security Badge", mac: "CC:OR:P2:34:56:78", type: "Access Control" },
    { name: "Conference Phone", mac: "CC:OR:P3:45:67:89", type: "Communication" },
    { name: "Smart Display", mac: "CC:OR:P4:56:78:90", type: "Presentation" },
    { name: "IoT Sensor Array", mac: "CC:OR:P5:67:89:01", type: "Environmental" }
  ],
  
  bank_heist_digital: [
    { name: "Vault Controller", mac: "BA:NK:01:23:45:67", type: "Security" },
    { name: "ATM Terminal", mac: "BA:NK:02:34:56:78", type: "Financial" },
    { name: "Teller Workstation", mac: "BA:NK:03:45:67:89", type: "Workstation" },
    { name: "Security Camera Hub", mac: "BA:NK:04:56:78:90", type: "Surveillance" },
    { name: "Transaction Server", mac: "BA:NK:05:67:89:01", type: "Server" }
  ],
  
  government_leak: [
    { name: "Classified Terminal", mac: "GO:V1:23:45:67:89", type: "Classified" },
    { name: "Secure Phone", mac: "GO:V2:34:56:78:90", type: "Communication" },
    { name: "Intel Workstation", mac: "GO:V3:45:67:89:01", type: "Intelligence" },
    { name: "Document Scanner", mac: "GO:V4:56:78:90:12", type: "Document" },
    { name: "Biometric Reader", mac: "GO:V5:67:89:01:23", type: "Security" }
  ],
  
  data_center_raid: [
    { name: "Core Server", mac: "DC:01:23:45:67:89", type: "Server" },
    { name: "Storage Array", mac: "DC:02:34:56:78:90", type: "Storage" },
    { name: "Network Switch", mac: "DC:03:45:67:89:01", type: "Network" },
    { name: "Cooling Controller", mac: "DC:04:56:78:90:12", type: "Environmental" },
    { name: "Power Management", mac: "DC:05:67:89:01:23", type: "Infrastructure" }
  ]
};

const missionTargets: Record<string, any> = {
  solo_training: {
    primaryTarget: "Training Network Infrastructure",
    objectives: ["Practice network scanning", "Learn basic penetration techniques", "Complete training scenarios"],
    hostileDetection: "Low",
    environment: "Controlled lab environment"
  },
  
  corp_infiltration: {
    primaryTarget: "MegaCorp Financial Records",
    objectives: ["Extract confidential financial data", "Identify insider trading evidence", "Avoid detection by corporate security"],
    hostileDetection: "High",
    environment: "Corporate headquarters with advanced security"
  },
  
  bank_heist_digital: {
    primaryTarget: "Central Banking Network",
    objectives: ["Penetrate vault control systems", "Access transaction databases", "Transfer funds undetected"],
    hostileDetection: "Extreme",
    environment: "High-security financial institution"
  },
  
  government_leak: {
    primaryTarget: "Classified Government Files",
    objectives: ["Access classified documents", "Expose corruption evidence", "Protect source identity"],
    hostileDetection: "Maximum",
    environment: "Government facility with military-grade security"
  },
  
  data_center_raid: {
    primaryTarget: "Secure Data Center",
    objectives: ["Physical and digital infiltration", "Extract stored data", "Disable security systems"],
    hostileDetection: "High",
    environment: "Fortified data center with physical security"
  }
};

// Default networks for story missions or when no mission is active
const defaultNetworks: Network[] = [
  { ssid: "TARGET_NET", channel: 11, power: -42, security: "WPA2" },
  { ssid: "HomeNetwork_5G", channel: 6, power: -67, security: "WPA3" },
  { ssid: "NETGEAR_Guest", channel: 1, power: -78, security: "OPEN" },
  { ssid: "IoT_Device_001", channel: 11, power: -45, security: "WEP" },
  { ssid: "[HIDDEN]", channel: 8, power: -89, security: "WPA2" }
];

const defaultDevices: Device[] = [
  { name: "Smart Watch", mac: "XX:XX:XX:XX:XX:01", type: "Wearable" },
  { name: "Fitness Tracker", mac: "XX:XX:XX:XX:XX:02", type: "Wearable" },
  { name: "IoT Sensor", mac: "XX:XX:XX:XX:XX:03", type: "Sensor" },
  { name: "Shadow Beacon", mac: "SHADOW_MAC_001", type: "Unknown" }
];

// Get mission-specific networks based on active mission
export function getMissionNetworks(gameState: GameState): Network[] {
  const activeMission = gameState.activeMission;
  
  if (activeMission && typeof activeMission === 'object' && activeMission.id) {
    const missionId = activeMission.id;
    return missionNetworks[missionId] || defaultNetworks;
  }
  
  return defaultNetworks;
}

// Get mission-specific devices based on active mission
export function getMissionDevices(gameState: GameState): Device[] {
  const activeMission = gameState.activeMission;
  
  if (activeMission && typeof activeMission === 'object' && activeMission.id) {
    const missionId = activeMission.id;
    return missionDevices[missionId] || defaultDevices;
  }
  
  return defaultDevices;
}

// Get mission-specific target information
export function getMissionTarget(gameState: GameState): any {
  const activeMission = gameState.activeMission;
  
  if (activeMission && typeof activeMission === 'object' && activeMission.id) {
    const missionId = activeMission.id;
    return missionTargets[missionId] || null;
  }
  
  return null;
}

// Generate mission-specific scan results
export function getMissionScanOutput(gameState: GameState, scanType: string): string[] {
  const networks = getMissionNetworks(gameState);
  const devices = getMissionDevices(gameState);
  const target = getMissionTarget(gameState);
  
  switch (scanType) {
    case 'wifi':
      const output = [
        '▶ WiFi scan...',
        ''
      ];
      
      if (target) {
        output.push(`▶ Scanning ${target.environment}...`);
        output.push('');
      }
      
      output.push('┌─ NETWORKS ─┐');
      networks.forEach(net => {
        output.push(`│ ${net.ssid.substring(0, 12).padEnd(12)} ${net.channel.toString().padStart(2)} ${net.power.toString().padStart(3)} │`);
      });
      output.push('└────────────┘');
      output.push('');
      output.push(`✓ ${networks.length} networks found`);
      
      // Add mission-specific warnings
      if (target?.hostileDetection === 'High' || target?.hostileDetection === 'Extreme' || target?.hostileDetection === 'Maximum') {
        output.push('⚠ High-security environment detected');
        output.push('⚠ Advanced intrusion detection active');
      }
      
      const vulnerableNets = networks.filter(n => n.security === 'WEP' || n.security === 'OPEN');
      if (vulnerableNets.length > 0) {
        output.push('⚠ Vulnerable networks detected');
      }
      
      output.push('');
      return output;
      
    case 'ble':
      const bleOutput = [
        '▶ Scanning Bluetooth Low Energy devices...',
        ''
      ];
      
      if (target) {
        bleOutput.push(`▶ Scanning ${target.environment}...`);
        bleOutput.push('');
      }
      
      devices.forEach(device => {
        bleOutput.push(`Device: ${device.name} (${device.mac}) - ${device.type}`);
      });
      
      bleOutput.push('');
      bleOutput.push(`✓ ${devices.length} BLE devices found`);
      bleOutput.push('');
      
      return bleOutput;
      
    default:
      return ['ERROR: Unknown scan type'];
  }
}

// Get mission-specific port scan results
export function getMissionPortScan(gameState: GameState): string[] {
  const target = getMissionTarget(gameState);
  const activeMission = gameState.activeMission;
  
  let output = ['▶ Port scanning target...', ''];
  
  if (target) {
    output.push(`▶ Scanning ${target.primaryTarget}...`);
    output.push('');
  }
  
  // Mission-specific ports
  if (activeMission && typeof activeMission === 'object' && activeMission.id) {
    const missionId = activeMission.id;
    
    switch (missionId) {
      case 'corp_infiltration':
        output.push('PORT    STATE    SERVICE');
        output.push('21/tcp  open     ftp');
        output.push('22/tcp  open     ssh');
        output.push('80/tcp  open     http');
        output.push('443/tcp open     https');
        output.push('993/tcp open     imaps');
        output.push('3389/tcp open    rdp');
        output.push('8080/tcp filtered http-proxy');
        break;
        
      case 'bank_heist_digital':
        output.push('PORT    STATE    SERVICE');
        output.push('22/tcp  closed   ssh');
        output.push('443/tcp open     https');
        output.push('1433/tcp open    mssql');
        output.push('3306/tcp open    mysql');
        output.push('5432/tcp open    postgresql');
        output.push('8443/tcp open    https-alt');
        output.push('9001/tcp filtered vault-control');
        break;
        
      case 'government_leak':
        output.push('PORT    STATE    SERVICE');
        output.push('22/tcp  filtered ssh');
        output.push('80/tcp  closed   http');
        output.push('443/tcp open     https');
        output.push('636/tcp open     ldaps');
        output.push('5985/tcp open   winrm');
        output.push('8080/tcp filtered classified-web');
        output.push('9999/tcp filtered intel-service');
        break;
        
      case 'data_center_raid':
        output.push('PORT    STATE    SERVICE');
        output.push('22/tcp  open     ssh');
        output.push('23/tcp  open     telnet');
        output.push('80/tcp  open     http');
        output.push('161/tcp open     snmp');
        output.push('443/tcp open     https');
        output.push('2049/tcp open    nfs');
        output.push('8088/tcp open    server-mgmt');
        break;
        
      default:
        output.push('PORT    STATE    SERVICE');
        output.push('22/tcp  open     ssh');
        output.push('80/tcp  open     http');
        output.push('443/tcp open     https');
        output.push('8080/tcp filtered http-proxy');
    }
  } else {
    // Default ports for story missions
    output.push('PORT    STATE    SERVICE');
    output.push('22/tcp  open     ssh');
    output.push('80/tcp  open     http');
    output.push('443/tcp open     https');
    output.push('8080/tcp filtered http-proxy');
  }
  
  output.push('');
  output.push('✓ Scan complete');
  
  if (target?.hostileDetection === 'High' || target?.hostileDetection === 'Extreme' || target?.hostileDetection === 'Maximum') {
    output.push('⚠ Scan detected - security protocols activated');
  }
  
  output.push('');
  return output;
} 