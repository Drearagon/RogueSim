import React, { useEffect, useRef, useState } from 'react';

interface NetworkNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  type: 'server' | 'client' | 'router' | 'firewall';
  connections: string[];
  activity: number;
  pulsePhase: number;
}

interface NetworkPacket {
  id: string;
  startNodeId: string;
  endNodeId: string;
  progress: number;
  speed: number;
  color: string;
  size: number;
  type: 'data' | 'attack' | 'defense' | 'scan';
}

interface NetworkVisualizerProps {
  isActive?: boolean;
  intensity?: 'low' | 'medium' | 'high';
  theme?: 'green' | 'blue' | 'red' | 'purple';
  className?: string;
}

const NetworkVisualizer: React.FC<NetworkVisualizerProps> = ({
  isActive = true,
  intensity = 'medium',
  theme = 'green',
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const nodesRef = useRef<NetworkNode[]>([]);
  const packetsRef = useRef<NetworkPacket[]>([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Color schemes based on theme
  const colorSchemes = {
    green: {
      primary: '#00ff41',
      secondary: '#00cc33',
      accent: '#66ff66',
      background: 'rgba(0, 20, 10, 0.1)',
      nodes: {
        server: '#00ff41',
        client: '#66ff66',
        router: '#00cc88',
        firewall: '#ff6600'
      },
      packets: {
        data: '#00ff41',
        attack: '#ff3333',
        defense: '#3366ff',
        scan: '#ffff00'
      }
    },
    blue: {
      primary: '#0099ff',
      secondary: '#0066cc',
      accent: '#66ccff',
      background: 'rgba(0, 10, 20, 0.1)',
      nodes: {
        server: '#0099ff',
        client: '#66ccff',
        router: '#0066cc',
        firewall: '#ff6600'
      },
      packets: {
        data: '#0099ff',
        attack: '#ff3333',
        defense: '#33ff66',
        scan: '#ffff00'
      }
    },
    red: {
      primary: '#ff3333',
      secondary: '#cc0000',
      accent: '#ff6666',
      background: 'rgba(20, 0, 0, 0.1)',
      nodes: {
        server: '#ff3333',
        client: '#ff6666',
        router: '#cc3333',
        firewall: '#ff6600'
      },
      packets: {
        data: '#ff3333',
        attack: '#ff0000',
        defense: '#33ff66',
        scan: '#ffff00'
      }
    },
    purple: {
      primary: '#9933ff',
      secondary: '#6600cc',
      accent: '#cc66ff',
      background: 'rgba(15, 0, 20, 0.1)',
      nodes: {
        server: '#9933ff',
        client: '#cc66ff',
        router: '#6600cc',
        firewall: '#ff6600'
      },
      packets: {
        data: '#9933ff',
        attack: '#ff3333',
        defense: '#33ff66',
        scan: '#ffff00'
      }
    }
  };

  const colors = colorSchemes[theme];

  // Initialize network nodes
  const initializeNodes = (width: number, height: number) => {
    const nodeCount = intensity === 'low' ? 8 : intensity === 'medium' ? 12 : 16;
    const nodes: NetworkNode[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const nodeType = Math.random() < 0.3 ? 'server' : 
                      Math.random() < 0.6 ? 'client' : 
                      Math.random() < 0.8 ? 'router' : 'firewall';
      
      const node: NetworkNode = {
        id: `node-${i}`,
        x: Math.random() * (width - 100) + 50,
        y: Math.random() * (height - 100) + 50,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: nodeType === 'server' ? 8 : nodeType === 'firewall' ? 10 : 6,
        color: colors.nodes[nodeType],
        type: nodeType,
        connections: [],
        activity: 0,
        pulsePhase: Math.random() * Math.PI * 2
      };

      nodes.push(node);
    }

    // Create connections between nodes
    nodes.forEach(node => {
      const connectionCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < connectionCount; i++) {
        const targetNode = nodes[Math.floor(Math.random() * nodes.length)];
        if (targetNode.id !== node.id && !node.connections.includes(targetNode.id)) {
          node.connections.push(targetNode.id);
        }
      }
    });

    nodesRef.current = nodes;
  };

  // Generate network packets
  const generatePacket = () => {
    const nodes = nodesRef.current;
    if (nodes.length < 2) return;

    const startNode = nodes[Math.floor(Math.random() * nodes.length)];
    const possibleTargets = startNode.connections.length > 0 
      ? startNode.connections 
      : [nodes[Math.floor(Math.random() * nodes.length)].id];
    
    const endNodeId = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
    
    const packetTypes: Array<'data' | 'attack' | 'defense' | 'scan'> = ['data', 'attack', 'defense', 'scan'];
    const packetType = packetTypes[Math.floor(Math.random() * packetTypes.length)];

    const packet: NetworkPacket = {
      id: `packet-${Date.now()}-${Math.random()}`,
      startNodeId: startNode.id,
      endNodeId,
      progress: 0,
      speed: 0.01 + Math.random() * 0.02,
      color: colors.packets[packetType],
      size: packetType === 'attack' ? 4 : packetType === 'defense' ? 3 : 2,
      type: packetType
    };

    packetsRef.current.push(packet);
  };

  // Animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with fade effect
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const nodes = nodesRef.current;
    const packets = packetsRef.current;

    // Update and draw nodes
    nodes.forEach(node => {
      // Subtle movement
      node.x += node.vx;
      node.y += node.vy;

      // Bounce off edges
      if (node.x <= node.radius || node.x >= canvas.width - node.radius) {
        node.vx *= -1;
      }
      if (node.y <= node.radius || node.y >= canvas.height - node.radius) {
        node.vy *= -1;
      }

      // Keep in bounds
      node.x = Math.max(node.radius, Math.min(canvas.width - node.radius, node.x));
      node.y = Math.max(node.radius, Math.min(canvas.height - node.radius, node.y));

      // Update activity and pulse
      node.activity = Math.max(0, node.activity - 0.02);
      node.pulsePhase += 0.1;

      // Draw connections
      ctx.strokeStyle = `${colors.secondary}20`;
      ctx.lineWidth = 1;
      node.connections.forEach(connectionId => {
        const targetNode = nodes.find(n => n.id === connectionId);
        if (targetNode) {
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(targetNode.x, targetNode.y);
          ctx.stroke();
        }
      });

      // Draw node
      const pulseSize = 1 + Math.sin(node.pulsePhase) * 0.2 * node.activity;
      ctx.fillStyle = node.color;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * pulseSize, 0, Math.PI * 2);
      ctx.fill();

      // Draw node glow
      if (node.activity > 0.1) {
        ctx.globalAlpha = node.activity * 0.3;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * pulseSize * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    });

    // Update and draw packets
    packets.forEach((packet, index) => {
      const startNode = nodes.find(n => n.id === packet.startNodeId);
      const endNode = nodes.find(n => n.id === packet.endNodeId);

      if (!startNode || !endNode) {
        packets.splice(index, 1);
        return;
      }

      packet.progress += packet.speed;

      if (packet.progress >= 1) {
        // Packet reached destination
        endNode.activity = Math.min(1, endNode.activity + 0.5);
        packets.splice(index, 1);
        return;
      }

      // Calculate packet position
      const x = startNode.x + (endNode.x - startNode.x) * packet.progress;
      const y = startNode.y + (endNode.y - startNode.y) * packet.progress;

      // Draw packet trail
      if (packet.type === 'attack') {
        ctx.strokeStyle = `${packet.color}60`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(
          startNode.x + (endNode.x - startNode.x) * Math.max(0, packet.progress - 0.1),
          startNode.y + (endNode.y - startNode.y) * Math.max(0, packet.progress - 0.1)
        );
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      // Draw packet
      ctx.fillStyle = packet.color;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(x, y, packet.size, 0, Math.PI * 2);
      ctx.fill();

      // Packet glow
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(x, y, packet.size * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;
    });

    // Generate new packets
    const packetGenerationRate = intensity === 'low' ? 0.02 : intensity === 'medium' ? 0.05 : 0.08;
    if (Math.random() < packetGenerationRate) {
      generatePacket();
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const container = canvas.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize and start animation
  useEffect(() => {
    if (isActive) {
      initializeNodes(dimensions.width, dimensions.height);
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, dimensions, intensity, theme]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
        style={{ 
          filter: 'blur(0.5px)',
          opacity: 0.6
        }}
      />
    </div>
  );
};

export default NetworkVisualizer;