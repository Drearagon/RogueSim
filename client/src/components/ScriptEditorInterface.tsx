import React, { useState, useEffect } from 'react';
import { X, Play, Save, FileText, Terminal, Settings, Plus, Trash2, Copy } from 'lucide-react';
import { scriptingSystem, Script, MacroCommand, ScriptExecution } from '@/lib/scriptingSystem';

interface ScriptEditorInterfaceProps {
  onClose: () => void;
}

export function ScriptEditorInterface({ onClose }: ScriptEditorInterfaceProps) {
  const [activeTab, setActiveTab] = useState<'scripts' | 'macros' | 'executions'>('scripts');
  const [scripts, setScripts] = useState<Script[]>([]);
  const [macros, setMacros] = useState<MacroCommand[]>([]);
  const [executions, setExecutions] = useState<ScriptExecution[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [selectedMacro, setSelectedMacro] = useState<MacroCommand | null>(null);
  const [showCreateScript, setShowCreateScript] = useState(false);
  const [showCreateMacro, setShowCreateMacro] = useState(false);
  const [scriptContent, setScriptContent] = useState('');
  const [macroCommands, setMacroCommands] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setScripts(scriptingSystem.getAllScripts());
    setMacros(scriptingSystem.getAllMacros());
    // Note: In a real implementation, you'd load executions from storage
  };

  const handleCreateScript = () => {
    try {
      const content = JSON.parse(scriptContent);
      const script = scriptingSystem.createScript(
        `Script_${Date.now()}`,
        'User created script',
        'sequence',
        content
      );
      setScripts(prev => [...prev, script]);
      setSelectedScript(script);
      setShowCreateScript(false);
      setScriptContent('');
    } catch (error) {
      alert('Invalid JSON format');
    }
  };

  const handleCreateMacro = () => {
    const commands = macroCommands.split('\n').filter(cmd => cmd.trim());
    const macro = scriptingSystem.createMacro(
      `macro_${Date.now()}`,
      'User created macro',
      commands
    );
    setMacros(prev => [...prev, macro]);
    setSelectedMacro(macro);
    setShowCreateMacro(false);
    setMacroCommands('');
  };

  const handleExecuteScript = async (script: Script) => {
    try {
      // Mock command executor for demo
      const mockExecutor = async (command: string) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
          output: `Executed: ${command}`,
          success: Math.random() > 0.2
        };
      };

      const execution = await scriptingSystem.executeScript(script.id, {}, mockExecutor);
      setExecutions(prev => [...prev, execution]);
      setActiveTab('executions');
    } catch (error) {
      alert(`Execution failed: ${error}`);
    }
  };

  const handleExecuteMacro = async (macro: MacroCommand) => {
    try {
      // Mock command executor for demo
      const mockExecutor = async (command: string) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
          output: `Executed: ${command}`,
          success: Math.random() > 0.2
        };
      };

      const results = await scriptingSystem.executeMacro(macro.alias, {}, mockExecutor);
      alert(`Macro executed successfully:\n${results.join('\n')}`);
    } catch (error) {
      alert(`Macro execution failed: ${error}`);
    }
  };

  const defaultScriptTemplate = {
    steps: [
      {
        id: "step1",
        command: "scan",
        parameters: ["wifi"],
        timeout: 5000,
        onSuccess: "step2",
        onFailure: "end"
      },
      {
        id: "step2",
        command: "connect",
        parameters: ["TARGET_NET"],
        timeout: 10000,
        onSuccess: "step3",
        onFailure: "end"
      },
      {
        id: "step3",
        command: "exploit",
        parameters: ["--auto"],
        timeout: 15000
      }
    ]
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-green-500/30 rounded-lg w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-green-500/30">
          <div className="flex items-center gap-3">
            <Terminal className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold text-green-400">Script Editor</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-green-500/30">
          {[
            { id: 'scripts', label: 'Scripts', icon: FileText },
            { id: 'macros', label: 'Macros', icon: Settings },
            { id: 'executions', label: 'Executions', icon: Play }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 transition-colors ${
                activeTab === tab.id
                  ? 'text-green-400 border-b-2 border-green-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Scripts Tab */}
          {activeTab === 'scripts' && (
            <>
              {/* Scripts List */}
              <div className="w-80 border-r border-green-500/30 p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-green-400">Scripts</h3>
                  <button
                    onClick={() => setShowCreateScript(true)}
                    className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {showCreateScript && (
                  <div className="mb-4 p-3 bg-gray-800 rounded border border-green-500/30">
                    <h4 className="text-sm font-semibold text-green-400 mb-2">Create Script</h4>
                    <textarea
                      value={scriptContent}
                      onChange={(e) => setScriptContent(e.target.value)}
                      placeholder={JSON.stringify(defaultScriptTemplate, null, 2)}
                      className="w-full h-32 bg-gray-700 text-white p-2 rounded text-xs font-mono"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleCreateScript}
                        className="px-2 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors text-sm"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => setShowCreateScript(false)}
                        className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded hover:bg-gray-600/30 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {scripts.map(script => (
                    <div
                      key={script.id}
                      className={`p-3 rounded border cursor-pointer transition-colors ${
                        selectedScript?.id === script.id
                          ? 'border-green-400 bg-green-500/10'
                          : 'border-gray-600 hover:border-green-500/50'
                      }`}
                      onClick={() => setSelectedScript(script)}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-white">{script.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          script.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {script.type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {script.description}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Runs: {script.runCount} • Steps: {script.content.steps.length}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExecuteScript(script);
                        }}
                        className="w-full mt-2 px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        Execute
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Script Details */}
              <div className="flex-1 p-4 overflow-auto">
                {selectedScript ? (
                  <div>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-green-400">{selectedScript.name}</h3>
                      <p className="text-gray-400">{selectedScript.description}</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-white mb-2">Script Steps</h4>
                        <div className="space-y-2">
                          {selectedScript.content.steps.map((step, index) => (
                            <div key={step.id} className="p-3 bg-gray-800 rounded border border-gray-600">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-green-400 font-mono">#{index + 1}</span>
                                <span className="text-white font-semibold">{step.command}</span>
                                <span className="text-gray-400">{step.parameters.join(' ')}</span>
                              </div>
                              <div className="text-sm text-gray-400">
                                Timeout: {step.timeout}ms
                                {step.onSuccess && ` • Success: ${step.onSuccess}`}
                                {step.onFailure && ` • Failure: ${step.onFailure}`}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {selectedScript.content.conditions && selectedScript.content.conditions.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-white mb-2">Conditions</h4>
                          <div className="space-y-2">
                            {selectedScript.content.conditions.map(condition => (
                              <div key={condition.id} className="p-3 bg-gray-800 rounded border border-gray-600">
                                <div className="text-yellow-400">{condition.type}: {condition.expression}</div>
                                <div className="text-sm text-gray-400">Steps: {condition.steps.join(', ')}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedScript.errors.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-red-400 mb-2">Errors</h4>
                          <div className="space-y-1">
                            {selectedScript.errors.map((error, index) => (
                              <div key={index} className="text-red-400 text-sm bg-red-500/10 p-2 rounded">
                                {error}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    Select a script to view details
                  </div>
                )}
              </div>
            </>
          )}

          {/* Macros Tab */}
          {activeTab === 'macros' && (
            <>
              {/* Macros List */}
              <div className="w-80 border-r border-green-500/30 p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-green-400">Macros</h3>
                  <button
                    onClick={() => setShowCreateMacro(true)}
                    className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {showCreateMacro && (
                  <div className="mb-4 p-3 bg-gray-800 rounded border border-green-500/30">
                    <h4 className="text-sm font-semibold text-green-400 mb-2">Create Macro</h4>
                    <textarea
                      value={macroCommands}
                      onChange={(e) => setMacroCommands(e.target.value)}
                      placeholder="scan wifi&#10;connect TARGET_NET&#10;exploit --auto"
                      className="w-full h-24 bg-gray-700 text-white p-2 rounded text-sm font-mono"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleCreateMacro}
                        className="px-2 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors text-sm"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => setShowCreateMacro(false)}
                        className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded hover:bg-gray-600/30 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {macros.map(macro => (
                    <div
                      key={macro.id}
                      className={`p-3 rounded border cursor-pointer transition-colors ${
                        selectedMacro?.id === macro.id
                          ? 'border-green-400 bg-green-500/10'
                          : 'border-gray-600 hover:border-green-500/50'
                      }`}
                      onClick={() => setSelectedMacro(macro)}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-white">{macro.alias}</h4>
                        <span className="text-xs text-gray-400">
                          {macro.commands.length} cmds
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {macro.description}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Used: {macro.useCount} times
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExecuteMacro(macro);
                        }}
                        className="w-full mt-2 px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        Execute
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Macro Details */}
              <div className="flex-1 p-4 overflow-auto">
                {selectedMacro ? (
                  <div>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-green-400">{selectedMacro.alias}</h3>
                      <p className="text-gray-400">{selectedMacro.description}</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-white mb-2">Commands</h4>
                        <div className="space-y-1">
                          {selectedMacro.commands.map((command, index) => (
                            <div key={index} className="p-2 bg-gray-800 rounded font-mono text-sm">
                              <span className="text-green-400">#{index + 1}</span> {command}
                            </div>
                          ))}
                        </div>
                      </div>

                      {selectedMacro.parameters.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-white mb-2">Parameters</h4>
                          <div className="space-y-2">
                            {selectedMacro.parameters.map(param => (
                              <div key={param.name} className="p-3 bg-gray-800 rounded border border-gray-600">
                                <div className="flex items-center gap-2">
                                  <span className="text-blue-400">{param.name}</span>
                                  <span className="text-xs text-gray-400">({param.type})</span>
                                  {param.required && <span className="text-red-400 text-xs">required</span>}
                                </div>
                                <div className="text-sm text-gray-400 mt-1">{param.description}</div>
                                {param.defaultValue && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Default: {param.defaultValue}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-semibold text-white mb-2">Usage</h4>
                        <div className="p-3 bg-gray-800 rounded font-mono text-sm text-green-400">
                          {selectedMacro.alias}
                          {selectedMacro.parameters.map(param => (
                            <span key={param.name} className="text-blue-400">
                              {param.required ? ` <${param.name}>` : ` [${param.name}]`}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    Select a macro to view details
                  </div>
                )}
              </div>
            </>
          )}

          {/* Executions Tab */}
          {activeTab === 'executions' && (
            <div className="flex-1 p-4 overflow-auto">
              <h3 className="text-lg font-semibold text-green-400 mb-4">Script Executions</h3>
              
              {executions.length > 0 ? (
                <div className="space-y-4">
                  {executions.map(execution => (
                    <div key={execution.id} className="p-4 bg-gray-800 rounded border border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">Execution {execution.id}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          execution.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          execution.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          execution.status === 'running' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {execution.status}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-400 mb-3">
                        Started: {new Date(execution.startTime).toLocaleString()}
                        {execution.endTime && (
                          <> • Duration: {Math.round((execution.endTime - execution.startTime) / 1000)}s</>
                        )}
                      </div>

                      {execution.output.length > 0 && (
                        <div>
                          <h5 className="font-semibold text-white mb-2">Output</h5>
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {execution.output.map((output, index) => (
                              <div key={index} className="text-xs font-mono p-2 bg-gray-900 rounded">
                                <span className={output.success ? 'text-green-400' : 'text-red-400'}>
                                  [{output.stepId}]
                                </span> {output.command}: {output.output}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {execution.errors.length > 0 && (
                        <div className="mt-3">
                          <h5 className="font-semibold text-red-400 mb-2">Errors</h5>
                          <div className="space-y-1">
                            {execution.errors.map((error, index) => (
                              <div key={index} className="text-red-400 text-sm bg-red-500/10 p-2 rounded">
                                {error}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No executions yet. Run a script to see results here.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 