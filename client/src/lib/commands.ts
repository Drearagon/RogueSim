import { Command, CommandResult, GameState, Network, Device } from '../types/game';

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
      return {
        output: [
          '┌─ SYSTEM STATUS ─┐',
          `│ ESP32: ONLINE    │`,
          `│ WiFi: ${gameState.networkStatus.substring(0, 10).padEnd(10)} │`,
          `│ Credits: ${gameState.credits.toString().padEnd(7)} │`,
          `│ Rep: ${gameState.reputation.substring(0, 10).padEnd(10)} │`,
          `│ Missions: ${gameState.completedMissions}/∞    │`,
          '└─────────────────┘',
          ''
        ],
        success: true
      };
    }
  },

  inject: {
    description: "Inject payload into target",
    usage: "inject <payload> [--target <id>]",
    unlockLevel: 2,
    execute: (args: string[], gameState: GameState): CommandResult => {
      if (args.length === 0) {
        return {
          output: ['ERROR: Payload required', 'Usage: inject <payload>', ''],
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
      
      return {
        output: [
          '▶ Loading payload...',
          '▶ Encrypting transmission...',
          '▶ Establishing backdoor...',
          '▶ Injecting payload...',
          '',
          '✓ Payload deployed successfully',
          '✓ Remote access established',
          '⚠ Maintain low profile',
          ''
        ],
        success: true,
        soundEffect: 'success'
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

  decrypt: {
    description: "Decrypt captured data",
    usage: "decrypt --key <key>",
    unlockLevel: 3,
    execute: (args: string[], gameState: GameState): CommandResult => {
      return {
        output: [
          '▶ Analyzing encryption algorithm...',
          '▶ Brute forcing key space...',
          '▶ Applying quantum algorithms...',
          '',
          '████████████████████ 100%',
          '',
          '✓ Decryption successful',
          '✓ Data extracted: classified_docs.zip',
          '✓ Mission objective completed',
          ''
        ],
        success: true,
        updateGameState: {
          credits: gameState.credits + 500,
          missionProgress: Math.min(gameState.missionProgress + 25, 100)
        },
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
  }
};
