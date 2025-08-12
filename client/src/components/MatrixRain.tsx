import React, { useEffect, useRef, useState } from 'react';

interface MatrixColumn {
  x: number;
  y: number;
  speed: number;
  characters: string[];
  opacity: number[];
  lastUpdate: number;
  length: number;
}

interface MatrixRainProps {
  isActive?: boolean;
  intensity?: 'low' | 'medium' | 'high';
  theme?: 'green' | 'blue' | 'red' | 'purple';
  className?: string;
  characterSet?: 'matrix' | 'binary' | 'hex' | 'code';
}

const MatrixRain: React.FC<MatrixRainProps> = ({
  isActive = true,
  intensity = 'medium',
  theme = 'green',
  className = '',
  characterSet = 'matrix'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const columnsRef = useRef<MatrixColumn[]>([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Character sets
  const characterSets = {
    matrix: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ', 'サ', 'シ', 'ス', 'セ', 'ソ'],
    binary: ['0', '1'],
    hex: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'],
    code: ['{', '}', '[', ']', '(', ')', '<', '>', '/', '\\', '|', '-', '_', '=', '+', '*', '&', '%', '$', '#', '@', '!', '?', '.', ',', ';', ':']
  };

  // Color schemes
  const colorSchemes = {
    green: {
      primary: '#00ff41',
      secondary: '#00cc33',
      fade: '#003311'
    },
    blue: {
      primary: '#0099ff',
      secondary: '#0066cc',
      fade: '#001133'
    },
    red: {
      primary: '#ff3333',
      secondary: '#cc0000',
      fade: '#330000'
    },
    purple: {
      primary: '#9933ff',
      secondary: '#6600cc',
      fade: '#220033'
    }
  };

  const colors = colorSchemes[theme];
  const characters = characterSets[characterSet];

  // Initialize matrix columns
  const initializeColumns = (width: number, height: number) => {
    const fontSize = intensity === 'low' ? 16 : intensity === 'medium' ? 14 : 12;
    const columnWidth = fontSize;
    const columnCount = Math.floor(width / columnWidth);
    const maxLength = Math.floor(height / fontSize);

    const columns: MatrixColumn[] = [];

    for (let i = 0; i < columnCount; i++) {
      const column: MatrixColumn = {
        x: i * columnWidth,
        y: Math.random() * height - height,
        speed: 0.5 + Math.random() * (intensity === 'high' ? 3 : intensity === 'medium' ? 2 : 1),
        characters: [],
        opacity: [],
        lastUpdate: Date.now(),
        length: Math.floor(Math.random() * maxLength * 0.5) + 5
      };

      // Initialize characters for this column
      for (let j = 0; j < column.length; j++) {
        column.characters.push(characters[Math.floor(Math.random() * characters.length)]);
        column.opacity.push(Math.random());
      }

      columns.push(column);
    }

    columnsRef.current = columns;
  };

  // Get random character
  const getRandomCharacter = () => {
    return characters[Math.floor(Math.random() * characters.length)];
  };

  // Update and animate columns
  const updateColumns = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const fontSize = intensity === 'low' ? 16 : intensity === 'medium' ? 14 : 12;
    const now = Date.now();

    columnsRef.current.forEach(column => {
      // Move column down
      column.y += column.speed;

      // Reset column if it's off screen
      if (column.y > height + column.length * fontSize) {
        column.y = -column.length * fontSize - Math.random() * height;
        column.speed = 0.5 + Math.random() * (intensity === 'high' ? 3 : intensity === 'medium' ? 2 : 1);
      }

      // Randomly change characters
      if (now - column.lastUpdate > 100 + Math.random() * 200) {
        const changeIndex = Math.floor(Math.random() * column.characters.length);
        column.characters[changeIndex] = getRandomCharacter();
        column.lastUpdate = now;
      }

      // Draw the column
      ctx.font = `${fontSize}px 'Courier New', monospace`;
      ctx.textAlign = 'center';

      for (let i = 0; i < column.characters.length; i++) {
        const charY = column.y + i * fontSize;
        
        if (charY > -fontSize && charY < height + fontSize) {
          // Calculate opacity based on position in column
          const fadePosition = i / column.characters.length;
          let alpha = 1 - fadePosition * 0.8;
          
          // Leading character is brightest
          if (i === 0) {
            alpha = 1;
            ctx.fillStyle = colors.primary;
          } else if (i < 3) {
            alpha = 0.8 - (i - 1) * 0.2;
            ctx.fillStyle = colors.secondary;
          } else {
            alpha = Math.max(0.1, 0.6 - fadePosition * 0.5);
            ctx.fillStyle = colors.fade;
          }

          ctx.globalAlpha = alpha;
          ctx.fillText(column.characters[i], column.x + fontSize / 2, charY);
        }
      }
    });

    ctx.globalAlpha = 1;
  };

  // Animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with subtle fade
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    updateColumns(ctx, canvas.width, canvas.height);

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
      initializeColumns(dimensions.width, dimensions.height);
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, dimensions, intensity, theme, characterSet]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
        style={{ 
          opacity: 0.7
        }}
      />
    </div>
  );
};

export default MatrixRain;