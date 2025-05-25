import { Command, CommandResult, GameState, Network, Device } from '../types/game';
import { 
  getNextNarrativeEvent, 
  formatNarrativeEvent, 
  processNarrativeChoice, 
  generateEncryptedMessage,
  narrativeEvents 
} from './narrativeSystem';
import { checkEasterEgg, discoverEasterEgg, getEasterEggHints, getEasterEggStats, loadDiscoveredEasterEggs, EasterEgg } from './easterEggs';

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
  easter: {
    description: "View discovered easter eggs and hints",
    usage: "easter [hints]",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const stats = getEasterEggStats();
      const discovered = [];
      
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
      
      const discoveredEggs = [];
      
      const output = [
        '╔══════════════════════════════════════╗',
        '║          DISCOVERED EASTER EGGS      ║',
        '╠══════════════════════════════════════╣',
        ''
      ];
      
      if (discoveredEggs.length === 0) {
        output.push('║ No easter eggs discovered yet...     ║');
        output.push('║ Try exploring hidden commands!       ║');
      } else {
        discoveredEggs.forEach(egg => {
          const rarityColors = {
            'common': '🟢',
            'rare': '🔵', 
            'epic': '🟣',
            'legendary': '🟡'
          };
          output.push(`║ ${rarityColors[egg.rarity]} ${egg.name.padEnd(32)} ║`);
        });
      }
      
      output.push('║                                      ║');
      output.push(`║ Progress: ${stats.discovered}/${stats.total} discovered              ║`);
      output.push('║                                      ║');
      output.push('║ Use "easter hints" for clues!        ║');
      output.push('╚══════════════════════════════════════╝');
      output.push('');
      
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
            '',
            '+100 credits earned'
          ],
          success: true,
          updateGameState: {
            credits: gameState.credits + 100
          },
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
    description: "Make narrative choice",
    usage: "choose <number>",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const choiceNum = parseInt(args[0]);
      if (!choiceNum) {
        return {
          output: ['Usage: choose <number>'],
          success: false
        };
      }

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
          ...choice.consequences.map(c => `│ ${c.substring(0, 15).padEnd(15)} │`),
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
        updateGameState: {
          credits: gameState.credits + 50
        }
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
      const success = Math.random() > 0.3;
      const credits = success ? Math.floor(Math.random() * 500) + 200 : 0;

      if (success) {
        return {
          output: [
            `▶ Targeting ${target}...`,
            '▶ Payload delivered',
            '▶ Exploiting vulnerability...',
            '',
            '✓ Shell access gained!',
            '✓ Privilege escalation complete',
            '',
            `+${credits} credits earned`
          ],
          success: true,
          updateGameState: {
            credits: gameState.credits + credits,
            completedMissions: gameState.completedMissions + 1
          },
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
            '⚠ Target may have detected intrusion'
          ],
          success: false,
          updateGameState: {
            suspicionLevel: gameState.suspicionLevel + 10
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
          '+300 credits earned'
        ],
        success: true,
        updateGameState: {
          credits: gameState.credits + 300,
          completedMissions: gameState.completedMissions + 1
        },
        soundEffect: 'success'
      };
    },
    unlockLevel: 3
  },

  // Shop Interface - Always available
  shop: {
    description: "Open shop interface",
    usage: "shop",
    execute: (args: string[], gameState: GameState): CommandResult => {
      // Direct trigger without complex state updates
      setTimeout(() => {
        const event = new CustomEvent('openShop');
        window.dispatchEvent(event);
      }, 100);

      return {
        output: [
          '▶ Accessing shop interface...',
          '▶ Loading available items...',
          '',
          '✓ Shop interface opened',
          '',
          `Credits: ${gameState.credits}₵`,
          `Skill Points: ${gameState.skillTree?.skillPoints || 0}`,
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
        return {
          output: [
            `▶ Cracking ${ssid}...`,
            '▶ Dictionary attack in progress...',
            '▶ Trying common passwords...',
            '',
            '✓ Password cracked!',
            `✓ Password: ${password}`,
            '',
            '+200 credits earned'
          ],
          success: true,
          updateGameState: {
            credits: gameState.credits + 200
          },
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
          '+150 credits earned'
        ],
        success: true,
        updateGameState: {
          credits: gameState.credits + 150
        },
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
      
      if (subcommand === 'complete') {
        // Check if all steps are completed
        const allCompleted = currentMission.steps.every(step => step.completed);
        
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
              currentMission: gameState.currentMission + 1
            },
            soundEffect: 'success'
          };
        } else {
          const remaining = currentMission.steps.filter(step => !step.completed);
          return {
            output: [
              'Mission not yet complete',
              '',
              'Remaining steps:',
              ...remaining.map(step => `• ${step.description}`)
            ],
            success: false
          };
        }
      }

      return {
        output: [
          `┌─ ${currentMission.title} ─┐`,
          `│ ${currentMission.objective.substring(0, 22).padEnd(22)} │`,
          '├─────────────────────────┤',
          '│ MISSION STEPS:          │',
          ...currentMission.steps.map(step => 
            `│ ${step.completed ? '✓' : '○'} ${step.description.substring(0, 20).padEnd(20)} │`
          ),
          '├─────────────────────────┤',
          `│ Reward: ${currentMission.reward}₵         │`,
          `│ Difficulty: ${currentMission.difficulty.padEnd(8)} │`,
          '└─────────────────────────┘',
          '',
          'INTEL:',
          ...currentMission.intel,
          '',
          'Use "mission complete" when done'
        ],
        success: true
      };
    },
    unlockLevel: 1
  },

  // Skill Tree Command
  skills: {
    description: "Open skill tree interface",
    usage: "skills",
    execute: (args: string[], gameState: GameState): CommandResult => {
      return {
        output: [
          '▶ Accessing skill tree interface...',
          '▶ Loading available upgrades...',
          '',
          '✓ Skill tree opened',
          '',
          `Available Skill Points: ${gameState.skillTree.skillPoints}`,
          'Use the interface to purchase new abilities'
        ],
        success: true,
        updateGameState: {
          // This will trigger the skill tree UI to open
          narrativeChoices: [...gameState.narrativeChoices, 'open_skills_interface']
        }
      };
    }
  },

  // Mission completion tracker
  complete: {
    description: "Complete current mission",
    usage: "complete",
    execute: (args: string[], gameState: GameState): CommandResult => {
      const { getCurrentMission } = require('./missions');
      const currentMission = getCurrentMission(gameState);
      
      if (!currentMission) {
        return {
          output: ['No active mission to complete'],
          success: false
        };
      }

      // Simple completion check - if you've run the basic commands, mark mission complete
      const hasScanned = gameState.unlockedCommands.includes('scan');
      const hasConnected = gameState.networkStatus === 'CONNECTED';
      const hasInjected = gameState.unlockedCommands.includes('inject');
      
      if (hasScanned && hasConnected && hasInjected) {
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
            skillTree: {
              ...gameState.skillTree,
              skillPoints: gameState.skillTree.skillPoints + 1
            }
          },
          soundEffect: 'success'
        };
      } else {
        return {
          output: [
            'Mission not yet complete',
            '',
            'Required steps:',
            `${hasScanned ? '✓' : '○'} Run scan command`,
            `${hasConnected ? '✓' : '○'} Connect to network`,
            `${hasInjected ? '✓' : '○'} Execute injection`,
            '',
            'Complete all steps then try again'
          ],
          success: false
        };
      }
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
    description: "Activate developer account (max level, infinite credits)",
    usage: "devmode",
    execute: (args: string[], gameState: GameState): CommandResult => {
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
          "Type 'multiplayer' to test room features",
          "Type 'leaderboard' to view rankings",
          "Type 'profile' to customize your account"
        ],
        updateGameState: {
          credits: 999999999,
          playerLevel: 100,
          completedMissions: 250,
          unlockedCommands: [
            'help', 'scan', 'connect', 'inject', 'deauth', 'crack', 'exploit', 'backdoor',
            'decrypt', 'nmap', 'keylog', 'shop', 'skills', 'mission', 'complete',
            'hydra', 'choose', 'multiplayer', 'leaderboard', 'devmode', 'profile', 'login'
          ],
          reputation: 'ELITE'
        },
        soundEffect: 'success'
      };
    },
    unlockLevel: 0 // Always available
  },


};
