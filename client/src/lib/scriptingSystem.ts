import { GameState, PlayerInventory } from '../types/game';
import { isCommandAvailable } from './commands';

const commandRequirements: Record<string, { hardware?: string[]; software?: string[] }> = {
  extended_scan: { hardware: ['wifi_adapter'] },
  iot_hack: { hardware: ['esp32_dev'] },
  usb_attack: { hardware: ['usb_killer'] }
};

export interface Script {
  id: string;
  name: string;
  description: string;
  type: 'conditional' | 'loop' | 'sequence' | 'macro';
  content: ScriptContent;
  variables: Record<string, any>;
  createdAt: number;
  lastRun: number;
  runCount: number;
  success: boolean;
  errors: string[];
}

export interface ScriptContent {
  steps: ScriptStep[];
  conditions?: ScriptCondition[];
  loops?: ScriptLoop[];
}

export interface ScriptStep {
  id: string;
  command: string;
  parameters: string[];
  expectedOutput?: string;
  timeout?: number;
  retries?: number;
  onSuccess?: string; // Next step ID
  onFailure?: string; // Next step ID or action
  variables?: Record<string, string>; // Variable assignments
}

export interface ScriptCondition {
  id: string;
  type: 'if' | 'else_if' | 'else';
  expression: string;
  steps: string[]; // Step IDs to execute
}

export interface ScriptLoop {
  id: string;
  type: 'for' | 'while' | 'foreach';
  condition: string;
  steps: string[]; // Step IDs to execute
  maxIterations?: number;
}

export interface MacroCommand {
  id: string;
  alias: string;
  description: string;
  commands: string[];
  parameters: MacroParameter[];
  createdAt: number;
  useCount: number;
}

export interface MacroParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'ip' | 'port';
  required: boolean;
  defaultValue?: any;
  description: string;
}

export interface ScriptExecution {
  id: string;
  scriptId: string;
  startTime: number;
  endTime?: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  currentStep: string;
  output: ScriptOutput[];
  variables: Record<string, any>;
  errors: string[];
}

export interface ScriptOutput {
  stepId: string;
  command: string;
  output: string;
  success: boolean;
  timestamp: number;
  executionTime: number;
}

export class ScriptingSystem {
  private scripts: Map<string, Script> = new Map();
  private macros: Map<string, MacroCommand> = new Map();
  private executions: Map<string, ScriptExecution> = new Map();
  private builtInFunctions: Map<string, Function> = new Map();

  constructor() {
    this.initializeBuiltInFunctions();
    this.loadDefaultMacros();
  }

  private initializeBuiltInFunctions(): void {
    // Built-in functions for script conditions and expressions
    this.builtInFunctions.set('scan_success', (output: string) => {
      return output.includes('Host is up') || output.includes('open');
    });

    this.builtInFunctions.set('exploit_success', (output: string) => {
      return output.includes('shell') || output.includes('access granted');
    });

    this.builtInFunctions.set('contains', (text: string, search: string) => {
      return text.toLowerCase().includes(search.toLowerCase());
    });

    this.builtInFunctions.set('extract_ip', (text: string) => {
      const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
      const matches = text.match(ipRegex);
      return matches ? matches[0] : null;
    });

    this.builtInFunctions.set('extract_port', (text: string) => {
      const portRegex = /port\s+(\d+)/i;
      const match = text.match(portRegex);
      return match ? parseInt(match[1]) : null;
    });

    this.builtInFunctions.set('wait', (seconds: number) => {
      return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    });
  }

  private loadDefaultMacros(): void {
    const defaultMacros: Omit<MacroCommand, 'id' | 'createdAt' | 'useCount'>[] = [
      {
        alias: 'intrude',
        description: 'Complete intrusion sequence: ping, scan, and exploit',
        commands: ['ping {target}', 'nmap {target}', 'exploit {target}'],
        parameters: [
          {
            name: 'target',
            type: 'ip',
            required: true,
            description: 'Target IP address'
          }
        ]
      },
      {
        alias: 'recon',
        description: 'Reconnaissance sequence: ping, scan ports, and gather info',
        commands: ['ping {target}', 'nmap -sV {target}', 'whois {target}'],
        parameters: [
          {
            name: 'target',
            type: 'ip',
            required: true,
            description: 'Target IP address'
          }
        ]
      },
      {
        alias: 'stealth_scan',
        description: 'Stealthy scanning with delays',
        commands: [
          'ping {target}',
          'wait {delay}',
          'nmap -sS -T2 {target}',
          'wait {delay}',
          'nmap -sV -T1 {target}'
        ],
        parameters: [
          {
            name: 'target',
            type: 'ip',
            required: true,
            description: 'Target IP address'
          },
          {
            name: 'delay',
            type: 'number',
            required: false,
            defaultValue: 5,
            description: 'Delay between commands in seconds'
          }
        ]
      },
      {
        alias: 'cleanup',
        description: 'Clean up traces and logs',
        commands: [
          'clear_logs',
          'cover_tracks',
          'remove_backdoors',
          'clear_history'
        ],
        parameters: []
      },
      {
        alias: 'data_exfil',
        description: 'Data exfiltration sequence',
        commands: [
          'find_data {type}',
          'compress_data',
          'encrypt_data {key}',
          'exfiltrate_data {destination}'
        ],
        parameters: [
          {
            name: 'type',
            type: 'string',
            required: false,
            defaultValue: 'all',
            description: 'Type of data to exfiltrate'
          },
          {
            name: 'key',
            type: 'string',
            required: false,
            defaultValue: 'default',
            description: 'Encryption key'
          },
          {
            name: 'destination',
            type: 'string',
            required: true,
            description: 'Exfiltration destination'
          }
        ]
      }
    ];

    defaultMacros.forEach(macro => {
      const macroCommand: MacroCommand = {
        ...macro,
        id: `macro_${Date.now()}_${Math.random()}`,
        createdAt: Date.now(),
        useCount: 0
      };
      this.macros.set(macro.alias, macroCommand);
    });
  }

  // Create a new script
  createScript(
    name: string,
    description: string,
    type: Script['type'],
    content: ScriptContent
  ): Script {
    const script: Script = {
      id: `script_${Date.now()}`,
      name,
      description,
      type,
      content,
      variables: {},
      createdAt: Date.now(),
      lastRun: 0,
      runCount: 0,
      success: false,
      errors: []
    };

    this.scripts.set(script.id, script);
    return script;
  }

  // Create script from JSON
  createScriptFromJSON(jsonContent: string): Script | null {
    try {
      const scriptData = JSON.parse(jsonContent);
      
      // Validate required fields
      if (!scriptData.name || !scriptData.steps) {
        throw new Error('Script must have name and steps');
      }

      const content: ScriptContent = {
        steps: scriptData.steps.map((step: any, index: number) => ({
          id: step.id || `step_${index}`,
          command: step.command,
          parameters: step.parameters || [],
          expectedOutput: step.expectedOutput,
          timeout: step.timeout || 30000,
          retries: step.retries || 0,
          onSuccess: step.onSuccess,
          onFailure: step.onFailure,
          variables: step.variables || {}
        })),
        conditions: scriptData.conditions || [],
        loops: scriptData.loops || []
      };

      return this.createScript(
        scriptData.name,
        scriptData.description || '',
        scriptData.type || 'sequence',
        content
      );
    } catch (error) {
      console.error('Failed to create script from JSON:', error);
      return null;
    }
  }

  // Create a macro command
  createMacro(
    alias: string,
    description: string,
    commands: string[],
    parameters: MacroParameter[] = []
  ): MacroCommand {
    const macro: MacroCommand = {
      id: `macro_${Date.now()}`,
      alias,
      description,
      commands,
      parameters,
      createdAt: Date.now(),
      useCount: 0
    };

    this.macros.set(alias, macro);
    return macro;
  }

  // Execute a script
  async executeScript(
    scriptId: string,
    variables: Record<string, any> = {},
    commandExecutor: (command: string) => Promise<{ output: string; success: boolean }>
  ): Promise<ScriptExecution> {
    const script = this.scripts.get(scriptId);
    if (!script) {
      throw new Error('Script not found');
    }

    const execution: ScriptExecution = {
      id: `exec_${Date.now()}`,
      scriptId,
      startTime: Date.now(),
      status: 'running',
      currentStep: script.content.steps[0]?.id || '',
      output: [],
      variables: { ...script.variables, ...variables },
      errors: []
    };

    this.executions.set(execution.id, execution);

    try {
      await this.runScriptSteps(script, execution, commandExecutor);
      execution.status = 'completed';
      execution.endTime = Date.now();
      
      script.lastRun = Date.now();
      script.runCount++;
      script.success = true;
    } catch (error) {
      execution.status = 'failed';
      execution.endTime = Date.now();
      execution.errors.push(error instanceof Error ? error.message : String(error));
      
      script.success = false;
      script.errors.push(execution.errors[execution.errors.length - 1]);
    }

    return execution;
  }

  private async runScriptSteps(
    script: Script,
    execution: ScriptExecution,
    commandExecutor: (command: string) => Promise<{ output: string; success: boolean }>
  ): Promise<void> {
    const steps = script.content.steps;
    let currentStepIndex = 0;

    while (currentStepIndex < steps.length && execution.status === 'running') {
      const step = steps[currentStepIndex];
      execution.currentStep = step.id;

      try {
        const result = await this.executeStep(step, execution, commandExecutor);
        
        execution.output.push({
          stepId: step.id,
          command: result.command,
          output: result.output,
          success: result.success,
          timestamp: Date.now(),
          executionTime: result.executionTime
        });

        // Handle step result
        if (result.success) {
          if (step.onSuccess) {
            const nextStepIndex = steps.findIndex(s => s.id === step.onSuccess);
            if (nextStepIndex !== -1) {
              currentStepIndex = nextStepIndex;
              continue;
            }
          }
          currentStepIndex++;
        } else {
          if (step.onFailure) {
            if (step.onFailure === 'stop') {
              throw new Error(`Step ${step.id} failed: ${result.output}`);
            }
            const nextStepIndex = steps.findIndex(s => s.id === step.onFailure);
            if (nextStepIndex !== -1) {
              currentStepIndex = nextStepIndex;
              continue;
            }
          }
          
          // Retry logic
          if (step.retries && step.retries > 0) {
            step.retries--;
            continue; // Retry the same step
          }
          
          throw new Error(`Step ${step.id} failed: ${result.output}`);
        }
      } catch (error) {
        execution.errors.push(`Step ${step.id}: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    }
  }

  private async executeStep(
    step: ScriptStep,
    execution: ScriptExecution,
    commandExecutor: (command: string) => Promise<{ output: string; success: boolean }>
  ): Promise<{
    command: string;
    output: string;
    success: boolean;
    executionTime: number;
  }> {
    const startTime = Date.now();
    
    // Substitute variables in command
    let command = step.command;
    for (const [key, value] of Object.entries(execution.variables)) {
      command = command.replace(new RegExp(`{${key}}`, 'g'), String(value));
    }

    // Add parameters
    if (step.parameters.length > 0) {
      command += ' ' + step.parameters.join(' ');
    }

    // Execute command with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Command timeout')), step.timeout || 30000);
    });

    try {
      const result = await Promise.race([
        commandExecutor(command),
        timeoutPromise
      ]);

      const executionTime = Date.now() - startTime;

      // Update variables from step
      if (step.variables) {
        for (const [key, valueExpression] of Object.entries(step.variables)) {
          execution.variables[key] = this.evaluateExpression(valueExpression, result.output, execution.variables);
        }
      }

      // Check expected output
      if (step.expectedOutput && !result.output.includes(step.expectedOutput)) {
        return {
          command,
          output: result.output,
          success: false,
          executionTime
        };
      }

      return {
        command,
        output: result.output,
        success: result.success,
        executionTime
      };
    } catch (error) {
      return {
        command,
        output: error instanceof Error ? error.message : String(error),
        success: false,
        executionTime: Date.now() - startTime
      };
    }
  }

  // Execute a macro command
  async executeMacro(
    alias: string,
    parameters: Record<string, any> = {},
    commandExecutor: (command: string) => Promise<{ output: string; success: boolean }>
  ): Promise<string[]> {
    const macro = this.macros.get(alias);
    if (!macro) {
      throw new Error(`Macro '${alias}' not found`);
    }

    // Validate required parameters
    for (const param of macro.parameters) {
      if (param.required && !(param.name in parameters)) {
        throw new Error(`Required parameter '${param.name}' missing for macro '${alias}'`);
      }
      if (!(param.name in parameters) && param.defaultValue !== undefined) {
        parameters[param.name] = param.defaultValue;
      }
    }

    const results: string[] = [];
    macro.useCount++;

    for (const commandTemplate of macro.commands) {
      let command = commandTemplate;
      
      // Substitute parameters
      for (const [key, value] of Object.entries(parameters)) {
        command = command.replace(new RegExp(`{${key}}`, 'g'), String(value));
      }

      try {
        const result = await commandExecutor(command);
        results.push(`${command}: ${result.output}`);
        
        if (!result.success) {
          throw new Error(`Macro command failed: ${command}`);
        }
      } catch (error) {
        results.push(`${command}: ERROR - ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    }

    return results;
  }

  // Evaluate expressions in scripts
  private evaluateExpression(expression: string, output: string, variables: Record<string, any>): any {
    try {
      // Simple expression evaluation
      // Replace variables
      let expr = expression;
      for (const [key, value] of Object.entries(variables)) {
        expr = expr.replace(new RegExp(`\\$${key}`, 'g'), JSON.stringify(value));
      }

      // Replace built-in functions
      for (const [funcName, func] of Array.from(this.builtInFunctions.entries())) {
        const funcRegex = new RegExp(`${funcName}\\(([^)]+)\\)`, 'g');
        expr = expr.replace(funcRegex, (match, args) => {
          try {
            const argValues = args.split(',').map((arg: string) => {
              arg = arg.trim();
              if (arg === 'output') return output;
              if (arg.startsWith('"') && arg.endsWith('"')) return arg.slice(1, -1);
              return JSON.parse(arg);
            });
            const result = func(...argValues);
            return JSON.stringify(result);
          } catch {
            return 'false';
          }
        });
      }

      // Safe evaluation (limited to basic operations)
      return Function(`"use strict"; return (${expr})`)();
    } catch {
      return false;
    }
  }

  // Get script by ID
  getScript(scriptId: string): Script | undefined {
    return this.scripts.get(scriptId);
  }

  // Get macro by alias
  getMacro(alias: string): MacroCommand | undefined {
    return this.macros.get(alias);
  }

  // Get all scripts
  getAllScripts(): Script[] {
    return Array.from(this.scripts.values());
  }

  // Get all macros
  getAllMacros(): MacroCommand[] {
    return Array.from(this.macros.values());
  }

  // Get execution by ID
  getExecution(executionId: string): ScriptExecution | undefined {
    return this.executions.get(executionId);
  }

  // Cancel script execution
  cancelExecution(executionId: string): boolean {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === 'running') {
      execution.status = 'cancelled';
      execution.endTime = Date.now();
      return true;
    }
    return false;
  }

  // Delete script
  deleteScript(scriptId: string): boolean {
    return this.scripts.delete(scriptId);
  }

  // Delete macro
  deleteMacro(alias: string): boolean {
    return this.macros.delete(alias);
  }

  // Export script to JSON
  exportScript(scriptId: string): string | null {
    const script = this.scripts.get(scriptId);
    if (!script) return null;

    return JSON.stringify({
      name: script.name,
      description: script.description,
      type: script.type,
      steps: script.content.steps,
      conditions: script.content.conditions,
      loops: script.content.loops
    }, null, 2);
  }

  validateScriptForGameState(script: Script, gameState: GameState): string[] {
    const errors: string[] = [];
    const inv: PlayerInventory = gameState.inventory || { hardware: [], software: [], payloads: [], intel: [] };

    for (const step of script.content.steps) {
      const macro = this.parseMacroCommand(step.command);
      const commandsToCheck = macro ? (this.macros.get(macro.alias)?.commands || []) : [step.command];
      for (const cmd of commandsToCheck) {
        const cmdName = cmd.split(' ')[0];
        if (!isCommandAvailable(cmdName, gameState)) {
          errors.push(`Step ${step.id} requires command '${cmdName}' which is not unlocked.`);
        }
        const req = commandRequirements[cmdName];
        if (req) {
          if (req.hardware) {
            for (const h of req.hardware) {
              if (!inv.hardware.includes(h)) {
                errors.push(`Hardware '${h}' required for command '${cmdName}'.`);
              }
            }
          }
          if (req.software) {
            for (const s of req.software) {
              if (!inv.software.includes(s)) {
                errors.push(`Software '${s}' required for command '${cmdName}'.`);
              }
            }
          }
        }
      }
    }

    return Array.from(new Set(errors));
  }

  // Check if command is a macro
  isMacro(command: string): boolean {
    const alias = command.split(' ')[0];
    return this.macros.has(alias);
  }

  // Parse macro parameters from command
  parseMacroCommand(command: string): { alias: string; parameters: Record<string, any> } | null {
    const parts = command.split(' ');
    const alias = parts[0];
    const macro = this.macros.get(alias);
    
    if (!macro) return null;

    const parameters: Record<string, any> = {};
    const args = parts.slice(1);

    // Simple parameter parsing (positional)
    macro.parameters.forEach((param, index) => {
      if (index < args.length) {
        let value: any = args[index];
        
        // Type conversion
        switch (param.type) {
          case 'number':
            value = parseFloat(value);
            break;
          case 'boolean':
            value = value.toLowerCase() === 'true';
            break;
          case 'ip':
            // Validate IP format
            if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(value)) {
              throw new Error(`Invalid IP address: ${value}`);
            }
            break;
          case 'port':
            value = parseInt(value);
            if (value < 1 || value > 65535) {
              throw new Error(`Invalid port number: ${value}`);
            }
            break;
        }
        
        parameters[param.name] = value;
      } else if (param.defaultValue !== undefined) {
        parameters[param.name] = param.defaultValue;
      }
    });

    return { alias, parameters };
  }
}

// Export singleton instance
export const scriptingSystem = new ScriptingSystem(); 