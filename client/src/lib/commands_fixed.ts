// @ts-nocheck
import { Command, CommandResult, GameState, Network, Device, MissionStep } from '../types/game';
import { 
  getNextNarrativeEvent, 
  formatNarrativeEvent, 
  processNarrativeChoice, 
  generateEncryptedMessage,
  narrativeEvents 
} from './narrativeSystem';
import { checkEasterEgg, discoverEasterEgg, getEasterEggHints, getEasterEggStats, loadDiscoveredEasterEggs, EasterEgg } from './easterEggs';
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
    }
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
    }
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
    }
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
    }
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
    }
  },

  sensor_spoof: {
    description: "Spoof sensor data using ESP32 transmitters",
    usage: "sensor_spoof [sensor_type] [value]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const sensorType = args[0] || 'temperature';
      const value = args[1] || 'normal';
      
      const spoofResults = [
        '> ESP32 SENSOR SPOOFING INITIATED...',
        `> Target sensor: ${sensorType}`,
        `> Spoofed value: ${value}`,
        '> Calibrating transmitter frequency...',
        '> [████████████████████████] 100%',
        '',
        '┌─ SPOOFING STATUS ─┐',
        '│ Signal strength: 98%      │',
        '│ Frequency match: PERFECT  │',
        '│ Interference: MINIMAL     │',
        '│ Detection risk: LOW       │',
        '│                           │',
        '│ SPOOFING ACTIVE!          │',
        '│ Target sensor deceived    │',
        '└───────────────────────────┘',
        '',
        `> ${sensorType} sensor successfully spoofed`,
        '> Maintaining transmission...',
        ''
      ];

      return {
        output: spoofResults,
        success: true
      };
    }
  },

  trace: {
    description: "View memory trace timeline of your activities",
    usage: "trace",
    execute: (args: string[], gameState: GameState): CommandResult => {
      return {
        output: [
          '▶ Accessing memory trace...',
          '▶ Analyzing gameplay patterns...',
          '▶ Constructing timeline visualization...',
          '',
          '✓ Memory trace interface loaded',
          '📊 Interactive timeline available',
          ''
        ],
        success: true,
        soundEffect: 'success'
      };
    }
  },

  easter: {
    description: "View discovered easter eggs and hints",
    usage: "easter [hints]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const stats = getEasterEggStats();
      
      if (args[0] === 'hints') {
        const hints = getEasterEggHints();
        return {
          output: [
            '╔══════════════════════════════════════╗',
            '║            EASTER EGG HINTS          ║',
            '╠══════════════════════════════════════╣',
            ...hints.map(hint => `║ ${hint.padEnd(36)} ║`),
            '║                                      ║',
            `║ Progress: ${stats.discovered}/${stats.total} discovered              ║`,
            '╚══════════════════════════════════════╝',
            ''
          ],
          success: true
        };
      }
      
      const output = [
        '╔══════════════════════════════════════╗',
        '║          DISCOVERED EASTER EGGS      ║',
        '╠══════════════════════════════════════╣',
        '',
        '║ No easter eggs discovered yet...     ║',
        '║ Try exploring hidden commands!       ║',
        '║                                      ║',
        `║ Progress: ${stats.discovered}/${stats.total} discovered              ║`,
        '║                                      ║',
        '║ Use "easter hints" for clues!        ║',
        '╚══════════════════════════════════════╝',
        ''
      ];
      
      return {
        output,
        success: true
      };
    }
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
        gameState.unlockedCommands.includes(cmd)
      );
      
      return {
        output: [
          '┌─ AVAILABLE COMMANDS ─┐',
          ...availableCommands.map(cmd => `│ ${cmd.padEnd(10)} - ${commands[cmd].description.substring(0, 20)} │`),
          '└─────────────────────┘',
          '',
          'Type "man <cmd>" for help',
          ''
        ],
        success: true
      };
    }
  },

  scan: {
    description: "Scan for networks and devices",
    usage: "scan [wifi|ble|ports]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const target = args[0] || 'wifi';
      
      switch(target) {
        case 'wifi':
          return {
            output: [
              '▶ WiFi scan...',
              '',
              '┌─ NETWORKS ─┐',
              ...networkDatabase.map(net => 
                `│ ${net.ssid.substring(0, 12).padEnd(12)} ${net.channel.toString().padStart(2)} ${net.power.toString().padStart(3)} │`
              ),
              '└────────────┘',
              '',
              `✓ ${networkDatabase.length} networks found`,
              '⚠ WEP detected',
              ''
            ],
            success: true,
            soundEffect: 'keypress'
          };
        
        case 'ble':
          return {
            output: [
              '▶ Scanning Bluetooth Low Energy devices...',
              '',
              ...bleDevices.map(device => `Device: ${device.name} (${device.mac})`),
              '',
              `✓ ${bleDevices.length} BLE devices found`,
              ''
            ],
            success: true,
            soundEffect: 'keypress'
          };
        
        case 'ports':
          return {
            output: [
              '▶ Port scanning target...',
              '',
              'PORT    STATE    SERVICE',
              '22/tcp  open     ssh',
              '80/tcp  open     http', 
              '443/tcp open     https',
              '8080/tcp filtered http-proxy',
              '',
              '✓ Scan complete',
              ''
            ],
            success: true,
            soundEffect: 'keypress'
          };
        
        default:
          return {
            output: [`ERROR: Unknown scan target '${target}'`, 'Try: wifi, ble, or ports', ''],
            success: false,
            soundEffect: 'error'
          };
      }
    }
  },

  connect: {
    description: "Connect to a target network",
    usage: "connect <ssid> [--password <pass>]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      if (args.length === 0) {
        return {
          output: ['ERROR: SSID required', 'Usage: connect <ssid>', ''],
          success: false,
          soundEffect: 'error'
        };
      }
      
      const ssid = args[0];
      const network = networkDatabase.find(net => net.ssid === ssid);
      
      if (!network) {
        return {
          output: [`ERROR: Network '${ssid}' not found`, 'Run "scan wifi" to discover networks', ''],
          success: false,
          soundEffect: 'error'
        };
      }
      
      return {
        output: [
          `▶ Attempting connection to '${ssid}'...`,
          '▶ Analyzing security protocols...',
          '▶ Executing handshake...',
          '▶ Establishing encrypted tunnel...',
          '',
          `✓ Connected to ${ssid}`,
          `✓ Assigned IP: 192.168.4.${Math.floor(Math.random() * 254) + 2}`,
          '✓ Network access granted',
          '',
          '⚠ Remember: Unauthorized access is illegal',
          ''
        ],
        success: true,
        updateGameState: { 
          networkStatus: 'CONNECTED',
          currentNetwork: ssid
        },
        soundEffect: 'success'
      };
    }
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
            '• basic_payload (Purchase from shop)',
            '• stealth_payload (Advanced)',
            '• data_extractor (Mission specific)',
            '',
            'Visit the shop to buy payloads'
          ],
          success: false,
          soundEffect: 'error'
        };
      }
      
      if (gameState.networkStatus !== 'CONNECTED') {
        return {
          output: ['ERROR: No network connection', 'Connect to a network first', ''],
          success: false,
          soundEffect: 'error'
        };
      }

      const payloadName = args[0];
      
      // Check if player owns this payload
      const ownedPayloads = gameState.narrativeChoices.filter(choice => choice.startsWith('payload_'));
      
      if (payloadName === 'basic_payload' && !ownedPayloads.includes('payload_basic')) {
        return {
          output: [
            'ERROR: Payload not available',
            'You need to purchase basic_payload first',
            '',
            'Visit shop → tools → buy basic payload (200₵)'
          ],
          success: false,
          soundEffect: 'error'
        };
      }

      if (payloadName === 'payload' || payloadName === 'basic_payload') {
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
            ''
          ],
          success: true,
          soundEffect: 'success'
        };
      }

      return {
        output: [
          `ERROR: Unknown payload "${payloadName}"`,
          'Use: inject basic_payload',
          'Or purchase advanced payloads from shop'
        ],
        success: false,
        soundEffect: 'error'
      };
    }
  },

  spoof: {
    description: "Spoof device identity",
    usage: "spoof <type> --mac <address>",
    unlockLevel: 2,
    execute: (args: string[], gameState: GameState): CommandResult => {
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
      if (!gameState.hydraProtocol.discovered) {
        return {
          output: ['No encrypted data available'],
          success: false
        };
      }

      const key = args[0];
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
    unlockLevel: 3
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
    description: "Launch interactive hacking mini-games",
    usage: "minigame [list|<game_id>]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const { miniGames, initializeMiniGame } = require('./miniGames');
      
      if (args.length === 0 || args[0] === 'list') {
        const gameList = Object.values(miniGames).map((game: any) => 
          `${game.id.padEnd(20)} ${game.difficulty.padEnd(8)} ${game.reward.credits}₵`
        );
        
        return {
          output: [
            '▶ AVAILABLE MINI-GAMES ▶',
            '',
            '┌─ INTERACTIVE HACKING SIMULATIONS ─┐',
            '│ ID                   DIFF     REWARD │',
            '├────────────────────────────────────┤',
            ...gameList.map(line => `│ ${line} │`),
            '└────────────────────────────────────┘',
            '',
            'Usage: minigame <game_id>',
            '',
            '🎮 Pattern Cracking: Match encryption sequences',
            '🎮 Signal Tracing: Navigate network topology',
            '🎮 Binary Tree: Traverse data structures',
            ''
          ],
          success: true
        };
      }

      const gameId = args[0];
      const game = miniGames[gameId];
      
      if (!game) {
        return {
          output: [
            `ERROR: Unknown mini-game '${gameId}'`,
            'Use "minigame list" to see available games'
          ],
          success: false,
          soundEffect: 'error'
        };
      }

      // Initialize the mini-game
      const miniGameState = initializeMiniGame(gameId);
      if (!miniGameState) {
        return {
          output: ['ERROR: Failed to initialize mini-game'],
          success: false,
          soundEffect: 'error'
        };
      }

      // Trigger mini-game interface
      setTimeout(() => {
        const event = new CustomEvent('startMiniGame', {
          detail: { miniGameState }
        });
        window.dispatchEvent(event);
      }, 100);

      return {
        output: [
          `▶ LAUNCHING: ${game.title} ▶`,
          '',
          `Difficulty: ${game.difficulty}`,
          `Time Limit: ${game.timeLimit}s`,
          `Reward: ${game.reward.credits}₵`,
          '',
          game.description,
          '',
          '🎮 Mini-game interface loading...',
          '⚡ Get ready for interactive hacking!'
        ],
        success: true,
        updateGameState: {
          miniGameState
        },
        soundEffect: 'success'
      };
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

      const updatedSkillTree = purchaseSkill(skillId, gameState.skillTree);
      
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
          `Skill points remaining: ${updatedSkillTree.skillPoints}`,
          '',
          '⚡ New abilities unlocked! Check your enhanced capabilities.'
        ],
        success: true,
        updateGameState: {
          skillTree: updatedSkillTree
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
}

// Command availability checker
export function isCommandAvailable(commandName: string, gameState: GameState): boolean {
  const command = commands[commandName];
  if (!command) return false;
  
  if (command.unlockLevel === 0) return true; // Always available
  
  return gameState.hackLevel >= command.unlockLevel;
}

// Get initial unlocked commands
export function getInitialUnlockedCommands(): string[] {
  return Object.keys(commands).filter(cmdName => commands[cmdName].unlockLevel === 0);
}
