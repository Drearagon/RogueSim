import { Command, CommandResult, GameState, Network, Device, MissionStep } from '../types/game';
import { 
  getNextNarrativeEvent, 
  formatNarrativeEvent, 
  processNarrativeChoice, 
  generateEncryptedMessage,
  narrativeEvents 
} from './narrativeSystem';
import { checkEasterEgg, discoverEasterEgg, getEasterEggHints, getEasterEggStats, loadDiscoveredEasterEggs, getDiscoveredEasterEggs, EasterEgg } from './easterEggs';
import { shouldAwardCommandCredits } from './missionTracker';
import { 
  factions, 
  factionRanks, 
  canJoinFaction, 
  getPlayerFactionRank, 
  calculateFactionBonus,
  initializeFactionStandings,
  getAvailableFactionMissions,
  generateRandomFactionEvent
} from './factionSystem';
import {
  getSkillBonuses,
  awardSkillPoints,
  canPurchaseSkill,
  purchaseSkill,
  initializeSkillTree,
  skillCategories,
  allSkills,
  calculateSkillTreeProgress
} from './skillSystem';
import { newsFeedSystem } from './newsFeedSystem';
import { npcSystem } from './npcSystem';
import { realTimeMiniGameSystem } from './realTimeMiniGames';

const networkDatabase: Network[] = [
  { ssid: "TARGET_NET", channel: 11, power: -42, security: "WPA2" },
  { ssid: "HomeNetwork_5G", channel: 6, power: -67, security: "WPA3" },
  { ssid: "NETGEAR_Guest", channel: 1, power: -78, security: "OPEN" },
  { ssid: "IoT_Device_001", channel: 11, power: -45, security: "WEP" },
  { ssid: "[HIDDEN]", channel: 8, power: -89, security: "WPA2" }
];

const bleDevices: Device[] = [
  { name: "Smart Watch", mac: "XX:XX:XX:XX:XX:01", type: "Wearable" },
  { name: "Fitness Tracker", mac: "XX:XX:XX:XX:XX:02", type: "Wearable" },
  { name: "IoT Sensor", mac: "XX:XX:XX:XX:XX:03", type: "Sensor" },
  { name: "Shadow Beacon", mac: "SHADOW_MAC_001", type: "Unknown" }
];

export const commands: Record<string, Command> = {
  extract_data: {
    description: "Extract and analyze data from compromised systems",
    usage: "extract_data [target]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const target = args[0] || 'default';
      
      const extractionResults = [
        '> INITIALIZING DATA EXTRACTION PROTOCOL...',
        '> Scanning target filesystem...',
        '> [████████████████████████] 100%',
        '',
        '┌─ EXTRACTED DATA SUMMARY ─┐',
        '│ Files recovered: 247      │',
        '│ Database entries: 1,832   │',
        '│ Encrypted files: 23       │',
        '│ Sensitive docs: 12        │',
        '└───────────────────────────┘',
        '',
        `> Data extraction from ${target} completed successfully.`,
        '> Use "file_recovery" to restore deleted files.',
        ''
      ];

      // Only award credits if this command is completing a mission step
      const shouldAwardCredits = shouldAwardCommandCredits('extract_data', args, true, gameState);
      const updateGameState = shouldAwardCredits ? {
        credits: gameState.credits + 150
      } : undefined;

      return {
        output: extractionResults,
        success: true,
        updateGameState,
        soundEffect: 'success'
      };
    },
    unlockLevel: 999 // Shop exclusive - Advanced data extraction tools
  },

  file_recovery: {
    description: "Recover deleted or corrupted files from extracted data",
    usage: "file_recovery [--deep]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const deepScan = args.includes('--deep');
      
      const recoveryResults = [
        '> STARTING FILE RECOVERY OPERATION...',
        deepScan ? '> Deep scan mode enabled' : '> Standard recovery mode',
        '> Analyzing file signatures...',
        '> [████████████████████████] 100%',
        '',
        '┌─ RECOVERY RESULTS ─┐',
        deepScan ? '│ Files recovered: 89  │' : '│ Files recovered: 34  │',
        deepScan ? '│ Corrupted files: 12  │' : '│ Corrupted files: 5   │',
        deepScan ? '│ Deleted emails: 156  │' : '│ Deleted emails: 67   │',
        '│ System logs: Found   │',
        '└─────────────────────┘',
        '',
        deepScan ? '> Deep recovery completed. Critical files restored.' : '> Standard recovery completed.',
        ''
      ];

      // Only award credits if this command is completing a mission step
      const shouldAwardCredits = shouldAwardCommandCredits('file_recovery', args, true, gameState);
      const creditsAwarded = deepScan ? 200 : 100;
      const updateGameState = shouldAwardCredits ? {
        credits: gameState.credits + creditsAwarded
      } : undefined;

      return {
        output: recoveryResults,
        success: true,
        updateGameState,
        soundEffect: 'success'
      };
    },
    unlockLevel: 999 // Shop exclusive - Data recovery utilities
  },

  extended_scan: {
    description: "Extended range WiFi network scanning with high-gain adapter",
    usage: "extended_scan [--passive]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const passive = args.includes('--passive');
      
      const extendedNetworks = [
        '> EXTENDED RANGE WIFI SCANNING...',
        '> High-gain adapter active',
        passive ? '> Passive mode: Stealth scanning' : '> Active mode: Full spectrum',
        '> [████████████████████████] 100%',
        '',
        '┌─ EXTENDED SCAN RESULTS ─┐',
        '│ SSID: CORP_INTERNAL_5G   │',
        '│ Channel: 149 | -38 dBm   │',
        '│ Security: WPA3-Enterprise │',
        '│                          │',
        '│ SSID: HIDDEN_BACKUP_NET  │',
        '│ Channel: 165 | -45 dBm   │',
        '│ Security: WPA2+AES       │',
        '│                          │',
        '│ SSID: IoT_MANAGEMENT     │',
        '│ Channel: 44 | -52 dBm    │',
        '│ Security: WEP (Vulnerable)│',
        '└──────────────────────────┘',
        '',
        passive ? '> Extended scan completed (undetected)' : '> Extended scan completed',
        '> Additional networks discovered outside normal range.',
        ''
      ];

      return {
        output: extendedNetworks,
        success: true
      };
    },
    unlockLevel: 999 // Shop exclusive - WiFi Adapter v2+
  },

  wifi_monitor: {
    description: "Monitor WiFi traffic and capture packets",
    usage: "wifi_monitor [channel] [--capture]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const channel = args[0] || '11';
      const capture = args.includes('--capture');
      
      const monitorResults = [
        '> STARTING WIFI MONITORING...',
        `> Monitoring channel ${channel}`,
        capture ? '> Packet capture enabled' : '> Monitor mode only',
        '> [████████████████████████] Monitoring...',
        '',
        '┌─ TRAFFIC ANALYSIS ─┐',
        '│ Packets captured: 2,847   │',
        '│ Unique devices: 23        │',
        '│ Data frames: 1,923        │',
        '│ Management frames: 892    │',
        '│ Control frames: 32        │',
        '│                           │',
        '│ Suspicious activity:      │',
        '│ • Deauth attacks detected │',
        '│ • Rogue AP discovered     │',
        '└───────────────────────────┘',
        '',
        capture ? '> Packets saved to capture.pcap' : '> Monitoring session completed',
        ''
      ];

      return {
        output: monitorResults,
        success: true
      };
    },
    unlockLevel: 999 // Shop exclusive - WiFi Suite v3+
  },

  iot_hack: {
    description: "Exploit IoT devices using ESP32 capabilities",
    usage: "iot_hack [device_type]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const deviceType = args[0] || 'smart_camera';
      
      const iotResults = [
        '> ESP32 IOT HACKING MODULE ACTIVATED...',
        `> Targeting ${deviceType.replace('_', ' ')}`,
        '> Scanning for vulnerabilities...',
        '> [████████████████████████] 100%',
        '',
        '┌─ IOT EXPLOITATION ─┐',
        '│ Firmware version: 2.1.4   │',
        '│ Known CVE: CVE-2023-1337  │',
        '│ Default creds: FOUND      │',
        '│ Telnet service: OPEN      │',
        '│                           │',
        '│ EXPLOITATION SUCCESS!     │',
        '│ Device compromised        │',
        '│ Backdoor installed        │',
        '└───────────────────────────┘',
        '',
        `> ${deviceType.replace('_', ' ')} successfully compromised`,
        '> Access maintained through persistent backdoor',
        ''
      ];

      // Only award credits if this command is completing a mission step
      const shouldAwardCredits = shouldAwardCommandCredits('iot_hack', args, true, gameState);
      const updateGameState = shouldAwardCredits ? {
        credits: gameState.credits + 250
      } : undefined;

      return {
        output: iotResults,
        success: true,
        updateGameState,
        soundEffect: 'success'
      };
    },
    unlockLevel: 999 // Shop exclusive - ESP32 Dev v2+
  },

  sensor_spoof: {
    description: "Spoof sensor data using ESP32 transmitters",
    usage: "sensor_spoof [sensor_type] [value]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const sensorType = args[0] || 'temperature';
      const spoofValue = args[1] || '25.5';
      
      const spoofResults = [
        '> ESP32 SENSOR SPOOFING ACTIVATED...',
        `> Targeting ${sensorType} sensors`,
        `> Injecting false reading: ${spoofValue}`,
        '> [████████████████████████] 100%',
        '',
        '┌─ SPOOFING STATUS ─┐',
        '│ Signal transmitted: OK    │',
        '│ Target sensors: 12        │',
        '│ False data injected: OK   │',
        '│ Detection risk: LOW       │',
        '│                           │',
        '│ SPOOFING SUCCESSFUL!      │',
        '│ Sensors compromised       │',
        '└───────────────────────────┘',
        '',
        `> ${sensorType} sensors now reporting: ${spoofValue}`,
        '> Environmental monitoring systems deceived',
        ''
      ];

      // Only award credits if this command is completing a mission step
      const shouldAwardCredits = shouldAwardCommandCredits('sensor_spoof', args, true, gameState);
      const updateGameState = shouldAwardCredits ? {
        credits: gameState.credits + 200
      } : undefined;

      return {
        output: spoofResults,
        success: true,
        updateGameState,
        soundEffect: 'success'
      };
    },
    unlockLevel: 999 // Shop exclusive - ESP32 Dev v2+
  },

  trace: {
    description: "Trace network connections and routing paths",
    usage: "trace [target]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      if (!args[0]) {
        return {
          output: ['Usage: trace [target]'],
          success: false
        };
      }

      return {
        output: [
          `> Tracing route to ${args[0]}...`,
          '',
          '┌─ NETWORK TRACE ─┐',
          '│ 1  192.168.1.1   │',
          '│ 2  10.0.0.1      │',
          '│ 3  203.0.113.1   │',
          '│ 4  * * *         │',
          '│ 5  TARGET FOUND  │',
          '└──────────────────┘',
          '',
          'Trace complete'
        ],
        success: true
      };
    },
    unlockLevel: 1 // Basic networking command
  },

  easter: {
    description: "Show easter egg statistics and hints",
    usage: "easter [stats|hints]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const option = args[0];
      
      if (option === 'stats') {
        const stats = getEasterEggStats();
        return {
          output: [
            '┌─ EASTER EGG STATISTICS ─┐',
            `│ Total Found: ${stats.discovered}/${stats.total}      │`,
            `│ Discovery Rate: ${Math.round((stats.discovered / stats.total) * 100)}%     │`,
            `│ Remaining: ${stats.remaining}    │`,
            '└─────────────────────────┘',
            '',
            'Keep exploring to find hidden secrets!'
          ],
          success: true
        };
      }
      
      if (option === 'hints') {
        const hints = getEasterEggHints();
        return {
          output: [
            '┌─ EASTER EGG HINTS ─┐',
            ...hints.map(hint => `│ ${hint.padEnd(20)} │`),
            '└─────────────────────┘',
            '',
            'Try these commands and phrases!'
          ],
          success: true
        };
      }

      // Get discovered easter egg IDs
      const discoveredIds = getDiscoveredEasterEggs();
      const stats = getEasterEggStats();
      
      const output = [
        '┌─ DISCOVERED EASTER EGGS ─┐',
        ...(discoveredIds.length > 0 
          ? discoveredIds.map((id: string) => `│ ${id.padEnd(24)} │`)
          : ['│ None discovered yet...   │']
        ),
        '└───────────────────────────┘',
        '',
        `Progress: ${stats.discovered}/${stats.total} found`,
        '',
        'Type "easter stats" for statistics',
        'Type "easter hints" for discovery hints'
      ];
      
      return {
        output,
        success: true
      };
    },
    unlockLevel: 0 // Always available
  },

  help: {
    description: "Display available commands",
    usage: "help [command]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      if (args.length > 0) {
        const cmd = args[0];
        if (commands[cmd]) {
          return {
            output: [
              `COMMAND: ${cmd}`,
              `DESCRIPTION: ${commands[cmd].description}`,
              `USAGE: ${commands[cmd].usage}`,
              ''
            ],
            success: true
          };
        } else {
          return {
            output: [`ERROR: Unknown command '${cmd}'`, ''],
            success: false,
            soundEffect: 'error'
          };
        }
      }
      
      const availableCommands = Object.keys(commands).filter(cmd => 
        isCommandAvailable(cmd, gameState)
      );
      
      // Group commands by category for better organization
      const coreCommands = availableCommands.filter(cmd => 
        ['help', 'clear', 'status', 'scan', 'connect', 'man'].includes(cmd)
      );
      const hackingCommands = availableCommands.filter(cmd => 
        ['inject', 'crack', 'exploit', 'bypass', 'spoof', 'decrypt', 'recon'].includes(cmd)
      );
      const systemCommands = availableCommands.filter(cmd => 
        ['shop', 'mission', 'skills', 'faction', 'devmode', 'tutorial', 'psych_profile'].includes(cmd)
      );
      const otherCommands = availableCommands.filter(cmd => 
        !coreCommands.includes(cmd) && !hackingCommands.includes(cmd) && !systemCommands.includes(cmd)
      );

      const output = [
        '╔═══════════════════════════════════════════════════════════════════════════════╗',
        '║                              AVAILABLE COMMANDS                               ║',
        '╠═══════════════════════════════════════════════════════════════════════════════╣'
      ];

      if (coreCommands.length > 0) {
        output.push('║ CORE COMMANDS:                                                                ║');
        coreCommands.forEach(cmd => {
          const desc = commands[cmd].description;
          const line = `║ ${cmd.padEnd(15)} - ${desc.padEnd(55)} ║`;
          output.push(line.substring(0, 79) + '║');
        });
        output.push('║                                                                               ║');
      }

      if (hackingCommands.length > 0) {
        output.push('║ HACKING TOOLS:                                                                ║');
        hackingCommands.forEach(cmd => {
          const desc = commands[cmd].description;
          const line = `║ ${cmd.padEnd(15)} - ${desc.padEnd(55)} ║`;
          output.push(line.substring(0, 79) + '║');
        });
        output.push('║                                                                               ║');
      }

      if (systemCommands.length > 0) {
        output.push('║ SYSTEM ACCESS:                                                                ║');
        systemCommands.forEach(cmd => {
          const desc = commands[cmd].description;
          const line = `║ ${cmd.padEnd(15)} - ${desc.padEnd(55)} ║`;
          output.push(line.substring(0, 79) + '║');
        });
        output.push('║                                                                               ║');
      }

      if (otherCommands.length > 0) {
        output.push('║ OTHER COMMANDS:                                                               ║');
        otherCommands.forEach(cmd => {
          const desc = commands[cmd].description;
          const line = `║ ${cmd.padEnd(15)} - ${desc.padEnd(55)} ║`;
          output.push(line.substring(0, 79) + '║');
        });
        output.push('║                                                                               ║');
      }

      output.push(
        '╠═══════════════════════════════════════════════════════════════════════════════╣',
        '║ Type "man <command>" for detailed help                                       ║',
        '║ Type "hints" for mission-specific guidance                                   ║',
        '╚═══════════════════════════════════════════════════════════════════════════════╝',
        ''
      );
      
      return {
        output,
        success: true
      };
    },
    unlockLevel: 0 // Always available
  },

  scan: {
    description: "Scan for WiFi networks or BLE devices",
    usage: "scan [wifi|ble] [--detailed]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const target = args[0] || 'wifi';
      const detailed = args.includes('--detailed');
      
      // Only award credits if this command is completing a mission step
      const shouldAwardCredits = shouldAwardCommandCredits('scan', args, true, gameState);
      const updateGameState = shouldAwardCredits ? {
        credits: gameState.credits + 25
      } : undefined;

      if (target === 'ble') {
        if (detailed) {
          return {
            output: [
              '> Performing detailed BLE scan...',
              '',
              '┌─ BLUETOOTH LE DEVICES ─┐',
              '│ Device: Smart Watch      │',
              '│ MAC: XX:XX:XX:XX:XX:01   │',
              '│ RSSI: -45 dBm           │',
              '│ Services: Heart Rate     │',
              '│                          │',
              '│ Device: Fitness Tracker  │',
              '│ MAC: XX:XX:XX:XX:XX:02   │',
              '│ RSSI: -52 dBm           │',
              '│ Services: Step Counter   │',
              '│                          │',
              '│ Device: IoT Sensor       │',
              '│ MAC: XX:XX:XX:XX:XX:03   │',
              '│ RSSI: -38 dBm           │',
              '│ Services: Temperature    │',
              '│                          │',
              '│ Device: Shadow Beacon    │',
              '│ MAC: SHADOW_MAC_001      │',
              '│ RSSI: -28 dBm           │',
              '│ Services: Unknown        │',
              '│ ⚠ Encrypted comms        │',
              '└─────────────────────────┘',
              '',
              'Detailed BLE scan complete.',
              ''
            ],
            success: true,
            updateGameState,
            soundEffect: 'success'
          };
        }

        return {
          output: [
            '> Scanning for BLE devices...',
            '',
            '┌─ BLUETOOTH LE DEVICES ─┐',
            '│ Smart Watch             │',
            '│ Fitness Tracker         │',
            '│ IoT Sensor              │',
            '│ Shadow Beacon           │',
            '└─────────────────────────┘',
            '',
            'BLE scan complete. Use "scan ble --detailed" for more info.',
            ''
          ],
          success: true,
          updateGameState,
          soundEffect: 'success'
        };
      }

      if (target === 'wifi') {
        if (detailed) {
          return {
            output: [
              '> Performing detailed WiFi scan...',
              '',
              '┌─ DETAILED SCAN RESULTS ─┐',
              '│ SSID: TARGET_NET        │',
              '│ BSSID: aa:bb:cc:dd:ee:ff │',
              '│ Channel: 11 | -42 dBm   │',
              '│ Security: WPA2-PSK      │',
              '│ Clients: 3 connected    │',
              '│                         │',
              '│ SSID: HomeNetwork_5G    │',
              '│ BSSID: 11:22:33:44:55:66 │',
              '│ Channel: 6 | -67 dBm    │',
              '│ Security: WPA3-SAE      │',
              '│ Clients: 8 connected    │',
              '└─────────────────────────┘',
              '',
              'Detailed scan complete.',
              ''
            ],
            success: true,
            updateGameState,
            soundEffect: 'success'
          };
        }

        return {
          output: [
            '> Scanning for WiFi networks...',
            '',
            '┌─ WIFI NETWORKS ─┐',
            '│ TARGET_NET      │',
            '│ HomeNetwork_5G  │',
            '│ NETGEAR_Guest   │',
            '│ IoT_Device_001  │',
            '│ [HIDDEN]        │',
            '└─────────────────┘',
            '',
            'Scan complete. Use "scan wifi --detailed" for more info.',
            ''
          ],
          success: true,
          updateGameState,
          soundEffect: 'success'
        };
      }

      return {
        output: [
          `ERROR: Unknown scan target '${target}'`,
          'Usage: scan [wifi|ble] [--detailed]',
          'Available targets: wifi, ble',
          ''
        ],
        success: false,
        soundEffect: 'error'
      };
    },
    unlockLevel: 0 // Basic starter command
  },

  connect: {
    description: "Connect to a WiFi network or BLE device",
    usage: "connect <ssid|device_name> [password]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      if (!args[0]) {
        return {
          output: ['Usage: connect <ssid|device_name> [password]'],
          success: false
        };
      }

      const target = args[0];
      const password = args[1];
      
      // Check if it's a BLE device
      const bleDevice = bleDevices.find(d => 
        d.name.toLowerCase().includes(target.toLowerCase()) || 
        target.toLowerCase().includes(d.name.toLowerCase())
      );
      
      if (bleDevice) {
        // Only award credits if this command is completing a mission step
        const shouldAwardCredits = shouldAwardCommandCredits('connect', args, true, gameState);
        const updateGameState = shouldAwardCredits ? {
          networkStatus: 'BLE_CONNECTED',
          connectedNetwork: bleDevice.name,
          credits: gameState.credits + 75
        } : {
          networkStatus: 'BLE_CONNECTED',
          connectedNetwork: bleDevice.name
        };

        if (bleDevice.name === 'Shadow Beacon') {
          return {
            output: [
              `> Connecting to ${bleDevice.name}...`,
              '> Initiating BLE handshake...',
              '> Analyzing encryption protocols...',
              '> Exploiting firmware vulnerability...',
              '',
              '✓ BLE connection established',
              `✓ Connected to ${bleDevice.name}`,
              `✓ Device Type: ${bleDevice.type}`,
              `✓ MAC Address: ${bleDevice.mac}`,
              '',
              '⚠ Suspicious encrypted traffic detected',
              '⚠ This device may be part of a shadow network',
              ''
            ],
            success: true,
            updateGameState,
            soundEffect: 'success'
          };
        }

        return {
          output: [
            `> Connecting to ${bleDevice.name}...`,
            '> Initiating BLE handshake...',
            '> Pairing request sent...',
            '',
            '✓ BLE connection established',
            `✓ Connected to ${bleDevice.name}`,
            `✓ Device Type: ${bleDevice.type}`,
            `✓ MAC Address: ${bleDevice.mac}`,
            '',
            'BLE device ready for interaction',
            ''
          ],
          success: true,
          updateGameState,
          soundEffect: 'success'
        };
      }

      // Check WiFi networks
      const network = networkDatabase.find(n => n.ssid === target);

      if (!network) {
        return {
          output: [`ERROR: Network or device '${target}' not found`, 'Use "scan wifi" or "scan ble" to see available targets'],
          success: false,
          soundEffect: 'error'
        };
      }

      // Special case for TARGET_NET - allow connection without password for tutorial
      if (target === 'TARGET_NET') {
        const shouldAwardCredits = shouldAwardCommandCredits('connect', args, true, gameState);
        const updateGameState = shouldAwardCredits ? {
          networkStatus: 'CONNECTED',
          connectedNetwork: target,
          credits: gameState.credits + 50
        } : {
          networkStatus: 'CONNECTED',
          connectedNetwork: target
        };

        return {
          output: [
            `> Connecting to ${target}...`,
            '> Exploiting known vulnerability...',
            '> Bypassing WPA2 security...',
            '> DHCP request...',
            '',
            '✓ Connection established',
            `✓ Connected to ${target}`,
            `✓ IP: 192.168.4.${Math.floor(Math.random() * 200) + 10}`,
            '',
            '⚠ Unauthorized access detected - stay low profile',
            ''
          ],
          success: true,
          updateGameState,
          soundEffect: 'success'
        };
      }

      if (network.security !== 'OPEN' && !password) {
        return {
          output: [
            `ERROR: Network '${target}' requires password`,
            'Try using "crack" command to discover passwords',
            'Or use "recon" to gather intelligence'
          ],
          success: false,
          soundEffect: 'error'
        };
      }

      // Only award credits if this command is completing a mission step
      const shouldAwardCredits = shouldAwardCommandCredits('connect', args, true, gameState);
      const updateGameState = shouldAwardCredits ? {
        networkStatus: 'CONNECTED',
        connectedNetwork: target,
        credits: gameState.credits + 50
      } : {
        networkStatus: 'CONNECTED',
        connectedNetwork: target
      };

      return {
        output: [
          `> Connecting to ${target}...`,
          '> Authenticating...',
          '> DHCP request...',
          '',
          '✓ Connection established',
          `✓ Connected to ${target}`,
          `✓ IP: 192.168.1.${Math.floor(Math.random() * 200) + 10}`,
          '',
          'Connection successful!',
          ''
        ],
        success: true,
        updateGameState,
        soundEffect: 'success'
      };
    },
    unlockLevel: 0 // Basic starter command
  },

  status: {
    description: "Display system status",
    usage: "status",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const output = [
        '┌─ SYSTEM STATUS ─┐',
        `│ ESP32: ONLINE    │`,
        `│ WiFi: ${gameState.networkStatus.substring(0, 10).padEnd(10)} │`,
        `│ Credits: ${gameState.credits.toString().padEnd(7)} │`,
        `│ Rep: ${gameState.reputation.substring(0, 10).padEnd(10)} │`,
        `│ Missions: ${gameState.completedMissions}/∞    │`,
        '└─────────────────┘'
      ];

      // Add Hydra Protocol status if discovered
      if (gameState.hydraProtocol.discovered) {
        output.push(
          '',
          '┌─ HYDRA PROTOCOL ─┐',
          `│ Status: ${gameState.hydraProtocol.shadow_org_standing.substring(0, 8).padEnd(8)}  │`,
          `│ Level: ${gameState.hydraProtocol.access_level}         │`,
          `│ Suspicion: ${gameState.suspicionLevel}%   │`,
          '└─────────────────┘'
        );
      }

      // Check for active narrative events
      const activeEvent = getNextNarrativeEvent(gameState);
      if (activeEvent) {
        output.push(
          '',
          '⚠ INCOMING TRANSMISSION',
          'Use "frequency 433.92" to decode'
        );
      }

      output.push('');

      return {
        output,
        success: true
      };
    }
  },

  inject: {
    description: "Inject payload into target",
    usage: "inject <payload_name>",
    execute: (args: string[], gameState: GameState): CommandResult => {
      if (args.length === 0) {
        return {
          output: [
            'ERROR: Payload required',
            'Usage: inject <payload_name>',
            '',
            'Available payloads:',
            '• payload (basic injection - always available)',
            '• basic_payload (enhanced version - purchase from shop)',
            '• stealth_payload (advanced stealth)',
            '• data_extractor (mission specific)',
            '',
            'For tutorial: use "inject payload"',
            'For advanced missions: visit shop to buy enhanced payloads'
          ],
          success: false,
          soundEffect: 'error'
        };
      }
      
      if (gameState.networkStatus !== 'CONNECTED' && gameState.networkStatus !== 'BLE_CONNECTED') {
        return {
          output: ['ERROR: No network connection', 'Connect to a WiFi network or BLE device first', ''],
          success: false,
          soundEffect: 'error'
        };
      }

      const payloadName = args[0];
      
      // Check if player owns enhanced payloads
      const ownedPayloads = gameState.narrativeChoices.filter(choice => choice.startsWith('payload_'));
      
      // Basic payload - always available for tutorial
      if (payloadName === 'payload') {
        // Only award credits if this command is completing a mission step
        const shouldAwardCredits = shouldAwardCommandCredits('inject', args, true, gameState);
        const updateGameState = shouldAwardCredits ? {
          credits: gameState.credits + 100
        } : undefined;

        return {
          output: [
            '▶ Loading basic payload...',
            '▶ Encrypting transmission...',
            '▶ Establishing backdoor...',
            '▶ Injecting payload...',
            '',
            '✓ Basic payload deployed successfully',
            '✓ Remote access established',
            '⚠ Maintain low profile',
            '',
            shouldAwardCredits ? '+100 credits earned' : 'Payload injection successful'
          ],
          success: true,
          updateGameState,
          soundEffect: 'success'
        };
      }

      // Enhanced basic payload from shop
      if (payloadName === 'basic_payload') {
        if (!ownedPayloads.includes('payload_basic')) {
          return {
            output: [
              'ERROR: Enhanced payload not available',
              'You need to purchase basic_payload first',
              '',
              'Option 1: Use "inject payload" for basic operations',
              'Option 2: Visit shop → software → buy Basic Payload (200₵)',
              '',
              `Current credits: ${gameState.credits}₵`
            ],
            success: false,
            soundEffect: 'error'
          };
        }

        // Only award credits if this command is completing a mission step
        const shouldAwardCredits = shouldAwardCommandCredits('inject', args, true, gameState);
        const updateGameState = shouldAwardCredits ? {
          credits: gameState.credits + 150
        } : undefined;

        return {
          output: [
            '▶ Loading enhanced payload...',
            '▶ Advanced encryption active...',
            '▶ Multi-vector injection...',
            '▶ Deploying enhanced backdoor...',
            '',
            '✓ Enhanced payload deployed successfully',
            '✓ Advanced remote access established',
            '✓ Stealth protocols active',
            '⚠ Enhanced persistence enabled',
            '',
            shouldAwardCredits ? '+150 credits earned' : 'Enhanced payload injection successful'
          ],
          success: true,
          updateGameState,
          soundEffect: 'success'
        };
      }

      // Stealth payload
      if (payloadName === 'stealth_payload') {
        if (!ownedPayloads.includes('payload_stealth')) {
          return {
            output: [
              'ERROR: Stealth payload not available',
              'Purchase stealth_payload from shop first',
              '',
              'Alternative: Use "inject payload" for basic operations'
            ],
            success: false,
            soundEffect: 'error'
          };
        }

        return {
          output: [
            '▶ Loading stealth payload...',
            '▶ Activating evasion protocols...',
            '▶ Deploying silent injection...',
            '',
            '✓ Stealth payload deployed',
            '✓ Undetected access established',
            '✓ Anti-forensics active'
          ],
          success: true,
          soundEffect: 'success'
        };
      }

      // Hydra handshake for Mission 2
      if (payloadName === 'hydra_handshake') {
        if (gameState.networkStatus !== 'CONNECTED' && gameState.networkStatus !== 'BLE_CONNECTED') {
          return {
            output: [
              'ERROR: No active connection for Hydra Protocol',
              'Connect to a Shadow device first',
              'Use "connect Shadow Beacon" to establish BLE connection'
            ],
            success: false,
            soundEffect: 'error'
          };
        }

        // Only award credits if this command is completing a mission step
        const shouldAwardCredits = shouldAwardCommandCredits('inject', args, true, gameState);
        const updateGameState = shouldAwardCredits ? {
          credits: gameState.credits + 300,
          hydraProtocol: {
            ...gameState.hydraProtocol,
            discovered: true,
            active_contacts: ['SHADOW_NODE_07']
          }
        } : {
          hydraProtocol: {
            ...gameState.hydraProtocol,
            discovered: true,
            active_contacts: ['SHADOW_NODE_07']
          }
        };

        return {
          output: [
            '▶ HYDRA PROTOCOL INJECTION ▶',
            '',
            '> Loading Hydra handshake payload...',
            '> Establishing encrypted channel...',
            '> Negotiating Shadow protocols...',
            '> Authenticating with Shadow nodes...',
            '',
            '✓ Hydra Protocol successfully initialized',
            '✓ Shadow network access established',
            '✓ Encrypted communication channel active',
            '',
            '🐍 Welcome to the Shadow Organization',
            '📡 Encrypted messages incoming...',
            '',
            shouldAwardCredits ? '+300 credits earned' : 'Hydra Protocol active'
          ],
          success: true,
          updateGameState,
          soundEffect: 'success'
        };
      }

      return {
        output: [
          `ERROR: Unknown payload "${payloadName}"`,
          '',
          'Available options:',
          '• inject payload (basic - always available)',
          '• inject basic_payload (enhanced - requires purchase)',
          '• inject stealth_payload (advanced - requires purchase)',
          '',
          'Use "shop" to purchase enhanced payloads'
        ],
        success: false,
        soundEffect: 'error'
      };
    }
  },

  spoof: {
    description: "Spoof device identity",
    usage: "spoof <type> --mac <address> | spoof ble --mac <address>",
    unlockLevel: 0, // Changed from 2 to 0 - needed for Mission 2
    execute: (args: string[], gameState: GameState): CommandResult => {
      if (args.length === 0) {
        return {
          output: [
            'Usage: spoof <type> --mac <address>',
            'Types: device, ble',
            'Example: spoof ble --mac SHADOW_MAC'
          ],
          success: false
        };
      }

      const deviceType = args[0];
      
      if (deviceType === 'ble') {
        if (args[1] !== '--mac' || !args[2]) {
          return {
            output: ['Usage: spoof ble --mac <mac_address>'],
            success: false
          };
        }

        const macAddress = args[2];
        
        if (macAddress === 'SHADOW_MAC' || macAddress === 'SHADOW_MAC_001') {
          // Only award credits if this command is completing a mission step
          const shouldAwardCredits = shouldAwardCommandCredits('spoof', args, true, gameState);
          const updateGameState = shouldAwardCredits ? {
            credits: gameState.credits + 200
          } : undefined;

          return {
            output: [
              '▶ BLE IDENTITY SPOOFING ▶',
              '',
              `> Spoofing MAC address: ${macAddress}`,
              '> Cloning Shadow Beacon identity...',
              '> Generating fake device signatures...',
              '> Bypassing authentication protocols...',
              '',
              '✓ BLE identity successfully spoofed',
              '✓ Now appearing as trusted Shadow device',
              '✓ Shadow Organization protocols accessible',
              '',
              '⚠ Spoof duration: 10 minutes',
              '⚠ Shadow network access granted',
              ''
            ],
            success: true,
            updateGameState,
            soundEffect: 'success'
          };
        }

        return {
          output: [
            '▶ BLE IDENTITY SPOOFING ▶',
            '',
            `> Spoofing MAC address: ${macAddress}`,
            '> Cloning device identity...',
            '> Generating fake signatures...',
            '',
            '✓ BLE identity spoofed successfully',
            '✓ Device now appears trusted',
            '',
            '⚠ Spoof active for 5 minutes'
          ],
          success: true,
          soundEffect: 'success'
        };
      }

      // Original device spoofing logic
      return {
        output: [
          '▶ Initializing identity spoofing...',
          '▶ Randomizing MAC address...',
          '▶ Cloning device fingerprint...',
          '',
          '✓ Identity spoofed successfully',
          '✓ Device now appears as trusted node',
          '⚠ Spoof duration: 5 minutes',
          ''
        ],
        success: true,
        soundEffect: 'success'
      };
    }
  },

  bypass: {
    description: "Bypass security systems",
    usage: "bypass <system> [--method <method>]",
    unlockLevel: 3,
    execute: (args: string[], gameState: GameState): CommandResult => {
      if (args.length === 0) {
        return {
          output: ['ERROR: System target required', 'Usage: bypass <system>', ''],
          success: false,
          soundEffect: 'error'
        };
      }

      return {
        output: [
          `▶ Analyzing ${args[0]} security...`,
          '▶ Searching for vulnerabilities...',
          '▶ Exploiting buffer overflow...',
          '▶ Escalating privileges...',
          '',
          `✓ ${args[0]} bypass successful`,
          '✓ Administrative access granted',
          '⚠ Detection risk: MODERATE',
          ''
        ],
        success: true,
        soundEffect: 'success'
      };
    }
  },

  reboot: {
    description: "Reboot the system",
    usage: "reboot [--force]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      return {
        output: [
          '▶ Initiating system reboot...',
          '▶ Saving current state...',
          '▶ Shutting down modules...',
          '',
          'System will restart in 3 seconds...',
          ''
        ],
        success: true,
        updateGameState: { networkStatus: 'DISCONNECTED' }
      };
    }
  },

  clear: {
    description: "Clear terminal screen",
    usage: "clear",
    execute: (args: string[], gameState: GameState): CommandResult => {
      return {
        output: ['CLEAR_SCREEN'],
        success: true
      };
    }
  },

  man: {
    description: "Display manual page for command",
    usage: "man <command>",
    execute: (args: string[], gameState: GameState): CommandResult => {
      if (args.length === 0) {
        return {
          output: ['ERROR: Command required', 'Usage: man <command>', ''],
          success: false,
          soundEffect: 'error'
        };
      }
      
      const cmd = args[0];
      if (!commands[cmd]) {
        return {
          output: [`ERROR: No manual entry for '${cmd}'`, ''],
          success: false,
          soundEffect: 'error'
        };
      }
      
      return {
        output: [
          `╔════════════════════════════════════════╗`,
          `║ MANUAL: ${cmd.toUpperCase().padEnd(30)} ║`,
          `╠════════════════════════════════════════╣`,
          `║                                        ║`,
          `║ DESCRIPTION:                           ║`,
          `║   ${commands[cmd].description.padEnd(34)} ║`,
          `║                                        ║`,
          `║ USAGE:                                 ║`,
          `║   ${commands[cmd].usage.padEnd(34)} ║`,
          `║                                        ║`,
          `╚════════════════════════════════════════╝`,
          ''
        ],
        success: true
      };
    }
  },

  // Hydra Protocol Commands
  frequency: {
    description: "Scan radio frequencies",
    usage: "frequency [freq]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const freq = args[0];
      
      if (!freq) {
        return {
          output: [
            '┌─ FREQUENCY SCAN ─┐',
            '│ 433.92 MHz: ████ │',
            '│ 868.00 MHz: ▓▓▓▓ │',
            '│ 915.00 MHz: ▓▓▓▓ │',
            '│ 2400.0 MHz: ████ │',
            '└─────────────────┘',
            '',
            '⚠ Strong signal on 433.92MHz',
            'Use: frequency 433.92'
          ],
          success: true
        };
      }

      if (freq === '433.92') {
        // Check if this triggers Hydra discovery
        if (gameState.completedMissions >= 3 && !gameState.hydraProtocol.discovered) {
          const event = getNextNarrativeEvent(gameState);
          if (event) {
            return {
              output: [
                '▶ Tuning to 433.92MHz...',
                '▶ Signal locked!',
                '',
                ...formatNarrativeEvent(event)
              ],
              success: true,
              updateGameState: {
                hydraProtocol: {
                  ...gameState.hydraProtocol,
                  discovered: true
                }
              },
              soundEffect: 'alert'
            };
          }
        }
        
        return {
          output: [
            '▶ Tuning to 433.92MHz...',
            '▶ Encrypted transmission detected',
            '▶ Signal strength: -23dBm',
            '',
            'Use "decrypt" command to decode'
          ],
          success: true
        };
      }

      return {
        output: [
          `▶ Tuning to ${freq}MHz...`,
          '▶ No significant signals detected',
          '▶ Background noise only'
        ],
        success: true
      };
    },
    unlockLevel: 3
  },

  decrypt: {
    description: "Decrypt messages",
    usage: "decrypt [key]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const key = args[0];
      
      // Shadow key decryption for Mission 2
      if (key === 'shadow_key') {
        if (!gameState.hydraProtocol.discovered) {
          return {
            output: [
              'ERROR: Hydra Protocol not initialized',
              'Initialize Hydra Protocol first',
              'Use "inject hydra_handshake" to establish connection'
            ],
            success: false,
            soundEffect: 'error'
          };
        }

        // Only award credits if this command is completing a mission step
        const shouldAwardCredits = shouldAwardCommandCredits('decrypt', args, true, gameState);
        const updateGameState = shouldAwardCredits ? {
          credits: gameState.credits + 400,
          hydraProtocol: {
            ...gameState.hydraProtocol,
            access_level: 2,
            encrypted_messages: [
              {
                id: 'shadow_msg_001',
                from: 'SHADOW_COMMAND',
                content: 'Welcome, new operative. You have passed the first test. More challenging missions await.',
                encrypted_content: 'XyZ9$#mK!@vN...encrypted_shadow_message...pL8&^qR2',
                is_decrypted: true,
                timestamp: Date.now()
              }
            ]
          }
        } : {
          hydraProtocol: {
            ...gameState.hydraProtocol,
            access_level: 2,
            encrypted_messages: [
              {
                id: 'shadow_msg_001',
                from: 'SHADOW_COMMAND',
                content: 'Welcome, new operative. You have passed the first test. More challenging missions await.',
                encrypted_content: 'XyZ9$#mK!@vN...encrypted_shadow_message...pL8&^qR2',
                is_decrypted: true,
                timestamp: Date.now()
              }
            ]
          }
        };

        return {
          output: [
            '▶ SHADOW KEY DECRYPTION ▶',
            '',
            '> Applying Shadow decryption key...',
            '> Decoding quantum-encrypted messages...',
            '> Verifying message integrity...',
            '',
            '✓ Shadow messages successfully decrypted',
            '',
            '┌─ DECRYPTED MESSAGE ─┐',
            '│ FROM: SHADOW_COMMAND         │',
            '│ TO: NEW_OPERATIVE            │',
            '│ PRIORITY: HIGH               │',
            '│                              │',
            '│ Welcome, new operative.      │',
            '│ You have passed the first    │',
            '│ test. More challenging       │',
            '│ missions await.              │',
            '│                              │',
            '│ Report to Shadow Node 07     │',
            '│ for further instructions.    │',
            '└─────────────────────────────┘',
            '',
            '🎯 Mission Complete: Shadow Network Access Established',
            shouldAwardCredits ? '+400 credits earned' : 'Shadow messages decrypted'
          ],
          success: true,
          updateGameState,
          soundEffect: 'success'
        };
      }
      
      if (!gameState.hydraProtocol.discovered) {
        return {
          output: ['No encrypted data available'],
          success: false
        };
      }

      if (!key) {
        return {
          output: [
            '┌─ ENCRYPTED DATA ─┐',
            '│ MSG_001: ████████ │',
            '│ MSG_002: ████████ │',
            '│ MSG_003: ████████ │',
            '└─────────────────┘',
            '',
            'Use: decrypt <key>'
          ],
          success: true
        };
      }

      // Simulate decryption attempts
      if (key === 'SHADOW07') {
        return {
          output: [
            '▶ Decryption successful!',
            '',
            '┌─ DECRYPTED MESSAGE ─┐',
            '│ FROM: UNKNOWN_NODE  │',
            '│ MSG: FIRST CONTACT  │',
            '│ HYDRA PROTOCOL      │',
            '│ ACTIVE              │',
            '└────────────────────┘',
            '',
            'New contact established'
          ],
          success: true,
          updateGameState: {
            hydraProtocol: {
              ...gameState.hydraProtocol,
              active_contacts: ['SHADOW_NODE_07']
            }
          },
          soundEffect: 'success'
        };
      }

      return {
        output: [
          '▶ Decryption failed',
          '▶ Invalid key or corrupted data',
          '⚠ Attempt logged'
        ],
        success: false,
        updateGameState: {
          suspicionLevel: gameState.suspicionLevel + 5
        }
      };
    },
    unlockLevel: 0
  },

  choose: {
    description: "Make narrative choice or mission decision",
    usage: "choose <number>",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const choiceNum = parseInt(args[0]);
      if (!choiceNum) {
        return {
          output: ['Usage: choose <number>'],
          success: false
        };
      }

      // Check for branching mission choice first
      const { getCurrentMission } = require('./missions');
      const currentMission = getCurrentMission(gameState);
      
      if (currentMission) {
        // Find current branch point
        const currentStep = currentMission.steps.find((step: any) => 
          step.branchPoint && !step.completed
        );
        
        if (currentStep?.branchPoint) {
          const choice = currentStep.branchPoint.choices[choiceNum - 1];
          if (!choice) {
            return {
              output: ['Invalid choice number'],
              success: false
            };
          }

          // Check skill requirements
          if (choice.skillRequirement && !gameState.skillTree.nodes.some(node => 
            node.id === choice.skillRequirement && node.purchased)) {
            return {
              output: [
                `▶ CHOICE BLOCKED ▶`,
                '',
                `✗ Requires skill: ${choice.skillRequirement}`,
                '✗ Insufficient expertise for this approach',
                '',
                'Develop your skills and try again.'
              ],
              success: false,
              soundEffect: 'error'
            };
          }

          return {
            output: [
              `▶ CHOICE SELECTED: ${choice.text} ▶`,
              '',
              `Description: ${choice.description}`,
              '',
              '┌─ CONSEQUENCES ─┐',
              ...choice.consequences.map((c: string) => `│ • ${c.substring(0, 30).padEnd(30)} │`),
              '└───────────────┘',
              '',
              `Reward Modifier: ${choice.rewardModifier}x`,
              choice.suspicionChange ? `Suspicion Change: ${choice.suspicionChange > 0 ? '+' : ''}${choice.suspicionChange}` : '',
              '',
              '▶ Mission path updated. Continue with new objectives.'
            ],
            success: true,
            soundEffect: 'success'
          };
        }
      }

      // Fall back to narrative choice system
      const currentEvent = getNextNarrativeEvent(gameState);
      if (!currentEvent) {
        return {
          output: ['No active choices available'],
          success: false
        };
      }

      const choice = currentEvent.choices[choiceNum - 1];
      if (!choice) {
        return {
          output: ['Invalid choice number'],
          success: false
        };
      }

      const updates = processNarrativeChoice(gameState, currentEvent.id, choice.id);
      
      return {
        output: [
          `▶ Choice selected: ${choice.text}`,
          '',
          '┌─ CONSEQUENCES ─┐',
          ...choice.consequences.map((c: string) => `│ ${c.substring(0, 15).padEnd(15)} │`),
          '└───────────────┘',
          '',
          `Reputation: ${updates.reputation || gameState.reputation}`,
          `Suspicion: ${updates.suspicionLevel}%`
        ],
        success: true,
        updateGameState: updates,
        soundEffect: 'success'
      };
    },
    unlockLevel: 3
  },

  reset_shop: {
    description: "Reset shop purchases and restore credits (dev command)",
    usage: "reset_shop",
    execute: (args: string[], gameState: GameState): CommandResult => {
      // Reset purchased items and restore credits
      const updates = {
        unlockedCommands: ['help', 'scan', 'connect', 'decrypt', 'clear', 'status', 'shop', 'devmode', 'multiplayer', 'leaderboard', 'easter', 'reset_shop', 'tutorial', 'settings'],
        credits: 1000, // Standard starting credits
        inventory: {
          hardware: [],
          software: [],
          payloads: [],
          intel: []
        }
      };

      return {
        output: [
          '> SHOP RESET INITIATED...',
          '> Clearing purchased items...',
          '> Restoring credits...',
          '> Resetting unlocked commands...',
          '',
          '┌─ RESET COMPLETE ─┐',
          '│ Credits: 1000     │',
          '│ Items: Cleared    │',
          '│ Commands: Reset   │',
          '└───────────────────┘',
          '',
          '> Shop reset successfully. You can now test purchases!',
          ''
        ],
        success: true,
        updateGameState: updates,
        soundEffect: 'success'
      };
    }
  },

  hydra: {
    description: "Access Hydra Protocol",
    usage: "hydra [status|contacts|messages]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      if (!gameState.hydraProtocol.discovered) {
        return {
          output: ['Access denied: Unknown protocol'],
          success: false
        };
      }

      const subcommand = args[0] || 'status';

      switch (subcommand) {
        case 'status':
          return {
            output: [
              '┌─ HYDRA PROTOCOL ─┐',
              `│ Level: ${gameState.hydraProtocol.access_level}        │`,
              `│ Branch: ${gameState.hydraProtocol.current_branch.substring(0, 8).padEnd(8)}   │`,
              `│ Nodes: ${gameState.hydraProtocol.completed_nodes.length}/∞        │`,
              `│ Status: ${gameState.hydraProtocol.shadow_org_standing.substring(0, 7).padEnd(7)}  │`,
              '└─────────────────┘',
              '',
              'Subcommands: contacts, messages'
            ],
            success: true
          };

        case 'contacts':
          return {
            output: [
              '┌─ ACTIVE CONTACTS ─┐',
              ...gameState.hydraProtocol.active_contacts.map(contact => 
                `│ ${contact.substring(0, 16).padEnd(16)} │`
              ),
              '└──────────────────┘'
            ],
            success: true
          };

        case 'messages':
          return {
            output: [
              '┌─ ENCRYPTED MSGS ─┐',
              ...gameState.hydraProtocol.encrypted_messages.map(msg => 
                `│ ${msg.from.substring(0, 8)} ${msg.is_decrypted ? '✓' : '✗'} │`
              ),
              '└─────────────────┘'
            ],
            success: true
          };

        default:
          return {
            output: ['Unknown subcommand'],
            success: false
          };
      }
    },
    unlockLevel: 3
  },

  // Additional Hacker Commands
  nmap: {
    description: "Network port scanner",
    usage: "nmap <target>",
    execute: (args: string[], gameState: GameState): CommandResult => {
      if (!args[0]) {
        return {
          output: ['Usage: nmap <target>'],
          success: false
        };
      }

      const target = args[0];
      const ports = [22, 80, 443, 8080, 3389, 21, 25, 110];
      const openPorts = ports.filter(() => Math.random() > 0.6);

      // Only award credits if this command is completing a mission step
      const shouldAwardCredits = shouldAwardCommandCredits('nmap', args, true, gameState);
      const updateGameState = shouldAwardCredits ? {
        credits: gameState.credits + 50
      } : undefined;

      return {
        output: [
          `▶ Scanning ${target}...`,
          '',
          '┌─ OPEN PORTS ─┐',
          ...openPorts.map(port => `│ ${port.toString().padStart(4)}/tcp open │`),
          '└─────────────┘',
          '',
          `${openPorts.length} ports found`
        ],
        success: true,
        updateGameState,
        soundEffect: 'success'
      };
    },
    unlockLevel: 1
  },

  exploit: {
    description: "Run exploit against target",
    usage: "exploit <target> --payload <payload>",
    execute: (args: string[], gameState: GameState): CommandResult => {
      if (!args[0]) {
        return {
          output: ['Usage: exploit <target> --payload <payload>'],
          success: false
        };
      }

      const target = args[0];
      
      // Get skill bonuses
      const skillBonuses = getSkillBonuses(gameState.skillTree, 'exploit', ['exploit', 'offensive']);
      const factionBonus = calculateFactionBonus(gameState.activeFaction || '', 'exploit', gameState);
      
      // Calculate total success rate
      const baseSuccessRate = 0.7; // 70% base
      const totalSuccessRate = Math.min(0.95, baseSuccessRate + (skillBonuses.successBonus / 100) + (factionBonus.successBonus / 100));
      const success = Math.random() < totalSuccessRate;
      
      if (success) {
        const baseCredits = Math.floor(Math.random() * 500) + 200;
        const skillMultipliedCredits = Math.floor(baseCredits * skillBonuses.creditMultiplier);
        const finalCredits = Math.floor(skillMultipliedCredits * factionBonus.creditMultiplier);
        
        // Award skill points for successful exploits
        const newSkillPoints = awardSkillPoints(gameState, 'successful_exploit', 1);
        
        const shouldAwardCredits = shouldAwardCommandCredits('exploit', args, true, gameState);
        const updateGameState = shouldAwardCredits ? {
          credits: gameState.credits + finalCredits,
          completedMissions: gameState.completedMissions + 1,
          skillTree: {
            ...gameState.skillTree,
            skillPoints: newSkillPoints
          }
        } : {
          completedMissions: gameState.completedMissions + 1,
          skillTree: {
            ...gameState.skillTree,
            skillPoints: newSkillPoints
          }
        };

        return {
          output: [
            `▶ Targeting ${target}...`,
            '▶ Payload delivered',
            '▶ Exploiting vulnerability...',
            '',
            '✓ Shell access gained!',
            '✓ Privilege escalation complete',
            '',
            shouldAwardCredits ? `+${finalCredits} credits earned` : 'Exploit successful',
            skillBonuses.successBonus > 0 ? `🧠 Skill bonus: +${skillBonuses.successBonus}% success rate` : '',
            skillBonuses.creditMultiplier > 1 ? `🧠 Skill bonus: ${skillBonuses.creditMultiplier}x credits` : '',
            '+1 skill point awarded'
          ],
          success: true,
          updateGameState,
          soundEffect: 'success'
        };
      } else {
        return {
          output: [
            `▶ Targeting ${target}...`,
            '▶ Payload delivered',
            '▶ Access denied',
            '',
            '✗ Exploit failed',
            '⚠ Target may have detected intrusion',
            skillBonuses.successBonus > 0 ? `🧠 Skill bonus applied: +${skillBonuses.successBonus}% (still failed)` : ''
          ],
          success: false,
          updateGameState: {
            suspicionLevel: gameState.suspicionLevel + Math.max(5, 10 - skillBonuses.detectionReduction)
          },
          soundEffect: 'error'
        };
      }
    },
    unlockLevel: 2
  },

  backdoor: {
    description: "Install persistent backdoor",
    usage: "backdoor <target>",
    execute: (args: string[], gameState: GameState): CommandResult => {
      if (!args[0]) {
        return {
          output: ['Usage: backdoor <target>'],
          success: false
        };
      }

      const target = args[0];
      
      // Only award credits if this command is completing a mission step
      const shouldAwardCredits = shouldAwardCommandCredits('backdoor', args, true, gameState);
      const updateGameState = shouldAwardCredits ? {
        credits: gameState.credits + 300,
        completedMissions: gameState.completedMissions + 1
      } : {
        completedMissions: gameState.completedMissions + 1
      };
      
      return {
        output: [
          `▶ Installing backdoor on ${target}...`,
          '▶ Creating persistence mechanism...',
          '▶ Hiding from antivirus...',
          '',
          '✓ Backdoor installed',
          '✓ Command & control established',
          '⚠ Maintain operational security',
          '',
          shouldAwardCredits ? '+300 credits earned' : 'Backdoor installed successfully'
        ],
        success: true,
        updateGameState,
        soundEffect: 'success'
      };
    },
    unlockLevel: 3
  },

  // Shop Interface - Always available
  shop: {
    description: "Open enhanced shop interface",
    usage: "shop",
    execute: (args: string[], gameState: GameState): CommandResult => {
      // Direct trigger without complex state updates
      setTimeout(() => {
        const event = new CustomEvent('openEnhancedShop');
        window.dispatchEvent(event);
      }, 100);

      return {
        output: [
          '▶ Accessing enhanced shop interface...',
          '▶ Loading professional hacking tools...',
          '▶ Connecting to secure marketplace...',
          '',
          '✓ Enhanced shop interface opened',
          '',
          `Credits: ${gameState.credits.toLocaleString()}₵`,
          `Missions Completed: ${gameState.completedMissions}`,
          `Items Owned: ${(gameState.inventory?.hardware?.length || 0) + 
                         (gameState.inventory?.software?.length || 0) + 
                         (gameState.inventory?.payloads?.length || 0) + 
                         (gameState.inventory?.intel?.length || 0)}`,
          '',
          '🛒 Browse categories: Hardware, Software, Payloads, Black Market',
          '💰 Purchase items to unlock new commands and capabilities',
          '🔓 Complete missions to unlock higher-tier items',
          '',
          'Use the interface to browse and purchase items'
        ],
        success: true
      };
    }
    // No unlock level = always available
  },

  // Test command to verify system works
  test: {
    description: "Test command",
    usage: "test",
    execute: (args: string[], gameState: GameState): CommandResult => {
      return {
        output: [
          'Test command works!',
          'Shop command should also be available now.'
        ],
        success: true
      };
    }
  },

  // New tool commands from shop
  crack: {
    description: "Crack WiFi passwords",
    usage: "crack <ssid>",
    execute: (args: string[], gameState: GameState): CommandResult => {
      if (!args[0]) {
        return {
          output: ['Usage: crack <ssid>'],
          success: false
        };
      }

      const ssid = args[0];
      const success = Math.random() > 0.4;
      
      if (success) {
        const password = ['admin123', 'password', '12345678', 'qwerty123'][Math.floor(Math.random() * 4)];
        
        // Only award credits if this command is completing a mission step
        const shouldAwardCredits = shouldAwardCommandCredits('crack', args, true, gameState);
        const updateGameState = shouldAwardCredits ? {
          credits: gameState.credits + 200
        } : undefined;
        
        return {
          output: [
            `▶ Cracking ${ssid}...`,
            '▶ Dictionary attack in progress...',
            '▶ Trying common passwords...',
            '',
            '✓ Password cracked!',
            `✓ Password: ${password}`,
            '',
            shouldAwardCredits ? '+200 credits earned' : 'Password successfully cracked'
          ],
          success: true,
          updateGameState,
          soundEffect: 'success'
        };
      } else {
        return {
          output: [
            `▶ Cracking ${ssid}...`,
            '▶ Dictionary attack failed',
            '▶ Strong encryption detected',
            '',
            '✗ Unable to crack password'
          ],
          success: false
        };
      }
    },
    unlockLevel: 999 // Only available through shop
  },

  keylog: {
    description: "Deploy keylogger",
    usage: "keylog <target>",
    execute: (args: string[], gameState: GameState): CommandResult => {
      if (!args[0]) {
        return {
          output: ['Usage: keylog <target>'],
          success: false
        };
      }

      const target = args[0];
      
      // Only award credits if this command is completing a mission step
      const shouldAwardCredits = shouldAwardCommandCredits('keylog', args, true, gameState);
      const updateGameState = shouldAwardCredits ? {
        credits: gameState.credits + 150
      } : undefined;
      
      return {
        output: [
          `▶ Deploying keylogger to ${target}...`,
          '▶ Injecting into system processes...',
          '▶ Enabling stealth mode...',
          '',
          '✓ Keylogger active',
          '✓ Capturing keystrokes...',
          '⚠ Data will be sent every 24h',
          '',
          shouldAwardCredits ? '+150 credits earned' : 'Keylogger deployed successfully'
        ],
        success: true,
        updateGameState,
        soundEffect: 'success'
      };
    },
    unlockLevel: 999 // Only available through shop
  },

  // Mission system
  mission: {
    description: "View current mission",
    usage: "mission [complete]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const { getCurrentMission } = require('./missions');
      const { calculateMissionProgress } = require('./missionTracker');
      const currentMission = getCurrentMission(gameState);
      
      if (!currentMission) {
        return {
          output: [
            'No active missions',
            'Complete more operations to unlock missions'
          ],
          success: true
        };
      }

      const subcommand = args[0];
      const progress = calculateMissionProgress(gameState);
      
      if (subcommand === 'complete') {
        // Check if all steps are completed
        const allCompleted = currentMission.steps.every((step: MissionStep) => step.completed);
        
        if (allCompleted) {
          return {
            output: [
              `✓ Mission "${currentMission.title}" completed!`,
              '',
              `Reward: +${currentMission.reward} credits`,
              `Status: Mission accomplished`,
              '',
              'New missions unlocked!'
            ],
            success: true,
            updateGameState: {
              credits: gameState.credits + currentMission.reward,
              completedMissions: gameState.completedMissions + 1,
              currentMission: gameState.currentMission + 1,
              missionProgress: 100
            },
            soundEffect: 'success'
          };
        } else {
          const remaining = currentMission.steps.filter((step: MissionStep) => !step.completed);
          return {
            output: [
              'Mission not yet complete',
              '',
              'Remaining steps:',
              ...remaining.map((step: MissionStep) => `• ${step.description}`)
            ],
            success: false
          };
        }
      }

      // Show mission details
      return {
        output: [
          `┌─ MISSION: ${currentMission.title} ─┐`,
          `│ Objective: ${currentMission.objective}`,
          `│ Progress: ${progress}%`,
          `│ Reward: ${currentMission.reward} credits`,
          `│ Difficulty: ${currentMission.difficulty}`,
          '└─────────────────────────────────┘',
          '',
          'Mission Steps:',
          ...currentMission.steps.map((step: MissionStep, index: number) => 
            `${step.completed ? '✓' : '○'} ${index + 1}. ${step.description}`
          ),
          '',
          progress === 100 ? 'Type "mission complete" to finish!' : 'Complete the steps above to progress.'
        ],
        success: true
      };
    }
  },

  // Mission completion tracker
  complete: {
    description: "Complete current mission",
    usage: "complete",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const { getCurrentMission } = require('./missions');
      const { calculateMissionProgress } = require('./missionTracker');
      const currentMission = getCurrentMission(gameState);
      
      if (!currentMission) {
        return {
          output: ['No active mission to complete'],
          success: false
        };
      }

      const progress = calculateMissionProgress(gameState);
      
      // Check if mission is actually complete
      if (progress === 100) {
        return {
          output: [
            `✓ Mission "${currentMission.title}" completed!`,
            '',
            `▶ Extracting data...`,
            `▶ Cleaning traces...`,
            `▶ Mission accomplished!`,
            '',
            `Reward: +${currentMission.reward} credits`,
            `Bonus: +1 skill point`,
            '',
            'New missions available!'
          ],
          success: true,
          updateGameState: {
            credits: gameState.credits + currentMission.reward,
            completedMissions: gameState.completedMissions + 1,
            currentMission: gameState.currentMission + 1,
            missionProgress: 0, // Reset for next mission
            skillTree: {
              ...gameState.skillTree,
              skillPoints: gameState.skillTree.skillPoints + 1
            }
          },
          soundEffect: 'success'
        };
      }

      // Mission not complete yet
      const remaining = currentMission.steps.filter((step: MissionStep) => !step.completed);
      return {
        output: [
          'Mission not yet complete',
          '',
          `Progress: ${progress}%`,
          '',
          'Required steps:',
          ...remaining.map((step: MissionStep) => `○ ${step.description}`),
          '',
          'Complete all steps then try again'
        ],
        success: false
      };
    }
  },

  // Multiplayer access commands
  multiplayer: {
    description: "Access multiplayer lobby",
    usage: "multiplayer",
    execute: (args: string[], gameState: GameState): CommandResult => {
      setTimeout(() => {
        const event = new CustomEvent('showMultiplayer');
        window.dispatchEvent(event);
      }, 100);
      
      return {
        success: true,
        output: [
          "▶ Connecting to multiplayer network...",
          "▶ Establishing secure connection...",
          "",
          "✓ Multiplayer lobby accessed",
          "✓ Ready to create or join rooms",
          "",
          "Use the interface to team up with other hackers!"
        ]
      };
    },
    unlockLevel: 0 // Always available
  },

  leaderboard: {
    description: "View global leaderboards",
    usage: "leaderboard",
    execute: (args: string[], gameState: GameState): CommandResult => {
      setTimeout(() => {
        const event = new CustomEvent('showLeaderboard');
        window.dispatchEvent(event);
      }, 100);
      
      return {
        success: true,
        output: [
          "▶ Accessing global leaderboards...",
          "▶ Retrieving player statistics...",
          "",
          "✓ Leaderboard data loaded",
          "✓ Rankings available for:",
          "  • Mission completion",
          "  • Speed runs",
          "  • Multiplayer wins",
          "  • Total credits earned"
        ]
      };
    },
    unlockLevel: 0 // Always available
  },

  devmode: {
    description: "Developer mode access (password protected)",
    usage: "devmode [password] | devmode off",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const DEV_PASSWORD = "RogueSim2025!";
      const command = args[0];
      
      // Check if trying to deactivate dev mode
      if (command === 'off') {
        return {
          success: true,
          output: [
            "▶ DEVELOPER MODE DEACTIVATED ▶",
            "",
            "✓ Returning to normal game state",
            "✓ Credits reset to normal levels",
            "✓ Command access restricted",
            "",
            "⚡ Back to regular gameplay!",
            ""
          ],
          updateGameState: {
            credits: 1000,
            playerLevel: 1,
            completedMissions: 0,
            unlockedCommands: ['help', 'scan', 'connect', 'decrypt', 'clear', 'status', 'shop', 'devmode', 'multiplayer', 'leaderboard', 'easter', 'reset_shop'],
            reputation: 'NOVICE'
          },
          soundEffect: 'success'
        };
      }
      
      // Check password
      if (command !== DEV_PASSWORD) {
        return {
          success: false,
          output: [
            "▶ ACCESS DENIED ▶",
            "",
            "✗ Invalid developer credentials",
            "✗ Authorization required",
            "",
            "Usage: devmode [password]",
            "       devmode off (to deactivate)",
            ""
          ],
          soundEffect: 'error'
        };
      }
      
      // Activate dev mode with correct password
      return {
        success: true,
        output: [
          "▶ DEVELOPER MODE ACTIVATED ▶",
          "",
          "✓ Level: 100 (MAX)",
          "✓ Credits: 999,999,999₵",
          "✓ All commands unlocked",
          "✓ Multiplayer access granted",
          "",
          "⚡ Everything is now available!",
          "",
          "Type 'devmode off' to deactivate",
          "Type 'reset_shop' to test shop system",
          ""
        ],
        updateGameState: {
          credits: 999999999,
          playerLevel: 100,
          completedMissions: 250,
          unlockedCommands: [
            'help', 'scan', 'connect', 'inject', 'deauth', 'crack', 'exploit', 'backdoor',
            'decrypt', 'nmap', 'keylog', 'shop', 'skills', 'mission', 'complete',
            'hydra', 'choose', 'multiplayer', 'leaderboard', 'devmode', 'profile', 'login',
            'extract_data', 'file_recovery', 'extended_scan', 'wifi_monitor', 'iot_hack', 'sensor_spoof', 'reset_shop'
          ],
          reputation: 'ELITE'
        },
        soundEffect: 'success'
      };
    },
    unlockLevel: 0 // Always available
  },

  tutorial: {
    description: "Start interactive tutorial for new hackers",
    usage: "tutorial",
    execute: (args: string[], gameState: GameState): CommandResult => {
      setTimeout(() => {
        const event = new CustomEvent('startTutorial');
        window.dispatchEvent(event);
      }, 100);

      return {
        success: true,
        output: [
          "▶ TUTORIAL MODE ACTIVATED ▶",
          "",
          "✓ Interactive guidance enabled",
          "✓ Step-by-step instructions ready",
          "✓ Real-time assistance available",
          "",
          "⚡ Learn hacking fundamentals!",
          "",
          "Follow the tutorial panel on the right →"
        ]
      };
    },
    unlockLevel: 0
  },

  settings: {
    description: "Customize terminal appearance and behavior",
    usage: "settings",
    execute: (args: string[], gameState: GameState): CommandResult => {
      setTimeout(() => {
        const event = new CustomEvent('openSettings');
        window.dispatchEvent(event);
      }, 100);

      return {
        success: true,
        output: [
          "▶ TERMINAL SETTINGS ACCESSED ▶",
          "",
          "✓ Color schemes available",
          "✓ Typography options loaded",
          "✓ Effects and audio settings ready",
          "",
          "⚡ Personalize your experience!",
          "",
          "Customize colors, fonts, and effects"
        ]
      };
    },
    unlockLevel: 0
  },

  // New branching mission commands
  recon: {
    description: "Perform reconnaissance on target",
    usage: "recon [--employees|--network|--security]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const target = args.includes('--employees') ? 'employees' : 
                    args.includes('--network') ? 'network' :
                    args.includes('--security') ? 'security' : 'general';
      
      const reconResults = {
        employees: [
          '▶ EMPLOYEE RECONNAISSANCE ▶',
          '',
          '┌─ TARGET PROFILES ─┐',
          '│ CEO: John Smith        │',
          '│ Email: ceo@megacorp.com│',
          '│ Weakness: Social media │',
          '│                        │',
          '│ IT Admin: Sarah Jones  │',
          '│ Email: admin@mega.com  │',
          '│ Weakness: Phishing     │',
          '└────────────────────────┘',
          '',
          '✓ Employee profiles compiled',
          '✓ Social engineering vectors identified'
        ],
        network: [
          '▶ NETWORK RECONNAISSANCE ▶',
          '',
          '┌─ NETWORK TOPOLOGY ─┐',
          '│ Firewall: Cisco ASA    │',
          '│ Switches: 24 ports     │',
          '│ WiFi: WPA3 Enterprise  │',
          '│ VPN: OpenVPN 2.4       │',
          '│                        │',
          '│ Vulnerabilities:       │',
          '│ • Outdated firmware    │',
          '│ • Weak VPN config      │',
          '└────────────────────────┘',
          '',
          '✓ Network topology mapped',
          '✓ Attack vectors identified'
        ],
        security: [
          '▶ SECURITY ASSESSMENT ▶',
          '',
          '┌─ SECURITY POSTURE ─┐',
          '│ IDS/IPS: Snort 3.0     │',
          '│ Antivirus: CrowdStrike │',
          '│ Monitoring: Splunk     │',
          '│ Response Time: 15min   │',
          '│                        │',
          '│ Weaknesses:            │',
          '│ • Limited night staff  │',
          '│ • Delayed log analysis │',
          '└────────────────────────┘',
          '',
          '✓ Security measures catalogued',
          '✓ Evasion strategies developed'
        ],
        general: [
          '▶ GENERAL RECONNAISSANCE ▶',
          '',
          '┌─ TARGET OVERVIEW ─┐',
          '│ Company: MegaCorp Inc  │',
          '│ Employees: 2,500       │',
          '│ Revenue: $2.1B         │',
          '│ Security Budget: High  │',
          '│                        │',
          '│ Key Assets:            │',
          '│ • Customer database    │',
          '│ • Financial records    │',
          '│ • Trade secrets        │',
          '└────────────────────────┘',
          '',
          '✓ Target assessment complete',
          '✓ High-value assets identified'
        ]
      };

      // Only award credits if this command is completing a mission step
      const shouldAwardCredits = shouldAwardCommandCredits('recon', args, true, gameState);
      const updateGameState = shouldAwardCredits ? {
        credits: gameState.credits + 100
      } : undefined;

      return {
        output: reconResults[target as keyof typeof reconResults],
        success: true,
        updateGameState,
        soundEffect: 'success'
      };
    },
    unlockLevel: 2
  },

  phish: {
    description: "Execute phishing attack against target",
    usage: "phish --target <email>",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const targetIndex = args.indexOf('--target');
      if (targetIndex === -1 || !args[targetIndex + 1]) {
        return {
          output: ['Usage: phish --target <email>'],
          success: false
        };
      }

      const target = args[targetIndex + 1];
      const success = Math.random() > 0.3; // 70% success rate

      if (success) {
        // Only award credits if this command is completing a mission step
        const shouldAwardCredits = shouldAwardCommandCredits('phish', args, true, gameState);
        const updateGameState = shouldAwardCredits ? {
          credits: gameState.credits + 300,
          suspicionLevel: gameState.suspicionLevel + 10
        } : {
          suspicionLevel: gameState.suspicionLevel + 10
        };

        return {
          output: [
            `▶ PHISHING ATTACK: ${target} ▶`,
            '',
            '▶ Crafting convincing email...',
            '▶ Spoofing sender identity...',
            '▶ Deploying social engineering...',
            '',
            '✓ Target clicked malicious link!',
            '✓ Credentials harvested successfully',
            '✓ Session tokens captured',
            '',
            `Username: ${target.split('@')[0]}`,
            `Password: ********** (captured)`,
            `2FA Token: 847291`,
            '',
            shouldAwardCredits ? '+300 credits earned' : 'Phishing attack successful'
          ],
          success: true,
          updateGameState,
          soundEffect: 'success'
        };
      } else {
        return {
          output: [
            `▶ PHISHING ATTACK: ${target} ▶`,
            '',
            '▶ Email sent successfully...',
            '▶ Waiting for target response...',
            '',
            '✗ Target did not take the bait',
            '✗ Email marked as suspicious',
            '⚠ Security team may be alerted',
            '',
            'Try a different approach or target.'
          ],
          success: false,
          updateGameState: {
            suspicionLevel: gameState.suspicionLevel + 20
          },
          soundEffect: 'error'
        };
      }
    },
    unlockLevel: 3
  },

  // Mini-game commands
  minigame: {
    description: "Start or interact with real-time mini-games",
    usage: "minigame <action> [game_type] [difficulty] [input]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const action = args[0];
      
      if (!action) {
        const availableGames = realTimeMiniGameSystem.getAvailableGames();
        const activeGame = realTimeMiniGameSystem.getActiveGame();
        
        return {
          output: [
            '▶ REAL-TIME MINI-GAMES ▶',
            '',
            activeGame ? `Active Game: ${realTimeMiniGameSystem.getGameStatus()}` : 'No active game',
            '',
            '┌─ AVAILABLE GAMES ─┐',
            '│ pattern_crack     - Crack encryption patterns        │',
            '│ signal_trace      - Navigate network grids           │',
            '│ binary_tree       - Navigate binary tree structures  │',
            '│ memory_sequence   - Memorize and repeat sequences    │',
            '│ typing_challenge  - Fast and accurate code typing    │',
            '│ code_injection    - Find and exploit vulnerabilities │',
            '└─────────────────────────────────────────────────────┘',
            '',
            '┌─ COMMANDS ─┐',
            '│ minigame start <game_type> [difficulty]  │',
            '│ minigame input <your_input>              │',
            '│ minigame status                          │',
            '│ minigame cancel                          │',
            '│ minigame history                         │',
            '└─────────────────────────────────────────┘',
            '',
            'Difficulties: EASY, MEDIUM, HARD, EXPERT'
          ],
          success: true
        };
      }

      switch (action.toLowerCase()) {
        case 'start': {
          const gameType = args[1];
          const difficulty = args[2] || 'MEDIUM';
          
          if (!gameType) {
            return {
              output: [
                'Usage: minigame start <game_type> [difficulty]',
                'Available games: pattern_crack, signal_trace, binary_tree, memory_sequence, typing_challenge, code_injection'
              ],
              success: false
            };
          }

          const game = realTimeMiniGameSystem.startGame(gameType, difficulty);
          
          if (!game) {
            const activeGame = realTimeMiniGameSystem.getActiveGame();
            if (activeGame) {
              return {
                output: [
                  'A mini-game is already active!',
                  `Current game: ${realTimeMiniGameSystem.getGameStatus()}`,
                  'Use "minigame cancel" to stop the current game'
                ],
                success: false
              };
            } else {
              return {
                output: [
                  `Invalid game type: ${gameType}`,
                  'Available games: pattern_crack, signal_trace, binary_tree, memory_sequence, typing_challenge, code_injection'
                ],
                success: false
              };
            }
          }

          let initialMessage = '';
          switch (game.type) {
            case 'pattern_crack':
              const patternData = game.gameData;
              initialMessage = `Pattern ${patternData.currentPattern + 1}/${patternData.totalPatterns}: ${patternData.patterns[patternData.currentPattern]}`;
              break;
            case 'signal_trace':
              const signalData = game.gameData;
              initialMessage = `Navigate from (0,0) to (${signalData.targetPos.x},${signalData.targetPos.y}). Use: up/down/left/right or w/a/s/d`;
              break;
            case 'binary_tree':
              const treeData = game.gameData;
              const rootNode = treeData.nodes[treeData.currentNode];
              initialMessage = `Find target: ${treeData.nodes[treeData.targetNode].value}. Current: ${rootNode.value} | Left: ${rootNode.left ? treeData.nodes[rootNode.left].value : 'none'} | Right: ${rootNode.right ? treeData.nodes[rootNode.right].value : 'none'}`;
              break;
            case 'memory_sequence':
              const memoryData = game.gameData;
              initialMessage = `Memorize this sequence: ${memoryData.sequence.join(' ')}. Then use "minigame input <symbol>" to repeat it.`;
              break;
            case 'typing_challenge':
              const typingData = game.gameData;
              initialMessage = `Type this code exactly:\n${typingData.text}`;
              break;
            case 'code_injection':
              const codeData = game.gameData;
              initialMessage = `Find vulnerabilities in the code:\n${codeData.targetCode}\nUse: "minigame input exploit <vulnerability>" or "minigame input scan"`;
              break;
          }

          return {
            output: [
              `▶ ${game.name.toUpperCase()} STARTED ▶`,
              `Difficulty: ${game.difficulty} | Time Limit: ${game.timeLimit}s`,
              '',
              game.description,
              '',
              initialMessage,
              '',
              'Use "minigame input <your_input>" to play',
              'Use "minigame status" to check progress',
              'Use "minigame cancel" to quit'
            ],
            success: true
          };
        }

        case 'input': {
          const input = args.slice(1).join(' ');
          
          if (!input) {
            return {
              output: ['Usage: minigame input <your_input>'],
              success: false
            };
          }

          // Check for timeout
          if (realTimeMiniGameSystem.checkTimeout()) {
            return {
              output: [
                '⏰ Time limit exceeded!',
                'Mini-game automatically cancelled.'
              ],
              success: false
            };
          }

          const result = realTimeMiniGameSystem.processInput(input);
          
          if (result.completed) {
            const creditReward = result.message.match(/(\d+) credits/)?.[1];
            const credits = creditReward ? parseInt(creditReward) : 0;
            
            return {
              output: [
                '▶ MINI-GAME COMPLETED ▶',
                '',
                result.message
              ],
              success: result.success,
              updateGameState: credits > 0 ? {
                credits: gameState.credits + credits
              } : undefined
            };
          }

          return {
            output: [result.message],
            success: result.success
          };
        }

        case 'status': {
          const activeGame = realTimeMiniGameSystem.getActiveGame();
          
          if (!activeGame) {
            return {
              output: ['No active mini-game.'],
              success: false
            };
          }

          const timeElapsed = Math.floor((Date.now() - activeGame.startTime) / 1000);
          const timeRemaining = Math.max(0, activeGame.timeLimit - timeElapsed);

          let gameSpecificInfo = '';
          switch (activeGame.type) {
            case 'pattern_crack':
              const patternData = activeGame.gameData;
              gameSpecificInfo = `Progress: ${patternData.correctSequences}/${patternData.totalPatterns} | Mistakes: ${patternData.mistakes}/${patternData.maxMistakes}`;
              break;
            case 'signal_trace':
              const signalData = activeGame.gameData;
              gameSpecificInfo = `Position: (${signalData.playerPos.x},${signalData.playerPos.y}) | Signal: ${signalData.signalStrength}% | Moves: ${signalData.movesUsed}/${signalData.maxMoves}`;
              break;
            case 'binary_tree':
              const treeData = activeGame.gameData;
              gameSpecificInfo = `Current: ${treeData.nodes[treeData.currentNode].value} | Target: ${treeData.nodes[treeData.targetNode].value} | Path length: ${treeData.path.length}`;
              break;
            case 'memory_sequence':
              const memoryData = activeGame.gameData;
              gameSpecificInfo = `Progress: ${memoryData.currentIndex}/${memoryData.sequenceLength}`;
              break;
            case 'typing_challenge':
              const typingData = activeGame.gameData;
              gameSpecificInfo = `Progress: ${typingData.userInput.length}/${typingData.text.length} | WPM: ${typingData.wpm} | Accuracy: ${typingData.accuracy}%`;
              break;
            case 'code_injection':
              const codeData = activeGame.gameData;
              gameSpecificInfo = `Exploits found: ${codeData.exploitsFound.length}/${codeData.vulnerabilities.length}`;
              break;
          }

          return {
            output: [
              `▶ ${activeGame.name.toUpperCase()} STATUS ▶`,
              '',
              `Difficulty: ${activeGame.difficulty}`,
              `Time remaining: ${timeRemaining}s`,
              gameSpecificInfo,
              '',
              'Use "minigame input <your_input>" to continue'
            ],
            success: true
          };
        }

        case 'cancel': {
          const activeGame = realTimeMiniGameSystem.getActiveGame();
          
          if (!activeGame) {
            return {
              output: ['No active mini-game to cancel.'],
              success: false
            };
          }

          realTimeMiniGameSystem.cancelGame();
          
          return {
            output: [
              `${activeGame.name} cancelled.`,
              'You can start a new mini-game anytime.'
            ],
            success: true
          };
        }

        case 'history': {
          const history = realTimeMiniGameSystem.getGameHistory();
          
          if (history.length === 0) {
            return {
              output: [
                '▶ MINI-GAME HISTORY ▶',
                '',
                'No games played yet.',
                'Start your first mini-game with "minigame start <game_type>"'
              ],
              success: true
            };
          }

          const output = [
            '▶ MINI-GAME HISTORY ▶',
            `Total games played: ${history.length}`,
            ''
          ];

          const recentGames = history.slice(-10).reverse();
          recentGames.forEach((game, index) => {
            const timeElapsed = Math.floor(game.timeElapsed / 1000);
            const successIcon = game.success ? '✅' : '❌';
            
            output.push(
              `${index + 1}. ${successIcon} ${game.gameId.split('_')[0]} | ${timeElapsed}s | ${game.score} credits`
            );
          });

          const totalScore = history.reduce((sum, game) => sum + game.score, 0);
          const successRate = Math.round((history.filter(g => g.success).length / history.length) * 100);

          output.push(
            '',
            '─────────────────────────────────────',
            `Total credits earned: ${totalScore}`,
            `Success rate: ${successRate}%`
          );

          return {
            output,
            success: true
          };
        }

        default:
          return {
            output: [
              'Invalid action. Available actions:',
              '• start <game_type> [difficulty] - Start a new mini-game',
              '• input <your_input> - Provide input to active game',
              '• status - Check current game status',
              '• cancel - Cancel active game',
              '• history - View game history'
            ],
            success: false
          };
      }
    },
    unlockLevel: 1
  },

  // Pattern cracking command (quick access)
  crack_pattern: {
    description: "Quick access to pattern cracking mini-game",
    usage: "crack_pattern [easy|hard]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const difficulty = args[0] === 'hard' ? 'hard' : 'easy';
      const gameId = `pattern_crack_${difficulty}`;
      
      // Delegate to minigame command
      return commands.minigame.execute([gameId], gameState);
    },
    unlockLevel: 1
  },

  // Signal tracing command (quick access)
  trace_signal: {
    description: "Quick access to signal tracing mini-game",
    usage: "trace_signal [easy|expert]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const difficulty = args[0] === 'expert' ? 'expert' : 'easy';
      const gameId = `signal_trace_${difficulty}`;
      
      // Delegate to minigame command
      return commands.minigame.execute([gameId], gameState);
    },
    unlockLevel: 2
  },

  // Binary tree command (quick access)
  navigate_tree: {
    description: "Quick access to binary tree navigation mini-game",
    usage: "navigate_tree [medium|expert]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const difficulty = args[0] === 'expert' ? 'expert' : 'medium';
      const gameId = `binary_tree_${difficulty}`;
      
      // Delegate to minigame command
      return commands.minigame.execute([gameId], gameState);
    },
    unlockLevel: 3
  },

  // Mini-game input handling
  mg_input: {
    description: "Send input to active mini-game",
    usage: "mg_input <input>",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const miniGameState = gameState.miniGameState;
      if (!miniGameState?.isActive || !miniGameState.currentGame) {
        return {
          output: ['No active mini-game'],
          success: false
        };
      }

      const input = args.join(' ');
      const { updatePatternCrack } = require('./miniGames');
      
      if (miniGameState.currentGame.type === 'pattern_crack') {
        const result = updatePatternCrack(miniGameState.gameData, input);
        
        if (result.completed) {
          return {
            output: [
              '🎉 PATTERN CRACKING COMPLETE! 🎉',
              '',
              `Score: ${result.score}`,
              `Reward: +${miniGameState.currentGame.reward.credits}₵`,
              ''
            ],
            success: true,
            updateGameState: {
              credits: gameState.credits + miniGameState.currentGame.reward.credits,
              miniGameState: {
                ...miniGameState,
                completed: true,
                success: true,
                score: result.score
              }
            },
            soundEffect: 'success'
          };
        }

        return {
          output: result.success ? ['✓ Correct sequence!'] : ['✗ Wrong pattern, try again'],
          success: result.success
        };
      }

      return {
        output: ['Mini-game does not accept text input'],
        success: false
      };
    },
    unlockLevel: 1
  },

  // Mini-game movement (for signal tracing)
  mg_move: {
    description: "Move in active mini-game",
    usage: "mg_move <up|down|left|right>",
    execute: (args: string[], gameState: GameState): CommandResult => {
      if (!gameState.miniGameState?.isActive || !gameState.miniGameState.currentGame) {
        return {
          output: ['No active mini-game'],
          success: false
        };
      }

      const direction = args[0] as 'up' | 'down' | 'left' | 'right';
      if (!['up', 'down', 'left', 'right'].includes(direction)) {
        return {
          output: ['Usage: mg_move <up|down|left|right>'],
          success: false
        };
      }

      const { movePlayerInSignalTrace } = require('./miniGames');
      
      if (gameState.miniGameState.currentGame.type === 'signal_trace') {
        const result = movePlayerInSignalTrace(gameState.miniGameState.gameData, direction);
        
        if (result.completed) {
          return {
            output: [
              '🎉 SIGNAL TRACED SUCCESSFULLY! 🎉',
              '',
              `Score: ${result.score}`,
              `Moves Used: ${gameState.miniGameState.gameData.movesUsed}`,
              `Reward: +${gameState.miniGameState.currentGame.reward.credits}₵`,
              ''
            ],
            success: true,
            updateGameState: {
              credits: gameState.credits + gameState.miniGameState.currentGame.reward.credits,
              miniGameState: {
                ...gameState.miniGameState!,
                completed: true,
                success: true,
                score: result.score
              }
            },
            soundEffect: 'success'
          };
        }

        return {
          output: result.success ? [`Moved ${direction}`] : ['Cannot move in that direction'],
          success: result.success
        };
      }

      return {
        output: ['Current mini-game does not support movement'],
        success: false
      };
    },
    unlockLevel: 1
  },

  // Mini-game navigation (for binary tree)
  mg_nav: {
    description: "Navigate in binary tree mini-game",
    usage: "mg_nav <left|right>",
    execute: (args: string[], gameState: GameState): CommandResult => {
      if (!gameState.miniGameState?.isActive || !gameState.miniGameState.currentGame) {
        return {
          output: ['No active mini-game'],
          success: false
        };
      }

      const direction = args[0] as 'left' | 'right';
      if (!['left', 'right'].includes(direction)) {
        return {
          output: ['Usage: mg_nav <left|right>'],
          success: false
        };
      }

      const { navigateBinaryTree } = require('./miniGames');
      
      if (gameState.miniGameState.currentGame.type === 'binary_tree') {
        const result = navigateBinaryTree(gameState.miniGameState.gameData, direction);
        
        if (result.completed) {
          const isOptimal = gameState.miniGameState.gameData.path.length <= 
                           gameState.miniGameState.gameData.correctPath.length;
          
          return {
            output: [
              '🎉 TARGET NODE FOUND! 🎉',
              '',
              `Score: ${result.score}`,
              `Path Length: ${gameState.miniGameState.gameData.path.length}`,
              `Optimal: ${isOptimal ? 'YES' : 'NO'}`,
              `Reward: +${gameState.miniGameState.currentGame.reward.credits}₵`,
              ''
            ],
            success: true,
            updateGameState: {
              credits: gameState.credits + gameState.miniGameState.currentGame.reward.credits,
              miniGameState: {
                ...gameState.miniGameState!,
                completed: true,
                success: true,
                score: result.score
              }
            },
            soundEffect: 'success'
          };
        }

        const currentNode = gameState.miniGameState?.gameData.nodes.find(
          (n: any) => n.id === gameState.miniGameState?.gameData.currentNode
        );

        return {
          output: [
            `Navigated ${direction}`,
            `Current Node: ${currentNode?.value || 'Unknown'}`,
            `Depth: ${currentNode?.depth || 0}`,
            `Target: ${gameState.miniGameState.gameData.targetNode}`
          ],
          success: result.success
        };
      }

      return {
        output: ['Current mini-game does not support navigation'],
        success: false
      };
    },
    unlockLevel: 1
  },

  // Faction System Commands
  faction: {
    description: "Manage faction relationships and view standings",
    usage: "faction [list|join <faction>|leave|status|missions]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const subcommand = args[0] || 'status';
      
      // Initialize faction standings if not present
      if (!gameState.factionStandings) {
        gameState.factionStandings = initializeFactionStandings();
      }
      
      switch (subcommand) {
        case 'list':
          return {
            output: [
              '▶ AVAILABLE FACTIONS ▶',
              '',
              '┌─ FACTION OVERVIEW ─┐',
              ...Object.values(factions).map(faction => [
                `│ ${faction.icon} ${faction.name.padEnd(20)} │`,
                `│   ${faction.description.substring(0, 35).padEnd(35)} │`,
                `│   Philosophy: ${faction.philosophy.substring(0, 25).padEnd(25)} │`,
                `│   Specialization: ${faction.specialization.type.padEnd(15)} │`,
                `│   Requirements: ${faction.requirements[0]?.description.substring(0, 20) || 'None'.padEnd(20)} │`,
                '│                                     │'
              ]).flat(),
              '└─────────────────────────────────────┘',
              '',
              'Use "faction join <faction_id>" to join a faction',
              'Available IDs: serpent_syndicate, crimson_circuit, mirage_loop'
            ],
            success: true
          };
          
        case 'join':
          const factionId = args[1];
          if (!factionId) {
            return {
              output: ['Usage: faction join <faction_id>'],
              success: false
            };
          }
          
          const faction = factions[factionId];
          if (!faction) {
            return {
              output: [`Unknown faction: ${factionId}`],
              success: false
            };
          }
          
          const joinCheck = canJoinFaction(factionId, gameState);
          if (!joinCheck.canJoin) {
            return {
              output: [
                `▶ FACTION JOIN DENIED ▶`,
                '',
                `✗ Cannot join ${faction.name}`,
                `✗ Reason: ${joinCheck.reason}`,
                '',
                'Complete the requirements and try again.'
              ],
              success: false,
              soundEffect: 'error'
            };
          }
          
          // Leave current faction if any
          if (gameState.activeFaction) {
            gameState.factionStandings[gameState.activeFaction].isActive = false;
          }
          
          // Join new faction
          const standing = gameState.factionStandings[factionId];
          standing.isActive = true;
          standing.joinedDate = Date.now();
          
          return {
            output: [
              `▶ FACTION JOINED: ${faction.name} ▶`,
              '',
              `✓ Welcome to ${faction.name}!`,
              `✓ Rank: ${standing.rank.title}`,
              `✓ Reputation: ${standing.reputation}`,
              '',
              `Philosophy: "${faction.philosophy}"`,
              '',
              '┌─ FACTION BENEFITS ─┐',
              ...faction.benefits.map(benefit => 
                `│ • ${benefit.description.substring(0, 30).padEnd(30)} │`
              ),
              '└────────────────────┘',
              '',
              'Use "faction missions" to see available missions',
              'Use "faction status" to view your standing'
            ],
            success: true,
            updateGameState: {
              activeFaction: factionId,
              factionStandings: gameState.factionStandings,
              unlockedCommands: [...gameState.unlockedCommands, ...faction.exclusiveCommands]
            },
            soundEffect: 'success'
          };
          
        case 'leave':
          if (!gameState.activeFaction) {
            return {
              output: ['You are not currently in any faction'],
              success: false
            };
          }
          
          const currentFaction = factions[gameState.activeFaction];
          const currentStanding = gameState.factionStandings[gameState.activeFaction];
          
          if (!currentStanding.canLeave) {
            return {
              output: [
                '▶ FACTION LEAVE DENIED ▶',
                '',
                '✗ Cannot leave faction at this time',
                '✗ You may be involved in critical operations',
                '',
                'Complete your current obligations first.'
              ],
              success: false,
              soundEffect: 'error'
            };
          }
          
          // Remove faction commands
          const updatedCommands = gameState.unlockedCommands.filter(cmd => 
            !currentFaction.exclusiveCommands.includes(cmd)
          );
          
          return {
            output: [
              `▶ LEFT FACTION: ${currentFaction.name} ▶`,
              '',
              `✓ You have left ${currentFaction.name}`,
              `✓ Reputation preserved: ${currentStanding.reputation}`,
              '✓ Exclusive commands removed',
              '',
              '⚠ You can rejoin later if requirements are met',
              '⚠ Some faction-specific progress may be lost'
            ],
            success: true,
            updateGameState: {
              activeFaction: undefined,
              factionStandings: {
                ...gameState.factionStandings,
                [gameState.activeFaction]: {
                  ...currentStanding,
                  isActive: false
                }
              },
              unlockedCommands: updatedCommands
            },
            soundEffect: 'success'
          };
          
        case 'missions':
          if (!gameState.activeFaction) {
            return {
              output: [
                'No active faction membership',
                'Join a faction to access exclusive missions'
              ],
              success: false
            };
          }
          
          const availableMissions = getAvailableFactionMissions(gameState.activeFaction, gameState);
          
          if (availableMissions.length === 0) {
            return {
              output: [
                '▶ FACTION MISSIONS ▶',
                '',
                '✗ No missions available at your current rank',
                '✗ Increase your reputation to unlock more missions',
                '',
                'Complete regular missions or faction activities to gain reputation'
              ],
              success: true
            };
          }
          
          return {
            output: [
              `▶ ${factions[gameState.activeFaction].name} MISSIONS ▶`,
              '',
              '┌─ AVAILABLE MISSIONS ─┐',
              ...availableMissions.map(mission => [
                `│ ${mission.title.substring(0, 25).padEnd(25)} │`,
                `│   Difficulty: ${mission.difficulty.padEnd(10)} │`,
                `│   Reputation: +${mission.reputationReward.toString().padEnd(8)} │`,
                `│   Credits: +${mission.creditReward.toString().padEnd(11)} │`,
                `│   ${mission.description.substring(0, 30).padEnd(30)} │`,
                '│                               │'
              ]).flat(),
              '└───────────────────────────────┘',
              '',
              'Use "faction_mission <mission_id>" to start a mission'
            ],
            success: true
          };
          
        case 'status':
        default:
          if (!gameState.activeFaction) {
            return {
              output: [
                '▶ FACTION STATUS ▶',
                '',
                '✗ No active faction membership',
                '',
                'Available factions:',
                ...Object.values(factions).map(f => `• ${f.name} - ${f.description}`),
                '',
                'Use "faction list" for detailed information',
                'Use "faction join <faction_id>" to join'
              ],
              success: true
            };
          }
          
          const activeFaction = factions[gameState.activeFaction];
          const activeStanding = gameState.factionStandings[gameState.activeFaction];
          const currentRank = getPlayerFactionRank(gameState.activeFaction, activeStanding.reputation);
          const nextRank = factionRanks[gameState.activeFaction].find(rank => 
            rank.requiredReputation > activeStanding.reputation
          );
          
          return {
            output: [
              `▶ ${activeFaction.name} STATUS ▶`,
              '',
              '┌─ FACTION STANDING ─┐',
              `│ Rank: ${currentRank.title.padEnd(15)} │`,
              `│ Reputation: ${activeStanding.reputation.toString().padEnd(10)} │`,
              `│ Missions: ${activeStanding.missionsCompleted.toString().padEnd(12)} │`,
              `│ Credits Earned: ${activeStanding.creditsEarned.toString().padEnd(10)} │`,
              '└────────────────────┘',
              '',
              nextRank ? [
                '┌─ NEXT RANK ─┐',
                `│ ${nextRank.title.padEnd(12)} │`,
                `│ Required: ${nextRank.requiredReputation.toString().padEnd(7)} │`,
                `│ Progress: ${Math.floor((activeStanding.reputation / nextRank.requiredReputation) * 100)}%     │`,
                '└─────────────┘'
              ].join('\n') : '🏆 Maximum rank achieved!',
              '',
              '┌─ ACHIEVEMENTS ─┐',
              ...activeStanding.specialAchievements.map(achievement => 
                `│ 🏅 ${achievement.substring(0, 20).padEnd(20)} │`
              ),
              activeStanding.specialAchievements.length === 0 ? '│ No achievements yet    │' : '',
              '└───────────────────────┘'
            ],
            success: true
          };
      }
    },
    unlockLevel: 2
  },

  faction_mission: {
    description: "Start or manage faction-specific missions",
    usage: "faction_mission <mission_id>",
    execute: (args: string[], gameState: GameState): CommandResult => {
      if (!gameState.activeFaction) {
        return {
          output: ['No active faction membership required'],
          success: false
        };
      }
      
      const missionId = args[0];
      if (!missionId) {
        return {
          output: ['Usage: faction_mission <mission_id>'],
          success: false
        };
      }
      
      const availableMissions = getAvailableFactionMissions(gameState.activeFaction, gameState);
      const mission = availableMissions.find(m => m.id === missionId);
      
      if (!mission) {
        return {
          output: [
            `Mission '${missionId}' not found or not available`,
            'Use "faction missions" to see available missions'
          ],
          success: false
        };
      }
      
      // Start the mission
      const factionBonus = calculateFactionBonus(gameState.activeFaction, 'faction_mission', gameState);
      const bonusCredits = Math.floor(mission.creditReward * factionBonus.creditMultiplier);
      
      return {
        output: [
          `▶ FACTION MISSION STARTED ▶`,
          '',
          `Mission: ${mission.title}`,
          `Difficulty: ${mission.difficulty}`,
          `Description: ${mission.description}`,
          '',
          '┌─ MISSION OBJECTIVES ─┐',
          '│ • Infiltrate target system     │',
          '│ • Extract required data         │',
          '│ • Maintain faction protocols   │',
          '│ • Report back to command       │',
          '└────────────────────────────────┘',
          '',
          `Base Reward: ${mission.creditReward}₵`,
          `Faction Bonus: ${bonusCredits}₵`,
          `Reputation: +${mission.reputationReward}`,
          '',
          '⚡ Mission in progress...',
          '⚡ Complete objectives to finish mission'
        ],
        success: true,
        updateGameState: {
          credits: gameState.credits + bonusCredits,
          factionStandings: {
            ...gameState.factionStandings,
            [gameState.activeFaction]: {
              ...gameState.factionStandings[gameState.activeFaction],
              reputation: gameState.factionStandings[gameState.activeFaction].reputation + mission.reputationReward,
              missionsCompleted: gameState.factionStandings[gameState.activeFaction].missionsCompleted + 1,
              creditsEarned: gameState.factionStandings[gameState.activeFaction].creditsEarned + bonusCredits
            }
          },
          completedFactionMissions: [...gameState.completedFactionMissions, mission.id],
          factionMissionCooldowns: {
            ...gameState.factionMissionCooldowns,
            [mission.id]: Date.now()
          }
        },
        soundEffect: 'success'
      };
    },
    unlockLevel: 2
  },

  // Faction-exclusive commands (Serpent Syndicate)
  ghost_mode: {
    description: "Enter stealth mode for undetected operations",
    usage: "ghost_mode [duration]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      if (gameState.activeFaction !== 'serpent_syndicate') {
        return {
          output: ['Access denied: Serpent Syndicate exclusive'],
          success: false,
          soundEffect: 'error'
        };
      }
      
      const duration = parseInt(args[0]) || 300; // 5 minutes default
      
      return {
        output: [
          '▶ GHOST MODE ACTIVATED ▶',
          '',
          '🐍 Serpent Syndicate Protocol Engaged',
          '✓ Digital footprint minimized',
          '✓ Detection algorithms bypassed',
          '✓ Shadow network access enabled',
          '',
          `Duration: ${duration} seconds`,
          'All operations will have reduced detection risk',
          '',
          '⚠ Maintain operational silence'
        ],
        success: true,
        updateGameState: {
          suspicionLevel: Math.max(0, gameState.suspicionLevel - 50)
        },
        soundEffect: 'success'
      };
    },
    unlockLevel: 999 // Faction exclusive
  },

  // Faction-exclusive commands (Crimson Circuit)
  overload_system: {
    description: "Overload target systems with massive data surge",
    usage: "overload_system <target>",
    execute: (args: string[], gameState: GameState): CommandResult => {
      if (gameState.activeFaction !== 'crimson_circuit') {
        return {
          output: ['Access denied: Crimson Circuit exclusive'],
          success: false,
          soundEffect: 'error'
        };
      }
      
      const target = args[0] || 'default_target';
      
      return {
        output: [
          '▶ SYSTEM OVERLOAD INITIATED ▶',
          '',
          '🛠️ Crimson Circuit Protocol Engaged',
          `Target: ${target}`,
          '▶ Generating massive data surge...',
          '▶ Overwhelming target defenses...',
          '▶ System resources at 150%...',
          '▶ Critical overload achieved!',
          '',
          '✓ Target system compromised',
          '✓ Maximum damage protocols executed',
          '✓ Infrastructure severely damaged',
          '',
          '⚠ High detection signature generated'
        ],
        success: true,
        updateGameState: {
          credits: gameState.credits + 1000,
          suspicionLevel: gameState.suspicionLevel + 75
        },
        soundEffect: 'success'
      };
    },
    unlockLevel: 999 // Faction exclusive
  },

  // Faction-exclusive commands (Mirage Loop)
  deep_fake: {
    description: "Create convincing digital impersonations",
    usage: "deep_fake <target_identity>",
    execute: (args: string[], gameState: GameState): CommandResult => {
      if (gameState.activeFaction !== 'mirage_loop') {
        return {
          output: ['Access denied: Mirage Loop exclusive'],
          success: false,
          soundEffect: 'error'
        };
      }
      
      const target = args[0] || 'corporate_executive';
      
      return {
        output: [
          '▶ DEEP FAKE GENERATION ▶',
          '',
          '👁 Mirage Loop Protocol Engaged',
          `Target Identity: ${target}`,
          '▶ Analyzing facial patterns...',
          '▶ Synthesizing voice patterns...',
          '▶ Generating behavioral models...',
          '▶ Creating digital twin...',
          '',
          '✓ Deep fake identity created',
          '✓ Biometric spoofing enabled',
          '✓ Social engineering vectors prepared',
          '',
          'Identity can be used for infiltration missions',
          '⚠ Use responsibly - reality distortion active'
        ],
        success: true,
        updateGameState: {
          credits: gameState.credits + 750,
          inventory: {
            ...gameState.inventory,
            intel: [...gameState.inventory.intel, `deep_fake_${target}`]
          }
        },
        soundEffect: 'success'
      };
    },
    unlockLevel: 999 // Faction exclusive
  },

  // Faction reputation management
  rep: {
    description: "View detailed reputation standings with all factions",
    usage: "rep [faction_id]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      if (!gameState.factionStandings) {
        gameState.factionStandings = initializeFactionStandings();
      }
      
      const targetFaction = args[0];
      
      if (targetFaction) {
        const faction = factions[targetFaction];
        const standing = gameState.factionStandings[targetFaction];
        
        if (!faction || !standing) {
          return {
            output: [`Unknown faction: ${targetFaction}`],
            success: false
          };
        }
        
        const rank = getPlayerFactionRank(targetFaction, standing.reputation);
        const nextRank = factionRanks[targetFaction].find(r => 
          r.requiredReputation > standing.reputation
        );
        
        return {
          output: [
            `▶ ${faction.name} REPUTATION ▶`,
            '',
            '┌─ DETAILED STANDING ─┐',
            `│ Reputation: ${standing.reputation}/${faction.maxReputation}     │`,
            `│ Current Rank: ${rank.title.padEnd(12)} │`,
            `│ Missions: ${standing.missionsCompleted.toString().padEnd(16)} │`,
            `│ Credits Earned: ${standing.creditsEarned.toString().padEnd(10)} │`,
            `│ Member Since: ${standing.joinedDate ? new Date(standing.joinedDate).toLocaleDateString() : 'Never'.padEnd(10)} │`,
            `│ Status: ${standing.isActive ? 'ACTIVE' : 'INACTIVE'.padEnd(12)} │`,
            '└─────────────────────┘',
            '',
            nextRank ? [
              '┌─ NEXT RANK ─┐',
              `│ ${nextRank.title.padEnd(12)} │`,
              `│ Need: ${(nextRank.requiredReputation - standing.reputation).toString().padEnd(7)} │`,
              '└─────────────┘'
            ].join('\n') : '🏆 Maximum rank achieved!',
            '',
            '┌─ ACHIEVEMENTS ─┐',
            ...standing.specialAchievements.map(achievement => 
              `│ 🏅 ${achievement.substring(0, 20).padEnd(20)} │`
            ),
            standing.specialAchievements.length === 0 ? '│ No achievements yet    │' : '',
            '└───────────────────────┘'
          ],
          success: true
        };
      }
      
      // Show all faction standings
      return {
        output: [
          '▶ FACTION REPUTATION OVERVIEW ▶',
          '',
          '┌─ ALL FACTION STANDINGS ─┐',
          ...Object.entries(gameState.factionStandings).map(([factionId, standing]) => {
            const faction = factions[factionId];
            const rank = getPlayerFactionRank(factionId, standing.reputation);
            return [
              `│ ${faction.icon} ${faction.name.substring(0, 18).padEnd(18)} │`,
              `│   Rep: ${standing.reputation.toString().padStart(4)} | ${rank.title.padEnd(12)} │`,
              `│   Status: ${standing.isActive ? 'ACTIVE' : 'INACTIVE'.padEnd(8)} │`,
              '│                              │'
            ];
          }).flat(),
          '└─────────────────────────────┘',
          '',
          gameState.activeFaction ? 
            `Active Faction: ${factions[gameState.activeFaction].name}` :
            'No active faction membership',
          '',
          'Use "rep <faction_id>" for detailed information'
        ],
        success: true
      };
    },
    unlockLevel: 1
  },

  factions: {
    description: "Open faction management interface",
    usage: "factions",
    execute: (args: string[], gameState: GameState): CommandResult => {
      setTimeout(() => {
        const event = new CustomEvent('showFactionInterface');
        window.dispatchEvent(event);
      }, 100);

      return {
        output: [
          '▶ FACTION INTERFACE LOADING ▶',
          '',
          '✓ Accessing faction database...',
          '✓ Loading reputation standings...',
          '✓ Retrieving available missions...',
          '',
          '🏴‍☠️ Faction management interface opened',
          '',
          'Use the interface to:',
          '• View faction standings and reputation',
          '• Join or leave factions',
          '• Access exclusive faction missions',
          '• Manage faction relationships'
        ],
        success: true
      };
    },
    unlockLevel: 1
  },

  // Skill System Commands
  skills: {
    description: "Open skill tree interface",
    usage: "skills",
    execute: (args: string[], gameState: GameState): CommandResult => {
      setTimeout(() => {
        const event = new CustomEvent('showSkillTree');
        window.dispatchEvent(event);
      }, 100);

      const progress = calculateSkillTreeProgress(gameState.skillTree);
      
      return {
        output: [
          '▶ SKILL TREE INTERFACE LOADING ▶',
          '',
          '✓ Accessing neural enhancement protocols...',
          '✓ Loading skill progression data...',
          '✓ Calculating specialization bonuses...',
          '',
          '🧠 Skill tree interface opened',
          '',
          `Progress: ${progress.purchasedSkills}/${progress.totalSkills} skills (${progress.progressPercentage}%)`,
          `Available Points: ${gameState.skillTree.skillPoints}`,
          '',
          'Categories:',
          `• ⚔️ Offensive: ${progress.categoryProgress.offensive.purchased}/${progress.categoryProgress.offensive.total} (${progress.categoryProgress.offensive.percentage}%)`,
          `• 🛡️ Defensive: ${progress.categoryProgress.defensive.purchased}/${progress.categoryProgress.defensive.total} (${progress.categoryProgress.defensive.percentage}%)`,
          `• 🎭 Social: ${progress.categoryProgress.social.purchased}/${progress.categoryProgress.social.total} (${progress.categoryProgress.social.percentage}%)`
        ],
        success: true
      };
    },
    unlockLevel: 0
  },

  skill_buy: {
    description: "Purchase a skill with skill points",
    usage: "skill_buy <skill_id>",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const skillId = args[0];
      if (!skillId) {
        return {
          output: [
            'Usage: skill_buy <skill_id>',
            '',
            'Use "skill_list" to see available skills',
            'Use "skills" to open the visual interface'
          ],
          success: false
        };
      }

      const canPurchase = canPurchaseSkill(skillId, gameState.skillTree);
      if (!canPurchase.canPurchase) {
        return {
          output: [
            `▶ SKILL PURCHASE FAILED ▶`,
            '',
            `✗ Cannot purchase skill: ${skillId}`,
            `✗ Reason: ${canPurchase.reason}`,
            '',
            `Available skill points: ${gameState.skillTree.skillPoints}`
          ],
          success: false,
          soundEffect: 'error'
        };
      }

      const skill = gameState.skillTree.nodes.find(node => node.id === skillId);
      if (!skill) {
        return {
          output: [`Skill '${skillId}' not found`],
          success: false
        };
      }

      const result = purchaseSkill(skillId, gameState.skillTree);
      
      return {
        output: [
          `▶ SKILL ACQUIRED: ${skill.name} ▶`,
          '',
          `✓ Neural pathways enhanced`,
          `✓ Skill level: ${skill.currentLevel + 1}/${skill.maxLevel}`,
          `✓ Category: ${skillCategories[skill.category as keyof typeof skillCategories].name}`,
          `✓ Specialization: ${skill.specialization}`,
          '',
          '┌─ SKILL BONUSES ─┐',
          ...skill.bonuses.map(bonus => 
            `│ • ${bonus.description.substring(0, 30).padEnd(30)} │`
          ),
          '└─────────────────┘',
          '',
          result.unlockedCommands.length > 0 ? [
            '┌─ COMMANDS UNLOCKED ─┐',
            ...result.unlockedCommands.map(cmd => 
              `│ • ${cmd.padEnd(30)} │`
            ),
            '└─────────────────────┘',
            ''
          ].join('\n') : '',
          `Skill points remaining: ${result.skillTree.skillPoints}`,
          '',
          '⚡ New abilities unlocked! Check your enhanced capabilities.'
        ],
        success: true,
        updateGameState: {
          skillTree: result.skillTree,
          unlockedCommands: [...(gameState.unlockedCommands || []), ...result.unlockedCommands]
        },
        soundEffect: 'success'
      };
    },
    unlockLevel: 0
  },

  skill_list: {
    description: "List available skills by category",
    usage: "skill_list [offensive|defensive|social]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const category = args[0] as 'offensive' | 'defensive' | 'social';
      
      if (category && !['offensive', 'defensive', 'social'].includes(category)) {
        return {
          output: ['Invalid category. Use: offensive, defensive, or social'],
          success: false
        };
      }

      if (!category) {
        return {
          output: [
            '▶ SKILL CATEGORIES ▶',
            '',
            '⚔️ OFFENSIVE OPERATIONS',
            '   Aggressive hacking and exploitation',
            '   Use: skill_list offensive',
            '',
            '🛡️ DEFENSIVE SYSTEMS', 
            '   Protection and evasion techniques',
            '   Use: skill_list defensive',
            '',
            '🎭 SOCIAL ENGINEERING',
            '   Human manipulation and psychology',
            '   Use: skill_list social',
            '',
            `Available skill points: ${gameState.skillTree.skillPoints}`,
            'Use "skill_buy <skill_id>" to purchase skills'
          ],
          success: true
        };
      }

      const categorySkills = gameState.skillTree.nodes.filter(skill => skill.category === category);
      const availableSkills = categorySkills.filter(skill => skill.unlocked && !skill.purchased);
      const purchasedSkills = categorySkills.filter(skill => skill.purchased);

      return {
        output: [
          `▶ ${skillCategories[category].name.toUpperCase()} ▶`,
          '',
          '┌─ AVAILABLE SKILLS ─┐',
          ...availableSkills.map(skill => [
            `│ ${skill.id.padEnd(25)} │`,
            `│   ${skill.name.substring(0, 30).padEnd(30)} │`,
            `│   Cost: ${skill.cost.toString().padEnd(2)} | Tier: ${skill.tier} | Max: ${skill.maxLevel}     │`,
            `│   ${skill.description.substring(0, 35).padEnd(35)} │`,
            '│                               │'
          ]).flat(),
          availableSkills.length === 0 ? '│ No skills available          │' : '',
          '└───────────────────────────────┘',
          '',
          '┌─ PURCHASED SKILLS ─┐',
          ...purchasedSkills.map(skill => 
            `│ ✓ ${skill.name.substring(0, 20).padEnd(20)} Lv.${skill.currentLevel} │`
          ),
          purchasedSkills.length === 0 ? '│ No skills purchased yet      │' : '',
          '└─────────────────────────────┘'
        ],
        success: true
      };
    },
    unlockLevel: 0
  },

  skill_info: {
    description: "Get detailed information about a specific skill",
    usage: "skill_info <skill_id>",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const skillId = args[0];
      if (!skillId) {
        return {
          output: ['Usage: skill_info <skill_id>'],
          success: false
        };
      }

      const skill = gameState.skillTree.nodes.find(node => node.id === skillId);
      if (!skill) {
        return {
          output: [`Skill '${skillId}' not found`],
          success: false
        };
      }

      const canPurchase = canPurchaseSkill(skillId, gameState.skillTree);
      const categoryInfo = skillCategories[skill.category as keyof typeof skillCategories];

      return {
        output: [
          `▶ SKILL ANALYSIS: ${skill.name.toUpperCase()} ▶`,
          '',
          `Description: ${skill.description}`,
          `Category: ${categoryInfo.name}`,
          `Specialization: ${skill.specialization}`,
          `Tier: ${skill.tier}/5`,
          `Cost: ${skill.cost} skill points`,
          `Max Level: ${skill.maxLevel}`,
          `Current Level: ${skill.currentLevel}`,
          '',
          '┌─ SKILL BONUSES ─┐',
          ...skill.bonuses.map(bonus => [
            `│ ${bonus.type.replace('_', ' ').toUpperCase()}:`,
            `│   ${bonus.description}`,
            `│   Value: ${bonus.value}${bonus.stackable ? ' (per level)' : ''}`,
            '│'
          ]).flat(),
          '└─────────────────┘',
          '',
          skill.prerequisites.length > 0 ? [
            'Prerequisites:',
            ...skill.prerequisites.map(prereq => `• ${prereq}`)
          ].join('\n') : 'No prerequisites',
          '',
          skill.unlocks.length > 0 ? [
            'Unlocks:',
            ...skill.unlocks.map(unlock => `• ${unlock}`)
          ].join('\n') : 'No unlocks',
          '',
          `Status: ${skill.purchased ? '✓ PURCHASED' : skill.unlocked ? '○ AVAILABLE' : '✗ LOCKED'}`,
          canPurchase.canPurchase ? '✓ Can purchase now' : `✗ ${canPurchase.reason}`
        ],
        success: true
      };
    },
    unlockLevel: 0
  },

  skill_bonuses: {
    description: "View active skill bonuses for current command",
    usage: "skill_bonuses [command_name]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const command = args[0];
      const bonuses = getSkillBonuses(gameState.skillTree, command);
      
      return {
        output: [
          '▶ ACTIVE SKILL BONUSES ▶',
          '',
          command ? `Command: ${command}` : 'General bonuses:',
          '',
          '┌─ CURRENT BONUSES ─┐',
          `│ Success Rate: +${bonuses.successBonus}%        │`,
          `│ Credit Multiplier: ${bonuses.creditMultiplier}x      │`,
          `│ Time Reduction: ${bonuses.timeReduction}%       │`,
          `│ Detection Reduction: ${bonuses.detectionReduction}%  │`,
          `│ Damage Bonus: +${bonuses.damageBonus}%         │`,
          '└───────────────────┘',
          '',
          bonuses.specialAbilities.length > 0 ? [
            '┌─ SPECIAL ABILITIES ─┐',
            ...bonuses.specialAbilities.map(ability => 
              `│ • ${ability.substring(0, 30).padEnd(30)} │`
            ),
            '└─────────────────────┘'
          ].join('\n') : 'No special abilities active',
          '',
          `Total skills purchased: ${gameState.skillTree.nodes.filter(s => s.purchased).length}`
        ],
        success: true
      };
    },
    unlockLevel: 0
  },

  newsfeed: {
    description: "Access the global news feed and world events",
    usage: "newsfeed [category] [limit]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const category = args[0] || 'all';
      const limit = parseInt(args[1]) || 10;

      const validCategories = ['all', 'corporate', 'government', 'underground', 'technology', 'security', 'faction'];
      
      if (!validCategories.includes(category)) {
        return {
          output: [
            'Invalid category. Available categories:',
            '• all - All news stories',
            '• corporate - Corporate news and business',
            '• government - Government and policy news',
            '• underground - Hacker and activist news',
            '• technology - Technology breakthroughs',
            '• security - Cybersecurity incidents',
            '• faction - Faction-related news'
          ],
          success: false
        };
      }

      const articles = newsFeedSystem.getNewsFeed(gameState, category === 'all' ? undefined : category, limit);
      
      if (articles.length === 0) {
        return {
          output: [
            '▶ GLOBAL NEWS FEED ▶',
            '',
            'No news articles available.',
            'Check back later for updates.'
          ],
          success: true
        };
      }

      const output = [
        '▶ GLOBAL NEWS FEED ▶',
        `Category: ${category.toUpperCase()} | Showing ${articles.length} articles`,
        ''
      ];

      articles.forEach((article, index) => {
        const timeAgo = Math.floor((Date.now() - article.timestamp) / (1000 * 60));
        const priorityIcon = {
          'breaking': '🚨',
          'high': '🔴',
          'medium': '🟡',
          'low': '🟢'
        }[article.priority];

        output.push(
          `${index + 1}. ${priorityIcon} ${article.headline}`,
          `   Source: ${article.source} | ${timeAgo}m ago`,
          `   Category: ${article.category.toUpperCase()}`,
          ''
        );

        // Show content for first 3 articles or if specifically requested
        if (index < 3) {
          const contentLines = article.content.split('\n');
          const preview = contentLines[0].substring(0, 80) + (contentLines[0].length > 80 ? '...' : '');
          output.push(`   ${preview}`, '');
        }
      });

      output.push(
        '─────────────────────────────────────',
        'Use "newsfeed <category>" to filter news',
        'Categories: corporate, government, underground, technology, security, faction'
      );

      return {
        output,
        success: true
      };
    },
    unlockLevel: 0
  },

  news: {
    description: "Read a specific news article in detail",
    usage: "news <article_number>",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const articleNum = parseInt(args[0]);
      
      if (!articleNum || articleNum < 1) {
        return {
          output: [
            'Usage: news <article_number>',
            'Use "newsfeed" to see available articles'
          ],
          success: false
        };
      }

      const articles = newsFeedSystem.getNewsFeed(gameState, undefined, 20);
      const article = articles[articleNum - 1];

      if (!article) {
        return {
          output: [
            `Article ${articleNum} not found.`,
            `Available articles: 1-${articles.length}`
          ],
          success: false
        };
      }

      const timeAgo = Math.floor((Date.now() - article.timestamp) / (1000 * 60));
      const priorityIcon = {
        'breaking': '🚨 BREAKING',
        'high': '🔴 HIGH PRIORITY',
        'medium': '🟡 MEDIUM PRIORITY',
        'low': '🟢 LOW PRIORITY'
      }[article.priority];

      const output = [
        '▶ NEWS ARTICLE ▶',
        '',
        `${priorityIcon}`,
        `${article.headline}`,
        '',
        `Source: ${article.source}`,
        `Category: ${article.category.toUpperCase()}`,
        `Published: ${timeAgo} minutes ago`,
        '',
        '─────────────────────────────────────',
        ''
      ];

      // Split content into readable lines
      const contentLines = article.content.split('\n');
      contentLines.forEach(line => {
        if (line.trim()) {
          // Wrap long lines
          const words = line.split(' ');
          let currentLine = '';
          words.forEach(word => {
            if ((currentLine + word).length > 60) {
              output.push(currentLine.trim());
              currentLine = word + ' ';
            } else {
              currentLine += word + ' ';
            }
          });
          if (currentLine.trim()) {
            output.push(currentLine.trim());
          }
          output.push('');
        }
      });

      if (article.tags.length > 0) {
        output.push(
          '─────────────────────────────────────',
          `Tags: ${article.tags.join(', ')}`
        );
      }

      if (article.playerTriggered) {
        output.push('📍 This story may be related to your activities');
      }

      if (article.factionRelated && gameState.activeFaction === article.factionRelated) {
        output.push('⚡ This story is related to your faction');
      }

      return {
        output,
        success: true
      };
    },
    unlockLevel: 0
  },

  contacts: {
    description: "View available contacts and NPCs",
    usage: "contacts [npc_id]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      // Update NPC system and generate random messages
      npcSystem.checkNPCUnlocks(gameState);
      npcSystem.generateRandomMessage(gameState);

      const npcId = args[0];
      
      if (npcId) {
        const npc = npcSystem.getNPCById(npcId);
        if (!npc || !npc.isUnlocked) {
          return {
            output: [`Contact '${npcId}' not found or not available.`],
            success: false
          };
        }

        const statusIcon = {
          'online': '🟢',
          'offline': '🔴',
          'busy': '🟡',
          'compromised': '🔴',
          'unknown': '⚪'
        }[npc.status];

        const trustIcon = {
          'hostile': '💀',
          'suspicious': '⚠️',
          'neutral': '⚪',
          'friendly': '😊',
          'trusted': '✅'
        }[npc.trustLevel];

        return {
          output: [
            `▶ CONTACT PROFILE: ${npc.alias.toUpperCase()} ▶`,
            '',
            `Real Name: ${npc.name}`,
            `Alias: ${npc.alias}`,
            `Type: ${npc.type.toUpperCase()}`,
            `Status: ${statusIcon} ${npc.status.toUpperCase()}`,
            `Trust Level: ${trustIcon} ${npc.trustLevel.toUpperCase()}`,
            `Location: ${npc.location}`,
            npc.faction ? `Faction: ${npc.faction}` : '',
            '',
            '┌─ SPECIALIZATIONS ─┐',
            ...npc.specialization.map(spec => `│ • ${spec.replace('_', ' ').toUpperCase().padEnd(25)} │`),
            '└───────────────────┘',
            '',
            '┌─ PERSONALITY ─┐',
            `│ Style: ${npc.personality.communicationStyle.padEnd(15)} │`,
            `│ Reliability: ${npc.personality.reliability}%${' '.repeat(10)} │`,
            `│ Traits: ${npc.personality.traits.join(', ').substring(0, 20).padEnd(20)} │`,
            '└───────────────┘',
            '',
            npc.services.length > 0 ? [
              '┌─ AVAILABLE SERVICES ─┐',
              ...npc.services.map(service => 
                `│ ${service.name.substring(0, 25).padEnd(25)} │`
              ),
              '└─────────────────────┘',
              '',
              'Use "contact <npc_id> <service_id>" to purchase services'
            ].join('\n') : 'No services available',
            '',
            'Use "contact <npc_id>" to interact with this contact'
          ].filter(line => line !== ''),
          success: true
        };
      }

      const availableNPCs = npcSystem.getAvailableNPCs(gameState);
      
      if (availableNPCs.length === 0) {
        return {
          output: [
            '▶ CONTACT DATABASE ▶',
            '',
            'No contacts available.',
            'Complete missions and increase your reputation to unlock contacts.'
          ],
          success: true
        };
      }

      const output = [
        '▶ CONTACT DATABASE ▶',
        `Available contacts: ${availableNPCs.length}`,
        ''
      ];

      availableNPCs.forEach(npc => {
        const statusIcon = {
          'online': '🟢',
          'offline': '🔴',
          'busy': '🟡',
          'compromised': '🔴',
          'unknown': '⚪'
        }[npc.status];

        const trustIcon = {
          'hostile': '💀',
          'suspicious': '⚠️',
          'neutral': '⚪',
          'friendly': '😊',
          'trusted': '✅'
        }[npc.trustLevel];

        output.push(
          `${npc.id.padEnd(20)} ${statusIcon} ${trustIcon} ${npc.alias}`,
          `  Type: ${npc.type} | Specialization: ${npc.specialization[0] || 'General'}`,
          ''
        );
      });

      output.push(
        '─────────────────────────────────────',
        'Use "contacts <npc_id>" for detailed contact info',
        'Use "contact <npc_id>" to interact with a contact'
      );

      return {
        output,
        success: true
      };
    },
    unlockLevel: 0
  },

  messages: {
    description: "View encrypted messages from contacts",
    usage: "messages [message_id]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const messageId = args[0];
      
      if (messageId) {
        const allMessages = npcSystem.getAllMessages();
        const messageIndex = parseInt(messageId) - 1;
        const message = allMessages[messageIndex];

        if (!message) {
          return {
            output: [
              `Message ${messageId} not found.`,
              `Available messages: 1-${allMessages.length}`
            ],
            success: false
          };
        }

        npcSystem.markMessageAsRead(message.id);

        const timeAgo = Math.floor((Date.now() - message.timestamp) / (1000 * 60));
        const priorityIcon = {
          'urgent': '🚨',
          'high': '🔴',
          'medium': '🟡',
          'low': '🟢'
        }[message.priority];

        const output = [
          '▶ ENCRYPTED MESSAGE ▶',
          '',
          `From: ${message.from}`,
          `Subject: ${message.subject}`,
          `Priority: ${priorityIcon} ${message.priority.toUpperCase()}`,
          `Received: ${timeAgo} minutes ago`,
          message.encrypted ? '🔒 ENCRYPTED MESSAGE' : '',
          '',
          '─────────────────────────────────────',
          ''
        ];

        if (message.encrypted && !message.decryptionKey) {
          output.push(
            '🔒 This message is encrypted.',
            'Decryption key required to read contents.',
            'Try using advanced decryption tools or contact the sender.'
          );
        } else {
          const contentLines = message.content.split('\n');
          contentLines.forEach(line => {
            if (line.trim()) {
              const words = line.split(' ');
              let currentLine = '';
              words.forEach(word => {
                if ((currentLine + word).length > 60) {
                  output.push(currentLine.trim());
                  currentLine = word + ' ';
                } else {
                  currentLine += word + ' ';
                }
              });
              if (currentLine.trim()) {
                output.push(currentLine.trim());
              }
              output.push('');
            }
          });
        }

        if (message.requiresResponse) {
          output.push(
            '─────────────────────────────────────',
            '📧 This message requires a response.',
            `Use "contact ${message.from.toLowerCase().replace(/[^a-z0-9]/g, '_')}" to reply`
          );
        }

        return {
          output,
          success: true
        };
      }

      const unreadMessages = npcSystem.getUnreadMessages();
      const allMessages = npcSystem.getAllMessages();

      if (allMessages.length === 0) {
        return {
          output: [
            '▶ MESSAGE INBOX ▶',
            '',
            'No messages received.',
            'Establish contacts to receive encrypted communications.'
          ],
          success: true
        };
      }

      const output = [
        '▶ MESSAGE INBOX ▶',
        `Total messages: ${allMessages.length} | Unread: ${unreadMessages.length}`,
        ''
      ];

      allMessages.slice(0, 10).forEach((message, index) => {
        const timeAgo = Math.floor((Date.now() - message.timestamp) / (1000 * 60));
        const priorityIcon = {
          'urgent': '🚨',
          'high': '🔴',
          'medium': '🟡',
          'low': '🟢'
        }[message.priority];

        const readIcon = message.isRead ? '📖' : '📩';
        const encryptedIcon = message.encrypted ? '🔒' : '';

        output.push(
          `${index + 1}. ${readIcon} ${priorityIcon} ${encryptedIcon} ${message.subject}`,
          `   From: ${message.from} | ${timeAgo}m ago`,
          ''
        );
      });

      if (allMessages.length > 10) {
        output.push(`... and ${allMessages.length - 10} more messages`);
      }

      output.push(
        '─────────────────────────────────────',
        'Use "messages <number>" to read a specific message'
      );

      return {
        output,
        success: true
      };
    },
    unlockLevel: 0
  },

  contact: {
    description: "Interact with a specific contact or NPC",
    usage: "contact <npc_id> [action] [service_id]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const npcId = args[0];
      const action = args[1] || 'greet';
      const serviceId = args[2];

      if (!npcId) {
        return {
          output: [
            'Usage: contact <npc_id> [action] [service_id]',
            'Actions: greet, info, mission, warning, buy',
            'Use "contacts" to see available contacts'
          ],
          success: false
        };
      }

      const npc = npcSystem.getNPCById(npcId);
      if (!npc || !npc.isUnlocked) {
        return {
          output: [`Contact '${npcId}' not found or not available.`],
          success: false
        };
      }

      if (action === 'buy' && serviceId) {
        const result = npcSystem.purchaseNPCService(npcId, serviceId, gameState);
        
        if (result.success && result.cost) {
          return {
            output: [
              `▶ SERVICE PURCHASED ▶`,
              '',
              result.message,
              `Cost: ${result.cost} credits`,
              '',
              npcSystem.interactWithNPC(npcId, gameState, 'greeting')
            ],
            success: true,
            updateGameState: {
              credits: gameState.credits - result.cost
            }
          };
        } else {
          return {
            output: [
              `▶ PURCHASE FAILED ▶`,
              '',
              result.message
            ],
            success: false
          };
        }
      }

      const response = npcSystem.interactWithNPC(npcId, gameState, action);
      
      const output = [
        `▶ SECURE CHANNEL: ${npc.alias.toUpperCase()} ▶`,
        '',
        `[${npc.alias}]: ${response}`,
        ''
      ];

      if (action === 'greet' && npc.services.length > 0) {
        output.push(
          '┌─ AVAILABLE SERVICES ─┐',
          ...npc.services.map(service => {
            const cost = Math.floor(service.cost * npc.personality.priceModifier);
            return `│ ${service.id.padEnd(20)} ${cost.toString().padStart(6)} credits │`;
          }),
          '└─────────────────────┘',
          '',
          'Use "contact <npc_id> buy <service_id>" to purchase services'
        );
      }

      if (npc.faction && gameState.activeFaction === npc.faction) {
        output.push('⚡ Faction ally - special rates may apply');
      }

      if (npc.trustLevel === 'suspicious' && gameState.playerLevel < 3) {
        output.push('⚠️ This contact seems wary of inexperienced operatives');
      }

      return {
        output,
        success: true
      };
    },
    unlockLevel: 0
  },

  hints: {
    description: "Get hints for the current active mission",
    usage: "hints",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const { getCurrentMission } = require('./missions');
      const currentMission = getCurrentMission(gameState);
      
      // Check if there's an active mission
      if (!currentMission) {
        return {
          output: [
            'No active mission found.',
            'Use "mission" command to start a new mission.',
            ''
          ],
          success: false,
          soundEffect: 'error'
        };
      }

      // Initialize hints used counter if not exists
      const hintsUsed = gameState.hintsUsed || 0;
      const maxHints = 3;

      if (hintsUsed >= maxHints) {
        return {
          output: [
            'Maximum hints used for this session.',
            `You have used all ${maxHints} available hints.`,
            'Complete the mission or start a new one to reset hints.',
            ''
          ],
          success: false,
          soundEffect: 'error'
        };
      }

      // Get mission-specific hints based on mission title or id
      const missionKey = currentMission.title.toLowerCase().replace(/\s+/g, '_');
      const missionHints: Record<string, string[]> = {
        'data_breach': [
          'Start by scanning for available networks with "scan wifi"',
          'Connect to TARGET_NET using "connect TARGET_NET"',
          'Use "inject payload" to deploy your basic tools'
        ],
        'shadow_network': [
          'First, scan for BLE devices using "scan ble" to find the Shadow Beacon',
          'Next, spoof the Shadow device identity with "spoof ble --mac SHADOW_MAC"',
          'Then connect to the Shadow Beacon using "connect Shadow Beacon"',
          'Initialize Hydra Protocol with "inject hydra_handshake"',
          'Finally, decrypt Shadow messages with "decrypt shadow_key"'
        ],
        'network_infiltration': [
          'Use "recon --network" to map the target infrastructure',
          'Look for vulnerabilities with "scan --detailed"',
          'Try "bypass firewall" to overcome security measures'
        ],
        'stealth_operation': [
          'Use "spoof" command to hide your identity',
          'Avoid detection by using stealth payloads',
          'Monitor your suspicion level with "status"'
        ],
        'corporate_espionage': [
          'Research the target with "recon --employees"',
          'Look for social engineering opportunities',
          'Use "crack" to break into secured systems'
        ]
      };

      const currentHints = missionHints[missionKey] || [
        'Analyze the mission objective carefully',
        'Use "scan" to gather information about targets',
        'Check your available tools with "help"'
      ];

      const hintIndex = hintsUsed % currentHints.length;
      const hint = currentHints[hintIndex];

      return {
        output: [
          `▶ MISSION HINT ${hintsUsed + 1}/${maxHints} ▶`,
          '',
          `Mission: ${currentMission.title}`,
          `Objective: ${currentMission.objective}`,
          '',
          '💡 HINT:',
          `${hint}`,
          '',
          `Hints remaining: ${maxHints - hintsUsed - 1}`,
          ''
        ],
        success: true,
        updateGameState: {
          hintsUsed: hintsUsed + 1
        },
        soundEffect: 'success'
      };
    },
    unlockLevel: 0 // Always available
  },

  // Add after the existing spoof command

  // BLE spoofing for Mission 2
  spoof_ble: {
    description: "Spoof BLE device identity",
    usage: "spoof ble --mac <mac_address>",
    execute: (args: string[], gameState: GameState): CommandResult => {
      if (args[0] !== 'ble' || args[1] !== '--mac' || !args[2]) {
        return {
          output: ['Usage: spoof ble --mac <mac_address>'],
          success: false
        };
      }

      const macAddress = args[2];
      
      if (macAddress === 'SHADOW_MAC' || macAddress === 'SHADOW_MAC_001') {
        // Only award credits if this command is completing a mission step
        const shouldAwardCredits = shouldAwardCommandCredits('spoof', args, true, gameState);
        const updateGameState = shouldAwardCredits ? {
          credits: gameState.credits + 200
        } : undefined;

        return {
          output: [
            '▶ BLE IDENTITY SPOOFING ▶',
            '',
            `> Spoofing MAC address: ${macAddress}`,
            '> Cloning Shadow Beacon identity...',
            '> Generating fake device signatures...',
            '> Bypassing authentication protocols...',
            '',
            '✓ BLE identity successfully spoofed',
            '✓ Now appearing as trusted Shadow device',
            '✓ Shadow Organization protocols accessible',
            '',
            '⚠ Spoof duration: 10 minutes',
            '⚠ Shadow network access granted',
            ''
          ],
          success: true,
          updateGameState,
          soundEffect: 'success'
        };
      }

      return {
        output: [
          '▶ BLE IDENTITY SPOOFING ▶',
          '',
          `> Spoofing MAC address: ${macAddress}`,
          '> Cloning device identity...',
          '> Generating fake signatures...',
          '',
          '✓ BLE identity spoofed successfully',
          '✓ Device now appears trusted',
          '',
          '⚠ Spoof active for 5 minutes'
        ],
        success: true,
        soundEffect: 'success'
      };
    },
    unlockLevel: 2
  },

  // Hydra protocol injection for Mission 2
  inject_hydra: {
    description: "Inject Hydra Protocol handshake",
    usage: "inject hydra_handshake",
    execute: (args: string[], gameState: GameState): CommandResult => {
      if (args[0] !== 'hydra_handshake') {
        return {
          output: [
            'Usage: inject hydra_handshake',
            'Available payloads: hydra_handshake'
          ],
          success: false
        };
      }

      if (gameState.networkStatus !== 'CONNECTED' && gameState.networkStatus !== 'BLE_CONNECTED') {
        return {
          output: ['ERROR: No network connection', 'Connect to a WiFi network or BLE device first', ''],
          success: false,
          soundEffect: 'error'
        };
      }

      // Only award credits if this command is completing a mission step
      const shouldAwardCredits = shouldAwardCommandCredits('inject', args, true, gameState);
      const updateGameState = shouldAwardCredits ? {
        credits: gameState.credits + 300,
        hydraProtocol: {
          ...gameState.hydraProtocol,
          discovered: true,
          active_contacts: ['SHADOW_NODE_07']
        }
      } : {
        hydraProtocol: {
          ...gameState.hydraProtocol,
          discovered: true,
          active_contacts: ['SHADOW_NODE_07']
        }
      };

      return {
        output: [
          '▶ HYDRA PROTOCOL INJECTION ▶',
          '',
          '> Loading Hydra handshake payload...',
          '> Establishing encrypted channel...',
          '> Negotiating Shadow protocols...',
          '> Authenticating with Shadow nodes...',
          '',
          '✓ Hydra Protocol successfully initialized',
          '✓ Shadow network access established',
          '✓ Encrypted communication channel active',
          '',
          '🐍 Welcome to the Shadow Organization',
          '📡 Encrypted messages incoming...',
          '',
          shouldAwardCredits ? '+300 credits earned' : 'Hydra Protocol active'
        ],
        success: true,
        updateGameState,
        soundEffect: 'success'
      };
    },
    unlockLevel: 3
  },

  // Shadow key decryption for Mission 2
  decrypt_shadow: {
    description: "Decrypt Shadow Organization messages",
    usage: "decrypt shadow_key",
    execute: (args: string[], gameState: GameState): CommandResult => {
      if (args[0] !== 'shadow_key') {
        return {
          output: [
            'Usage: decrypt shadow_key',
            'Available keys: shadow_key'
          ],
          success: false
        };
      }

      if (!gameState.hydraProtocol.discovered) {
        return {
          output: [
            'ERROR: Hydra Protocol not initialized',
            'Initialize Hydra Protocol first',
            'Use "inject hydra_handshake" to establish connection'
          ],
          success: false,
          soundEffect: 'error'
        };
      }

      // Only award credits if this command is completing a mission step
      const shouldAwardCredits = shouldAwardCommandCredits('decrypt', args, true, gameState);
      const updateGameState = shouldAwardCredits ? {
        credits: gameState.credits + 400,
        hydraProtocol: {
          ...gameState.hydraProtocol,
          access_level: 2,
          encrypted_messages: [
            {
              id: 'shadow_msg_001',
              from: 'SHADOW_COMMAND',
              content: 'Welcome, new operative. You have passed the first test. More challenging missions await.',
              encrypted_content: 'XyZ9$#mK!@vN...encrypted_shadow_message...pL8&^qR2',
              is_decrypted: true,
              timestamp: Date.now()
            }
          ]
        }
      } : {
        hydraProtocol: {
          ...gameState.hydraProtocol,
          access_level: 2,
          encrypted_messages: [
            {
              id: 'shadow_msg_001',
              from: 'SHADOW_COMMAND',
              content: 'Welcome, new operative. You have passed the first test. More challenging missions await.',
              encrypted_content: 'XyZ9$#mK!@vN...encrypted_shadow_message...pL8&^qR2',
              is_decrypted: true,
              timestamp: Date.now()
            }
          ]
        }
      };

      return {
        output: [
          '▶ SHADOW KEY DECRYPTION ▶',
          '',
          '> Applying Shadow decryption key...',
          '> Decoding quantum-encrypted messages...',
          '> Verifying message integrity...',
          '',
          '✓ Shadow messages successfully decrypted',
          '',
          '┌─ DECRYPTED MESSAGE ─┐',
          '│ FROM: SHADOW_COMMAND         │',
          '│ TO: NEW_OPERATIVE            │',
          '│ PRIORITY: HIGH               │',
          '│                              │',
          '│ Welcome, new operative.      │',
          '│ You have passed the first    │',
          '│ test. More challenging       │',
          '│ missions await.              │',
          '│                              │',
          '│ Report to Shadow Node 07     │',
          '│ for further instructions.    │',
          '└─────────────────────────────┘',
          '',
          '🎯 Mission Complete: Shadow Network Access Established',
          shouldAwardCredits ? '+400 credits earned' : 'Shadow messages decrypted'
        ],
        success: true,
        updateGameState,
        soundEffect: 'success'
      };
    },
    unlockLevel: 3
  },

  missions: {
    description: "Open mission control interface",
    usage: "missions",
    execute: (args: string[], gameState: GameState): CommandResult => {
      setTimeout(() => {
        const event = new CustomEvent('showMissionInterface');
        window.dispatchEvent(event);
      }, 100);

      return {
        output: [
          '▶ MISSION CONTROL INTERFACE LOADING ▶',
          '',
          '✓ Accessing mission database...',
          '✓ Loading available contracts...',
          '✓ Checking emergency alerts...',
          '✓ Scanning for special operations...',
          '',
          '🎯 Mission Control interface opened',
          '',
          'Available features:',
          '• Browse available missions by category and difficulty',
          '• View detailed mission briefings and requirements',
          '• Track active mission progress',
          '• Review completed mission history',
          '• Access special and emergency missions',
          '',
          'Select missions to view rewards, objectives, and start conditions.'
        ],
        success: true
      };
    },
    unlockLevel: 1
  },

  // Social Engineering System Commands
  social_engineering: {
    description: "Open social engineering interface for target manipulation",
    usage: "social_engineering",
    execute: (args: string[], gameState: GameState): CommandResult => {
      setTimeout(() => {
        const event = new CustomEvent('openSocialEngineering');
        window.dispatchEvent(event);
      }, 100);

      return {
        output: [
          '▶ SOCIAL ENGINEERING TOOLKIT LOADING ▶',
          '',
          '✓ Initializing target database...',
          '✓ Loading phishing templates...',
          '✓ Activating conversation engine...',
          '✓ Preparing intel gathering tools...',
          '',
          '🕵️ Social Engineering interface opened',
          '',
          'Available features:',
          '• Target identification and profiling',
          '• Interactive conversation simulation',
          '• Phishing campaign creation and deployment',
          '• Intel gathering and reputation tracking',
          '• Social manipulation tactics and strategies',
          '',
          'Use psychological tactics to extract information and gain access.'
        ],
        success: true
      };
    },
    unlockLevel: 2
  },

  phish: {
    description: "Create and deploy phishing campaigns",
    usage: "phish [target] [template]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const target = args[0];
      const template = args[1] || 'urgent_security';

      if (!target) {
        return {
          output: [
            'Usage: phish <target> [template]',
            '',
            'Available templates:',
            '• urgent_security - Security breach notification',
            '• fake_promotion - Promotional offer',
            '• system_update - System maintenance notice',
            '',
            'Example: phish john.doe@company.com urgent_security'
          ],
          success: false
        };
      }

      return {
        output: [
          '▶ PHISHING CAMPAIGN DEPLOYMENT ▶',
          '',
          `> Target: ${target}`,
          `> Template: ${template}`,
          '> Crafting convincing message...',
          '> Spoofing sender identity...',
          '> Deploying campaign...',
          '',
          '✓ Phishing email sent successfully',
          '',
          '📧 Campaign Status:',
          `• Target: ${target}`,
          `• Template: ${template}`,
          '• Delivery: Confirmed',
          '• Tracking: Active',
          '',
          'Monitor target response in social engineering interface.',
          'Use "social_engineering" to view campaign results.'
        ],
        success: true,
        soundEffect: 'success'
      };
    },
    unlockLevel: 3
  },

  // Network Mapping System Commands
  network_map: {
    description: "Open dynamic network mapping interface",
    usage: "network_map",
    execute: (args: string[], gameState: GameState): CommandResult => {
      setTimeout(() => {
        const event = new CustomEvent('openNetworkMap');
        window.dispatchEvent(event);
      }, 100);

      return {
        output: [
          '▶ NETWORK MAPPING SYSTEM LOADING ▶',
          '',
          '✓ Initializing network scanner...',
          '✓ Loading topology algorithms...',
          '✓ Activating intrusion detection...',
          '✓ Preparing backdoor management...',
          '',
          '🗺️ Network Map interface opened',
          '',
          'Available features:',
          '• Procedural network generation',
          '• Real-time network topology visualization',
          '• Node vulnerability assessment',
          '• Backdoor installation and management',
          '• Traceback risk monitoring',
          '• Subnet analysis and penetration',
          '',
          'Navigate complex networks and establish persistent access.'
        ],
        success: true
      };
    },
    unlockLevel: 2
  },

  generate_network: {
    description: "Generate a new procedural network for hacking",
    usage: "generate_network [difficulty] [size]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const difficulty = args[0] || 'medium';
      const size = parseInt(args[1]) || 8;

      if (!['easy', 'medium', 'hard', 'expert'].includes(difficulty)) {
        return {
          output: [
            'Invalid difficulty level.',
            'Available difficulties: easy, medium, hard, expert'
          ],
          success: false
        };
      }

      if (size < 3 || size > 20) {
        return {
          output: [
            'Network size must be between 3 and 20 nodes.'
          ],
          success: false
        };
      }

      return {
        output: [
          '▶ NETWORK GENERATION PROTOCOL ▶',
          '',
          `> Difficulty: ${difficulty}`,
          `> Target size: ${size} nodes`,
          '> Generating network topology...',
          '> Placing security measures...',
          '> Installing honeypots...',
          '> Configuring vulnerabilities...',
          '',
          '✓ Network generated successfully',
          '',
          '🌐 Network Details:',
          `• Nodes: ${size}`,
          `• Difficulty: ${difficulty}`,
          '• Subnets: Auto-configured',
          '• Security: Variable',
          '',
          'Use "network_map" to visualize and interact with the network.'
        ],
        success: true,
        soundEffect: 'success'
      };
    },
    unlockLevel: 3
  },

  backdoor: {
    description: "Install backdoor on compromised system",
    usage: "backdoor [type] [target]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const type = args[0] || 'shell';
      const target = args[1] || 'current_target';

      const backdoorTypes = ['shell', 'tunnel', 'keylogger', 'data_exfil', 'persistence'];
      
      if (!backdoorTypes.includes(type)) {
        return {
          output: [
            'Invalid backdoor type.',
            'Available types:',
            '• shell - Remote shell access',
            '• tunnel - Encrypted tunnel',
            '• keylogger - Keystroke capture',
            '• data_exfil - Data exfiltration',
            '• persistence - Persistent access'
          ],
          success: false
        };
      }

      return {
        output: [
          '▶ BACKDOOR INSTALLATION ▶',
          '',
          `> Target: ${target}`,
          `> Type: ${type}`,
          '> Checking system permissions...',
          '> Uploading payload...',
          '> Establishing persistence...',
          '> Configuring stealth mode...',
          '',
          '✓ Backdoor installed successfully',
          '',
          '🚪 Backdoor Details:',
          `• Type: ${type}`,
          `• Target: ${target}`,
          '• Status: Active',
          '• Discovery Risk: 15%',
          '',
          'Warning: Discovery risk increases over time.',
          'Monitor backdoor status in network map interface.'
        ],
        success: true,
        soundEffect: 'success'
      };
    },
    unlockLevel: 4
  },

  // Script Editor System Commands
  script_editor: {
    description: "Open advanced scripting and automation interface",
    usage: "script_editor",
    execute: (args: string[], gameState: GameState): CommandResult => {
      setTimeout(() => {
        const event = new CustomEvent('openScriptEditor');
        window.dispatchEvent(event);
      }, 100);

      return {
        output: [
          '▶ SCRIPT EDITOR LOADING ▶',
          '',
          '✓ Initializing scripting engine...',
          '✓ Loading macro library...',
          '✓ Activating execution environment...',
          '✓ Preparing automation tools...',
          '',
          '⚙️ Script Editor interface opened',
          '',
          'Available features:',
          '• Advanced script creation and editing',
          '• Macro command automation',
          '• Conditional logic and loops',
          '• Script execution monitoring',
          '• Built-in function library',
          '• Import/export script sharing',
          '',
          'Automate complex hacking sequences with custom scripts.'
        ],
        success: true
      };
    },
    unlockLevel: 3
  },

  create_script: {
    description: "Create a new automation script",
    usage: "create_script [name] [type]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const name = args[0] || `script_${Date.now()}`;
      const type = args[1] || 'sequence';

      const scriptTypes = ['sequence', 'conditional', 'loop', 'macro'];
      
      if (!scriptTypes.includes(type)) {
        return {
          output: [
            'Invalid script type.',
            'Available types:',
            '• sequence - Linear command sequence',
            '• conditional - If/then logic',
            '• loop - Repeating operations',
            '• macro - Simple command aliases'
          ],
          success: false
        };
      }

      return {
        output: [
          '▶ SCRIPT CREATION ▶',
          '',
          `> Name: ${name}`,
          `> Type: ${type}`,
          '> Initializing script template...',
          '> Setting up execution environment...',
          '> Configuring error handling...',
          '',
          '✓ Script created successfully',
          '',
          '📜 Script Details:',
          `• Name: ${name}`,
          `• Type: ${type}`,
          '• Status: Draft',
          '• Steps: 0',
          '',
          'Use script editor interface to add commands and logic.',
          'Run "script_editor" to open the visual editor.'
        ],
        success: true,
        soundEffect: 'success'
      };
    },
    unlockLevel: 4
  },

  macro: {
    description: "Create or execute command macros",
    usage: "macro [name] [commands...]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      if (args.length === 0) {
        return {
          output: [
            'Usage: macro <name> [commands...]',
            '',
            'Examples:',
            '• macro intrude "scan wifi" "connect TARGET_NET" "exploit"',
            '• macro recon "ping" "nmap" "vuln_scan"',
            '• macro cleanup "clear_logs" "remove_traces"',
            '',
            'To execute a macro: macro <name>',
            'To list macros: macro list'
          ],
          success: false
        };
      }

      const name = args[0];
      
      if (name === 'list') {
        return {
          output: [
            '▶ AVAILABLE MACROS ▶',
            '',
            '• intrude - Full network intrusion sequence',
            '• recon - Reconnaissance and scanning',
            '• stealth_scan - Passive network discovery',
            '• cleanup - Remove traces and logs',
            '• data_exfil - Data extraction sequence',
            '',
            'Use "script_editor" for advanced macro management.'
          ],
          success: true
        };
      }

      const commands = args.slice(1);
      
      if (commands.length === 0) {
        // Execute existing macro
        return {
          output: [
            `▶ EXECUTING MACRO: ${name} ▶`,
            '',
            '> Loading macro definition...',
            '> Validating command sequence...',
            '> Executing commands...',
            '',
            '✓ Macro execution completed',
            '',
            `📋 Macro "${name}" executed successfully`,
            'Check individual command results above.'
          ],
          success: true,
          soundEffect: 'success'
        };
      } else {
        // Create new macro
        return {
          output: [
            `▶ CREATING MACRO: ${name} ▶`,
            '',
            `> Commands: ${commands.join(' → ')}`,
            '> Validating command syntax...',
            '> Creating macro definition...',
            '> Saving to macro library...',
            '',
            '✓ Macro created successfully',
            '',
            `📋 Macro "${name}" is now available`,
            `Execute with: macro ${name}`
          ],
          success: true,
          soundEffect: 'success'
        };
      }
    },
    unlockLevel: 3
  },

  // Focus System Commands
  focus_status: {
    description: "Check current focus level and mental state",
    usage: "focus_status",
    execute: (args: string[], gameState: GameState): CommandResult => {
      return {
        output: [
          '▶ FOCUS STATUS REPORT ▶',
          '',
          '🧠 Mental State Analysis:',
          '• Focus Level: 85%',
          '• Mental Load: Moderate',
          '• Overload Risk: Low',
          '• Active Effects: None',
          '',
          '⚡ Performance Metrics:',
          '• Command Efficiency: 95%',
          '• Error Rate: 2%',
          '• Reaction Time: Normal',
          '',
          '💊 Available Stimulants:',
          '• Coffee (50 credits)',
          '• Nootropics (150 credits)',
          '• Energy Drink (75 credits)',
          '• Meditation (Free)',
          '',
          'Use "stimulant <type>" to boost focus.',
          'Focus interface is always visible in top-right corner.'
        ],
        success: true
      };
    },
    unlockLevel: 1
  },

  stimulant: {
    description: "Use stimulants to boost focus and performance",
    usage: "stimulant [type]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const type = args[0];
      
      if (!type) {
        return {
          output: [
            'Usage: stimulant <type>',
            '',
            'Available stimulants:',
            '• caffeine - Coffee boost (+20 focus, 5min)',
            '• nootropic - Smart drugs (+35 focus, 10min)',
            '• energy_drink - Energy boost (+30 focus, 4min)',
            '• meditation - Deep focus (+50 focus, 15min)',
            '• break - Short rest (+25 focus, 3min)',
            '',
            'Note: Some stimulants have side effects.'
          ],
          success: false
        };
      }

      const stimulants = {
        caffeine: { name: 'Coffee', boost: 20, cost: 50 },
        nootropic: { name: 'Nootropics', boost: 35, cost: 150 },
        energy_drink: { name: 'Energy Drink', boost: 30, cost: 75 },
        meditation: { name: 'Meditation', boost: 50, cost: 0 },
        break: { name: 'Short Break', boost: 25, cost: 0 }
      };

      const stimulant = stimulants[type as keyof typeof stimulants];
      
      if (!stimulant) {
        return {
          output: [
            `Unknown stimulant: ${type}`,
            'Use "stimulant" without arguments to see available options.'
          ],
          success: false
        };
      }

      if (stimulant.cost > 0 && gameState.credits < stimulant.cost) {
        return {
          output: [
            `Insufficient credits for ${stimulant.name}`,
            `Required: ${stimulant.cost} credits`,
            `Available: ${gameState.credits} credits`
          ],
          success: false,
          soundEffect: 'error'
        };
      }

      const updateGameState = stimulant.cost > 0 ? {
        credits: gameState.credits - stimulant.cost
      } : undefined;

      return {
        output: [
          `▶ USING ${stimulant.name.toUpperCase()} ▶`,
          '',
          '> Applying stimulant...',
          '> Monitoring vital signs...',
          '> Adjusting focus levels...',
          '',
          '✓ Stimulant applied successfully',
          '',
          '🧠 Effects:',
          `• Focus boost: +${stimulant.boost} points`,
          '• Mental clarity: Enhanced',
          '• Reaction time: Improved',
          '',
          stimulant.cost > 0 ? `💰 Cost: ${stimulant.cost} credits` : '💰 Cost: Free',
          '',
          'Focus boost is now active. Monitor effects in focus interface.'
        ],
        success: true,
        updateGameState,
        soundEffect: 'success'
      };
    },
    unlockLevel: 2
  },

  // Psychological Profiling System
  psych_profile: {
    description: "Access psychological profiling and mental state analysis",
    usage: "psych_profile [action]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const action = args[0] || 'view';
      
      switch (action) {
        case 'view':
        case 'status':
          const profile = gameState.psychProfile;
          if (!profile) {
            return {
              output: [
                '▶ PSYCHOLOGICAL PROFILE ANALYSIS ▶',
                '',
                '⚠️ No psychological profile data found.',
                'Your profile will be built as you make decisions',
                'and complete missions in the game.',
                '',
                'Use "psych_profile interface" to initialize your profile'
              ],
              success: true
            };
          }
          
          const getAlignmentLabel = (alignment: number): string => {
            if (alignment > 50) return `Lawful Good (+${alignment})`;
            if (alignment > 20) return `Neutral Good (+${alignment})`;
            if (alignment > -20) return `True Neutral (${alignment})`;
            if (alignment > -50) return `Chaotic Neutral (${alignment})`;
            return `Chaotic Evil (${alignment})`;
          };
          
          const getReputationLabel = (rep: number): string => {
            if (rep > 50) return `Trusted (+${rep})`;
            if (rep > 20) return `Friendly (+${rep})`;
            if (rep > -20) return `Neutral (${rep})`;
            if (rep > -50) return `Suspicious (${rep})`;
            return `Hostile (${rep})`;
          };
          
          return {
            output: [
              '▶ PSYCHOLOGICAL PROFILE ANALYSIS ▶',
              '',
              '🧠 Core Personality Traits:',
              `• Cunning: ${profile.cunning}% (Strategic thinking)`,
              `• Empathy: ${profile.empathy}% (Moral consideration)`,
              `• Aggression: ${profile.aggression}% (Force willingness)`,
              `• Patience: ${profile.patience}% (Long-term planning)`,
              `• Paranoia: ${profile.paranoia}% (Security consciousness)`,
              `• Curiosity: ${profile.curiosity}% (Learning drive)`,
              '',
              `⚖️ Moral Alignment: ${getAlignmentLabel(profile.ethicalAlignment)}`,
              '',
              '📊 Reputation Standing:',
              `• Corporate: ${getReputationLabel(profile.corporateReputation)}`,
              `• Hacktivist: ${getReputationLabel(profile.hackivistReputation)}`,
              `• Criminal: ${getReputationLabel(profile.criminalReputation)}`,
              `• Government: ${getReputationLabel(profile.governmentReputation)}`,
              '',
              `🧩 Mental State: ${profile.mentalStability > 80 ? 'Stable' : profile.mentalStability > 60 ? 'Stressed' : profile.mentalStability > 40 ? 'Unstable' : 'Critical'} (${profile.mentalStability}%)`,
              `💭 Moral Conflict: ${profile.moralConflict < 20 ? 'Low' : profile.moralConflict < 40 ? 'Moderate' : profile.moralConflict < 70 ? 'High' : 'Severe'} (${profile.moralConflict}%)`,
              '',
              `📈 Major Decisions Made: ${profile.majorDecisions.length}`,
              `🚫 Active Consequences: ${profile.permanentConsequences.length}`,
              '',
              'Use "psych_profile interface" to open full analysis',
              'Use "psych_profile decisions" to view decision history'
            ],
            success: true
          };
          
        case 'interface':
          // Trigger the interface opening
          window.dispatchEvent(new CustomEvent('openPsychProfile'));
          return {
            output: [
              '▶ OPENING PSYCHOLOGICAL INTERFACE ▶',
              '',
              '> Initializing neural analysis...',
              '> Loading personality matrix...',
              '> Calculating moral alignment...',
              '> Accessing decision history...',
              '',
              '✓ Interface loaded successfully',
              '',
              '🔬 Full psychological profiling interface is now open.',
              'Review your mental state, make decisions, and track',
              'how your choices shape your hacker identity.'
            ],
            success: true,
            soundEffect: 'connection'
          };
          
        case 'decisions':
          const decisionProfile = gameState.psychProfile;
          if (!decisionProfile || decisionProfile.majorDecisions.length === 0) {
            return {
              output: [
                '▶ DECISION HISTORY LOG ▶',
                '',
                '📝 No major decisions recorded yet.',
                '',
                'Your decision history will populate as you make',
                'significant choices during missions and interactions.',
                'These decisions shape your psychological profile',
                'and influence how NPCs and factions view you.',
                '',
                'Use "psych_profile interface" to explore decision-making'
              ],
              success: true
            };
          }
          
          const recentDecisions = decisionProfile.majorDecisions
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5);
          
          const formatDate = (timestamp: number): string => {
            return new Date(timestamp).toLocaleDateString();
          };
          
          const output = [
            '▶ DECISION HISTORY LOG ▶',
            '',
            '📝 Recent Major Decisions:'
          ];
          
          recentDecisions.forEach((decision, index) => {
            output.push(`• [${formatDate(decision.timestamp)}] ${decision.description}`);
            output.push(`  → Ethical impact: ${decision.ethicalWeight > 0 ? '+' : ''}${decision.ethicalWeight}`);
            
            // Show trait impacts
            const traitChanges = Object.entries(decision.traitImpacts)
              .filter(([_, value]) => value !== 0)
              .map(([trait, value]) => `${trait}: ${value > 0 ? '+' : ''}${value}`)
              .join(', ');
            
            if (traitChanges) {
              output.push(`  → Trait changes: ${traitChanges}`);
            }
            
            if (decision.consequences.length > 0) {
              output.push(`  → Consequences: ${decision.consequences.join(', ')}`);
            }
            
            if (index < recentDecisions.length - 1) {
              output.push('');
            }
          });
          
          output.push('');
          output.push('⚠️ Active Consequences:');
          
          if (decisionProfile.permanentConsequences.length === 0) {
            output.push('• None currently active');
          } else {
            decisionProfile.permanentConsequences.forEach(consequence => {
              output.push(`• ${consequence}`);
            });
          }
          
          output.push('');
          output.push('Use "psych_profile interface" for detailed analysis');
          
          return {
            output,
            success: true
          };
          
        case 'reset':
          if (!gameState.unlockedCommands.includes('psych_reset')) {
            return {
              output: [
                'Psychological reset requires special authorization.',
                'This command is locked until you unlock it through',
                'specific story progression or achievements.'
              ],
              success: false,
              soundEffect: 'error'
            };
          }
          
          return {
            output: [
              '▶ PSYCHOLOGICAL RESET PROTOCOL ▶',
              '',
              '⚠️ WARNING: This will reset your entire psychological profile!',
              '',
              '> Clearing personality traits...',
              '> Resetting moral alignment...',
              '> Wiping decision history...',
              '> Neutralizing reputation scores...',
              '',
              '✓ Psychological reset complete',
              '',
              '🧠 Your mind is now a blank slate.',
              'All previous psychological development has been erased.',
              'Begin building your new hacker identity.'
            ],
            success: true,
            updateGameState: {
              // Reset psych profile data would go here
              psychProfile: undefined
            },
            soundEffect: 'system_breach'
          };
          
        default:
          return {
            output: [
              'Usage: psych_profile [action]',
              '',
              'Available actions:',
              '• view/status - View current psychological profile',
              '• interface - Open full psychological analysis interface',
              '• decisions - View decision history and consequences',
              '• reset - Reset psychological profile (requires unlock)',
              '',
              'Your psychological profile tracks how your choices',
              'shape your hacker identity and affect your reputation',
              'with different factions and organizations.'
            ],
            success: false
          };
      }
    },
    unlockLevel: 2
  },
};

// Command availability checker
export function isCommandAvailable(commandName: string, gameState: GameState): boolean {
  // Always available commands (core system commands)
  const alwaysAvailable = ['help', 'clear', 'status', 'shop', 'devmode', 'easter', 'reset_shop', 'tutorial', 'settings', 'multiplayer', 'leaderboard', 'man'];
  
  if (alwaysAvailable.includes(commandName)) {
    return true;
  }

  // Check if command is in unlocked commands list
  if (gameState.unlockedCommands.includes(commandName)) {
    return true;
  }

  // Check command unlock level
  const command = commands[commandName];
  if (!command) return false;

  // Commands with unlockLevel 999 are shop/faction exclusive
  if (command.unlockLevel === 999) {
    return gameState.unlockedCommands.includes(commandName);
  }

  // Commands with unlockLevel 0 should be available from start
  if (command.unlockLevel === 0 || command.unlockLevel === undefined) {
    return true;
  }

  // Level-based unlocking
  const playerLevel = gameState.playerLevel || 1;
  return playerLevel >= command.unlockLevel;
}

// Get initial unlocked commands for new players
export function getInitialUnlockedCommands(): string[] {
  const initialCommands: string[] = [];
  
  // Add always available commands
  initialCommands.push('help', 'clear', 'status', 'shop', 'devmode', 'easter', 'reset_shop', 'tutorial', 'settings', 'multiplayer', 'leaderboard', 'man');
  
  // Add level 0 commands (available from start)
  Object.keys(commands).forEach(commandName => {
    const command = commands[commandName];
    if (command.unlockLevel === 0 || command.unlockLevel === undefined) {
      if (!initialCommands.includes(commandName)) {
        initialCommands.push(commandName);
      }
    }
  });

  return initialCommands;
}
