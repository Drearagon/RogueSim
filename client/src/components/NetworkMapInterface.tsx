import React, { useState, useEffect } from 'react';
import { X, Wifi, Shield, Database, Server, Monitor, Router, AlertTriangle, Eye, Zap } from 'lucide-react';
import { dynamicNetworkSystem, NetworkMap, NetworkNode, HackingSession } from '@/lib/dynamicNetworkSystem';

interface NetworkMapInterfaceProps {
  onClose: () => void;
}

export function NetworkMapInterface({ onClose }: NetworkMapInterfaceProps) {
  const [networks, setNetworks] = useState<NetworkMap[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkMap | null>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [activeSession, setActiveSession] = useState<HackingSession | null>(null);
  const [showCreateNetwork, setShowCreateNetwork] = useState(false);

  useEffect(() => {
    // Load existing networks
    const existingNetworks = dynamicNetworkSystem.getAllNetworks();
    setNetworks(existingNetworks);
    
    if (existingNetworks.length === 0) {
      // Generate a sample network if none exist
      const sampleNetwork = dynamicNetworkSystem.generateNetwork('medium', 8);
      setNetworks([sampleNetwork]);
      setSelectedNetwork(sampleNetwork);
    } else {
      setSelectedNetwork(existingNetworks[0]);
    }
  }, []);

  const handleGenerateNetwork = (difficulty: 'easy' | 'medium' | 'hard' | 'expert', size: number) => {
    const newNetwork = dynamicNetworkSystem.generateNetwork(difficulty, size);
    setNetworks(prev => [...prev, newNetwork]);
    setSelectedNetwork(newNetwork);
    setShowCreateNetwork(false);
  };

  const handleStartSession = (networkId: string) => {
    const session = dynamicNetworkSystem.startSession(networkId, 'player');
    setActiveSession(session);
  };

  const handleNodeClick = (node: NetworkNode) => {
    setSelectedNode(node);
  };

  const getNodeIcon = (type: NetworkNode['type']) => {
    switch (type) {
      case 'server': return <Server className="w-4 h-4" />;
      case 'workstation': return <Monitor className="w-4 h-4" />;
      case 'router': return <Router className="w-4 h-4" />;
      case 'firewall': return <Shield className="w-4 h-4" />;
      case 'database': return <Database className="w-4 h-4" />;
      case 'admin_panel': return <Zap className="w-4 h-4" />;
      case 'honeypot': return <Eye className="w-4 h-4" />;
      default: return <Wifi className="w-4 h-4" />;
    }
  };

  const getNodeColor = (node: NetworkNode) => {
    if (node.type === 'honeypot') return 'text-red-400 border-red-400';
    if (node.compromised) return 'text-green-400 border-green-400';
    if (node.alertLevel > 50) return 'text-yellow-400 border-yellow-400';
    return 'text-blue-400 border-blue-400';
  };

  const getSecurityLevel = (node: NetworkNode) => {
    const total = node.security.encryption + node.security.monitoring + (node.security.firewall ? 20 : 0) + (node.security.ids ? 20 : 0);
    return Math.min(100, total / 1.6);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-green-500/30 rounded-lg w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-green-500/30">
          <div className="flex items-center gap-3">
            <Wifi className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold text-green-400">Network Map</h2>
            {activeSession && (
              <div className="text-sm text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                Session Active - Risk: {activeSession.tracebackRisk}%
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Network List Sidebar */}
          <div className="w-80 border-r border-green-500/30 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-400">Networks</h3>
              <button
                onClick={() => setShowCreateNetwork(true)}
                className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors text-sm"
              >
                Generate
              </button>
            </div>

            {showCreateNetwork && (
              <div className="mb-4 p-3 bg-gray-800 rounded border border-green-500/30">
                <h4 className="text-sm font-semibold text-green-400 mb-2">Generate Network</h4>
                <div className="space-y-2">
                  {(['easy', 'medium', 'hard', 'expert'] as const).map(difficulty => (
                    <button
                      key={difficulty}
                      onClick={() => handleGenerateNetwork(difficulty, 6 + Math.floor(Math.random() * 8))}
                      className="w-full px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors text-sm capitalize"
                    >
                      {difficulty} Network
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowCreateNetwork(false)}
                  className="w-full mt-2 px-2 py-1 bg-gray-600/20 text-gray-400 rounded hover:bg-gray-600/30 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="space-y-2">
              {networks.map(network => (
                <div
                  key={network.id}
                  className={`p-3 rounded border cursor-pointer transition-colors ${
                    selectedNetwork?.id === network.id
                      ? 'border-green-400 bg-green-500/10'
                      : 'border-gray-600 hover:border-green-500/50'
                  }`}
                  onClick={() => setSelectedNetwork(network)}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white">{network.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      network.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                      network.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      network.difficulty === 'hard' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {network.difficulty}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {Object.keys(network.nodes).length} nodes • Alert: {network.globalAlertLevel}%
                  </div>
                  {!activeSession && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartSession(network.id);
                      }}
                      className="w-full mt-2 px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors text-sm"
                    >
                      Start Session
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Network Visualization */}
          <div className="flex-1 p-4 overflow-auto">
            {selectedNetwork ? (
              <div className="relative">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-green-400">{selectedNetwork.name}</h3>
                  <div className="text-sm text-gray-400">
                    Difficulty: {selectedNetwork.difficulty} • Global Alert: {selectedNetwork.globalAlertLevel}%
                  </div>
                </div>

                {/* Network Nodes Grid */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {Object.values(selectedNetwork.nodes).map(node => (
                    <div
                      key={node.id}
                      className={`p-3 rounded border cursor-pointer transition-all hover:scale-105 ${getNodeColor(node)} ${
                        selectedNode?.id === node.id ? 'ring-2 ring-green-400' : ''
                      }`}
                      onClick={() => handleNodeClick(node)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {getNodeIcon(node.type)}
                        <span className="font-semibold text-sm">{node.name}</span>
                      </div>
                      <div className="text-xs space-y-1">
                        <div>IP: {node.ip}</div>
                        <div>Type: {node.type}</div>
                        <div>Security: {Math.round(getSecurityLevel(node))}%</div>
                        {node.compromised && <div className="text-green-400">COMPROMISED</div>}
                        {node.alertLevel > 0 && (
                          <div className="text-yellow-400">Alert: {node.alertLevel}%</div>
                        )}
                        {node.backdoors.length > 0 && (
                          <div className="text-purple-400">{node.backdoors.length} backdoors</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subnets */}
                {selectedNetwork.subnets.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-md font-semibold text-green-400 mb-2">Subnets</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedNetwork.subnets.map(subnet => (
                        <div key={subnet.id} className="p-3 bg-gray-800 rounded border border-gray-600">
                          <div className="font-semibold text-white">{subnet.name}</div>
                          <div className="text-sm text-gray-400">CIDR: {subnet.cidr}</div>
                          <div className="text-sm text-gray-400">Nodes: {subnet.nodeIds.length}</div>
                          {subnet.isolated && (
                            <div className="text-xs text-red-400 mt-1">ISOLATED</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Select a network to view details
              </div>
            )}
          </div>

          {/* Node Details Sidebar */}
          {selectedNode && (
            <div className="w-80 border-l border-green-500/30 p-4 overflow-y-auto">
              <div className="flex items-center gap-2 mb-4">
                {getNodeIcon(selectedNode.type)}
                <h3 className="text-lg font-semibold text-green-400">{selectedNode.name}</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Basic Info</h4>
                  <div className="text-sm space-y-1 text-gray-300">
                    <div>IP: {selectedNode.ip}</div>
                    <div>Type: {selectedNode.type}</div>
                    <div>Status: {selectedNode.compromised ? 'Compromised' : 'Secure'}</div>
                    <div>Alert Level: {selectedNode.alertLevel}%</div>
                    <div>Patch Level: {selectedNode.patchLevel}%</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">Security</h4>
                  <div className="text-sm space-y-1 text-gray-300">
                    <div>Encryption: {selectedNode.security.encryption}%</div>
                    <div>Monitoring: {selectedNode.security.monitoring}%</div>
                    <div>Authentication: {selectedNode.security.authentication}</div>
                    <div>Firewall: {selectedNode.security.firewall ? 'Yes' : 'No'}</div>
                    <div>IDS: {selectedNode.security.ids ? 'Yes' : 'No'}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">Open Ports</h4>
                  <div className="space-y-2">
                    {selectedNode.ports.filter(p => p.status === 'open').map(port => (
                      <div key={port.number} className="text-sm p-2 bg-gray-800 rounded">
                        <div className="text-white">{port.number}/{port.service}</div>
                        {port.banner && <div className="text-gray-400 text-xs">{port.banner}</div>}
                        {port.vulnerability && (
                          <div className="text-red-400 text-xs mt-1">
                            <AlertTriangle className="w-3 h-3 inline mr-1" />
                            {port.vulnerability.type} ({port.vulnerability.severity})
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedNode.backdoors.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-white mb-2">Backdoors</h4>
                    <div className="space-y-2">
                      {selectedNode.backdoors.map(backdoor => (
                        <div key={backdoor.id} className="text-sm p-2 bg-purple-900/20 rounded border border-purple-500/30">
                          <div className="text-purple-400">{backdoor.type}</div>
                          <div className="text-xs text-gray-400">
                            Risk: {backdoor.discoveryRisk}% • {backdoor.active ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedNode.data.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-white mb-2">Data</h4>
                    <div className="space-y-2">
                      {selectedNode.data.slice(0, 3).map(data => (
                        <div key={data.id} className="text-sm p-2 bg-gray-800 rounded">
                          <div className="text-white">{data.type}</div>
                          <div className="text-xs text-gray-400">
                            {data.size}MB • {data.value} credits • {data.sensitivity}
                          </div>
                          {data.encrypted && (
                            <div className="text-yellow-400 text-xs">Encrypted</div>
                          )}
                        </div>
                      ))}
                      {selectedNode.data.length > 3 && (
                        <div className="text-xs text-gray-400">
                          +{selectedNode.data.length - 3} more files
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 