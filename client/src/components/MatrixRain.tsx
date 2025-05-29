import { useEffect, useRef } from 'react';

export function MatrixRain() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    
    // Clear existing chars
    container.innerHTML = '';
    
    // Create fewer characters to reduce performance impact and scrollbar issues
    for (let i = 0; i < 30; i++) {
      const char = document.createElement('div');
      char.className = 'absolute text-green-500 font-mono text-sm animate-pulse pointer-events-none';
      char.textContent = chars[Math.floor(Math.random() * chars.length)];
      
      // Ensure characters stay within viewport bounds
      const leftPosition = Math.random() * 95; // Keep within 95% to avoid edge overflow
      char.style.left = leftPosition + '%';
      char.style.top = '-20px'; // Start above viewport
      char.style.animationDelay = Math.random() * 20 + 's';
      char.style.animationDuration = (Math.random() * 10 + 10) + 's';
      char.style.willChange = 'transform';
      char.style.backfaceVisibility = 'hidden';
      char.style.contain = 'layout style paint';
      char.style.maxWidth = '20px';
      char.style.maxHeight = '20px';
      char.style.overflow = 'hidden';
      
      // Add falling animation with proper constraints
      char.style.animation = `matrix-fall ${Math.random() * 10 + 10}s linear infinite`;
      
      container.appendChild(char);
    }

    // Add CSS animation if it doesn't exist
    if (!document.getElementById('matrix-rain-styles')) {
      const style = document.createElement('style');
      style.id = 'matrix-rain-styles';
      style.textContent = `
        @keyframes matrix-fall {
          0% { 
            transform: translateY(-100vh); 
            opacity: 1; 
          }
          100% { 
            transform: translateY(calc(100vh + 50px)); 
            opacity: 0; 
          }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      // Clean up on unmount
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="matrix-rain-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.1,
        contain: 'layout style paint'
      }}
    />
  );
}
