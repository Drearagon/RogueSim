import React, { useEffect, useRef, useState } from 'react';

interface HexCell {
  x: number;
  y: number;
  activity: number;
  type: 'normal' | 'active' | 'alert' | 'secure';
  pulsePhase: number;
  lastUpdate: number;
}

interface HexGridProps {
  isActive?: boolean;
  intensity?: 'low' | 'medium' | 'high';
  theme?: 'green' | 'blue' | 'red' | 'purple';
  className?: string;
  animationType?: 'flowing' | 'pulsing' | 'scanning';
}

const HexGrid: React.FC<HexGridProps> = ({
  isActive = true,
  intensity = 'medium',
  theme = 'green',
  className = '',
  animationType = 'flowing'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const cellsRef = useRef<HexCell[]>([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Color schemes
  const colorSchemes = {
    green: {
      primary: '#00ff41',
      secondary: '#00cc33',
      accent: '#66ff66',
      background: 'rgba(0, 255, 65, 0.02)',
      active: '#00ff41',
      alert: '#ff3333',
      secure: '#3366ff'
    },
    blue: {
      primary: '#0099ff',
      secondary: '#0066cc',
      accent: '#66ccff',
      background: 'rgba(0, 153, 255, 0.02)',
      active: '#0099ff',
      alert: '#ff3333',
      secure: '#33ff66'
    },
    red: {
      primary: '#ff3333',
      secondary: '#cc0000',
      accent: '#ff6666',
      background: 'rgba(255, 51, 51, 0.02)',
      active: '#ff3333',
      alert: '#ff0000',
      secure: '#33ff66'
    },
    purple: {
      primary: '#9933ff',
      secondary: '#6600cc',
      accent: '#cc66ff',
      background: 'rgba(153, 51, 255, 0.02)',
      active: '#9933ff',
      alert: '#ff3333',
      secure: '#33ff66'
    }
  };

  const colors = colorSchemes[theme];

  // Calculate hex grid
  const calculateHexGrid = (width: number, height: number) => {
    const hexSize = intensity === 'low' ? 40 : intensity === 'medium' ? 30 : 20;
    const hexWidth = hexSize * 2;
    const hexHeight = Math.sqrt(3) * hexSize;
    
    const cols = Math.ceil(width / (hexWidth * 0.75)) + 2;
    const rows = Math.ceil(height / hexHeight) + 2;
    
    const cells: HexCell[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * hexWidth * 0.75;
        const y = row * hexHeight + (col % 2) * hexHeight * 0.5;
        
        cells.push({
          x,
          y,
          activity: 0,
          type: 'normal',
          pulsePhase: Math.random() * Math.PI * 2,
          lastUpdate: Date.now()
        });
      }
    }

    cellsRef.current = cells;
  };

  // Draw hexagon
  const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, fillStyle?: string, strokeStyle?: string) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const xPos = x + size * Math.cos(angle);
      const yPos = y + size * Math.sin(angle);
      
      if (i === 0) {
        ctx.moveTo(xPos, yPos);
      } else {
        ctx.lineTo(xPos, yPos);
      }
    }
    ctx.closePath();

    if (fillStyle) {
      ctx.fillStyle = fillStyle;
      ctx.fill();
    }

    if (strokeStyle) {
      ctx.strokeStyle = strokeStyle;
      ctx.stroke();
    }
  };

  // Update cell activities
  const updateCellActivities = () => {
    const cells = cellsRef.current;
    const now = Date.now();

    cells.forEach(cell => {
      cell.pulsePhase += 0.05;
      
      // Random activity bursts
      if (Math.random() < 0.001 * (intensity === 'high' ? 3 : intensity === 'medium' ? 2 : 1)) {
        cell.activity = Math.random();
        cell.type = Math.random() < 0.7 ? 'active' : Math.random() < 0.8 ? 'alert' : 'secure';
        cell.lastUpdate = now;
      }

      // Decay activity
      if (now - cell.lastUpdate > 100) {
        cell.activity *= 0.98;
        if (cell.activity < 0.1) {
          cell.type = 'normal';
        }
      }
    });

    // Create activity waves based on animation type
    if (animationType === 'flowing') {
      const waveTime = now * 0.001;
      cells.forEach(cell => {
        const waveActivity = Math.sin(cell.x * 0.01 + waveTime) * Math.cos(cell.y * 0.01 + waveTime * 0.7);
        if (waveActivity > 0.7) {
          cell.activity = Math.max(cell.activity, waveActivity * 0.3);
          cell.type = 'active';
        }
      });
    } else if (animationType === 'scanning') {
      const scanLine = (now * 0.1) % (dimensions.width + 100);
      cells.forEach(cell => {
        if (Math.abs(cell.x - scanLine) < 20) {
          cell.activity = Math.max(cell.activity, 0.8);
          cell.type = 'active';
        }
      });
    }
  };

  // Animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with slight fade
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    updateCellActivities();

    const cells = cellsRef.current;
    const hexSize = intensity === 'low' ? 20 : intensity === 'medium' ? 15 : 10;

    cells.forEach(cell => {
      if (cell.x > -50 && cell.x < canvas.width + 50 && cell.y > -50 && cell.y < canvas.height + 50) {
        let alpha = 0.1;
        let color = colors.primary;
        let strokeWidth = 0.5;

        if (cell.activity > 0.1) {
          alpha = 0.2 + cell.activity * 0.6;
          strokeWidth = 1 + cell.activity * 2;

          switch (cell.type) {
            case 'active':
              color = colors.active;
              break;
            case 'alert':
              color = colors.alert;
              break;
            case 'secure':
              color = colors.secure;
              break;
            default:
              color = colors.primary;
          }

          // Pulsing effect
          if (animationType === 'pulsing') {
            alpha *= 0.5 + 0.5 * Math.sin(cell.pulsePhase);
          }
        }

        ctx.globalAlpha = alpha;
        ctx.lineWidth = strokeWidth;

        // Draw hexagon outline
        drawHexagon(ctx, cell.x, cell.y, hexSize, undefined, `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);

        // Draw filled hexagon for high activity
        if (cell.activity > 0.5) {
          ctx.globalAlpha = alpha * 0.3;
          drawHexagon(ctx, cell.x, cell.y, hexSize * 0.8, `${color}${Math.floor(alpha * 128).toString(16).padStart(2, '0')}`);
        }
      }
    });

    ctx.globalAlpha = 1;
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
      calculateHexGrid(dimensions.width, dimensions.height);
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, dimensions, intensity, theme, animationType]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
        style={{ 
          opacity: 0.4
        }}
      />
    </div>
  );
};

export default HexGrid;